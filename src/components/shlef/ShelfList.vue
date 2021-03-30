<template>
 <div class="shelf-list">
   <div class="shelf-list-item-wrapper" v-for="item in shelfList" :key="item.id">
       <shelf-item :data="item" :style="{height: itemHeight}"></shelf-item>
   </div>
    </div>
</template>

<script>
import { storeShelfMixin } from '../../utils/mixin'
import ShelfItem from './ShlefItem'
import { realPx } from '../../utils/utils'

export default {
  mixins: [storeShelfMixin],
  components: {
    ShelfItem
  },
  computed: {
    itemHeight () {
      // 封面图片规格 h/w = 350 /250
      // 空白padding间隔一共为px2rem(120)
      return ((window.innerWidth - realPx(120)) / 3) * 350 / 250 + 'px'
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
@import "../../assets/styles/global.scss";
.shelf-list{
    position: absolute;
    top: px2rem(94);
    left: 0;
    z-index: 100;
    display: flex;
    flex-flow:  row wrap;
    width: 100%;
    padding: 0 px2rem(15);
    box-sizing: border-box;
    .shelf-list-item-wrapper{
        flex: 0 0 33.33%;
        width: 33.33%;
        padding: px2rem(15);
        box-sizing: border-box;
    }
}
</style>
