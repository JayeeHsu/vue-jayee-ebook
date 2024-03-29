/*
 CryptoJS v3.1.2
 code.google.com/p/crypto-js
 (c) 2009-2013 by Jeff Mott. All rights reserved.
 code.google.com/p/crypto-js/wiki/License
 */
(function () {
  var h = CryptoJS; var j = h.lib.WordArray
  h.enc.Base64 = {
    stringify: function (b) {
      var e = b.words; var f = b.sigBytes; var c = this._map
      b.clamp()
      b = []
      for (var a = 0; a < f; a += 3) {
        for (var d = (e[a >>> 2] >>> 24 - 8 * (a % 4) & 255) << 16 | (e[a + 1 >>> 2] >>> 24 - 8 * ((a + 1) % 4) & 255) << 8 | e[a + 2 >>> 2] >>> 24 - 8 * ((a + 2) % 4) & 255,
          g = 0; g < 4 && a + 0.75 * g < f; g++)b.push(c.charAt(d >>> 6 * (3 - g) & 63))
      }
      if (e = c.charAt(64)) for (; b.length % 4;)b.push(e)
      return b.join('')
    },
    parse: function (b) {
      var e = b.length; var f = this._map; var c = f.charAt(64)
      c && (c = b.indexOf(c), c != -1 && (e = c))
      for (var c = [], a = 0, d = 0; d <
      e; d++) {
        if (d % 4) {
          var g = f.indexOf(b.charAt(d - 1)) << 2 * (d % 4); var h = f.indexOf(b.charAt(d)) >>> 6 - 2 * (d % 4)
          c[a >>> 2] |= (g | h) << 24 - 8 * (a % 4)
          a++
        }
      }
      return j.create(c, a)
    },
    _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  }
})()
