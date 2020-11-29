<template>
    <div class="ebook-slide-contents">
      <div class="slide-contents-search-wrapper">
        <div class="slide-contents-search-input-wrapper">
          <div class="slide-contents-search-icon">
            <span class="icon-search"></span>
          </div>
          <!-- v-model="searchText"双向绑定搜索关键字 -->
          <input type="text"
                 v-model="searchText"
                 class="slide-contents-search-input"
                 :placeholder="$t('book.searchHint')"
                 @click="showSearchPage()"
                 @keydown.enter.exact="search()">
        </div>
        <div class="slide-contents-search-cancel" v-if="searchVisible" @click="hideSearchPage()">{{$t('book.cancel')}}</div>
      </div>
      <div class="slide-contents-book-wrapper" v-show="!searchVisible">
        <div class="slide-contents-book-img-wrapper">
          <img :src="cover" alt="" class="slide-contents-book-img">
        </div>
        <div class="slide-contents-book-info-wrapper">
          <div class="slide-contents-book-title">
            <span class="slide-contents-book-title-text">{{metadata.title}}</span>
          </div>
          <div class="slide-contents-book-author">
            <span class="slide-contents-book-author-text">
              {{metadata.creator}}
            </span>
          </div>
        </div>
        <div class="slide-contents-book-progress-wrapper">
          <div class="slide-contents-book-progress">
            <span class="progress">{{progress + '%'}}</span>
            <span class="progress-text">{{$t('book.haveRead2')}}</span>
          </div>
          <div class="slide-contents-book-time">{{getReadTimeText()}}</div>
        </div>
      </div>
      <scroll class="slide-contents-list"
              :top="156"
              :bottom="48"
              v-show="!searchVisible"
      >
      <div class="slide-contents-item" v-for="(item, index) in navigation"
      :key="index">
        <span class="slide-contents-item-label"
              :class="{'selected': section === index}"
              :style="contentItemStyle(item)"
              @click="displayFromNavigationOrSearch(item.href)"
        >{{item.label}}</span>
        <span class="slide-contents-item-page">{{item.page}}</span>
      </div>
      </scroll>
      <scroll class="slide-search-list"
              :top="66"
              :bottom="48"
              v-show="searchVisible">
          <div class="slide-search-item"
               v-for="(item, index) in searchList"
               :key="index"
               v-html="item.excerpt"
               @click="displayFromNavigationOrSearch(item.cfi, true)"
               >
          </div>
      </scroll>
    </div>
</template>

<script>
import { ebookMixin } from '../../utils/mixin'
import Scroll from '../common/Scroll'
import { px2rem } from '../../utils/utils'

