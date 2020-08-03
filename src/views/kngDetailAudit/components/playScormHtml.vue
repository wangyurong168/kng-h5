<template>
  <div class="hp-100 wp-100 scorm-detail pr over-hidden" v-if="loading">
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
import { kngTypeEnum } from '@/core/kngType'
import { AVMixin } from '@/views/kngDetailAudit/mixins'
import { watermarkConfigMixin } from '@/views/kngDetailAudit/mixins/waterConfig'
import api from '@/service/kngDetail.service'
import _isEmpty from 'lodash/isEmpty'
import _head from 'lodash/head'
import { getUrl } from '@/core/utils'

export default {
  name: 'playArea',
  mixins: [AVMixin, watermarkConfigMixin],
  data () {
    return {
      url: ''
    }
  },
  methods: {
    // 获取知识播放地址
    async postPlayStudy () {
      const bodyParams = this.setPlayStudyParams()
      let { kngType, playDetails, courseChapterContent } = await api.postPlayStudy(bodyParams)
      let playDetail = _head(playDetails)
      let url = _isEmpty(playDetail) ? '' : playDetail.url

      if (kngType === kngTypeEnum.SCORM) {
        let ccc = _head(courseChapterContent)
        let htmlUrl = _isEmpty(ccc) ? '' : ccc.chapterHref
        let preview = 1
        this.url = getUrl() + `media/scorm/scowrapperstudy.html?sco=${url}${htmlUrl}&token=${localStorage.token}&source=504&kngId=${this.kngId}&preview=${preview}&targetId=${this.targetId}&targetCode=${this.targetCode}`
      } else if (kngType === kngTypeEnum.HTML) {
        this.url = url
      }
      this.loading = true
    }
  }
}
</script>
