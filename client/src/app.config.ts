export default defineAppConfig({
  pages: [
    'pages/calendar/index',
    'pages/workout/index',
    'pages/detail/index',
    'pages/profile/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '健身记录',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    custom: true,
    color: '#999',
    selectedColor: '#4A90E2',
    backgroundColor: '#fff',
    list: [
      {
        pagePath: 'pages/calendar/index',
        text: '日历',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
      },
    ],
  },
})