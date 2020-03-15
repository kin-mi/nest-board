import firebase, { authConfig } from '~/plugins/firebase'

export default async ({ $axios }, inject) => {
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
  const googleAuth = await auth()
  console.log(googleAuth.isSignedIn.get())
  if (googleAuth.isSignedIn.get()) {
    const googleUser = googleAuth.currentUser.get()
    const profile = googleUser.getBasicProfile()
    console.log('gapi: user signed in!', {
      name: profile.getName(),
      imageURL: profile.getImageUrl(),
      email: profile.getEmail()
    })
    const authResponse = googleUser.getAuthResponse(true)
    const credential = firebase.auth.GoogleAuthProvider.credential(
      authResponse.id_token,
      authResponse.access_token
    )
    firebase
      .auth()
      .signInWithCredential(credential)
      .then(({ user }) => {
        console.log('firebase: user signed in!', {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        })
      })
  } else {
    console.log('gapi: user is not signed in')
  }
  inject('gapi', gapi)
  inject('gapiInit', init)
  inject('googleAuth', auth)
  inject('googleSignIn', signIn)
}
