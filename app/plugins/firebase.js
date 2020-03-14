import firebase from 'firebase/app'
import 'firebase/auth'

if (!firebase.apps.length) {
  console.log(process.env.APIKEY)
  firebase.initializeApp({
    apiKey: process.env.APIKEY,
    authDomain: process.env.AUTHDOMAIN,
    databaseURL: process.env.DATABASEURL,
    projectId: process.env.PROJECTID,
    storageBucket: process.env.STORAGEBUCKET,
    messagingSenderId: process.env.MESSAGINGSENDERID,
    appId: process.env.APPID,
    measurementId: process.env.MEASUREMENTID
  })
}
export const authConfig = {
  Google: {
    id: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    scopes: [
      'email',
      'profile',
      // 'https://www.googleapis.com/auth/photoslibrary'
      'https://www.googleapis.com/auth/photoslibrary.appendonly',
      'https://www.googleapis.com/auth/photoslibrary.readonly.appcreateddata'
    ],
    apiKey: process.env.APIKEY,
    clientId: process.env.GOOGLEOAUTHCLIENTID,
    discoveryDocs: [
      'https://content.googleapis.com/discovery/v1/apis/photoslibrary/v1/rest'
    ]
  }
}
export const authProvider = () => {
  const provider = new firebase.auth.GoogleAuthProvider()
  authConfig.Google.scopes.forEach((scope) => {
    provider.addScope(scope)
  })
  return provider
}
export const auth = function() {
  return new Promise((resolve, reject) => {
    firebase.auth().onAuthStateChanged((user) => {
      resolve(user || false)
    })
  })
}
export default firebase
