import playArea from '@/views/kngDetailAudit/components/playArea'
import kngInfo from '@/views/kngDetailAudit/components/kngInfo'
import btnGroup from '@/views/kngDetailAudit/components/btnGroup'
import { kngTypeEnum } from '@/core/kngType'
import api from '@/service/kngDetail.service'
import { getPlaySrc } from '@/views/kngDetailAudit/config/utils'

// audio | doc | html | scorm | video | xuanyes 播放
export const AVMixin = {
  components: {
    playArea,
    kngInfo,
    btnGroup
  },
  data () {
    return {
      kngTypeEnum,
      kngId: this.$route.query.id, // 知识id
      courseId: this.$route.query.courseId, // 课程包id
      targetId: this.$route.query.targetId, // 项目或计划id
      targetCode: this.$route.query.targetCode, // 项目或计划名
      type: this.$route.query.type,
      taskType: this.$route.query.taskType, // 从项目过来审核的权限
      // 视频的参数
      playSrc: '', // 播放地址
      startTime: 0, // 开始播放时间
      // 其他参数
      isAddStudy: false, // 是否有加入学习按钮
      isShowProgress: false, // 是否显示进度
      kngInfo: {}, // 知识obj
      loading: false // 处理加载知识详情loading
    }
  },
  mounted () {
    this.getKngDetail()
  },
  methods: {
    // 设置知识详情请求参数
    setKngDetailParams () {
      let bodyParams = {
        id: this.kngId,
        preview: 1,
        targetId: this.targetId,
        targetCode: this.targetCode ? this.targetCode : 'kng'
      }

      if (!!this.taskType && this.targetCode === 'o2o') {
        bodyParams.taskType = this.taskType
      }

      if (this.taskType) {
        bodyParams.preview = 0
      }

      return bodyParams
    },
    // 获取知识详情
    async getKngDetail () {
      const bodyParams = this.setKngDetailParams()
      try {
        this.kngInfo = await api.postKngDetail(bodyParams)
        // 设置知识title
        document.title = this.kngInfo.title
        await this.postPlayStudy()
      } catch (err) {
        if (err.error.key) {
          let msg = this.error(err)
          this.Dialog.confirm({
            title: '提示',
            message: msg,
            confirmButtonText: '我知道了',
            closeOnPopstate: true,
            showCancelButton: false
          }).then(() => {
            this.$router.go(-1)
          })
        } else {
          console.log(err)
        }
      }
    },
    setPlayStudyParams () {
      let playParams = {
        clientType: 1, // 是否是h5
        id: this.kngInfo.id, // 知识id
        preview: 1, // 是否预览查看 0：否，1：预览
        targetId: this.targetId, // 项目id
        targetCode: this.targetCode // 来源code：目前（kng,o2o）
      }

      if (this.taskType) {
        playParams.preview = 0
      }

      return playParams
    },
    // 获取知识播放地址
    async postPlayStudy () {
      const bodyParams = this.setPlayStudyParams()
      let { playDetails } = await api.postPlayStudy(bodyParams)
      this.playSrc = getPlaySrc(playDetails)
      this.loading = true
    }
  }
}
