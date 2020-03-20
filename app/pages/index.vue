<template>
  <div>
    <div class="container mx-auto">
      <vue-loading
        v-if="!ready"
        :size="{ width: '100px', height: '100px' }"
        type="spiningDubbles"
        color="#F4B400"
        style="position: absolute;"
      />
      <div v-else>
        <h1 class="title">Nest Board</h1>
        <FreeDraw ref="draw" />
        <label
          class="block text-gray-700 text-sm font-bold mb-2 mt-5"
          for="album-title"
        >
          アルバム名
        </label>
        <input
          id="album-title"
          v-model="inputAlbumTitle"
          class="mx-auto bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-1 px-2 block w-75 appearance-none leading-normal"
        />
        <label
          class="block text-gray-700 text-sm font-bold mb-2 mt-2"
          for="image-title"
        >
          画像名
        </label>
        <input
          id="image-title"
          v-model="inputPhotoTitle"
          class="mx-auto bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-1 px-2 block w-75 appearance-none leading-normal"
        />
        <button
          @click="postPhoto"
          class="mx-auto mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
        >
          Google Photosへアップロードする
        </button>
        <div v-if="!isLoggedIn" class="text-xs mx-3 mt-2">
          <p>
            初回ログイン時は警告が出ます。
          </p>
          <p>
            左下の「<span class="font-bold">詳細</span>」を開いて「<span
              class="font-bold"
              >Nest Board（安全ではないページ）に移動</span
            >」をクリックした後、
          </p>
          <p>権限の許可をしてください。</p>
          <p class="mt-2">
            当サイトから無断でGoogle Photosへアクセスすることは<span
              class="font-bold"
              >出来ません</span
            >。
          </p>
        </div>
        <br />
        <button
          v-if="isLoggedIn"
          @click="$googleSignOut(gapi)"
          class="mx-auto mt-6 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded shadow"
        >
          ログアウト
        </button>
      </div>
    </div>
    <processing-modal
      v-if="isProcessing"
      :contentProgress="contentProgress"
      :processState="processState"
      @close="handleModalClose"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { VueLoading } from 'vue-loading-template'
