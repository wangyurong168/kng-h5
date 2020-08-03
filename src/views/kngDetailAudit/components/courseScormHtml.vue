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
import { watermarkConfigMixin } from '@/views/kngDetailAudit/mixins/waterConfig'

export default {
  mixins: [watermarkConfigMixin],
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
  methods: {
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
  top: 8px;
  right: 10px;
  z-index: 11;
  display: inline-block;
  padding: 8px 10px;
}

.course-scorm-html {
  width: 100%;
  height: 100%;
  background-color: #000 !important;

  .yxt-popup__close-icon {
    position: absolute !important;
    z-index: 100;
    color: #fff;
    font-size: 16px;
  }
}

.top-5p {
  top: 6%;
}
</style>
