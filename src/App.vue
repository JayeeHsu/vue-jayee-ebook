<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>

export default {}
// 当DOM加载完毕时，设置html元素的fontSize
document.addEventListener('DOMContentLoaded', () => {
  const html = document.querySelector('html')
  let fontSize = window.innerWidth / 10
  fontSize = fontSize > 50 ? 50 : fontSize // 设置最大为50
  html.style.fontSize = fontSize + 'px'
})
</script>

<style lang="scss" scoped>
  /*注意这里要加lang="scss",否则会无法识别px2rem()*/
  /*@import "./assets/styles/global.scss";*/
  /*若没有在main.js中引入global.scss，则要加入上一行*/

  #app {
    background: #7d8188;
    width: 100%;
    height: 100%;
  }

</style>
