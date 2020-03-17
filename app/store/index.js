export const state = () => ({
  ready: false
})

export const getters = {
  ready: (state) => state.ready
}

export const mutations = {
  isReady(state, status) {
    state.ready = status
  }
}
