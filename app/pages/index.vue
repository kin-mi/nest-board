<template>
  <div>
    <div class="container">
      <div>
        <h1 class="title">Nest Board</h1>
        <button v-if="!accessToken" @click="login">login</button><br />
        <input v-if="accessToken" v-model="inputAlbumTitle" /><br />
        <button v-if="accessToken" @click="create">create</button><br />
        <!-- <button v-if="accessToken" @click="fetchList">get</button><br /> -->
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
// import firebase, { authConfig } from '~/plugins/firebase'
export default {
  data() {
    return {
      inputAlbumTitle: 'nest-board-1',
      albumList: []
    }
  },
  head() {
    return {
      // head内でcallbackを使う
      // https://vueschool.io/articles/vuejs-tutorials/how-to-load-third-party-scripts-in-nuxt-js/
      // script: [
      //   {
      //     src: 'https://apis.google.com/js/api.js',
      //     type: 'text/javascript',
      //     callback: () => {
      //       this.gapi = window.gapi
      //       this.gapiClientLoad()
      //     }
      //   }
      // ]
    }
  },
  computed: {
    ...mapGetters('auth', ['id', 'accessToken'])
  },
  mounted() {
    // this.$gapiInit.then(() => {
    //   console.log(this.$gapi.auth2.getAuthInstance())
    // })
    // const auth = await this.$googleAuth()
    this.$googleAuth().then((auth) => {
      console.log(auth.isSignedIn.get())
    })
  },
  methods: {
    create() {
      // https://medium.com/google-cloud/using-google-apis-with-firebase-auth-and-firebase-ui-on-the-web-46e6189cf571
      // 不完全
      this.$gapiInit().then(() => {
        console.log(this.$gapi)
        this.$gapi.client.photoslibrary.albums
          .create({
            album: {
              title: this.inputAlbumTitle
            }
          })
          .then((response) => {
            console.log(response)
          })
      })
      // const self = this
      // this.gapiInit().then((user) => {
      //   const googleUser = self.$gapi.auth2.getAuthInstance().currentUser.get()
      //   console.log({ googleUser })
      //   console.log(googleUser.getAuthResponse().id_token)
      //   // const token = await user.getIdToken().then((token) => token)
      //   console.log(user.credential.idToken)
      //   self.$gapi.client.photoslibrary.albums
      //     .create({
      //       album: {
      //         title: this.inputAlbumTitle
      //       }
      //     })
      //     .then((response) => {
      //       // console.log(response)
      //     })
      // })
    },
    // fetchList() {
    //   this.albumList = []
    //   const config = {
    //     pageSize: 50
    //   }
    //   const self = this
    //   this.gapiInit().then(function() {
    //     const call = (config) =>
    //       self.$gapi.client.photoslibrary.albums
    //         .list(config)
    //         .then((response) => {
    //           // 0件の場合もある
    //           if (!response.result.albums) return
    //           response.result.albums.forEach((album) => {
    //             self.albumList.push(album)
    //           })
    //           config.pageToken = response.result.nextPageToken
    //           if (config.pageToken) call(config)
    //         })
    //     call(config)
    //   })
    // },
    ...mapActions('auth', ['login'])
  }
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 30px;
  color: #35495e;
  letter-spacing: 1px;
}
</style>
