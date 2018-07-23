interface Environment {
  production: boolean;
  igo: any;
}

export const environment: Environment = {
  production: true,
  igo: {
    language: {
      prefix: './locale/'
    }
  }
};
