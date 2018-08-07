interface Environment {
  production: boolean;
  igo: any;
}

export const environment: Environment = {
  production: true,
  igo: {
    auth: {
      intern: {
        enabled: true
      }
    },
    language: {
      prefix: './locale/'
    },
    catalog: {
      sources: [
        {
          title: 'Gouvouvert',
          url: '/ws/igo_gouvouvert.fcgi'
        }
      ]
    },
    searchSources: {
      nominatim: {
        enabled: false
      },
      icherche: {
        url: '/icherche/geocode'
      },
      datasource: {
        url: '/igo2/api/layers/search'
      }
    }
  }
};
