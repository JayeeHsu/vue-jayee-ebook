import { getReadTime } from './localStorage'
import { realPx } from './utils'

// 字号数组
export const FONT_SIZE_LIST = [
  { fontSize: 12 },
  { fontSize: 14 },
  { fontSize: 16 },
  { fontSize: 18 },
  { fontSize: 20 },
  { fontSize: 22 },
  { fontSize: 24 }
]

// 字体数组
export const FONT_FAMILY = [
  { font: 'Default' },
  { font: 'Cabin' },
  { font: 'Days One' },
  { font: 'Montserrat' },
  { font: 'Tangerine' }
]

/*
* 主题列表
* @method themeList
* @param {object} vue vue实例
* @return {array} 返回主题列表
*/
export function themeList (vue) {
  return [
    {
      alias: vue.$t('book.themeDefault'),
      name: 'Default',
      style: {
        body: {
          color: '#4c5059',
          background: '#cecece',

          // 改变epubjs中iframe默认的20px的padding,使得这个padding值变为自适应的
          // 因为我们要在上下padding的空间放页眉和页脚
          'padding-top': `${realPx(48)}px!important`,
          'padding-bottom': `${realPx(48)}px!important`
        },
        img: {
          width: '100%'
        },
        '.epubjs-hl': {
          fill: 'red', 'fill-opacity': '0.3', 'mix-blend-mode': 'multiply'
        }
      }
    },
    {
      alias: vue.$t('book.themeGold'),
      name: 'Gold',
      style: {
        body: {
          color: '#5c5b56',
          background: '#c6c2b6',
          'padding-top': `${realPx(48)}px!important`,
          'padding-bottom': `${realPx(48)}px!important`
        },
        img: {
          width: '100%'
        },
        '.epubjs-hl': {
          fill: 'red', 'fill-opacity': '0.3', 'mix-blend-mode': 'multiply'
        }
      }
    },
    {
      alias: vue.$t('book.themeEye'),
      name: 'Eye',
      style: {
        body: {
          color: '#404c42',
          background: '#a9c1a9',
          'padding-top': `${realPx(48)}px!important`,
          'padding-bottom': `${realPx(48)}px!important`
        },
        img: {
          width: '100%'
        },
        '.epubjs-hl': {
          fill: 'red', 'fill-opacity': '0.3', 'mix-blend-mode': 'multiply'
        }
      }
    },
    {
      alias: vue.$t('book.themeNight'),
      name: 'Night',
      style: {
        body: {
          color: '#cecece',
          background: '#000000',
          'padding-top': `${realPx(48)}px!important`,
          'padding-bottom': `${realPx(48)}px!important`
        },
        img: {
          width: '100%'
        },
        '.epubjs-hl': {
          fill: 'red', 'fill-opacity': '0.3', 'mix-blend-mode': 'multiply'
        }
      }
    }
  ]
}

/*
* 添加Css文件到head标签中 用于实现全局（除开阅读器外其他部分，阅读器要单独进行CSS注入）主题的更改
* @method addCss
* @param {string} href
*/
export function addCss (href) {
  const link = document.createElement('link')
  link.setAttribute('rel', 'stylesheet')
  link.setAttribute('type', 'text/css')
  link.setAttribute('href', href)
  document.getElementsByTagName('head')[0].appendChild(link)
}

/*
* 移除head标签中的样式link标签 用于实现全局（除开阅读器外其他部分，阅读器要单独进行CSS注入）主题的更改
* @method removeCss
* @param {string} href
*/
export function removeCss (href) {
  const links = document.getElementsByTagName('link')
  for (let i = links.length; i >= 0; i--) {
    const link = links[i]
    if (link && link.getAttribute('href') && link.getAttribute('href') === href) {
      link.parentNode.removeChild(link)
    }
  }
}

/*
* 移除所有样式文件 用于实现阅读器（除开阅读器外其他部分，阅读器要单独进行CSS注入）主题的更改
* @method removeAllCss
* @param {string} href
*/
export function removeAllCss () {
  removeCss(`${process.env.VUE_APP_RES_URL}/theme/theme_default.css`)
  removeCss(`${process.env.VUE_APP_RES_URL}/theme/theme_eye.css`)
  removeCss(`${process.env.VUE_APP_RES_URL}/theme/theme_gold.css`)
  removeCss(`${process.env.VUE_APP_RES_URL}/theme/theme_night.css`)
}

/*
* 防抖
* @method debounce
* @param {function} fn 传入要进行防抖处理的函数
* @param {number} timeout 防抖定时器的过期时间
* @return {function} 处理后的执行函数
*/
export function debounce (fn, time = 2000) {
  // console.log('debounce')
  let timeout = null // 创建一个标记用通过闭包来存放定时器的返回值
  return function (...args) {
    // console.log(' return function')
    clearTimeout(timeout)
    // 每当用户触发fn的时候把前一个 setTimeout clear 掉
    timeout = setTimeout(() => {
      // 创建一个新的 setTimeout
      // console.log('创建一个新的 setTimeout')
      fn.apply(this, args)
      // console.log(' fn.apply(this) ')
    }, time)
  }
}

/*
* 节流
* @method throttle
* @param {function} fn 传入要进行节流处理的函数
* @param {number} timeout 节流定时器的过期时间
* @return {function} 处理后的执行函数
*/
export function throttle (fn, time) {
  let canRun = true // 通过闭包保存一个标记
  return function () {
    if (!canRun) return // 在函数开头判断标记是否为true，不为true则return
    canRun = false // 立即设置为false
    setTimeout(() => { // 将外部传入的函数的执行放在setTimeout中
      fn.apply(this, arguments)
      // 最后在setTimeout执行完毕后再把标记设置为true(关键)表示可以执行下一次
      // 循环了。当定时器没有执行的时候标记永远是false，在开头被return掉
      canRun = true
    }, time)
  }
}

/*
 * 获取阅读时间分钟
 * @method getReadTimeByMinute
 */
export function getReadTimeByMinute (fileName) {
  const readTime = getReadTime(fileName)
  if (!readTime) {
    return 0
  } else {
    return Math.ceil(readTime / 60)
  }
}

/*
 * 将章节的树状数据结构扁平化
 * @method flatten
 * @param {array} array 章节树
 */
export function flatten (array) {
  return [].concat(...array.map(item => {
    return [].concat(item, ...flatten(item.subitems))
  })
  )
}
