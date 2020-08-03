<template>
  <div class="yui-whole-page" v-if="myNoteloading">
    <div style="position: fixed; background: white; top: 0px;left: 0; z-index: 100; width: 100%;">
      <!-- 搜索框 -->
      <div class="search-container list-search mt10 ml15 mr15">
        <yxt-search :label="$t('kng_common_tip_search')" static @click="clickSearch"></yxt-search>
      </div>
      <div class="clearfix">
        <!-- 筛选区域 -->
        <div class="knglist knglist-header">
          <!-- 过滤条件 -->
          <div class="clearfix d-in-block knglist-filter">
            <div class="yxt-dropdown-menu__item pull-left pr wp-33 lh44" @click="showSub">
              <span class="yxt-dropdown-menu__title" :class="showCatalog ? 'yxt-dropdown-menu__title--active yxt-dropdown-menu__title--down' : ''">
                <div class="yxt-dropdown-menu__text yxt-ellipsis">{{firTitle}}</div>
                <i class="yxt-icon yxt-icon-arrow-down yxt-dropdown-menu__arrow" :class="showCatalog ? 'yxt-icon-arrow-up' : ' yxt-icon-arrow-down'"></i>
              </span>
            </div>
            <yxt-dropdown-menu class="pull-left lh44 wp-66">
              <yxt-dropdown-item v-model="fileType" :options="kngTypes" @open="showCatalog = false" @change="selectKngType" />
              <yxt-dropdown-item v-model="orderIndex" :options="orderList" @open="showCatalog = false" @change="selectOrderFn"/>
            </yxt-dropdown-menu>
          </div>
        </div>
        <div class="yxt-hairline--top" style="position: fixed;z-index: 1000;width:100%;margin-top: 44px"></div>
        <!--虚化列表-->
        <div v-show="showCatalog" @touchmove.prevent @mousewheel.prevent class="touch-prevent menu-filter" @click="showCatalog = false"></div>
        <!-- 目录列表 -->
        <catalog-list id="catalog" class="menu-container over-auto"
          v-if="showCatalog"
          :index="index"
          :catalogs="catalogs"
          :path="catalogPath"
          :goCatalogIndex="goCatalogIndex"
          @selectAll="searchAll"
          @select="getChildrenCatalogs"
          @releaseCatalogs="releaseCatalogs">
        </catalog-list>
        <!-- 知识列表 -->
      </div>
    </div>
    <!-- <div class="yxt-hairline--top"></div> -->
    <yxt-list class="ml15 mr15 mt110"
      v-model="loading"
      :finished="finished"
      :finished-text="$t('kng_list_lbl_nomore')"
      v-if="kngListData.length > 0"
      @load="onLoad">
      <ul class="self-study-list">
        <li class="clearfix list-reset pb20 pt5" v-for="item in kngListData" :key="item.id" @click="openKng(item)">
          <!-- 图片 -->
          <div class="pull-left hand">
            <div v-if="item.isNew" class="knglist-New">
              <div class="knglist-new-text">NEW</div></div>
            <div class="clearfix"  style="position: relative">
              <img :src="item.coverUrl" width="116" height="65" class="d-in-block border-r-4">
              <div v-if="item.appEnabled === 0" class="knglist-isnotapp" style="position: absolute;bottom: 0px;" >{{$t('kng_list_lbl_noapp')}}</div>
            </div>
          </div>
          <div class="ml10 self-list-info">
            <!-- 标题 -->
            <div class="ellipsis">
              <span class="knglist-li-title" :title="item.title">{{ item.title }}</span>
            </div>
            <!-- 学习打分-->
            <div class="mt6">
              <span><yxt-rate v-model="item.avgCommentScore" readonly class="d-in-block pr bottom2" color="#FA9A02" void-color="#E9E9E9" gutter="4px" size="10px"></yxt-rate></span>
              <span class="text-fa8 font-size-12 ml20" v-show="item.price>0">{{$t('kng_list_lbl_price',{num: item.price||0})}}</span>
            </div>
            <!-- 学习人数 学分 -->
            <div class="mt6 knglist-li-text">
              <span>{{$t('kng_list_lbl_study',{num: item.studyCount})}}</span>
              <span class="ml12">{{$t('kng_list_lbl_scrore',{num: item.studyScore||0})}}</span>
            </div>
          </div>
        </li>
      </ul>
      </yxt-list>
      <yxt-empty v-if="isShowNoData">
        <div class="title">{{$t('kng_common_lbl_nodata')}}</div>
      </yxt-empty>
  </div>
  <div class="yui-screen-page" v-else>
    <yxt-loading text-size="16px">{{$t('kng_common_msg_loading')}}</yxt-loading>
  </div>
