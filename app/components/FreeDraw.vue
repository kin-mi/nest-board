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
      class="border border-gray-500 rounded-md p-1"
    >
      <v-layer ref="layer" />
    </v-stage>
  </div>
</template>
<script>
import Konva from 'konva'
const stageSize = {
  width: 1024,
  height: 600
}
export default {
  data() {
    return {
      configKonva: { ...stageSize },
      scale: 1,
      isPaint: false,
      lastLine: null
    }
  },
  mounted() {
    this.resizeStage()
  },
  methods: {
    resizeStage() {
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
      const pos = this.$refs.stage.getNode().getPointerPosition()
      console.log({ x: pos.x, y: pos.y })
      this.lastLine = new Konva.Line({
        stroke: '#df4b26',
        strokeWidth: 5,
        globalCompositeOperation: 'source-over',
        // mode === 'brush' ? 'source-over' : 'destination-out',
        points: [pos.x / this.scale, pos.y / this.scale]
      })
      this.$refs.layer.getNode().add(this.lastLine)
    },
    handleEnd() {
      this.isPaint = false
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
