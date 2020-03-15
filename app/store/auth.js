export const state = () => ({
  status: '',
  username: ''
})

export const getters = {
  isLoggedIn: (state) => state.status === 'loggedIn'
}

export const mutations = {
  setUser(state, user) {
    state.status = 'loggedIn'
    state.username = user.displayName
  },
  logout(state) {
    state.status = 'loggedOut'
    state.username = ''
  }
}

export const actions = {
  gotUser({ commit }, user) {
    commit('setUser', user)
  },
  logout({ commit }) {
    commit('logout')
  }
}
