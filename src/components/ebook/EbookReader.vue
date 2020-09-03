<template>
  <div class="ebook-reader">
    <div id="read"></div>
  </div>
</template>

<script>
import { ebookMixin } from '../../utils/mixin'
import Epub from 'epubjs'

global.ePub = Epub

export default {
  name: 'EbookReader',
  mixins: [ebookMixin],
  // mapActions、mapGetters等封装到了ebookMixin中,
  // this.$store.dispatch.xxx、this.$store.state.xxx可以直接改用this.xxx直接调用

  mounted () {
    // 将动态路由:fileName中的'|'解析为'/'
    // History|2018_Book_CapitalPunishmentAndTheCrimina
    // History/2018_Book_CapitalPunishmentAndTheCrimina
    const fileName = this.$route.params.fileName.split('|').join('/')

    // 提交修改vuex中的fileName
    // this.$store.dispatch('setFileName', fileName).then(() => {
    this.setFileName(fileName).then(() => {
      // 初始化阅读器
      this.initEpub()
    })
  },
  methods: {

    /*
    * function initEpub 初始化阅读器
    */
    initEpub () {
      // 构造当前书本具体的nginx资源访问地址
      const baseUrl = 'http://192.168.0.104:8081/epub/' // nginx静态资源服务器epub目录地址
      const url = baseUrl + this.fileName + '.epub' // nginx资源地址+文件名+后缀

      // 调用利用epubjs解析url得到书本信息
      this.book = new Epub(url)

      // 将获取的书本渲染并绑定到id为'read'的dom，并且赋给this.rendition
      this.rendition = this.book.renderTo('read', {
        width: innerWidth,
        height: innerHeight,
        method: 'default' // 设置这个才能在微信中正常的显示
      })

      // 展示，display是epubjs中的方法
      this.rendition.display()

      // on是epubjs中的方法，绑定事件到iframe中
      // epubjs解析书本后会创建一个iframe在绑定的dom中，具体结构可F12查看，这里不赘述
      // touchstart和touchend表示触摸的开始和结束（手指接触屏幕到离开屏幕）
      this.rendition.on('touchstart', event => {
        this.touchStartX = event.changedTouches[0].clientX // 多个触摸动作(用户多指触摸屏幕)的第一个的X轴位置
        this.touchStartTime = event.timeStamp // 触摸开始的时间戳
      })
      this.rendition.on('touchend', event => {
        const offsetX = event.changedTouches[0].clientX - this.touchStartX // 触摸动作X轴偏移量
        const time = event.timeStamp - this.touchStartTime // 触摸时长
        if (offsetX > 40) { // 当触摸动作偏移量大于40像素
          this.prevPage() // 翻到上一页
        } else if (offsetX < -40) { // 当触摸动作偏移量小于-40像素
          this.nextPage() // 翻到下一页
        } else if (time < 500) { // 当触摸事件小于500毫秒
          this.toggleMenu() // 切换菜单目录显示/隐藏
        } else {
        }
        event.preventDefault() // 禁用事件默认方法调用
        event.stopPropagation() // 禁止事件冒泡传播
      })
    },

    /*
    * function prevPage 翻到上一页
    */
    prevPage () {
      if (this.rendition) { // 如果rendition对象存在
        this.rendition.prev() // 翻到上一页
        this.hideMenu() // 隐藏菜单
      }
    },

    /*
    * function initEpub 翻到下一页
    */
    nextPage () {
      if (this.rendition) { // 如果rendition对象存在
        this.rendition.next() // 翻到下一页
        this.hideMenu() // 隐藏菜单
      }
    },

    /*
    * function showTitleAndMenu 切换菜单目录显示/隐藏
    */
    toggleMenu () {
      // this.$store.dispatch('setMenuVisible', !this.menuVisible)
      if (this.menuVisible) {
        this.setSettingVisible(-1) // 将具体设置栏隐藏
      }
      this.setMenuVisible(!this.menuVisible)
    },

    /*
    * function hideMenu 隐藏菜单目录
    */
    hideMenu () {
      // this.$store.dispatch('setMenuVisible', false)
      this.setSettingVisible(-1) // 将具体设置栏隐藏
      this.setMenuVisible(false)
    }
  }
}
</script>

<style lang='scss' scoped>

</style>
