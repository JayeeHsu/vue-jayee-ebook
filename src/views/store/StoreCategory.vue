<template>
  <div class="store-shelf">
    <shelf-title :title="shelfCategory.title"></shelf-title>
    <scroll class="store-shelf-scroll-wrapper"
          :top="0"
          :bottom="scrollBottom"
          @onScroll="onScroll"
          ref="scroll"
          v-if="ifShowList"
    >
      <shelf-list :top="42" :data="shelfCategory.itemList"></shelf-list>
      <shelf-footer></shelf-footer>
    </scroll>
    <div class="store-shelf-empty-view" v-else>
      {{$t('shelf.groupNone')}}
    </div>
  </div>
</template>

<script>
import { storeShelfMixin } from '../../utils/mixin'
import ShelfTitle from '../../components/shelf/ShelfTitle'
import Scroll from '../../components/common/Scroll.vue'
import ShelfList from '../../components/shelf/ShelfList.vue'
import ShelfFooter from '../../components/shelf/ShelfFooter.vue'

export default {
  mixins: [storeShelfMixin],
  watch: {
    isEditMode (isEditMode) {
      this.scrollBottom = isEditMode ? 48 : 0
      this.$nextTick(() => {
        this.$refs.scroll.refresh()
      })
    }
  },
  computed: {
    ifShowList () {
      return this.shelfCategory.itemList && this.shelfCategory.itemList.length > 0
    }
  },
  data () {
    return {
      scrollBottom: 0
    }
  },
  components: {
    ShelfTitle,
    Scroll,
    ShelfList,
    ShelfFooter
  },
  methods: {
    onScroll (offsetY) {
      this.setOffsetY(offsetY)
    }
  },
  mounted () {
    this.getCategoryList(this.$route.query.title)
    this.setCurrentType(2)
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
@import "../../assets/styles/global";
.store-shelf {
    position: relative;
    z-index: 100;
    width:100%;
    height:100%;
    background: white;
    .store-shelf-scroll-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 101;
    }
    .store-shelf-empty-view{
      position:absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      font-size: px2rem(14);
      color: #333;
      @include center;
    }
}
</style>
