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
          url: 'https://geoegl.msp.gouv.qc.ca/igo2/api/ws/igo_gouvouvert.fcgi'
        }
      ]
    },
    searchSources: {
      nominatim: {
        enabled: true
      },
      icherche: {
        searchUrl: 'https://geoegl.msp.gouv.qc.ca/icherche/geocode',
        locateUrl: 'https://geoegl.msp.gouv.qc.ca/icherche/xy',
        enabled: false
      },
      datasource: {
        searchUrl: 'https://geoegl.msp.gouv.qc.ca/igo2/api/layers/search'
      }
    }
  }
};
