<template>
  <div class="over-hidden" :class="isAddStudy ? 'pb54' : null" v-if="loading">
    <playArea :kngInfo="kngInfo"
              :playSrc="playSrc"
              :kngType="kngTypeEnum.VIDEO"
    ></playArea>
    <kng-info :kngInfoDetail="kngInfo" :isShowProgress="isShowProgress"></kng-info>
    <btn-group :id="kngId" @getStatus="s => $set(kngInfo, 'auditStatus', s)"></btn-group>
  </div>
  <div class="yui-screen-page" v-else>
    <yxt-loading text-size="16px">加载中...</yxt-loading>
  </div>
</template>

<script>
import { AVMixin } from '@/views/kngDetailAudit/mixins'

export default {
  name: 'VideoDetailAudit',
  mixins: [AVMixin]
}
</script>
