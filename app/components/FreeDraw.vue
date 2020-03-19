<template>
  <div id="stage-parent">
    <v-stage
      id="stage"
      ref="stage"
      :config="configKonva"
      @mousedown="handleStart"
      @touchstart="handleStart"
      @mouseup="handleEnd"
      @touchend="handleEnd"
      @mousemove="handleMove"
      @touchmove="handleMove"
      class="border border-gray-500 rounded-md"
    >
      <v-layer ref="layer" />
    </v-stage>
    <p>innerWidth: {{ window.innerWidth }}</p>
    <p>configKonva.width: {{ configKonva.width }}</p>
  </div>
</template>
<script>
import Konva from 'konva'
const stageSize = {
  width: 1024,
  height: 600
}
const localStorageKey = 'nest-board'

// スクロール関連メソッド
const scrollControl = (event) => {
  if (event.cancelable) {
    event.preventDefault()
  }
}

export default {
  data() {
    return {
      configKonva: { ...stageSize },
      scale: 1,
      isPaint: false,
      lastLine: null,
      lines: [],
      debugPrint: ''
    }
  },
  mounted() {
    this.resizeStage()
    this.load()
    this.debugPrint = window.innerWidth
  },
  destroyed() {
    this.returnScroll()
  },
  methods: {
    resizeStage() {
      // windowのサイズに合わせてリサイズ
      const windowWidth = window.innerWidth
      if (windowWidth < stageSize.width) {
        this.scale = windowWidth / stageSize.width
        this.configKonva.width = stageSize.width * this.scale
        this.configKonva.height = stageSize.height * this.scale
        this.configKonva.scale = { x: this.scale, y: this.scale }
      } else {
        this.configKonva.width = stageSize.width
        this.configKonva.height = stageSize.height
      }
      this.$refs.stage.getNode().draw()
    },
    handleStart() {
      this.isPaint = true
      // 描画中のスクロールを禁止する
      this.noScroll()
      const pos = this.$refs.stage.getNode().getPointerPosition()
      this.lastLine = new Konva.Line({
        stroke: '#000',
        strokeWidth: 5,
        globalCompositeOperation: 'source-over',
        // mode === 'brush' ? 'source-over' : 'destination-out',
        points: [pos.x / this.scale, pos.y / this.scale]
      })
      this.$refs.layer.getNode().add(this.lastLine)
    },
    handleEnd() {
      this.isPaint = false
      this.lines.push(this.lastLine)
      // スクロール復帰
      this.returnScroll()
    },
    handleMove() {
      if (!this.isPaint) return
      const pos = this.$refs.stage.getNode().getPointerPosition()
      const newPoints = this.lastLine
        .points()
        .concat([pos.x / this.scale, pos.y / this.scale])
      this.lastLine.points(newPoints)
      this.$refs.layer.getNode().batchDraw()
    },
    save() {
      // local storageへ保存
      localStorage.setItem(localStorageKey, JSON.stringify(this.lines))
    },
    load() {
      // local storageからloadして描画
      const data = localStorage.getItem(localStorageKey) || '[]'
      this.lines = JSON.parse(data)
      this.$nextTick().then(() => {
        this.lines.forEach((line) => {
          const lineObj = new Konva.Line().setAttrs(JSON.parse(line).attrs)
          this.$refs.layer
            .getNode()
            .add(lineObj)
            .draw()
        })
      })
      // clear
      localStorage.setItem(localStorageKey, '[]')
    },
    noScroll() {
      // PCでのスクロール禁止
      document.addEventListener('mousewheel', scrollControl, { passive: false })
      // スマホでのタッチ操作でのスクロール禁止
      document.addEventListener('touchmove', scrollControl, { passive: false })
    },
    returnScroll() {
      // PCでのスクロール禁止解除
      document.removeEventListener('mousewheel', scrollControl, {
        passive: false
      })
      // スマホでのタッチ操作でのスクロール禁止解除
      document.removeEventListener('touchmove', scrollControl, {
        passive: false
      })
    },
    async dataURL() {
      // 送信時だけオリジナルサイズに戻す（1024 * 600）
      this.configKonva.width = stageSize.width
      this.configKonva.height = stageSize.height
      this.configKonva.scale = { x: 1, y: 1 }
      this.$refs.stage.getNode().draw()
      // 描画を待つ
      await this.$nextTick()
      const dataURL = this.$refs.stage.getNode().toDataURL({
        width: stageSize.width,
        height: stageSize.height
      })
      // 元のスケールサイズに戻す
      this.resizeStage()
      return dataURL
    }
  }
}
</script>
<style scoped>
#stage-parent {
  width: 100%;
}
</style>
