<template>
  <div v-if="visible" class="text-xs mx-3 mt-2">
    <p>
      Safari、及びiPhone/iPadをお使いの場合、
      <a href="https://support.apple.com/ja-jp/HT203036" class="underline">
        プライベートブラウズで表示
      </a>
      するか
    </p>
    <p>
      <a href="https://support.apple.com/ja-jp/HT201265" class="underline">
        Cookieを削除
      </a>
      してご利用ください。
    </p>
  </div>
</template>
<script>
export default {
  data() {
    return {
      visible: false
    }
  },
  mounted() {
    const userAgent = window.navigator.userAgent.toLowerCase()
    if (userAgent.includes('msie') || userAgent.includes('trident')) {
      // IE
      this.visible = false
    } else if (userAgent.includes('edge')) {
      // Edge
      this.visible = false
    } else if (userAgent.includes('chrome')) {
      // Chrome
      this.visible = false
    } else if (userAgent.includes('safari')) {
      // Safari
      this.visible = true
    } else if (userAgent.includes('firefox')) {
      // Firefox
      this.visible = false
    } else if (userAgent.includes('opera')) {
      // Opera
      this.visible = false
    } else {
      // Other
      this.visible = false
    }

    if (userAgent.includes('iphone')) {
      // iPhoen
      this.visible = true
    } else if (userAgent.includes('ipad')) {
      // iPad
      this.visible = true
    } else if (userAgent.includes('android')) {
      if (userAgent.includes('mobile')) {
        // Android mobile
        this.visible = false
      } else {
        // Android Tablet
        this.visible = false
      }
    }
  }
}
</script>
