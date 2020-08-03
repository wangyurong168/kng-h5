<template>
  <div class="commentDetail">
    <div class="ph15 pb5 reply" ref="reply">
      <!--单条评论-->
      <div class="pt18 pb16 list-layout-flex">
        <!-- avatar -->
        <yxt-image class="mr12 v-mid" round width="36px" height="36px" :src="obj.imgUrl" v-pic-error />
        <div class="list-flex-1">
          <!-- 评论者 职位 点点点 -->
          <div class="list-layout-flex">
            <!-- 评论者+职位 -->
            <div class="list-flex-1">
              <span class="text-26 font-size-14 mr8">{{obj.creatorFullname}}</span>
              <span class="text-bf font-size-12">{{obj.dept}}</span>
            </div>
            <!-- 点点点 -->
            <yxt-svg-icon :baseurl='h5Url' icon-name='more' width="16px" height="16px" class="v-mid hand" @click.native="showHandle(obj)"/>
          </div>
          <!-- 评论 -->
          <div class="mt12 text-26 font-size-16 lh26" >
            <p id="expand0s" :class="{'ellipsis-4':obj.isShowAll==true&&isExpandSing!=0}" style="word-break: break-all">{{obj.filtered}}</p>
            <div class="expand color-primary-6" v-if="obj.isShowAll==true" >
              <span class="font-size-12 " v-if="isExpandSing!=0" @click="isExpandSing=0">展开</span>
              <span class="font-size-12" v-if="isExpandSing==0" @click="isExpandSing=null">收起</span>
            </div>
          </div>
          <!-- 时间 点赞数 -->
          <div class="list-layout-flex mt16">
            <div class="list-flex-1 text-bf font-size-12">{{obj.createTime}}</div>
          </div>
        </div>
      </div>
      <div class="list-layout-flex pt25 pb16 yxt-hairline--bottom">
        <!-- 标题回复数量 -->
        <div class="font-size-18 text-26 list-flex-1">{{total}}条回复</div>
      </div>
      <!--回复列表 -->
      <ul class="clearfix list-comment" style="padding-bottom: 15px">
        <li class="pt18 pb16 list-layout-flex yxt-hairline--bottom" v-for="(item, i) in listReplay" :key="i">
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
              <p :id="'expandR' + i"  style="word-break: break-all" :class="{'ellipsis-4':item.isShowAll==true&&isExpand!=i+'s'}" >{{item.filtered}}</p>
              <div class="expand color-primary-6" v-if="item.isShowAll==true" >
                <span class="font-size-12 " v-if="isExpand!=i+'s'" @click="isExpand=i+'s'">展开</span>
                <span class="font-size-12" v-if="isExpand==i+'s'" @click="isExpand=null">收起</span>
              </div>
            </div>
            <!-- 时间 点赞数 -->
            <div class="list-layout-flex mt16">
              <div class="list-flex-1 text-bf font-size-12">{{item.createTime}}</div>
              <div class="layout-flex-inline">
                <!-- 点赞/回复等 -->
                <div class="icon" v-if="item.auditConclusion!=0">
                  <span class="hand" v-if="item.auditConclusion!=0" :class="{thumbsText:item.praised}" @click="thumbs(item,i,'listReplay')">
                    <yxt-svg-icon :baseurl='h5Url' icon-name='like' width="16px" height="16px" class="hand"/>
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
        <div v-if="isloaded" class="knglist-bottom" @click="loadMore">查看更多回复</div>
        <!--<div v-else class="knglist-bottom-nomore">没有更多了</div>-->
      </div>
        <div class="footReply yxt-hairline--top" style="position: absolute !important;">
          <yxt-field :border="false"
                     :displayType="'bg-gray-1'"
                     :radusType="'full'"
                     :readonly="true"
                     input-align="left" :placeholder="'回复'+obj.creatorFullname" @click.native="reply()"/>
          <div class="right-icon d-in-block">
            <span class="pr ml15 mr16 btn">
              <yxt-svg-icon :baseurl='h5Url' icon-name='comment' width="16px" height="16px" class="v-mid"/>
              <i class="rag" style="right: -11px">{{total}}</i>
            </span>
            <span class="pr ml20 btn">
              <yxt-svg-icon :class="{thumbsText:obj.praised}" :baseurl='h5Url' icon-name='like' width="17px" height="17px" class="v-mid"/>
              <i class="rag" style="right: -9px">{{obj.praiseCount}}</i>
            </span>
          </div>
        </div>
      <!-- 弹框 -->
      <yxt-popup v-model="isShowPopup" round position="bottom" get-container="body">
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
      <!-- 添加评论 -->
      <yxt-popup class="closeBtn" v-model="rePlayPopup" round position="bottom" title="回复评论" :style="{ height: '80%' }" closeable="inner" get-container="body">
        <addScoreComment v-if="rePlayPopup" :isScore="false" :commentId="obj.id" @getList="getCommentList"  @close="rePlayPopup=false"></addScoreComment>
      </yxt-popup>
      <!-- 举报组件待接入 -->
    </div>
  </div>
