<template>
  <div class="over-hidden" v-if="loading">
    <div class="detail-play-container pr bg-black">
      <div class="play-video-photo" v-show="!playLoading">
        <img :src="courseUrl" class="detail_play-coverUrl" v-if="Object.keys(kngInfo).length > 0">
        <div class="detail_mask"></div>
        <yxt-icon name="play-circle-o" class="detail_play_icon" @click="postPlayStudy()" />
      </div>
      <!-- 视频播放器 -->
      <yxtbiz-video ref="video" v-if="playLoading && isVideo" width="100%" height="210px"
                    :load-default="true"
                    :src="videoSrc"
                    :image="videoImage"
                    :watermark-config="option">
      </yxtbiz-video>
      <!-- 音频播放器 -->
      <yxtbiz-video ref="audio" v-if="playLoading && isAudio" width="100%" height="210px"
                    :src="audioSrc"
                    :image="audioCoverUrl"
                    is-audio></yxtbiz-video>
      <jiangyi :isHandouts="isHandouts"
               :startDoc="startDoc"
               :docLists="docLists"
               :docOption="docOption"
               @page-change="onPageChange"></jiangyi>
      <!-- 文档播放器 -->
      <yxtbiz-doc-viewer v-if="playLoading && isDoc" height="210px"
                         :start="startDoc"
                         :file-list="docLists"
                         :watermark-config="docOption"
                         @page-change="onPageChange">
      </yxtbiz-doc-viewer>
    </div>
    <!-- scorm&html播放器 -->
    <course-scorm-html ref="courseIframePlay"
                       :url="scormHtmlUrl"
                       :isShowProgress="isShowProgress"
                       :clickInfo="clickInfo"
                       :showIframe="(isScorm || isHtml) && showIframe"
                       @closeIframe="closeIframe">
    </course-scorm-html>

    <yxt-tabs v-model="active" :swipe-threshold="5" sticky swipeable>
      <yxt-tab title="详情" name="0">
        <kng-info :kngInfoDetail="kngInfo" :isShowProgress="isShowProgress"></kng-info>
      </yxt-tab>
      <yxt-tab title="目录" name="1">
        <kng-play-catalog-list
          :kngInfo="kngInfo"
          :chapterAllKng="chapterAllCatalog"
          @clickKngDetail="clickKngDetail"
        >
        </kng-play-catalog-list>
      </yxt-tab>
    </yxt-tabs>
    <btn-group :id="courseId" @getStatus="s => $set(kngInfo, 'auditStatus', s)"></btn-group>
  </div>
  <div class="yui-screen-page" v-else>
    <yxt-loading text-size="16px">加载中...</yxt-loading>
  </div>
</template>

<script>
import api from '@/service/kngDetail.service'
import apiService from '@/service/knowledge.service.js'
import kngInfo from '@/views/kngDetailAudit/components/kngInfo'
import kngPlayCatalogList from '@/views/kngDetailAudit/components/kngPlayCatalogList'
import btnGroup from '@/views/kngDetailAudit/components/btnGroup'
import courseScormHtml from '@/views/kngDetailAudit/components/courseScormHtml'
import jiangyi from '@/views/kngDetailAudit/components/jiangyi'
import { getUrl, removeRepeatAndSetLocalStorage } from '@/core/utils'
import { kngTypeMaper } from '@/views/kngDetailAudit/config'
import { kngTypeEnum } from '@/core/kngType'
import _isEmpty from 'lodash/isEmpty'
import _find from 'lodash/find'
import { getPlaySrc } from '@/views/kngDetailAudit/config/utils'

