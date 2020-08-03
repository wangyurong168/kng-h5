<template>
   <div class="noteCreateEdit">
    <div>
      <yxt-cell-group>
        <yxt-field
          v-model="content"
          placeholder="笔记随时记~"
          input-align="left"
          type="textarea"
          :autosize='autosize'
          @blur='input_blur'
          @click="input_click"
        />
      </yxt-cell-group>
      <!-- <yxtbiz-upload moduleName='note' appCode='kng' functionName="YxtbizUpload" :fileList.sync="fileList"></yxtbiz-upload> -->
      <yxt-uploader class="mt12 ph15" v-model="imageList" multiple :after-read="afterRead" :max-count="5" @delete="deleteImage" :before-delete="beforeDelete"/>
    </div>
    <div class="noteedit-bottom noteedit clearfix ph15 pv12" v-show="hidshow">
      <yxt-checkbox class="pull-left clearfix" v-model="isOpened" v-if="canOpen">允许公开</yxt-checkbox>
      <yxt-checkbox class="pull-left ml20 clearfix"  v-if="showImportant" v-model="isImportant">设为重要</yxt-checkbox>
      <div class="pull-right clearfix"><yxt-button :disabled="canSave" size="small" round @click="saveNote">保存</yxt-button></div>
    </div>
  </div>
</template>

<script>
import api from '@/service/knowledge.service.js'
export default {
  name: 'addNote',
  props: {
    kngId: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      bottom_tip: true,
      autosize: { minHeight: 100 },
      showImportant: false,
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
      content: '',
      isOpened: false,
      isImportant: false,
      kngtype: 1,
      docmHeight: document.documentElement.clientHeight, // 默认屏幕高度
      showHeight: document.documentElement.clientHeight, // 实时屏幕高度
      hidshow: true // 显示或者隐藏footer
    }
  },
  created () {
    let h = document.documentElement.clientHeight || document.body.clientHeight
    this.autosize.maxHeight = h * 0.5
    this.noteInfo.imageList = []
    // 默认公开
    this.isOpened = true
    this.canSave = true
    this.silenceconfigs()
  },
  mounted () {
    // window.onresize监听页面高度的变化
    window.onresize = () => {
      return (() => {
        this.showHeight = document.body.clientHeight
      })()
    }
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
    clear () {
      this.content = ''
      this.isOpened = true
      this.isImportant = false
      this.canSave = true
      this.imageList = []
      this.imageUrls = []
      this.fileList = []
      this.titleError = ''
      this.contentError = ''
    },
    // 保存，离开此页面
    saveNote () {
      this.loading = true
      let bodyParams = {
        opened: this.isOpened ? 1 : 0,
        title: this.title,
        type: this.kngtype,
        content: this.content,
        important: this.isImportant ? 1 : 0,
        imageList: this.imageUrls,
        fromApp: 1,
        kngId: this.kngId, // 知识id
        targetId: this.$route.path.split('/')[1] === 'course' ? this.$route.query.courseId : ''// 课程id
      }
      // 新增
      api.postCreateNote(bodyParams).then((res) => {
        this.$toast.success('新增笔记成功！')
        this.$emit('close')
        this.$emit('getList')
        this.clear()
        // this.$router.go(-1)
      }).catch((e) => {
        if (e.error.key === 'apis.note.validation.content.NotBlank') {
          this.$toast.fail('笔记内容不可为空！')
        }
        if (e.error.key === 'apis.note.validation.title.NotBlank') {
          this.$toast.fail('笔记标题不可为空！')
        }
      })
      // this.$toast.fail('新增笔记失败')
      // if (this.mode === 'create') {
      //   api.postCreateNote(bodyParams).then((res) => {
      //     this.$router.go(-1)
      //   }).catch(
      //     // this.$toast.fail('新增笔记失败')
      //   )
      // } else {
      //   // 修改
      //   api.postUpdateNote(bodyParams).then((res) => {
      //     this.$router.go(-1)
      //   }).catch(
      //     // this.$toast.fail('修改笔记失败')
      //   )
      // }
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

<style lang="scss">
.noteCreateEdit {
  .yxt-icon-plus {
    font-size: 0.7rem;
  }
  .yxt-icon-delete {
    position: relative;
    top: -2.7rem;
    left: 2.2rem;
  }
  .yxt-uploader__preview-image,
  .yxt-uploader__upload {
    width: 2.8rem;
    height: 2.8rem;
  }
}
</style>
