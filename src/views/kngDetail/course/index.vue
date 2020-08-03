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
        <template v-if="!isAudit">
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
        <template v-else>
          <yxt-icon name="play-circle-o" class="detail_play_icon" @click="postPlayStudy()" />
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
                    @pause="playPause"
                    @ended="playend"
                    @error="playError">
        <template v-if="!isAudit" slot="tip">
          <!-- 视频的倒计时 -->
          <num-down ref="numDown" :isShowProgress="isShowProgress"
                    :timeOut="timeOut"
                    :kngInfo="clickInfo"
                    :kngSchedule="clickInfo.schedule"
                    :showSlideBar="showSlideBar"
          >
          </num-down>
        </template>
        <!-- <span slot="end" class="text-white">
          即将播放下一个视频<span class="bg-primary-6">立即播放</span>
        </span> -->
      </yxtbiz-video>
      <!--讲义图标-->
      <div v-if="isHandouts" class="teach_icon" @click="showHandouts">
        <!--<yxt-svg-icon :baseurl='kngUrl' width="18px" height="20px" icon-name="doc" />-->
        讲义
      </div>
      <!-- 讲义播放器 -->
      <yxt-popup class="closeBtn jangyi" v-model="isHandoutsShow" position="bottom" :round="false" :overlay="false" title="讲义" :style="{ height: 'calc(100% - 210px)' }" closeable="inner">
        <yxtbiz-doc-viewer height="210px"
                           :start="startDoc"
                           :file-list="docLists"
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
                    @pause="playPause"
                    @ended="playend"
                    @error="playError"
                    is-audio>
        <template v-if="!isAudit" slot="tip">
          <!-- 音频的倒计时 -->
          <num-down ref="numDown" :isShowProgress="isShowProgress"
                    :kngInfo="clickInfo"
                    :timeOut="timeOut"
                    :kngSchedule="clickInfo.schedule"
                    :showSlideBar="showSlideBar"
          >
          </num-down>
        </template>
      </yxtbiz-video>
      <!-- 文档播放器 -->
      <yxtbiz-doc-viewer v-if="playLoading && isDoc" height="210px"
                         :start="startDoc"
                         :file-list="docLists"
                         :watermark-config="docOption"
                         @click="videoClick"
                         @page-change="onPageChange">
        <div slot="tip">
          <doc-num-down
            v-show="isShowProgress"
            ref="docNumDown"
            :kngInfo="clickInfo"
            :kngSchedule="clickInfo.schedule">
          </doc-num-down>
        </div>
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
    <template v-if="!isAudit">
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
import docNumDown from '@/views/kngDetail/components/docNumDown'
import KngAddStudy from '@/views/kngDetail/components/kngAddStudy'
import kngPlayCatalogList from './components/kngPlayCatalogList'
import kngFooter from './components/footer'
import courseScormHtml from '@/views/kngDetail/components/courseScormHtml'
import { isNotEmpty, getUrl, storeKngStudying, removeRepeatAndSetLocalStorage } from '@/core/utils'

