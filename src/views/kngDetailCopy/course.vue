<template>
  <div class="over-hidden" :class="isAddStudy ? 'pb54' : null" v-if="loading">
    <div class="detail-play-container pr bg-black">
      <!-- 播放的倒计时 -->
      <!--<template v-if="!isAudit">
        &lt;!&ndash; 音视频的倒计时 &ndash;&gt;
        <template v-if="(clickInfo.kngType === 2 || clickInfo.kngType === 3) && (isVideo || isAudio)">
          <num-down ref="numDown" :isShowProgress="isShowProgress"
            :kngInfo="clickInfo"
            :kngSchedule="clickInfo.schedule"
            :showSlideBar="showSlideBar"
            @closeTip="closeTip">
          </num-down>
        </template>
      </template>-->

      <div class="play-video-photo" v-show="!playLoading">
        <img :src="courseUrl" class="detail_play-coverUrl" v-if="Object.keys(kngInfo).length > 0">
        <div class="detail_mask"></div>
        <template>
          <yxt-icon name="play-circle-o" class="detail_play_icon" v-if="!isShowProgress" @click="postPlayStudy()" />
          <div class="detail-play-study" v-if="isShowProgress && schedule === 0">
            <p class="text-white font-size-16">未开始学习</p>
            <yxt-button class="mt16" round size="medium" @click="postPlayStudy()">开始学习</yxt-button>
          </div>
          <div class="detail-play-study" v-if="isShowProgress && schedule !== 0">
            <p class="text-white font-size-16 lh20">上次学到：{{lastStudy.title}}</p>
            <yxt-button class="mt16" round size="medium" @click="postPlayStudy()">继续学习</yxt-button>
          </div>
        </template>
      </div>
      <!-- 视频播放器 -->
      <yxtbiz-video ref="video" v-if="playLoading && isVideo" width="100%" height="210px"
        :src="videoSrc"
        :start="startTime"
        :image="videoImage"
        :watermark-config="option"
        @video-click="videoClick"
        @time-change="onTimeChange"
        @play="play"
        @pause="pause"
        @ended="playend"
        @error="playError">
        <template v-if="isGetLeaveTime" slot="tip">
          <!-- 视频的倒计时 -->
          <num-down ref="numDown" :isShowProgress="isShowProgress"
                    :kngInfo="clickInfo"
                    :kngSchedule="clickInfo.schedule"
                    :showSlideBar="showSlideBar"
                    :timeOut="timeOut"
                    >
          </num-down>
        </template>
        <div slot="end" class="text-white w-300" v-if="isShowNext">
          <span>即将播放下个知识 ({{ endNum }}s)</span>
          <span class="color-primary-6 ml15" @click="playNext">
            立即播放
            <yxt-svg-icon class="v-mid font-size-12" :baseurl='h5Url' width="16" height="16" icon-name="right" />
          </span>
        </div>
      </yxtbiz-video>
      <!--讲义图标-->
      <div v-if="isHandouts" class="teach_icon" @click="showHandouts">
        <!--<yxt-svg-icon :baseurl='kngUrl' width="18px" height="20px" icon-name="doc" />-->
        讲义
      </div>
      <!-- 讲义播放器 -->
      <yxt-popup class="closeBtn jangyi" v-model="isHandoutsShow" :lock-scroll="false" position="bottom" :round="false" :overlay="false" title="讲义" :style="{ height: 'calc(100% - 210px)' }" closeable="inner">
        <yxtbiz-doc-viewer height="210px"
                           :start="startDoc"
                           :file-list="docLists"
                           v-if="playLoading"
                           :watermark-config="docOption"
                           @click="videoClick"
                           @page-change="onPageChange">
        </yxtbiz-doc-viewer>
      </yxt-popup>
      <!-- 音频播放器 -->
      <yxtbiz-video ref="audio" v-if="playLoading && isAudio" width="100%" height="210px"
        :src="audioSrc"
        :start="startTime"
        :image="audioCoverUrl"
        @video-click="videoClick"
        @time-change="onTimeChange"
        @play="play"
        @pause="pause"
        @ended="playend"
        @error="playError"
        is-audio>
        <template v-if="isGetLeaveTime" slot="tip">
          <!-- 音频的倒计时 -->
          <num-down ref="numDown" :isShowProgress="isShowProgress"
                    :kngInfo="clickInfo"
                    :kngSchedule="clickInfo.schedule"
                    :showSlideBar="showSlideBar"
                    :timeOut="timeOut"
          >
          </num-down>
        </template>
        <div slot="end" class="text-white w-300" v-if="isShowNext">
          <span>即将播放下个知识 ({{ endNum }}s)</span>
          <span class="color-primary-6 ml15" @click="playNext">
            立即播放
            <yxt-svg-icon class="v-mid font-size-12" :baseurl='h5Url' width="16" height="16" icon-name="right" />
          </span>
        </div>
      </yxtbiz-video>
      <!-- 文档播放器 -->
      <yxtbiz-doc-viewer v-if="playLoading && isDoc" height="210px"
        :start="startDoc"
        :file-list="docLists"
        :watermark-config="docOption"
        @click="videoClick"
        @page-change="onPageChange">
          <template v-if="isGetLeaveTime"  slot="tip">
            <num-down ref="numDown" :isShowProgress="isShowProgress"
                      :kngInfo="clickInfo"
                      :kngSchedule="clickInfo.schedule"
                      :showSlideBar="showSlideBar"
                      :timeOut="timeOut"
            >
            </num-down>
          </template>
        </yxtbiz-doc-viewer>
    </div>
    <!-- scorm&html播放器 -->
    <course-scorm-html ref="courseIframePlay" :url="scormHtmlUrl" :isShowProgress="isShowProgress" :clickInfo="clickInfo" :showIframe="(isScorm || isHtml) && showIframe" @closeIframe="closeIframe"></course-scorm-html>

    <yxt-tabs v-model="active" :swipe-threshold="5" sticky swipeable>
      <yxt-tab title="详情" name="0">
        <kng-info :kngInfoDetail="kngInfo" :kngSchedule="schedule" :isShowProgress="isShowProgress"></kng-info>
      </yxt-tab>
      <yxt-tab title="目录" name="1">
        <kng-play-catalog-list
          :kngInfo="kngInfo"
          :chapterAllKng="chapterAllCatalog"
          @clickKngDetail="clickKngDetail"
          @changeKngChapter="changeKngChapter">
        </kng-play-catalog-list>
      </yxt-tab>
      <yxt-tab title="评价" name="2"><comment-list @changeScoreNum="changeScoreNum" :kngInfoDetail="kngInfo" :isAddStudy="isAddStudy"></comment-list></yxt-tab>
      <yxt-tab title="笔记" name="3"><kngNoteList :kngId="clickInfo.kngId" :title="kngInfo.title" :addStudy="kngInfo.addStudy" :isAddStudy="isAddStudy"></kngNoteList></yxt-tab>
      <!-- <yxt-tab title="问答">问答</yxt-tab> -->
    </yxt-tabs>
    <template>
      <kng-add-study v-if="isAddStudy" @isAdd="getIsAdd"></kng-add-study>
      <kng-footer :needToBuy="needToBuy" :price="kngInfo.price"></kng-footer>
    </template>
  </div>
  <div class="yui-screen-page" v-else>
    <yxt-loading text-size="16px">加载中...</yxt-loading>
  </div>
