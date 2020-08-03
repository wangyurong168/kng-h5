function picError (el, binding) {
  // 头像图片加载错误 加载默认图
  if (!el.src) {
    el.src = binding.value ? binding.value : 'static/images/pic.png'
  }
  // 防止闪图
  el.onerror = null
}

export default {
  install: Vue => {
    Vue.directive('image-error', (el, binding) => {
      el.onerror = () => {
        let image =
          binding.value ||
          'https://picobd-bbs.yxt.com/common/imgs/covers/fail_img.png'
        let img = new Image()
        img.onload = () => {
          el.src = img.src
        }
        img.src = image
      }
    })
    Vue.directive('auto-focus', {
      inserted: el => {
        el.focus()
      }
    })
    Vue.directive('picError', picError)
  }
}
