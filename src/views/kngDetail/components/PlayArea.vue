<template>
  <!--音视频文档播放区域逻辑-->
  <div class="detail-play-container pr">
    <!-- 播放音频 -->
    <yxtbiz-video ref="video" width="100%" height="210px" :src="videoSrc" v-if="kngType === 'audio'"
                  :start="startTime"
                  :image="videoImage"
                  is-audio
                  @static-play="onStaticPlay"
                  @video-click="videoClick"
                  @time-change="onTimeChange"
                  @play="playOperation"
                  @pause="pauseOperation"
                  @ended="playend"
                  @error="playError">
      <!-- 播放的倒计时 -->
      <template v-if="!isAudit&&isGetLeaveTime" slot="tip">
        <num-down ref="numDown" :isShowProgress="isShowProgress"
                  :kngInfo="kngInfo"
                  :kngSchedule="schedule"
                  :timeOut="timeOut"
                  :showSlideBar="showSlideBar"
        ></num-down>
      </template>
    </yxtbiz-video>
    <!-- 播放视频 -->
    <yxtbiz-video ref="video" width="100%" height="210px" :src="videoSrc" v-if="kngType === 'video'"
                  :start="startTime"
                  :image="videoImage"
                  :watermark-config = "watermarkConfig"
                  @static-play="onStaticPlay"
                  @video-click="videoClick"
                  @time-change="onTimeChange"
                  @play="playOperation"
                  @pause="pauseOperation"
                  @ended="playend"
                  @error="playError">
      <!-- 播放的倒计时 -->
      <template v-if="!isAudit&&isGetLeaveTime" slot="tip">
        <num-down ref="numDown" :isShowProgress="isShowProgress"
                  :kngInfo="kngInfo"
                  :kngSchedule="schedule"
                  :timeOut="timeOut"
                  :showSlideBar="showSlideBar"
        ></num-down>
      </template>
    </yxtbiz-video>
    <!-- 播放文档 -->
    <yxtbiz-doc-viewer
      :file-list="docList" ref="docViewer" v-if="loadingPlay&&kngType === 'doc'" :start="startTime" height="210px" :watermark-config = "watermarkConfig"
      @page-change="onPageChange"
      @fullscreen-change="onFullscreenChange">
      <!-- 播放的倒计时 -->
      <template v-if="!isAudit && isGetLeaveTime" slot="tip">
        <num-down ref="numDown" :isShowProgress="isShowProgress"
                  :kngInfo="kngInfo"
                  :kngSchedule="schedule"
                  :timeOut="timeOut"
                  :showSlideBar="showSlideBar"
        ></num-down>
      </template>
    </yxtbiz-doc-viewer>
    <!-- h5封面 -->
    <div class="play-video-photo" v-show="showPhoto">
      <img :src="kngInfo.coverUrl" class="detail_play-coverUrl" v-if="Object.keys(kngInfo).length > 0">
      <div class="detail_mask"></div>
      <template v-if="!isAudit">
        <yxt-icon name="play-circle-o" class="detail_play_icon" v-if="!isShowProgress" @click="playVideo" />
        <div class="detail-play-study" v-if="isShowProgress && kngInfo.schedule === 0">
          <p class="text-white font-size-16">未开始学习</p>
          <yxt-button round size="medium" style="margin-top: 16px;" @click="playVideo">开始学习</yxt-button>
        </div>
        <div class="detail-play-study" v-if="isShowProgress && kngInfo.schedule !== 0">
          <yxt-button round size="medium" @click="playVideo">继续学习</yxt-button>
        </div>
      </template>
      <template v-else>
        <yxt-icon name="play-circle-o" class="detail_play_icon" @click="playVideo" />
      </template>
    </div>
  </div>
</template>

