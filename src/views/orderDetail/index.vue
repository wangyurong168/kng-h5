<template>
  <div class="orderDetail font-size-14" v-if="!loading">
    <!--标题-->
    <div class="orderDetail__wrapper d-flex">
      <img :src="courseInfo.coverUrl" alt="">
      <div class="orderDetail__wrapper--info">
        <h1 class="text-26 font-size-16 ellipsis-2">{{courseInfo.name}}</h1>
        <div class="text-8c mt10">{{$t('kng_detail_lbl_exchange_dialog_txt')}}</div>
      </div>
    </div>
    <div class="yxt-hairline--bottom"></div>
    <!--支付方式-->
    <div class="orderDetail__wrapper text-59">
      <p class="mb15">{{$t('kng_detail_lbl_exchange_pay_way')}}</p>
      <div class="orderDetail__wrapper--content">
        <div class="orderDetail__wrapper--title">
          <yxt-svg-icon :baseurl='h5Url' width="16px" height="16px" icon-name="point"/>
          <span class="ml8">{{$t('kng_detail_lbl_exchange_dialog_user')}}：{{courseInfo.userPoint}} <template v-if='!showIsAblePay'>({{$t('kng_detail_lbl_exchange_dialog_unable')}})</template></span>
        </div>
        <template>
          <yxt-icon name="success" size="16" class="color-primary-6" v-if="showIsAblePay"/>
          <yxt-button type="text" textClass="color-primary-6" @click='onJumpPay' v-else-if='!showIsAblePay && showIsOpenPay'>{{$t('kng_detail_lbl_exchange_dialog_topay')}}</yxt-button>
        </template>
      </div>
    </div>
    <div class="yxt-hairline--bottom"></div>
    <div class="orderDetail__footer">
      <div class="">{{$t('kng_detail_lbl_exchange_dialog_payable')}}：<span class="text-yellow"><i class="font-size-24">{{courseInfo.payablePoint}}</i> {{$t('kng_detail_lbl_credit')}}</span></div>
      <yxt-button round  size="middle" :disabled="!showIsAblePay" @click="postExchangePay">{{$t('kng_detail_btn_exchange_confirm')}}</yxt-button>
    </div>
  </div>
  <div class="yui-screen-page" v-else>
    <yxt-loading text-size="16px">{{$t('kng_common_msg_loading')}}</yxt-loading>
  </div>
</template>

<script>
import api from '@/service/knowledge.service'
import _gte from 'lodash/gte'

export default {
  name: 'orderDetail.vue',
  data () {
    return {
      courseId: this.$route.query.courseId,
      courseInfo: {},
      showIsOpenPay: false, // 机构是否开通了积分充值
      showIsAblePay: false, // 是否积分能够支付
      orderCode: '',
      status: '', // 支付结果
      loading: false
    }
  },

  async mounted () {
    // await this.getCheckExchanged()
    await this.getExchangeInfo()
    this.showPayHandler()
  },
  methods: {
    async getCheckExchanged () {
      const { status } = await api.getCheckExchanged(this.courseId)
      status && this.$router.go(-1)
    },
    async getExchangeInfo () {
      const res = await api.getExchangeInfo(this.courseId)
      this.courseInfo = res
      this.showIsAblePay = _gte(res.userPoint, res.payablePoint)
    },
    // 用于判断机构是否开通了积分充值，1-开通，0-未开通",
    async showPayHandler () {
      const id = window.getLocalStorage('orgId')
      const { value } = await api.getPayAuth(id)
      this.showIsOpenPay = value === '1'
    },
    // 去充值
    onJumpPay () {
      let routeUrl = this.$router.resolve({
        path: '/wallet/#/index'
      })
      window.open(routeUrl.href, '_blank')
    },
    // 确认支付
    async postExchangePay () {
      this.loading = true
      await api.postExchangePay(this.courseId).then(({ orderCode }) => {
        this.orderCode = orderCode
        this.status = 'success'
      }).catch(() => {
        this.status = 'fail'
      })

      this.loading = false
      this.$router.replace({ name: 'OrderDetailResult', query: { orderId: this.orderCode, status: this.status } })
    }
  }
}
</script>