export default {
  name: 'courseDetail',
  components: {
    CommentList,
    kngInfo,
    KngAddStudy,
    kngNoteList,
    kngPlayCatalogList,
    courseScormHtml,
    numDown,
    docNumDown,
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
      needToBuy: false,
      timeOut: 0 // 为向后台提交的时间
    }
  },
  computed: {
    // 是否是从审核中那边过来的
    isAudit () {
      if (isNotEmpty(this.status)) {
        return this.status !== 4
      }
      return false
    }
  },
  async mounted () {
    if (!this.isAudit) {
      await this.getCheckExchanged()
      await this.getKngConf()
      await this.handleVersion()
    } else {
      this.getKngDetail()
    }

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

    this.getWatermarkConfig()
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
    // 获取防作弊配置
    getKngConf () {
      api.getKngConf().then(res => {
        this.kngConf = res
        this.moreEnabled = res.moreEnabled
      }).catch(err => {
        console.log(err)
      })
    },
    // 处理版本问题
    handleVersion () {
      let bodyParams = {
        courseId: this.courseId
      }
      api.postKngVersionAlert(bodyParams).then(versionObj => {
      }).then(() => {
        this.getKngDetail()
      }).catch(err => {
        if (err.error.key === 'apis.kng.knowledge.hours.changed') {
          this.hourUpdate(bodyParams)
        } else if (err.error.key === 'apis.kng.knowledge.version.changed') {
          this.tipUpdate(bodyParams)
        }
        console.log(err)
      })
    },
    hourUpdate (bodyParams) {
      this.Dialog.confirm({
        title: '提示',
        message: '本知识（课程）学时被更新，学习进度将被重置',
        confirmButtonText: '我知道了',
        closeOnPopstate: true,
        showCancelButton: false
      }).then(() => {
        this.clearVersion(bodyParams)
      }).catch(() => {
        // 取消操作
        this.$router.go(-1)
      })
    },
    tipUpdate (bodyParams) {
      this.Dialog.confirm({
        title: '提示',
        message: '本知识（课程）更新了新版本，建议您重新学习',
        confirmButtonText: '我知道了',
        closeOnPopstate: true,
        showCancelButton: false
      }).then(() => {
        this.clearVersion(bodyParams)
      }).catch(() => {
        // 取消操作
        this.$router.go(-1)
      })
    },
    clearVersion (params) {
      // 确定操作
      api.putkngVersionAlert(params).then(() => {
        this.getKngDetail()
      }).catch(err => {
        console.log(err)
      })
    },
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

      if (this.isAudit) {
        bodyParams.preview = 1
      }

      api.postKngDetail(bodyParams).then(res => {
        this.kngInfo = res
        this.isAddStudy = !res.addStudy
        this.isShowProgress = res.addStudy
        // 设置知识title
        document.title = this.kngInfo.title
        this.orderControl = this.kngInfo.orderControl
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

      if (this.isAudit) {
        params.preview = 1
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
          this.hourUpdate({ courseId: this.courseId })
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
      if (this.clickInfo.kngType === 91) { // 考试
        window.location.href = window.location.origin + `/ote/#/exampreview?arrangeId=${this.clickInfo.kngId}&masterId=&masterType=2&packageId=${this.courseId}`
      } else {
        if (this.needToBuy) {
          this.$toast({ message: this.$t('kng_detail_msg_exchange_please') })
          return
        }
        let bodyParams = {
          clientType: 1, // 是否是h5
          courseId: this.courseId, // 课程id
          id: this.clickInfo.kngId, // 知识id
          preview: 0, // 是否预览查看 0：否，1：预览
          targetId: this.targetId, // 项目id
          targetCode: this.targetCode // 来源code：目前（kng,o2o）
        }

        if (this.isAudit) {
          bodyParams.preview = 1
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
          if (!this.isAudit) {
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
        this.scormHtmlUrl = getUrl() + `media/scorm/scowrapperstudy.html?sco=${url}${htmlUrl}&token=${localStorage.token}&source=504&kngId=${this.kngId}&preview=0&targetId=${this.targetId}&targetCode=${this.targetCode}`
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
            if (this.clickInfo.kngType === 1) {
              if (this.clickInfo.schedule === 100) {
                this.startDoc = 1
              } else {
                if (parseInt(res.viewLoc) > parseInt(item.time)) {
                  this.startDoc = res.viewLoc || 1
                } else {
                  this.startDoc = item.time || 1
                }
              }
            } else if (this.clickInfo.kngType === 2 || this.clickInfo.kngType === 3) {
              if (this.clickInfo.schedule === 100) {
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
        })
      } else {
        if (this.clickInfo.kngType === 1) {
          if (this.clickInfo.schedule === 100) {
            this.startDoc = 1
          } else {
            this.startDoc = res.viewLoc || 1
          }
        } else if (this.clickInfo.kngType === 2 || this.clickInfo.kngType === 3) {
          if (this.clickInfo.schedule === 100) {
            this.startTime = 0
          } else {
            this.startTime = res.viewLoc || 0
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
              this.isPause = false
              this.handerStudyHour(this.clickInfo.studyHours)

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
    handerStudyHour (time, source) {
      // 音视频这么处理
      if (this.playKngInfo.pageSize <= 15 && this.clickInfo.schedule !== 100 && time > 0 && time < 2 && (this.clickInfo.kngType === 2 || this.clickInfo.kngType === 3)) {
        this.postKngSubmit()
        return
      }
      if (time === 0) {
        if (source !== 'play' && this.kngInfo.schedule !== 100) {
          // 学时为0，立刻提交
          this.postKngSubmit()
        }
      } else if (time === 1) {
        // 15秒提交一次
        this.delayTimer = setTimeout(() => {
          this.delayTimer = 0

          if (this.schedule !== 100) {
            this.postKngSubmit()
          }
          window.clearInterval(this.delayTimeHandle)
          this.delayNum = 15
        }, 15 * 1000)
        // 处理15倒计时
        this.delayTimeHandle = setInterval(() => {
          this.delayNum--
        }, 1000)
      } else if (time >= 2) {
        // 2分钟提交一次
        this.timers = setInterval(() => {
          this.postKngSubmit()
          this.timersNum = 120
        }, 2 * 60 * 1000)
        // 处理120倒计时
        this.timersHandle = setInterval(() => {
          this.timersNum--
        }, 1000)
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

      if (this.clickInfo.kngType === 2 || this.clickInfo.kngType === 3) {
        params.viewLoc = parseFloat(this.startTime)
      } else if (this.clickInfo.kngType === 1) {
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
          this.hourUpdate({ courseId: this.courseId })
        }
        console.log(err)
      })
    },
    // 播放事件
    play () {
      if (!this.isAudit) {
        this.isPause = false
        this.playOperation()
      }
    },
    // 播放暂停事件
    playPause () {
      if (!this.isAudit) {
        this.isPause = true
        this.pauseOperation()
      }
    },
    // 播放结束事件
    playend () {
      if (!this.isAudit) {
        this.$refs.numDown.clearTimer()
        this.startTime = 0

        if (localStorage.playTimeArr && JSON.parse(localStorage.playTimeArr).length > 0) {
          let playArr = JSON.parse(localStorage.playTimeArr)
          playArr.map(item => {
            if (item.kngId === this.kngId) {
              item.time = 0
            }
          })
          removeRepeatAndSetLocalStorage('playTimeArr', playArr)
        }
      }
    },
    // 视频点击
    videoClick () {
      if (!this.isAudit) {
        this.handleTip()
      }
    },
    // 播放失败事件
    playError () {
      if (!this.isAudit) {
        this.$refs.numDown.clearTimer()
      }
    },
    // 播放操作
    playOperation () {
      if (this.tempNum === 1) {
        this.tempNum++
      } else {
        setTimeout(() => {
          if (this.clickInfo.kngType === 2 || this.clickInfo.kngType === 3) {
            // 倒计时的处理
            if (this.$refs.numDown) {
              this.$refs.numDown.handleClick()
            }
          } else if (this.clickInfo.kngType === 1) {
            if (this.$refs.docNumDown) {
              this.$refs.docNumDown.handleClick()
            }
          } else if (this.clickInfo.kngType === 5 || this.clickInfo.kngType === 6) {
            if (this.$refs.courseIframePlay) {
              this.$refs.courseIframePlay.courseHandlerClick()
            }
          }
        }, 0)

        // 首先在播放操作判断当前视频是否小于15秒,小于则直接返回
        if (this.playKngInfo.pageSize < 15 && this.clickInfo.schedule !== 100 && this.clickInfo.studyHours === 1) {
          this.postKngSubmit()
          return
        }

        if (this.clickInfo.studyHours >= 2) {
          this.pauseTimers = setTimeout(() => {
            this.pauseTimers = 0
            this.postKngSubmit()
            window.clearInterval(this.pauseTimersHandle)
          }, this.tempTimersNum * 1000)
          // 处理120倒计时
          this.pauseTimersHandle = setInterval(() => {
            this.timersNum--
          }, 1000)

          // 在提交完成后去处理再一次学习的提交
          if (this.timersNum === 1) {
            this.timersNum = 120
            this.clearAllTimers()
            this.handerStudyHour(this.clickInfo.studyHours, 'play')
          }
        } else if (this.clickInfo.studyHours === 1) {
          if (this.clickInfo.schedule !== 100) {
            this.pauseDelayTimer = setTimeout(() => {
              this.postKngSubmit()
              clearInterval(this.pauseDelayTimeHandle)
            }, this.tempDelayNum * 1000)

            this.pauseDelayTimeHandle = setInterval(() => {
              this.delayNum--
            }, 1000)

            if (this.delayNum === 1) {
              this.delayNum = 15
              this.clearAllTimers()
              // 15秒提交因为就提交一次，所以只需要暂停时候提交上一次的
            }
          }
        } else if (this.clickInfo.studyHours === 0) {
          // 由于进页面有其他知识学习提交失败，再次点击切换该知识时，进度不为100时再次做提交
          if (this.clickInfo.schedule !== 100) {
            this.postKngSubmit()
          }
        }
      }
    },
    // 暂停操作
    pauseOperation () {
      // 清除计时器操作放在暂停时间前面
      this.clearAllTimers()

      if (this.clickInfo.studyHours === 1) {
        this.tempDelayNum = this.delayNum
      } else if (this.clickInfo.studyHours >= 2) {
        this.tempTimersNum = this.timersNum
      }
    },
    // 处理防作弊
    handlerConf (res) {
      let { enabled, maxMin, tips } = res
      if (enabled) {
        this.studyTimers = setInterval(() => {
          window.clearInterval(this.studyTimers)
          if (!this.isPause) {
            if (this.$refs.video) {
              this.$refs.video.pause()
            }
            if (this.$refs.audio) {
              this.$refs.audio.pause()
            }
          }
          this.pauseOperation() // 暂停的操作
          this.Dialog.confirm({
            title: '提示',
            message: tips,
            confirmButtonText: '继续学习',
            closeOnPopstate: true,
            showCancelButton: false
          }).then(() => {
            // 视频播放
            if (this.isPause) {
              if (this.$refs.video) {
                this.$refs.video.play()
              }
              if (this.$refs.audio) {
                this.$refs.audio.play()
              }
            }
            this.playOperation() // 播放的操作
            // 点击继续学习调自己
            this.handlerConf(res)
          }).catch(() => {
            // 取消操作
          })
        }, maxMin * 60 * 1000)
      }
    },
    // 文档换页处理
    onPageChange (page) {
      this.startDoc = page
    },
    clearAllTimers () {
      // 清除2个计时器处理
      this.delayTimer && clearTimeout(this.delayTimer)
      this.delayTimeHandle && clearInterval(this.delayTimeHandle)

      // 大于0学时，小于2学时，清除学习进度
      this.pauseDelayTimer && window.clearTimeout(this.pauseDelayTimer)
      this.pauseDelayTimeHandle && window.clearInterval(this.pauseDelayTimeHandle)

      this.timers && clearInterval(this.timers)
      this.timersHandle && clearInterval(this.timersHandle)

      // 大于2学时，先清除之前学习的进度，重新计算当前进度
      this.pauseTimers && window.clearTimeout(this.pauseTimers)
      this.pauseTimersHandle && window.clearInterval(this.pauseTimersHandle)

      setTimeout(() => {
        if (this.clickInfo.kngType === 2 || this.clickInfo.kngType === 3) {
          if (this.$refs.numDown) {
            this.$refs.numDown.clearTimer()
          }
        } else if (this.clickInfo.kngType === 1) {
          if (this.$refs.docNumDown) {
            this.$refs.docNumDown.clearTimer()
          }
        } else if (this.clickInfo.kngType === 5 || this.clickInfo.kngType === 6) {
          if (this.$refs.courseIframePlay) {
            this.$refs.courseIframePlay.clearCourseNumDown()
          }
        }
      }, 0)
    },
    // 进行每个知识的断点续播的存储
    storeKngTime () {
      if (this.clickInfo.kngType === 1 || this.clickInfo.kngType === 2 || this.clickInfo.kngType === 3) {
        let playTimeArr = []
        let playObj = {}
        playObj.kngId = this.clickInfo.kngId
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
    clearData () {
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

      this.clearAllTimers()

      this.timers = null
      this.studyTimers = null
      this.delayTimer = null
      this.delayTimeHandle = null
      this.timersHandle = null
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

      if (this.isAudit) {
        bodyParams.preview = 1
      }
      api.postKngDetail(bodyParams).then(res => {
        // 判断是否开启多知识学习
        if (!this.isAudit && this.moreEnabled) {
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
    clickKngDetail (chapterIndex, kngItem, kngIndex) {
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
      this.clearData()
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
    }
  },
  watch: {
    getHour (v) {
      if (v && !this.isAudit) {
        this.handerStudyHour(this.clickInfo.studyHours)
        this.handleTip()
        // 视频、音频的倒计时的处理
        if (this.clickInfo.kngType === 2 || this.clickInfo.kngType === 3) {
          setTimeout(() => {
            if (this.$refs.numDown) {
              this.$refs.numDown.handleClick()
            }
          }, 0)
        }

        // 防作弊
        this.handlerConf(this.kngConf)
      }
    }
  },
  beforeDestroy () {
    this.clearAllTimers()

    this.studyTimers && window.clearInterval(this.studyTimers)

    this.storeCourse()
    // 存储当前正在学
    storeKngStudying(this.clickInfo.kngId)
    // 进行每个知识的断点续播的存储，从审核知识过来也要进行断点续播
    this.storeKngTime()
  }
}
</script>
