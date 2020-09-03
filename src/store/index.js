import Vue from 'vue'
import Vuex from 'vuex'
import book from './modules/book'
import bookStateGetters from './bookStateGetters'
import bookActions from './bookActions'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: bookActions,
  modules: {
    book
  },
  getters: bookStateGetters
})
