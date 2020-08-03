<template>
  <div class="over-hidden" :class="isAddStudy ? 'pb54' : null" v-if="loading">
    <playXuanyes :kngInfo="kngInfo" :play-src="playSrc" :kngType="kngTypeEnum.HTML" :isShowProgress="isShowProgress"></playXuanyes>

    <yxt-tabs v-model="active" :swipe-threshold="5" sticky swipeable>
      <yxt-tab title="详情" name="0">
        <kng-info :kngInfoDetail="kngInfo" :kngSchedule="schedule" :isShowProgress="isShowProgress"></kng-info>
      </yxt-tab>
      <yxt-tab title="评价" name="1">
        <comment-list @changeScoreNum="changeScoreNum" :kngInfoDetail="kngInfo" :isAddStudy="isAddStudy"></comment-list>
      </yxt-tab>
      <yxt-tab title="笔记" name="2">
        <kngNoteList :kngId="kngInfo.id" :title="kngInfo.title" :addStudy="kngInfo.addStudy" :isAddStudy="isAddStudy"></kngNoteList>
      </yxt-tab>

      <!-- 加入学习 -->
      <template>
        <kng-add-study v-if="isAddStudy" :kngId="kngId" @isAdd="getIsAdd"></kng-add-study>
      </template>
    </yxt-tabs>
  </div>
  <div class="yui-screen-page" v-else>
    <yxt-loading text-size="16px">加载中...</yxt-loading>
  </div>
</template>

<script>
import playXuanyes from '@/views/kngDetailCopy/components/playXuanyes'
import { AVMixin } from '@/views/kngDetailCopy/mixins'
import { kngConfigMixin } from '@/views/kngDetailCopy/mixins/kngConfig'

export default {
  name: 'HtmlDetail',
  mixins: [AVMixin, kngConfigMixin],
  components: {
    playXuanyes
  }
}
</script>
