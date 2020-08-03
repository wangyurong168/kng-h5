<template>
  <div class="orderDetail__result text-center">
    <yxt-svg-icon :baseurl='pcUrl' width="98px" height="98px" :icon-name="resultMapper[status].svgIcon"/>
    <h1 class="font-size-18 font-bold text-26 mt15 mb10">{{resultMapper[status].title}}</h1>
    <p class="text-8c font-size-14">{{resultMapper[status].desc}}</p>
    <div class="orderDetail__result--btn">
      <yxt-button round size="large" @click="btnHandler(resultMapper[status])">{{resultMapper[status].btnText}}</yxt-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'result.vue',
  data () {
    return {
      status: this.$route.query.status,
      resultMapper: {
        success: {
          svgIcon: 'biz/mobile-result-success',
          title: this.$t('kng_detail_tit_exchange_success'),
          desc: `${this.$t('kng_detail_msg_exchange_success')}：${this.$route.query.orderId}`,
          btnText: this.$t('kng_detail_btn_exchange_success'),
          btnHandler: 'successHandler'
        },
        fail: {
          svgIcon: 'biz/mobile-result-fail',
          title: this.$t('kng_detail_tit_exchange_fail'),
          desc: this.$t('kng_detail_msg_exchange_fail'),
          btnText: this.$t('kng_detail_btn_exchange_fail'),
          btnHandler: 'failHandler'
        }
      }
    }
  },
  methods: {
    btnHandler (item) {
      let handerObj = {
        successHandler () {
          this.$router.go(-1)
        },
        failHandler () {
          this.$router.go(-1)
        }
      }

      handerObj[item.btnHandler].call(this, item)
    }
  }
}
</script>
