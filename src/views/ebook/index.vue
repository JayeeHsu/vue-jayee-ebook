<template>
  <div class="ebook" ref="ebook">
    <ebook-top-menu/>
    <ebook-reader/>
    <ebook-bottom-menu/>
    <ebook-bookmark/>
  </div>
</template>

<script>
import EbookReader from '../../components/ebook/EbookReader'
import EbookTopMenu from '../../components/ebook/EbookTopMenu'
import EbookBottomMenu from '../../components/ebook/EbookBottomMenu'
import EbookBookmark from '../../components/ebook/EbookBookmark'
import { getReadTime, saveReadTime } from '../../utils/localStorage'
import { ebookMixin } from '../../utils/mixin'

export default {
  mixins: [ebookMixin],
  name: 'index.vue',
  components: {
    EbookBookmark,
    EbookReader,
    EbookTopMenu,
    EbookBottomMenu
  },
  watch: { // 监听
    offsetY (v) { // v表示新的offsetY
      if (!this.menuVisible && this.bookAvailable) { // 没有打开菜单且分页完成
        if (v > 0) { // 只需要实现下拉，所以判断 v>0
          this.move(v)
        } else if (v === 0) { // moveEnd事件将v重置为0，即下拉操作完成
          this.restore() // 还原到原来的位置
        }
      }
    }
  },
  methods: {
    /*
     * 下拉后还原(即弹回顶部)
     * @method restore
     */
    restore () {
      this.$refs.ebook.style.top = 0
      // 添加过渡效果，使top的变化平滑一些，而不是直接跳到0
      this.$refs.ebook.style.transition = 'all .2s linear'
      setTimeout(() => {
        // 0.2秒后将transition清除，否则会影响到后续的下拉操作
        // 因为下拉操作也要改变top值，而每一次改变都会触发.2s的transition动画
        this.$refs.ebook.style.transition = ''
      }, 200)
    },
    /*
     * 下拉
     * @method move
     * @param { number } v 新的偏移量
     */
    move (v) {
      this.$refs.ebook.style.top = v + 'px'
    },
    /*
     * 计时器循环
     * @method startLoopReadTime
     */
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
  .ebook{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
