<template>
  <div class="ebook-reader">
    <div id="read"></div>
    <!--蒙板用于实现书签功能： -->
    <div
      class="ebook-reader-mask"
      @click="onMaskClick"
      @touchmove="move"
      @touchend="moveEnd"
      @mousedown.left="onMouseEnter"
      @mousemove="onMouseMove"
      @mouseup.left="onMouseEnd"
    ></div>
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
  saveTheme,
  getLocation
} from '../../utils/localStorage'
import { flatten } from '../../utils/book'
import { getLocalForage } from '../../utils/localForage'
global.ePub = Epub

export default {
  name: 'EbookReader',
  mixins: [ebookMixin],
  // mapActions、mapGetters等封装到了ebookMixin中,
  // this.$store.dispatch.xxx、this.$store.state.xxx可以直接改用this.xxx直接调用
  data () {
    return {
      isBookReady: false // 表示书籍已加载完毕,此时才可进行翻页操作
    }
  },
  mounted () {
    // 将动态路由:fileName中的'|'解析为'/'
    // History|2018_Book_CapitalPunishmentAndTheCrimina
    // History/2018_Book_CapitalPunishmentAndTheCrimina
    const books = this.$route.params.fileName.split('|') // books变量是 '分类|书名'
    const fileName = books[1]
    // 提交修改vuex中的fileName
    //  this.setFileName是封装的this.$store.dispatch('setFileName', fileName).then(() => {
    getLocalForage(fileName, (err, blob) => {
      if (!err && blob) {
        // localforage中有这本书的缓存
        this.setFileName(books.join('/')).then(() => {
          this.initEpub(blob)
        })
      } else {
        this.setFileName(books.join('/')).then(() => {
          const url = process.env.VUE_APP_EPUB_URL + '/' + this.fileName + '.epub'
          this.initEpub(url)
        })
      }
    })
  },
  methods: {
    /*
     * 初始化阅读器
     * @method initEpub
     */
    initEpub (url) {
      // 调用利用epubjs解析url得到书本信息
      this.book = new Epub(url)
      // this.$store.dispatch('setCurrentBook', this.book)
      this.setCurrentBook(this.book)

      // 初始化阅读器渲染
      // 此方法在阅读器渲染完成后中还调用了初始化字体，字号，主题，全局样式的方法
      // 以及添加字体样式文件到阅读器中
      this.initRendition()

      // 初始化绑定手势事件
      this.initGesture()

      this.parseBook()

      // ready是epubjs在解析完成后调用的一个钩子函数
      this.book.ready
        .then(() => {
          // 根据页面宽度/375和字体大小/16决定分页字数,默认750
          // 这个算法有一个缺陷，就是不会计算资源文件（比如图片）在内容中占的位置
          // 而且有些字（比如标题）是比较大的
          return this.book.locations.generate(
            (750 * (window.innerWidth / 375) * getFontSize(this.fileName)) / 16
          )
        })
        .then(locations => {
          this.navigation.forEach(nav => {
            nav.pagelist = []
          })
          locations.forEach(item => {
            const loc = item.match(/\[(.*)]!/)[1]
            this.navigation.forEach(nav => {
              if (nav.href) {
                // 兼容xhtml的文件的场景，优化了正则表达式
                let href = nav.href.match(/\/(.*)\.xhtml$/)
                // 如果没有匹配到，则再使用html正则进行匹配
                if (!href) {
                  href = nav.href.match(/^(.*)\.html$/)
                }
                if (href) {
                  // loc只要包含href[1]中的内容，则认为包含在该目录下
                  if (loc.indexOf(href[1]) >= 0) {
                    nav.pagelist.push(item)
                  }
                }
              }
            })
            let currentPage = 1
            this.navigation.forEach((nav, index) => {
              if (index === 0) {
                nav.page = 1
              } else {
                nav.page = currentPage
              }
              currentPage += nav.pagelist.length + 1
            })
          })
          // console.log(this.navigation)
          this.setPagelist(locations)
          // 分页完成

          this.setBookAvailable(true)

          this.refreshLocation() // 刷新当前位置对应的进度条位置
        })
    },

    /*
     * 初始化阅读器渲染
     * 此方法在阅读器渲染完成后中还调用了初始化字体，字号，主题，全局样式的方法
     * 以及添加字体样式文件到阅读器中
     * @method initRendition
     */
    initRendition () {
      // 将获取的书本渲染并绑定到id为'read'的dom，并且赋给this.rendition
      this.rendition = this.book.renderTo('read', {
        width: innerWidth,
        height: innerHeight,
        method: 'default' // 设置这个才能在微信中正常的显示
        // flow: 'scolled' // epubjs的滚动模式，但是ios和微信不支持所以不采用此模式
      })
      const location = getLocation(this.fileName)
      this.display(location || null, () => {
        // 初始化字体
        this.initFontFamily()
        // 初始化字号
        this.initFontSize()
        // 初始化主题
        this.initTheme()
        // 初始化全局样式
        this.initGlobalStyle()
      }).then(() => {
        // 阅读器完成渲染后
        this.isBookReady = true
      })

      // this.rendition.hooks.content阅读器渲染完可以获得资源文件时的钩子函数
      this.rendition.hooks.content.register(contents => {
        Promise.all([
          // 添加字体样式文件到阅读器中
          contents.addStylesheet(
            `${process.env.VUE_APP_RES_URL}/fonts/daysOne.css`
          ),
          contents.addStylesheet(
            `${process.env.VUE_APP_RES_URL}/fonts/cabin.css`
          ),
          contents.addStylesheet(
            `${process.env.VUE_APP_RES_URL}/fonts/montserrat.css`
          ),
          contents.addStylesheet(
            `${process.env.VUE_APP_RES_URL}/fonts/tangerine.css`
          )
        ]).then(() => {})
      })
    },

    /*
     * 初始化字体
     * @method initFontFamily
     */
    initFontFamily () {
      const fontFamily = getFontFamily(this.fileName)
      if (!fontFamily) {
        // 如果当前localStorage中没有FontFamily
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
      if (!fontSize) {
        // 如果当前localStorage中没有FontSize
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
        // 利用epubjs的themes.register方法进行样式注入(注册)
        this.rendition.themes.register(theme.name, theme.style)
      })
      this.rendition.themes.select(defaultTheme)
    },

    /*
     * 初始化绑定手势事件
     * @method initGesture
     */
    initGesture () {
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
        if (offsetX > 40) {
          // 当触摸动作偏移量大于40像素
          this.prevPage() // 翻到上一页
        } else if (offsetX < -40) {
          // 当触摸动作偏移量小于-40像素
          this.nextPage() // 翻到下一页
        } else if (time < 500) {
          // 当触摸事件小于500毫秒
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
      if (this.rendition && this.isBookReady) {
        // 如果rendition对象存在
        this.rendition.prev().then(() => {
          // 刷新当前位置对应的进度条位置
          this.refreshLocation()
        }) // 翻到上一页
        this.hideMenu() // 隐藏菜单
      }
    },

    /*
     * 翻到下一页
     * @method initEpub
     */
    nextPage () {
      if (this.rendition && this.isBookReady) {
        // 如果rendition对象存在
        this.rendition.next().then(() => {
          // 刷新当前位置对应的进度条位置
          this.refreshLocation()
        }) // 翻到下一页
        this.hideMenu() // 隐藏菜单
      }
    },

    /*
     * 切换菜单目录显示/隐藏
     * @method showTitleAndMenu
     */
    toggleMenu () {
      // this.$store.dispatch('setMenuVisible'n, !this.menuVisible)
      if (this.menuVisible) {
        this.setSettingVisible(-1) // 将具体设置栏隐藏
        this.setFontFamilyVisible(false)
      }
      this.setMenuVisible(!this.menuVisible)
    },

    /*
     * 解析图书的封面、基本信息、章节
     * @method parseBook
     */
    parseBook () {
      this.book.loaded.cover.then(cover => {
        // console.log(cover)
        this.book.archive.createUrl(cover).then(url => {
          // console.log(url)
          this.setCover(url)
        })
        this.book.loaded.metadata.then(metadata => {
          this.setMetadata(metadata)
        })
        this.book.loaded.navigation.then(nav => {
          const navItem = flatten(nav.toc)
          function find (item, level = 0) {
            return !item.parent
              ? level
              : find(
                navItem.filter(
                  parentItem => parentItem.id === item.parent
                )[0],
                ++level
              )
          }
          navItem.forEach(item => {
            item.level = find(item)
          })
          this.setNavigation(navItem)
        })
      })
    },

    /*
     * 当蒙版被点击时的绑定，用于编写书签功能
     * 因为redition.on不支持绑定touchmove事件,所以利用一个background为透明的蒙版来绑定事件
     * @method onMaskClick
     * @param { object } e 点击后传入的事件event
     */
    onMaskClick (e) {
      if (this.mouseState && (this.mouseState === 2 || this.mouseState === 3)) {
        return
      } else {
        this.mouseState = 4
      }
      const offsetX = e.offsetX
      const width = window.innerWidth
      if (offsetX > 0 && offsetX < width * 0.3) {
        this.prevPage()
      } else if (offsetX > 0 && offsetX > width * 0.7) {
        this.nextPage()
      } else {
        this.toggleMenu()
      }
    },

    /*
     * 计算Y轴偏移量，传入vuex
     * @method move
     * @param { object } e 点击后传入的事件event
     */
    move (e) {
      let offsetY = 0
      if (this.firstOffsetY) {
        offsetY = e.changedTouches[0].clientY - this.firstOffsetY
        this.setOffsetY(offsetY)
      } else {
        // changedTouches[0]表示touchmove事件中最开始的触摸点
        this.firstOffsetY = e.changedTouches[0].clientY
      }
      e.preventDefault() // 主要为了取消掉下拉操作时的默认行为
      e.stopPropagation()
    },

    /*
     * 还原偏移量
     * @method moveEnd
     * @param { object } e 点击后传入的事件event
     */
    moveEnd (e) {
      this.setOffsetY(0)
      this.firstOffsetY = null
    },

    /*
    * 鼠标状态mouseState
    * 1 - 鼠标进入
    * 2 - 鼠标进入后的移动
    * 3 - 鼠标从移动状态松手
    * 4 - 鼠标还原
    * */

    /*
     * pc端鼠标下拉功能，绑定在onmousedown.left上，表示按下鼠标左键下拉
     * @method onMouseEnter
     * @param { object } e 点击后传入的事件event
     */
    onMouseEnter (e) {
      // console.log('onMouseEnter', e)
      this.mouseState = 1
      this.mouseStartTime = e.timeStamp
      e.preventDefault()
      e.stopPropagation()
    },

    /*
     * pc端鼠标下拉功能，绑定在onmousemove上，表示鼠标移动
     * @method onMouseMove
     * @param { object } e 点击后传入的事件event
     */
    onMouseMove (e) {
      // console.log('onMouseMove', e)
      if (this.mouseState === 1) {
        this.mouseState = 2
      } else if (this.mouseState === 2) {
        let offsetY = 0
        if (this.firstOffsetY) {
          offsetY = e.clientY - this.firstOffsetY
          this.setOffsetY(offsetY)
        } else {
          // changedTouches[0]表示touchmove事件中最开始的触摸点
          this.firstOffsetY = e.clientY
        }
      }
      e.preventDefault()
      e.stopPropagation()
    },

    /*
     * pc端鼠标下拉功能，绑定在onmousemove.left上，表示松开鼠标左键
     * @method onMouseEnd
     * @param { object } e 点击后传入的事件event
     */
    onMouseEnd (e) {
      // console.log('onMouseEnd', e)
      if (this.mouseState === 2) {
        this.setOffsetY(0)
        this.firstOffsetY = null
        this.mouseState = 3
        const time = e.timeStamp - this.mouseStartTime
        if (time < 100) {
          // 如果移动时间太短，则强制判定成单击事件，防止用户手滑在点击操作时移动了一点点被判定成下拉
          this.mouseState = 4
        }
        e.preventDefault()
        e.stopPropagation()
      } else {
        this.mouseState = 4
      }
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
@import "../../assets/styles/global";
.ebook-reader {
  width: 100%;
  height: 100%;
  overflow: hidden;
  .ebook-reader-mask {
    position: absolute;
    background: transparent;
    width: 100%;
    height: 100%;
    z-index: 150;
    top: 0;
    left: 0;
  }
}
</style>
