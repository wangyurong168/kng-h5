import { publicRemoveRepeat, removeRepeatAndSetLocalStorage, storeKngStudying } from '@/core/utils'

/**
 * 倒计时相关 秒级提交
 * @type {{data(): {leaveTime: null, timeCount: number, tempTimersNum: null, isGetLeaveTime: boolean, reduceTime: null, timeAdd: null, timeOut: number}, methods: {pauseOperation(): void, continueTime(*): void, handlerSecondHour(): void, playOperation(): void, clearAllTimers(): void}}}
 */
export const countdownMixin = {
  data () {
    return {
      // numDown对象
      tempTimersNum: null, // 中间暂停时的值
      leaveTime: null, // 未学完学时
      reduceTime: null, // 时间减少计时器
      timeAdd: null, // 时间增加计时器
      timeCount: 0, // 实际在页面已经观看的时间
      isGetLeaveTime: false, // 是否算出剩余时间
      timeOut: 0, // 未向后台提交的时间
      lastMoveTime: new Date().getTime(), // 上次移动时间
      moveTime: null,
      tempNum: 1 // 播放时第一次不去处理学习进度,因为这时候可能还在loading中，loading结束后才开始倒计时
    }
  },
  mounted () {
    // 监听浏览器关闭事件
    window.onunload = () => {
      this.storeKngTime()
      // 清除所有计时器操作
      this.clearAllTimers()
      // 存储当前正在学
      storeKngStudying(this.kngId)
    }
    document.addEventListener('touchstart', this.watchMoveTime)
  },
  methods: {
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

    // 处理上一次提交的时间
    handlerSecondHour (kngId) {
      if (!kngId) {
        kngId = this.kngId
      }
      if (localStorage.playTimeArr && JSON.parse(localStorage.playTimeArr).length > 0) {
        let playTimeArr = JSON.parse(localStorage.playTimeArr) || []
        playTimeArr.forEach(item => {
          if (item.kngId === kngId) {
            // if (this.kngInfo.schedule !== 100) {
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
            // }
          }
        })
      }
      this.isGetLeaveTime = true
      console.log('取时间')
    },
    // 播放结束事件
    playend () {
      // this.$refs.numDown.clearTimer()
      // this.startTime = 0
      if (localStorage.playTimeArr) {
        let playArr = JSON.parse(localStorage.playTimeArr)
        playArr.map((item, index) => {
          if (item.kngId === this.kngId) {
            playArr.splice(index, 1)
          }
        })

        removeRepeatAndSetLocalStorage('playTimeArr', playArr)
      }
    },

    // 播放失败事件
    playError () {
      this.$refs.numDown.clearTimer()
    },
    // 播放操作
    playOperation (time) {
      this.isPause = false
      if (this.tempNum === 1) {
        this.tempNum++
      } else {
        this.continueTime(time)
      }
    },
    // 暂停操作
    pauseOperation () {
      this.isPause = true
      this.clearAllTimers()

      if (this.timeCount % this.submitTime > 0) { // 播放途中暂停了，比如从20播到17，还剩7秒提交，这个时候this.timeCount===3了，需要重置为0，再播7秒提交
        this.tempTimersNum = this.submitTime - this.timeCount % this.submitTime
        this.timeCount = 0
      } else {
        this.tempTimersNum = 0
      }
      console.log('暂停')
    },

    clearAllTimers () {
      this.reduceTime && window.clearInterval(this.reduceTime)
      this.timeAdd && window.clearInterval(this.timeAdd)
      setTimeout(() => {
        this.$refs.numDown && this.$refs.numDown.clearTimer()
        this.$refs.courseIframePlay && this.$refs.courseIframePlay.clearCourseNumDown()
      }, 0)
    },
    resetData () {
      // numDown对象
      this.tempTimersNum = null // 中间暂停时的值
      this.leaveTime = null // 未学完学时
      // this.reduceTime = null // 时间减少计时器
      // this.timeAdd = null // 时间增加计时器
      this.timeCount = 0 // 实际在页面已经观看的时间
      this.isGetLeaveTime = false // 是否算出剩余时间
      this.timeOut = 0 // 未向后台提交的时间
    },
    watchMoveTime () {
      document.addEventListener('touchstart', (e) => {
        this.lastMoveTime = new Date().getTime()
      })
    },
    // 进行每个知识的断点续播的存储
    storeKngTime () {
      let playTimeArr = []
      let playObj = {
        kngId: this.kngId,
        time: this.startTime,
        studyTime: this.timeCount // 记录知识播放的时间（还差几秒向后台提交的时间）
      }
      if (localStorage.playTimeArr) {
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
      let newArr = publicRemoveRepeat(playTimeArr)
      localStorage.setItem('playTimeArr', JSON.stringify(newArr))
    }
  },
  beforeDestroy () {
    this.clearAllTimers()
    this.moveTime && window.clearInterval(this.moveTime)
    this.storeKngTime()
    // 移除事件监听
    document.removeEventListener('touchstart', this.watchMoveTime)
  }
}
