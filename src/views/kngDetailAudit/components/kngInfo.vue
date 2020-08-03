<template>
  <div class="pl15 pr15 pt20 over-hidden">
    <!-- 详情标题 -->
    <div class="yui-kngdetail-page mb20">
      <h2 class="mr15 font-size-18 lh25 break font-w-600" style="flex:1">{{kngInfo.title}}</h2>
    </div>
    <div class="yxt-hairline--bottom"></div>
    <!-- 简介 -->
    <div class="pt20 pb20 pr">
      <h2 class="font-size-18 font-w-600">简介</h2>
      <div>
        <ul>
          <li v-for="item in tagIds" :key="item.tagId" class="kngtag ph10 pv3 d-in-block bg-f5 ml10 mt10 nowrap over-hidden border-r-12">
            {{ item.name }}
          </li>
        </ul>
        <!-- 简介 -->
        <div class="text-59 lh24 font-size-14 break ml10" :class="tagIds.length > 0 ? 'mt10' : 'mt15'" v-html="kngContent" v-if="kngContent.length > 0"></div>
        <div class="font-size-14 text-59 mt15 ml10" v-else>暂无简介</div>
        <template  v-if="computeStatusSvg">
          <yxt-svg-icon class='detailAudit__svg' :baseurl='kngUrl' width="72px" height="66px"
                        :icon-name="computeStatusSvg" />
        </template>
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
  </div>
</template>

<script>
import detailApi from '@/service/kngDetail.service.js'

export default {
  components: {
  },
  props: {
    kngInfoDetail: {
      type: Object
    }
  },
  data () {
    return {
      kngId: this.$route.query.id, // 知识id
      courseId: this.$route.query.courseId,
      kngInfo: this.kngInfoDetail,
      kngContent: this.kngInfoDetail.description === null ? '' : this.kngInfoDetail.description,
      conImage: this.kngInfoDetail.contributorsImage,
      tagIds: [] // 标签
    }
  },
  created () {
    let id = this.kngId || this.courseId
    this.getTagIds(id)
  },
  computed: {
    computeStatusSvg () {
      const Maper = {
        0: '',
        1: 'tag-pass',
        2: 'tag-reUpload'
      }
      return Maper[this.kngInfo.auditStatus]
    }
  },
  methods: {
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
  }
}
</script>
