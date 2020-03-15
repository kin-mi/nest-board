<template>
  <div>
    <div class="container">
      <div>
        <h1 class="title">Nest Board</h1>
        <button v-if="!isLoggedIn" @click="$googleSignIn">login</button><br />
        <input v-if="isLoggedIn" v-model="inputAlbumTitle" /><br />
        <button v-if="isLoggedIn" @click="createAlbum">create</button><br />
        <button v-if="isLoggedIn" @click="fetchAlbumList">get</button><br />
        <br />
        <button v-if="isLoggedIn" @click="$googleSignOut">logout</button><br />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
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
    ...mapGetters('auth', ['isLoggedIn'])
  },
  methods: {
    createAlbum() {
      // https://medium.com/google-cloud/using-google-apis-with-firebase-auth-and-firebase-ui-on-the-web-46e6189cf571
      // 不完全
      this.$gapiInit().then(() => {
        this.$gapi.client.photoslibrary.albums
          .create({
            album: {
              title: this.inputAlbumTitle
            }
          })
          .then((response) => {
            // eslint-disable-next-line no-console
            console.log(response)
          })
      })
    },
    fetchAlbumList() {
      this.albumList = []
      const config = {
        pageSize: 50
      }
      this.$gapiInit().then(() => {
        const call = (config) => {
          this.$gapi.client.photoslibrary.albums
            .list(config)
            .then((response) => {
              // 0件の場合もある
              if (!response.result.albums) return
              response.result.albums.forEach((album) => {
                this.albumList.push(album)
              })
              config.pageToken = response.result.nextPageToken
              // 次ページがある場合は再帰する
              if (config.pageToken) call(config)
            })
        }
        call(config)
      })
    }
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
