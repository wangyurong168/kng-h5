<template>
  <div class="hp-100 wp-100 scorm-detail pr over-hidden" v-if="loading">
    <template v-if="!isAudit">
      <num-down ref="numDown" v-show="(isAddStudy || targetId) && isScorm" :kngInfo="kngInfo" :kngSchedule="schedule"></num-down>
    </template>
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
import fileApi from '@/service/knowledge.service.js'
import numDown from '@/views/kngDetail/components/docNumDown'
import { getUrl, storeKngStudying } from '@/core/utils'
export default {
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
      tempTimersNum: 0, // 学时大于等于2时，倒计时的重新赋值
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
      option: {}
    }
  },
  computed: {
    isScorm () {
      // scorm页面 + 非标准scorm = true  标准scorm走内部学时
      if (this.$route.path.includes('/scorm/')) {
        return this.courseVersion === 0
      }
      return true
    },
    // 是否是从审核中那边过来的
    isAudit () {
      if (this.status !== '' && this.status !== undefined && this.status !== null) {
        return this.status !== 4
      }
      return false
    }
  },
  created () {
    if (!this.isAudit) {
      this.getKngConf()
    } else {
      this.getKngDetail()
    }
  },
  mounted () {
    // 监听浏览器关闭事件
    let that = this
    window.onunload = function (ev) {
      storeKngStudying(that.kngId)
    }
    this.getWatermarkConfig()
  },
  methods: {
    getWatermarkConfig () {
      fileApi.getWatermarkConfig().then(res => {
        if (res.enabled) {
          this.option.enabled = 1
          if (res.type === 1) {
            this.option.type = 1
          } else {
            this.option.type = 0
          }
          this.option.text = res.watermarkContent
          this.option.color = '#' + res.otherColor
          this.option.opacity = res.otherAlpha
          this.option.fontSize = res.otherFontSize
        } else {
          this.option.enabled = 0
        }
      }).catch(err => {
        console.log(err)
      })
    },
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
        this.studyTimers = setInterval(() => {
          window.clearInterval(this.studyTimers)
          this.pauseOperation()

          this.Dialog.confirm({
            title: '提示',
            message: tips,
            confirmButtonText: '继续学习',
            closeOnPopstate: true,
            showCancelButton: false
          }).then(() => {
            if (this.$route.name === 'ScormHtmlPlay') {
              this.playOperation()
              // 点击继续学习调自己
              this.handlerConf(res)
            }
          }).catch(() => {
            // 取消操作
          })
        }, maxMin * 6 * 1000)
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

      if (this.isAudit) {
        bodyParams.preview = 1
      }

      if (this.taskType) {
        bodyParams.preview = 0
      }

      if ((this.taskType !== undefined || this.taskType !== null) && this.targetCode === 'o2o') {
        bodyParams.taskType = this.taskType
      }

      api.postKngDetail(bodyParams).then(res => {
        this.kngInfo = res
        this.isAddStudy = this.kngInfo.addStudy === 1
        this.courseVersion = this.kngInfo.courseVersion
        // 设置知识title
        document.title = this.kngInfo.title
        this.schedule = res.schedule
        this.loading = true
      }).then(() => {
        let playParams = {
          clientType: 1, // 是否是h5
          id: this.kngInfo.id, // 知识id
          preview: 0, // 是否预览查看 0：否，1：预览
          targetId: this.targetId, // 项目id
          targetCode: this.targetCode // 来源code：目前（kng,o2o）
        }

        if (this.isAudit) {
          playParams.preview = 1
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
          if (this.status !== '' && this.status !== undefined && this.status !== null) {
            if (parseInt(this.status) === 2 || parseInt(this.status) === 3) {
              preview = 1
            }
          }
          if (!this.isStudy) {
            preview = 1
          }
          if (this.taskType) {
            preview = 0
          }
          this.url = getUrl() + `media/scorm/scowrapperstudy.html?sco=${url}${htmlUrl}&token=${localStorage.token}&source=504&kngId=${this.kngId}&preview=${preview}&targetId=${this.targetId}&targetCode=${this.targetCode}`
        } else if (res.kngType === 6) {
          this.url = res.playDetails[0].url
        } else if (res.kngType === 4) { // 绚课
          let htmlUrl = ''
          if (res.playDetails && res.playDetails.length > 0) {
            res.playDetails.forEach((item, index) => {
              if (item.desc === 'signUrl') {
                htmlUrl = item.url
              }
            })
          }
          this.url = htmlUrl
        }
        return res
      }).then((data) => {
        if (!this.isAudit) {
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

          // 播放进行学时学分计算
          this.handerStudyHour(this.kngInfo.studyHours)

          this.handlerConf(this.kngConf)
        }
      }).catch(err => {
        console.log(err)
      })
    },
    // 处理学时提交
    handerStudyHour (time, source) {
      if (time === 0) {
        if (source !== 'play' && this.kngInfo.schedule !== 100) {
          // 学时为0，立刻提交
          this.postKngSubmit()
        }
      } else if (time > 0 && time < 2) {
        // 15秒提交一次
        this.delayTimer = setTimeout(() => {
          this.delayTimer = 0

          if (this.schedule !== 100) {
            this.postKngSubmit()
          }
          window.clearInterval(this.delayTimeHandle)
          this.delayNum = 15
        }, 15 * 1000)
        // 处理15倒计时
        this.delayTimeHandle = setInterval(() => {
          this.delayNum--
        }, 1000)
      } else if (time >= 2) {
        // 2分钟提交一次
        this.timers = setInterval(() => {
          this.postKngSubmit()
          this.timersNum = 120
        }, 2 * 60 * 1000)
        // 处理120倒计时
        this.timersHandle = setInterval(() => {
          this.timersNum--
        }, 1000)
      }
    },
    // 知识提交
    postKngSubmit (isEnd) {
      let params = {
        kngId: this.kngId,
        targetCode: this.targetCode ? this.targetCode : 'kng',
        targetId: this.targetId,
        viewLoc: parseFloat(this.playTime)
      }
      if (isEnd === 1) {
        params.end = 1
      }
      api.postKngSubmitSecond(params).then(res => {
        this.schedule = (res.acqHours / res.studyHours) * 100
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
    },
    playOperation () {
      // 倒计时的处理
      setTimeout(() => {
        if (this.$refs.numDown) {
          this.$refs.numDown.handleClick()
        }
      }, 0)

      if (this.kngInfo.studyHours >= 2) {
        this.pauseTimers = setTimeout(() => {
          this.pauseTimers = 0
          this.postKngSubmit()
          clearInterval(this.pauseTimersHandle)
        }, this.tempTimersNum * 1000)
        // 处理120倒计时
        this.pauseTimersHandle = setInterval(() => {
          this.timersNum--
        }, 1000)

        // 在提交完成后去处理再一次学习的提交
        if (this.timersNum === 1) {
          this.timersNum = 120
          this.clearAllTimers()

          this.handerStudyHour(this.kngInfo.studyHours, 'play')
        }
      } else if (this.kngInfo.studyHours > 0 && this.kngInfo.studyHours < 2) {
        if (this.schedule !== 100) {
          this.pauseDelayTimer = setTimeout(() => {
            this.postKngSubmit()
            clearInterval(this.pauseDelayTimeHandle)
          }, this.tempDelayNum * 1000)

          this.pauseDelayTimeHandle = setInterval(() => {
            this.delayNum--
          }, 1000)

          if (this.delayNum === 1) {
            this.delayNum = 15
            this.clearAllTimers()
            // 15秒提交因为就提交一次，所以只需要暂停时候提交上一次的
          }
        }
      } else if (this.kngInfo.studyHours === 0) {
        // 由于进页面有其他知识学习提交失败，再次点击切换该知识时，进度不为100时再次做提交
        if (this.kngInfo.schedule !== 100) {
          this.postKngSubmit()
        }
      }
    },
    pauseOperation () {
      this.clearAllTimers()

      if (this.kngInfo.studyHours > 0 && this.kngInfo.studyHours < 2) {
        this.tempDelayNum = this.delayNum
      } else if (this.kngInfo.studyHours >= 2) {
        this.tempTimersNum = this.timersNum
      }
    },
    clearAllTimers () {
      // 清除2个计时器处理
      if (this.delayTimer > 0) {
        window.clearTimeout(this.delayTimer)
      }
      this.delayTimeHandle && window.clearInterval(this.delayTimeHandle)

      // 大于0学时，小于2学时，清除学习进度
      this.pauseDelayTimer && window.clearTimeout(this.pauseDelayTimer)
      this.pauseDelayTimeHandle && window.clearInterval(this.pauseDelayTimeHandle)

      // 大于0学时，小于2学时，清除学习进度
      this.timers && window.clearInterval(this.timers)
      this.timersHandle && window.clearInterval(this.timersHandle)

      setTimeout(() => {
        if (this.$refs.numDown) {
          this.$refs.numDown.clearTimer()
        }
      }, 0)
    }
  },
  beforeDestroy () {
    this.clearAllTimers()

    this.studyTimers && window.clearInterval(this.studyTimers)
    // 存储当前正在学
    storeKngStudying(this.kngId)
  }
}
</script>