export default {
  name: 'EbookSlideContents',
  components: {
    Scroll
  },
  mixins: [ebookMixin],
  data () {
    return {
      searchVisible: false,
      searchList: null,
      searchText: null
    }
  },
  methods: {
    /*
     * 显示搜索页
     * @method showSearchPage
     */
    showSearchPage () {
      this.searchVisible = true
    },

    /*
     * 隐藏搜索页
     * @method hideSearchPage
     */
    hideSearchPage () {
      this.searchVisible = false
      this.searchText = null // 清空搜索栏
      this.searchList = null // 清空搜索结果
    },

    /*
     * 计算不同level的章节的左margin，来区分大章节与子章节
     * @method contentItemStyle
     */
    contentItemStyle (item) {
      return {
        marginLeft: `${px2rem(item.level * 15)}rem`
      }
    },
    /*
     * 在点击目录中章节或全文搜索的结果列表后进行的display，因为要触发回调函数为this.hideMenu()，所以与一般情况的display()区别开来
     * 这样不会因为修改display这个通用方法而影响到其他调用display的组件
     * @method displayFromNavigation
     * @param {string} target 传入的href或cfi
     * @param {boolean} highlight 是否在原文中高亮关键字
     */
    displayFromNavigationOrSearch (target, highlight = false) {
      this.display(target, () => {
        this.hideMenu()
      })
      if (highlight) {
        // epubjs中的高亮显示方法,传入target即可
        this.currentBook.rendition.annotations.highlight(target)
      }
    },
    /*
    * 全文搜索
    * @method doSearch
    * @param {string} q 关键字
    */
    doSearch (q) {
      return Promise.all(
        this.currentBook.spine.spineItems.map(
          section => section.load(
            this.currentBook.load.bind(this.currentBook)
          ).then(
            section.find.bind(section, q)
          ).finally(
            section.unload.bind(section)
          )
        )
      ).then(results => Promise.resolve(
        [].concat.apply([], results) // 利用apply将results数组传入同时降维
      )
      )
    },
    /*
    * input中绑定 @keydown.enter.exact="search() exact表示“只按下某键时才生效”，比如我如果同时按下shift和回车，是不会生效的
    * 搜索框中按下回车触发全文搜索,并且将结果赋给searchList
    * 将关键字替换为span标签，达到高亮显示的目的
    * @method search
    */
    search () {
      if (this.searchText && this.searchText.length > 0) {
        this.currentBook.ready.then(() => {
          this.doSearch(this.searchText).then(result => {
            this.searchList = result
            this.searchList.map(item => {
              item.excerpt = item.excerpt.replace(this.searchText, `<span class="content-search-text">${this.searchText}</span>`)
              // 这里返回了一个span标签(html元素),用{{item.excerpt}}这种方法传值会自动解析为文本字符串,而不是一个html标签
              // 所以在上面绑定v-html="item.excerpt",将内容作为html内容载入
              return item
            })
          })
        })
      }
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
@import "../../assets/styles/global";
  .ebook-slide-contents{
    width: 100%;
    font-size: 0; // 这里为了解决在div和span间换行导致多一空行的问题
    .slide-contents-search-wrapper{
      display: flex;
      width: 100%;
      height: px2rem(35);
      margin: px2rem(20) 0 px2rem(10) 0;
      padding: 0 px2rem(15);
      box-sizing: border-box;
      .slide-contents-search-input-wrapper{
        flex: 1;
        @include center;
        .slide-contents-search-icon{
          flex: 0 0 px2rem(28);
          font-size: px2rem(12);
          @include center;
        }
        .slide-contents-search-input{
          flex: 1;
          width: 100%;
          height: px2rem(32);
          font-size: px2rem(14);
          background: transparent; /*背景色设置为透明*/
          border: none; /*去除边框*/
          &:focus{
            outline: none; /*去除选中时自带的outline*/
          }
        }
      }
      .slide-contents-search-cancel{
        flex: 0 0 px2rem(50);
        font-size: px2rem(14);
        @include right
      }
    }
    .slide-contents-book-wrapper {
      display: flex;
      width: 100%;
      height: px2rem(90);
      padding: px2rem(10) px2rem(15) px2rem(20);
      box-sizing: border-box;
      .slide-contents-book-img-wrapper{
        flex: 0 0 px2rem(45);
        .slide-contents-book-img{
          width: px2rem(45);
          height: px2rem(60);
        }
      }
      .slide-contents-book-info-wrapper{
        flex: 1;
        padding:  0 px2rem(10);
        .slide-contents-book-title{
          font-size: px2rem(14);
          // 375*0.85-30-20-45-70=153.75
          // 屏幕宽度*slide占比-父级的padding-这一级的padding-封面图片宽度-右侧progress-wrapper宽

          // width: px2rem(153.75); // 缩略显示必须要设置宽度
          // 弃用上面的width，采用下面的flex布局方案：
          @include left;
          .slide-contents-book-title-text {
              @include ellipsis2(3)
          }
          line-height: px2rem(16);
          @include ellipsis2(2) // 2行省略
        }
        .slide-contents-book-author{
          font-size: px2rem(12);
          margin-top: px2rem(5);

          width: px2rem(153.75); // 缩略显示必须要设置宽度
          // 弃用上面的width，采用下面的flex布局方案：
          @include left
          .slide-contents-book-author-text {
            @include ellipsis;
          }
          line-height: px2rem(14);
          @include ellipsis2(1);
        }
      }
      .slide-contents-book-progress-wrapper{
        flex: 0 0 px2rem(70);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        .slide-contents-book-progress{
          .progress{
            font-size: px2rem(14);
          }
          .progress-text{
            font-size: px2rem(12);
          }
        }
        .slide-contents-book-time{
          font-size: px2rem(12);
          margin-top: px2rem(5);
        }
      }
    }
    .slide-contents-list {
      padding: 0 px2rem(15);
      box-sizing: border-box;
      .slide-contents-item {
        padding: px2rem(20) 0;
        box-sizing: border-box;
        .slide-contents-item-label {
          font-size: px2rem(14);
          @include ellipsis2(1);
          line-height: px2rem(16);
        }
        .slide-contents-item-page {
          flex: 0 0 px2rem(30);
          font-size: px2rem(10);
          @include right;
        }
      }
    }
    .slide-search-list{
      width: 100%;
      padding: 0 px2rem(15);
      box-sizing: border-box;
      .slide-search-item {
        font-size: px2rem(14);
        line-height: px2rem(16);
        padding: px2rem(20) 0;
        box-sizing: border-box;
      }
    }
  ;
  }
</style>
