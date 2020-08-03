<template>
  <div class="ph15 pb7">
    <div class="list-layout-flex pt25 pb16" v-if="isAddStudy!==true || noteList.length > 0">
      <!-- 标题笔记数量 -->
      <div class="font-size-18 text-26 list-flex-1">{{total}}条笔记</div>
      <yxt-checkbox v-model="onlySelf" class="just-self" @change="justSelf" v-if="isAddStudy!==true">只看自己</yxt-checkbox>
    </div>
    <div v-if="isShowNoData" class="nodata">
      <yxt-empty >
        <div class="title">暂无笔记</div>
      </yxt-empty>
    </div>
    <!-- <yxt-list v-if="noteList.length > 0" v-model="loading" :finished="finished"  finished-text="没有更多了"  @load="onLoad"> -->
      <!-- 笔记列表 -->
      <ul class="clearfix note-detail-list">
        <li class="pt18 pb16 list-layout-flex yxt-hairline--bottom" v-for="(item, index) in noteList" :key="index">
          <yxt-image :src="item.imgUrl" width="36" height="36" class="mr12 v-mid" round/>
          <div class="list-flex-1">
            <!-- 分享者 职位 点点点 -->
            <div class="list-layout-flex">
              <!-- 分享者+职位 -->
              <div class="list-flex-1">
                <span class="text-26 font-size-14 mr8">{{item.updateFullname}}</span>
                <span class="text-bf font-size-12">{{item.deptName}}</span>
              </div>
              <!-- 点点点 -->
              <yxt-svg-icon :baseurl='h5Url' icon-name='more' width="16px" height="16px" v-if="userId === item.updateUserId" class="v-mid hand text-8c" @click.native="showHandle(item)" />
            </div>
            <!-- 笔记 -->
            <div class="mt12 text-26 note-list-desc clearfix ellipsis-4" v-html="item.content" @click="viewNote(item.id)"></div>
            <!-- 笔记来源 -->
            <div class="mt8 text-8c note-source ellipsis" v-if="$route.path.split('/')[1] === 'course'">来自：{{item.title}}</div>
            <!-- 时间 点赞数 -->
            <div class="list-layout-flex mt16">
              <div class="list-flex-1 text-bf font-size-12">{{`${item.supportCount||0}赞 · ${item.favoriteCount||0}收藏`}}</div>
              <div class="layout-flex-inline text-bf font-size-12">
                {{item.updateTime}}
                <!-- 未点赞 -->
                <!-- <div v-if="item.supported !==1" @click="likeNote(item.id, index)">
                  <yxt-svg-icon :baseurl='h5Url' icon-name='like' width="16px" height="16px" class="hand v-mid" style="color: #8c8c8c"/>
                  <span class="ml3 v-mid">{{ item.supportCount > 0 ? item.supportCountVal :'' }}</span>
                </div> -->
                <!-- 已点赞 -->
                <!-- <div v-if="item.supported === 1">
                  <yxt-svg-icon :baseurl='h5Url' icon-name='like' width="16px" height="16px" class="hand" style="color: #FF5611"/>
                  <span class="ml3 thumbs-highlight">{{item.supportCountVal}}</span>
                </div> -->
              </div>
            </div>
          </div>
        </li>
      </ul>
       <!-- 加载更多 -->
      <div>
        <div v-if="showMore" class="knglist-bottom" @click="loadMore">查看更多笔记</div>
      </div>
    <!-- </yxt-list> -->
    <div style="height: 40px"></div>
    <!-- 弹框 -->
    <yxt-popup v-model="isShowPopup" round position="bottom">
      <div class="notelist">
        <yxt-cell-group>
          <yxt-cell v-if="userId !== currentNote.updateUserId">
            <span class="notelist-more-popup" @click="Report(currentNote.id)">举报</span>
          </yxt-cell>
          <yxt-cell v-if="userId === currentNote.updateUserId">
            <span class="notelist-more-popup" @click="noteEdit(currentNote.id)">编辑</span>
          </yxt-cell>
          <yxt-cell v-if="userId === currentNote.updateUserId">
            <span class="notelist-more-popup" @click="noteDel(currentNote.id)">删除</span>
          </yxt-cell>
        </yxt-cell-group>
        <div class="notelist-more-span"></div>
        <div class="notelist-more-cancel mt16 mb16" @click="isShowPopup = false">取消</div>
      </div>
    </yxt-popup>
    <!-- 添加笔记 -->
    <yxt-popup v-model="addCommentPopup" round position="bottom" title="笔记" :style="{ height: '100%' }" closeable="inner">
      <addNote :title="title" :kngId="kngId"  @getList="getKngNoteList"  @close="addCommentPopup=false"></addNote>
    </yxt-popup>
    <!-- 写笔记 -->
    <div class="footReply yxt-hairline--top" v-if="isAddStudy!==true" @click="writeNote">
      <yxt-field style="width: 100%;"
        :border="false"
        :readonly="true"
        :displayType="'bg-gray-1'"
        :radusType="'full'"
        placeholder="笔记随时记~"
        input-align="left"
      />
    </div>
  </div>
