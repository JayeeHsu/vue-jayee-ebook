/* mock,开发时使用,接入后端接口后注释掉
function mock (app, url, data) {
  app.get(url, (request, response) => {
    response.json(data)
  })
}

const homeData = require('./src/mock/bookHome')
const shelfData = require('./src/mock/bookShelf')
const listData = require('./src/mock/bookList')
const flatListData = require('./src/mock/bookFlatList')
*/
module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? './'
    : '/',
  // 如果是生产模式则baseUrl为'./'，开发和测试则为'/'
  devServer: {
    /* mock,开发时使用,接入后端接口后注释掉
    before (app) {
      mock(app, '/book/home', homeData)
      mock(app, '/book/shelf', shelfData)
      mock(app, '/book/list', listData)
      mock(app, '/book/flat-list', flatListData)
    }
    */
  },
  configureWebpack: {
    performance: {
      // 将webpack 的性能提示设置为警告(而非错误)
      hints: 'warning',
      // 入口起点的最大体积设置为51200kb
      maxAssetSize: 524288 * 10, // 512 * 1024 *10
      // 生成文件的最大体积设置为51200kb
      maxEntrypointSize: 524288 * 10
    }
  }
}
