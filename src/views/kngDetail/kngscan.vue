<template>
  <div class="yui-whole-page"></div>
</template>

<script>
import api from '@/service/kngDetail.service'
export default {
  components: {},
  props: {},
  data () {
    return {
      msg: '跳转详情中转页',
      kngId: this.$route.query.kngId, // 知识Id
      type: this.$route.query.type, // 0-自主 1-项目（空或0都是自主）
      targetId: this.$route.query.targetId, // 业务id
      targetCode: this.$route.query.targetCode,
      taskType: this.$route.query.taskType // 项目跳转过来区分学院还是管理员
    }
  },
  mounted () {
    api.getTypeInfo(this.kngId).then(res => {
      // h5对zip进行特殊处理
      if (res.fileType === 'zip') {
        this.$toast('不支持手机端观看，请移步至pc端！')
      } else {
        let code = this.targetCode || 'kng'
        if (this.taskType === undefined || this.taskType === 'undefined' || this.taskType === null) {
          this.taskType = ''
        }

        if (res.type === 0) {
          this.$router.skipKngDetail(1, res.fileType, this.kngId, '', this.targetId, code, this.type, '', this.taskType, 1)
        } else {
          // 项目跳转详情
          this.$router.skipKngDetail(1, res.fileType, '', this.kngId, this.targetId, code, this.type, '', this.taskType, 1)
        }
        // 销毁
        this.$destroy()
      }
    }).catch(err => {
      console.log(err)
    })
  }
}
</script>
