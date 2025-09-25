// import { MMKV } from 'react-native-mmkv';

// export const storage = new MMKV();

// export const storageService = {
//   setItem: (key: string, value: any) => {
//     storage.set(key, JSON.stringify(value));
//   },
//   getItem: (key: string) => {
//     const value = storage.getString(key);
//     return value ? JSON.parse(value) : null;
//   },
//   removeItem: (key: string) => {
//     storage.delete(key);
//   },
// };

// services/storageService.ts
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

export const storageService = {
  setItem: (key: string, value: any) => storage.set(key, JSON.stringify(value)),
  getItem: (key: string) => {
    const value = storage.getString(key);
    return value ? JSON.parse(value) : null;
  },
  removeItem: (key: string) => storage.delete(key),
};
