<template>
  <div class="mt34 pb32" v-if="showOperation">
    <ul class="yui-operations-page">
      <!-- 点赞操作 -->
      <li class="yui-operations-info" v-if="praiseObj.isPraise" @click="clickPraise">
        <yxt-svg-icon :baseurl='h5Url' width="23px" height="30px" icon-name='liked' />
        <div class="font-size-13 mt5 text-75">{{praiseObj.praiseNum | numberChange}}</div>
      </li>
      <li class="yui-operations-info" @click="clickPraise" v-else>
        <yxt-svg-icon :baseurl='h5Url' width="23px" height="30px" icon-name='like' />
        <div class="font-size-13 mt5 text-75" v-if="praiseObj.praiseNum">{{praiseObj.praiseNum | numberChange}}</div>
        <div class="font-size-13 mt5 text-75" v-else>点赞</div>
      </li>
      <!-- 打赏操作 -->
      <li class="yui-operations-info" @click="clickGift">
        <yxt-svg-icon :baseurl='h5Url' width="23px" height="30px" icon-name='reward' />
        <div class="font-size-13 mt5 text-75" v-if="giftObj.giftNum > 0">{{giftObj.giftNum | numberChange}}</div>
        <div class="font-size-13 mt5 text-75" v-else>打赏</div>
      </li>
      <!-- 收藏操作 -->
      <li class="yui-operations-info" v-if="collectObj.isCollect" @click="clickCollect">
        <yxt-svg-icon :baseurl='h5Url' class="text-fa" width="23px" height="30px" icon-name='favorited' />
        <div class="font-size-13 mt5 text-75">已收藏</div>
      </li>
      <li class="yui-operations-info" @click="clickCollect" v-else>
        <yxt-svg-icon :baseurl='h5Url' width="23px" height="30px" icon-name='favorite' />
        <div class="font-size-13 mt5 text-75">收藏</div>
      </li>
      <!-- <li class="yui-operations-info">
        <yxt-svg-icon :baseurl='h5Url' class="text-bf" width="23px" height="30px" icon-name='more-0' />
        <div class="font-size-13 mt5 text-bf">更多</div>
      </li> -->
    </ul>
    <!-- 打赏组件操作 -->
    <reward class="reward" :showGift="showGift" @closePop="closePop" :targetUserId="targetUserId" :loginUserId="loginUserId" :kngInfo="kngInfo"></reward>
    <!-- 点击更多操作 -->
    <yxt-action-sheet v-model="showMore" :actions="actions" cancel-text="取消" @select="onSelect" />
  </div>
</template>

<script>
import Reward from './Reward'
import api from '@/service/knowledge.service'
export default {
  components: {
    Reward
  },
  props: {
    kngInfo: {
      type: Object
    }
  },
  data () {
    return {
      showOperation: false,
      praiseObj: {
        isPraise: false,
        praiseNum: this.kngInfo.supportCount // 点赞人的数量
      },
      giftObj: {
        giftNum: this.kngInfo.rewardPoint // 打赏的积分
      },
      collectObj: {
        isCollect: false,
        collectNum: 45687 // 收藏的数量
      },
      showGift: false,
      showMore: false,
      actions: [
        { name: '举报', id: '123' }
      ],
      targetUserId: this.kngInfo.contributorsId || '',
      loginUserId: localStorage.userId || ''
    }
  },
  mounted () {
    if (Object.keys(this.kngInfo).length > 0) {
      this.getIdPraise()
      this.getIsCollect()
      this.showOperation = true
    }
  },
  methods: {
    clickPraise () {
      if (this.praiseObj.isPraise) {
        this.$toast({ position: 'top', message: '您已赞过' })
      } else {
        let bodyParams = {
          targetId: this.kngInfo.id,
          targetType: 2
        }
        api.postAddThumbs(bodyParams).then(res => {
          this.praiseObj.isPraise = true
          this.praiseObj.praiseNum++
          this.$toast({ position: 'top', message: '+1' })
        }).catch(err => {
          console.log(err)
        })
      }
    },
    // 是否点赞
    getIdPraise () {
      let bodyParams = {
        targetIds: [this.kngInfo.id]
      }
      api.postIsPraises(bodyParams).then(res => {
        if (res.datas.length > 0) {
          let praisec = res.datas[0]
          if (praisec.praiseType === null || praisec.praiseType === undefined) {
            this.praiseObj.isPraise = false
          } else {
            this.praiseObj.isPraise = true
          }
        } else {
          this.praiseObj.isPraise = false
        }
      }).catch(err => {
        console.log(err)
      })
    },
    // 点击收藏
    clickCollect () {
      this.collectObj.isCollect ? this.cancelCollect() : this.addCollect()
    },
    // 是否收藏
    getIsCollect () {
      let id = this.kngInfo.id
      api.getFavorited(id).then(res => {
        this.collectObj.isCollect = res.myFavorite
      }).catch(err => {
        console.log(err)
      })
    },
    // 添加收藏
    addCollect () {
      let bodyParams = {
        targetId: this.kngInfo.id,
        targetType: 2
      }
      api.postAddFavorite(bodyParams).then(res => {
        this.collectObj.isCollect = true
      }).catch(err => {
        console.log(err)
      })
    },
    // 取消收藏
    cancelCollect () {
      let targetId = this.kngInfo.id
      api.deleteFavorite(targetId).then(res => {
        this.collectObj.isCollect = false
      }).catch(err => {
        console.log(err)
      })
    },
    // 点击打赏
    clickGift () {
      this.showGift = true
    },
    closePop (success, val) {
      this.showGift = false
      if (success) {
        this.giftObj.giftNum += val
      }
    },
    // 点击更多
    clickMore () {
      this.showMore = true
    },
    // 举报操作
    onSelect (item) {
      this.showMore = false
    }
  }
}
</script>
