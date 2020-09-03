// 此文件作用：实现mapGetters、mapActions等等的复用，以免在多个组件重复写下面这些代码
// 此文件使用方法：
// import { ebookMixin } from '../../utils/mixin'
// export defoult{mixins: [ebookMixin]}
import { mapGetters, mapActions } from 'vuex'

export const ebookMixin = {
  computed: {
    ...mapGetters([
      'fileName',
      'menuVisible',
      'settingVisible',
      'defaultFontSize'
    ])
  },
  methods: {
    ...mapActions([
      'setMenuVisible',
      'setFileName',
      'setSettingVisible',
      'setDefaultFontSize'
    ])
  }
}
