<template>
  <div>
      <transition name="slide-up">
        <div class="menu-wrapper"
             :class="{'hide-box-shadow':!menuVisible||settingVisible>-1,'top-border':menuVisible&&settingVisible>-1}"
             v-show="menuVisible">
          <div class="icon-wrapper">
            <span class="icon-menu" @click="showSetting(3)"></span>
          </div>
          <div class="icon-wrapper">
            <span class="icon-progress" @click="showSetting(2)"></span>
          </div>
          <div class="icon-wrapper">
            <span class="icon-bright" @click="showSetting(1)"></span>
          </div>
          <div class="icon-wrapper">
            <span class="icon-A" @click="showSetting(0)"></span>
          </div>
        </div>
      </transition>
    <ebook-setting-font/>
    <ebook-setting-font-popup/>
    <ebook-setting-theme/>
    <ebook-setting-progress/>
    <ebook-slide></ebook-slide>
  </div>
</template>

<script>
import { ebookMixin } from '../../utils/mixin'
import EbookSettingFont from './EbookSettingFont'
import EbookSettingFontPopup from './EbookSettingFontPopup'
import EbookSettingTheme from './EbookSettingTheme'
import EbookSettingProgress from './EbookSettingProgress'
import EbookSlide from './EbookSlide'

export default {
  name: 'EbookBottomMenu',
  components: {
    EbookSettingFont,
    EbookSettingFontPopup,
    EbookSettingTheme,
    EbookSettingProgress,
    EbookSlide
  },
  mixins: [ebookMixin],

  methods: {

    /*
    * 显示设置
    * @method showSetting
    * @param {number} key 要显示的设置类型的参数 -1:不显示,0:字号,1:主题,2:进度条,3:目录
    */
    showSetting (key) {
      if (this.settingVisible === key) {
        // 表示本次点击的是已经打开的设置栏,所以本次操作是关闭当前设置栏
        this.setSettingVisible(-1)
      } else { //
        this.setSettingVisible(key)
      }
    }
  }
}
</script>

<style lang='scss' scoped>
  @import '../../assets/styles/global';
  .menu-wrapper {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 201;
    display: flex;
    width: 100%;
    height: px2rem(48);
    background: white;
    box-shadow: 0 px2rem(-8) px2rem(8) rgba(0, 0, 0, .15);
    font-size: px2rem(20);
    &.hide-box-shadow {
      box-shadow: none;

    }

    .icon-wrapper {
      flex: 1;
      @include center;

      .icon-progress {
        font-size: px2rem(24);
      }

      .icon-bright {
        font-size: px2rem(22);
      }
    }
  }
</style>
