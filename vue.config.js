module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? './'
    : '/'
  // 如果是生产模式则baseUrl为'./'，开发和测试则为'/'
}