export default {
  name: 'courseDetail',
  components: {
    kngInfo,
    kngPlayCatalogList,
    btnGroup,
    courseScormHtml,
    jiangyi
  },
  data () {
    return {
      // 浏览器头部参数
      kngId: this.$route.query.id, // 知识id
      courseId: this.$route.query.courseId, // 课程包id
      targetId: this.$route.query.targetId, // 项目id
      targetCode: this.$route.query.targetCode, // 项目或计划名
      type: this.$route.query.type,
      status: this.$route.query.status, // 是否是从审核页面过来
      // 页面参数
      courseUrl: '', // 课程的封面
      active: '0',
      isAddStudy: false, // 是否有加入学习按钮
      isShowProgress: false, // 是否显示进度
      kngInfo: {},
      schedule: 0,
      loading: false,
      chapterAllKng: [], // 整个知识目录的知识
      firstPlayInfo: {}, // 课程第一个知识的信息
      playLoading: false, // 是否加载播放地址完成
      chapterAllCatalog: [], // 整个章节
      lastStudy: {}, // 上次学习知识详情
      switchKng: false,
      // 视频音频相同的参数控制
      isPause: false, // 是否播放器处于暂停状态
      showSlideBar: true, // tip显示和隐藏
      tempNum: 1, // 播放时第一次不去处理学习进度
      delayNum: 15, // 学时为1时，处理倒计时控制暂停、再继续
      tempDelayNum: 0, // 学时为1时，倒计时的重新赋值
      timersNum: 120, // 学时大于等于2时，处理倒计时控制暂停、再继续
      tempTimersNum: 0, // 学时大于等于2时，倒计时的重新赋值
      // numDown对象
      getHour: false, // 是否请求倒计时开始
      // 计时器类型
      delayTimer: null,
      delayTimeHandle: null,
      timers: null,
      timersHandle: null,
      // 中间暂停时的计时器
      pauseDelayTimer: null,
      pauseDelayTimeHandle: null,
      pauseTimers: null,
      pauseTimersHandle: null,
      // 视频对应的参数
      videoSrc: '', // 视频的播放地址
      isVideo: false,
      videoImage: '', // 封面
      // 音频对应的参数
      audioSrc: '', // 音频的播放地址
      isAudio: false,
      audioCoverUrl: '', // 音频封面
      // 文档对应参数
      startDoc: 1,
      docLists: [], // 文档列表
      isDoc: false, // 是否是文档
      // scorm&html对应参数
      scormHtmlUrl: '', // scorm&html地址
      isScorm: false,
      isHtml: false,
      showIframe: false,
      // 每次点击目录后播的参数
      clickInfo: {},
      playKngInfo: {}, // 每次点击单个知识播放接口返回的对象
      // 防作弊配置
      kngConf: {}, // 防作弊配置对象
      studyTimers: null, // 提示是否离开
      moreEnabled: 0, // 多知识学习开关是否开启
      clearDialogNum: 1, // 进度提交失败，重新更改时计算
      // 水印配置
      option: {},
      docOption: {},
      isHandouts: false // 是否带讲义
    }
  },
  async mounted () {
    await this.getKngDetail()
    this.getWatermarkConfig()
  },
  methods: {
    getWatermarkConfig () {
      apiService.getWatermarkConfig().then(res => {
        if (res.enabled) {
          this.option.enabled = 1
          if (res.type === 1) {
            this.option.type = 1
          } else {
            this.option.type = 0
            // 文档时开启
            this.docOption.enabled = 1
            this.docOption.type = 0
          }
          this.option.text = res.watermarkContent
          this.option.color = '#' + res.otherColor
          this.option.opacity = res.otherAlpha
          this.option.fontSize = res.otherFontSize

          if (this.docOption.type === 0) {
            this.docOption.text = res.watermarkContent
            this.docOption.color = '#' + res.wordColor
            this.docOption.opacity = res.wordAlpha
            this.docOption.fontSize = res.wordFontSize
          }
        } else {
          this.option.enabled = 0
        }
      }).catch(err => {
        console.log(err)
      })
    },
    setKngDetailParams () {
      let bodyParams = {
        courseId: this.courseId,
        id: this.courseId,
        preview: 1,
        targetId: this.targetId,
        targetCode: this.targetCode ? this.targetCode : 'kng'
      }

      return bodyParams
    },
    // 知识详情接口
    async getKngDetail () {
      const bodyParams = this.setKngDetailParams()
      try {
        const res = await api.postKngDetail(bodyParams)
        this.kngInfo = res
        // 设置知识title
        document.title = this.kngInfo.title
        // 请求课程包的全章节数据
        this.getCourseCatalog()
      } catch (err) {
        if (err.error.key) {
          let msg = this.error(err, 'course')
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
      }
    },
    // 获取知识目录
    async getCourseCatalog (num) {
      let params = {
        id: this.courseId,
        preview: 1
      }

      const { chapterInfoList = [] } = await apiService.getChapterTreeStudy(params)

      this.loading = true
      this.chapterAllCatalog = chapterInfoList
      this.chapterAllKng = this.handlerChapter(chapterInfoList)
    },

    // 处理所有章节
    handlerChapter (res) {
      let chapterLists = []
      res.map(item => {
        if (item.chapterKng && item.chapterKng.length > 0) {
          item.chapterKng.map((chapter, index) => {
            chapterLists.push(chapter)
          })
        }
      })

      this.initSetChapterList(chapterLists)
      this.courseUrl = this.getCoverUrl()

      if (this.firstPlayInfo.kngType === kngTypeEnum.AUDIO) {
        this.audioCoverUrl = this.firstPlayInfo.coverUrl
      }

      return chapterLists
    },
    initSetChapterList (chapterLists) {
      if (localStorage.studying) {
        // 修改当前正在学
        let studyingKng = JSON.parse(localStorage.studying)
        if (studyingKng.length === 0) {
          chapterLists[0].studying = 1
          this.lastStudy = chapterLists[0]
          this.clickInfo = chapterLists[0]
        } else {
          let kngIdLists = []
          chapterLists.map(list => {
            kngIdLists.push(list.kngId)
            return list
          })
          let value = studyingKng.filter(item => {
            return (item.courseId === this.courseId) && kngIdLists.includes(item.kngId)
          })

          if (value.length > 0) {
            chapterLists.map(chapter => {
              studyingKng.map(item => {
                if (item.courseId === this.courseId && item.kngId === chapter.kngId) {
                  chapter.studying = 1
                  this.lastStudy = item
                  this.clickInfo = chapter
                }
              })
              return chapter
            })
          } else {
            chapterLists[0].studying = 1
            this.lastStudy = chapterLists[0]
            this.clickInfo = chapterLists[0]
          }
        }
      } else {
        chapterLists[0].studying = 1
        this.lastStudy = chapterLists[0]
        this.clickInfo = chapterLists[0]
      }
    },
    getCoverUrl () {
      if (this.firstPlayInfo.kngType === kngTypeEnum.DOC || this.firstPlayInfo.kngType === kngTypeEnum.VIDEO) {
        if (this.firstPlayInfo.coverUrl) {
          return this.firstPlayInfo.coverUrl
        }
      }

      return this.kngInfo.coverUrl
    },
    // 处理知识播放接口
    async postPlayStudy () {
      if (this.clickInfo.kngType === kngTypeEnum.EXAM) { // 考试
        window.location.href = window.location.origin + `/ote/#/exampreview?arrangeId=${this.clickInfo.kngId}&masterId=&masterType=2&packageId=${this.courseId}`
      } else {
        let bodyParams = {
          clientType: 1, // 是否是h5
          courseId: this.courseId, // 课程id
          id: this.clickInfo.kngId, // 知识id
          preview: 1, // 是否预览查看 0：否，1：预览
          targetId: this.targetId, // 项目id
          targetCode: this.targetCode // 来源code：目前（kng,o2o）
        }

        const res = await api.postPlayStudy(bodyParams)
        this.handlerJiangyi(res.attList)
        const { showIframe = false, playLoading = true, handler } = kngTypeMaper[res.kngType]
        this.playKngInfo = res
        this.showIframe = showIframe
        this.playLoading = playLoading
        this[handler](res)

        this.switchKng = false
      }
    },
    // 处理讲义
    handlerJiangyi (attList) {
      if (attList && attList.length > 0) {
        this.isHandouts = true
        this.docLists = attList.map(({ url }) => ({ url }))
      }
    },
    // 处理文档播放
    handlerDoc ({ playDetails }) {
      if (playDetails.length > 0) {
        this.docLists = playDetails
      } else {
        this.$toast('文档转码失败，播放列表为空')
        return
      }

      this.isDoc = true
    },
    // 处理视频播放
    handlerVideo ({ playDetails }) {
      if (playDetails.length > 0) {
        this.videoSrc = getPlaySrc(playDetails)
      } else {
        this.$toast('视频转码失败，播放列表为空')
        return
      }
      setTimeout(() => {
        if (this.$refs.video) {
          this.$refs.video.play()
        }
      }, 0)
      this.isVideo = true
    },
    // 处理音频播放
    handlerAudio ({ playDetails }) {
      if (playDetails.length > 0) {
        this.audioSrc = getPlaySrc(playDetails)
      } else {
        this.$toast('音频转码失败，播放列表为空')
        return
      }
      setTimeout(() => {
        if (this.$refs.audio) {
          this.$refs.audio.play()
        }
      }, 0)
      this.isAudio = true
    },
    // 处理scorm播放
    handlerScorm ({ playDetails, courseChapterContent }) {
      if (playDetails.length > 0) {
        let url = getPlaySrc(playDetails)
        let htmlUrl = ''
        if (courseChapterContent && courseChapterContent.length > 0) {
          htmlUrl = courseChapterContent[0].chapterHref
        }
        this.scormHtmlUrl = getUrl() + `media/scorm/scowrapperstudy.html?sco=${url}${htmlUrl}&token=${localStorage.token}&source=504&kngId=${this.kngId}&preview=0&targetId=${this.targetId}&targetCode=${this.targetCode}`
      } else {
        this.$toast('SCORM转码失败，播放列表为空')
        return
      }
      this.isScorm = true
    },
    // 处理html播放
    handlerHtml ({ playDetails }) {
      if (playDetails.length > 0) {
        this.scormHtmlUrl = getPlaySrc(playDetails)
      } else {
        this.$toast('HTML转码失败，播放列表为空')
        return
      }

      this.isHtml = true
    },
    // 处理xuanyes播放
    handlerXuanyes ({ playDetails }) {
      if (playDetails && playDetails.length > 0) {
        let playDetail = _find(playDetails, { desc: 'signUrl' })
        this.scormHtmlUrl = !_isEmpty(playDetail) && playDetail.url

        window.location.href = this.scormHtmlUrl
      } else {
        this.$toast('xuanyes转码失败，播放列表为空')
      }
    },
    closeIframe () {
      this.showIframe = false
    },

    // 文档换页处理
    onPageChange (page) {
      this.startDoc = page
    },
    // 清空参数
    clearData () {
      // 清空每次播放地址
      this.videoSrc = ''
      this.audioSrc = ''
      this.docLists = []
      this.scormHtmlUrl = ''

      this.playLoading = true
      this.getHour = false
      // 播放进度的清0
      this.isVideo = false
      this.isAudio = false
      this.isDoc = false
      this.isScorm = false
      this.isHtml = false
      this.showIframe = false

      this.isPause = false
      this.showSlideBar = false
      this.tempNum = 1
      this.delayNum = 15
      this.tempDelayNum = 0
      this.timersNum = 120
      this.tempTimersNum = 0

      this.scormHtmlUrl = ''

      this.timers = null
      this.studyTimers = null
      this.delayTimer = null
      this.delayTimeHandle = null
      this.timersHandle = null
    },
    // 退出时存储课程, 记录上次学习的知识
    storeCourse () {
      let studyArr = []
      let obj = {
        title: this.clickInfo.title,
        courseId: this.courseId,
        kngId: this.clickInfo.kngId
      }
      if (localStorage.studying) {
        studyArr = JSON.parse(localStorage.studying)
        studyArr.map(item => {
          if (item.courseId === this.courseId) {
            item.courseId = this.courseId
            item.kngId = this.clickInfo.kngId
            item.title = this.clickInfo.title
          } else {
            studyArr.push(obj)
          }
        })

        removeRepeatAndSetLocalStorage('studying', studyArr, 'courseId')
      } else {
        studyArr.push(obj)
        removeRepeatAndSetLocalStorage('studying', studyArr, 'courseId')
      }
    },
    // 点击获取每个知识详情
    clickKngDetail (chapterIndex, kngItem, kngIndex) {
      this.switchKng = true
      this.isHandouts = false

      // 点击赋值当前正在学
      this.chapterAllCatalog.map(chapter => {
        chapter.chapterKng.map(item => {
          if (item.kngId === kngItem.kngId) {
            this.$set(item, 'studying', 1)
          } else {
            this.$set(item, 'studying', 0)
          }
        })
      })

      // 如果是考试的话，则应该跳转考试页面
      if (kngItem.kngType === kngTypeEnum.EXAM) {
        window.location.href = window.location.origin + `/ote/#/exampreview?arrangeId=${this.clickInfo.kngId}&masterId=&masterType=2&packageId=${this.courseId}`
        return
      }
      // 如果是微课的话，则获取播放地址然后跳转微课页面
      if (kngItem.kngType === kngTypeEnum.WEIKE) {
        this.clickInfo = kngItem
        document.title = kngItem.title
        // 请求单个知识点击播放接口
        this.postPlayStudy()
        return
      }

      if (kngItem.kngType === kngTypeEnum.ZIP) {
        this.$toast('不支持手机端观看，请移步至pc端！')
        return
      }

      if (kngItem.kngType === kngTypeEnum.AUDIO) {
        this.audioCoverUrl = kngItem.coverUrl
      } else if (kngItem.kngType === kngTypeEnum.VIDEO) {
        this.videoImage = kngItem.coverUrl
      }

      this.clickInfo = kngItem
      document.title = kngItem.title

      // 点击目录其他知识清空参数
      this.clearData()
      // 请求单个知识点击播放接口
      this.postPlayStudy()
    }
  },
  beforeDestroy () {
    this.storeCourse()
  }
}
</script>
<style lang="scss" scoped>
  /deep/ .yxt-tabs__content {
    // 可视高度 - 底部btn - tab高度 - 播放器高度
    height: calc(100vh - 54px - 42px - 210px);
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }
</style>
