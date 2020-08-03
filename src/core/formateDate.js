/**
 * author tangsl 2020-04-29
 * IOS系统下的时间转换需要转replace(/-/g, '/') !!!!!!!!!!!! 以下-仅用于页面展示
 */

import moment from 'moment'

/**
 * 时间范围格式化
 * @param rangeDate
 * @returns {[string, string]|*[]}
 */
export const formatRangeDate = rangeDate => {
  if (!rangeDate || !rangeDate.length) return []
  const [sD, eD] = rangeDate
  return [moment(sD).format('YYYY-MM-DD 00:00:00'), moment(eD).format('YYYY-MM-DD 23:59:59')]
}

/**
 * 往前推多少年|月|天|时|分|秒
 * @param day 多少
 * @param unit 单位  years | months | days | hours | minutes | seconds
 * @returns {string}
 */
export const recentDay = (day = 30, unit = 'days') => {
  return moment().subtract(day, unit).format('YYYY-MM-DD')
}

/**
 * 格式化时间格式
 * @param data 日期
 * @param format 格式
 * @returns {string}
 */
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm') => {
  if (!date) return ''
  return moment(date).format(format)
}

/**
 * 转换为时分秒格式
 * @param {number} seconds 秒
 * @param {string | number} placeholder 为空占位
 * @returns {string}
 */
export const formatHourMinuteSecond = (seconds, placeholder = '-') => {
  const milliseconds = seconds * 1000
  const h = moment.duration(milliseconds).hours()
  const m = moment.duration(milliseconds).minutes()
  const s = moment.duration(milliseconds).seconds()

  let str
  str = h ? `${h}时` : ''
  str += m ? `${m}分` : ''
  str += s ? `${s}秒` : ''

  return str || placeholder
}
