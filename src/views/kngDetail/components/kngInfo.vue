<template>
  <div class="pl15 pr15 pt24 over-hidden">
    <!-- 详情标题 -->
    <div class="yui-kngdetail-page mb10">
      <h2 class="mr15 font-size-18 lh25 break font-w-600" style="flex:1">{{kngInfo.title}}</h2>
      <template v-if="!isAudit">
        <yxt-circle v-model="schedule" :rate="schedule" v-if="isShowProgress" layer-color="#ecf0ff" size="45px" text-style="font-size-12" :text="text"/>
      </template>
    </div>
    <div>
      <yxt-rate v-model="avgCommonScore" size="14px" class="d-in-block" color="#fa9a02" readonly/>
      <span class="ml15 text-59 font-size-14">{{ kngInfo.studyCount | numberChange }}人学过</span>
    </div>
    <!-- 操作栏 -->
    <operations :kngInfo="kngInfo"></operations>
    <div class="yxt-hairline--bottom"></div>
    <!-- 简介 -->
    <div class="mt20 pb20">
      <h2 class="font-size-18 mb5 font-w-600">简介</h2>
      <div>
        <ul>
          <li v-for="item in tagIds" :key="item.tagId" class="kngtag ph10 pv3 d-in-block bg-f5 ml10 mt10 nowrap over-hidden border-r-12">
            {{ item.name }}
          </li>
        </ul>
        <!-- 简介 -->
        <div class="text-59 lh24 font-size-14 break ml10" :class="tagIds.length > 0 ? 'mt10' : 'mt15'" v-html="kngContent" v-if="kngContent.length > 0"></div>
        <div class="font-size-14 text-59 mt15 ml10" v-else>暂无简介</div>
      </div>
    </div>
    <div class="yxt-hairline--bottom"></div>
    <!-- 贡献者 -->
    <div class="mt20 pb20">
      <h2 class="font-size-18 mb15 font-w-600">贡献者</h2>
      <div class="yui-contribute-container">
        <img :src="conImage" class="contribute-icon" v-pic-error>
        <div class="ml15">
          <p class="text-26 text-standard-size-16 font-w-600 over-hidden h-22">{{ kngInfo.contributorsName }}</p>
          <p class="font-size-14 text-75 mt8">{{ kngInfo.contributorsDept }}</p>
        </div>
      </div>
    </div>
    <div class="yxt-hairline--bottom"></div>
    <!-- 相关课程 -->
    <div class="mt20" v-if="this.relateLists.length > 0 && relateLoading">
      <h2 class="font-size-18 mb15 font-w-600">相关课程</h2>
      <ul>
        <li v-for="item in relateLists" :key="item.id" class="yui-relateList-container mb25 over-hidden" @click="routerPlay(item)">
          <img v-if="item.fileType" :src="item.coverUrl" class="relateList-img">
          <img v-else :src="item.fileType | kngDefaultUrl" class="relateList-img">
          <div class="ml10">
            <p class="font-size-16 font-bold lh22 text-cut">{{item.title}}</p>
            <div class="mt3 mb3">
              <yxt-rate v-model="item.avgCommentScore" size="11px" class="d-in-block" color="#fa9a02" readonly/>
            </div>
            <span class="text-8c font-size-12">{{item.studyCount}}人学过</span>
            <span class="text-8c ml12 font-size-12">{{item.studyScore}}学分</span>
          </div>
        </li>
      </ul>
      <div class="yxt-hairline--bottom"></div>
    </div>
  </div>
</template>

<script>
import api from '@/service/knowledge.service.js'
import detailApi from '@/service/kngDetail.service.js'
import Operations from './operations'
export default {
  components: {
    Operations
  },
  props: {
    kngInfoDetail: {
      type: Object
    },
    isShowProgress: {
      type: [Boolean, Number]
    },
    kngSchedule: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      kngId: this.$route.query.id, // 知识id
      courseId: this.$route.query.courseId,
      status: this.$route.query.status, // 是否是从审核页面过来
      isAddStudy: true,
      star: 5,
      relateLists: [], // 相关课程列表
      kngInfo: this.kngInfoDetail,
      kngContent: this.kngInfoDetail.description === null ? '' : this.kngInfoDetail.description,
      schedule: this.kngSchedule,
      conImage: this.kngInfoDetail.contributorsImage,
      relateLoading: false, // 相关课程加载
      tagIds: [] // 标签
    }
  },
  computed: {
    text () {
      if (this.schedule === 0) {
        return '0'
      }
      return this.schedule.toString()
    },
    avgCommonScore () {
      return Math.round(this.kngInfo.avgCommentScore)
    },
    // 是否是从审核中那边过来的
    isAudit () {
      if (this.status !== '' && this.status !== undefined && this.status !== null) {
        return this.status !== 4
      }
      return false
    }
  },
  created () {
    this.postRelatedCourses()
    let id = this.kngId ? this.kngId : this.courseId
    this.getTagIds(id)
  },
  mounted () {
    this.schedule = this.kngSchedule
  },
  methods: {
    // 相关课程
    postRelatedCourses () {
      this.relateLoading = false
      let bodyParams = {
        kngId: this.kngInfo.id
      }
      api.postRelatedCourses(bodyParams).then(res => {
        this.relateLists = res.splice(0, 5)
        this.relateLoading = true
      }).catch(err => {
        this.relateLoading = false
        console.log(err)
      })
    },
    // 相关课程路由跳转
    routerPlay (item) {
      // 项目跳转详情
      this.$router.skipKngDetail(0, item.fileType, '', item.id, this.$route.query.targetId, this.$route.query.targetCode, item.type)
    },
    // 获取标签
    getTagIds (id) {
      detailApi.getTagIds(id).then(res => {
        // 标签
        let kngTag = []
        res.datas.map(item => {
          let tagObj = {}
          tagObj.name = item.tagName
          tagObj.tagId = item.id
          kngTag.push(tagObj)
        })
        this.tagIds = kngTag
      }).catch(err => {
        this.$message.error(err.error.key)
      })
    }
  },
  watch: {
    kngSchedule (newv, oldv) { // 实时更新进度条
      this.schedule = newv
    }
  }
}
</script>
