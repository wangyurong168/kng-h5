<template>
  <div class="yui-whole-page" v-if="loading">
    <yxt-empty v-if="isShowNoData">
      <div>笔记不存在</div>
    </yxt-empty>
    <div v-else>
      <div class="note">
        <div class="viewnote-title mt27">{{ noteInfo.title }}</div>
        <div class="clearfix mt24">
          <div class="pull-left">
            <yxt-image style="width:35px; height:35px;vertical-align: middle;" round  :src="noteInfo.imgUrl" />
            <span class="notelist-name ml10">{{ noteInfo.updateFullname }}</span>
            <span class="notelist-time ml10">{{ noteInfo.updateTime }}</span>
          </div>
        </div>
        <div class="mt20 viewnote-content" v-html="noteInfo.content"></div>
        <div class="demo-image__lazy mt20" v-if="noteInfo.imageList">
          <yxt-image v-for="url in noteInfo.imageList" :key="url" :src="url" lazy></yxt-image>
        </div>
      </div>
      <div class="noteedit-bottom clearfix d-in-block">
        <yxt-divider />
        <div class="pb16" style="display:flex">
          <div class="notelist-more-cancel wp-50" v-if="noteInfo.isFavorite===0" @click="collectNote">{{$t('kng_mynote_lbl_collect')}} {{noteInfo.favoriteCountVal||0}}</div>
          <div class="notelist-more-cancel color-primary-6 wp-50" v-else @click="cancelCollectNote">{{$t('kng_mynote_lbl_collect')}} {{noteInfo.favoriteCountVal||0}}</div>
          <div class="notelist-line"></diV>
          <div class="notelist-more-cancel wp-50" v-if="noteInfo.supported===0" @click="likeNote">{{$t('kng_note_lbl_like')}} {{noteInfo.supportCountVal||0}}</div>
          <div class="notelist-more-cancel color-primary-6 wp-50" v-else>{{$t('kng_note_lbl_like')}} {{noteInfo.supportCountVal||0}}</div>
        </div>
      </div>
    </div>
  </div>
  <div class="yui-screen-page" v-else>
    <yxt-loading text-size="16px">{{$t('kng_common_msg_loading')}}</yxt-loading>
  </div>
</template>
<script>
import api from '@/service/knowledge.service.js'
export default {
  name: '',
  components: {},
  props: {},
  data () {
    return {
      noteInfo: {},
      noteId: '',
      isOtherNote: false,
      isDeleted: false,
      loading: false,
      kngId: ''
    }
  },
  computed: {
    isShowNoData () {
      return this.loading && this.isDeleted // 不在loading状态 并且comments > 0
    }
  },
  created () {
    document.title = this.$t('kng_note_tit_notedetail')
    if (this.$route.query.noteId) {
      this.loading = false
      this.noteId = this.$route.query.noteId
      api.getNote(this.noteId).then((res) => {
        res.supportCountVal = res.supportCount > 10000 ? (res.supportCount / 10000).toFixed(1) + 'W' : res.supportCount
        res.favoriteCountVal = res.favoriteCount > 10000 ? (res.favoriteCount / 10000).toFixed(1) + 'W' : res.favoriteCount
        this.noteInfo = res
        // 是否已点赞，是否已收藏
        api.getOwnThumbs(this.noteId).then(result => {
          this.noteInfo.supported = result.praiseType ? 1 : 0
        })
        api.getFavorited(this.noteId).then(result => {
          this.noteInfo.isFavorite = result.myFavorite ? 1 : 0
        })
        this.loading = true
      }).catch((e) => {
        if (e.error.key === 'apis.kng.note.validation.NotExist') {
          this.isDeleted = true
        }
        this.loading = true
      })
    } else {
      this.loading = true
    }
  },
  methods: {
    // 收藏
    collectNote () {
      // 调接口
      let bodyParams = {
        targetId: this.noteId,
        targetType: 3
      }
      api.postAddFavorite(bodyParams).then(res => {
        this.noteInfo.favoriteCount += 1
        this.noteInfo.isFavorite = 1
        this.noteInfo.favoriteCountVal = this.noteInfo.favoriteCount + 1 > 10000 ? ((this.noteInfo.favoriteCount + 1) / 10000).toFixed(1) + 'W' : this.noteInfo.favoriteCount
      }).catch((err) => {
        this.$message({
          type: 'error',
          message: this.$t(err.error.key)
        })
      })
    },
    // 取消收藏
    cancelCollectNote () {
      api.deleteFavorite(this.noteId).then(res => {
        this.noteInfo.favoriteCount -= this.noteInfo.favoriteCount > 0 ? 1 : 0
        this.noteInfo.isFavorite = 0
        this.noteInfo.favoriteCountVal = this.noteInfo.favoriteCount + 1 > 10000 ? ((this.noteInfo.favoriteCount + 1) / 10000).toFixed(1) + 'W' : this.noteInfo.favoriteCount
      }).catch((err) => {
        this.$message({
          type: 'error',
          message: this.$t(err.error.key)
        })
      })
    },
    // 点赞
    likeNote () {
      // 调接口
      let bodyParams = {
        targetId: this.noteId,
        targetType: 3,
        praiseType: 1
      }
      api.postAddThumbs(bodyParams).then(res => {
        this.noteInfo.supportCount += 1
        this.noteInfo.supported = 1
        this.noteInfo.supportCountVal = this.noteInfo.supportCount + 1 > 10000 ? ((this.noteInfo.supportCount + 1) / 10000).toFixed(1) + 'W' : this.noteInfo.supportCount
      }).catch((err) => {
        this.$message({
          type: 'error',
          message: this.$t(err.error.key)
        })
      })
    },
    informNote () {
    }
  },
  watch: {
    noteInfo (to, from) {
      this.noteInfo = to
    },
    isOtherNote (to, from) {
      this.isOtherNote = to
    }
  }
}
</script>
