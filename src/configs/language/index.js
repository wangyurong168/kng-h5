import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { Browser } from '@/configs/const'
import { domainBaseUrl } from '@/configs/domain'
import { loadScript } from '@/core/utils'
import { Locale } from 'yxt-h5'

Vue.use(VueI18n)

export class Language {
  static lang // 浏览器语言类型
  /*
   * 获取浏览器语言类型
   * type: 0|1|2|3 0:跟随系统 1：中文 2：繁体 3：英文
   * */
  static get langString () {
    if (!this.lang) {
      // 跟随系统且不是中文不存本地lang
      const language = Browser.language
      if (language.indexOf('eng') > -1 || language.indexOf('en') === 0) {
        this.lang = 'en'
      } else if (
        language.indexOf('tw') > -1 ||
        language.indexOf('hk') > -1 ||
        language.indexOf('zhh') > -1 ||
        language.indexOf('cht') > -1
      ) {
        this.lang = 'zh-TW'
      } else {
        this.lang = 'zh-CN'
      }
    }
    return this.lang
  }
}

export const i18n = new VueI18n({
  locale: Language.lang,
  fallbackLocale: Language.lang
})
export function loadLanguage () {
  // 项目内国际化
  const IS_PROD = process.env.NODE_ENV === 'production'
  const solveI18n = () => {
    i18n.setLocaleMessage(Language.langString, window.locales)
    i18n.locale = Language.langString
    // 基础组件国际化
    let lanStr = Language.langString
    if (Language.langString === 'en') {
      lanStr = 'en-US'
    }
    // TODO: 业务组件类似
    const res = require(`yxt-h5/lib/locale/lang/${lanStr}`)
    Locale.use(lanStr, res.default)
    return Promise.resolve()
  }
  if (IS_PROD) {
    return loadScript(`${domainBaseUrl('media')}/kng/language-h5/${Language.langString}.js`).then(() => {
      solveI18n()
    })
  }
  require(`./${Language.langString}.js`)
  return solveI18n()
}

/**
 * 1. 如果机构设置了开启语言设置。会按照用户设置的语言， 没有设置就跟随系统语言(跟随系统最后默认中文)
 * 2. 如果没有开启语言设置，默认中文
 **/
export function setLanguage (cb) {
  try {
    return loadLanguage() // 没有设置的语言会跟随系统
  } catch (error) {
    throw new Error(error)
  }
}
