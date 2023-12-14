module.exports = {
  title: `Steady and Slow`,
  description: `Steady and Slow history of growing`,
  language: `ko`, // `ko`, `en` => currently support versions for Korean and English
  siteUrl: `https://jjunyong.github.io`,
  ogImage: `/logo_square.jpg`, // Path to your in the 'static' folder
  comments: {
    utterances: {
      repo: `jjunyong/jjunyong.github.io`, // `zoomkoding/zoomkoding-gatsby-blog`,
    },
  },
  ga: 'G-Y2TNPV9C3Z', // Google Analytics Tracking ID
  author: {
    name: `Jplus`,
    bio: {
      role: `개발자`,
      description: ['Steady and Slow'], //'능동적으로 일하는', '이로운 것을 만드는'],
      thumbnail: 'logo_color.jpg', // Path to the image in the 'asset' folder
    },
    social: {
      github: `https://github.com/jjunyong`, // `https://github.com/zoomKoding`,
      linkedIn: ``,
      email: `sjm3bro@gmail.com`, // `zoomkoding@gmail.com`,
    },
  },

  // metadata for About Page
  about: {
    timestamps: [
      // =====       [Timestamp Sample and Structure]      =====
      // ===== 🚫 Don't erase this sample (여기 지우지 마세요!) =====
      {
        date: '',
        activity: '',
        links: {
          github: '',
          post: '',
          googlePlay: '',
          appStore: '',
          demo: '',
        },
      },
      // ========================================================
      // ========================================================
      // {
      //   date: '2021.02 ~',
      //   activity: '개인 블로그 개발 및 운영',
      //   links: {
      //     post: '/gatsby-starter-zoomkoding-introduction',
      //     github: 'https://github.com/zoomkoding/zoomkoding-gatsby-blog',
      //     demo: 'https://www.zoomkoding.com',
      //   },
      // },
      {
        date: '2019~2021',
        activity: '현대차 대고객 온라인 플랫폼 구축 및 운영',
        links: {
        },
      },
      {
        date: '2022~현재',
        activity: '기아 온라인 판매 플랫폼(kia.com) 개발 및 운영',
        links: {
          demo: 'https://kia.com/kr'
        },
      },
      {
        date: '2022~현재',
        activity: '온유(Onyou) 앱 개발 및 운영',
        links: {
          post: '/onyou-restropect',
          googlePlay: 'https://play.google.com/store/apps/details?id=com.onyoufrontend&pcampaignid=web_share',
          appStore: ''
        },
      },
      {
        date: '2023~현재',
        activity: 'Bringit 앱 개발',
        links: {
          googlePlay: '',
          appStore: ''
        },
      }
      
    ],

    projects: [
      // =====        [Project Sample and Structure]        =====
      // ===== 🚫 Don't erase this sample (여기 지우지 마세요!)  =====
      {
        title: '',
        description: '',
        techStack: ['', ''],
        thumbnailUrl: '',
        links: {
          post: '',
          github: '',
          googlePlay: '',
          appStore: '',
          demo: '',
        },
      },
      // ========================================================
      // ========================================================
      {
        title: '온유(Onyou) 앱 개발 및 운영',
        description:
          'SNS 기반의 공동체 소모임 어플리케이션',
        techStack: ['ReactNative', 'Spring boot', 'K8S'],
        thumbnailUrl: 'onyou.png',
        links: {
          post: '/onyou-restropect',
          googlePlay: 'https://play.google.com/store/apps/details?id=com.onyoufrontend&pcampaignid=web_share'
        },
      },
    ],
  },
};
