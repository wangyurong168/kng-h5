<template>
  <div class="add-study-container" v-if="isAddStudy">
    <yxt-button class="add-study-btn" size="large" @click="addStudy" round>加入学习</yxt-button>
  </div>
</template>

<script>
import api from '@/service/knowledge.service'
export default {
  name: '',
  components: {},
  props: {
    kngId: {
      type: String
    }
  },
  data () {
    return {
      courseId: this.$route.query.courseId,
      isAddStudy: true
    }
  },
  methods: {
    // 加入学习
    addStudy () {
      let id = (this.kngId === undefined ? this.courseId : this.kngId)
      api.joinStudy(id).then(res => {
        this.isAddStudy = false
        this.$toast({
          icon: 'https://media-phx.yunxuetang.com.cn/kng/images/addStudy.png',
          message: '已加入自学知识',
          className: 'w-auto'
        })
        this.$emit('isAdd', this.isAddStudy)
      }).catch(err => {
        console.log(err)
      })
    }
  }
}
</script>

<style scoped>
.add-study-btn {
  margin: 0 15px !important;
}
</style>
