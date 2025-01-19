const AsyncStorage = {
    async setItem(key, value) {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
    },
    async getItem(key) {
      if (typeof window !== 'undefined') {
        return window.localStorage.getItem(key);
      }
      return null;
    },
    async removeItem(key) {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    },
  };
  
  export default AsyncStorage;
  