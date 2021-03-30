<template>
  <div>
    <div class="search-bar" :class="{'hide-title': !titleVisible, 'hide-shadow': !shadowVisible}">
      <transition name="title-move">
      <div class="search-bar-title-wrapper" v-show="titleVisible">
        <div class="title-text-wrapper">
          <span class="title-text title">{{$t('home.title')}}</span>
        </div>
        <div class="title-icon-shake-wrapper" @click="showFlapCard">
          <span class="icon-shake icon"></span>
        </div>
      </div>
      </transition>
      <div class="title-icon-back-wrapper"
           :class="{'hide-title': !titleVisible}"
            @click="back"
      >
        <span class="icon-back icon"></span>
      </div>
      <div class="search-bar-input-wrapper" :class="{'hide-title': !titleVisible}">
        <div class="search-bar-blank" :class="{'hide-title': !titleVisible}"></div>
        <div class="search-bar-input">
          <span class="icon-search icon"></span>
          <input
              type="text"
              class="input"
              :placeholder="$t('home.hint')"
              v-model="searchText"
              @click="showHotSearch"
              @keyup.enter.exact="search"
          >
          <!-- keyup.enter.exact表示仅回车键弹起时触发（ctrl+回车无效） -->
        </div>
      </div>
    </div>
    <hot-search-list v-show="hotSearchVisible"
                      ref="hotSearch"
    >
    </hot-search-list>
  </div>
</template>

<script>
import { storeHomeMixin } from '../../utils/mixin'
import HotSearchList from './HotSearchList'

export default {
  name: 'SearchBar',
  mixins: [storeHomeMixin],
  data () {
    return {
      searchText: '',
      titleVisible: true,
      shadowVisible: false,
      hotSearchVisible: false
    }
  },
  components: {
    HotSearchList
  },
  watch: {
    offsetY (offsetY) {
      if (offsetY > 0) {
        this.hideTitle()
        this.showShadow()
      } else {
        this.showTitle()
        this.hideShadow()
      }
    },
    hotSearchOffsetY (offsetY) {
      if (offsetY > 0) {
        this.showShadow()
      } else {
        this.hideShadow()
      }
    }
  },
  methods: {
    /*
    * 搜索
    * @method search
    */
    search () {
      this.$router.push({
        path: '/store/list',
        query: {
          keyword: this.searchText
        }
      })
    },

    /*
    * 弹出推荐卡
    * @method showFlapCard
    */
    showFlapCard () {
      this.setFlapCardVisible(true)
    },

    /*
    * 返回
    * @method back
    */
    back () {
      if (this.offsetY > 0) {
        this.showShadow()
      } else {
        this.hideShadow()
      }
      if (this.hotSearchVisible) {
        // 如果用户点开了搜索栏，则点击返回时触发的是隐藏搜索栏
        this.hideHotSearch()
      } else {
        // 如果是正常情况，则返回书架页
        this.$router.push({
          path: '/store/shelf'
        })
      }
    },

    /*
    * 隐藏热门搜索
    * @method hideHotSearch
    */
    hideHotSearch () {
      this.hotSearchVisible = false
      if (this.offsetY > 0) {
        this.hideTitle()
        this.showShadow()
      } else {
        this.showTitle()
        this.hideShadow()
      }
    },

    /*
    * 显示热门搜索
    * @method showHotSearch
    */
    showHotSearch () {
      this.hotSearchVisible = true
      this.hideTitle()
      this.hideShadow()
      this.$nextTick(() => {
        // 用$nextTick等待上面的操作都生效dom生成完成后再reset
        this.$refs.hotSearch.reset()
      })
    },

    /*
    * 隐藏标题
    * @method hideTitle
    */
    hideTitle () {
      this.titleVisible = false
    },

    /*
    * 显示标题
    * @method showTitle
    */
    showTitle () {
      this.titleVisible = true
    },

    /*
    * 隐藏阴影
    * @method hideShadow
    */
    hideShadow () {
      this.shadowVisible = false
    },

    /*
    * 显示阴影
    * @method showShadow
    */
    showShadow () {
      this.shadowVisible = true
    }

  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
 @import "../../assets/styles/global";
  .search-bar {
    position: relative;
    width: 100%;
    z-index: 150;
    height: px2rem(94);
    box-shadow: 0 px2rem(2) px2rem(2) 0 rgba(0, 0, 0, .1);
    &.hide-title {
      height: px2rem(52);
    }
    &.hide-shadow {
      box-shadow: none;
    }
    .search-bar-title-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: px2rem(42);
      .title-text-wrapper{
        width: 100%;
        height: px2rem(42);
        @include center;
      }
      .title-icon-shake-wrapper{
        position: absolute;
        right: px2rem(15);
        top: 0;
        height: px2rem(42);
        @include center
      }
    }
    .title-icon-back-wrapper {
      position: absolute;
      left: px2rem(15);
      top: 0;
      height: px2rem(42);
      z-index: 200; // 保证在search-bar-blank之上，这样才能触发@click
      @include center;
      transition: all $animationTime $animationType;
      &.hide-title {
        height: px2rem(52);
      }
    }
    .search-bar-input-wrapper {
      position: absolute;
      left: 0;
      top: px2rem(42);
      display: flex;
      width: 100%;
      height: px2rem(52);
      padding: px2rem(10);
      box-sizing: border-box;
      transition: all $animationTime $animationType;
      &.hide-title {
        flex: 1;
        top: 0;
      }
      .search-bar-blank {
        width: 0;
        flex: 0 0 0;
        transition: all $animationTime $animationType;
        &.hide-title {
          width: px2rem(31);
          flex: 0 0 px2rem(31);
        }
      }
      .search-bar-input {
        flex: 1;
        width: 100%;
        background: #f4f4f4;
        border-radius: px2rem(20);
        padding: px2rem(5) px2rem(15);
        box-sizing: border-box;
        border: px2rem(1) solid #eee;
        @include left;
        .icon-search {
          color: #999;
        }
        .input {
          width: 100%;
          height: px2rem(22);
          border: none;
          background: transparent;
          margin-left: px2rem(10);
          font-size: px2rem(12);
          color: #666;
          padding-left: px2rem(6); /* 这个是为了让光标位置往右点 */
          &:focus {
            outline: none;
            box-shadow:0px 0px 5px 1px rgba(0,0,0,.2) inset; /* 向内阴影 营造一个聚焦的感觉 */
          }
          &::-webkit-input-placeholder {
            color: #ccc;
          }
        }
      }

    }
  }
</style>
