<template>
  <div class="over-hidden" :class="isAddStudy ? 'pb54' : null" v-if="loading">
    <play-area ref="playarea" :kngInfo="kngInfo" @getDetal="getKngDetail" kngType="audio" :kngConf="kngConf" :isShowProgress="isShowProgress" @changeShedule="changeShedule"></play-area>
    <yxt-tabs v-model="active" :swipe-threshold="5" sticky swipeable>
      <yxt-tab title="详情" name="0">
        <kng-info :kngInfoDetail="kngInfo" :kngSchedule="schedule" :isShowProgress="isShowProgress"></kng-info>
      </yxt-tab>
      <yxt-tab title="评价" name="1"><comment-list @changeScoreNum="changeScoreNum" :kngInfoDetail="kngInfo" :isAddStudy="isAddStudy"></comment-list></yxt-tab>
      <yxt-tab title="笔记" name="3"><kngNoteList :kngId="kngInfo.id" :title="kngInfo.title" :addStudy="kngInfo.addStudy" :isAddStudy="isAddStudy"></kngNoteList></yxt-tab>
      <!-- <yxt-tab title="问答">问答</yxt-tab> -->
    </yxt-tabs>
    <!-- 加入学习 -->
    <template v-if="!isAudit">
      <kng-add-study v-if="isAddStudy" :kngId="kngId" @isAdd="getIsAdd"></kng-add-study>
    </template>
  </div>
  <div class="yui-screen-page" v-else>
    <yxt-loading text-size="16px">加载中...</yxt-loading>
  </div>
</template>

<script>
import api from '@/service/kngDetail.service'
import kngInfo from '@/views/kngDetail/components/kngInfo'
import CommentList from '@/views/kngDetail/components/commentList'
import kngNoteList from '@/views/kngDetail/components/kngNoteList'
import KngAddStudy from '@/views/kngDetail/components/kngAddStudy'
import PlayArea from '@/views/kngDetail/components/PlayArea'
export default {
  name: 'audioDetail',
  components: {
    CommentList,
    kngInfo,
    KngAddStudy,
    kngNoteList,
    PlayArea
  },
  props: {},
  data () {
    return {
      loading: false, // 处理加载知识详情loading
      kngId: this.$route.query.id, // 知识id
      courseId: this.$route.query.courseId, // 课程包id
      targetId: this.$route.query.targetId, // 项目或计划id
      targetCode: this.$route.query.targetCode, // 项目或计划名
      type: this.$route.query.type,
      status: this.$route.query.status, // 是否是从审核页面过来
      taskType: this.$route.query.taskType, // 从项目过来审核的权限
      // 其他参数
      active: '0', // 切换tab
      isAddStudy: true, // 是否有加入学习按钮
      isShowProgress: false, // 是否显示进度
      kngInfo: {}, // 知识obj
      schedule: 0,
      lastName: '',
      // 防作弊配置
      kngConf: {}, // 防作弊配置对象
      moreEnabled: 0 // 多知识学习开关是否开启
    }
  },
  computed: {
    // 是否是从审核中那边过来的
    isAudit () {
      if (this.status !== '' && this.status !== undefined && this.status !== null) {
        return this.status !== 4
      }
      return false
    }
  },
  mounted () {
    this.getKngConf()
  },
  methods: {
    // 获取防作弊配置
    getKngConf () {
      api.getKngConf().then(res => {
        this.kngConf = res
        this.moreEnabled = res.moreEnabled
        this.handleVersion()
      }).catch(err => {
        console.log(err)
      })
    },
    // 进度更新
    changeShedule (val) {
      this.schedule = val
    },
    // 改变评分
    changeScoreNum (data) {
      this.kngInfo.avgCommentScore = data
    },
    // 处理版本问题
    handleVersion () {
      let bodyParams = {
        kngId: this.kngId
      }
      api.postKngVersionAlert(bodyParams).then(versionObj => {
        this.deleteDetail()
      }).catch(err => {
        if (err.error.key === 'apis.kng.knowledge.hours.changed') {
          this.kngUpdate('本知识（课程）学时被更新，学习进度将被重置')
        } else if (err.error.key === 'apis.kng.knowledge.version.changed') {
          this.kngUpdate('本知识（课程）更新了新版本，建议您重新学习')
        }
        console.log(err)
      })
    },
    // 处理学时或者版本更新
    kngUpdate (tips) {
      let bodyParams = {
        kngId: this.kngId
      }
      this.Dialog.confirm({
        title: '提示',
        message: tips,
        confirmButtonText: '我知道了',
        closeOnPopstate: true,
        showCancelButton: false
      }).then(() => {
        // 确定操作
        api.putkngVersionAlert(bodyParams).then(() => {
          // 确定操作
          api.putkngVersionAlert(bodyParams).then(() => {
            this.getKngDetail()
          }).catch(err => {
            console.log(err)
          })
        }).catch(err => {
          console.log(err)
        })
      }).catch(() => {
        // 取消操作
        this.$router.go(-1)
      })
    },
    // 删除判断之前学的是不是当前新打开的这个
    deleteDetail () {
      if (localStorage.playStudyArr) {
        let playStudyArr = JSON.parse(localStorage.playStudyArr)
        if (playStudyArr.length > 0) {
          let bodyParams = {
            ids: playStudyArr.join(',')
          }
          api.postDeleteStudy(bodyParams).then((res) => {
            localStorage.removeItem('playStudyArr')
          }).then(() => {
            this.getKngDetail()
          }).catch(err => {
            console.log(err)
          })
        }
      } else {
        this.getKngDetail()
      }
    },
    // 获取知识是否学习
    getIsAdd (val) {
      this.isShowProgress = !val
      this.isAddStudy = false
    },
    // 获取知识详情
    getKngDetail () {
      let preview = 0
      if (this.status !== '' && this.status !== undefined && this.status !== null) {
        if (parseInt(this.status) === 2 || parseInt(this.status) === 3) {
          preview = 1
        }
      }

      let bodyParams = {
        id: this.kngId,
        preview: preview,
        targetId: this.targetId,
        targetCode: this.targetCode ? this.targetCode : 'kng'
      }

      if ((this.taskType !== undefined || this.taskType !== null) && this.targetCode === 'o2o') {
        bodyParams.taskType = this.taskType
      }

      if (this.isAudit) {
        bodyParams.preview = 1
      }

      if (this.taskType) {
        bodyParams.preview = 0
      }

      api.postKngDetail(bodyParams).then(res => {
        this.loading = true
        this.kngInfo = res
        this.submitTime = this.kngInfo.submitTime
        this.isAddStudy = (res.addStudy !== 1)
        this.isShowProgress = (res.addStudy === 1)
        this.schedule = res.schedule
        // 设置知识title
        document.title = this.kngInfo.title
        // 默认应该不在审核中才会去校验
        // 判断是否开启多知识学习,默认应该不在审核中才会去校验
        if (this.moreEnabled && !this.isAudit) {
          this.lastName = res.lastName
          if (this.lastName !== null && this.lastName !== undefined) {
            this.$nextTick(() => {
              this.$refs.playarea.handleChangeStudy()
            })
          }
        }
      }).then(() => {
        this.$refs.playarea.postPlayStudy()
      }).catch(err => {
        if (err.error.key) {
          let msg = this.error(err)
          this.Dialog.confirm({
            title: '提示',
            message: msg,
            confirmButtonText: '我知道了',
            closeOnPopstate: true,
            showCancelButton: false
          }).then(() => {
            this.$router.go(-1)
          })
        } else {
          console.log(err)
        }
      })
    }
  }
}
</script>
