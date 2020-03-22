import firebase, { authConfig } from '~/plugins/firebase'

export default ({ store }, inject) => {
  const clientLoad = (gapi) => {
    return new Promise((resolve, reject) => {
      gapi.load('client:auth2', () => {
        resolve()
      })
    })
  }
  const init = (gapi) => {
    return clientLoad(gapi).then(() => {
      return gapi.client.init({
        apiKey: authConfig.Google.apiKey,
        clientId: authConfig.Google.clientId,
        discoveryDocs: authConfig.Google.discoveryDocs,
        scope: authConfig.Google.scopes.join(' ')
      })
    })
  }
  const auth = (gapi) => {
    const auth = init(gapi).then(() => gapi.auth2.getAuthInstance())
    return auth
  }
  const signIn = (gapi) => {
    const signIn = auth(gapi).then((auth) =>
      auth.signIn({
        ux_mode: 'redirect',
        prompt: 'select_account',
        scope: authConfig.Google.scopes.join(' ')
      })
    )
    return signIn
  }
  const signOut = (gapi) => {
    const signIn = auth(gapi).then((auth) =>
      auth.signOut().then(() => {
        firebase.auth().signOut()
        store.commit('auth/logout')
        store.commit('isReady', true)
      })
    )
    return signIn
  }
  const currentUser = async (gapi) => {
    // ログイン済みの場合、Firebaseにもログインする
    const googleAuth = await auth(gapi)
    if (googleAuth.isSignedIn.get()) {
      const googleUser = googleAuth.currentUser.get()
      const authResponse = googleUser.getAuthResponse(true)
      const credential = firebase.auth.GoogleAuthProvider.credential(
        authResponse.id_token,
        authResponse.access_token
      )
      firebase
        .auth()
        .signInWithCredential(credential)
        .then(({ user }) => {
          store.dispatch('auth/gotUser', user)
          store.commit('isReady', true)
        })
    } else {
      store.commit('isReady', true)
    }
  }

  inject('gapiInit', init)
  inject('googleAuth', auth)
  inject('googleSignIn', signIn)
  inject('googleSignOut', signOut)
  inject('googleCurrentUser', currentUser)
}
