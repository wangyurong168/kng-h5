<template>
  <yxt-popup v-model="showGift" position="bottom" :overlay="false" class="hp-100 over-hidden" style="box-sizing: border-box;">
    <yxtbiz-reward
      :targetUserId="targetUserId"
      :loginUserId="loginUserId"
      :serveiceId="targetId"
      :before="beforeHandler"
      :success="success"
      :fail="fail"
      @closed="closeGift">
    </yxtbiz-reward>
  </yxt-popup>
</template>

<script>
import api from '@/service/kngDetail.service'
export default {
  props: {
    showGift: {
      type: Boolean,
      default: false
    },
    targetUserId: {
      type: String,
      required: true
    },
    loginUserId: {
      type: String,
      required: true
    },
    kngInfo: {
      type: Object
    }
  },
  data () {
    return {
      targetId: this.$route.query.targetId,
      kngId: this.$route.query.id,
      courseId: this.$route.query.courseId,
      isReward: false, // 是否打赏
      isRewardSuccess: null, // 打赏是否成功
      successValue: 0
    }
  },
  methods: {
    closeGift () {
      this.$emit('closePop', this.isRewardSuccess, this.successValue)
    },
    beforeHandler () {
      if (this.kngInfo.contributorsId === this.loginUserId) {
        this.$toast({ message: '您是此知识的贡献者，不能对自己进行打赏' })
        return false
      }
      return true
    },
    success (value) {
      this.successValue = value
      let id = ''
      if (this.kngId === undefined || this.kngId === '') {
        id = this.courseId
      } else {
        id = this.kngId
      }
      let bodyParams = {
        kngId: id,
        rewardPoint: value
      }
      api.postRewardScore(bodyParams).then(res => {
        this.isRewardSuccess = true
        this.$toast.success('打赏成功')
      }).catch(err => {
        console.log(err)
      })
    },
    fail () {
      this.$toast.fail('打赏失败')
    }
  }
}
</script>
