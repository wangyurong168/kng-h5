<template>
  <div class="p15 self-study">
    <yxt-list v-model="loading" :finished="finished" finished-text="没有更多了" :immediate-check="false" @load="onLoad">
      <div class="self-study-list" v-if="isShowNo">
        <yxt-swipe-cell :on-close="onClose" v-for="(item, index) in selfKngList" :key="index" :name="item.id">
          <div class="mb25 list-reset" @click="kngDetail(item)">
            <div class="self-list-cover-img">
              <img :src="item.coverUrl" class="border-r-4">
            </div>
            <div class="ml10 self-list-info">
              <div class="self-list-title text-26 font-size-16">{{item.title}}</div>
              <div class="mt10 demo-progress lh-17">
                <div class="box">
                  <yxt-progress :percentage="item.schedule" :show-mask="true" :show-pivot="showText" />
                </div>
                <span class="ml4 text-8c font-size-12">{{item.schedule}}%</span>
              </div>
            </div>
          </div>
          <template slot="right">
            <yxt-button class="self-study-delete" text="删除" />
          </template>
        </yxt-swipe-cell>
      </div>
      <div class="min-h-280" v-else>
        <yxt-empty>
          <div class="title">暂无数据</div>
        </yxt-empty>
      </div>
    </yxt-list>
  </div>
</template>

<script>
import api from '@/service/knowledge.service.js'
export default {
  props: {
    name: {
      type: String
    }
  },
  data () {
    return {
      loading: false, // 加载
      finished: false,
      orderType: 'desc', // 排序方式 - 默认倒序
      currentPage: 1,
      perPage: 10, // 每页多少条
      limit: 10,
      total: 0,
      current: 1, // 当前页
      totalPage: 0,
      showText: false,
      selfKngList: [] // 自学知识列表
    }
  },
  computed: {
    isShowNo () {
      return this.selfKngList.length > 0
    }
  },
  created () {
    this.selfStudyList(this.name) // 自主学习列表
  },
  methods: {
    onLoad () {
      this.loadMoreSelfStudyList()
    },
    // 加载更多
    loadMoreSelfStudyList () {
      this.current += 1
      let bodyParams = {
        isStudying: '0'
      }
      let linkParams = {
        limit: this.perPage,
        offset: (this.current - 1) * this.perPage,
        orderBy: name,
        orderType: this.orderType
      }
      api.postKngSelfStudy(bodyParams, linkParams).then(res => {
        this.selfKngList = this.selfKngList.concat(res.datas)
        this.selfKngList.map(item => {
          if (item.schedule >= 100) {
            item.schedule = 100
          }
        })
        // 加载状态结束
        this.loading = false
        // 数据全部加载完成
        if (this.current >= this.totalPage) {
          this.finished = true
        }
      }).catch(() => {
        this.$toast.fail('加载失败！')
      })
    },
    // 自学知识列表
    selfStudyList (name) {
      this.current = 1
      let bodyParams = {
        isStudying: '0'
      }
      let linkParams = {
        limit: this.perPage,
        offset: (this.current - 1) * this.perPage,
        orderBy: name,
        orderType: this.orderType
      }
      api.postKngSelfStudy(bodyParams, linkParams).then(res => {
        this.selfKngList = res.datas
        this.total = res.paging.count
        this.totalPage = res.paging.pages // 获得当前最大页数
        this.selfKngList.map(item => {
          if (item.schedule >= 100) {
            item.schedule = 100
          }
        })
      }).catch(() => {
        this.$toast.fail('加载失败！')
      })
    },
    // clickPosition 表示关闭时点击的位置
    onClose (clickPosition, instance, detail) {
      switch (clickPosition) {
        case 'outside':
          instance.close()
          break
        case 'right':
          this.Dialog.confirm({
            message: '确定删除吗？',
            closeOnPopstate: true
          }).then(() => {
            // 删除接口
            let id = detail.name
            api.deleteKngSelfStudy(id).then(res => {
              instance.close()
              this.$toast('删除成功')
              this.selfStudyList()
            })
          })
          break
      }
    },
    // 开始学习- 进入知识播放页
    kngDetail (item) {
      if (item.type === 0) {
        this.$router.skipKngDetail(0, item.fileType, item.kngId, '', '', 'kng', 0)
      } else {
        this.$router.skipKngDetail(0, item.fileType, '', item.kngId, '', 'kng', 0)
      }
    }
  }
}
</script>

<style lang="scss">
.self-study {
  .yxt-progress {
    height: 5px !important;
    position: relative;
    top: 2px;
  }

  .yxt-swipe-cell__right {
    right: -1px;
  }
}
</style>
