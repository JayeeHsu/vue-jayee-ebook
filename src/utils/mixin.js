// 此文件作用：实现mapGetters、mapActions等等的复用，以免在多个组件重复写下面这些代码
// 此文件使用方法：
// import { ebookMixin } from '../../utils/mixin'
// export defoult{mixins: [ebookMixin]}
import { mapGetters, mapActions } from 'vuex'
import { addCss, themeList, removeAllCss } from './book'
import { saveLocation } from './localStorage'

export const ebookMixin = {
  computed: {
    ...mapGetters([
      'fileName',
      'menuVisible',
      'settingVisible',
      'defaultFontSize',
      'defaultFontFamily',
      'fontFamilyVisible',
      'defaultTheme',
      'bookAvailable',
      'progress',
      'section',
      'isPaginating',
      'currentBook',
      'navigation',
      'cover',
      'metadata',
      'paginate',
      'pagelist',
      'offsetY',
      'isBookmark',
      'speakingIconBottom'
    ]),
    themeList () {
      return themeList(this)
    }
  },
  methods: {
    ...mapActions([
      'setMenuVisible',
      'setFileName',
      'setSettingVisible',
      'setDefaultFontSize',
      'setDefaultFontFamily',
      'setFontFamilyVisible',
      'setDefaultTheme',
      'setBookAvailable',
      'setProgress',
      'setSection',
      'setIsPaginating',
      'setCurrentBook',
      'setNavigation',
      'setCover',
      'setMetadata',
      'setPaginate',
      'setPagelist',
      'setOffsetY',
      'setIsBookmark',
      'setSpeakingIconBottom'
    ]),

    /*
    * 初始化全局样式 在EbookReader初始化时调用  在EbookSettingTheme修改主题时调用
    * @method initGlobalStyle
    */
    initGlobalStyle () {
      removeAllCss()
      switch (this.defaultTheme) {
        case 'Default':
          addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_default.css`)
          break
        case 'Eye':
          addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_eye.css`)
          break
        case 'Gold':
          addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_gold.css`)
          break
        case 'Night':
          addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_night.css`)
          break
        default:
          addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_default.css`)
      }
    },

    /*
     * 刷新当前位置对应的进度条位置
     * @method refreshLocation
     */
    refreshLocation () {
      // 获取当前的位置
      const currentLocation = this.currentBook.rendition.currentLocation()
      // console.log(currentLocation)

      // 本章的开始位置对应的进度值
      const startCfi = currentLocation.start.cfi
      const progress = this.currentBook.locations.percentageFromCfi(startCfi)
      this.setProgress(Math.floor(progress * 100))
      this.setSection(currentLocation.start.index)
      saveLocation(this.fileName, startCfi)
    },

    /*
    * 展示渲染
    * @method display
    * @param {string} target 传入的是个cfi
    * @param {function} callback 回调函数
    */
    display (target, callback) {
      // 展示,this.rendition.display是epubjs中的方法
      if (target) {
        return this.currentBook.rendition.display(target).then(() => {
          this.refreshLocation()
          if (callback) callback()
        })
      } else {
        return this.currentBook.rendition.display().then(() => {
          this.refreshLocation()
          if (callback) callback()
        })
      }
    }
  }
}
