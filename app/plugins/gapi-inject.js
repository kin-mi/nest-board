import firebase, { authConfig } from '~/plugins/firebase'

export default async ({ $axios, store }, inject) => {
  const gapiScript = document.createElement('script')
  const src = await $axios.$get('https://apis.google.com/js/api.js')
  gapiScript.appendChild(document.createTextNode(src))
  document.head.appendChild(gapiScript)
  const gapi = window.gapi

  const clientLoad = new Promise((resolve, reject) => {
    gapi.load('client:auth2', () => {
      resolve()
    })
  })
  const init = () => {
    return clientLoad.then(() => {
      return gapi.client.init({
        apiKey: authConfig.Google.apiKey,
        clientId: authConfig.Google.clientId,
        discoveryDocs: authConfig.Google.discoveryDocs,
        scope: authConfig.Google.scopes.join(' ')
      })
    })
  }
  const auth = () => {
    const auth = init().then(() => gapi.auth2.getAuthInstance())
    return auth
  }
  const signIn = () => {
    const signIn = auth().then((auth) =>
      auth.signIn({
        ux_mode: 'redirect',
        scope: authConfig.Google.scopes.join(' ')
      })
    )
    return signIn
  }
  const signOut = () => {
    const signIn = auth().then((auth) =>
      auth.signOut().then(() => {
        firebase.auth().signOut()
        store.commit('auth/logout')
      })
    )
    return signIn
  }

  // ログイン済みの場合、Firebaseにもログインする
  const googleAuth = await auth()
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
      })
  }
  inject('gapi', gapi)
  inject('gapiInit', init)
  inject('googleAuth', auth)
  inject('googleSignIn', signIn)
  inject('googleSignOut', signOut)
}
