const storeActions = {
  setFileName: ({ commit, state }, fileName) => {
    return commit('SET_FILE_NAME', fileName)
    // 用return则会返回一个Promis对象，方便后续操作
  },
  setHotSearchOffsetY: ({ commit, state }, offsetY) => {
    return commit('SET_HOT_SEARCH_OFFSETY', offsetY)
  },
  setFlapCardVisible: ({ commit, state }, visible) => {
    return commit('SET_FLAP_CARD_VISIBLE', visible)
  }
}

export default storeActions
