<template>
  <div class="noteCreateEdit">
    <div>
      <yxt-cell-group>
        <yxt-field :disabled="kngtype === 1"
          v-model="title"
          type="textarea"
          :placeholder="$t('kng_note_tip_notetitle')"
          rows="1"
          maxlength='50'
          autosize
          @blur='input_blur'
          @click="input_click"
        />
        <yxt-field
          v-model="content"
          :placeholder="inputMessage"
          input-align="left"
          type="textarea"
          :autosize='autosize'
          @blur='input_blur'
          @click="input_click"
        />
      </yxt-cell-group>
      <!-- <span>{{this.deviceType}}</span> -->
      <yxtbiz-upload moduleName='note' :env="deviceType" :maxCount="5" appCode='kng' functionName="YxtbizUpload" :fileList.sync="imageList"></yxtbiz-upload>
      <!-- <yxt-uploader class="mt12 pl15" v-model="imageList" multiple :after-read="afterRead" :max-count="5" @delete="deleteImage" :before-delete="beforeDelete"/> -->
    </div>
    <div class="noteedit-bottom noteedit clearfix ph15 pv12" v-show="hidshow">
      <yxt-checkbox class="pull-left clearfix" v-model="isOpened" v-if="canOpen">{{$t('kng_note_lbl_canopen')}}</yxt-checkbox>
      <yxt-checkbox class="pull-left ml20 clearfix"  v-if="showImportant" v-model="isImportant">{{$t('kng_note_lbl_setimportant')}}</yxt-checkbox>
      <div class="pull-right  clearfix"><yxt-button :disabled="canSave" size="small" round @click="saveNote">{{$t('kng_common_btn_save')}}</yxt-button></div>
    </div>
  </div>
