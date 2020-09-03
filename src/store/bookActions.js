const bookActions = {
  setFileName: ({ commit, state }, fileName) => {
    return commit('SET_FILE_NAME', fileName)
    // 用return则会返回一个Promis对象，方便后续操作
  },
  setMenuVisible: ({ commit, state }, menuVisible) => {
    return commit('SET_MENU_VISIBLE', menuVisible)
  },
  setSettingVisible: ({ commit, state }, settingVisible) => {
    return commit('SET_SETTING_VISIBLE', settingVisible)
  },
  setDefaultFontSize: ({ commit, state }, defaultFontSize) => {
    return commit('SET_DEFAULT_FONT_SIZE', defaultFontSize)
  }
}
export default bookActions
