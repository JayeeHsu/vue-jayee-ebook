<template>
  <div class="bookmark" :style="style" ref="bookmark"></div>
</template>

<script>
import { px2rem } from '../../utils/utils'

export default {
  name: 'Bookmark',
  props: {
    width: Number,
    height: Number,
    color: String
  },
  computed: {
    style () {
      if (this.color) {
        return {
          borderColor: `${this.color} ${this.color}  transparent ${this.color} `
        }
      } else {
        return {}
      }
    }
  },
  methods: {

    /*
     * 刷新书签样式设置
     * 通过数据绑定传入 props接收
     * @method refresh
     */
    refresh () {
      if (this.height && this.width && this.width > 0 && this.height > 10) {
        this.$refs.bookmark.style.borderWidth = `${px2rem(this.height - 5)}rem ${px2rem(this.width / 2)}rem ${px2rem(5)}rem ${px2rem(this.width / 2)}rem`
      }
    }
  },
  mounted () {
    this.refresh()
  }
}

</script>

<style lang="scss" rel="stylesheet/scss" scoped>
@import "../../assets/styles/global";
.bookmark {
  width: 0;
  height: 0;
  border-width: px2rem(50) px2rem(10) px2rem(10) px2rem(10);
  border-style: solid;
  border-color: white white transparent white;
}
</style>
