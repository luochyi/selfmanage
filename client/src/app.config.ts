export default defineAppConfig({
  pages: [
    'pages/calendar/index',
    'pages/workout/index',
    'pages/detail/index',
    'pages/profile/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#4A90E2',
    navigationBarTitleText: '健身记录',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    color: '#999',
    selectedColor: '#4A90E2',
    backgroundColor: '#fff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/calendar/index',
        text: '日历',
        iconPath: 'assets/tab-calendar.png',
        selectedIconPath: 'assets/tab-calendar-active.png',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/tab-profile.png',
        selectedIconPath: 'assets/tab-profile-active.png',
      },
    ],
  },
})