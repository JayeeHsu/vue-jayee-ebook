// 扩展方法
// eslint-disable-next-line no-extend-native
Array.prototype.pushWithoutDuplicate = function () {
  // 数组push扩展，对于未存在于数组的元素的才调用push方法
  for (let i = 0; i < arguments.length; i++) {
    const arg = arguments[i]
    if (this.indexOf(arg) === -1) {
      this.push(arg)
    }
  }
}
