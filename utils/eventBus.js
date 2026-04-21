export default function createBus() {
  return {
    events: {},
    on(event, callback) {
      if (!this.events[event]) this.events[event] = [];
      this.events[event].push(callback);
    },
    once(event, callback) {
      // 创建一个只执行一次的包装函数
      const onceWrapper = (...args) => {
        callback(...args);
        // 执行后立即移除
        this.off(event, onceWrapper);
      };
      this.on(event, onceWrapper);
    },
    off(event, callback) {
      if (!this.events[event]) return;
      if (!callback) this.events[event] = [];
      else {
        const index = this.events[event].indexOf(callback);
        if (index !== -1) this.events[event].splice(index, 1);
      }
    },
    emit(event, ...args) {
      if (this.events[event]) {
        // 创建副本以避免在执行过程中修改数组导致的问题
        const callbacks = [...this.events[event]];
        callbacks.forEach((callback) => callback(...args));
      }
    },
  };
}
