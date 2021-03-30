<template>
  <div class="store-shelf">
    <shelf-title></shelf-title>
    <scroll class="store-shelf-scroll-wrapper" :top="0"
          @onScroll="onScroll"
    >
      <shelf-search></shelf-search>
      <shelf-list></shelf-list>
    </scroll>
  </div>
</template>

<script>
import { storeShelfMixin } from '../../utils/mixin'
import ShelfTitle from '../../components/shlef/ShelfTitle'
import Scroll from '../../components/common/Scroll.vue'
import ShelfSearch from '../../components/shlef/ShelfSearch.vue'
import ShelfList from '../../components/shlef/ShelfList.vue'
import { shelf } from '../../api/store'

export default {
  mixins: [storeShelfMixin],
  components: {
    ShelfTitle,
    Scroll,
    ShelfSearch,
    ShelfList
  },
  methods: {
    onScroll (offsetY) {
      this.setOffsetY(offsetY)
    },
    getShelfList () {
      shelf().then(response => {
        if (response.status === 200 && response.data && response.data.bookList) {
          this.setShelfList(response.data.bookList)
        }
      })
    }
  },
  mounted () {
    this.getShelfList()
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
}
</style>
