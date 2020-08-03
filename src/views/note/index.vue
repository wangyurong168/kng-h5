<template>
  <div class="yui-whole-page" v-if="listloading">
    <div>
      <yxt-dropdown-menu class="notelist-header " style="height: 44px;padding-left:15px;padding-right:15px">
        <yxt-dropdown-item v-model="noteType" :options="noteList" @change="changeList"/>
        <yxt-dropdown-item v-model="Type" :options="typeList" @change="changeType"/>
        <yxt-dropdown-item v-model="noteTime" :options="timeList" @change="searchByTime"/>
        <!-- <yxt-dropdown-item v-model="noteTime" :options="option2" /> -->
        <div class="note-icon-style" @click="addNote">
          <yxt-svg-icon :baseurl='h5Url' icon-name='note' />
        </div>
      </yxt-dropdown-menu>
      <div class="yxt-hairline--top" style="position: fixed;z-index: 1000;width:100%;margin-top: 44px"></div>
      <!-- <div style="position: fixed;z-index: 1000;width:100%;height:1px;background:rgba(233,233,233,1);margin-top: 44px"></div> -->
      <!-- 我的笔记列表 -->
      <!-- <yxt-loading v-if="myNoteloading">
      </yxt-loading> -->
      <yxt-list class="note mt44"
      v-model="loading1"
      :finished="finished1"
      :finished-text="$t('kng_list_lbl_nomore')"
      @load="onLoad1"
      v-if="noteType === 0 && myNoteList.length > 0">
      <ul>
        <li  class="clearfix pt20" v-for="(item) in myNoteList" :key="item.id">
          <div>
            <div>
              <span class="text-bf">{{ item.updateTime ? item.updateTime.slice(0, 16) : '' }}</span>
              <span class="text-bf">{{$t('kng_mynote_lbl_favoritylike',{num1:item.supportCountVal||0, num2: item.favoriteCount||0})}}</span>
              <div class="pull-right">
                <!-- <div class="d-in-block hand" v-if="item.supported!==1" @click="likeNote(item.id,index)">
                  <yxt-svg-icon class="text-8c" :baseurl='h5Url' icon-name='like' width="16" height="16" style="position: relative;vertical-align: middle;"/>
                  <span class="ml3 text-8c" style="vertical-align: middle;">{{ item.supportCount>0 ? item.supportCountVal :'' }}</span>
                </div>
                <div class="d-in-block" v-if="item.supported===1">
                  <yxt-svg-icon :baseurl='h5Url' icon-name='liked' width="16" height="16" style="position: relative;vertical-align: middle;"/>
                  <span class="ml3 notelist-highlight" style="vertical-align: middle;">{{ item.supportCountVal }}</span>
                </div> -->
                <div class="d-in-block ml16" @click="showHandle(item)">
                  <yxt-svg-icon :baseurl='h5Url' icon-name='more' width="16" height="16" style="color: #8C8C8C;position: relative;vertical-align: middle"/>
                </div>
              </div>
            </div>
            <div class="mt10 clearfix ellipsis-3" style="line-height: 22px;">
              <span class="mr10" v-if="item.important===1||item.opened===1">
                <span v-if="item.important===1" class="d-in-block notelist-important mr5">{{$t('kng_mynote_lbl_important')}}</span>
                <span v-if="item.opened===1" class=" d-in-block notelist-open">{{$t('kng_mynote_lbl_open')}}</span>
              </span>
              <span class="notelist-content"  @click="viewNote(item.id)">{{item.content}}</span>
            </div>
            <div v-if="item.type===0" class="mt10 notelist-title ellipsis" :title="item.title"> {{$t('kng_mynote_lbl_title')}}{{ item.title }}</div>
            <div v-if="item.type===1" class="mt10 notelist-title ellipsis" :title="item.title" @click="openKng(item.kngId)">{{$t('kng_mynote_lbl_title')}}{{ item.title }}<yxt-svg-icon :baseurl='h5Url' class="pull-right text-8c" icon-name='right' width="16" style="position: relative;vertical-align: middle;"/></div>
          </div>
          <div class="yxt-hairline--bottom pt20"></div>
        </li>
      </ul>
      </yxt-list>
      <yxt-empty v-if="isShowNoData1">
        <div class="title">{{$t('kng_common_lbl_nodata')}}</div>
      </yxt-empty>
      <yxt-list class="note mt44"
      v-model="loading2"
      :finished="finished2"
      :finished-text="$t('kng_list_lbl_nomore')"
      @load="onLoad2"
      v-if="noteType === 1 && otherNoteList.length > 0">
        <!-- 他人的笔记列表 -->
        <ul class="self-study-list">
          <li class="clearfix pv20 yxt-hairline--bottom list-reset" v-for="(item) in otherNoteList" :key="item.id">
            <div class="clearfix pull-left">
              <yxt-image style="width:36px; height:36px;vertical-align: middle;" round  :src="item.imgUrl" />
            </div>
            <div class="clearfix self-list-info ml15" style="width:83%">
              <div>
                <!-- 创建者 职位 -->
                <div class="clearfix">
                  <span class="notelist-text pull-left">{{ item.updateFullname }}</span>
                  <span class="notelist-dept ml8 pull-left">{{ item.deptName }}</span>
                  <!-- <div class="pull-right note-icon-more ml16" @click="showHandleOther(item)">
                  </div> -->
                </div>
                <!-- <span class="text-8c">{{ item.updateTime ? item.updateTime.slice(0, 16) : '' }}</span> -->
              </div>
              <div class="mt12 clearfix ellipsis-2">
                <span class="notelist-other-content" v-html="item.content" @click="viewNote(item.id)"></span>
              </div>
              <div v-if="item.type===0" class="mt12 notelist-title ellipsis" :title="item.title"> {{$t('kng_mynote_lbl_title')}}{{ item.title }}</div>
              <div v-if="item.type===1" class="mt12 notelist-title ellipsis" :title="item.title" @click="openKng(item.kngId)">{{$t('kng_mynote_lbl_title')}}{{ item.title }}<yxt-svg-icon :baseurl='h5Url' class="pull-right text-8c" icon-name='right' width="16" style="position: relative;vertical-align: middle;"/></div>
              <div class="mt12">
                <span class="text-bf pull-left">{{$t('kng_mynote_lbl_favoritylike_other',{num1:item.supportCountVal||0, num2: item.favoriteCount||0})}}</span>
                <span class="pull-right notelist-dept">{{ item.updateTime }}</span>
                <!-- <div class="pull-right">
                  <div class="d-in-block hand" v-if="item.supported!==1" @click="likeNote(item.id,index)">
                    <yxt-svg-icon class="text-8c" :baseurl='h5Url' icon-name='like' width="16" height="16" style="vertical-align: middle;"/>
                    <span class="ml3 text-8c" style="vertical-align: middle;">{{ item.supportCount>0 ? item.supportCountVal :'' }}</span>
                  </div>
                  <div class="d-in-block" v-if="item.supported===1">
                    <yxt-svg-icon :baseurl='h5Url' icon-name='liked'  width="16" height="16" style="vertical-align: middle;"/>
                    <span class="ml3 notelist-highlight">{{ item.supportCountVal }}</span>
                  </div>
                </div> -->
              </div>
            </div>
            <!-- <div class="yxt-hairline--bottom pt20"></div> -->
          </li>
        </ul>
      </yxt-list>
      <yxt-empty v-if="isShowNoData2">
        <div class="title">{{$t('kng_common_lbl_nodata')}}</div>
      </yxt-empty>
    </div>
    <yxt-action-sheet
      v-model="showPopup"
      :actions="actions1"
      :cancel-text="$t('kng_common_btn_cancel')"
      @select="onSelect"
    />
     <yxt-popup
      v-model="showPopupOther"
      round
      position="bottom">
      <div class="notelist">
        <yxt-cell-group>
          <yxt-cell>
            <span class="notelist-more-popup" @click="setCollect(currentNote.id,currentNote.collect,currentIndex)" >{{collectText}}</span>
          </yxt-cell>
          <yxt-cell><span class="notelist-more-popup">举报</span></yxt-cell>
        </yxt-cell-group>
        <div class="notelist-more-span"></div>
        <div class="notelist-more-cancel mt16 mb16" @click="showPopupOther = false">{{$t('kng_common_btn_cancel')}}</div>
      </div>
    </yxt-popup>
  </div>
  <div class="yui-screen-page" v-else>
    <yxt-loading text-size="16px">{{$t('kng_common_msg_loading')}}</yxt-loading>
  </div>
