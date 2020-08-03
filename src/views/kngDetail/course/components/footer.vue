<template>
  <div class="orderDetail__footer" v-if="needToBuy">
    <div class="">
      <yxt-svg-icon :baseurl='h5Url' width="16px" height="16px" icon-name="point"/>
      <span class="text-yellow ml8 font-size-14"><i class="font-size-24">{{price}}</i> {{$t('kng_detail_lbl_credit')}}</span>
    </div>
    <yxt-button round  size="middle" @click="jumpPage">{{$t('kng_detail_btn_exchange')}}</yxt-button>
  </div>
</template>

<script>
export default {
  name: 'footer.vue',
  props: {
    needToBuy: {
      type: Boolean
    },
    price: {
      type: Number
    }
  },
  methods: {
    jumpPage () {
      this.$router.push({ name: 'OrderDetail', query: this.$route.query })
    }
  }
}
</script>