</template>

<script>
import api from '@/service/kngDetail.service'
import apiService from '@/service/knowledge.service.js'
import kngInfo from '@/views/kngDetail/components/kngInfo'
import CommentList from '@/views/kngDetail/components/commentList'
import kngNoteList from '@/views/kngDetail/components/kngNoteList'
import numDown from '@/views/kngDetail/components/numDown'
import KngAddStudy from '@/views/kngDetail/components/kngAddStudy'
import kngPlayCatalogList from '@/views/kngDetail/course/components/kngPlayCatalogList'
import kngFooter from '@/views/kngDetail/course/components/footer'
import courseScormHtml from '@/views/kngDetail/components/courseScormHtml'
import { getUrl, storeKngStudying, removeRepeatAndSetLocalStorage } from '@/core/utils'
import { countdownMixin } from '@/views/kngDetailCopy/mixins/countdown'
import { kngConfigMixin } from '@/views/kngDetailCopy/mixins/kngConfig'
import { watermarkConfigMixin } from '@/views/kngDetailCopy/mixins/waterConfig'
import { kngTypeEnum } from '@/core/kngType'

export default {
  name: 'courseDetail',
  mixins: [watermarkConfigMixin, kngConfigMixin, countdownMixin],
  components: {
    CommentList,
    kngInfo,
    KngAddStudy,
    kngNoteList,
    kngPlayCatalogList,
    courseScormHtml,
    numDown,
    kngFooter
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
      isHandouts: false, // 是否带讲义
      isHandoutsShow: false, // 讲义弹窗显示隐藏
      isAddStudy: true, // 是否有加入学习按钮
      isShowProgress: false, // 是否显示进度
      kngInfo: {},
      schedule: 0,
      loading: false,
      chapterAllKng: [], // 整个知识目录的知识
      firstPlayInfo: {}, // 课程第一个知识的信息
      orderControl: 0, // 是否按顺序学习
      playLoading: false, // 是否加载播放地址完成
      chapterAllCatalog: [], // 整个章节
      newChapterAllLists: [], // 整个章节章节数里所有的知识
      nextChapter: {}, // 下一个播放的章节知识
      isShowNext: true, // 是否显示播放最后的倒计时
      isNeedRequest: true, // 点完立即播放后在视频播放后不去进行下一个知识播放
      lastStudy: {}, // 上次学习知识详情
      switchKng: false,
      // 视频音频相同的参数控制
      startTime: 0, // 开始视频播放的时间
      isPause: false, // 是否播放器处于暂停状态
      showSlideBar: true, // tip显示和隐藏
      tempNum: 1, // 播放时第一次不去处理学习进度
      delayNum: 15, // 学时为1时，处理倒计时控制暂停、再继续
      tempDelayNum: 0, // 学时为1时，倒计时的重新赋值
      timersNum: 120, // 学时大于等于2时，处理倒计时控制暂停、再继续
      submitTime: 0,
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
      endNum: 3,
      endTimer: null,
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
      clearDialogNum: 1, // 进度提交失败，重新更改时计算
      // 水印配置
      option: {},
      docOption: {},
      needToBuy: false
    }
  },
  async mounted () {
    await this.getCheckExchanged()

    // 监听浏览器关闭事件
    let that = this
    // 监听浏览器关闭事件
    window.onunload = () => {
      that.storeCourse()
      that.storeKngTime()
      // 存储当前正在学
      storeKngStudying(that.clickInfo.kngId)
      that.clearAllTimers()
    }
  },
  methods: {
    async getCheckExchanged () {
      const { needToBuy } = await apiService.getCheckExchanged(this.courseId)
      this.needToBuy = needToBuy
    },
    // 显示讲义弹窗
    showHandouts () {
      this.isHandoutsShow = !this.isHandoutsShow
    },
    // 处理版本问题
    handleVersion () {
      let bodyParams = {
        courseId: this.courseId
      }
      api.postKngVersionAlert(bodyParams).then(() => {
        this.getKngDetail()
      }).catch(err => {
        if (err.error.key === 'apis.kng.knowledge.hours.changed') {
          this.updateHandler(bodyParams, 'hour')
        } else if (err.error.key === 'apis.kng.knowledge.version.changed') {
          this.updateHandler(bodyParams, 'version')
        }
      })
    },
    // 知识详情接口
    getKngDetail () {
      this.show = false
      let bodyParams = {
        courseId: this.courseId,
        id: this.courseId,
        preview: 0,
        targetId: this.targetId,
        targetCode: this.targetCode ? this.targetCode : 'kng'
      }

      api.postKngDetail(bodyParams).then(res => {
        this.kngInfo = res
        this.isAddStudy = !res.addStudy
        this.isShowProgress = res.addStudy
        // 设置知识title
        document.title = this.kngInfo.title
        this.orderControl = this.kngInfo.orderControl
        this.submitTime = this.kngInfo.submitTime
      }).then(() => {
        // 请求课程包的全章节数据
        this.getCourseCatalog()
      }).catch(err => {
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
      })
    },
    // 获取是否加入学习
    getIsAdd (val) {
      this.isShowProgress = !val
      this.isAddStudy = val
    },
    // 处理tip
    handleTip () {
      if (!this.showSlideBar) {
        this.showSlideBar = true
      }
    },
    // 关闭视频提示
    closeTip () {
      this.showSlideBar = false
    },
    // 改变评分
    changeScoreNum (data) {
      this.kngInfo.avgCommentScore = data
    },
    // 获取知识目录
    getCourseCatalog (num) {
      let params = {
        id: this.courseId,
        preview: 0
      }

      apiService.getChapterTreeStudy(params).then(res => {
        this.schedule = res.schedule
        if (res.chapterInfoList.length > 0) {
          this.chapterAllCatalog = res.chapterInfoList
          if (num !== 1) {
            this.chapterAllKng = this.handlerChapter(res.chapterInfoList)
          } else {
            this.chapterAllCatalog.map(chapter => {
              chapter.chapterKng.map(item => {
                if (item.kngId === this.clickInfo.kngId) {
                  this.$set(item, 'studying', 1)
                  this.clickInfo.schedule = item.schedule
                } else {
                  this.$set(item, 'studying', 0)
                }
              })
            })
          }
        }
      }).catch(err => {
        if (err.error.key === 'apis.kng.knowledge.hours.changed') {
          this.updateHandler({ courseId: this.courseId }, 'hour')
        }
        console.log(err)
      })
    },
    // 处理所有章节
    handlerChapter (res) {
      let chapterLists = []
      res.map(item => {
        if (item.chapterKng && item.chapterKng.length > 0) {
          item.chapterKng.map((chapter, index) => {
            chapterLists.push(chapter)
            this.newChapterAllLists.push(chapter)
          })
        }
      })

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

      this.leaveTime = this.clickInfo.studyHours - this.clickInfo.learnedHours

      this.handlerSecondHour(this.clickInfo.kngId)

      this.firstPlayInfo = chapterLists[0]

      if (this.firstPlayInfo.kngType === 1 || this.firstPlayInfo.kngType === 2) {
        if (this.firstPlayInfo.coverUrl) {
          this.courseUrl = this.firstPlayInfo.coverUrl
        } else {
          this.$nextTick(() => {
            this.courseUrl = this.kngInfo.coverUrl
          })
        }
      } else {
        this.$nextTick(() => {
          this.courseUrl = this.kngInfo.coverUrl
        })
      }

      if (this.firstPlayInfo.kngType === 3) {
        this.audioCoverUrl = this.firstPlayInfo.coverUrl
      }

      // 类型不是考试和微课的话，请求当前知识的详情，清空多学习数据，便于课程包里知识的提交
      if (this.firstPlayInfo.kngType !== 91 && this.firstPlayInfo.kngType !== 4) {
        // 加上参数为1的目的是课程应该没有多知识弹框的，只有知识学习时候去请求知识详情时看是否当前其他正在学习知识，此时不要清除知识学习
        this.postCourseKngDetail(this.firstPlayInfo.kngId, 1)
      }

      this.loading = true

      return chapterLists
    },
    // 控制学习顺序改变章节数据
    changeKngChapter () {
      let kngIndex = this.chapterAllKng.findIndex(item => {
        return item.schedule !== 100
      })

      // 判断列表里不会每个知识都100%进度，如果都是100%进度则kngIndex为-1
      if (kngIndex !== -1) {
        this.chapterAllKng.map((item, index) => {
          if (index >= (kngIndex + 1)) {
            item.lock = 1
          }
        })
      }
    },
    // 处理知识播放接口
    postPlayStudy () {
      this.playLoading = false
      if (this.clickInfo.kngType === 91) { // 考试
        window.location.href = window.location.origin + `/ote/#/exampreview?arrangeId=${this.clickInfo.kngId}&masterId=&masterType=2&packageId=${this.courseId}`
      } else {
        if (this.needToBuy) {
          this.$toast({ message: this.$t('kng_detail_msg_exchange_please') })
          return
        }
        this.leaveTime = this.clickInfo.studyHours - this.clickInfo.learnedHours

        let bodyParams = {
          clientType: 1, // 是否是h5
          courseId: this.courseId, // 课程id
          id: this.clickInfo.kngId, // 知识id
          preview: 0, // 是否预览查看 0：否，1：预览
          targetId: this.targetId, // 项目id
          targetCode: this.targetCode // 来源code：目前（kng,o2o）
        }

        api.postPlayStudy(bodyParams).then(res => {
          this.playLoading = true
          this.playKngInfo = res
          // 处理讲义
          if (res.attList && res.attList.length > 0) {
            this.isHandouts = true
            res.attList.forEach(item => {
              this.docLists.push({ url: item.url })
            })
          } else {
            this.isHandouts = false
          }
          // 0.课程、1.文档、2.视频、3.音频、4.微课、5.SCORM、6.HTML、7.压缩包
          switch (res.kngType) {
            case 1:
              this.handlerDoc(res)
              break
            case 2:
              this.handlerVideo(res)
              break
            case 3:
              this.handlerAudio(res)
              break
            case 4:
              this.showIframe = true
              this.playLoading = false
              this.handlerXuanyes(res)
              break
            case 5:
              this.showIframe = true
              this.playLoading = false
              this.handlerScorm(res)
              break
            case 6:
              this.showIframe = true
              this.playLoading = false
              this.handlerHtml(res)
              break
            case 7:
              break
          }
          if (res.kngType === 5 || res.kngType === 6) {
            // 是否不套iframe:1 是(不嵌套) 0 否（嵌套）
            if (this.clickInfo.noIframe) {
              // 不嵌套处理 , 1-代表打开直接完成
              this.postKngSubmit(1)
              return
            }
            if (res.kngType === 5 && this.clickInfo.courseVersion !== 0) {
              return
            }
          }

          if (res.kngType === 1 || res.kngType === 5 || res.kngType === 6) {
            this.getHour = true
            if (this.tempNum === 1) {
              this.tempNum++
            }
          }

          this.switchKng = false
        }).catch(err => {
          console.log(err)
        })
      }
    },
    // 处理文档播放
    handlerDoc (res) {
      if (res.playDetails.length > 0) {
        // 处理断点续播
        this.handlerUpdateProgress(res)

        res.playDetails.forEach(item => {
          this.docLists.push({ url: item.url })
        })
      } else {
        this.$toast('文档转码失败，播放列表为空')
        return
      }

      this.isDoc = true
    },
    // 处理视频播放
    handlerVideo (res) {
      if (res.playDetails.length > 0) {
        // 处理断点续播
        this.handlerUpdateProgress(res)

        this.videoSrc = res.playDetails[0].url
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
    handlerAudio (res) {
      if (res.playDetails.length > 0) {
        // 处理断点续播
        this.handlerUpdateProgress(res)

        this.audioSrc = res.playDetails[0].url
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
    handlerScorm (res) {
      if (res.playDetails.length > 0) {
        let url = res.playDetails[0].url
        let htmlUrl = ''
        if (res.courseChapterContent && res.courseChapterContent.length > 0) {
          htmlUrl = res.courseChapterContent[0].chapterHref
        }
        this.scormHtmlUrl = getUrl() + `media/scorm/scowrapperstudy.html?sco=${url}${htmlUrl}&token=${localStorage.token}&source=504&kngId=${this.clickInfo.kngId}&preview=0&targetId=${this.targetId}&targetCode=${this.targetCode}`
      } else {
        this.$toast('SCORM转码失败，播放列表为空')
        return
      }
      this.isScorm = true
    },
    // 处理html播放
    handlerHtml (res) {
      if (res.playDetails.length > 0) {
        this.scormHtmlUrl = res.playDetails[0].url
      } else {
        this.$toast('HTML转码失败，播放列表为空')
        return
      }

      this.isHtml = true
    },
    // 处理xuanyes播放
    handlerXuanyes (res) {
      if (res.playDetails && res.playDetails.length > 0) {
        res.playDetails.forEach((item, index) => {
          if (item.desc === 'signUrl') {
            this.scormHtmlUrl = item.url
          }
        })
        window.location.href = this.scormHtmlUrl
      } else {
        this.$toast('xuanyes转码失败，播放列表为空')
      }
    },
    closeIframe () {
      this.showIframe = false
    },
    // 处理断点续播
    handlerUpdateProgress (res) {
      if (localStorage.playTimeArr && JSON.parse(localStorage.playTimeArr).length > 0) {
        let playArr = JSON.parse(localStorage.playTimeArr)
        playArr.map(item => {
          if (item.kngId === this.clickInfo.kngId) {
            // 如果进度100%，则取本地缓存的进度作为播放，不管接口返回的进度
            if (this.clickInfo.kngType === kngTypeEnum.DOC) {
              if (this.clickInfo.schedule === 100) {
                // 文档是文档页数赋值
                this.startDoc = item.time
              } else {
                if (parseInt(res.viewLoc) > res.pageSize) {
                  this.startDoc = 0
                } else {
                  if (parseInt(res.viewLoc) > parseInt(item.time)) {
                    this.startDoc = res.viewLoc || 0
                  } else {
                    this.startDoc = item.time || 0
                  }
                }
              }
            } else if (this.clickInfo.kngType === kngTypeEnum.VIDEO || this.clickInfo.kngType === kngTypeEnum.AUDIO) {
              if (this.clickInfo.schedule === 100) {
                this.startTime = 0
              } else {
                // 这个知识被重新上传后视频长度调小了，此时startTime为0
                if (parseInt(res.viewLoc) > res.pageSize) {
                  this.startTime = 0
                } else {
                  if (parseInt(res.viewLoc) > parseInt(item.time)) {
                    this.startTime = res.viewLoc || 0
                  } else {
                    this.startTime = item.time || 0
                  }
                }
              }
            }
          }
        })
      } else {
        if (this.clickInfo.kngType === kngTypeEnum.DOC) {
          if (this.clickInfo.schedule === 100) {
            this.startDoc = 0
          } else {
            // 这个知识被重新上传后视频长度调小了，此时startTime为0
            if (parseInt(res.viewLoc) > res.pageSize) {
              this.startDoc = 0
            } else {
              this.startDoc = res.viewLoc || 0
            }
          }
        } else if (this.clickInfo.kngType === kngTypeEnum.VIDEO || this.clickInfo.kngType === kngTypeEnum.AUDIO) {
          if (this.clickInfo.schedule === 100) {
            this.startTime = 0
          } else {
            // 这个知识被重新上传后视频长度调小了，此时startTime为0
            if (parseInt(res.viewLoc) > res.pageSize) {
              this.startTime = 0
            } else {
              this.startTime = res.viewLoc || 0
            }
          }
        }
      }
    },
    // 处理学习改变
    handleChangeStudy (error, isEnd) {
      this.Dialog.confirm({
        title: '提示',
        message: '系统在同一时间只记录一个知识的学习进度和学分，如果您选择切换观看新知识，则只会记录新知识的学习进度和学分',
        confirmButtonText: '切换到新知识',
        closeOnPopstate: true
      }).then(() => {
        // 确定操作
        let bodyParams = {
          kngId: this.clickInfo.kngId
        }
        api.postStudyChange(bodyParams).then(res => {
          // 当学习提交时候报错时，问是否改变观看新知识，是则重新提交学习进度
          if (error === 'error') {
            if (this.clearDialogNum === 2) {
              setTimeout(() => {
                if (this.$refs.video) {
                  this.$refs.video.play()
                }
                if (this.$refs.audio) {
                  this.$refs.audio.play()
                }
              }, 0)

              this.clearDialogNum = 1
            }
          }
        }).catch(err => {
          console.log(err)
        })
      }).catch(() => {
        // 取消操作
        this.$router.go(-1)
      })
    },
    onTimeChange (time) {
      this.startTime = time
      if (time) {
        this.getHour = true
      }
    },
    // 知识提交
    postKngSubmit (isEnd) {
      let params = {
        kngId: this.clickInfo.kngId,
        targetCode: this.targetCode ? this.targetCode : 'kng',
        targetId: this.targetId
      }

      if (isEnd === 1) {
        params.end = 1
      }

      if (this.clickInfo.kngType === kngTypeEnum.VIDEO || this.clickInfo.kngType === kngTypeEnum.AUDIO) {
        params.viewLoc = parseFloat(this.startTime)
      } else if (this.clickInfo.kngType === kngTypeEnum.DOC) {
        params.viewLoc = this.startDoc
      }
      api.postKngSubmitSecond(params).then(res => {
        this.getCourseCatalog(1)
      }).catch(err => {
        if (err.error.key === 'apis.kng.study.needChange') {
          // 清除计时器，清除提交
          this.clearAllTimers()

          setTimeout(() => {
            if (this.$refs.video) {
              this.$refs.video.pause()
            }
            if (this.$refs.audio) {
              this.$refs.audio.pause()
            }
          }, 0)

          this.isPause = true
          this.clearDialogNum = 2

          this.handleChangeStudy('error', isEnd)
        } else if (err.error.key === 'apis.kng.knowledge.hours.changed') {
          this.updateHandler({ courseId: this.courseId }, 'hour')
        }
        console.log(err)
      })
    },
    // 播放结束事件
    playend () {
      if (this.$refs.numDown) {
        this.$refs.numDown.clearTimer()
      }
      this.startTime = 0

      if (localStorage.playTimeArr && JSON.parse(localStorage.playTimeArr).length > 0) {
        let playArr = JSON.parse(localStorage.playTimeArr)
        playArr.map(item => {
          if (item.kngId === this.clickInfo.kngId) {
            item.time = 0
          }
        })
        removeRepeatAndSetLocalStorage('playTimeArr', playArr)
      }

      // 处理按顺序&不按顺序播放
      this.handlerNextPlay()
    },
    handlerNextPlay () {
      this.endTimer = setInterval(() => {
        this.endNum--
        this.$nextTick(() => {
          if (this.endNum === 0) {
            this.endNum = 0
          }
        })
      }, 1000)

      if ((this.kngInfo.orderControl && this.clickInfo.schedule === 100) || !this.kngInfo.orderControl) {
        let newChapterIndex = this.newChapterAllLists.findIndex(v => {
          return v.kngId === this.clickInfo.kngId
        })

        if (newChapterIndex === this.newChapterAllLists.length - 1) {
          this.isShowNext = false
          return
        }

        this.nextChapter = this.newChapterAllLists[newChapterIndex + 1]
        if (this.nextChapter && (this.nextChapter.fileType !== 'zip' || this.nextChapter.fileType !== 'exam')) {
          setTimeout(() => {
            if (this.isNeedRequest) {
              const clearRequest = 1
              this.clickKngDetail(this.nextChapter, clearRequest)
            }
          }, 3000)
        }
      }
    },
    playNext () {
      this.isNeedRequest = false
      this.clickKngDetail(this.nextChapter)
    },
    play () {
      this.playOperation(this.clickInfo.studyHours)
    },
    pause () {
      this.pauseOperation()
    },
    // 视频点击
    videoClick () {
      this.handleTip()
    },
    // 处理防作弊
    handlerConf () {
      this.moveTime = setInterval(() => {
        let nowTime = new Date().getTime()
        if ((nowTime - this.lastMoveTime) > (this.kngConf.maxMin * 60 * 1000)) {
          window.clearInterval(this.moveTime)
          // 文档暂停
          if (!this.isPause) {
            if (this.$refs.video) {
              this.$refs.video.pause()
            }
            if (this.$refs.audio) {
              this.$refs.audio.pause()
            }
          }
          this.Dialog.confirm({
            title: '提示',
            message: this.kngConf.tips,
            confirmButtonText: '继续学习',
            closeOnPopstate: true,
            showCancelButton: false
          }).then(() => {
            // 文档播放
            if (this.isPause) {
              if (this.$refs.video) {
                this.$refs.video.play()
              }
              if (this.$refs.audio) {
                this.$refs.audio.play()
              }
            }
            // 点击继续学习调自己
            if (this.kngConf.enabled) {
              this.handlerConf()
            }
          }).catch(() => {
            // 取消操作
          })
        }
      }, 1000)
    },
    // 文档换页处理
    onPageChange (page) {
      this.startDoc = page
    },
    // 进行每个知识的断点续播的存储
    storeKngTime () {
      if (this.clickInfo.kngType === 1 || this.clickInfo.kngType === 2 || this.clickInfo.kngType === 3) {
        let playTimeArr = []
        let playObj = {
          kngId: this.clickInfo.kngId,
          studyTime: this.timeCount
        }
        if (this.clickInfo.kngType === 1) {
          playObj.time = this.startDoc
        } else {
          playObj.time = this.startTime
        }
        if (localStorage.playTimeArr && JSON.parse(localStorage.playTimeArr).length > 0) {
          playTimeArr = JSON.parse(localStorage.playTimeArr)
          playTimeArr.map(item => {
            if (item.kngId !== playObj.kngId) {
              playTimeArr.push(playObj)
            } else {
              item.time = playObj.time
              item.studyTime = playObj.studyTime
            }
          })
          removeRepeatAndSetLocalStorage('playTimeArr', playTimeArr)
        } else {
          playTimeArr.push(playObj)
          removeRepeatAndSetLocalStorage('playTimeArr', playTimeArr)
        }
      }
    },
    // 清空参数
    clearData (clearRequest) {
      // 清空每次播放地址
      this.videoSrc = ''
      this.audioSrc = ''
      this.docLists = []
      this.scormHtmlUrl = ''

      this.playLoading = true
      this.getHour = false
      // 播放进度的清0
      this.startTime = 0
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

      this.resetData()
      this.moveTime && window.clearInterval(this.moveTime)
      this.handlerSecondHour(this.clickInfo.kngId)
      this.clearAllTimers()

      this.timers = null
      this.studyTimers = null
      this.delayTimer = null
      this.delayTimeHandle = null
      this.timersHandle = null
      // 清除倒计时
      this.nextChapter = {}
      this.isShowNext = true
      this.endNum = 3
      this.endTimer && window.clearInterval(this.endTimer)
      this.endTimer = null

      if (clearRequest) {
        this.isNeedRequest = true
      }
    },
    // 调课程包里单个知识详情接口
    postDetailCourse (kngId) {
      let bodyParams = {
        courseId: this.courseId,
        id: kngId,
        preview: 0,
        targetId: this.targetId,
        targetCode: this.targetCode ? this.targetCode : 'kng'
      }

      api.postKngDetail(bodyParams).then(res => {
        // 判断是否开启多知识学习
        if (this.kngConf.moreEnabled) {
          this.lastName = res.lastName
          if (this.lastName !== null && this.lastName !== undefined) {
            this.handleChangeStudy()
          }
        }
      }).catch(err => {
        console.log(err)
      })
    },
    // 删除判断之前学的是不是当前新打开的这个
    deleteDetail (kngId) {
      if (localStorage.playStudyArr) {
        let playStudyArr = JSON.parse(localStorage.playStudyArr)
        if (playStudyArr.length > 0) {
          let bodyParams = {
            ids: playStudyArr.join(',')
          }
          api.postDeleteStudy(bodyParams).then((res) => {
            localStorage.removeItem('playStudyArr')
          }).then(() => {
            this.postDetailCourse(kngId)
          }).catch(err => {
            console.log(err)
          })
        }
      } else {
        this.postDetailCourse(kngId)
      }
    },
    // 获取每个课程包知识的详情
    postCourseKngDetail (kngId, num) {
      if (num === 1) {
        this.deleteDetail(kngId)
      } else {
        let params = {}
        // 清除当前正在学习的知识
        api.postDeleteStudy(params).then(() => {
          this.postDetailCourse(kngId)
        }).catch(err => {
          console.log(err)
        })
      }
    },
    // 点击获取每个知识详情
    async clickKngDetail (kngItem, clearRequest) {
      // 积分兑换的课程
      if (this.needToBuy) {
        this.$toast({ message: this.$t('kng_detail_msg_exchange_please') })
        return
      }
      // 控制学习顺序情况下
      if (this.orderControl) {
        let beforeArr = []
        this.chapterAllKng.map((item, index) => {
          if (item.kngId === kngItem.kngId) {
            if (index === 0) {
              beforeArr = this.chapterAllKng[0]
            }
            beforeArr = this.chapterAllKng.slice(0, index)
          }
        })
        let beforeSchedule = beforeArr.filter(arr => {
          return arr.schedule !== 100
        })
        if (beforeSchedule.length > 0) {
          this.$toast('管理员设置了按顺序学习，请从上到下依次学习！')
          return
        }
      }
      await this.storeKngTime()
      this.switchKng = true

      if (kngItem.kngType === 7 || (kngItem.kngType === 5 && !kngItem.isSupportApp) || (kngItem.kngType === 6 && !kngItem.isSupportApp)) {
        this.$toast('不支持手机端观看，请移步至pc端！')
        return
      }

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
      if (kngItem.kngType === 91) {
        window.location.href = window.location.origin + `/ote/#/exampreview?arrangeId=${this.clickInfo.kngId}&masterId=&masterType=2&packageId=${this.courseId}`
        return
      }
      // 如果是微课的话，则获取播放地址然后跳转微课页面
      if (kngItem.kngType === 4) {
        this.clickInfo = kngItem
        document.title = kngItem.title
        // 请求单个知识点击播放接口
        this.postPlayStudy()
        return
      }

      if (kngItem.kngType === 3) {
        this.audioCoverUrl = kngItem.coverUrl
      } else if (kngItem.kngType === 2) {
        this.videoImage = kngItem.coverUrl
      }

      this.clickInfo = kngItem
      document.title = kngItem.title

      // 点击目录其他知识清空参数
      this.clearData(clearRequest)
      // 点击获取点击知识的知识详情
      this.postCourseKngDetail(kngItem.kngId)
      // 请求单个知识点击播放接口
      this.postPlayStudy()
    },
    // 退出时存储课程, 记录上次学习的知识
    storeCourse () {
      let studyArr = []
      let obj = {
        title: this.clickInfo.title,
        courseId: this.courseId,
        kngId: this.clickInfo.kngId
      }
      if (localStorage.studying && JSON.parse(localStorage.studying).length > 0) {
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
    }
  },
  watch: {
    getHour (v) {
      if (v) {
        this.handleTip()
        this.play()
        this.handlerConf()
      }
    }
  },
  beforeDestroy () {
    this.clearAllTimers()

    this.storeCourse()
    // 存储当前正在学
    storeKngStudying(this.clickInfo.kngId)
    // 进行每个知识的断点续播的存储，从审核知识过来也要进行断点续播
    this.storeKngTime()
  }
}
</script>
