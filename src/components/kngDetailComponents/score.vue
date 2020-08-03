<template>
  <!--评分页面-->
    <div class="score">
      <div class="scoreRate text-center" v-if="isScore">
        <yxt-rate v-model="value" class="mt15" color="#FA9A02" size="24px" void-color="#E9E9E9" @change="changeRate"/>
        <!-- <span class="text-75 font-size-14 mt12">推荐</span> -->
        <div class="yxtbiz-comment__rate-label">{{rateVal}} </div>
      </div>
      <div class="inputText text-26 font-size-16">
        <yxt-field class="input-commit"
          v-model="inputText"
          :placeholder="'我来说几句~'"
          input-align="left"
          type="textarea"
          maxlength='1000'
          :display-limit='true'
          :limit-display='true'
          :autosize='{ minHeight: 100,maxHeight: 100}'
        />
      </div>
      <div class="add-study-container font-size-16 p15 mt12">
        <yxt-button size="large"  round @click="save">发表</yxt-button>
      </div>
    </div>
</template>

<script>
import api from '@/service/knowledge.service.js'
export default {
  name: 'score',
  props: {
    isScore: {
      type: Boolean,
      default: false
    },
    commentId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      value: 0,
      inputText: '',
      kngid: this.$route.query.id === '' ? this.$route.query.courseId : this.$route.query.id,
      rateVal: ''
    }
  },
  mounted () {},
  methods: {
    clear () {
      this.inputText = ''
    },
    save () {
      // 发表按钮点击
      if (!this.isScore) {
        if (this.commentId) {
          this.sibmitReply()
        } else {
          this.submit()
        }
      } else {
        this.submit()
      }
    },
    changeRate () {
      switch (this.value) {
        case 1:
          this.rateVal = '非常差'
          break
        case 2:
          this.rateVal = '差'
          break
        case 3:
          this.rateVal = '一般'
          break
        case 4:
          this.rateVal = '好'
          break
        case 5:
          this.rateVal = '非常好'
          break
      }
    },
    // 发表评论
    submit () {
      if (this.isScore && this.value === 0) {
        this.$toast.fail('请评分！')
        return
      }
      if (!this.isScore && (this.inputText === '' || this.inputText === null)) {
        this.$toast.fail('请输入评论内容！')
        return
      }
      let obj = {
        comment: this.inputText,
        kngId: this.kngid,
        score: this.value
      }
      api.postAddComment(obj).then(res => {
        try {
          this.$toast.success('评论成功！')
          this.$emit('close')
          this.$emit('getList')
          if (this.isScore) {
            this.$emit('changeScore', this.value)
          }
          this.clear()
        } catch (e) {
          this.$toast.fail(e)
        }
      })
    },
    // 回复
    sibmitReply () {
      if (this.inputText === '' || this.inputText === null) {
        this.$toast.fail('请输入评论内容！')
        return
      }
      let data = {
        'commentId': this.commentId,
        'kngId': this.kngid,
        'reply': this.inputText
      }
      api.postCommentReply(data).then(res => {
        this.$toast.success('回复成功！')
        this.$emit('close')
        this.$emit('getList')
        this.clear()
      })
    }
  }
}
</script>

<style scoped>
.add-study-container{
  box-sizing: border-box;
}
.yxtbiz-comment__rate-label {
  margin-top: 0.32rem;
  text-align: center;
  font-size: 0.37333rem;
  color: #8c8c8c;
  margin-bottom: 0.32rem;
}
</style>
