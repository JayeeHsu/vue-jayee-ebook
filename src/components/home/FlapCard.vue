<template>
  <div class="flap-card-wrapper" v-show="flapCardVisible">
    <div class="flap-card-bg" :class="{ 'animation': runFlapCardAnimation }" v-show="runFlapCardAnimation">
        <div class="flap-card" v-for="(item, index) in flapCardList" :key="index" :style="{ zIndex: item.zIndex }">
            <div class="flap-card-circle">
              <div class="flap-card-semi-circle flap-card-semi-circle-left"
                   :style="semiCircleStyle(item ,'left')"
                   ref="left"
              ></div>
              <div class="flap-card-semi-circle flap-card-semi-circle-right"
                   :style="semiCircleStyle(item ,'right')"
                   ref="right"
              ></div>
            </div>
        </div>
        <div class="point-wrapper">
          <div class="point" :class="{'animation': runPointAnimation}" v-for="(item, index) in pointList" :key="index"></div>
        </div>
    </div>
    <div class="book-card" :class="{'animation': runBookCardAnimation}" v-show="runBookCardAnimation">
      <div class="book-card-wrapper">
        <div class="img-wrapper">
          <img class="img" :src="data ? data.cover : ''">
        </div>
        <div class="content-wrapper">
          <div class="content-title">{{data ? data.title : ''}}</div>
          <div class="content-author sub-title-medium">{{data ? data.author : ''}}</div>
          <div class="content-category">{{categoryText()}}</div>
        </div>
        <div class="read-btn" @click.stop="showBookDetail(data)"  @click="close">{{$t('home.readNow')}}</div>
      </div>
    </div>
    <div class="close-btn-wrapper" >
      <span class="icon-close" @click="close"></span>
    </div>

  </div>
</template>

<script>
import { storeHomeMixin } from '../../utils/mixin'
import { flapCardList, categoryText } from '../../utils/store'

