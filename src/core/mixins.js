// 全局混入

export default {
  install (Vue) {
    Vue.mixin({
      computed: {
        basicUrl () {
          return process.env.VUE_APP_MEDIA_URL
        },
        h5Url () {
          return process.env.VUE_APP_MEDIA_URL + '/common/h5_svg'
        },
        kngUrl () {
          return process.env.VUE_APP_MEDIA_URL + '/kng/h5svg'
        },
        pcUrl () {
          return process.env.VUE_APP_MEDIA_URL + '/common/pc_front_svg'
        }
      }
    })
  }
}
