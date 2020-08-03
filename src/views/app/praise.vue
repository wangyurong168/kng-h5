<template>
  <div class="over-hidden" :class="isIOS ? 'mt30' : ''" style="box-sizing: border-box;">
    <yxtbiz-reward
      :targetUserId="targetUserId"
      :loginUserId="loginUserId"
      :serveiceId="serveiceId"
      :before="beforeHandler"
      :success="success"
      :fail="fail"
      @closed="closeGift">
    </yxtbiz-reward>
  </div>
</template>

<script>
import api from '@/service/kngDetail.service'
import AppProtocol from '@/static/appprotocol'
export default {
  data () {
    return {
      isIOS: window.isIOS,
      targetUserId: this.$route.query.targetUserId,
      loginUserId: this.$route.query.loginUserId,
      serveiceId: this.$route.query.serveiceId,
      isReward: false, // 是否打赏
      isRewardSuccess: null, // 打赏是否成功
      kngId: this.$route.query.kngId // 打赏的知识的id
    }
  },
  methods: {
    closeGift () {
      if (window.isApp) {
        // let params = {
        //   isReward: this.isReward,
        //   isRewardSuccess: this.isRewardSuccess
        // }
        if (this.isReward && this.isRewardSuccess) {
          AppProtocol.refreshSuper()
        }
        AppProtocol.closeWebview()
      }
    },
    beforeHandler () {
      if (this.targetUserId === this.loginUserId) {
        this.$toast({ message: '您是此知识的贡献者，不能对自己进行打赏' })
        return false
      }
      return true
    },
    success (value) {
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
        this.isReward = true
        this.isRewardSuccess = true
        this.$toast.success('打赏成功')
      }).catch(err => {
        console.log(err)
      })
    },
    fail () {
      this.isReward = true
      this.isRewardSuccess = false
      this.$toast.fail('打赏失败')
    }
  }
}
</script>
