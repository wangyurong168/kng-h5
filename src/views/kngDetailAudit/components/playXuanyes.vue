<template>
  <div class="detail-play-container pr">
    <!-- h5封面 -->
    <div class="play-video-photo" v-show="showPhoto">
      <img :src="coverUrl" class="detail_play-coverUrl" v-if="Object.keys(kngInfo).length > 0">
      <div class="detail_mask"></div>

      <template>
        <yxt-icon name="play-circle-o" class="detail_play_icon" @click="getPlayHandler" />
      </template>
    </div>
  </div>
</template>

<script>
import { kngTypeEnum } from '@/core/kngType'
import _findKey from 'lodash/findKey'

export default {
  name: 'playArea',
  props: {
    kngInfo: {
      type: Object
    },
    playSrc: {
      type: String
    },
    kngType: {
      type: Number
    }
  },
  data () {
    return {
      kngId: this.$route.query.id, // 知识id
      courseId: this.$route.query.courseId, // 课程包id
      targetId: this.$route.query.targetId, // 项目或计划id
      targetCode: this.$route.query.targetCode, // 项目或计划名
      type: this.$route.query.type,
      taskType: this.$route.query.taskType, // 从项目过来审核的权限
      // 视频的参数
      showPhoto: true,
      coverUrl: this.kngInfo.coverUrl // 封面
    }
  },
  methods: {
    getPlayHandler () {
      const MAPPER = {
        [kngTypeEnum.WEIKE]: 'playVideo',
        [kngTypeEnum.SCORM]: 'playScormHTML',
        [kngTypeEnum.HTML]: 'playScormHTML'
      }
      this[MAPPER[this.kngType]]()
    },
    // 封面地址取消,实际播放
    playVideo () {
      if (!this.playSrc) {
        this.$toast('播放地址为空！')
        return
      }
      window.location.href = this.playSrc
    },
    // 播放scorm | html地址
    playScormHTML () {
      let playType = _findKey(kngTypeEnum, l => l === this.kngType)
      let query = {
        id: this.kngId,
        courseId: this.courseId,
        targetId: this.targetId,
        targetCode: this.targetCode,
        type: this.type,
        taskType: this.taskType,
        playType: playType.toLowerCase(), // scorm || html
        status: this.status
      }
      this.$router.push({
        name: 'ScormHtmlPlayAudit',
        query
      })
    }
  }
}
</script>
