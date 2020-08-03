<template>
  <div class="detail-play-container pr">
    <!-- 播放视频 -->
    <yxtbiz-video ref="video" width="100%" height="210px" :src="playSrc"
                  :image="coverUrl"
                  :watermark-config="option"
                  :is-audio="kngType === kngTypeEnum.AUDIO"
    >
    </yxtbiz-video>
    <!-- h5封面 -->
    <div class="play-video-photo" v-show="showPhoto">
      <img :src="coverUrl" class="detail_play-coverUrl" v-if="Object.keys(kngInfo).length > 0">
      <div class="detail_mask"></div>

      <template>
        <yxt-icon name="play-circle-o" class="detail_play_icon" @click="playVideo" />
      </template>
    </div>
  </div>
</template>

<script>
import { kngTypeEnum } from '@/core/kngType'
import { watermarkConfigMixin } from '@/views/kngDetailAudit/mixins/waterConfig'

export default {
  name: 'playArea',
  mixins: [watermarkConfigMixin],
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
      kngTypeEnum,
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
    // 封面地址取消,实际播放
    playVideo () {
      this.showPhoto = false
      this.$nextTick(() => {
        if (this.$refs.video) {
          this.$refs.video.play()
        }
      })
    }
  }
}
</script>