export default {
  name: 'FlapCard',
  mixins: [storeHomeMixin],
  props: {
    data: Object
  },
  data () {
    return {
      flapCardList,
      front: 0,
      back: 1,
      intervalTime: 25,
      runFlapCardAnimation: false,
      pointList: null,
      runPointAnimation: false,
      runBookCardAnimation: false
    }
  },
  watch: {
    flapCardVisible (v) {
      if (v) {
        this.runAnimation()
      }
    }
  },
  mounted () {
  },
  methods: {
    /*
    * 旋转
    * @method rotate
    * @param index 第几个圆卡片
    * @param type 是正面(向左折)往上的阶段 还是 背面(向左折)往下的阶段
    */
    rotate (index, type) {
      const item = flapCardList[index]
      let dom
      if (type === 'front') {
        dom = this.$refs.right[index]
      } else {
        dom = this.$refs.left[index]
      }
      dom.style.transform = `rotateY(${item.rotateDegree}deg)`
      dom.style.backgroundColor = `rgb(${item.r} ,${item._g} ,${item.b})`
    },

    /*
    * 创建翻转卡牌的动画
    * @method flapCardRotate
    * @param index 第几个圆卡片
    * @param type 是正面(向左折)往上的阶段 还是 背面(向左折)往下的阶段
    */
    flapCardRotate () {
      const frontFlapCard = this.flapCardList[this.front]
      const backFlapCard = this.flapCardList[this.back]
      frontFlapCard.rotateDegree += 10
      frontFlapCard._g -= 5 // 颜色加深
      backFlapCard.rotateDegree -= 10
      if (backFlapCard.rotateDegree < 90) {
        backFlapCard._g += 5 // 颜色变浅
      }
      if (frontFlapCard.rotateDegree === 90 && backFlapCard.rotateDegree === 90) {
        // 当正面的卡片转动了90度且背面的也转动了90度
        backFlapCard.zIndex += 2 // 使得背面的zIndex大于正面
      }
      this.rotate(this.front, 'front')
      this.rotate(this.back, 'back')
      if (frontFlapCard.rotateDegree === 180 && backFlapCard.rotateDegree === 0) {
        // 当前面卡片转动了180度且后面的卡片且后面的卡片归位时候
        this.next() // 切换到下一组
      }
    },

    /*
    * 切换到下一组卡片
    * @method next
    */
    next () {
      // 还原已完成动画的本组卡片
      const frontFlapCard = this.flapCardList[this.front]
      const backFlapCard = this.flapCardList[this.back]
      frontFlapCard.rotateDegree = 0
      backFlapCard.rotateDegree = 0
      frontFlapCard._g = frontFlapCard.g
      backFlapCard._g = backFlapCard.g
      this.rotate(this.front, 'front')
      this.rotate(this.back, 'back')

      //  指向下一组
      this.front++
      this.back++
      const len = this.flapCardList.length
      if (this.front >= len) {
        this.front = 0
      }
      if (this.back >= len) {
        this.back = 0
      }

      // 动态设置zIndex值,使得不同的卡片在不同的层级
      // 100 -> 96
      // 99 -> 100
      // 98 -> 99
      // 97 -> 98
      // 96 -> 97
      // (index - this.front + len) % len : (0 - 1 + 5) % 5 = 4
      //                                    (1 - 1 + 5) % 5 = 0
      this.flapCardList.forEach((item, index) => {
        item.zIndex = 100 - ((index - this.front + len) % len)
      })

      this.prepare()
    },

    /*
    * 背面卡牌预处理
    * @method prepare
    */
    prepare () {
      const backFlapCard = this.flapCardList[this.back]
      backFlapCard.rotateDegree = 180
      backFlapCard._g = backFlapCard.g - 5 * 9 // 预先把颜色变深，在prepare完成的时候就回到原来的颜色了
      this.rotate(this.back, 'back')
    },

    /*
    * 创建烟花动画
    * @method startPointAnimation
    */
    startPointAnimation () {
      this.runPointAnimation = true
      setTimeout(() => {
        this.runPointAnimation = false
      }, 750)
    },

    /*
    * 创建翻转卡牌的动画
    * @method startFlapCardAnimation
    * @param index 第几个圆卡片
    * @param type 是正面(向左折)往上的阶段 还是 背面(向左折)往下的阶段
    */
    startFlapCardAnimation () {
      this.prepare()
      this.task = setInterval(() => {
        this.flapCardRotate()
      }, this.intervalTime)
    },

    /*
    * 半圆样式
    * @method semiCircleStyle
    * @param item 传入的flapCardList元素
    * @param dir {string} 表示左半圆或右半圆
    */
    semiCircleStyle (item, dir) {
      return {
        backgroundColor: `rgba(${item.r}, ${item.g}, ${item.b}`,
        backgroundSize: item.backgroundSize,
        backgroundImage: dir === 'left' ? item.imgLeft : item.imgRight
      }
    },

    /*
    * 关闭推荐卡
    * @method close
    */
    close () {
      this.stopAnimation()
      this.setFlapCardVisible(false)
    },

    /*
    * 停止动画
    * @method stopAnimation
    */
    stopAnimation () {
      this.runFlapCardAnimation = false
      if (this.task) {
        clearInterval(this.task)
      }
      this.reset()
      if (this.timeout) {
        clearTimeout(this.timeout)
      }
      if (this.timeout2) {
        clearTimeout(this.timeout2)
      }
    },

    /*
    * 重置
    * @method reset
    */
    reset () {
      this.front = 0
      this.back = 1
      this.flapCardList.forEach((item, index) => {
        item.zIndex = 100 - index
        item._g = item.g
        item.rotateDegree = 0
        this.rotate(index, 'front')
        this.rotate(index, 'back')
      })
      this.runBookCardAnimation = false
      this.runFlapCardAnimation = false
      this.runPointAnimation = false
    },

    /*
    * 运行动画
    * @method runAnimation
    */
    runAnimation () {
      this.runFlapCardAnimation = true
      this.timeout = setTimeout(() => {
        // 执行完登场动画后再执行翻转卡片动画
        this.startFlapCardAnimation()
        this.startPointAnimation()
      }, 300)
      this.timeout2 = setTimeout(() => {
        this.stopAnimation()

        this.runBookCardAnimation = true
      }, 2500)
    },

    /*
    * 图书类别
    * @method categoryText
    */
    categoryText () {
      if (this.data) {
        return categoryText(this.data.category, this)
      } else {
        return ''
      }
    }
  },
  created () {
    this.pointList = []
    for (let i = 0; i < 18; i++) {
      this.pointList.push(`point${i}`)
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import '../../assets/styles/global';
  @import "../../assets/styles/flapCard";

  .flap-card-wrapper {
    @include absCenter;
    @include center;
    z-index: 1000;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,.6);
    .flap-card-bg {
      position: relative;
      width: px2rem(64);
      height: px2rem(64);
      border-radius: px2rem(5);
      background: white;

      // 默认不显示,当动画执行完后隐藏dom
      transform: scale(0);
      opacity: 0;

      &.animation {
        animation: flap-card-move .3s ease-in forwards; // 0.3s 渐入 forwards执行完毕后维持在100%的状态
      }
      @keyframes flap-card-move {
        0% {
          transform: scale(0);
          opacity: 0;
        }
        50% {
          transform: scale(1.2);
          opacity: 1;
        }
        75% {
          transform: scale(.9);
          opacity: 1;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
      .flap-card {
        width: px2rem(48);
        height: px2rem(48);
        @include absCenter;
        .flap-card-circle {
          display: flex;
          width: 100%;
          height: 100%;
          .flap-card-semi-circle {
            flex: 0 0 50%;
            height: 100%;
            background-repeat: no-repeat;
            backface-visibility: hidden; // 转动到背面时隐藏
          }
          .flap-card-semi-circle-left {
            border-radius: px2rem(24) 0 0 px2rem(24);
            background-position: center right; // 靠右居中
            transform-origin: right; // 将转动轴设置为右边 (默认是中轴)
          }
          .flap-card-semi-circle-right{
            border-radius: 0 px2rem(24) px2rem(24) 0;
            background-position: center left; // 靠左居中
            transform-origin: left; // 将转动轴设置为左边 (默认是中轴)
          }
        }
      }
      .point-wrapper {
        z-index: 1500;
        @include absCenter;
        .point {
          border-radius: 50%; // 圆形
          @include absCenter;
          &.animation {
            @for $i from 1 to length($moves) {
              &:nth-child(#{$i}) {
                @include move($i)
              }
            }
          }
        }
      }
    }
    .book-card {
      position: relative;
      width: 65%;
      max-width: px2rem(400);
      box-sizing: border-box;
      border-radius: px2rem(15);
      background: white;
      &.animation {
        animation: scale .3s ease-in both;
        @keyframes scale {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      }
      .book-card-wrapper {
        width: 100%;
        height: 100%;
        margin-bottom: px2rem(30);
        @include columnTop;
        .img-wrapper {
          width: 100%;
          margin-top: px2rem(20);
          @include center;
          .img {
            width: px2rem(90);
            height: px2rem(130);
          }
        }
        .content-wrapper {
          padding: 0 px2rem(20);
          margin-top: px2rem(20);
          .content-title {
            color: #333;
            font-weight: bold;
            font-size: px2rem(18);
            line-height: px2rem(20);
            max-height: px2rem(40);
            text-align: center;
            @include ellipsis2(2)
          }
          .content-author {
            margin-top: px2rem(10);
            text-align: center;
          }
          .content-category {
            color: #999;
            font-size: px2rem(14);
            margin-top: px2rem(10);
            text-align: center;
          }
        }
        .read-btn {
          position: absolute;
          bottom: 0;
          left: 0;
          z-index: 1100;
          width: 100%;
          border-radius: 0 0 px2rem(15) px2rem(15);
          padding: px2rem(15) 0;
          text-align: center;
          color: white;
          font-size: px2rem(14);
          background: $color-blue;
        }
      }
    }
    .close-btn-wrapper {
      position: absolute;
      left: 0;
      bottom: px2rem(30);
      z-index: 1100;
      width: 100%;
      @include center;
      .icon-close {
        width:px2rem(45);
        height: px2rem(45);
        font-size: px2rem(25);
        border-radius: 50%;
        background: #333;
        color: white;
        @include center;
      }
    }
  }
</style>
