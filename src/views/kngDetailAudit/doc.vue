<template>
  <div class="over-hidden" :class="isAddStudy ? 'pb54' : null" v-if="loading">
    <playDoc :kngInfo="kngInfo"
             :docList="docList"
             :watermarkConfig="watermarkConfig"
    ></playDoc>

    <kng-info :kngInfoDetail="kngInfo" :isShowProgress="isShowProgress"></kng-info>
    <btn-group :id="kngId" @getStatus="s => $set(kngInfo, 'auditStatus', s)"></btn-group>
  </div>
  <div class="yui-screen-page" v-else>
    <yxt-loading text-size="16px">加载中...</yxt-loading>
  </div>
</template>

<script>
import api from '@/service/kngDetail.service'
import playDoc from '@/views/kngDetailAudit/components/playDoc'
import { AVMixin } from '@/views/kngDetailAudit/mixins'

export default {
  name: 'DocDetailAudit',
  mixins: [AVMixin],
  components: {
    playDoc
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
      docList: [] // 播放地址
    }
  },
  methods: {
    // 获取知识播放地址
    async postPlayStudy () {
      const bodyParams = this.setPlayStudyParams()
      let { watermarkConfig, playDetails } = await api.postPlayStudy(bodyParams)

      if (watermarkConfig.enabled && watermarkConfig.type === 1) {
        this.watermarkConfig.enabled = 0
      } else {
        this.watermarkConfig.enabled = watermarkConfig.enabled
      }
      const resObj = {
        type: watermarkConfig.type,
        fontSize: watermarkConfig.wordFontSize,
        color: watermarkConfig.wordColor,
        text: watermarkConfig.watermarkContent,
        opacity: watermarkConfig.wordAlpha
      }
      this.watermarkConfig = Object.assign(this.watermarkConfig, resObj)
      this.docList = playDetails
      this.loading = true
    }
  }
}
</script>
