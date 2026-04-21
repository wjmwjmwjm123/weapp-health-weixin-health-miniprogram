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
    if (userInfo && (userInfo.nickName || userInfo.nickname || userInfo.avatarUrl || userInfo.avatar)) {
      // 使用微信登录的用户信息
      const personInfo = {
        name: userInfo.nickName || userInfo.nickname || '微信用户',
        gender: userInfo.gender || 0,
        birth: userInfo.birth || '',
        address: userInfo.address || [],
        introduction: userInfo.introduction || '',
        photos: userInfo.photos || [],
        image: userInfo.avatarUrl || userInfo.avatar || '',
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
      // 如果没有微信登录信息，使用空数据
              this.setData({
        personInfo: {
          name: '',
          gender: 0,
          birth: '',
          address: [],
          introduction: '',
          photos: [],
          image: '',
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

  onSaveInfo() {
    const { personInfo } = this.data;
    
    // 保存用户信息到本地存储
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
      introduction: personInfo.introduction,
      photos: personInfo.photos,
    };
    
    wx.setStorageSync('user_info', updatedUserInfo);
    
    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 1500,
    });
    
    // 延迟返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },
});
