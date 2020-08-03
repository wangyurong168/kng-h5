<template>
    <!--评论列表-->
    <div class="ph15 pb50 commentDetail">
      <div class="flexb" v-if="isAddStudy!==true">
        <yxt-rate v-model="value" readonly color="#FA9A02" size="18px" void-color="#E9E9E9" />
        <yxt-button v-if="value==null||value==0"  round size="small" class="scoreBtn" @click="goScore(true)">去评分</yxt-button>
        <span v-else class="text-bf font-size-13">已评分</span>
      </div>
      <div class="list-layout-flex pt25 pb16 yxt-hairline--bottom" v-if="total>0">
        <!-- 标题评论数量 -->
        <div class="font-size-18 text-26 list-flex-1">{{total}}条评论</div>
      </div>
      <!-- 评论列表 -->
      <ul v-if="total>0" class="clearfix list-comment">
        <li class="pt18 pb16 list-layout-flex yxt-hairline--bottom" v-for="(item, i) in list" :key="i">
          <!-- avatar -->
          <yxt-image class="mr12 v-mid" round width="36px" height="36px" :src="item.imgUrl" v-pic-error />
          <div class="list-flex-1">
            <!-- 评论者 职位 点点点 -->
            <div class="list-layout-flex">
              <!-- 评论者+职位 -->
              <div class="list-flex-1">
                <span class="text-26 font-size-14 mr8">{{item.creatorFullname}}</span>
                <span class="text-bf font-size-12">{{item.dept}}</span>
              </div>
              <!-- 点点点 -->
              <yxt-svg-icon :baseurl='h5Url' icon-name='more' width="16px" height="16px" class="v-mid hand" @click.native="showHandle(item)"/>
            </div>
            <!-- 评论 -->
            <div class="mt12 text-26 font-size-16 lh26 " >
              <p :id="'expand' + i" style="line-height: 24px; word-break: break-all;" :class="{'ellipsis-4':item.isShowAll==true&&isExpand!=i}" >{{item.filtered}}</p>
              <div class="expand color-primary-6" v-if="item.isShowAll==true" >
                <span class="font-size-12 " v-if="isExpand!=i" @click="isExpand=i">展开</span>
                <span class="font-size-12" v-if="isExpand==i" @click="isExpand=null">收起</span>
              </div>
            </div>
            <!-- 时间 点赞数 -->
            <div class="list-layout-flex mt16">
              <div class="list-flex-1 text-bf font-size-12">{{item.createTime}}
                <span v-if="item.replyCount>0" style="position: relative; top: -3px; padding: 5px;">.</span>
                <span v-if="item.replyCount>0" class="font-size-12 text-75 hand" @click="showReply(item)">查看{{item.replyCount}}条回复</span></div>
              <div class="layout-flex-inline">
                <!-- 点赞/回复等 -->
                <div class="icon" v-if="item.auditConclusion!=0&&kngComment">
                  <span class="hand" v-if="item.auditConclusion!=0" @click="reply(item)">
                    <yxt-svg-icon :baseurl='h5Url' icon-name='comment' width="16px" height="16px" class="v-mid hand"/>
                  </span>
                  <span class="hand" v-if="item.auditConclusion!=0" :class="{thumbsText:item.praised}" @click="thumbs(item,i,'list')">
                    <yxt-svg-icon :baseurl='h5Url' icon-name='like' width="16px" height="16px" class="v-mid hand"/>
                    <span class="ml3 thumbs-highlight">{{item.praiseCount|numberChange}}</span>
                  </span>
                </div>
                <div v-if="item.auditConclusion==0" class="list-flex-1 text-bf font-size-12">{{item.result}}</div>
              </div>
            </div>
          </div>
        </li>
      </ul>
      <!-- 加载更多 -->
      <div>
        <div v-if="isloaded === 1" class="knglist-bottom" @click="loadMore">查看更多评论</div>
        <!--<div v-if="isloaded === 2" class="knglist-bottom-nomore">没有更多了</div>-->
        <div v-if="isloaded === 0" class="nodata">
          <yxt-empty >
            <div class="title">暂无评论</div>
          </yxt-empty>
        </div>
      </div>
      <div class="footReply yxt-hairline--top" v-if="kngComment&&isAddStudy!==true" @click="goScore(false)">
        <yxt-field :border="false" style="width: 100%;"
                   :displayType="'bg-gray-1'"
                   :radusType="'full'"
                   :readonly="true"
                   input-align="left" placeholder="我也来说几句"/>
      </div>
      <!-- 删除、举报弹框 -->
      <yxt-popup v-model="isShowPopup" round position="bottom">
        <div class="footBtn">
          <!-- <div class="cz font-size-16 text-26" v-if="userId !== currentComment.creator&&currentComment.auditConclusion!=0" @click="report(currentComment)">
             举报
           </div>-->
          <div class="cz font-size-16 text-26" v-if="userId === currentComment.creator" @click="deleteComment(currentComment.id,0)">
            删除
          </div>
          <div class="notelist-more-span" v-if="userId === currentComment.creator"></div>
          <div class="cz font-size-16 text-26" @click="isShowPopup = false">取消</div>
        </div>
      </yxt-popup>
      <!-- 回复列表 -->
      <yxt-popup class="closeBtn" v-model="isReplyPopup" round position="bottom" title="评论详情" :style="{ height: '80%' }" closeable="inner" @close="refresh" get-container="body">
        <comment-reply-list v-if="isReplyPopup" :kngInfoDetail="kngInfoDetail" :obj="currentComment"></comment-reply-list>
      </yxt-popup>
      <!-- 添加评论 -->
      <yxt-popup class="closeBtn" v-model="addCommentPopup" round position="bottom" :title="title" :style="{ height: '80%' }" closeable="inner">
        <addScoreComment v-if="addCommentPopup" :isScore="isScore" :commentId="commentId" @changeScore="changeScore" @getList="getCommentList"  @close="addCommentPopup=false"></addScoreComment>
      </yxt-popup>
      <!-- 举报组件待接入 -->
    </div>
