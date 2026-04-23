import request from '~/api/request';
import { areaList } from './areaData.js';

Page({
  data: {
    personInfo: {
      name: '',
      gender: 0,
      birth: '',
      address: [],
      introduction: '',
      photos: [],
    },
    genderOptions: [
      {
        label: '男',
        value: 0,
      },
      {
        label: '女',
        value: 1,
      },
      {
        label: '保密',
        value: 2,
      },
    ],
    birthVisible: false,
    birthStart: '1970-01-01',
    birthEnd: '2025-03-01',
    birthTime: 0,
    birthFilter: (type, options) => (type === 'year' ? options.sort((a, b) => b.value - a.value) : options),
    addressText: '',
    addressVisible: false,
    provinces: [],
    cities: [],

    gridConfig: {
      column: 3,
      width: 160,
      height: 160,
    },
  },

  onLoad() {
    this.initAreaData();
    this.getPersonalInfo();
  },

  getPersonalInfo() {
    // 优先使用微信登录的用户信息
    const userInfo = wx.getStorageSync('user_info');
    if (userInfo && (userInfo.nickName || userInfo.nickname)) {
      const personInfo = {
        name: userInfo.nickName || userInfo.nickname || '微信用户',
        gender: userInfo.gender || 0,
        birth: userInfo.birth || '',
        address: userInfo.address || [],
        introduction: userInfo.brief || userInfo.introduction || '',
        photos: userInfo.photos || [],
        image: userInfo.avatarUrl || userInfo.avatar || '',
        star: userInfo.star || '',
      };
      
      this.setData(
        {
          personInfo: personInfo,
        },
        () => {
          const { personInfo } = this.data;
          if (personInfo.address && personInfo.address.length >= 2) {
            this.setData({
              addressText: `${areaList.provinces[personInfo.address[0]]} ${areaList.cities[personInfo.address[1]]}`,
            });
          }
        },
      );
    } else {
      this.setData({
        personInfo: {
          name: '',
          gender: 0,
          birth: '',
          address: [],
          introduction: '',
          photos: [],
          image: '',
          star: '',
        },
      });
    }
  },

  getAreaOptions(data, filter) {
    const res = Object.keys(data).map((key) => ({ value: key, label: data[key] }));
    return typeof filter === 'function' ? res.filter(filter) : res;
  },

  getCities(provinceValue) {
    return this.getAreaOptions(
      areaList.cities,
      (city) => `${city.value}`.slice(0, 2) === `${provinceValue}`.slice(0, 2),
    );
  },

  initAreaData() {
    const provinces = this.getAreaOptions(areaList.provinces);
    const cities = this.getCities(provinces[0].value);
    this.setData({ provinces, cities });
  },

  onAreaPick(e) {
    const { column, index } = e.detail;
    const { provinces } = this.data;

    // 更改省份则更新城市列表
    if (column === 0) {
      const cities = this.getCities(provinces[index].value);
      this.setData({ cities });
    }
  },

  showPicker(e) {
    const { mode } = e.currentTarget.dataset;
    this.setData({
      [`${mode}Visible`]: true,
    });
    if (mode === 'address') {
      const cities = this.getCities(this.data.personInfo.address[0]);
      this.setData({ cities });
    }
  },

  hidePicker(e) {
    const { mode } = e.currentTarget.dataset;
    this.setData({
      [`${mode}Visible`]: false,
    });
  },

  onPickerChange(e) {
    const { value, label } = e.detail;
    const { mode } = e.currentTarget.dataset;

    this.setData({
      [`personInfo.${mode}`]: value,
    });
    if (mode === 'address') {
      this.setData({
        addressText: label.join(' '),
      });
    }
  },

  personInfoFieldChange(field, e) {
    const { value } = e.detail;
    this.setData({
      [`personInfo.${field}`]: value,
    });
  },

  onNameChange(e) {
    this.personInfoFieldChange('name', e);
  },

  onGenderChange(e) {
    this.personInfoFieldChange('gender', e);
  },

  onIntroductionChange(e) {
    this.personInfoFieldChange('introduction', e);
  },

  onPhotosRemove(e) {
    const { index } = e.detail;
    const { photos } = this.data.personInfo;

    photos.splice(index, 1);
    this.setData({
      'personInfo.photos': photos,
    });
  },

  onPhotosSuccess(e) {
    const { files } = e.detail;
    this.setData({
      'personInfo.photos': files,
    });
  },

  onPhotosDrop(e) {
    const { files } = e.detail;
    this.setData({
      'personInfo.photos': files,
    });
  },

  async onSaveInfo() {
    const { personInfo } = this.data;
    
    // 构造后端更新数据
    const updateData = {
      nickname: personInfo.name,
      gender: personInfo.gender,
      birth: personInfo.birth || null,
      brief: personInfo.introduction,
      star: personInfo.star || '',
    };

    // 处理地区
    if (personInfo.address && personInfo.address.length >= 2) {
      updateData.province = areaList.provinces[personInfo.address[0]] || '';
      updateData.city = areaList.cities[personInfo.address[1]] || '';
    }

    try {
      const res = await request('/api/user/profile', 'PUT', updateData);
      if (res.code === 200) {
        // 同时更新本地缓存
        const userInfo = wx.getStorageSync('user_info') || {};
        const updatedUserInfo = {
          ...userInfo,
          nickName: personInfo.name,
          nickname: personInfo.name,
          avatarUrl: personInfo.image || userInfo.avatarUrl || userInfo.avatar,
          avatar: personInfo.image || userInfo.avatarUrl || userInfo.avatar,
          gender: personInfo.gender,
          birth: personInfo.birth,
          address: personInfo.address,
          brief: personInfo.introduction,
          introduction: personInfo.introduction,
          photos: personInfo.photos,
          star: personInfo.star,
        };
        wx.setStorageSync('user_info', updatedUserInfo);

        wx.showToast({ title: '保存成功', icon: 'success', duration: 1500 });
        setTimeout(() => { wx.navigateBack(); }, 1500);
      } else {
        wx.showToast({ title: res.message || '保存失败', icon: 'none' });
      }
    } catch (err) {
      // 后端不可用时，仅保存本地
      const userInfo = wx.getStorageSync('user_info') || {};
      const updatedUserInfo = {
        ...userInfo,
        nickName: personInfo.name,
        nickname: personInfo.name,
        avatarUrl: personInfo.image || userInfo.avatarUrl || userInfo.avatar,
        avatar: personInfo.image || userInfo.avatarUrl || userInfo.avatar,
        gender: personInfo.gender,
        birth: personInfo.birth,
        address: personInfo.address,
        brief: personInfo.introduction,
        introduction: personInfo.introduction,
        photos: personInfo.photos,
        star: personInfo.star,
      };
      wx.setStorageSync('user_info', updatedUserInfo);
      wx.showToast({ title: '已保存到本地', icon: 'success', duration: 1500 });
      setTimeout(() => { wx.navigateBack(); }, 1500);
    }
  },
});
