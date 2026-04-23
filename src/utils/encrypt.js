import CryptoJS from 'react-native-crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';

export const EncryptedDataStore = {
    
  deviceId: '',

  initializeDeviceId: async function () {
    if (!this.deviceId) {
      this.deviceId = await DeviceInfo.getUniqueId();
    }
  },

  set: async function (key, value) {
    const encryptedValue = await this.encryptData(value);
    await AsyncStorage.setItem(key, encryptedValue);
  },

  get: async function (key) {
    const encryptedValue = await AsyncStorage.getItem(key);
    return encryptedValue !== null
      ? await this.decryptData(encryptedValue)
      : null;
  },

  encryptData: async function (value) {
    await this.initializeDeviceId();
    return await CryptoJS.AES.encrypt(value, this.deviceId).toString();
  },

  decryptData: function (ciphertext) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, this.deviceId);
    return bytes.toString(CryptoJS.enc.Utf8);
  },
};
EncryptedDataStore.initializeDeviceId();