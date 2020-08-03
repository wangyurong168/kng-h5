<template>
<ul>
  <li class="clearfix catalog-detail-list" v-for="(item, index) in catalogLists" :key="index">
    <div class="lh48 ph15 bg-f5 yui-list-flex" @click="isShowCatalog(index)">
      <div class="ellipsis font-size-14 text-26 yui-list-flex-1">
        <span class="pr10" v-if="index < 9">0{{index + 1}}</span>
        <span class="pr10" v-else>{{index + 1}}</span>
        <span>{{item.title}}</span>
      </div>
      <yxt-icon class="lh44" :name="isShow === index ? 'arrow-up' : 'arrow-down'"/>
    </div>
    <ul v-if="isShow === index" class="ml15 mr4">
      <li class="catalog-detail-container" :class="{'isactive':chapter.isLearn}" :key="chapterIndex" v-for="(chapter, chapterIndex) in item.chapterKng" @click="routerKngDetail(chapter, index, chapterIndex)" >
        <div class="yui-list-flex">
          <div class="pv16 catalog-file-type pr">
            <yxt-svg-icon :baseurl='kngUrl' width="36px" height="43px" :icon-name="chapter.fileType === 'xuanyes' ? 'weike' : chapter.fileType" />
            <p class="kng-play-catalog" v-if="noSupportType(chapter)">
              <span class="kng-play-catalog-text">不支持</span>
            </p>
          </div>
          <div class="ml10 pt16 pb16 yui-list-flex-1 pr" :class="chapter.lock ? 'mr10' : ''">
            <!-- 标题 锁定 -->
            <div class="yui-list-flex">
              <div class="catalog-list-title yui-list-flex-1" :class="chapter.studying === 1 ? 'color-primary-6' : ''">{{chapter.title}}</div>
            </div>
            <!-- 学分 时长 进度 -->
            <div class="text-8c mt8 yui-list-flex" style="justify-content: space-between;">
              <!-- 学分 时长 -->
              <div class="yui-list-flex-1 font-size-12">
                <span class="mr13">学分 {{chapter.schedule === 100 ? chapter.studyScore : '0.0'}}/{{chapter.studyScore}}</span>
                <span>时长 {{comTimer(chapter.studyHours)}}</span>
              </div>
              <!-- 进度 -->
              <div class="demo-progress lh-17 w-100" v-if="!chapter.lock">
                <div class="box v-mid">
                  <yxt-progress class="v-mid" :percentage="chapter.schedule" :show-mask="true" :show-pivot="showText" stroke-width="6"/>
                </div>
                <span class="ml4 text-8c font-size-12 v-mid">{{chapter.schedule}}%</span>
              </div>
            </div>
          </div>
          <div class="catalog-flex-center">
            <!-- 锁定 -->
            <yxt-svg-icon :baseurl='h5Url' class="text-75" width="18px" height="18px" icon-name='lock' v-if="chapter.lock" />
          </div>
        </div>
        <div class="yxt-hairline--bottom"></div>
      </li>
    </ul>
  </li>
</ul>
</template>

<script>
export default {
  components: {},
  props: {
    kngInfo: {
      type: Object
    },
    chapterAllKng: {
      type: Array
    },
    orderControl: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      isShow: 0, // 展开or收起
      showText: false, // 是否显示进度文字
      list: [], // 章节目录列表
      catalogLists: this.chapterAllKng // 目录列表
    }
  },
  created () {
    if (this.kngInfo.orderControl === 1) {
      // 控制学习顺序处理
      this.handlerControl()
    }
  },
  methods: {
    handlerControl () {
      this.$emit('changeKngChapter')
    },
    // 点击章节跳转详情页
    routerKngDetail (chapter, index, chapterIndex) {
      this.$emit('clickKngDetail', chapter)
    },
    // 章节展开or收起事件
    isShowCatalog (index) {
      if (this.isShow === index) {
        this.isShow = null
      } else {
        this.isShow = index
      }
    },
    comTimer (time) {
      let t = parseInt(time)
      let d = Math.floor(t / (24 * 60 * 60))
      let h = Math.floor((t - (d * 24 * 60 * 60)) / (60 * 60))
      let m = Math.floor((t - (d * 24 * 60 * 60) - (h * 60 * 60)) / 60)
      let s = t - (d * 24 * 60 * 60) - (h * 60 * 60) - m * 60

      if (d > 0) {
        return `${d}天${h}时${m}分${s}秒`
      }
      if (h > 0) {
        return `${h}时${m}分${s}秒`
      }
      if (m > 0) {
        return `${m}分${s}秒`
      }
      return `${s}秒`
    },
    noSupportType (item) {
      return item.fileType === 'zip' || (item.fileType === 'scorm' && !item.isSupportApp) || (item.fileType === 'html' && !item.isSupportApp)
    }
  },
  watch: {
    chapterAllKng: {
      immediate: true,
      handler (val) {
        this.catalogLists = val
      }
    }
  }
}
</script>