</template>
<script>
import api from '@/service/knowledge.service.js'
import { Browser } from '@/configs/const'
// let Base64 = require('js-base64').Base64
export default {
  name: 'createeditNote',
  props: {},
  data () {
    return {
      deviceType: 'h5', // 使用方式，支持 'wx'、'yxt'、'ding'、'h5', 目前只支持前两个
      bottom_tip: true,
      autosize: { minHeight: 100 },
      showImportant: true,
      canOpen: true,
      noteInfo: {},
      noteId: '',
      mode: 'create', // 操作模式 edit 还是 create
      imageList: [],
      fileList: [],
      imageUrls: [],
      titleError: '',
      contentError: '',
      canSave: true,
      title: '',
      content: '',
      isOpened: false,
      isImportant: false,
      kngtype: 0,
      kngId: '',
      inputMessage: this.$t('kng_note_tip_content'),
      docmHeight: document.documentElement.clientHeight, // 默认屏幕高度
      showHeight: document.documentElement.clientHeight, // 实时屏幕高度
      hidshow: true // 显示或者隐藏footer
    }
  },
  mounted () {
    // window.onresize监听页面高度的变化
    window.onresize = () => {
      return (() => {
        this.showHeight = document.body.clientHeight
      })()
    }
  },
  created () {
    this.getDeviceType()
    let h = document.documentElement.clientHeight || document.body.clientHeight
    this.autosize.maxHeight = h * 0.5
    if (this.$route.query.noteId) {
      this.noteId = this.$route.query.noteId
      document.title = this.$t('kng_note_tit_editnote')
      this.mode = 'edit'
      // 获取数据
      api.getNote(this.noteId).then((res) => {
        this.noteInfo = res
        this.title = res.title
        this.content = res.content
        this.isOpened = res.opened === 1
        this.isImportant = res.important === 1
        this.kngtype = res.type
        this.kngId = res.kngId
        if (this.kngtype === 1) {
          this.showImportant = false
        }
        if (res.imageList) {
          for (let i = 0; i < res.imageList.length; i++) {
            let image = {
              url: res.imageList[i],
              isImage: true
            }
            this.imageList.push(image)
          }
          this.imageUrls = res.imageList
        }
        this.canSave = false
      })
    } else {
      document.title = this.$t('kng_note_tit_addnote')
      // 新增笔记 判断是知识笔记还是普通笔记
      if (this.$route.query.kngId) {
        this.kngId = this.$route.query.kngId
        this.kngtype = 1
        this.inputMessage = this.$t('kng_note_tip_inputcontent')
        if (this.$route.query.title) {
          this.title = this.$route.query.title
        }
        this.showImportant = false
      }
      this.noteInfo.imageList = []
      // 默认公开
      this.isOpened = true
      this.canSave = true
    }
    this.silenceconfigs()
  },
  methods: {
    input_click () {
      this.bottom_tip = false
    },
    input_blur () {
      setTimeout(() => {
        this.bottom_tip = true
      }, 300)
    },
    // 访问方式
    getDeviceType () {
      if (Browser.weixin) {
        this.deviceType = 'wx'
      } else if (window.yxtCore.isApp) {
        this.deviceType = 'yxt'
      } else if (Browser.dingtalk) {
        this.deviceType = 'ding'
      } else {
        this.deviceType = 'h5'
      }
      // alert(this.deviceType)
    },
    // 保存，离开此页面
    saveNote () {
      // 获取新组件的imagelist
      this.imageUrls = []
      if (this.imageList) {
        this.imageList.forEach(item => {
          let imageurl = item.url
          this.imageUrls.push(imageurl)
        })
      }
      this.loading = true
      let bodyParams = {
        opened: this.isOpened ? 1 : 0,
        title: this.title,
        type: this.kngtype,
        content: this.content,
        important: this.isImportant ? 1 : 0,
        id: this.noteInfo.id,
        imageList: this.imageUrls,
        fromApp: 1,
        kngId: this.kngId
      }
      // 新增
      if (this.mode === 'create') {
        api.postCreateNote(bodyParams).then((res) => {
          this.$toast.success(this.$t('kng_note_msg_success'))
          this.$router.go(-1)
        }).catch((e) => {
          this.$toast.fail(this.$t(e.error.key))
          // if (e.error.key === 'apis.note.validation.content.NotBlank') {
          //   this.$toast.fail(this.$t('kng_note_msg_success'))
          // }
          // if (e.error.key === 'apis.note.validation.title.NotBlank') {
          //   this.$toast.fail('笔记标题不可为空！')
          // }
        })
      } else {
        // 修改
        api.postUpdateNote(bodyParams).then((res) => {
          this.$toast.success(this.$t('kng_note_msg_editsuccess'))
          this.$router.go(-1)
        }).catch((e) => {
          this.$toast.fail(this.$t(e.error.key))
          // if (e.error.key === 'apis.note.validation.content.NotBlank') {
          //   this.$toast.fail('笔记内容不可为空！')
          // }
        }
          // this.$toast.fail('修改笔记失败')
        )
      }
    },
    afterRead (file) {
      // 此时可以自行将文件上传至服务器
      let name = file.file.name
      let linkParams = {
        filename: name,
        configkey: 'ImageConfigKey',
        isneedconvert: 0,
        buckettype: 1
      }
      api.postUploadMiniFile(linkParams, file.file).then((res) => {
        let imageUrl = res.fileDomain + res.fileKey
        this.imageUrls.push(imageUrl)
      }).catch()
      // let imageUrl = URL.createObjectURL(file)
      // this.noteInfo.imageList = file
    },
    // 删除图片
    beforeDelete (val) {
      let index = 0
      for (let i = 0; i < this.imageList.length; i++) {
        if (val === this.imageList[i]) {
          index = i
        }
      }
      this.imageUrls.splice(index, 1)
      return true
    },
    // 第三方接口--控制是否允许公开笔记(0-不允许 1-允许)
    silenceconfigs () {
      let linkParams = {
        orgId: window.getLocalStorage('orgId'),
        userId: window.getLocalStorage('userId')
      }
      api.getIsAllowKngUpload(linkParams).then(res => {
        this.noteShare = res.noteShare
        if (this.noteShare === 0) {
          this.canOpen = false
          if (this.mode === 'create') {
            this.isOpened = false
          }
        }
      })
    }
  },
  watch: {
    noteInfo (to, from) {
      this.noteInfo = to
    },
    title (to, from) {
      this.title = to
      if (this.title && this.content) {
        if (this.title.length > 0 && this.content.length > 0) {
          this.canSave = false
        } else {
          this.canSave = true
        }
      } else {
        this.canSave = true
      }
    },
    content (to, from) {
      this.content = to
      if (this.title && this.content) {
        if (this.title.length > 0 && this.content.length > 0) {
          this.canSave = false
        } else {
          this.canSave = true
        }
      } else {
        this.canSave = true
      }
    },
    imageList (to, from) {
      this.imageList = to
      // this.noteInfo.imageList = this.imageList
    },
    imageUrls (to, from) {
      this.imageUrls = to
    },
    showHeight () {
      if (this.docmHeight > this.showHeight) {
        this.hidshow = false
      } else {
        this.hidshow = true
      }
    }
  }
}
</script>
<style scoped lang="scss">
  .noteCreateEdit{
  /deep/ .yxt-icon-plus{font-size: 0.7rem}
    /deep/ .yxt-icon-delete{position: relative;
      top: -2.7rem;
      left: 2.2rem;}
    /deep/ .yxt-uploader__preview-image{width: 2.8rem;height: 2.8rem}
    /deep/ .yxt-uploader__upload{width: 2.8rem;height: 2.8rem}
  }
  /deep/
  .yxt-cell:not(:last-child).yxt-cell--inner::after, .yxt-cell:not(:last-child).yxt-cell--outer::after {
    right: 15px !important;
  }
  /deep/
  .yxt-field--textarea .yxt-cell__main {
    padding: 12px 0px !important;
  }
</style>
