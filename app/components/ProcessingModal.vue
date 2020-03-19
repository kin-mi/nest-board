<template>
  <transition name="modal" appear>
    <div
      class="modal flex items-center justify-center fixed z-30 top-0 left-0 w-full h-full"
    >
      <div class="modal-window w-1/2 bg-white rounded overflow-hidden">
        <div class="py-2 px-4">
          <template v-if="!processState">
            <p class="mb-2 text-center">アップロード中...</p>
            <progress-base
              :percentage="contentProgress"
              color="orange"
              class="mx-2 mb-2 h-5"
            >
              <span class="text-xs text-white w-full flex justify-end pr-2"
                >{{ contentProgress }}%</span
              >
            </progress-base>
          </template>
          <template v-else-if="processState === 'success'">
            <p class="mb-2 text-center text-teal-800">処理が完了しました。</p>
            <div class="text-center">
              <button
                @click="$emit('close')"
                class="mx-auto bg-teal-500 hover:bg-teal-700 text-white font-bold py-1 px-2 rounded"
              >
                閉じる
              </button>
            </div>
          </template>
          <template v-else>
            <p class="mb-2 text-center text-red-800">エラーが発生しました。</p>
            <div class="text-center">
              <button
                @click="$emit('close')"
                class="mx-auto bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
              >
                閉じる
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import ProgressBase from '~/components/ProgressBase'
export default {
  components: {
    ProgressBase
  },
  props: {
    contentProgress: {
      type: Number,
      default: 0
    },
    processState: {
      type: String,
      default: ''
    }
  }
}
</script>
<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
/* オーバーレイのトランジション */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.4s;
}
/* オーバーレイに包含されているモーダルウィンドウのトランジション */
.modal-enter-active .modal-window,
.modal-leave-active .modal-window {
  transition: opacity 0.4s, transform 0.4s;
}

/* ディレイを付けるとモーダルウィンドウが消えた後にオーバーレイが消える */
.modal-leave-active {
  transition: opacity 0.6s ease 0.4s;
}

.modal-enter,
.modal-leave-to {
  opacity: 0;
}
.modal-enter .modal-window,
.modal-leave-to .modal-window {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
