const storeStateGetters = {
  hotSearchOffsetY: state => state.store.hotSearchOffsetY,
  flapCardVisible: state => state.store.flapCardVisible,
  isEditMode: state => state.store.isEditMode,
  shelfList: state => state.store.shelfList,
  shelfSelected: state => state.store.shelfSelected,
  shelfTitleVisible: state => state.store.shelfTitleVisible,
  shelfCategory: state => state.store.shelfCategory,
  currentType: state => state.store.currentType
}
export default storeStateGetters
