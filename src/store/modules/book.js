const book = {
  state: {
    fileName: '', // 图书文件名 History/2018_Book_CapitalPunishmentAndTheCrimina
    menuVisible: false, // 用于控制上下菜单栏是否显示的变量
    settingVisible: -1, // -1:不显示,0:字号,1:主题,2:进度条,3:目录
    defaultFontSize: 16
  },
  mutations: {
    SET_FILE_NAME: (state, fileName) => {
      state.fileName = fileName
    },
    SET_MENU_VISIBLE: (state, menuVisible) => {
      state.menuVisible = menuVisible
    },
    SET_SETTING_VISIBLE: (state, settingVisible) => {
      state.settingVisible = settingVisible
    },
    SET_DEFAULT_FONT_SIZE: (state, defaultFontSize) => {
      state.defaultFontSize = defaultFontSize
    }

  },
  actions: {
    // 以下内容已转移至BookActions.js，方便单独管理
    // setFileName: ({ commit, state }, fileName) => {
    //   return commit('SET_FILE_NAME', fileName)
    //   // 用return则会返回一个Promis对象，方便后续操作
    // },
    // setMenuVisible: ({ commit, state }, menuVisible) => {
    //   return commit('SET_MENU_VISIBLE', menuVisible)
    // },
    // setSettingVisible: ({ commit, state }, settingVisible) => {
    //   return commit('SET_SETTING_VISIBLE', settingVisible)
    // }
  }
}

export default book
