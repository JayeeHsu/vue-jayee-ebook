<template>
  <div class="ebook-reader">
    <div id="read"></div>
  </div>
</template>

<script>
import { ebookMixin } from '../../utils/mixin'
import Epub from 'epubjs'
import {
  getFontFamily,
  saveFontFamily,
  getFontSize,
  saveFontSize,
  getTheme,
  saveTheme
} from '../../utils/localStorage'
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
    * 初始化字体
    * @method initFontFamily
    */
    initFontFamily () {
      const fontFamily = getFontFamily(this.fileName)
      if (!fontFamily) { // 如果当前localStorage中没有FontFamily
        saveFontFamily(this.fileName, this.defaultFontFamily) // 设置localStorage中FontFamily为vuex中的defaultFontFamily (初始值为'default')
      } else {
        this.rendition.themes.font(fontFamily) // 否则设置字体为当前localStorage中存的FontFamily
        this.setDefaultFontFamily(fontFamily) // 并且将其传入vuex中
      }
    },

    /*
    * 初始化字号
    * @method initFontSize
    */
    initFontSize () {
      const fontSize = getFontSize(this.fileName)
      if (!fontSize) { // 如果当前localStorage中没有FontSize
        saveFontSize(this.fileName, this.defaultFontSize) // 设置localStorage中FontSize为defaultFontSize (初始值为16)
      } else {
        this.rendition.themes.fontSize(fontSize) // 否则设置字号为当前localStorage中存的FontSize
        this.setDefaultFontSize(fontSize) // 并且将其传入vuex中
      }
    },

    /*
    * 初始化主题
    * @method initTheme
    */
    initTheme () {
      let defaultTheme = getTheme(this.fileName)
      if (!defaultTheme) {
        defaultTheme = this.themeList[0].name
        saveTheme(this.fileName, defaultTheme)
      }
      this.setDefaultTheme(defaultTheme)
      this.themeList.forEach(theme => {
        this.rendition.themes.register(theme.name, theme.style)
      })
      this.rendition.themes.select(defaultTheme)
    },

    /*
    * function initEpub 初始化阅读器
    */
    initEpub () {
      // 构造当前书本具体的nginx资源访问地址
      const baseUrl = `${process.env.VUE_APP_RES_URL}/epub/` // nginx静态资源服务器epub目录地址
      const url = baseUrl + this.fileName + '.epub' // nginx资源地址+文件名+后缀

      // 调用利用epubjs解析url得到书本信息
      this.book = new Epub(url)
      // this.$store.dispatch('setCurrentBook', this.book)
      this.setCurrentBook(this.book)

      // 将获取的书本渲染并绑定到id为'read'的dom，并且赋给this.rendition
      this.rendition = this.book.renderTo('read', {
        width: innerWidth,
        height: innerHeight,
        method: 'default' // 设置这个才能在微信中正常的显示
      })

      // 展示，display是epubjs中的方法
      this.rendition.display().then(() => { // 阅读器完成渲染后
        // 初始化字体
        this.initFontFamily()
        // 初始化字号
        this.initFontSize()
        // 初始化主题
        this.initTheme()
        // 初始化全局样式
        this.initGlobalStyle()
      })

      // this.rendition.hooks.content阅读器渲染完可以获得资源文件时的钩子函数
      this.rendition.hooks.content.register(contents => {
        Promise.all([
          // 添加字体样式文件到阅读器中
          contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/daysOne.css`),
          contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/cabin.css`),
          contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/montserrat.css`),
          contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/tangerine.css`)
        ]).then(() => {

        })
      })

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
    * 翻到上一页
    * @method prevPage
    */
    prevPage () {
      if (this.rendition) { // 如果rendition对象存在
        this.rendition.prev() // 翻到上一页
        this.hideMenu() // 隐藏菜单
      }
    },

    /*
    * 翻到下一页
    * @method initEpub
    */
    nextPage () {
      if (this.rendition) { // 如果rendition对象存在
        this.rendition.next() // 翻到下一页
        this.hideMenu() // 隐藏菜单
      }
    },

    /*
    * 切换菜单目录显示/隐藏
    * @method showTitleAndMenu
    */
    toggleMenu () {
      // this.$store.dispatch('setMenuVisible', !this.menuVisible)
      if (this.menuVisible) {
        this.setSettingVisible(-1) // 将具体设置栏隐藏
        this.setFontFamilyVisible(false)
      }
      this.setMenuVisible(!this.menuVisible)
    },

    /*
    * 隐藏菜单目录
    * @method hideMenu
    */
    hideMenu () {
      // this.$store.dispatch('setMenuVisible', false)
      this.setMenuVisible(false) // 隐藏顶部和底部菜单栏
      this.setSettingVisible(-1) // 隐藏弹出设置栏
      this.setFontFamilyVisible(false) // 隐藏字体设置栏
    }
  }
}
</script>

<style lang='scss' scoped>

</style>
