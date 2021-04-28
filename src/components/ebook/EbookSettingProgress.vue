<template>
  <transition name="slide-up">
    <div class="setting-wrapper" v-show="menuVisible && settingVisible ===2">
      <div class="setting-progress">
        <div class="read-time-wrapper">
          <span class="read-time-text">{{getReadTimeText()}}</span>
          <span class="icon-forward"></span>
        </div>
        <div class="progress-wrapper">
          <div class="progress-icon-wrapper" @click="prevSection()">
            <span class="icon-back" ></span>
          </div>
          <input class="progress" type="range" max="100" min="0" step="1"
                 @change="onProgressChange($event.target.value)"
                 @input="onProgressInput($event.target.value)"
                 :value="progress" :disabled="!bookAvailable"
                 ref="progress"
                 :style="{'background-size': `${progress}% 100% !important`}"
          >
          <div class="progress-icon-wrapper"  @click="nextSection()">
            <span class="icon-forward"></span>
          </div>
        </div>
        <div class="text-wrapper">
          <span class="progress-section-text">{{getSectionName}}</span>
          <span>({{bookAvailable ? progress + '%' : $t('detail.loading')}})</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ebookMixin } from '../../utils/mixin'
export default {
  name: 'EbookSettingProgress',
  mixins: [ebookMixin],
  computed: {
    // getSectionName 在EbookSettingProgress中也要使用，已移动到minxin中
  },
  data () {
    return {
      timeout: null // 创建一个定时器 用于防抖操作
    }
  },
  methods: {

    /*
     * 进度条拖动手指离开屏幕后调用的方法(类比pc的话就是鼠标键抬起)
     * @method onProgressChange
     * @param {number} progress 进度条当前进度值[0~100]（$event.target.value）
     */
    onProgressChange (progress) {
      this.setProgress(progress).then(() => {
        this.displayProgress()
        // this.updateProgressBg() <-此方法已弃用，原因见函数声明
      })
    },

    /*
     * 进度条有变化时执行的函数(类比pc的话就是鼠标键按住拖动)
     * @method onProgressInput
     * @param {number} progress 进度条当前进度值[0~100]（$event.target.value）
     */
    onProgressInput (progress) { // 进度条拖动时调用的方法
      this.setProgress(progress).then(() => {
        // 这里做了防抖处理
        // 防止用户快速拖动进度条导致触发大量的无用displayProgress()操作
        // 有新的拖动事件传入，清除定时器(同时也就清除了完成计时会触发的displayProgress()操作)
        clearTimeout(this.timeout)
        this.timeout = setTimeout(() => {
          // 当用户拖动进度条时，只有当停止拖动进度条的时间大于300毫秒
          // 才进行displayProgress()，否则认为用户还没有拖动完毕，重置定时器
          // 展示进度条对应的页面
          this.displayProgress()
        }, 300)
        // this.updateProgressBg() <-此方法已弃用，原因见函数声明
      })
    },

    /*
     * 展示进度条所在位置对应的页面
     * @method displayProgress
     */
    displayProgress () {
      // cfi是阅读器分页后给予每个字符的编号
      // 可去EbookReader找到被注释的console.log(localtions),刷新后在控制台查看
      // this.progress的值为[0~100]，我们除以100后传入
      const cfi = this.currentBook.locations.cfiFromPercentage(this.progress / 100)
      // console.log(cfi)
      this.display(cfi)
    },

    /*
     * 更新进度条背景 进度条按钮左边变为有背景颜色 表示此部分已读 进度条按钮右边为默认
     *
     * :style="{'background-size': `${progress}% 100% !important`}"
     * @method updateProgressBg
     */
    /*
     * 由于我觉得在vue中最好还是尽量少操作dom，所以此方法目前已弃用，改为直接在标签中做数据绑定
      updateProgressBg () {
        // vue操作dom 标签中ref="xxx" 调用this.$ref.xxx
        // 设置背景的宽度为进度条% 宽度为100%
        this.$refs.progress.style.backgroundSize = `${this.progress}% 100%`
      },
     */

    /*
     * 上一章
     * @method prevSection
     */
    prevSection () {
      if (this.section > 0 && this.bookAvailable) {
        this.setSection(this.section - 1).then(() => {
          this.displaySection()
        })
      }
    },

    /*
     * 下一章
     * @method nextSection
     */
    nextSection () {
      // console.log(this.currentBook)
      if (this.section < this.currentBook.spine.length && this.bookAvailable) {
        this.setSection(this.section + 1).then(() => {
          this.displaySection()
        })
      }
    },

    /*
     * 跳转至章节
     * @method displaySection
     */
    displaySection () {
      const sectionInfo = this.currentBook.section(this.section)
      if (sectionInfo && sectionInfo.href) {
        this.display(sectionInfo.href)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "../../assets/styles/global";
  .setting-wrapper {
    position: absolute;
    bottom: px2rem(48);
    left: 0;
    z-index: 160;
    width: 100%;
    height: px2rem(90);
    background: white;
    box-shadow: 0 px2rem(-8) px2rem(8) rgba(0, 0, 0, .15);

    .setting-progress {
      position: relative;
      width: 100%;
      height: 100%;

      .read-time-wrapper{
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: px2rem(40);
        font-size: px2rem(12);
        @include center;
      }
      .progress-wrapper {
        width: 100%;
        height: 100%;
        @include center;
        padding: 0 px2rem(15);
        box-sizing: border-box;
        .progress-icon-wrapper{
          font-size: px2rem(20);
        }
        .progress {
          width: 100%;
          -webkit-appearance: none; // 去除默认风格
          height: px2rem(2);
          margin:0 px2rem(10);
          &:focus { //去除进度条边框
            outline: none;
          }
          &::-webkit-slider-thumb { //进度条按钮样式
            -webkit-appearance: none; // 去除默认风格
            height: px2rem(20);
            width: px2rem(20);
            border-radius: 50%;
            background: white;
            box-shadow: 0 4px 4px 0 rgba(0, 0, 0, .15);
            border: px2rem(1) solid #ddd;
          }
        }
        .progress-icon-wrapper {
          flex: 0 0 px2rem(22);
          font-size: px2rem(22);
          @include center;
        }
      }
      .text-wrapper {
        position: absolute;
        left: 0;
        bottom: px2rem(10);
        width: 100%;
        font-size: px2rem(12);
        font-weight: bold;
        padding:0 px2rem(15);
        box-sizing: border-box;
        -moz-box-sizing:border-box; /* Firefox */
        -webkit-box-sizing:border-box; /* Safari */
        @include center;
        .progress-section-text {
          @include ellipsis
        }
      }
    }

  }

</style>
