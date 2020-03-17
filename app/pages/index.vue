<template>
  <div>
    <div class="container">
      <vue-loading
        v-if="!ready"
        :size="{ width: '100px', height: '100px' }"
        type="spiningDubbles"
        color="#F4B400"
        style="position: absolute;"
      />
      <div v-else>
        <h1 class="title">Nest Board</h1>
        <button v-if="!isLoggedIn" @click="$googleSignIn">login</button><br />
        <FreeDraw ref="draw" />
        <input v-if="isLoggedIn" v-model="inputAlbumTitle" /><br />
        <button v-if="isLoggedIn" @click="createAlbum">create</button><br />
        <button v-if="isLoggedIn" @click="fetchAlbumList">get</button><br />
        <button v-if="isLoggedIn" @click="getDrawData">image</button><br />

        <br />
        <button v-if="isLoggedIn" @click="$googleSignOut">logout</button><br />
        <img v-if="imageData" :src="imageData" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { VueLoading } from 'vue-loading-template'
import FreeDraw from '~/components/FreeDraw'
export default {
  components: {
    VueLoading,
    FreeDraw
  },
  data() {
    return {
      inputAlbumTitle: 'nest-board-1',
      albumList: [],
      imageData: ''
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
    ...mapGetters(['ready']),
    ...mapGetters('auth', ['isLoggedIn'])
  },
  methods: {
    async createAlbum() {
      // https://medium.com/google-cloud/using-google-apis-with-firebase-auth-and-firebase-ui-on-the-web-46e6189cf571
      // 不完全
      const ret = await this.$gapiInit().then(() => {
        this.$gapi.client.photoslibrary.albums
          .create({
            album: {
              title: this.inputAlbumTitle
            }
          })
          .then((response) => {
            return response
          })
      })
      return ret
    },
    async fetchAlbumList() {
      this.albumList = []
      const config = {
        pageSize: 50
      }
      await this.$gapiInit().then(async () => {
        const call = async (config) => {
          await this.$gapi.client.photoslibrary.albums
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
        await call(config)
      })
    },
    async getDrawData() {
      await this.fetchAlbumList()
      const album = this.albumList.find((e) => e.title === this.inputAlbumTitle)
      console.log(album)
      this.imageData = await this.$refs.draw.dataURL()
      if (album) {
        const auth = await this.$googleAuth()
        console.log(auth)
        const googleUser = auth.currentUser.get()
        const authResponse = googleUser.getAuthResponse(true)
        const credential = {
          idToken: authResponse.id_token,
          accessToken: authResponse.access_token
        }
        console.log(credential)
        const res = await this.$axios.post('/server/postPhoto', {
          params: {
            accessToken: credential.accessToken,
            photoURL: this.imageData
          }
        })
        const uploadToken = res.data
        const result = await this.$gapiInit().then(async () => {
          const ret = await this.$gapi.client.photoslibrary.mediaItems.batchCreate(
            {
              albumId: album.id,
              newMediaItems: [
                {
                  description: 'Created by Nest Board.',
                  simpleMediaItem: {
                    fileName: 'nest-board.png',
                    uploadToken
                  }
                }
              ]
            }
          )
          return ret
        })
        console.log(result)
        // const bin = atob(this.$refs.draw.dataURL().replace(/^.*,/, ''))
        // const buffer = new Uint8Array(bin.length)
        // for (let i = 0; i < bin.length; i++) {
        //   buffer[i] = bin.charCodeAt(i)
        // }
        // let file = null
        // try {
        //   file = new Blob([buffer.buffer], {
        //     type: 'image/png'
        //   })
        // } catch (e) {
        //   console.error('Can not convert base64.')
        // }
        // const createCORSRequest = (method, url) => {
        //   let xhr = new XMLHttpRequest()
        //   if ('withCredentials' in xhr) {
        //     // XHR for Chrome/Firefox/Opera/Safari.
        //     xhr.open(method, url, true)
        //   } else if (typeof XDomainRequest !== 'undefined') {
        //     // XDomainRequest for IE.
        //     // eslint-disable-next-line no-undef
        //     xhr = new XDomainRequest()
        //     xhr.open(method, url)
        //   } else {
        //     // CORS not supported.
        //     xhr = null
        //   }
        //   return xhr
        // }
        // const url = 'https://photoslibrary.googleapis.com/v1/uploads'
        // const xhr = createCORSRequest('POST', url)
        // xhr.setRequestHeader(
        //   'Authorization',
        //   `Bearer ${encodeURIComponent(credential.idToken)}`
        // )
        // xhr.setRequestHeader('Content-type', 'application/octet-stream')
        // xhr.setRequestHeader('X-Goog-Upload-Content-Type', 'image/png')
        // xhr.setRequestHeader('X-Goog-Upload-Protocol', 'raw')
        // xhr.send(file)
        // const form = new FormData()
        // form.append('file', file)

        // fetch('https://photoslibrary.googleapis.com/v1/uploads', {
        //   method: 'POST',
        //   headers: new Headers({
        //     Authorization: `Bearer ${encodeURIComponent(credential.idToken)}`,
        //     'Content-type': 'application/octet-stream',
        //     'X-Goog-Upload-Content-Type': 'image/png',
        //     'X-Goog-Upload-Protocol': 'raw'
        //   }),
        //   body: form
        // })
        //   .then((res) => {
        //     return res.json()
        //   })
        //   .then(function(val) {
        //     console.log(val)
        //   })
        // this.$gapi.client.setApiKey('')
        // this.$gapi.client
        //   .request({
        //     path: 'https://photoslibrary.googleapis.com/v1/uploads',
        //     method: 'POST',
        //     headers: {
        //       Authorization: `Bearer ${encodeURIComponent(credential.idToken)}`,
        //       'Content-type': 'application/octet-stream',
        //       'X-Goog-Upload-Content-Type': 'image/png',
        //       'X-Goog-Upload-Protocol': 'raw'
        //     },
        //     body: file
        //   })
        //   .then((response) => {
        //     console.log(response)
        //   })
      }
      // console.log(
      //   atob(this.$refs.draw.dataURL().replace(/data:image\/png;base64,/g, ''))
      // )
      // this.$gapiInit().then(() => {
      //   this.$gapi.client.photoslibrary.albums
      // })
      // console.log(
      //   this.$refs.draw.dataURL().replace(/data:image\/png;base64,/g, '')
      // )
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
