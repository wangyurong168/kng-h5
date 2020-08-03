<template>
  <div class="yui-whole-page" v-if="listloading">
    <yxt-tabs v-model="activeName" @click="handleClick" sticky>
      <yxt-tab title="待审核" name="first">
        <audit-list :list="auditLists"
                    :finished="finished"
                    ref="listRef"
                    @load="onLoad"
        />
      </yxt-tab>
      <yxt-tab title="审核历史" name="second">
        <audit-list :list="auditHistoryList"
                    type="history"
                    :finished="finished1"
                    ref="listRef1"
                    @load="onLoad1"
        />
      </yxt-tab>
    </yxt-tabs>
  </div>
  <div class="yui-screen-page" v-else>
    <yxt-loading text-size="16px">加载中...</yxt-loading>
  </div>
</template>

<script>
import auditList from './components/list'
import api from '@/service/knowledge.service.js'
import { recentDay, formatRangeDate } from '@/core/formateDate'

export default {
  components: {
    auditList
  },
  data () {
    return {
      listloading: false,
      loading: false, // 加载
      finished: false,
      loading1: false, // 加载
      finished1: false,
      perPage: 10, // 每页多少条
      current: 1, // 当前页
      total: 0, // 总条数
      totalPage: 0,
      perPage1: 10, // 每页多少条
      current1: 1, // 当前页
      total1: 0, // 总条数
      totalPage1: 0,
      activeName: 'first',
      auditLists: [], // 待审核列表
      auditHistoryList: [], // 审核历史列表
      range: '1', // 默认要我审核的范围
      type: null,
      name: '',
      status: null, // 审核结果默认值null-全部 1审核通过 2撤回重传
      kngId: '', // 知识id
      id: '',
      enableCommon: false, // 是否设置为常用理由 true 是 false 否
      auditDate: [] // 日期
    }
  },
  mounted () {
    document.addEventListener('visibilitychange', this.getAppClose)
    const ls = window.localStorage.getItem('activeName')
    this.activeName = ls || 'first'
    this.auditDateRange()
    this.getTabHandler()
  },
  methods: {
    // 判断是否是app 审核页面返回
    getAppClose () {
      if (window.isApp) {
        if (document.visibilityState !== 'hidden') {
          location.reload()
        }
      }
    },
    onLoad () {
      setTimeout(async () => {
        this.current += 1
        await this._getAuditList()
        // 加载状态结束
        this.$refs.listRef.loading = false
        // 数据全部加载完成
        if (this.current >= this.totalPage) {
          this.finished = true
        }
      }, 0)
    },
    onLoad1 () {
      setTimeout(async () => {
        this.current1 += 1
        await this._getAuditHistory()
        // 加载状态结束
        this.$refs.listRef1.loading = false
        // 数据全部加载完成
        if (this.current1 >= this.totalPage1) {
          this.finished1 = true
        }
      }, 0)
    },
    // 待审核列表
    getAuditList () {
      this.listloading = false
      this.finished = false
      this.auditLists = []
      this.current = 1

      this._getAuditList()
    },
    // 获取待审核列表
    async _getAuditList () {
      let bodyParams = {
        type: this.type,
        name: this.name,
        range: this.range
      }
      let linkParams = {
        limit: this.perPage,
        offset: (this.current - 1) * this.perPage
      }
      await api.postAuditList(bodyParams, linkParams).then(res => {
        this.auditLists = this.auditLists.concat(res.datas)
        this.total = res.paging.count
        this.totalPage = res.paging.pages // 获得当前最大页数
        this.listloading = true
      }).catch(() => {
        this.$toast.fail('获取待审核列表出错！')
        this.listloading = true
      })
    },
    // 审核历史
    getAuditHistory () {
      this.listloading = false
      this.finished1 = false
      this.auditHistoryList = []
      this.current1 = 1
      this._getAuditHistory()
    },
    // 获取审核历史列表
    async _getAuditHistory () {
      const [startTime, endTime] = formatRangeDate(this.auditDate)
      let bodyParams = {
        startTime,
        endTime,
        type: this.type,
        name: this.name,
        range: this.range,
        status: this.status
      }
      let linkParams = {
        limit: this.perPage1,
        offset: (this.current1 - 1) * this.perPage1
      }
      await api.postAuditHistory(bodyParams, linkParams).then(res => {
        this.auditHistoryList = this.auditHistoryList.concat(res.datas)
        this.total1 = res.paging.count
        this.totalPage1 = res.paging.pages // 获得当前最大页数
        this.listloading = true
      }).catch(err => {
        if (err === 'apis.audit.knowledge.status.illegal') {
          this.$toast('加载失败')
        }
        this.listloading = true
      })
    },
    // 审核历史 - 审核日期-默认近30天
    auditDateRange () {
      // 开始时间--默认近30天
      let startTime = recentDay()
      // 当前时间
      let endTime = recentDay(0)
      this.auditDate = [startTime, endTime]
    },
    // tab
    handleClick (name) {
      localStorage.setItem('activeName', name)
      this.getTabHandler()
    },
    getTabHandler () {
      const ActiveMapper = {
        first: 'getAuditList',
        second: 'getAuditHistory'
      }
      this[ActiveMapper[this.activeName]]()
    }
  },
  beforeDestroy () {
    document.removeEventListener('visibilitychange', this.getAppClose)
  }
}
</script>