import FreeDraw from '~/components/FreeDraw'
import ProcessingModal from '~/components/ProcessingModal'
const DURING_PROCESSING = {
  key: 'nest-board-state',
  value: 'during'
}
const DURING_PROCESSING_TITLE = 'nest-board-state-title'
const PROCCESS_STATE = {
  success: 'success',
  failed: 'failed'
}
export default {
  components: {
    VueLoading,
    FreeDraw,
    ProcessingModal
  },
  data() {
    return {
      gapi: null,
      inputAlbumTitle: 'Nest Board',
      inputPhotoTitle: 'nest-board.png',
      albumList: [],
      imageData: '',
      isProcessing: false,
      processState: '',
      contentProgress: 0
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
            this.$gapiInit(window.gapi)
            this.gapi = window.gapi
          }
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['ready']),
    ...mapGetters('auth', ['isLoggedIn'])
  },
  watch: {
    gapi(newVal, oldVal) {
      if (newVal) {
        this.$googleCurrentUser(this.gapi)
      }
    },
    ready(newVal, oldVal) {
      if (newVal) {
        // 処理中の場合、送信処理を続行する
        const during = localStorage.getItem(DURING_PROCESSING.key)
        if (during === DURING_PROCESSING.value && this.isLoggedIn) {
          const titles = JSON.parse(
            localStorage.getItem(DURING_PROCESSING_TITLE)
          )
          this.inputAlbumTitle = titles.album
          this.inputPhotoTitle = titles.photo
          localStorage.removeItem(DURING_PROCESSING.key)
          localStorage.removeItem(DURING_PROCESSING_TITLE)
          this.postPhoto()
        }
      }
    }
  },
  destroyed() {
    localStorage.removeItem(DURING_PROCESSING.key)
    localStorage.removeItem(DURING_PROCESSING_TITLE)
  },
  methods: {
    /**
     * 描画情報をローカルに保存してログイン処理
     */
    saveAndLogin() {
      if (!this.isLoggedIn) {
        // 描画情報をlocal storageへ保存
        this.$refs.draw.save()
        // google sign in
        this.$googleSignIn(this.gapi)
      }
    },
    /**
     * アルバムの作成
     * @return {Object} Album
     */
    async createAlbum() {
      const ret = await this.$gapiInit(this.gapi).then(() => {
        // Doc: https://developers.google.com/photos/library/reference/rest/v1/albums/create
        return this.gapi.client.photoslibrary.albums
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
    /**
     * アルバムの取得
     */
    async fetchAlbumList() {
      this.albumList = []
      const config = {
        pageSize: 50
      }
      await this.$gapiInit(this.gapi).then(async () => {
        const call = async (config) => {
          // Doc: https://developers.google.com/photos/library/reference/rest/v1/albums/list
          await this.gapi.client.photoslibrary.albums
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
    /**
     * 写真を追加する
     * アルバム未作成の場合は作成する
     */
    async postPhoto() {
      this.contentProgress = 10
      this.isProcessing = true
      if (!this.isLoggedIn) {
        // 未ログインの場合、処理中ステータスをセットしてログイン処理
        localStorage.setItem(DURING_PROCESSING.key, DURING_PROCESSING.value)
        localStorage.setItem(
          DURING_PROCESSING_TITLE,
          JSON.stringify({
            album: this.inputAlbumTitle,
            photo: this.inputPhotoTitle
          })
        )
        this.saveAndLogin()
      }
      this.contentProgress = 25
      try {
        // アルバム一覧の取得
        await this.fetchAlbumList().catch((e) =>
          this.onError('Failed fetch Album List.', e)
        )
        this.contentProgress = 40

        // 同名アルバムが存在しない場合、作成する
        // Album Response
        // Doc: https://developers.google.com/photos/library/reference/rest/v1/albums#resource:-album
        let album = this.albumList.find((e) => e.title === this.inputAlbumTitle)
        if (!album) {
          album = await this.createAlbum().catch((e) =>
            this.onError('Failed Create Album.', e)
          )
        }
        this.contentProgress = 50

        // 描画情報の取得（Base64）
        this.imageData = await this.$refs.draw.dataURL()

        if (album) {
          // 認証情報の取得
          // GoogleAuth
          // Doc: https://developers.google.com/identity/sign-in/web/reference#googleauththenoninit_onerror
          const auth = await this.$googleAuth(this.gapi)
          // GoogleUser
          // Doc: https://developers.google.com/identity/sign-in/web/reference#googleusergetid
          const googleUser = auth.currentUser.get()
          const authResponse = googleUser.getAuthResponse(true)
          const accessToken = authResponse.access_token
          if (!accessToken) {
            this.onError('Failed get Authorization Data.')
          }
          this.contentProgress = 60

          // 画像をGoogleへアップロード(Netlify Function)
          // Doc: https://developers.google.com/photos/library/guides/upload-media
          const res = await this.$axios
            .post('/postPhoto', {
              params: {
                accessToken,
                photoURL: this.imageData
              }
            })
            .catch((e) => this.onError('Failed POST Photo.', e))
          const uploadToken = res.data
          this.contentProgress = 75

          if (uploadToken) {
            this.contentProgress = 95
            // アップロードした画像をアルバムに追加
            const result = await this.$gapiInit(this.gapi).then(async () => {
              // Doc: https://developers.google.com/photos/library/reference/rest/v1/mediaItems/batchCreate
              const ret = await this.gapi.client.photoslibrary.mediaItems.batchCreate(
                {
                  albumId: album.id,
                  newMediaItems: [
                    {
                      description: 'Created by Nest Board.',
                      simpleMediaItem: {
                        fileName: this.inputPhotoTitle,
                        uploadToken
                      }
                    }
                  ]
                }
              )
              return ret
            })
            if (result.status !== 200)
              this.onError('Failed mediaItems:batchCreate.')
            this.contentProgress = 100
          } else {
            this.onError('Failed POST Photo.')
          }
        } else {
          this.onError('Failed Album not found.')
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.trace(e)
      }
      this.processState = this.hasError
        ? PROCCESS_STATE.failed
        : PROCCESS_STATE.success
    },
    onError(message) {
      this.hasError = true
      // eslint-disable-next-line no-console
      console.error(message)
      throw new Error(message)
    },
    handleModalClose() {
      this.processState = ''
      this.isProcessing = false
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
