import { kngTypeEnum } from '@/core/kngType'
import api from '@/service/kngDetail.service'

// 防作弊配置等
export const kngConfigMixin = {
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
      loading: false, // 处理加载知识详情loading
      // 防作弊配置
      kngConf: {}, // 防作弊配置对象
      studyTimers: null, // 提示是否离开
      moreEnabled: 0 // 多知识学习开关是否开启
    }
  },
  async mounted () {
    await this.getKngConf()
    await this.handleVersion()
  },
  methods: {
    // 获取防作弊配置
    async getKngConf () {
      const res = await api.getKngConf()
      this.kngConf = res
      this.moreEnabled = res.moreEnabled
    },
    // 处理版本问题
    async handleVersion () {
      let bodyParams = {
        kngId: this.kngId
      }
      await api.postKngVersionAlert(bodyParams).then(versionObj => {
        this.deleteDetail()
      }).catch(err => {
        if (err.error.key === 'apis.kng.knowledge.hours.changed') {
          this.updateHandler(bodyParams, 'hour')
        } else if (err.error.key === 'apis.kng.knowledge.version.changed') {
          this.updateHandler(bodyParams, 'version')
        }
      })
    },
    // 删除判断之前学的是不是当前新打开的这个
    async deleteDetail () {
      if (localStorage.playStudyArr) {
        let playStudyArr = JSON.parse(localStorage.playStudyArr)
        if (playStudyArr.length > 0) {
          let bodyParams = {
            ids: playStudyArr.join(',')
          }
          await api.postDeleteStudy(bodyParams)
          localStorage.removeItem('playStudyArr')
        }
      }

      this.getKngDetail()
    },
    updateHandler (bodyParams, flag) {
      const Mapper = {
        hour: {
          msg: '本知识（课程）学时被更新，学习进度将被重置'
        },
        version: {
          msg: '本知识（课程）更新了新版本，建议您重新学习'
        }
      }
      this.Dialog.confirm({
        title: '提示',
        message: Mapper[flag].msg,
        confirmButtonText: '我知道了',
        closeOnPopstate: true,
        showCancelButton: false
      }).then(async () => {
        await this.clearVersion(bodyParams)
      }).catch(() => {
        // 取消操作
        this.$router.go(-1)
      })
    },
    async clearVersion (params) {
      // 确定操作
      await api.putkngVersionAlert(params)
      this.getKngDetail()
    }
  }
}
