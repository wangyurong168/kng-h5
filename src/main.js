import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import VConsole from 'vconsole/dist/vconsole.min.js'

import * as extend from '@/core/extend'
import filters from '@/core/filters'
import directive from './core/directives'

import { error } from './core/error'
import { flowWarning } from '@/core/common'
import mixins from '@/core/mixins'
import { setLanguage, i18n } from '@/configs/language'
import { commonAuth } from '@/static/authorize'

import YxtH5, { Lazyload, Dialog } from 'yxt-h5'
import 'yxt-h5/lib/index.css'
import 'yxt-h5/lib/icon/index.css'
import YxtBizH5, { CommonUtil, Api } from 'yxt-biz-h5'
import 'yxt-biz-h5/lib/index.css'

import 'lib-flexible'
import '@/core/window'

Vue.prototype.$lang = i18n.locale
Vue.prototype.axios = axios
Vue.prototype.error = error
Vue.prototype.Dialog = Dialog
Vue.prototype.flowWarning = flowWarning

Vue.use(filters)
Vue.use(directive)
Vue.use(extend)
Vue.use(YxtH5).use(Lazyload).use(Dialog)
Vue.use(YxtBizH5)
Vue.use(mixins)

Vue.config.productionTip = false
// biz-h5设置
Api.setConfig({
  env: process.env.VUE_APP_APIENV
})

const packageJson = require('../package.json')
const version = packageJson.dependencies['yxt-h5']
localStorage.setItem('token', 'eyJhbGciOiJIUzUxMiJ9.eyJvcmdJZCI6ImRjOWRlMzkxLWU0ZTktNDcwNC1hODgxLWJhN2I3NGEzN2U1NyIsInVzZXJJZCI6IjEzNWUxNjI0LThjMDEtNDM1My1hYzYwLWFlYzE2ZDZhMmY2YiIsImZ1bGxOYW1lIjoi6L-Q6JCl566h55CG5ZGYIiwiZXhwIjoxNTkwNjY0MTczfQ.NBOjgMRKYzbn1IQYVaCzStDURZLpFpuZwI5-n_vhT0JCoUswm-9qjRwJAorPJg7-TqM_l2XEY890qYAeF3_9PQ')
async function init () {
  try {
    await CommonUtil.setUser()
  } catch (error) {
  } finally {
    Promise.all([CommonUtil.setTheme(version), setLanguage()]).then(() => {
      // eslint-disable-next-line
      new Vue({
        router,
        store,
        i18n,
        render: h => h(App),
        el: '#app'
      })
    })
  }
}

let showVConsole = () => {
  if (process.env.NODE_ENV !== 'production') {
    let vConsole = new VConsole()
    console.log(vConsole)
  }
}

init()

commonAuth()

showVConsole()
