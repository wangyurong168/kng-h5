<template>
  <div class="over-hidden" :class="isAddStudy ? 'pb54' : null" v-if="loading">
    <playXuanyes :kngInfo="kngInfo" :play-src="playSrc" :kngType="kngTypeEnum.WEIKE"></playXuanyes>

    <kng-info :kngInfoDetail="kngInfo" :isShowProgress="isShowProgress"></kng-info>
    <btn-group :id="kngId" @getStatus="s => $set(kngInfo, 'auditStatus', s)"></btn-group>
  </div>
  <div class="yui-screen-page" v-else>
    <yxt-loading text-size="16px">加载中...</yxt-loading>
  </div>
</template>

<script>
import api from '@/service/kngDetail.service'
import playXuanyes from '@/views/kngDetailAudit/components/playXuanyes'
import { AVMixin } from '@/views/kngDetailAudit/mixins'
import _isEmpty from 'lodash/isEmpty'
import _find from 'lodash/find'

export default {
  name: 'XuanyesDetailAudit',
  mixins: [AVMixin],
  components: {
    playXuanyes
  },
  methods: {
    // 获取知识播放地址
    async postPlayStudy () {
      const bodyParams = this.setPlayStudyParams()
      let { playDetails } = await api.postPlayStudy(bodyParams)
      let playDetail = _find(playDetails, { desc: 'signUrl' })
      this.playSrc = !_isEmpty(playDetail) && playDetail.url
      this.loading = true
    }
  }
}
</script>