<script>
import api from '@/service/kngDetail.service'
import { isNotEmpty, storeKngStudying, removeRepeatAndSetLocalStorage } from '@/core/utils'
import numDown from '@/views/kngDetail/components/numDown'
export default {
  name: 'PlayArea',
  components: {
    numDown
  },
  props: {
    isShowProgress: { // 是否显示进度条
      type: Boolean,
      default: false
    },
    kngInfo: { // 知识详情
      type: Object
    },
    kngType: { // 知识类型
      type: String
    },
    kngConf: { // 防作弊配置
      type: Object
    }
  },
  data () {
    return {
      watermarkConfig: { // 文档水印相关
        enabled: 1, // 0-不启用 1-启用
        type: 0, // 0代表跑马灯，1代表水印
        fontSize: 20,
        color: '#DC143C',
        text: 'chxu（admin）自定义水印内容'
      },
      kngId: this.$route.query.id, // 知识id
      courseId: this.$route.query.courseId, // 课程包id
      targetId: this.$route.query.targetId, // 项目或计划id
      targetCode: this.$route.query.targetCode, // 项目或计划名
      type: this.$route.query.type,
      status: this.$route.query.status, // 是否是从审核页面过来
      taskType: this.$route.query.taskType, // 从项目过来审核的权限
      schedule: this.kngInfo.schedule,
      loadingPlay: false, // 处理加载知识播放地址loading
      // 视频的参数
      showPhoto: true,
      docList: [],
      videoSrc: '', // 播放地址
      videoImage: this.kngInfo.coverUrl, // 封面
      startTime: 0, // 开始播放时间
      getHour: false, // 是否请求倒计时开始
      lastName: '',
      isPause: false, // 是否播放器处于暂停状态
      loading: false, // 处理加载知识详情loading
      showSlideBar: false, // tip显示和隐藏
      // 播放接口返回的值
      playKngInfo: {}, // 播放的信息
      tempNum: 1, // 播放时第一次不去处理学习进度,因为这时候可能还在loading中，loading结束后才开始倒计时
      submitTime: this.kngInfo.submitTime, // 学时提交时间
      tempTimersNum: null, // 中间暂停时的值
      leaveTime: null, // 未学完学时
      reduceTime: null, // 时间减少计时器
      timeAdd: null, // 时间增加计时器
      timeCount: 0, // 实际在页面已经观看的时间
      timeOut: 0, // 未向后台提交的时间
      lastMoveTime: new Date().getTime(),
      moveTime: null,
      isGetLeaveTime: false // 是否算出剩余时间
    }
  },
  computed: {
    // 是否是从审核中那边过来的
    isAudit () {
      if (isNotEmpty(this.status)) {
        return this.status !== 4
      }
      return false
    }
  },
  mounted () {
    if (this.schedule !== 100) {
      this.leaveTime = this.kngInfo.studyHours - this.kngInfo.learnedHours
    }
    let that = this
    this.watchMoveTime()
    // 监听浏览器关闭事件
    window.onunload = () => {
      that.storeKngTime()
      // 清除所有计时器操作
      that.clearAllTimers()
      // 存储当前正在学
      storeKngStudying(that.kngId)
    }
  },
  methods: {
    // 封面地址取消,实际播放
    playVideo () {
      this.showPhoto = false
      this.$nextTick(() => {
        this.onStaticPlay()
        if (this.$refs.video) {
          this.$refs.video.play()
        }
        if (this.kngType === 'doc') {
          this.loadingPlay = true
          this.playOperation()
        }
      })
    },
    // 获取知识播放地址
    postPlayStudy () {
      let bodyParams = {
        clientType: 1, // 是否是h5
        id: this.kngInfo.id, // 知识id
        preview: 0, // 是否预览查看 0：否，1：预览
        targetId: this.targetId, // 项目id
        targetCode: this.targetCode // 来源code：目前（kng,o2o）
      }

      if (this.isAudit) {
        bodyParams.preview = 1
      }

      if (this.taskType) {
        bodyParams.preview = 0
      }
      api.postPlayStudy(bodyParams).then(res => {
        this.getWatermarkConfig(res, this.kngType)
        if (res.playDetails.length > 0) {
          this.playKngInfo = res
          if (this.kngType === 'doc') {
            this.docList = res.playDetails
          } else {
            this.videoSrc = res.playDetails[0].url
            // this.videoSrc = require('../../../static/video.mp4')
          }
          this.handlerSecondHour()
          this.getStartTime(res)
          if (this.kngType === 'doc') {
            this.tempNum++
          }
        }
      }).catch(err => {
        console.log(err)
      })
    },
    getWatermarkConfig (res, type) {
      if (res.watermarkConfig.enabled && res.watermarkConfig.type === 1) {
        this.watermarkConfig.enabled = 0
      } else {
        this.watermarkConfig.enabled = res.watermarkConfig.enabled
      }
      this.watermarkConfig.type = res.watermarkConfig.type
      this.watermarkConfig.text = res.watermarkConfig.watermarkContent
      if (type === 'doc') {
        this.watermarkConfig.fontSize = res.watermarkConfig.wordFontSize
        this.watermarkConfig.color = '#' + res.watermarkConfig.wordColor
        this.watermarkConfig.opacity = res.watermarkConfig.wordAlpha
      } else {
        this.watermarkConfig.opacity = res.watermarkConfig.otherAlpha
        this.watermarkConfig.fontSize = res.watermarkConfig.otherFontSize
        this.watermarkConfig.color = '#' + res.watermarkConfig.otherColor
      }
    },
    // 处理上一次未提交的时间
    handlerSecondHour () {
      if (localStorage.playTimeArr && JSON.parse(localStorage.playTimeArr).length > 0) {
        let playTimeArr = JSON.parse(localStorage.playTimeArr) || []
        playTimeArr.forEach(item => {
          if (item.kngId === this.kngId) {
            console.log(item.studyTime, 'item.studyTime111===')
            if ((parseInt(item.studyTime) % this.submitTime) === 0) {
              this.tempTimersNum = 0
            } else {
              this.tempTimersNum = this.submitTime - (parseInt(item.studyTime) % this.submitTime) // 取到还差几秒提交
              this.timeOut = parseInt(item.studyTime) % this.submitTime // 算出未向后台提交的时间
              if (this.kngInfo.schedule !== 100) { // 未学完有剩余学时
                this.leaveTime = this.leaveTime - this.timeOut // 算出倒计时的实际剩余时间
              } else {
                this.leaveTime = null
              }
            }
          }
        })
      }
      this.isGetLeaveTime = true
    },
    // 实际观看时间并处理学时的秒级提交
    continueTime (time) {
      if (time === 0 && this.kngInfo.schedule < 100) { // 标准学时为0，立马提交
        this.postKngSubmit()
      } else { // 标准学时不为0
        if (this.kngInfo.schedule < 100) { // 未学完的知识
          // 页面显示倒计时的处理
          setTimeout(() => {
            this.$refs.numDown && this.$refs.numDown.handleClick()
          }, 0)
          this.reduceTime = setInterval(() => {
            this.leaveTime-- // 剩余学时一直在减少
            if (this.leaveTime === 0) { // 当减为0时，停止计时
              clearInterval(this.reduceTime)
            }
          }, 1000)
        }
        this.timeAdd = setInterval(() => {
          if (this.schedule < 100) { // 未学完的知识
            if (this.leaveTime === 0) { // 时间一直减减，减到0，提交一把进度 把累加时间清0，重头开始计时
              this.postKngSubmit()
              this.timeCount = 0
              this.leaveTime = null
            }
          }
          this.timeCount++
          if (this.tempTimersNum > 0) { // 有缓存提交的时间
            console.log(this.timeCount, '有tempTimersNum', this.tempTimersNum)
            if (this.timeCount % this.submitTime === this.tempTimersNum) { // 第一次按未提交的剩余间隔提交
              this.postKngSubmit()
              this.tempTimersNum = null
              this.timeCount = 0
            }
          } else { // 没有缓存提交的时间
            console.log(this.timeCount, '没有tempTimersNum', this.tempTimersNum)
            if (this.timeCount > 0 && this.timeCount % this.submitTime === 0) { // 后面走正常的逻辑提交
              this.postKngSubmit()
            }
          }
        }, 1000)
      }
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
    },
    // 知识提交
    postKngSubmit () {
      let params = {
        kngId: this.kngId,
        targetCode: this.targetCode ? this.targetCode : 'kng',
        targetId: this.targetId,
        viewLoc: parseFloat(this.startTime)
      }
      api.postKngSubmitSecond(params).then(res => {
        console.log('提交了进度')
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
        if (this.schedule === 100) {
          this.playend()
        }
        this.$emit('changeShedule', this.schedule)
      }).catch(err => {
        if (err.error.key === 'apis.kng.study.needChange') {
          this.moveTime && window.clearInterval(this.moveTime)
          if (this.$refs.video) {
            this.$refs.video.pause()
          }
          if (this.kngType === 'doc') {
            this.pauseOperation()
          }
          this.handleChangeStudy()
        } else if (err.error.key === 'apis.kng.knowledge.hours.changed') {
          this.kngUpdate('本知识（课程）学时被更新，学习进度将被重置')
        } else if (err.error.key === 'apis.kng.knowledge.version.changed') {
          this.kngUpdate('本知识（课程）更新了新版本，建议您重新学习')
        }
        console.log(err)
      })
    },
    // 处理学时或者版本更新
    kngUpdate (tips) {
      this.moveTime && window.clearInterval(this.moveTime)
      if (this.$refs.video) {
        this.$refs.video.pause()
      }
      if (this.kngType === 'doc') {
        this.pauseOperation()
      }
      let bodyParams = {
        kngId: this.kngId
      }
      this.Dialog.confirm({
        title: '提示',
        message: tips,
        confirmButtonText: '我知道了',
        closeOnPopstate: true,
        showCancelButton: false
      }).then(() => {
        // 确定操作
        api.putkngVersionAlert(bodyParams).then(() => {
          /* eslint-disable no-new */
          new Promise((resolve, reject) => {
            this.$emit('getDetal')
            setTimeout(() => {
              resolve(true)
            }, 1000)
          }).then(() => {
            console.log(this.kngInfo.learnedHours, 'this.kngInfo.learnedHours===')
            this.$refs.numDown.restMinutes()
            if (this.schedule !== 100) {
              this.leaveTime = this.kngInfo.studyHours - this.kngInfo.learnedHours
            }
            this.handleTime()
          })
        }).catch(err => {
          console.log(err)
        })
      }).catch(() => {
        // 取消操作
        this.$router.go(-1)
      })
    },
    // 关闭防挂机
    handleTime () {
      if (this.kngConf.enabled) {
        this.handlerKng(1000)
      }
      if (this.isPause && this.$refs.video) {
        this.$refs.video.play()
      }
      if (this.kngType === 'doc') {
        this.isPause = false
        if (!this.studyDialog) {
          this.playOperation()
        }
      }
    },
    // 处理学习知识改变即知识id改变
    handleChangeStudy () {
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
        api.postStudyChange(bodyParams).then(() => {
          this.handleTime()
        }).catch(err => {
          console.log(err)
        })
      }).catch(() => {
        // 取消操作
        this.$router.go(-1)
      })
    },
    // 处理tip
    handleTip () {
      if (!this.showSlideBar) {
        this.showSlideBar = true
      }
    },
    // 点击中间播放进行的事件
    onStaticPlay () {
      if (!this.isAudit) {
        this.handleTip()
        // 1开启，0未开启 播放后开始防挂机的监控
        if (this.kngConf.moreEnabled) {
          this.handlerKng()
        }
      }
    },
    // 页码切换事件
    onPageChange (page) {
      this.startTime = page
    },
    // 播放器全屏事件
    onFullscreenChange (fullscreen) {},
    // 播放进度change事件
    onTimeChange (time) {
      this.startTime = time
      if (time > 0) { // 此刻loading才结束
        this.getHour = true
      }
    },
    // 视频点击
    videoClick () {
      if (!this.isAudit) {
        this.handleTip()
      }
    },
    // 播放结束事件
    playend () {
      if (!this.isAudit) {
        this.$refs.numDown.clearTimer()
        this.startTime = 0
        if (localStorage.playTimeArr && JSON.parse(localStorage.playTimeArr).length > 0) {
          let playArr = JSON.parse(localStorage.playTimeArr)
          playArr.map((item, index) => {
            if (item.kngId === this.kngId) {
              playArr.splice(index, 1)
            }
          })
          removeRepeatAndSetLocalStorage('playTimeArr', playArr)
        }
      }
    },
    // 播放失败事件
    playError () {
      if (!this.isAudit) {
        this.$refs.numDown.clearTimer()
      }
    },
    // 播放操作
    playOperation () {
      if (!this.isAudit) {
        this.isPause = false
        if (this.tempNum === 1) {
          this.tempNum++
        } else {
          this.continueTime(this.kngInfo.studyHours)
        }
      }
    },
    // 暂停操作
    pauseOperation () {
      if (!this.isStudy) {
        this.isPause = true
        this.clearAllTimers()
        if (this.timeCount % this.submitTime > 0) { // 播放途中暂停了，比如从20播到17，还剩7秒提交，这个时候this.timeCount===3了，需要重置为0，再播7秒提交
          this.tempTimersNum = this.submitTime - this.timeCount % this.submitTime
          this.timeCount = 0
        } else {
          this.tempTimersNum = 0
        }
        console.log('暂停')
      }
    },
    watchMoveTime () {
      if (!this.isAudit) {
        document.addEventListener('touchstart', (e) => {
          this.lastMoveTime = new Date().getTime()
        })
      }
    },
    // 处理防挂机
    handlerKng (num) {
      let restTime = 10000
      if (num) {
        restTime = num
      }
      this.moveTime = setInterval(() => {
        let nowTime = new Date().getTime()
        if ((nowTime - this.lastMoveTime) > (this.kngConf.maxMin * 60 * 1000)) {
          window.clearInterval(this.moveTime)
          if (!this.isPause && this.$refs.video) {
            this.$refs.video.pause() // 视频暂停
          }
          if (this.kngType === 'doc') {
            this.pauseOperation()
          }
          this.Dialog.confirm({
            title: '提示',
            message: this.kngConf.tips,
            confirmButtonText: '继续学习',
            closeOnPopstate: true,
            showCancelButton: false
          }).then(() => {
            // 视频播放
            if (this.isPause && this.$refs.video) {
              this.$refs.video.play()
            }
            if (this.kngType === 'doc') {
              this.playOperation()
            }
            // 点击继续学习调自己
            if (this.kngConf.enabled) {
              this.handlerKng()
            }
          }).catch(() => {
            // 取消操作
          })
        }
      }, restTime)
    },
    clearAllTimers () {
      this.reduceTime && window.clearInterval(this.reduceTime)
      this.timeAdd && window.clearInterval(this.timeAdd)
      setTimeout(() => {
        this.$refs.numDown && this.$refs.numDown.clearTimer()
      }, 0)
    },
    // 进行每个知识的断点续播的存储
    storeKngTime () {
      let playTimeArr = []
      let playObj = {
        kngId: this.kngId,
        time: this.startTime,
        studyTime: this.timeCount // 记录知识播放的时间（还差几秒向后台提交的时间）
      }
      if (localStorage.playTimeArr && JSON.parse(localStorage.playTimeArr).length > 0) {
        playTimeArr = JSON.parse(localStorage.playTimeArr)
        playTimeArr.map(item => {
          if (item.kngId !== playObj.kngId) {
            playTimeArr.push(playObj)
          } else {
            item.time = playObj.time
            item.studyTime = playObj.studyTime
          }
        })
      } else {
        playTimeArr.push(playObj)
      }
      removeRepeatAndSetLocalStorage('playTimeArr', playTimeArr)
    }
  },
  watch: {
    getHour (v) {
      if (v && !this.isAudit) {
        this.playOperation()
      }
    }
  },
  beforeDestroy () {
    if (!this.isAudit) {
      // 清除所有计时器操作
      this.clearAllTimers()
      this.moveTime && window.clearInterval(this.moveTime)
      // 进行每个知识的断点续播的存储
      this.storeKngTime()
      // 存储当前正在学
      storeKngStudying(this.kngId)
      // 移除事件监听
      document.removeEventListener('touchstart', (e) => {
        this.lastMoveTime = new Date().getTime()
      })
    }
  }
}
</script>