</template>

<script>
import commentReplyList from './commentReplyList.vue'
import addScoreComment from '@/components/kngDetailComponents/score.vue'
import api from '@/service/knowledge.service.js'
import { parseDate } from '@/core/utils'
export default {
  components: {
    addScoreComment,
    commentReplyList
  },
  props: {
    kngInfoDetail: {
      type: Object,
      default: () => {
        return {}
      }
    },
    isAddStudy: {
      type: Boolean
    }
  },
  data () {
    return {
      isScore: null, // null显示评分数字显示评论
      title: null,
      value: Math.round(this.kngInfoDetail.avgCommentScore), //
      currentComment: {}, //
      addCommentPopup: false, // 添加评论弹窗
      isReplyPopup: false, // 回复弹窗
      isShowPopup: false, // 举报删除弹窗
      total: 0, // 评论总数
      praiseType: null, //
      isExpand: null, // 收起展开评论内容
      target: {}, // 举报组件
      commentId: '',
      loading: false,
      limit: 10,
      CurrentPage: 1,
      current: 1,
      index: null,
      kngId: this.$route.query.id === '' ? this.$route.query.courseId : this.$route.query.id,
      TotalPage: 0,
      totalCount: 0,
      isloaded: 0, // 1 没有加载完 2 加载完了
      list: [],
      userId: window.localStorage.getItem('userId'),
      kngComment: true // true可以品论，false不可以品论
    }
  },
  computed: {},
  created () {
    this.silenceconfigs()
  },
  mounted () {
    this.getCommentList()
    this.getOwnScore(this.kngId)
  },
  methods: {
    refresh () {
      this.getCommentList()
    },
    // 评分后刷新页面分数
    changeScore (data) {
      this.value = data
      this.$emit('changeScoreNum', data)
    },
    // 第三方接口--控制是否允许写评论(0-不允许 1-允许)
    silenceconfigs () {
      let linkParams = {
        orgId: window.getLocalStorage('orgId'),
        userId: window.getLocalStorage('userId')
      }
      api.getIsAllowKngUpload(linkParams).then(res => {
        if (res.kngComment === 0) {
          this.kngComment = false
        }
      })
    },
    showHandle (item) {
      this.isShowPopup = true
      this.currentComment = item
    },
    // 举报
    report (ite) {
      // this.$refs.complain.visible = true
      this.target = {
        masterId: this.kngId, // 知识、帖子、问题、时刻、笔记、其他的id，如果举报对象是5，就传评论（回答）的帖子（问题）的id，用于从管理端举报列表中跳转到举报对象的具体页面
        masterType: 1,
        targetId: ite.id, // 举报对象id
        targetInfo: `${ite.creatorFullname}的评论`, // 举报对象简单描述,xxx（被投诉人）的举报对象类型{小明的评论/xxx的语音}
        targetName: ite.filtered, // 举报对象内容：知识，帖子，问题（类型123）：传标题；（类型456）：传内容；其他（类型7）：传链接
        targetType: 5, // 举报对象类型(1-知识 2-帖子 3-问题 4-时刻 5-知识/帖子/时刻的评论，问题的回答 6-笔记 7-其他)
        audioUrl: '',
        audioLength: 0,
        logoUrl: ''
      }
    },
    handleClick () {
      this.$refs.complain.submit()
    },
    // 点赞
    thumbs (ite, i, arr) {
      if (ite.praised) {
        this.$toast.fail('已点赞，不可再点！')
        return
      }
      let obj = {
        'targetId': ite.id,
        'targetType': 7, // 点赞对象类型(1-用户,2-知识[包括课程],3-笔记,4-学习商城,5-问题回答,6-帖子,7-评论,8-微课,9-作业/心得/实操,10-混合式小组成员)
        'praiseType': 1,
        'remark': ''
      }
      api.postAddThumbs(obj).then(res => {
        if (res.id) {
          this[arr][i].praiseCount = this[arr][i].praiseCount + 1
          this[arr][i].praised = true
        }
      })
    },
    getOwnThumbs (id) {
      // 获取自己是否点过赞
      api.getOwnThumbs(id).then(res => {
        this.praiseType = res.praiseType
      })
    },
    // 显示回复输入框
    reply (item) {
      this.isScore = false
      if (item) { // 回复
        this.addCommentPopup = true
        this.commentId = item.id
        this.title = '回复评论'
        this.currentComment = item
      } else { // 增加评论
        this.addCommentPopup = true
      }
    },
    // 获取自己评分的结果
    getOwnScore (kngId) {
      api.getCommentRate(kngId).then(res => {
        this.isScore = res.score
      })
    },
    // 去评分
    goScore (da) {
      if (this.isAddStudy) {
        this.$toast.fail('未加入学习，不能评分！')
        return
      }
      if (!this.kngComment) {
        this.$toast.fail('舆论管控未开启评论，不能评分！')
        return
      }
      this.isScore = da
      this.title = da === true ? '评分' : '评论'
      this.addCommentPopup = true
      this.commentId = ''
    },
    showReply (item) {
      // 显示回复list
      if (item.replyCount > 0) {
        this.isReplyPopup = true
        this.currentComment = item
        this.commentId = item.id
      }
    },
    getList (type) {
      // 拉取评论列表数据
      this.loading = true
      let linkParams = {
        limit: this.limit,
        offset: (this.CurrentPage - 1) * 10
      }
      api.getKngCommentList(linkParams, this.kngId).then((res) => {
        if (res.datas !== null) {
          res.datas.forEach((item, index) => {
            let sr = []
            if (item.dept !== '') {
              sr = item.dept.split('->')
              item.dept = sr[sr.length - 1]
            }
            item.createTime = parseDate(item.createTime)
            switch (item.auditConclusion) {
              case 0:
                item.result = '待审核'
                break
              case 1:
                item.result = '审核通过'
                break
              case 2:
                item.result = '审核不通过'
                break
            }
            if (item.status !== 1) {
              item.result = '被屏蔽'
            }
          })
          if (type === 0) {
            this.$emit('changeTotal', res.paging.count)
            this.list = res.datas
            this.$nextTick(() => {
              this.calculateText(0)
            })
            this.totalCount = res.paging.count
            // 获得当前最大页数
            this.TotalPage = (this.totalCount / 10)
          } else {
            this.list = this.list.concat(res.datas)
            this.$nextTick(() => {
              this.calculateText(0)
            })
          }
          this.total = this.list.length
          if (this.list.length < res.paging.count) {
            this.isloaded = 1
          } else {
            this.isloaded = 2
          }
        } else {
          this.list = 0
          this.total = 0
          this.$emit('changeTotal', res.paging.count)
        }
        this.loading = false
      })
    },
    getCommentList () {
      this.CurrentPage = 1
      this.getList(0)
    },
    // 删除评论
    deleteComment (id, type) {
      this.Dialog.confirm({
        message: '确定删除吗？',
        closeOnPopstate: true
      }).then(() => {
        // 删除接口
        api.deleteMyComment(id).then((res) => {
          this.isShowPopup = false
          this.$toast.success('删除成功')
          this.getCommentList()
        }).catch(() => {
          this.isShowPopup = false
          this.$toast.fail('取消删除')
        })
      }).catch(() => {
        this.isShowPopup = false
        this.$toast('取消删除')
      })
    },
    loadMore () {
      this.CurrentPage += 1
      this.getList(1)
    },
    // 计算文字 显示展开 收起
    calculateText (type) {
      // 设置四行文字的高度是104px
      let towHeight = 104
      this.$nextTick(() => {
        this.list.forEach((item, index) => {
          let dom = document.getElementById('expand' + index)
          let bh = dom.clientHeight || dom.offsetHeight
          if (bh > towHeight) {
            this.$set(this.list[index], 'isShowAll', true)
          }
        })
      })
    }
  }
}
</script>

<style scoped>
  /deep/ .yxt-icon-cross::before {
    font-weight: 600;
    font-size: 20px;
  }

  /deep/ .yxt-popup__close-icon {
    position: absolute;
    cursor: pointer;
  }
</style>