</template>

<script>
import api from '@/service/knowledge.service.js'
import addScoreComment from '@/components/kngDetailComponents/score.vue'
import { parseDate } from '@/core/utils'
export default {
  components: {
    addScoreComment
  },
  props: {
    obj: { // 单条评论
      type: Object,
      default: () => {
        return {}
      }
    },
    kngInfoDetail: { // 知识详情
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      rePlayPopup: false, // 添加回复弹窗
      currentComment: {}, //
      isShowPopup: false, //
      total: null, // 回复总数
      praiseType: null, //
      isExpandSing: null, // 收起展开评论内容
      isExpand: null, // 收起展开回复内容
      target: {}, // 举报组件
      commentId: '',
      loading: false,
      kngId: this.$route.query.id === '' ? this.$route.query.courseId : this.$route.query.id,
      limit: 10,
      CurrentPage: 1,
      current: 1,
      index: null,
      TotalPage: 0,
      totalCount: 0,
      scrollTop: 0,
      isloaded: false, // false 没有加载完 true 加载完了
      baseurl: 'http://media-phx.yunxuetang.com.cn/common/h5_svg', // 远程svg地址
      listReplay: [],
      userId: window.localStorage.getItem('userId')
    }
  },
  computed: {},
  created () {
  },
  mounted () {
    this.getCommentList()
  },
  methods: {
    // 显示回复输入框
    reply () {
      this.rePlayPopup = true
    },
    // 弹窗删除举报等弹窗
    showHandle (item) {
      this.isShowPopup = true
      this.currentComment = item
    },
    // 发表评论
    submit (data) {
      let obj = {
        comment: data.content,
        kngId: this.kngId,
        score: data.rate
      }
      api.postAddComment(obj).then(res => {
        try {
          this.$toast.success('发表成功！')
          this.$refs.comment.clear()
          this.getCommentList()
        } catch (e) {
          this.$toast.fail(e)
        }
      })
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
    getList (type) {
      // 拉取回复列表数据
      this.loading = true
      let linkParams = {
        limit: this.limit,
        offset: (this.CurrentPage - 1) * 10
      }
      api.getKngCommentReply(linkParams, this.kngId, this.obj.id).then((res) => {
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
                item.result = '已通过'
                break
              case 2:
                item.result = '未通过'
                break
            }
            if (item.status !== 1) {
              item.result = '已屏蔽'
            }
          })
          if (type === 0) {
            this.$emit('changeTotal', res.datas.length)
            this.listReplay = res.datas
            this.$nextTick(() => {
              this.calculateText(0)
            })
            this.totalCount = res.paging.count
            // 获得当前最大页数
            this.TotalPage = (this.totalCount / 10)
          } else {
            this.listReplay = this.listReplay.concat(res.datas)
            this.$nextTick(() => {
              this.calculateText(0)
            })
          }
          this.total = this.listReplay.length
          if (this.listReplay.length < res.paging.count) {
            this.isloaded = true
          } else {
            this.isloaded = false
          }
        } else {
          this.listReplay = 0
          this.total = 0
          this.$emit('changeTotal', res.paging.count)
        }
        this.loading = false
      })
    },
    // 获取回复列表
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
          this.$toast.fail('取消删除')
          this.isShowPopup = false
        })
      }).catch(() => {
        this.$toast('取消删除')
        this.isShowPopup = false
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
        this.listReplay.forEach((item, index) => {
          let dom = document.getElementById('expandR' + index)
          let bh = dom.clientHeight || dom.offsetHeight
          if (bh > towHeight) {
            this.$set(this.listReplay[index], 'isShowAll', true)
          }
        })
      })
    }
  }
}
</script>

<style scoped >
  .commentDetail .list-layout-flex .thumbs-highlight {
    top: -2px;
  }
  /deep/ .yxt-icon-cross:before{font-weight: 600;font-size: 20px}
  .footReply /deep/ .yxt-field{display: inline-block;width: 76% !important;}
</style>