</template>

<script>
import addNote from '@/components/kngDetailComponents/addNote.vue'
import api from '@/service/knowledge.service.js'
import { parseDate } from '@/core/utils'
export default {
  components: {
    addNote
  },
  props: {
    kngId: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    addStudy: {
      type: Number
    },
    isAddStudy: {
      type: Boolean
    }
  },
  data () {
    return {
      loading: false,
      finished: false,
      onlySelf: false, // 只看自己 0：否，1：是
      current: 1,
      perPage: 10, // 每页多少条
      total: 0, // 总条数
      totalPage: 0,
      id: '',
      noteList: [], // 笔记列表
      isShowPopup: false, // 显示操作弹框
      supported: 0, // 是否点赞 0：未点赞 1：已点赞
      currentNote: {}, // 当前选中的笔记
      userId: window.getLocalStorage('userId'),
      addCommentPopup: false,
      isloaded: 0// 1 没有加载完 2 加载完了
      // showMore: false
    }
  },
  computed: {
    isShowNoData () {
      return !this.loading && this.noteList.length === 0 // 不在loading状态 并且comments > 0
    },
    showMore () {
      return this.current < this.totalPage
    }
  },
  created () {
    this.$nextTick(this.getKngNoteList())
    // this.getKngNoteList()
  },
  mounted () {},
  methods: {
    // 是否只看自己
    justSelf (val) {
      this.onlySelf = val
      this.getKngNoteList()
    },
    onLoad () {
      // 异步更新数据
      setTimeout(() => {
        this.loadMore()
        // 加载状态结束
        this.loading = false
        // 数据全部加载完成
        if (this.current >= this.totalPage) {
          this.finished = true
        }
      }, 500)
    },
    loadMore () {
      this.current += 1
      this.getList(1)
    },
    getList (type) {
      this.loading = true
      let bodyParams = {
        kngId: this.kngId,
        onlySelf: this.onlySelf ? 1 : 0,
        courseId: this.$route.path.split('/')[1] === 'course' ? this.$route.query.courseId : ''
      }
      let linkParams = {
        limit: this.perPage,
        offset: (this.current - 1) * this.perPage
      }
      api.postGetKngNoteList(bodyParams, linkParams).then(res => {
        res.datas.forEach((item, index) => {
          item.updateTime = parseDate(item.updateTime)
          item.content = this.delhtml(item.content)
          item.supportCountVal = item.supportCount > 10000 ? (Math.floor(item.supportCount / 1000) / 10).toFixed(1) + 'W' : item.supportCount
        })
        if (type === 0) {
          this.noteList = res.datas
          this.total = res.paging.count
          // 获得当前最大页数
          this.totalPage = res.paging.pages
        } else {
          this.noteList = this.noteList.concat(res.datas)
        }
        this.loading = false
      }).catch(err => {
        console.log(err)
        this.loading = false
      })
    },
    // // 加载更多
    // loadMoreNoteList () {
    //   // this.current += 1
    //   let bodyParams = {
    //     kngId: this.kngId,
    //     onlySelf: this.onlySelf ? 1 : 0,
    //     courseId: this.$route.path.split('/')[1] === 'course' ? this.$route.query.courseId : ''
    //   }
    //   let linkParams = {
    //     limit: this.perPage,
    //     offset: (this.current - 1) * this.perPage
    //   }
    //   api.postGetKngNoteList(bodyParams, linkParams).then(res => {
    //     res.datas.forEach((item, index) => {
    //       item.updateTime = parseDate(item.updateTime)
    //       item.content = this.delhtml(item.content)
    //       item.supportCountVal = item.supportCount > 10000 ? (Math.floor(item.supportCount / 1000) / 10).toFixed(1) + 'W' : item.supportCount
    //     })
    //     this.total = res.paging.count
    //     // 获得当前最大页数
    //     this.totalPage = res.paging.pages
    //     this.noteList = this.noteList.concat(res.datas)
    //   }).catch(err => { console.log(err) })
    // },
    // 笔记列表接口
    getKngNoteList () {
      this.current = 1
      this.getList(0)
      // this.noteList = []
      // this.current = 1
      // this.loading = false
      // this.finished = false
      // let bodyParams = {
      //   kngId: this.kngInfo.id,
      //   onlySelf: this.isWatchMyOnly ? 1 : 0,
      //   courseId: this.$route.path.split('/')[1] === 'course' ? this.$route.query.courseId : ''
      // }
      // let linkParams = {
      //   limit: this.perPage,
      //   offset: (this.current - 1) * this.perPage
      // }
      // api.postGetKngNoteList(bodyParams, linkParams).then(res => {
      //   this.noteList = res.datas
      //   this.noteList.forEach((item, index) => {
      //     item.content = this.delhtml(item.content)
      //     item.updateTime = parseDate(item.updateTime)
      //     item.supportCountVal = item.supportCount > 10000 ? (Math.floor(item.supportCount / 1000) / 10).toFixed(1) + 'W' : item.supportCount
      //   })
      //   this.total = res.paging.count
      //   // 获得当前最大页数
      //   this.totalPage = res.paging.pages
      // }).catch(err => { console.log(err) })
    },
    // 加载更多
    delhtml (str) {
      return str.replace(/<[^>]+>/g, '')
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
        this.noteList[index].supportCount += 1
        this.noteList[index].supported = 1
        this.noteList[index].supportCountVal = this.noteList[index].supportCount + 1 > 10000 ? (Math.floor((this.noteList[index].supportCount + 1) / 1000) / 10).toFixed(1) + 'W' : this.noteList[index].supportCount
      }).catch(() => {
        this.$toast.fail('点赞失败')
      })
    },
    // 查看笔记
    viewNote (id) {
      this.$router.push({
        path: '/notedetail',
        query: {
          noteId: id
        }
      })
    },
    // 点击三个点
    showHandle (obj) {
      this.currentNote = obj
      this.isShowPopup = true
    },
    // 编辑
    noteEdit (id) {
      // H5只能编辑移动端的笔记
      if (this.currentNote.fromApp === 0) {
        this.$toast('此笔记在PC端生成，只能在PC端进行编辑')
      } else {
        // 打开知识编辑页面
        this.$router.push({
          path: '/noteCreateEdit',
          query: {
            noteId: id
          }
        })
      }
    },
    // 写笔记
    writeNote () {
      this.addCommentPopup = true
      // this.$router.push({
      //   path: '/noteCreateEdit',
      //   query: {
      //     noteId: null,
      //     kngId: this.kngId,
      //     title: this.title
      //   }
      // })
    },
    // 删除
    noteDel (id) {
      this.Dialog.confirm({
        message: '是否删除笔记?',
        closeOnPopstate: true
      }).then(() => {
        let ids = []
        ids.push(id)
        let bodyParams = {
          ids: ids
        }
        api.postDeleteNote(bodyParams).then(res => {
          this.$toast('删除成功')
          this.isShowPopup = false
          this.getKngNoteList()
        }).catch(() => {
          this.$toast.fail('删除失败')
          this.isShowPopup = false
        })
      }).catch(() => {
        this.$toast('已取消')
      })
    },
    // 举报
    Report (id) {
      console.log(id + '举报')
    }
  },
  watch: {},
  beforeDestroy () {},
  destroy () {}
}
</script>

<style lang="scss" scoped>
/deep/ .just-self .yxt-checkbox__label {
  font-size: 16px !important;
  color: #262626 !important;
}
.write-note{ border-top: none }
/deep/ .write-note .yxt-cell {
  background:#F5F5F5 !important;
  border-radius: 18px;
  width: 100% !important;
  line-height: 36px;
}
/deep/ .yxt-popup__close-icon{
  position: absolute;cursor:pointer;
}
</style>
