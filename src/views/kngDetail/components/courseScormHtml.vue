<template>
  <yxt-popup class="hp-100 pl15 pr15 course-scorm-html"
    v-model="showIframe"
    position="bottom"
    :overlay="false"
    :round="false">
    <div class="iframe-close" @click="closeIframe">
      <span class="font-size-12 text-white">关闭</span>
    </div>
    <div class="hp-100 wp-100 scorm-detail pr over-hidden top-5p">
      <num-down
        ref="courseNumDown"
        v-show="(isShowProgress || targetId) && isScorm && destroyNumDown"
        :kngInfo="clickInfo"
        :kngSchedule="clickInfo.schedule">
      </num-down>
      <iframe class="scorm-iframe over-hidden hp-100 wp-100"
        id="scormHtml"
        frameborder="0"
        scrolling="auto"
        allowfullscreen="true"
        webkitallowfullscreen="true"
        mozallowfullscreen="true"
        :src="url"></iframe>
      <yxtbiz-watermark style="z-index: 11;" :option="option"></yxtbiz-watermark> -->
    </div>
  </yxt-popup>
</template>

<script>
import numDown from './docNumDown'
import fileApi from '@/service/knowledge.service.js'
export default {
  props: {
    url: {
      type: String
    },
    showIframe: {
      type: Boolean
    },
    clickInfo: {
      type: Object
    },
    isShowProgress: {
      type: [Boolean, Number]
    }
  },
  components: {
    numDown
  },
  data () {
    return {
      option: {},
      destroyNumDown: true,
      targetId: this.$route.query.targetId
    }
  },
  computed: {
    isScorm () {
      if (this.clickInfo.fileType === 'scorm') {
        return this.clickInfo.courseVersion === 0
      }
      return true
    }
  },
  mounted () {
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
    closeIframe () {
      this.destroyNumDown = false
      this.$emit('closeIframe')
    },
    clearCourseNumDown () {
      setTimeout(() => {
        if (this.$refs.courseNumDown) {
          this.$refs.courseNumDown.clearTimer()
        }
      }, 0)
    },
    courseHandlerClick () {
      setTimeout(() => {
        if (this.$refs.courseNumDown) {
          this.$refs.courseNumDown.handleClick()
        }
      }, 0)
    }
  }
}
</script>

<style lang="scss">
.iframe-close {
  position: absolute;
  z-index: 11;
  right: 10px;
  top: 8px;
  display: inline-block;
  padding: 8px 10px;
}
.course-scorm-html {
  background-color: #000 !important;
  width: 100%;
  height: 100%;

  .yxt-popup__close-icon {
    position: absolute !important;
    z-index: 100;
    font-size: 16px;
    color: #fff;
  }
}
.top-5p {
  top: 6%;
}
</style>
