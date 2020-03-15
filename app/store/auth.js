import firebase from '~/plugins/firebase'

export const state = () => ({
  status: '',
  username: '',
  id: '',
  accessToken: '',
  refreshToken: ''
})

export const getters = {
  isLoggedIn: (state) => state.status === 'loggedIn',
  id: (state) => state.id || '',
  accessToken: (state) => state.accessToken || ''
}

export const mutations = {
  setUser(state, user) {
    state.status = 'loggedIn'
    state.username = user.displayName
    state.id = user.email
    state.accessToken = user.accessToken
    state.refreshToken = user.refreshToken
  },
  logout(state) {
    state.status = 'loggedOut'
    state.username = ''
  }
}

export const actions = {
  async gotUser({ commit }, user) {
    user.accessToken = await user.getIdToken().then((token) => token)
    commit('setUser', user)
  },
  async login() {
    const googleAuth = await this.$googleAuth()
    console.log({ googleAuth })
    this.$googleSignIn()
  },
  logout({ commit }) {
    firebase
      .auth()
      .signOut()
      .then(() => {
        commit('logout')
      })
  }
}
