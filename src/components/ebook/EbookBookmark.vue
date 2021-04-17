<template>
  <div class="ebook-bookmark" ref="ebookBookmark">
    <div class="ebook-bookmark-text-wrapper">
      <div class="ebook-bookmark-down-wrapper">
        <span class="icon-down" ref="iconDown"></span>
      </div>
      <div class="ebook-bookmark-text">{{text}}</div>
    </div>
    <div class="ebook-bookmark-icon-wrapper" :style="isFixed ? fixedStyle:{}">
      <bookmark :color="color" :width="15" :height="35"></bookmark>
    </div>
  </div>
</template>

<script>
import { realPx } from '../../utils/utils'
import Bookmark from '../common/Bookmark'
import { ebookMixin } from '../../utils/mixin'
import { getBookmark, saveBookmark } from '../../utils/localStorage'

const BLUE = '#346cbc'
const WHITE = '#fff'
export default {
  name: 'EbookBookmark',
  mixins: [ebookMixin],
  data () {
    return {
      text: '',
      color: WHITE,
      isFixed: false
    }
  },
  components: {
    Bookmark
  },
  computed: {
    height () {
      return realPx(35)
    },
    threshold () { // 下拉到可以改变书签状态的临界值
      return realPx(55)
    },
    fixedStyle () {
      return {
        position: 'fixed',
        right: `${(window.innerWidth - this.$refs.ebookBookmark.clientWidth) / 2}px`,
        top: 0
      }
    }
  },
  watch: {
    offsetY (v) {
      if (!this.bookAvailable || this.menuVisible || this.settingVisible >= 0) {
        // 还在分页或打开了菜单、设置面板时，什么都不做直接返回
        return
      }
      if (v >= this.height && v < this.threshold) {
        // 状态2：未达到临界状态
        this.beforeThreshold(v)
      } else if (v >= this.threshold) {
        // 状态3：超越临界状态
        this.afterThreshold(v)
      } else if (v > 0 && v < this.height) {
        // 状态1：未超过书签高度
        this.beforeHeight()
      } else if (v === 0) {
        // 状态4：归位
        this.restore()
      }
    },
    isBookmark (isBookmark) {
      if (isBookmark) {
        this.color = BLUE
        this.isFixed = true
      } else {
        this.color = WHITE
        this.isFixed = false
      }
    }
  },
  methods: {
    /*
    * 状态1：未超过书签高度
    * @method beforeHeight
    */
    beforeHeight () {
      if (this.isBookmark) {
        this.text = this.$t('book.pulldownDeleteMark')
        this.color = BLUE
        this.isFixed = true
      } else {
        this.text = this.$t('book.pulldownAddMark')
        this.color = WHITE
        this.isFixed = false
      }
    },
    /*
    * 状态2：未达到临界状态
    * @method beforeThreshold
    * @param {number} v offsetY
    */
    beforeThreshold (v) {
      // 改变Bookmark的top
      // 达到相对顶部静止的效果(吸附在顶部)
      this.$refs.ebookBookmark.style.top = `${-v}px`
      this.beforeHeight() // 这部分和状态1时保持一致

      const iconDown = this.$refs.iconDown
      if (iconDown.style.transform === 'rotate(180deg)') {
        iconDown.style.transform = 'rotate(0deg)'
        iconDown.style.transition = 'all .2s linear'
      }
    },
    /*
    * 状态3：超越临界状态
    * @method beforeThreshold
    * @param {number} v offsetY
    */
    afterThreshold (v) {
      this.$refs.ebookBookmark.style.top = `${-v}px`
      if (this.isBookmark) {
        this.text = this.$t('book.releaseDeleteMark')
        this.color = WHITE
        this.isFixed = false
      } else {
        this.text = this.$t('book.releaseAddMark')
        this.color = BLUE
        this.isFixed = true
      }

      const iconDown = this.$refs.iconDown
      if (iconDown.style.transform === '' || iconDown.style.transform === 'rotate(0deg)') {
        iconDown.style.transform = 'rotate(180deg)'
        iconDown.style.transition = 'all .2s linear'
      }
    },
    /*
    * 状态4：归位
    * @method restore
    */
    restore () {
      setTimeout(() => {
        this.$refs.ebookBookmark.style.top = `${-this.height}px`
        // 初始成未旋转的样式，否则用户拉到状态3后松手，再下拉时会有一瞬间闪一下从状态3变成状态2，而不是直接从状态2开始
        this.$refs.iconDown.style.transform = 'rotate(0deg)'
      }, 200)
      // 加入200毫秒延时是为了等待回弹动画完成再进行归位，否则会在动画途中就归位了

      if (this.isFixed) {
        this.setIsBookmark(true)
        this.addBookmark()
      } else {
        this.setIsBookmark(false)
        this.removeBookmark()
      }
    },
    /*
    * 添加书签 在localStorage的操作
    * @method addBookmark
    */
    addBookmark () {
      this.bookmark = getBookmark(this.fileName) // 存储某本书所有书签的数组
      if (!this.bookmark) { // 如果不存在，则初始化
        this.bookmark = []
      }
      const currentLocation = this.currentBook.rendition.currentLocation()
      // console.log(currentLocation)
      const cfibase = currentLocation.start.cfi.replace(/!.*/, '')
      const cfistart = currentLocation.start.cfi.replace(/.*!/, '').replace(/\)$/, '')
      // console.log(cfibase, cfistart)
      const cfiend = currentLocation.end.cfi.replace(/.*!/, '').replace(/\)$/, '')
      // console.log(cfiend)
      const cfirange = `${cfibase}!,${cfistart},${cfiend})`
      // 用epubjs的getRange可以获取我们拼接出来的cfirange指定的这一段文本
      this.currentBook.getRange(cfirange).then(range => {
        // 直接toString()出来的文本会有很多多余空格出现
        // \s\s表示两个空格，我们把两个空格的地方变成空字符串即可
        const text = range.toString().replace(/\s\s/g, '')
        // console.log(text)

        this.bookmark.push({
          cfi: currentLocation.start.cfi, // 本页开始的cfi，用于点击书签跳转至对应页面
          text: text // 本页的文本，用于在书签中显示
        })
        saveBookmark(this.fileName, this.bookmark) // localStorage存储
      })
    },
    /*
    * 移除书签 在localStorage的操作
    * @method removeBookmark
    */
    removeBookmark () {
      const currentLocation = this.currentBook.rendition.currentLocation()
      const cfi = currentLocation.start.cfi
      this.bookmark = getBookmark(this.fileName)
      if (this.bookmark) {
        // 利用数组的filter方法，将等于此cfi的元素去除，保存至Bookmark
        saveBookmark(this.fileName, this.bookmark = this.bookmark.filter(item => item.cfi !== cfi))
      }
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
@import "../../assets/styles/global";
.ebook-bookmark {
  position: absolute;
  top: px2rem(-35);
  left: 0;
  z-index: 100;
  width: 100%;
  height: px2rem(35);
  .ebook-bookmark-text-wrapper{
    position: absolute;
    right: px2rem(45);
    bottom: 0;
    display: flex;
    .ebook-bookmark-down-wrapper{
      font-size: px2rem(14);
      color: white;
      transition: all .2s linear;
      @include center
    }
    .ebook-bookmark-text{
      font-size: px2rem(14);
      color: white;
      font-weight: bold;
    }
  }
  .ebook-bookmark-icon-wrapper{
    position: absolute;
    right: 0;
    bottom: 0;
    margin-right: px2rem(15);
  }
}
</style>
