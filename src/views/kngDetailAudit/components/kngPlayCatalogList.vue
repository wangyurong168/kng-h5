<template>
<ul>
  <li class="clearfix catalog-detail-list" v-for="(item,index) in catalogLists" :key="index">
    <div class="lh48 ph15 bg-f5 yui-list-flex" @click="isShowCatalog(item)">
      <div class="ellipsis font-size-14 text-26 yui-list-flex-1">
        <span class="pr10" v-if="index < 9">0{{index + 1}}</span>
        <span class="pr10" v-else>{{index + 1}}</span>
        <span>{{item.title}}</span>
      </div>
      <yxt-icon class="lh44" :name="item.show ? 'arrow-up' : 'arrow-down'"/>
    </div>
    <ul v-if="item.show" class="mh15">
      <li class="catalog-detail-container" :class="{'isactive':l.isLearn}" :key="i" v-for="(l, i) in item.chapterKng" @click="routerKngDetail(l, index, i)" >
        <div class="yui-list-flex">
          <div class="pv16 catalog-file-type pr">
            <yxt-svg-icon :baseurl='kngUrl' width="36px" height="43px" :icon-name="l.fileType === 'xuanyes' ? 'weike' : l.fileType" />
            <p class="kng-play-catalog" v-if="l.fileType === 'zip'">
              <span class="kng-play-catalog-text">不支持</span>
            </p>
          </div>
          <div class="ml10 pt16 pb16 yui-list-flex-1 pr">
            <!-- 标题 锁定 -->
            <div class="yui-list-flex">
              <div class="catalog-list-title yui-list-flex-1" :class="l.studying === 1 ? 'color-primary-6' : ''">{{l.title}}</div>
            </div>
            <!-- 学分 时长 进度 -->
            <div class="text-8c mt4 yui-list-flex" style="justify-content: space-between;">
              <!-- 学分 时长 -->
              <div class="yui-list-flex-1 font-size-12">
                <span class="mr13">学分 {{l.schedule === 100 ? l.studyScore : '0.0'}}/{{l.studyScore}}</span>
                <span>时长 {{formatHourMinuteSecond(l.studyHours)}}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="yxt-hairline--bottom"></div>
      </li>
    </ul>
  </li>
</ul>
</template>

<script>
import { formatHourMinuteSecond } from '@/core/formateDate'

export default {
  components: {},
  props: {
    kngInfo: {
      type: Object
    },
    chapterAllKng: {
      type: Array
    }
  },
  data () {
    return {
      formatHourMinuteSecond,
      isShow: 0, // 展开or收起
      showText: false, // 是否显示进度文字
      list: [], // 章节目录列表
      catalogLists: this.chapterAllKng // 目录列表
    }
  },
  created () {
    this.handlerControl()
  },
  methods: {
    handlerControl () {
      this.$emit('changeKngChapter')
    },
    // 点击章节跳转详情页
    routerKngDetail (l, index, i) {
      this.$emit('clickKngDetail', index, l, i)
    },
    // 章节展开or收起事件
    isShowCatalog (item) {
      item.show = !item.show
    }
  },
  watch: {
    chapterAllKng: {
      immediate: true,
      handler (val) {
        if (val.length) {
          this.catalogLists = val.map(l => ({ show: false, ...l }))
          this.catalogLists[0].show = true
        }
      }
    }
  }
}
</script>
