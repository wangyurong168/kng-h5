import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'

/**
 * @desc 获取播放链接
 * @param arr
 * @returns {*}
 */
export const getPlaySrc = (arr) => {
  const firstArr = _head(arr)
  if (!_isEmpty(firstArr)) {
    return firstArr.url
  }
}
