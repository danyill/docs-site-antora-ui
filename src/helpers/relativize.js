'use strict'

const { posix: path } = require('path')

// TODO memoize
module.exports = (from, to) => {
  if (!from || to.charAt() === '#') return to
  let hash = ''
  const hashIdx = to.indexOf('#')
  if (~hashIdx) {
    hash = to.substr(hashIdx)
    to = to.substr(0, hashIdx)
  }
  return from === to
    ? hash || (isDir(to) ? './' : path.basename(to))
    : (path.relative(path.dirname(from + '_'), to) || '.') + (isDir(to) ? '/' + hash : hash)
}

function isDir (str) {
  return str.charAt(str.length - 1) === '/'
}
