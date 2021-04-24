import Vue from 'vue'
import Vuex from 'vuex'

import book from './modules/book'
import store from './modules/store'

import bookStateGetters from './bookStateGetters'
import storeStateGetters from './storeStateGetters'

import bookActions from './bookActions'
import storeActions from './storeActions'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  modules: {
    // 包括了state 和 mutations
    book,
    store
  },
  actions: { ...bookActions, ...storeActions },
  getters: { ...bookStateGetters, ...storeStateGetters }
})
