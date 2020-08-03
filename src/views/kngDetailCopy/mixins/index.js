import numDown from '@/views/kngDetail/components/numDown'
import kngInfo from '@/views/kngDetail/components/kngInfo'
import commentList from '@/views/kngDetail/components/commentList'
import kngAddStudy from '@/views/kngDetail/components/kngAddStudy'
import kngNoteList from '@/views/kngDetail/components/kngNoteList'
import { kngTypeEnum } from '@/core/kngType'
import api from '@/service/kngDetail.service'
import { getPlaySrc } from '@/views/kngDetailAudit/config/utils'
import { isNotEmpty, storeKngStudying } from '@/core/utils'

// audio | doc | html | scorm | video | xuanyes 播放
export const AVMixin = {
  components: {
    numDown,
    kngInfo,
    commentList,
    kngNoteList,
    kngAddStudy
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
      active: '0',
      isAddStudy: false, // 是否有加入学习按钮
      isShowProgress: false, // 是否显示进度
      kngInfo: {}, // 知识obj
      loading: false // 处理加载知识详情loading
    }
  },
  mounted () {
    // 监听浏览器关闭事件
    let that = this
    window.onunload = function (ev) {
      storeKngStudying(that.kngId)
    }
  },
  methods: {
    // 设置知识详情请求参数
    setKngDetailParams () {
      let bodyParams = {
        id: this.kngId,
        preview: 0,
        targetId: this.targetId,
        targetCode: this.targetCode ? this.targetCode : 'kng'
      }

      if (!!this.taskType && this.targetCode === 'o2o') {
        bodyParams.taskType = this.taskType
      }

      return bodyParams
    },
    // 获取知识详情
    async getKngDetail (fn) {
      const bodyParams = this.setKngDetailParams()
      try {
        const res = await api.postKngDetail(bodyParams)
        this.kngInfo = res
        this.isAddStudy = !res.addStudy
        this.isShowProgress = Boolean(res.addStudy)
        this.schedule = res.schedule
        // 设置知识title
        document.title = this.kngInfo.title
        this.loading = true
        // 判断是否开启多知识学习
        if (this.moreEnabled) {
          if (isNotEmpty(res.lastName)) {
            this.handleChangeStudy()
          }
        }
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
    // 处理学习改变
    handleChangeStudy () {
      this.Dialog.confirm({
        title: '提示',
        message: '系统在同一时间只记录一个知识的学习进度和学分，如果您选择切换观看新知识，则只会记录新知识的学习进度和学分',
        confirmButtonText: '切换到新知识',
        closeOnPopstate: true
      }).then(async () => {
        // 确定操作
        let bodyParams = {
          kngId: this.kngId
        }
        await api.postStudyChange(bodyParams)
      }).catch(() => {
        // 取消操作
        this.$router.go(-1)
      })
    },
    // 改变评分
    changeScoreNum (data) {
      this.kngInfo.avgCommentScore = data
    },
    // 获取是否加入学习
    getIsAdd (val) {
      this.isShowProgress = !val
      this.isAddStudy = val
    },

    setPlayStudyParams () {
      let playParams = {
        clientType: 1, // 是否是h5
        id: this.kngInfo.id, // 知识id
        preview: 0, // 是否预览查看 0：否，1：预览
        targetId: this.targetId, // 项目id
        targetCode: this.targetCode // 来源code：目前（kng,o2o）
      }

      return playParams
    },
    // 获取知识播放地址
    async postPlayStudy () {
      const bodyParams = this.setPlayStudyParams()
      let res = await api.postPlayStudy(bodyParams)
      this.playSrc = getPlaySrc(res.playDetails)
      this.getStartTime(res)
    },
    // 断点续播
    getStartTime (res) {
      if (localStorage.playTimeArr && JSON.parse(localStorage.playTimeArr).length > 0) {
        let playArr = JSON.parse(localStorage.playTimeArr)
        playArr.map(item => {
          if (item.kngId === this.kngId) {
            if (this.kngInfo.schedule === 100) {
              this.startTime = item.time
            } else {
              if (parseInt(res.viewLoc) > parseInt(item.time)) {
                this.startTime = res.viewLoc || 0
              } else {
                this.startTime = item.time || 0
              }
            }
          }
        })
      } else {
        if (this.kngInfo.schedule === 100) {
          this.startTime = 0
        } else {
          this.startTime = res.viewLoc || 0
        }
      }
      this.loading = true
    }
  },
  beforeDestroy () {
    // 存储当前正在学
    storeKngStudying(this.kngId)
  }
}
