/**
 * h5与app通信协议
 */
const AppProtocol = {
  /**
   * h5返回调用原生的返回协议
   */
  goBack () {
    window.yxt.ui.navigation.back({
      onSuccess: function (data) {
        // 成功回调
        if (data.isback) {
          // 说明history有可以返回的页面
          window.history.go(-1)
        } else {
          window.yxt.ui.navigation.close({
            onSuccess: function (res) {
              // 成功回调
            }
          })
        }
      }
    })
  },
  /**
   * 图片预览
   * src/components/commoncomponents/cmcommentslist
   */
  previewImage (param, success, error) {
    window.yxt.biz.util.previewImage({
      param: param || {},
      onSuccess: success || function (d) {},
      onFail: error || function (e) {}
    })
  },
  /**
   * 分享
   * src/components/commoncomponents/comments
   * param {
   *  sharetype: 1, // 1 给app信息，app自己生成图片分享出去 0 分享链接 2 截屏分享
   *  name: 'yxt_app_{module}_{page name},
   *  url: location.href,
   *  outShareUrl: '',
   *  title: '', 标题
   *  summary: '',
   *  imageUrl: '' 封面url
   * }
   */
  share (param, success, error) {
    window.yxt.biz.util.share({
      param: param || {},
      onSuccess: success || function (d) {},
      onFail: error || function (e) {}
    })
  },
  /**
   * 课程包下载协议
   * src/components/commoncomponents/comments
   */
  courseDownload (param, success, error) {
    window.yxt.biz.util.open({
      param: Object.assign(
        {
          // 参数
          name: 'yxt_app_course_download'
        },
        param
      ),
      onSuccess: success || function (d) {},
      onFail: error || function (e) {}
    })
  },
  /**
   * 扫一扫
   */
  openScan () {
    window.yxt.biz.util.scan()
  },
  /**
   * 上传9张图片
   */
  uploadPics (param, success, error) {
    window.yxt.biz.util.uploadImage({
      param: Object.assign(
        {
          // 参数
          max: 9,
          compression: 10,
          modulename: 'yxt',
          name: 'yxt_app_upload_commentpicture'
        },
        param
      ),
      onSuccess: success || function (d) {},
      onFail: error || function (e) {}
    })
  },
  /**
   * 用户登出
   */
  userLogout () {
    window.yxt.biz.user.logout({ cause: 'userlogout' })
  },
  /**
   * 身份过期
   */
  tokenExpired () {
    window.yxt.biz.user.logout({ cause: 'tokenexpired' })
  },
  // 关闭所有的webview，只保留index
  closeWebviewAll (success, error) {
    window.yxt.ui.navigation.close({
      param: {
        name: 'yxt_app_webview_close_all' // 关闭所有webview, 只保留index
      },
      onSuccess: success || function (d) {},
      onFail: error || function (e) {}
    })
  },
  /**
   * 关闭webview
   */
  closeWebview (param, success, error) {
    window.yxt.ui.navigation.close({
      param: param,
      onSuccess: success || function (d) {},
      onFail: error || function (e) {}
    })
  },
  /**
   * 用户登录参数
   */
  userLogin (param, success, error) {
    window.yxt.biz.user.login({
      param: param,
      onSuccess: success || function (d) {},
      onFail: error || function (e) {}
    })
  },
  /**
   * 打开链接
   */
  openLink (param, success, error) {
    window.yxt.biz.util.openLink({
      param: param || {},
      onSuccess: success || function (d) {},
      onFail: error || function (e) {}
    })
  },
  /**
   * 打开页面
   */
  open (param, success, error) {
    window.yxt.biz.util.open({
      param: param,
      onSuccess: success,
      onFail: error
    })
  },
  /**
   * 打开炫页，考试
   */
  playerOpen (param, success, error) {
    window.yxt.biz.player.open({
      param: param || {},
      onSuccess: success || function (d) {},
      onFail: error || function (e) {}
    })
  },
  /**
   * 传递数据
   */
  post (param, success, error) {
    window.yxt.ui.message.post({
      param: param || {},
      onSuccess: success || function (d) {},
      onFail: error || function (e) {}
    })
  },
  /**
   * 启用下拉刷新
   */
  pullToRefresh () {
    window.yxt.ui.pullToRefresh.enable()
  },
  // 根据type设置多语言
  setMutiLanguage (param) {
    window.yxt.ui.message.post({
      param: Object.assign(
        {
          name: 'yxt_app_my_setlanguage',
          type: 0
        },
        param
      ) // type: 0: 跟随系统 1:简体中文 2: 繁體中文 3: English
    })
  },
  // position
  // 开启硬件加速
  enableHardware () {
    window.yxt.ui.message.post({
      param: {
        name: 'yxt_app_hardware'
      }
    })
  },
  // index
  // 设定栏目高度
  setColumnHeight (param) {
    window.yxt.ui.message.post({
      param: Object.assign(
        {
          name: 'yxt_app_index_column',
          columnHeight: 0 // 需要传入
        },
        param
      )
    })
  },
  // 打开app原生炫课 我的菜单
  openMyXuanye () {
    window.yxt.biz.util.open({
      param: {
        // 参数
        name: 'yxt_app_xuanye_my'
      }
    })
  },
  // 设置app导航头
  setNavTitle (param) {
    window.yxt.ui.navigation.setTitle({
      param: Object.assign(
        {
          // 参数
          isShowtitle: param.isShowheader,
          title: param.headername
        },
        param
      )
    })
  },
  // 刷新协议
  refreshSuper () {
    // window.yxt.ui.navigation.refreshSuper({
    //   onSuccess: success || function (d) {},
    //   onFail: error || function (e) {}
    // })

    window.yxt.custom({
      name: 'ui.navigation.refreshSuper', // 自定义协议名
      onSuccess: () => {}, // 成功回调
      onFail: () => {} // 失败回调
    })
  }
}

export default AppProtocol
