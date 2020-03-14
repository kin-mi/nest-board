<template>
  <div>
    <div class="container">
      <div>
        <h1 class="title">Nest Board</h1>
        <button v-if="!accessToken" @click="login">login</button><br />
        <input v-if="accessToken && gapi" v-model="inputAlbumTitle" /><br />
        <button v-if="accessToken && gapi" @click="create">create</button><br />
        <button v-if="accessToken && gapi" @click="fetchList">get</button><br />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { authConfig } from '~/plugins/firebase'
export default {
  data() {
    return {
      gapi: null,
      inputAlbumTitle: 'nest-board-1',
      albumList: []
    }
  },
  head() {
    return {
      // head内でcallbackを使う
      // https://vueschool.io/articles/vuejs-tutorials/how-to-load-third-party-scripts-in-nuxt-js/
      script: [
        {
          src: 'https://apis.google.com/js/api.js',
          type: 'text/javascript',
          callback: () => {
            this.gapi = window.gapi
            this.gapiClientLoad()
          }
        }
      ]
    }
  },
  computed: {
    ...mapGetters('auth', ['id', 'accessToken'])
  },
  watch: {
    accessToken(newVal, oldVal) {
      if (!oldVal) this.gapiClientLoad()
    }
  },
  methods: {
    gapiClientLoad() {
      if (this.gapi) this.gapi.load('client:auth2')
    },
    gapiInit() {
      return this.gapi.client.init({
        apiKey: authConfig.Google.apiKey,
        clientId: authConfig.Google.clientId,
        discoveryDocs: authConfig.Google.discoveryDocs,
        scope: authConfig.Google.scopes.join(' ')
      })
    },
    create() {
      // https://medium.com/google-cloud/using-google-apis-with-firebase-auth-and-firebase-ui-on-the-web-46e6189cf571
      // 不完全
      const self = this
      this.gapiInit().then(() => {
        self.gapi.client.photoslibrary.albums
          .create({
            album: {
              title: this.inputAlbumTitle
            }
          })
          .then((response) => {
            // console.log(response)
          })
      })
    },
    fetchList() {
      this.albumList = []
      const config = {
        pageSize: 50
      }
      const self = this
      this.gapiInit().then(function() {
        const call = (config) =>
          self.gapi.client.photoslibrary.albums
            .list(config)
            .then((response) => {
              // 0件の場合もある
              if (!response.result.albums) return
              response.result.albums.forEach((album) => {
                self.albumList.push(album)
              })
              config.pageToken = response.result.nextPageToken
              if (config.pageToken) call(config)
            })
        call(config)
      })
    },
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
