<template>
  <div class="hp-100 wp-100 scorm-detail pr over-hidden" v-if="loading">
    <num-down ref="numDown" v-show="(isAddStudy || targetId) && isScorm"
              :kngInfo="kngInfo"
              :kngSchedule="schedule"></num-down>
    <iframe class="scorm-iframe over-hidden hp-100 wp-100"
      frameborder="0"
      scrolling="auto"
      allowfullscreen="true"
      webkitallowfullscreen="true"
      mozallowfullscreen="true"
      :src="url"></iframe>
    <yxtbiz-watermark style="z-index: 11;" :option="option"></yxtbiz-watermark>
  </div>
</template>

<script>
import api from '@/service/kngDetail.service'
import numDown from '@/views/kngDetail/components/docNumDown'
import { getUrl } from '@/core/utils'
import { countdownMixin } from '@/views/kngDetailCopy/mixins/countdown'
import { watermarkConfigMixin } from '@/views/kngDetailCopy/mixins/waterConfig'

export default {
  mixins: [countdownMixin, watermarkConfigMixin],
  components: {
    numDown
  },
  props: {
    type: {
      type: String
    }
  },
  data () {
    return {
      kngId: this.$route.query.id, // 知识id
      courseId: this.$route.query.courseId, // 课程包id
      targetId: this.$route.query.targetId, // 项目或计划id
      targetCode: this.$route.query.targetCode, // 项目或计划名
      status: this.$route.query.status, // 是否是从审核页面过来
      taskType: this.$route.query.taskType, // 从项目过来审核的权限
      kngInfo: {},
      schedule: 0,
      loading: false,
      isAddStudy: '', // 是否加入学习
      courseVersion: 1, // 是否是标准scorm 0代表不是，其他代表是
      // numDown对象
      delayNum: 15, // 学时为1时，处理倒计时控制暂停、再继续
      tempDelayNum: 0, // 学时为1时，倒计时的重新赋值
      timersNum: 120, // 学时大于等于2时，处理倒计时控制暂停、再继续
      // 计时器类型
      delayTimer: null,
      delayTimeHandle: null,
      timers: null,
      timersHandle: null,
      // 中间暂停时的计时器
      pauseDelayTimer: null,
      pauseDelayTimeHandle: null,
      pauseTimers: null,
      pauseTimersHandle: null,
      // 防作弊配置
      kngConf: {}, // 防作弊配置对象
      url: '',
      studyTimers: null, // 提示是否离开
      option: {},

      // numDown对象
      submitTime: 0 // 学时提交时间
    }
  },
  computed: {
    isScorm () {
      // scorm页面 + 非标准scorm = true  标准scorm走内部学时
      if (this.$route.path.includes('/scorm/')) {
        return this.courseVersion === 0
      }
      return true
    }
  },
  created () {
    this.getKngConf()
  },
  methods: {
    // 获取防作弊配置
    getKngConf () {
      api.getKngConf().then(res => {
        this.kngConf = res
      }).then(() => {
        // 获取知识详情
        this.getKngDetail()
      }).catch(err => {
        console.log(err)
      })
    },
    // 处理防作弊
    handlerConf (res) {
      let { enabled, maxMin, tips } = res
      if (enabled) {
        this.moveTime = setInterval(() => {
          window.clearInterval(this.moveTime)
          // 文档暂停
          if (!this.isPause) {
            this.pauseOperation()
          }

          this.Dialog.confirm({
            title: '提示',
            message: tips,
            confirmButtonText: '继续学习',
            closeOnPopstate: true,
            showCancelButton: false
          }).then(() => {
            if (this.$route.name === 'ScormHtmlPlay') {
              // 文档播放
              if (this.isPause) {
                this.playOperation(this.kngInfo.studyHours)
              }
              // 点击继续学习调自己
              this.handlerConf(res)
            }
          }).catch(() => {
            // 取消操作
          })
        }, maxMin * 60 * 1000)
      }
    },
    // 获取知识详情
    getKngDetail () {
      this.show = false
      let bodyParams = {
        id: this.kngId,
        preview: 0,
        targetId: this.targetId,
        targetCode: this.targetCode ? this.targetCode : 'kng'
      }

      if ((this.taskType !== undefined || this.taskType !== null) && this.targetCode === 'o2o') {
        bodyParams.taskType = this.taskType
      }

      api.postKngDetail(bodyParams).then(res => {
        this.kngInfo = res
        this.isAddStudy = this.kngInfo.addStudy === 1
        this.courseVersion = this.kngInfo.courseVersion
        this.leaveTime = this.kngInfo.studyHours - this.kngInfo.learnedHours
        this.submitTime = this.kngInfo.submitTime // 学时提交时间
        // 设置知识title
        document.title = this.kngInfo.title
        this.schedule = res.schedule
        this.loading = true
        // 判断是否开启多知识学习,默认应该不在审核中才会去校验
        if (this.kngConf.moreEnabled) {
          this.lastName = res.lastName
          if (this.lastName !== null && this.lastName !== undefined) {
            this.handleChangeStudy()
          }
        }
      }).then(() => {
        let playParams = {
          clientType: 1, // 是否是h5
          id: this.kngInfo.id, // 知识id
          preview: 0, // 是否预览查看 0：否，1：预览
          targetId: this.targetId, // 项目id
          targetCode: this.targetCode // 来源code：目前（kng,o2o）
        }

        this.postPlayStudy(playParams)
      }).catch(err => {
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
      })
    },
    // 获取知识播放地址
    postPlayStudy (bodyParams) {
      api.postPlayStudy(bodyParams).then(res => {
        if (res.kngType === 5) {
          let url = res.playDetails[0].url
          let htmlUrl = ''
          if (res.courseChapterContent && res.courseChapterContent.length > 0) {
            htmlUrl = res.courseChapterContent[0].chapterHref
          }
          let preview = 0
          this.url = getUrl() + `media/scorm/scowrapperstudy.html?sco=${url}${htmlUrl}&token=${localStorage.token}&source=504&kngId=${this.kngId}&preview=${preview}&targetId=${this.targetId}&targetCode=${this.targetCode}`
        } else if (res.kngType === 6) {
          this.url = res.playDetails[0].url
        }
        return res
      }).then((data) => {
        // scorm - 5 非标准的
        if (data.kngType === 5 || data.kngType === 6) {
          // 是否不套iframe:1 是(不嵌套) 0 否（嵌套）
          if (this.kngInfo.noIframe) {
            if (this.kngInfo.schedule !== 100) {
              this.postKngSubmit(1)
              return
            }
          }

          if (data.kngType === 5 && this.kngInfo.courseVersion !== 0) {
            return
          }
        }

        this.handlerSecondHour()
        this.playOperation(this.kngInfo.studyHours)
        // 播放进行学时学分计算
        this.handlerConf(this.kngConf)
      }).catch(err => {
        console.log(err)
      })
    },
    // 知识提交
    postKngSubmit (isEnd) {
      let params = {
        kngId: this.kngId,
        targetCode: this.targetCode ? this.targetCode : 'kng',
        targetId: this.targetId,
        viewLoc: parseFloat(this.startTime)
      }
      if (isEnd === 1) {
        params.end = 1
      }
      api.postKngSubmitSecond(params).then(res => {
        // 学时不为0，如果学时为0，则进度一直为0
        if (res.studyHours !== 0) {
          if (res.acqHours === res.studyHours) {
            this.schedule = 100
          } else {
            this.schedule = Number(((res.acqHours / res.studyHours) * 100).toFixed(2))
          }
        } else {
          this.schedule = 0
        }
      }).catch(err => {
        if (err.error.key === 'apis.kng.study.needChange') {
          this.handleChangeStudy(isEnd)
        }
        console.log(err)
      })
    },
    // 处理学习改变
    handleChangeStudy (isEnd) {
      this.Dialog.confirm({
        title: '提示',
        message: '系统在同一时间只记录一个知识的学习进度和学分，如果您选择切换观看新知识，则只会记录新知识的学习进度和学分',
        confirmButtonText: '切换到新知识',
        closeOnPopstate: true
      }).then(() => {
        // 确定操作
        let bodyParams = {
          kngId: this.kngId
        }
        api.postStudyChange(bodyParams).then().catch(err => {
          console.log(err)
        })
      }).catch(() => {
        // 取消操作
        this.$router.go(-1)
      })
    }
  }
}
</script>
