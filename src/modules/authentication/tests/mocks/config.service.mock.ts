export const mockedConfigService = {
  get(key: string) {
    switch (key) {
      case 'JWT_EXPIRATION_TIME':
        return '3600';
      case 'JWT_SECRET':
        return 'TESTING_SECRET_IS_NOT_SECURE';
    }
  },
};
