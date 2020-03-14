import firebase, { auth } from '~/plugins/firebase'

export default function({ route, store, redirect }) {
  firebase
    .auth()
    .getRedirectResult()
    .then(async function(result) {
      if (result.user) {
        // console.log(result)
        store.dispatch('auth/gotUser', result.user)
      } else {
        const user = await auth()
        if (user) {
          // console.log(user)
          store.dispatch('auth/gotUser', user)
        }
      }
    })
}
