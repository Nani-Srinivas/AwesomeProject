import * as Keychain from 'react-native-keychain';

const AUTH_TOKEN_KEY = 'authToken';

export const secureStorageService = {
  saveAuthToken: async (token: string): Promise<void> => {
    await Keychain.setGenericPassword(AUTH_TOKEN_KEY, token, { service: AUTH_TOKEN_KEY });
  },

  getAuthToken: async (): Promise<string | null> => {
    const credentials = await Keychain.getGenericPassword({ service: AUTH_TOKEN_KEY });
    return credentials ? credentials.password : null;
  },

  clearAuthToken: async (): Promise<void> => {
    await Keychain.resetGenericPassword({ service: AUTH_TOKEN_KEY });
  },
};
