<template>
  <div class="yui-whole-page" v-if="listloading">
    <div class="note">
      <yxt-list
        v-model="loading"
        v-if="commentsData.length>0"
        :finished="finished"
         :finished-text="$t('kng_list_lbl_nomore')"
        @load="onLoad">
        <div class="comment-list">
          <li class="clearfix pt20" v-for="item in commentsData" :key="item.id" :name="item.id">
            <yxt-swipe-cell :on-close="onClose" :key="item.id" :name="item.id">
              <div>
                <span class="text-8c">{{ item.createTime ? item.createTime.slice(0, 16) : '' }}</span>
                <div class="pull-right d-in-block">
                  <span class="text-8c d-in-block">{{item.result}}</span>
                  <div class="comment-button d-in-block ml15" v-if="item.auditConclusion === 1||item.auditConclusion === 2" type='text' @click="viewRemark(item.auditRemark,item.auditConclusion)">{{item.auditConclusion === 1 ? $t('kng_mycomments_btn_viewremark') :$t('kng_mycomments_btn_viewreason')}}</div>
                </div>
              </div>
              <div class="mt10 clearfix" style="word-break: break-all;word-wrap: break-word;">
                <span v-if="item.sticky===1" class="comment-recommand mr10 d-in-block">{{$t('kng_mycomments_lbl_recommend')}}</span>
                <span class="notelist-content" v-html="item.content"></span>
              </div>
              <div class="mt10 notelist-title ellipsis" :title="item.targetName" @click="openKng(item.targetId)"> {{$t('kng_mycomments_lbl_from')}}{{ item.targetName }}</div>
              <template slot="right">
                <yxt-button style="background-color: #F5222D; border: .02667rem solid #F5222D;" square :text="$t('kng_common_btn_delete')" />
              </template>
            </yxt-swipe-cell>
          <div class="yxt-hairline--bottom pt20"></div>
          </li>
        </div>
      </yxt-list>
      <yxt-empty v-if="isShowNoData">
        <div class="title">{{$t('kng_common_lbl_nodata')}}</div>
      </yxt-empty>
    </div>
  </div>
  <div class="yui-screen-page" v-else>
    <yxt-loading text-size="16px">{{$t('kng_common_msg_loading')}}</yxt-loading>
  </div>
</template>

<script>
import api from '@/service/knowledge.service.js'
export default {
  data () {
    return {
      listloading: false,
      loading: false,
      finished: false,
      commentsData: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      totalPage: 0,
      KngTitleInput: '',
      Status: -1,
      orderType: '',
      isShowLoading: false
    }
  },
  computed: {
    isShowNoData () {
      return !this.isShowLoading && this.commentsData.length === 0 // 不在loading状态 并且comments > 0
    }
  },
  created () {
    this.$nextTick(this.getCommentList())
  },
  methods: {
    // 查看评语
    viewRemark (remark, type) {
      this.Dialog.alert({
        title: type === 1 ? this.$t('kng_mycomments_lbl_remark') : this.$t('kng_mycomments_lbl_reason'),
        message: remark,
        confirmButtonText: this.$t('kng_common_btn_iknow')
      }).then(() => {
        // on close
      })
    },
    openKng (id) {
      api.getKnowledgeType(id).then((res) => {
        if (res.fileType === 0) {
          this.$router.skipKngDetail(0, res.fileType, id, '', '', 'kng', 0)
        } else {
          this.$router.skipKngDetail(0, res.fileType, '', id, '', 'kng', 0)
        }
      }).catch(() => {
        this.$toast.fail(this.$t('kng_list_msg_notexist'))
      })
    },
    getCommentList () {
      this.currentPage = 1
      let bodyParams = {
        keyword: this.KngTitleInput,
        auditConclusion: this.Status
      }
      let linkParams = {
        limit: 10,
        offset: (this.currentPage - 1) * 10,
        order: this.orderType
      }
      api.postGetMyCommentList(linkParams, bodyParams).then((res) => {
        res.datas.forEach((item, index) => {
          switch (item.auditConclusion) {
            case 0: item.result = this.$t('kng_mycomments_lbl_audit_status1'); break
            case 1: item.result = this.$t('kng_mycomments_lbl_audit_status2'); break
            case 2: item.result = this.$t('kng_mycomments_lbl_audit_status3'); break
          }
          if (item.status !== 1) {
            item.result = this.$t('kng_mycomments_lbl_audit_status4')
          }
          item.auditRemark = item.auditRemark === '' || item.auditRemark === null ? this.$t('kng_mycomments_msg_noramark') : item.auditRemark
          // item.auditRemark = item.content
        })
        this.commentsData = res.datas
        this.total = res.paging.count
        // 获得当前最大页数
        this.totalPage = res.paging.pages
        this.listloading = true
      }).catch(() => {
        this.$toast.fail(this.$t('kng_mycomments_msg_error'))
        this.listloading = true
      })
    },
    // 查看更多
    loadMore () {
      this.currentPage += 1
      let bodyParams = {
        keyword: this.KngTitleInput,
        auditConclusion: this.Status
      }
      let linkParams = {
        limit: 10,
        offset: (this.currentPage - 1) * 10,
        order: this.orderType
      }
      api.postGetMyCommentList(linkParams, bodyParams).then((res) => {
        res.datas.forEach((item, index) => {
          switch (item.auditConclusion) {
            case 0: item.result = this.$t('kng_mycomments_lbl_audit_status1'); break
            case 1: item.result = this.$t('kng_mycomments_lbl_audit_status2'); break
            case 2: item.result = this.$t('kng_mycomments_lbl_audit_status3'); break
          }
          if (item.status !== 1) {
            item.result = this.$t('kng_mycomments_lbl_audit_status4')
          }
          item.auditRemark = item.auditRemark === '' || item.auditRemark === null ? this.$t('kng_mycomments_msg_noramark') : item.auditRemark
          // item.auditRemark = item.content
        })
        this.commentsData = this.commentsData.concat(res.datas)
        // this.total = res.paging.count
        // 获得当前最大页数
        // this.totalPage = res.paging.pages
      }).catch(() => {
        this.$toast.fail(this.$t('kng_mycomments_msg_error'))
      })
    },
    // clickPosition 表示关闭时点击的位置
    onClose (clickPosition, instance, detail) {
      switch (clickPosition) {
        case 'outside':
          instance.close()
          break
        case 'right':
          this.Dialog.confirm({
            message: this.$t('kng_mycomments_msg_isdelete'),
            closeOnPopstate: true
          }).then(() => {
            api.deleteMyComment(detail.name).then((res) => {
              this.$toast(this.$t('kng_mycomments_msg_delete'))
              this.getCommentList()
            }).catch((err) => {
              console.log(err.error)
              this.$toast.fail(this.$t('kng_mycomments_msg_delete_error'))
            })
          }).catch(() => {
            this.$toast(this.$t('kng_mycomments_msg_delete_cancel'))
          })
          break
      }
    },
    onLoad () {
      // 异步更新数据
      setTimeout(() => {
        this.loadMore()
        // 加载状态结束
        this.loading = false

        // 数据全部加载完成
        if (this.currentPage >= this.totalPage) {
          this.finished = true
        }
      }, 500)
    }
  }
}
</script>
<style scoped>
/deep/ .yxt-swipe-cell__right {
  padding-left: 2px;
}
/deep/ .yxt-button--medium.yxt-button--round {
  border-radius: 0;
}
[class*=yxt-hairline]::after {
  width: 200%;
  top: 0% !important
}
</style>
