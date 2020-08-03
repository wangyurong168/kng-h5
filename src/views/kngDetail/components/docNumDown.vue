<template>
  <div v-show="showSlideBar && isShowProgress">
    <div class="font-size-13 num-down-iframe" v-if="isNotComplete">
      还需
      <div class="d-in-block" v-if="isShowDay">
        <span class="text-ffA100">&nbsp;{{ d }}&nbsp;</span>天
      </div>
      <div class="d-in-block" v-if="isShowHour">
        <span class="text-ffA100">&nbsp;{{ h }}&nbsp;</span>小时
      </div>
      <div class="d-in-block" v-if="isShowMinutes">
        <span class="text-ffA100">&nbsp;{{ m }}&nbsp;</span>分钟
      </div>
      <div class="d-in-block">
        <span class="text-ffA100">&nbsp;{{ s }}&nbsp;</span>秒
      </div>
      可完成学习，加油！
    </div>
    <div class="font-size-13 num-down-iframe" v-else>恭喜您已完成本知识的学习。</div>
  </div>
</template>

<script>
export default {
  props: {
    kngInfo: {
      type: Object
    },
    timeOut: { // 未向后台提交的时间
      type: Number
    },
    kngSchedule: {
      type: Number
    },
    showSlideBar: {
      // 显示与隐藏提示
      type: Boolean,
      default: true
    },
    isShowProgress: {
      type: [Boolean, Number]
    }
  },
  data () {
    return {
      schedule: this.kngSchedule,
      isShowDay: false,
      isShowHour: false,
      isShowMinutes: false,
      d: 0, // 天数
      h: 0, // 小时数
      m: 0, // 分钟
      s: 0 // 秒
    }
  },
  computed: {
    isNotComplete () {
      if (this.kngInfo.studyHours === 0) {
        return false
      }
      return this.schedule !== 100
    }
  },
  created () {
    this.restMinutes()
    if (this.schedule !== 100) {
      this.countSeconds()
    }
  },
  methods: {
    handleClick () {
      if (this.schedule !== 100) {
        this.countSeconds()
      }
    },
    restMinutes () {
      let time = 0
      // 计算剩余分钟 [标准学时 - 已学学时 > 0 则当前视频未学完，小于0则视频学完了]
      if (this.kngInfo.studyHours - this.kngInfo.learnedHours > 0) {
        time = parseInt(this.kngInfo.studyHours - this.kngInfo.learnedHours - this.timeOut)
        console.log(this.timeOut, 'isGetLeaveTime==')
      }
      this.d = Math.floor(time / (60 * 60 * 24))
      this.h = Math.floor((time - (this.d * 60 * 60 * 24)) / (60 * 60))
      this.m = Math.floor((time - (this.d * 60 * 60 * 24) - (this.h * 60 * 60)) / 60)
      this.s = time - (this.d * 60 * 60 * 24) - (this.h * 60 * 60) - this.m * 60

      if (this.d > 0) {
        this.isShowDay = true
        this.isShowHour = true
        this.isShowMinutes = true
      }
      if (this.h > 0) {
        this.isShowHour = true
        this.isShowMinutes = true
      }
      if (this.m > 0) {
        this.isShowMinutes = true
      }
    },
    countSeconds () {
      // 分钟倒计时
      if ((this.m + this.h + this.d) > 0) {
        this.timer = setInterval(() => {
          if (this.m + this.h + this.d + this.s === 0) {
            clearInterval(this.timer)
          }
          this.s--
          if (this.s < 0) {
            this.m--
            this.s = (this.d + this.h + this.m) >= 0 ? 59 : 0
          }
          if (this.m < 0) {
            this.h--
            this.m = (this.d + this.h) >= 0 ? 59 : 0
          }
          if (this.h < 0) {
            this.d--
            this.h = this.d >= 0 ? 23 : 0
          }
          if (this.d < 0) {
            this.d = 0
          }
        }, 1000)
      } else if (this.m + this.h + this.d === 0 && this.s > 0) {
        this.seconds = setInterval(() => {
          this.s--
          if (this.s < 0) {
            this.s = 0
          }
        }, 1000)
      }
    },
    clearTimer () {
      // 清除计时器
      this.timer && clearInterval(this.timer)
      this.seconds && clearInterval(this.seconds)
    }
  },
  beforeDestroy () {
    this.clearTimer()
  }
}
</script>
