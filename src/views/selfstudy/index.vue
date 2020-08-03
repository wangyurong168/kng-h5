<template>
  <div class="yui-whole-page">
    <div class="clearfix">
      <yxt-tabs v-model="orderBy" @click="tabChang" sticky>
        <yxt-tab title="按学习时间" name="update_time">
          <selfStudy name="update_time"></selfStudy>
        </yxt-tab>
        <yxt-tab title="按加入时间" name="create_time">
          <selfStudy name="create_time"></selfStudy>
        </yxt-tab>
      </yxt-tabs>
    </div>
  </div>
</template>

<script>
import selfStudy from '@/components/selfStudy'
export default {
  components: {
    selfStudy
  },
  data () {
    return {
      orderBy: 'update_time' // 排序字段-默认学习时间倒序排列
    }
  },
  created () {
    if (window.localStorage.getItem('orderBy')) {
      this.orderBy = window.localStorage.getItem('orderBy')
    } else {
      this.orderBy = 'update_time'
    }
  },
  methods: {
    tabChang (name, title) {
      this.orderBy = name
      localStorage.setItem('orderBy', this.orderBy)
    }
  }
}
</script>
