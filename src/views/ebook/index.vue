<template>
  <div class="ebook">
    <ebook-top-menu/>
    <ebook-reader/>
    <ebook-bottom-menu/>
  </div>
</template>

<script>
import EbookReader from '../../components/ebook/EbookReader'
import EbookTopMenu from '../../components/ebook/EbookTopMenu'
import EbookBottomMenu from '../../components/ebook/EbookBottomMenu'
export default {
  name: 'index.vue',
  components: {
    EbookReader,
    EbookTopMenu,
    EbookBottomMenu
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";
</style>
