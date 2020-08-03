<template>
  <div class="detail-play-container pr">
    <!-- 播放视频 -->
    <yxtbiz-doc-viewer ref="docViewer" height="210px" v-if="loading"
                       :file-list="docList"
                       :start="startTime"
                       :watermark-config = "watermarkConfig"
      >
    </yxtbiz-doc-viewer>
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

export default {
  name: 'playArea',
  props: {
    kngInfo: {
      type: Object
    },
    watermarkConfig: {
      type: Object
    },
    docList: {
      type: Array
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
      coverUrl: this.kngInfo.coverUrl, // 封面
      startTime: 0, // 开始播放时间
      // 水印配置
      loading: false // 处理加载知识播放地址loading
    }
  },
  methods: {
    // 封面地址取消,实际播放
    playVideo () {
      this.$nextTick(() => {
        this.showPhoto = false
        this.loading = true
      })
    }
  }
}
</script>