</template>

<script>
import api from '@/service/knowledge.service.js'
import catalogList from '@/components/kngCatalogList'
import moment from 'moment'
// import { isNotEmpty } from '@/core/utils'
export default {
  name: '',
  beforeRouteEnter (to, from, next) {
    api.getkngConfCatalog().then(data => {
      if (data.enabled) {
        next(vm => {
          if (!vm.$route.query.pid) {
            vm.$router.replace({ name: 'catalogs' })
          }
        })
      } else {
        next()
      }
    }).catch(() => {
      window.history.go(-1)
    })
  },
  components: {
    catalogList
  },
  props: {},
  data () {
    let knowledgesSelectedStatus = window.getLocalStorage('knowledgesSelectedStatus') // 取本地的知识的选择状态
    let tmp = {
      fileType: null, // 文件类型
      orderIndex: 0, // 排序类型, 默认为0
      id: '', // 最近搜索的目录id
      name: this.$t('kng_common_lbl_allcatalog'), // 最近搜索的目录name
      path: [], // 最近搜索的目录路径, 比如:[2,2,3]第一级目录中第三个目录,第二级目录中第三个目录
      catalogIds: [], // 对应层级目录中的catalogid
      isNotStarted: true // 标识是否初始状态, 不是的下次进来运行上一次搜索状态
    }
    if (typeof knowledgesSelectedStatus === 'string') {
      knowledgesSelectedStatus = window.JSON.parse(knowledgesSelectedStatus)
      knowledgesSelectedStatus = Object.assign(tmp, knowledgesSelectedStatus)
    } else {
      knowledgesSelectedStatus = tmp
    }
    return {
      myNoteloading: false,
      goCatalogId: '',
      goSubCatalogId: '',
      index: 0,
      showCatalog: false,
      catalogPath: knowledgesSelectedStatus.path,
      goCatalogIndex: -1,
      goSubCatalogIndex: -1,
      items: [],
      firTitle: this.$t('kng_common_lbl_allcatalog'),
      selectCataTitle: this.$t('kng_common_lbl_allcatalog'),
      activeId: 1,
      activeIndex: 0,
      searchText: '',
      // 排序类型 0发布时间 1推荐次数 2学习人数 3名称 4更新时间
      orderList: [{
        value: 0,
        text: this.$t('kng_list_lbl_createtime')
      }, {
        value: 1,
        text: this.$t('kng_list_lbl_recommendlevel')
      }, {
        value: 2,
        text: this.$t('kng_list_lbl_studycount')
      }, {
        value: 3,
        text: this.$t('kng_list_lbl_kngtitle')
      }, {
        value: 4,
        text: this.$t('kng_list_lbl_updatetime')
      }],
      // 知识类型
      fileType: null,
      kngTypes: [{
        value: null,
        text: this.$t('kng_common_lbl_all_type')
      }, {
        value: 0,
        text: this.$t('kng_common_lbl_course')
      }, {
        value: 1,
        text: this.$t('kng_common_lbl_doc')
      }, {
        value: 2,
        text: this.$t('kng_common_lbl_video')
      }, {
        value: 3,
        text: this.$t('kng_common_lbl_audio')
      }, {
        value: 4,
        text: this.$t('kng_common_lbl_weike')
      }, {
        value: 5,
        text: this.$t('kng_common_lbl_scorm')
      }, {
        value: 6,
        text: this.$t('kng_common_lbl_html')
      }], // 类型
      loading: false,
      finished: false,
      // 知识列表
      kngListData: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      totalPage: 0,
      orderType: 'desc',
      orderBy: '',
      currentCatalogid: '', // 当前选中的目录id
      currentParentId: '', // 当前的父目录id
      catalogTree: [],
      catalogList: [],
      catalogs: [],
      knowledgesSelectedStatus: knowledgesSelectedStatus,
      orderIndex: 0,
      goCatalogName: '',
      goSubCatalogName: '',
      isShowLoading: false,
      fIndex: 0, // 文件搜索类型
      oIndex: 0 // 排序类型
    }
  },
  computed: {
    isShowNoData () {
      return !this.isShowLoading && this.kngListData.length === 0 // 不在loading状态 并且comments > 0
    }
  },
  created () {
    if (window.isApp) {
      let param = {
        isShowheader: true,
        title: this.$t('kng_project_tit_index')
      }
      window.AppProtocol.setNavTitle(param)
    }
    if (this.$route.query.pid) {
      this.goCatalogId = this.$route.query.pid // 指定的一级目录
    }
    if (this.$route.query.cid && this.$route.query.cid !== '') {
      this.goSubCatalogId = this.$route.query.cid // 指定的二级目录
      // this.currentCatalogid = this.goCatalogId
    }
    this.__recordOrderIndex()
    if (!window.isApp && !this.isInitStatus()) {
      this.setSort(this.orderIndex)
      this.getKngList()
    } else if (this.$store.getters['knowledge/pushCatalogInfo']) {
      if (this.$store.getters['knowledge/pushCatalogInfo'].ids.length > 0) {
        this.getKngByCatalogs()
      }
    } else {
      // 获取一级目录和知识列表
      this.getTopKngCatalog()
    }
    // this.$nextTick(this.getKngList())
    // this.getKngList()
    // 阻止滚动
    $('.touch-prevent').on('touchmove', function (e) {
      e.preventDefault()
    })
  },
  methods: {
    getKngList () {
      // 加载数据初始化
      window.scrollTo(0, 0)
      this.finished = false
      this.loading = false
      this.kngListData = []
      this.currentPage = 1
      this.myNoteloading = false
      let bodyParams = {
        catalogId: this.currentCatalogid,
        title: this.searchText,
        type: this.fileType
      }
      let linkParams = {
        limit: this.pageSize,
        offset: (this.currentPage - 1) * this.pageSize,
        orderType: this.orderType,
        orderBy: this.orderBy
      }
      api.postGetKngListWeb(linkParams, bodyParams).then((res) => {
        if (res !== null && res.data !== null) {
          if (res.datas) {
            res.datas.forEach(item => {
              item.isNew = this.isNewKng(item.createTime)
              item.avgCommentScore = Math.round(item.avgCommentScore)
            })
          }
          this.kngListData = res.datas
          this.total = res.paging.count
          this.totalPage = res.paging.pages
          // this.loading = false
          this.firTitle = this.selectCataTitle.length > 6 ? this.selectCataTitle.substring(0, 6) : this.selectCataTitle
        }
        this.myNoteloading = true
      }).catch((err) => {
        this.$toast.fail(this.$t(err.error.key))
        this.myNoteloading = true
      })
    },
    loadMore () {
      this.currentPage += 1
      let bodyParams = {
        catalogId: this.currentCatalogid,
        title: this.searchText,
        type: this.fileType
      }
      let linkParams = {
        limit: 10,
        offset: (this.currentPage - 1) * 10,
        orderType: this.orderType,
        orderBy: this.orderBy
      }
      api.postGetKngListWeb(linkParams, bodyParams).then((res) => {
        if (res.datas) {
          res.datas.forEach(item => {
            item.isNew = this.isNewKng(item.createTime)
            item.avgCommentScore = Math.round(item.avgCommentScore)
          })
        }
        this.kngListData = this.kngListData.concat(res.datas)
        // this.total = res.paging.count
        // 获得当前最大页数
        // this.totalPage = res.paging.pages
      }).catch(() => {
        this.$toast.fail(this.$t('kng_list_msg_error'))
      })
    },
    selectOrderFn (val) {
      this.showCatalog = false
      // 记录到本地
      this.__setKnowledgesSelectedStatus({ orderIndex: val })
      window.setLocalStorage('knowledgeOrderIndex_' + window.getLocalStorage('userId'), val)
      this.setSort(val)
      this.getKngList()
    },
    /**
     * 检查知识是不是初始状态
     * @returns {boolean}
     */
    isInitStatus () {
      // 没有改变过筛选的状态
      if (this.knowledgesSelectedStatus.isNotStarted) {
        return true
      }
      this.currentCatalogid = this.knowledgesSelectedStatus.id
      this.fileType = this.fIndex = this.knowledgesSelectedStatus.fileType // window.parseInt(this.knowledgesSelectedStatus.fileType)
      this.orderIndex = this.oIndex = this.knowledgesSelectedStatus.orderIndex // window.parseInt(this.knowledgesSelectedStatus.orderIndex)
      // 设置目录,文件,排序的名称
      this.selectCataTitle = this.knowledgesSelectedStatus.name
      // this.__setSecondTitle(this.fIndex)
      // 排序类型
      // this.__setThirdTitle(this.oIndex)
      // 默认排序是按发布时间,强制改为0
      // if (this.oIndex === -1) {
      //   this.orderIndex = this.oIndex = 0
      // }
      // 生成空数组,占位给splice使用
      this.catalogs = new Array(this.knowledgesSelectedStatus.path.length)
      // 获取第一级目录
      let bodyParams = {
        parentId: '',
        pmType: 0
      }
      api.postGetChildCatalogList(bodyParams).then((res) => {
        let parentList = []
        if (res) {
          for (let i = 0; i < res.length; i++) {
            let catalog = {
              carousel: null,
              catalogname: res[i].name,
              id: res[i].id,
              parentid: res[i].parentId
            }
            parentList.push(catalog)
          }
          this.catalogs.splice(0, 1, parentList)
        }
      }).catch((err) => {
        this.warning(err.key)
      })
      this.knowledgesSelectedStatus.path.forEach((v, i) => {
        // 获取子目录
        let bodyParams1 = {
          parentId: this.knowledgesSelectedStatus.catalogIds[i],
          pmType: 0
        }
        this.knowledgesSelectedStatus.catalogIds[i] && api.postGetChildCatalogList(bodyParams1)
          .then((res) => {
            let cataloglist = []
            if (res) {
              for (let j = 0; j < res.length; j++) {
                let catalog = {
                  carousel: null,
                  catalogname: res[j].name,
                  id: res[j].id,
                  parentid: res[j].parentId
                }
                cataloglist.push(catalog)
              }
              if (cataloglist.length > 0) {
                this.catalogs.splice(i + 1, 1, cataloglist)
              }
            }
          })
      })
      return false
    },
    openKng (item) {
      if (item.appEnabled === 0) {
        this.$toast(this.$t('kng_list_msg_notapp'))
      } else {
        // 判断是否是非wifi下
        api.getKnowledgeType(item.id).then((res) => {
          if (item.fileType === 'zip') {
            this.$toast(this.$t('kng_list_msg_nozip'))
          } else if (item.fileType === 'course') {
            this.$router.skipKngDetail(0, res.fileType, item.id, '', '', 'kng', 0)
          } else {
            this.$router.skipKngDetail(0, res.fileType, '', item.id, '', 'kng', 0)
          }
        }).catch(() => {
          this.$toast.fail(this.$t('kng_list_msg_notexist'))
        })
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
    },
    getChildrenCatalogs ({ id, name, path = [], orderIndex }) {
      let bodyParams = {
        parentId: id,
        pmType: 0
      }
      api.postGetChildCatalogList(bodyParams).then((res) => {
        let cataloglist = []
        if (res) {
          for (let i = 0; i < res.length; i++) {
            let catalog = {
              carousel: null,
              catalogname: res[i].name,
              id: res[i].id,
              parentid: res[i].parentId
            }
            cataloglist.push(catalog)
          }
          if (cataloglist.length > 0) {
            // if (id === result.parentid) {
            let catalogIds = []
            path.forEach((v, i) => {
              catalogIds[i] = this.catalogs[i][v].id
            })
            this.__setKnowledgesSelectedStatus({ id: id, name: name, path: path, catalogIds: catalogIds, orderIndex: orderIndex }) // 记录用户点击的目录
            this.catalogs.push(cataloglist)
            // }
          } else {
            this.searchAll({ id, name, path, orderIndex })
          }
        }
      }).catch(err => {
        console.log(err)
      })
    },
    searchAll ({ id, name, path = [], orderIndex }) {
      let catalogIds = []
      path.forEach((v, i) => {
        catalogIds[i] = this.catalogs[i][v].id
      })
      this.catalogPath = path
      this.__setKnowledgesSelectedStatus({ id: id, name: name, path: path, catalogIds: catalogIds, orderIndex: orderIndex }) // 记录用户点击的目录
      this.currentCatalogid = id
      this.selectCataTitle = name
      // this.orderIndex = this.oIndex = orderIndex
      this.showCatalog = false
      // 获取当前选择目录的排序类型
      this.getCatalogInfo()
      // this.setSort(val)
      // this.getKngList()
    },
    releaseCatalogs (parent) {
      // 去除原来的子目录 准备添加进新的子目录
      this.catalogs = this.catalogs.slice(0, parent + 1)
    },
    /**
     * 获取知识一级目录列表
     */
    getTopKngCatalog () {
      let bodyParams = {
        parentId: '',
        pmType: 0
      }
      api.postGetChildCatalogList(bodyParams).then((res) => {
        let parentList = []
        if (res) {
          for (let i = 0; i < res.length; i++) {
            let catalog = {
              carousel: null,
              catalogname: res[i].name,
              id: res[i].id,
              parentid: res[i].parentId
            }
            parentList.push(catalog)
          }
          this.catalogs.push(parentList)
          // 指定目录 第一级
          if (this.goCatalogId && this.goCatalogId !== '') {
            for (let i in parentList) {
              if (parentList[i].id === this.goCatalogId) {
                this.goCatalogIndex = window.parseInt(i) // 目录索引
                this.goCatalogName = parentList[i].catalogname // 目录名称
                break
              }
            }
          }
          // 跳转第三方目录
          this.gotoStdLib(this.goCatalogId, this.goCatalogName)
        }
      }).catch(err => {
        console.log(err)
      })
      // let list = this.catalogTree.find(d => d.parentId === '')
      // knowledgeService.getTopKngCatalogs().then((res) => {
      //   let resultData = res.data.datas
      //   this.catalogs.push(resultData)
      //   // 指定目录
      //   if (this.goCatalogId) {
      //     for (let i in resultData) {
      //       if (resultData[i].id === this.goCatalogId) {
      //         this.goCatalogIndex = window.parseInt(i) // 目录索引
      //         this.goCatalogName = resultData[i].catalogname // 目录名称
      //         break
      //       }
      //     }
      //   }
      //   // 跳转第三方目录
      //   this.gotoStdLib(this.goCatalogId, this.goCatalogName)
      // }).catch(() => {
      //   // 页面自动获取知识列表
      //   this.loadMoreDisable = false
      // })
    },
    /**
     * 设置知识被选择的状态,存入本地
     * @param merge -{object} 状态更新的对象
     * @private 只在内部函数使用
     */
    __setKnowledgesSelectedStatus (merge) {
      this.knowledgesSelectedStatus.isNotStarted = false
      this.knowledgesSelectedStatus = Object.assign(this.knowledgesSelectedStatus, merge)
      window.setLocalStorage('knowledgesSelectedStatus', window.JSON.stringify(this.knowledgesSelectedStatus))
    },
    selectKngType (index) {
      this.__setKnowledgesSelectedStatus({ fileType: index }) // 知识类型的索引
      this.getKngList()
    },
    showSub () {
      if (this.showCatalog) {
        this.showCatalog = false
      } else {
        this.showCatalog = true
      }
    },
    isNewKng (createTime) {
      let end = moment(createTime).add(1, 'days').format('YYYY/MM/DD HH:mm:ss')
      let now = moment(new Date()).format('YYYY/MM/DD HH:mm:ss')
      return end > now
    },
    // 跳转第三方catalog 第一级
    gotoStdLib (id, name) {
      if (id && name) {
        // 获取二级目录
        let bodyParams = {
          parentId: id,
          pmType: 0
        }
        api.postGetChildCatalogList(bodyParams).then((res) => {
          let parentList = []
          if (res) {
            for (let i = 0; i < res.length; i++) {
              let catalog = {
                carousel: null,
                catalogname: res[i].name,
                id: res[i].id,
                parentid: res[i].parentId
              }
              parentList.push(catalog)
            }
            this.catalogs.push(parentList)
            // 如果是从第二级跳转还要再匹配一层目录
            // 指定目录 第二级
            if (this.goSubCatalogId && this.goSubCatalogId !== '') {
              for (let i in parentList) {
                if (parentList[i].id === this.goSubCatalogId) {
                  this.goSubCatalogIndex = window.parseInt(i) // 目录索引
                  this.goSubCatalogName = parentList[i].catalogname // 目录名称
                  break
                }
              }
            }
            // 跳转第三方目录 第二级
            this.gotoSubStdLib(this.goSubCatalogId, this.goSubCatalogName)
          }
        }).catch(err => {
          console.log(err)
        })
        if (this.goSubCatalogId === '') {
          this.searchAll({ id, name, path: [this.goCatalogIndex] })
        }
      } else {
        // this.loadMoreDisable = false // 如果没有指定标准库,则放开scroll加载事件
        this.getKngList()
      }
    },
    // 跳转第三方catalog 第二级
    gotoSubStdLib (id, name) {
      if (id && name) {
        // 获取二级目录
        let bodyParams = {
          parentId: id,
          pmType: 0
        }
        api.postGetChildCatalogList(bodyParams).then((res) => {
          let parentList = []
          if (res) {
            for (let i = 0; i < res.length; i++) {
              let catalog = {
                carousel: null,
                catalogname: res[i].name,
                id: res[i].id,
                parentid: res[i].parentId
              }
              parentList.push(catalog)
            }
            this.catalogs.push(parentList)
          }
        }).catch(err => {
          console.log(err)
        })
        this.searchAll({ id, name, path: [this.goCatalogIndex, this.goSubCatalogIndex] })
      } else {
        // this.loadMoreDisable = false // 如果没有指定标准库,则放开scroll加载事件
        this.getKngList()
      }
    },
    // 获取目录默认排序
    getCatalogInfo () {
      if (this.currentCatalogid) {
        let bodyParams = {
          catalogId: this.currentCatalogid
        }
        api.postSearchConfigure(bodyParams).then((res) => {
          // 0发布时间 1推荐次数 2学习人数 3名称 4更新时间
          if (res.orderType && res.orderType >= 0) {
            this.orderIndex = res.orderType
          } else {
            this.orderIndex = 0
          }
          // 记录到本地
          this.__setKnowledgesSelectedStatus({ orderIndex: this.orderIndex })
          this.setSort(res.orderType)
          // 刷新页面
          this.getKngList()
        }).catch(err => {
          console.log(err)
        })
      } else {
        this.orderIndex = 0
        // 记录到本地
        this.__setKnowledgesSelectedStatus({ orderIndex: this.orderIndex })
        this.setSort(this.orderIndex)
        // 刷新页面
        this.getKngList()
      }
    },
    // 目录记忆功能设置
    getKngByCatalogs () {
      let pushCatalogInfo = this.$store.getters['knowledge/pushCatalogInfo']
      let allCatalogs = this.$store.getters['knowledge/catalogs']
      let rootCatalogs = allCatalogs.filter(v => {
        return v.parentid === ''
      })
      this.catalogs.push(rootCatalogs)
      // 设置二级目录
      if (pushCatalogInfo.ids[0]) {
        let secCatalogs = allCatalogs.filter(v => {
          return v.parentid === pushCatalogInfo.ids[0]
        })
        this.catalogs.push(secCatalogs)
      }
      // 设置三级目录
      if (pushCatalogInfo.ids[1]) {
        let thiCatalogs = allCatalogs.filter(v => {
          return v.parentid === pushCatalogInfo.ids[1]
        })
        this.catalogs.push(thiCatalogs)
      }
      // 设置四级目录
      if (pushCatalogInfo.ids[2]) {
        let fouCatalogs = allCatalogs.filter(v => {
          return v.parentid === pushCatalogInfo.ids[2]
        })
        this.catalogs.push(fouCatalogs)
      }
      // 搜索知识
      this.currentCatalogid = pushCatalogInfo.ids[pushCatalogInfo.path.length - 1]
      this.searchText = pushCatalogInfo.name
      this.catalogPath = pushCatalogInfo.path
      this.orderIndex = this.oIndex = pushCatalogInfo.orderIndex
      this.__setKnowledgesSelectedStatus({ id: this.currentCatalogid, name: this.selectCataTitle, path: this.catalogPath, catalogIds: pushCatalogInfo.ids, orderIndex: this.orderIndex })
      // this.searchKng()
    },
    // 根据排序类型设置当前目录默认排序
    setSort (val) {
      if (val) {
        switch (val) {
          case 0:
            this.orderBy = 'createTime'
            this.orderType = 'desc'
            break
          case 1:
            this.orderBy = 'recommendLevel'
            this.orderType = 'desc'
            break
          case 2:
            this.orderBy = 'studyCount'
            this.orderType = 'desc'
            break
          case 3:
            this.orderBy = 'title'
            this.orderType = 'asc'
            break
          case 4:
            this.orderBy = 'updateTime'
            this.orderType = 'desc'
            break
          default:
            this.orderType = ''
            this.orderBy = ''
            break
        }
      } else {
        this.orderType = ''
        this.orderBy = ''
      }
    },
    /**
       * 记录orderindex的排序的方式
       * 持久化，不作主动删除操作
       */
    __recordOrderIndex () {
      this.oIndex = this.orderIndex = Number.parseInt(window.getLocalStorage('knowledgeOrderIndex_' + window.getLocalStorage('userId')) || '0')
      if (this.oIndex > 0) {
        // this.__setThirdTitle(this.oIndex)
        this.__setKnowledgesSelectedStatus({ isNotStarted: this.knowledgesSelectedStatus.isNotStarted, orderIndex: this.oIndex })
      }
    },
    clickSearch () {
      window.location.href = window.location.origin + '/search/#/gs/composite'
    }
  },
  watch: {
    searchText (to, from) {
      this.searchText = to
      this.getKngList()
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .yxt-popup--top.yxt-popup--round {
  border-radius: 0;
}
</style>
