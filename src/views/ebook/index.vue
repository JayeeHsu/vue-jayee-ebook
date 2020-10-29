<template>
  <div class="ebook">
    <ebook-top-menu/>
    <ebook-reader/>
    <ebook-bottom-menu/>
  </div>
</template>

<script>
import EbookReader from '../../components/ebook/EbookReader'
import EbookTopMenu from '../../components/ebook/EbookTopMenu'
import EbookBottomMenu from '../../components/ebook/EbookBottomMenu'
import { getReadTime, saveReadTime } from '../../utils/localStorage'
import { ebookMixin } from '../../utils/mixin'

export default {
  mixins: [ebookMixin],
  name: 'index.vue',
  components: {
    EbookReader,
    EbookTopMenu,
    EbookBottomMenu
  },
  methods: {
    startLoopReadTime () {
      // 从vuex中取得readTime
      let readTime = getReadTime(this.fileName)
      if (!readTime) {
        readTime = 0
      }
      this.task = setInterval(() => {
        readTime++
        if (readTime % 30 === 0) {
          // 存入localStorage
          saveReadTime(this.fileName, readTime)
        }
      }, 1000)
    }
  },
  mounted () {
    this.startLoopReadTime()
  },
  beforeDestroy () {
    if (this.task) {
      clearInterval(this.task)
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";
</style>
