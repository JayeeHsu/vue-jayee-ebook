<template>
  <transition name="popup-slide-up">
    <div class="ebook-popup-list" v-show="fontFamilyVisible">
      <div class="ebook-popup-title">
        <div class="ebook-popup-title-icon" @click="hide">
          <div class="icon-down2"></div>
        </div>
        <div class="ebook-popup-title-text">{{$t('book.selectFont')}}</div>
      </div>
      <div class="ebook-popup-list-wrapper">
        <div class="ebook-popup-item"
             v-for="(item,index) in fontFamilyList"
             :key="index"
              @click="setFontFamily(item.font)">
          <div class="ebook-popup-item-text"
               :class="{'selected':isSelected(item)}">{{item.font}}
          </div>
          <div class="ebook-popup-item-check"
               v-if="isSelected(item)">
            <span class="icon-check"></span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ebookMixin } from '../../utils/mixin'
import { FONT_FAMILY } from '../../utils/book'
import { saveFontFamily } from '../../utils/localStorage'
// import { setLocalStorage, getLocalStorage } from '../../utils/localStorage'

export default {
  name: 'EbookSettingFontPopup',
  mixins: [ebookMixin],
  data () {
    return {
      fontFamilyList: FONT_FAMILY
    }
  },
  mounted () {
  },
  methods: {

    /*
    * 判断是否为当前已选择字体
    * @method isSelected (item)
    * @param {object} item 字体设置选项
    */
    isSelected (item) {
      return this.defaultFontFamily === item.font
      // :class="{'selected':isSelected(item)}"
    },

    /*
    * 隐藏字体选择栏
    * @method hide
    */
    hide () {
      this.setFontFamilyVisible(false)
    },

    /*
    * 设置字体
    * @method setFontFamily
    * @param {string} font 字体名称
    */
    setFontFamily (font) {
      this.setDefaultFontFamily(font)
      saveFontFamily(this.fileName, font)
      if (font === 'Default') {
        this.currentBook.rendition.themes.font('Times New Roman')
      } else {
        this.currentBook.rendition.themes.font(font)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "../../assets/styles/global";

  .ebook-popup-list {
    background: white;
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 300;
    width: 100%;
    font-size: 0;
    box-shadow: 0 px2rem(-4) px2rem(6) rgba(0, 0, 0, .1);
    .ebook-popup-title {
      position: relative;
      text-align: center;
      padding: px2rem(15);
      border-bottom: px2rem(1) solid #b8b9bb;
      box-sizing: border-box;
      @include center;
      .ebook-popup-title-text {
        font-size: px2rem(14);
        font-weight: bold;
      }
      .ebook-popup-title-icon {
        position: absolute;
        left: px2rem(15);
        top: 0;
        height: 100%;
        @include center;
        .icon-down2 {
          font-size: px2rem(16);
          font-weight: bold;
        }
      }
    }
    .ebook-popup-list-wrapper {
      .ebook-popup-item {
        display: flex;
        padding: px2rem(15);
        .ebook-popup-item-text {
          flex: 1;
          font-size: px2rem(14);
          text-align: left;
          &.selected { //字体选项被选中时的text的样式
            color: #346cb9;
            font-weight: bold;
          }
        }
        .ebook-popup-item-check {
          flex: 1;
          text-align: right;
          .icon-check { // icon是用v-if控制的
            font-size: px2rem(14);
            font-weight: bold;
            color: #346cb9;
          }

        }
      }
    }
  }
</style>
