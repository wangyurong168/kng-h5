<template>
  <div class="yui-whole-page ph10 pv10">
    <!-- 搜索框 -->
    <div class="search-container">
      <yxt-search label="搜索" static @click="clickSearch"></yxt-search>
    </div>
    <div class="top-banner" v-if="isShowBanner">
      <yxt-image :src="backgroundImageUrl" radius="4" height="90px" @click="openUrl"/>
    </div>
    <div class="catalog-list mt20">
      <ul>
        <li class="first-level font-size-16 text-26 mb30" v-for="(firstLevel, index) in cataloglist" :key="index">
          <!-- 一级目录开始 -->
          <div class="clearfix" @click="toKngList([index], firstLevel.label,firstLevel.id,'')">
            <div class="kng-catalog-title pull-left wp-95">
              <div class="line-1 text-standard-size-16 font-w-600 v-mid">{{firstLevel.label}}</div>
              <yxt-icon name="arrow" class="ml3 v-mid" />
            </div>
          </div>
          <!-- 一级目录结束 -->
          <!-- 二级目录开始 -->
          <ul class="clearfix mt10 second-level-ul pr">
            <li class="second-level pull-left line-1 text-standard-size-14 mt10 text-59" v-for="(secondLevel, i) in firstLevel.children.slice(0, firstLevel.lastIndex)" :key="i" @click.stop="toKngList([index, i], secondLevel.label,firstLevel.id,secondLevel.id)">
              {{secondLevel.label}}
            </li>
            <li v-if='firstLevel.children.length > MAXCATALOGS' @click.stop="toggle(firstLevel)" class="second-level pull-left mt10 text-standard-size-14 text-59 mt10">
              <span>{{firstLevel.lastIndex == firstLevel.children.length ? '收起': '展开'}}</span>
              <yxt-icon name="arrow-up" class="ml4 lh34" v-if="firstLevel.lastIndex === firstLevel.children.length" />
              <yxt-icon name="arrow-down" class="ml4 lh34" v-else />
            </li>
          </ul>
          <!-- 二级目录结束 -->
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import api from '@/service/knowledge.service.js'
export default {
  name: 'Catalogs',
  data () {
    return {
      cataloglist: [],
      lastIndex: [],
      canClick: false,
      backgroundImageUrl: '',
      isShowBanner: false,
      redirectUrl: '',
      searchText: '',
      MAXCATALOGS: 9 // 最大展示三级目录数量
    }
  },
  created () {
    window.removeLocalStorage('knowledgesSelectedStatus') // 进首页清除知识中选择的状态

    Promise.all([this.getCatalogTree(), this.getBannerInfo()]).then().catch(err => {
      console.log(err)
    })
  },
  methods: {
    getCatalogTree () {
      let bodyParams = {
        pmType: 0
      }
      api.postGetCatalogTree(bodyParams).then((res) => {
        res.catalogTree.forEach(item => {
          if (item.label && item.label !== '') {
            // 设置目录二级目录最大的index
            if (item.children.length > this.MAXCATALOGS) {
              this.$set(item, 'lastIndex', this.MAXCATALOGS - 1)
            } else {
              this.$set(item, 'lastIndex', this.MAXCATALOGS)
            }
            this.cataloglist.push(item)
          }
        })
      }).catch(err => {
        console.log(err)
      })
    },
    // 获取banner配置信息
    getBannerInfo () {
      api.getkngConfCatalog().then(res => {
        if (res.backgroundImageUrl && res.backgroundImageUrl !== '') {
          this.isShowBanner = true
          this.backgroundImageUrl = res.backgroundImageUrl
        }
        this.canClick = res.clickEffect === 1
        this.redirectUrl = res.redirectUrl
      }).catch(err => {
        console.log(err)
      })
    },
    toKngList (path, name, pid, cid) {
      // 当前目录的状态
      this.$store.commit('knowledge/pushCatalogInfo', {
        pushCatalogInfo: {
          ids: [pid, cid],
          path: path,
          name: name
        }
      })
      this.$router.push({
        path: '/index',
        query: {
          cid: cid,
          pid: pid
        }
      })
    },
    openUrl () {
      if (this.canClick) {
        window.open(this.redirectUrl)
      }
    },
    toggle (secId) {
      if (secId.lastIndex === secId.children.length) {
        if (secId.children.length > this.MAXCATALOGS) {
          secId.lastIndex = this.MAXCATALOGS - 1
        } else {
          secId.lastIndex = this.MAXCATALOGS
        }
      } else {
        secId.lastIndex = secId.children.length
      }
    },
    // 搜素头部全文检索
    clickSearch () {
      window.location.href = window.location.origin + '/search/#/gs/composite'
    }
  }
}
</script>