</template>

<script>
import api from '@/service/knowledge.service.js'
import { parseDate } from '@/core/utils'
import moment from 'moment'
export default {
  data () {
    return {
      actions1: [{ name: this.$t('kng_common_btn_edit') }, { name: this.$t('kng_common_btn_delete') }],
      iconName: 'note',
      listloading: false,
      // 空数据
      // isShowNoData1: false,
      // isShowNoData2: false,
      // 笔记时间
      noteTime: null,
      timeList: [{
        value: null,
        text: this.$t('kng_mynote_lbl_notetime')
      }, {
        value: 0,
        text: this.$t('kng_mynote_lbl_thisweek')
      }, {
        value: 1,
        text: this.$t('kng_mynote_lbl_thisweek')
      }, {
        value: 2,
        text: this.$t('kng_mynote_lbl_thisyear')
      }, {
        value: 3,
        text: this.$t('kng_mynote_lbl_oneyear')
      }],
      // 笔记类型
      noteType: 0,
      noteList: [{
        value: 0,
        text: this.$t('kng_mynote_lbl_mynote')
      }, {
        value: 1,
        text: this.$t('kng_mynote_lbl_othernote')
      }],
      // 我的笔记类型
      Type: null,
      typeList: [{
        value: null,
        text: this.$t('kng_common_lbl_type')
      }, {
        value: 0,
        text: this.$t('kng_mynote_lbl_normal')
      }, {
        value: 1,
        text: this.$t('kng_mynote_lbl_kngnote')
      }],
      myNoteloading: false,
      myNotefinished: false,
      myNoteError: false,
      myNoteList: [],
      myNoteCurrentPage: 1,
      myNotePageSize: 10,
      myNoteTotal: 0,
      myNoteTotalPage: 0,
      beginTime: null,
      endTime: null,
      showPopup: false, // 显示操作弹框
      otherNoteList: [], // 他人的笔记列表
      otherCurrentPage: 1,
      otherPageSize: 10,
      otherNoteTotal: 0,
      otherNoteTotalPage: 0,
      currentNote: {}, // 当前选中的笔记
      currentIndex: 0, // 当前笔记索引
      collectText: '',
      otherNoteloading: false,
      showPopupOther: false,
      loading1: false,
      finished1: false,
      loading2: false,
      finished2: false
    }
  },
  computed: {
    isShowNoData1 () {
      return this.noteType === 0 && !this.loading1 && this.myNoteList.length === 0 // 不在loading状态 并且comments > 0
    },
    isShowNoData2 () {
      return this.noteType === 1 && !this.loading2 && this.otherNoteList.length === 0 // 不在loading状态 并且comments > 0
    }
  },
  created () {
    // 取本地的选择状态
    let notelistType = window.getLocalStorage('notelist_type')
    let mylist = window.getLocalStorage('notelist_mynote')
    let searchTime = window.getLocalStorage('notelist_searchTime')
    if (notelistType && notelistType !== 'null') {
      this.Type = parseInt(notelistType)
    }
    if (mylist && mylist !== 'null') {
      this.noteType = parseInt(mylist)
    }
    if (searchTime && searchTime !== 'null') {
      this.noteTime = parseInt(searchTime)
      this.searchByTime(this.noteTime, false)
    }
    if (this.noteType === 0) {
      this.$nextTick(this.getMyNoteList())
    } else {
      this.$nextTick(this.getOtherNoteList())
    }
  },
  mounted () {},
  methods: {
    onSelect (item) {
      // 点击选项时默认不会关闭菜单，可以手动关闭
      this.showPopup = true
      if (item.name === this.$t('kng_common_btn_edit')) {
        this.editNote(this.currentNote.id)
      }
      if (item.name === this.$t('kng_common_btn_delete')) {
        this.deleteNote(this.currentNote.id)
      }
    },
    addNote () {
      this.$router.push({
        path: '/notecreateedit',
        query: {
          noteId: null
        }
      })
    },
    getMyNoteList () {
      window.scrollTo(0, 0)
      this.myNoteloading = true
      this.listloading = false
      // 加载数据初始化
      this.finished1 = false
      this.loading1 = false
      this.myNoteList = []
      let bodyParams = {
        beginTime: this.beginTime, // 日期范围开始时间
        endTime: this.endTime, // 日期范围结束时间
        type: this.Type // 笔记类型 0 普通 1 知识
        // important: this.myNoteStatus, // 状态 0 一般 1 重要
        // title: this.KngTitleInput
      }
      this.myNoteCurrentPage = 1
      let linkParams = {
        limit: this.myNotePageSize,
        offset: (this.myNoteCurrentPage - 1) * this.myNotePageSize
      }
      api.postGetMyNoteList(bodyParams, linkParams).then((res) => {
        // this.isShowNoData1 = res.datas.length === 0
        res.datas.forEach((item, index) => {
          // item.updateTime = parseDate(item.updateTime)
          item.content = this.delhtml(item.content)
          item.isImportant = item.important === 1
          item.isOpen = item.opened === 1
          item.supportCountVal = item.supportCount > 10000 ? (Math.floor(item.supportCount / 1000) / 10).toFixed(1) + 'w' : item.supportCount
        })
        this.myNoteList = res.datas
        this.myNoteTotal = res.paging.count
        // 获得当前最大页数
        this.myNoteTotalPage = res.paging.pages
        this.myNoteloading = false
        this.listloading = true
        // 记录缓存
        window.setLocalStorage('notelist_type', this.Type)
      }).catch(() => {
        this.$toast.fail(this.$t('kng_mynote_msg_getdataerror'))
        // alert('出错啦')
        // this.$message({
        //   type: 'error',
        //   message: '获取我的笔记列表出错'
        // })
        this.myNoteloading = false
        this.listloading = true
      })
    },
    loadMoreMyNote () {
      this.myNoteCurrentPage += 1
      this.myNoteloading = true
      let bodyParams = {
        beginTime: this.beginTime, // 日期范围开始时间
        endTime: this.endTime, // 日期范围结束时间
        type: this.Type // 笔记类型 0 普通 1 知识
        // important: this.myNoteStatus, // 状态 0 一般 1 重要
        // title: this.KngTitleInput
      }
      let linkParams = {
        limit: this.myNotePageSize,
        offset: (this.myNoteCurrentPage - 1) * this.myNotePageSize
      }
      api.postGetMyNoteList(bodyParams, linkParams).then((res) => {
        res.datas.forEach((item, index) => {
          // item.updateTime = parseDate(item.updateTime)
          item.content = this.delhtml(item.content)
          item.isImportant = item.important === 1
          item.isOpen = item.opened === 1
          item.supportCountVal = item.supportCount > 10000 ? (Math.floor(item.supportCount / 1000) / 10).toFixed(1) + 'W' : item.supportCount
        })
        this.myNoteList = this.myNoteList.concat(res.datas)
        this.myNoteloading = false
      }).catch(() => {
        this.$toast.fail(this.$t('kng_mynote_msg_getdataerror'))
        this.myNoteloading = false
      })
    },
    // 获取他人笔记列表
    getOtherNoteList () {
      window.scrollTo(0, 0)
      // 加载数据初始化
      this.finished2 = false
      this.loading2 = false
      this.listloading = false
      this.otherNoteList = []
      this.otherNoteloading = true
      this.otherCurrentPage = 1
      let bodyParams = {
        type: this.Type, // 笔记类型 0 普通 1 知识
        beginTime: this.beginTime, // 日期范围开始时间
        endTime: this.endTime // 日期范围结束时间
      }
      let linkParams = {
        limit: this.otherPageSize,
        offset: (this.otherCurrentPage - 1) * this.otherPageSize
      }
      api.postGetOtherNoteList(bodyParams, linkParams).then((res) => {
        // this.isShowNoData2 = res.datas.length === 0
        res.datas.forEach((item, index) => {
          item.updateTime = parseDate(item.updateTime)
          item.content = this.delhtml(item.content)
          item.supportCountVal = item.supportCount > 10000 ? (Math.floor(item.supportCount / 1000) / 10).toFixed(1) + 'W' : item.supportCount
        })
        this.otherNoteList = res.datas
        this.otherNoteTotal = res.paging.count
        // 获得当前最大页数
        this.otherNoteTotalPage = res.paging.pages
        this.listloading = true
        this.otherNoteloading = false
        // 记录缓存
        window.setLocalStorage('notelist_type', this.Type)
      }).catch(() => {
        this.$toast.fail(this.$t('kng_mynote_msg_getdataerror1'))
        this.otherNoteloading = false
        this.listloading = true
      })
    },
    // 查看更多他人笔记
    loadMoreOtherNote () {
      this.otherCurrentPage += 1
      this.otherNoteloading = true
      let bodyParams = {
        type: this.Type, // 笔记类型 0 普通 1 知识
        beginTime: this.beginTime, // 日期范围开始时间
        endTime: this.endTime // 日期范围结束时间
      }
      let linkParams = {
        limit: this.otherPageSize,
        offset: (this.otherCurrentPage - 1) * this.otherPageSize
      }
      api.postGetOtherNoteList(bodyParams, linkParams).then((res) => {
        res.datas.forEach((item, index) => {
          item.updateTime = parseDate(item.updateTime)
          item.content = this.delhtml(item.content)
          item.supportCountVal = item.supportCount > 10000 ? (Math.floor(item.supportCount / 1000) / 10).toFixed(1) + 'W' : item.supportCount
        })
        this.otherNoteList = this.otherNoteList.concat(res.datas)
        // this.otherNoteTotal = res.paging.count
        this.otherNoteloading = false
      }).catch(() => {
        this.$toast.fail(this.$t('kng_mynote_msg_getdataerror1'))
        this.otherNoteloading = false
      })
    },
    // 加载更多
    delhtml (str) {
      str = str.replace(/<\/?[^>]*>/g, '') // 去除HTML tag
      str = str.replace(/[ | ]*\n/g, '\n') // 去除行尾空白
      str = str.replace(/\n[\s| | ]*\r/g, '\n') // 去除多余空行
      str = str.replace(/&nbsp;/ig, '') // 去掉&nbsp;
      return str
    },
    // 点赞
    likeNote (id, index) {
      // 调接口
      let bodyParams = {
        targetId: id,
        targetType: 3,
        praiseType: 1
      }
      api.postAddThumbs(bodyParams).then(res => {
        if (this.noteType === 0) {
          this.myNoteList[index].supportCount += 1
          this.myNoteList[index].supported = 1
          this.myNoteList[index].supportCountVal = this.myNoteList[index].supportCount + 1 > 10000 ? (Math.floor((this.myNoteList[index].supportCount + 1) / 1000) / 10).toFixed(1) + 'W' : this.myNoteList[index].supportCount
          // this.getMyNoteList()
        } else {
          this.otherNoteList[index].supportCount += 1
          this.otherNoteList[index].supported = 1
          this.otherNoteList[index].supportCountVal = this.otherNoteList[index].supportCount + 1 > 10000 ? (Math.floor((this.otherNoteList[index].supportCount + 1) / 1000) / 10).toFixed(1) + 'W' : this.otherNoteList[index].supportCount
          // this.getOtherNoteList()
        }
      }).catch(() => {
        this.$toast.fail(this.$t('kng_mynote_msg_likeerror'))
      })
    },
    changeList (val) {
      if (val === 0) {
        this.getMyNoteList()
        window.setLocalStorage('notelist_mynote', val)
      } else {
        this.getOtherNoteList()
        window.setLocalStorage('notelist_mynote', val)
      }
    },
    searchByTime (val, loaddata = true) {
      window.setLocalStorage('notelist_searchTime', val)
      switch (val) {
        case 0: this.getCurrWeekDays(loaddata); break // 本周
        case 2: this.getFirstDayOfYear(loaddata); break // 本年
        case 1: this.getCurrMonthDays(loaddata); break // 本月
        case 3: this.getOneYearAgo(loaddata); break // 一年之内
        default: this.getAllData(loaddata); break
      }
    },
    openKng (id) {
      if (id) {
        api.getKnowledgeType(id).then((res) => {
          if (res.fileType === 0) {
            this.$router.skipKngDetail(0, res.fileType, id, '', '', 'kng', 0)
          } else {
            this.$router.skipKngDetail(0, res.fileType, '', id, '', 'kng', 0)
          }
        }).catch(() => {
          this.$toast.fail('知识不存在')
        })
      }
    },
    // 日期格式化，返回值形式为yy-mm-dd
    timeFormat (date) {
      if (!date || typeof (date) === 'string') {
        this.error(this.$t('kng_mynote_msg_paramerror'))
      }
      let y = date.getFullYear() // 年
      let m = date.getMonth() + 1 // 月
      let d = date.getDate() // 日
      return y + '-' + m + '-' + d
    },
    // 清除日期范围
    getAllData (loaddata) {
      this.beginTime = null
      this.endTime = null
      if (loaddata) {
        if (this.noteType === 0) {
          this.getMyNoteList()
        } else {
          this.getOtherNoteList()
        }
      }
    },
    // 获取当前周的开始结束时间
    getCurrWeekDays (loaddata) {
      this.beginTime = moment(moment().week(moment().week()).startOf('week').add(1, 'days').valueOf()).format('YYYY-MM-DD HH:mm:ss')
      this.endTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      if (loaddata) {
        if (this.noteType === 0) {
          this.getMyNoteList()
        } else {
          this.getOtherNoteList()
        }
      }
    },
    // 获取本月数据
    getCurrMonthDays (loaddata) {
      this.beginTime = moment(moment().month(moment().month()).startOf('month').valueOf()).format('YYYY-MM-DD HH:mm:ss')
      this.endTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      if (loaddata) {
        if (this.noteType === 0) {
          this.getMyNoteList()
        } else {
          this.getOtherNoteList()
        }
      }
    },
    // 获取本年数据
    getFirstDayOfYear (loaddata) {
      this.beginTime = moment(moment().month(moment().month()).startOf('year').valueOf()).format('YYYY-MM-DD HH:mm:ss')
      this.endTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      if (loaddata) {
        if (this.noteType === 0) {
          this.getMyNoteList()
        } else {
          this.getOtherNoteList()
        }
      }
    },
    // 获取一年 之前
    getOneYearAgo (loaddata) {
      this.beginTime = null
      this.endTime = moment(moment().year(moment().year() - 1).endOf('year')).format('YYYY-MM-DD HH:mm:ss')
      if (loaddata) {
        if (this.noteType === 0) {
          this.getMyNoteList()
        } else {
          this.getOtherNoteList()
        }
      }
    },
    // 点击收藏，取消收藏
    setCollect (id, val, index) {
      if (val === 1) {
        // 取消收藏
        api.deleteFavorite(id).then(res => {
          if (this.noteType === 0) {
            this.myNoteList[index].isFavorite = 0
            this.currentNote.isFavorite = 0
            this.collectText = this.$t('kng_mynote_lbl_collect')
            // this.getMyNoteList()
          } else {
            this.otherNoteList[index].isFavorite = 0
            this.currentNote.isFavorite = 0
            this.collectText = this.$t('kng_mynote_lbl_collect')
            // this.getOtherNoteList()
          }
        }).catch(() => {
          this.$toast.fail(this.$t('kng_mynote_msg_cancelcollect_error'))
        })
      } else {
        // 添加收藏
        let bodyParams = {
          targetId: id,
          targetType: 3
        }
        api.addFavorite(bodyParams).then(res => {
          if (this.noteType === 0) {
            this.myNoteList[index].isFavorite = 1
            this.currentNote.isFavorite = 1
            this.collectText = this.$t('kng_mynote_lbl_cancelcollect')
            // this.getMyNoteList()
          } else {
            this.otherNoteList[index].isFavorite = 1
            this.currentNote.isFavorite = 1
            this.collectText = this.$t('kng_mynote_lbl_cancelcollect')
            // this.getOtherNoteList()
          }
        }).catch(() => {
          this.$toast.fail(this.$t('kng_mynote_msg_collect_error'))
        })
      }
    },
    showHandle (obj) {
      this.currentNote = obj
      this.collectText = this.currentNote.isFavorite === 1 ? this.$t('kng_mynote_lbl_cancelcollect') : this.$t('kng_mynote_lbl_collect')
      this.showPopup = true
    },
    showHandleOther (obj) {
      this.currentNote = obj
      this.collectText = this.currentNote.isFavorite === 1 ? this.$t('kng_mynote_lbl_cancelcollect') : this.$t('kng_mynote_lbl_collect')
      this.showPopupOther = true
    },
    // 删除笔记
    deleteNote (id) {
      this.Dialog.confirm({
        message: this.$t('kng_mynote_msg_delete'),
        closeOnPopstate: true
      }).then(() => {
        let ids = []
        ids.push(id)
        let bodyParams = {
          ids: ids
        }
        api.postDeleteNote(bodyParams).then((res) => {
          this.$toast(this.$t('kng_mycomments_msg_delete'))
          this.showPopup = false
          this.getMyNoteList()
        }).catch(() => {
          this.$toast.fail(this.$t('kng_mycomments_msg_delete_error'))
          this.showPopup = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: this.$t('kng_mynote_msg_canceldelete')
        })
      })
    },
    changeType () {
      if (this.noteType === 0) {
        this.getMyNoteList()
      } else {
        this.getOtherNoteList()
      }
    },
    // 编辑笔记
    editNote (id) {
      // H5只能编辑移动端的笔记
      if (this.currentNote.fromApp === 0) {
        this.$toast(this.$t('kng_common_msg_cannot_edit'))
      } else {
        // 打开知识编辑页面
        this.$router.push({
          path: '/notecreateedit',
          query: {
            noteId: id
          }
        })
      }
    },
    // 查看笔记
    viewNote (id) {
      this.$router.push({
        path: '/notedetail',
        query: {
          noteId: id
        }
      })
      // window.open(href, '_blank')
    },
    onLoad1 () {
      // 异步更新数据
      setTimeout(() => {
        this.loadMoreMyNote()
        // 加载状态结束
        this.loading1 = false

        // 数据全部加载完成
        if (this.myNoteCurrentPage >= this.myNoteTotalPage) {
          this.finished1 = true
        }
      }, 500)
    },
    onLoad2 () {
      // 异步更新数据
      setTimeout(() => {
        this.loadMoreOtherNote()
        // 加载状态结束
        this.loading2 = false

        // 数据全部加载完成
        if (this.otherCurrentPage >= this.otherNoteTotalPage) {
          this.finished2 = true
        }
      }, 500)
    }
  },
  watch: {
    myNoteList (to, from) {
      this.myNoteList = to
      // this.getMyNoteList()
    },
    otherNoteList (to, from) {
      this.otherNoteList = to
      // this.getMyNoteList()
    },
    currentNote (to, from) {
      this.currentNote = to
      this.collectText = this.currentNote.isFavorite === 1 ? this.$t('kng_mynote_lbl_cancelcollect') : this.$t('kng_mynote_lbl_collect')
    },
    collectText (to, from) {
      this.collectText = to
    }
  }
}
</script>
<style scoped>
/deep/
.yxt-popup--top.yxt-popup--round {
    border-radius: 0 ;
}
/* /deep/
.yxt-hairline--bottom::after {
  width: 200%;
} */
/deep/
.note [class*=yxt-hairline]::after {
  top: 0%;
  width: 200%;
}
</style>
