<template>
  <li>
    <!-- 分享者、时间 -->
    <div class="waitting-audit-author-img clearfix pr ph15 pt15">
      <img :src="item.createUserPhotoUrl" class="border-r-wp50 v-mid" v-pic-error>
      <span class="mh10 font-size-14 v-mid">{{item.createUserName}}</span>
      <span class="text-8c font-size-12 v-mid">分享于{{formatDate(item.createTime)}}</span>
      <template v-if="type === 'history'">
        <template v-if='getAuditRecordKey(item.auditRecord, "status") === 1'>
                    <yxt-svg-icon class='audit-svg-icon' :baseurl='kngUrl' width="50px" height="46px" icon-name="tag-pass" />
                  </template>
        <template v-else>
                    <yxt-svg-icon class='audit-svg-icon' :baseurl='kngUrl' width="50px" height="46px" icon-name="tag-reUpload" />
                  </template>
      </template>
    </div>
    <!-- 图片、标题、目录 -->
    <div class="p15 waitting-audit-content" @click="kngDetails(item)">
      <div class="mr10 waitting-audit-cover-img">
        <img class="border-r-4" :src="item.coverUrl">
      </div>
      <div class="waitting-audit-desc">
        <!-- 标题 -->
        <div class="hand waitting-audit-title font-size-16 font-w-600 ellipsis" :title="item.title">{{item.title}}</div>
        <!-- 目录 -->
        <div class="mt8 font-size-12 text-8c ellipsis" :title="item.catalogName">知识目录：{{item.catalogName}}</div>
        <!-- 审核时间 -->
        <template v-if="type === 'history'">
          <div class="text-8c mt8">审核时间：{{formatDate(getAuditRecordKey(item.auditRecord, 'inspectTime'))}}</div>
        </template>
      </div>
    </div>
    <!-- 灰色区域 -->
    <div class="grey-area"></div>
  </li>
</template>

<script>
import { formatDate } from '@/core/formateDate'
import api from '@/service/knowledge.service'

export default {
  name: 'item',
  props: {
    item: {
      type: Object
    },
    type: {
      type: String
    }
  },
  data () {
    return {
      formatDate
    }
  },
  methods: {
    /**
     * 获取auditRecord下的字段
     * @param records
     * @returns {*}
     */
    getAuditRecordKey (records, key) {
      const r = this.getAuditWheel(records)
      return r && r[key]
    },
    /**
     * 获取auditRecord下的对象
     * @param records
     * @returns {*}
     */
    getAuditWheel (records) {
      const record = records.find(({ wheelNumber }) => wheelNumber === records.length)
      return record
    },
    /**
     * 点击标题跳转到知识详情页
     * @param item
     */
    kngDetails (item) {
      if (item.appEnabled === 0) {
        this.$toast.fail('不支持手机端观看，请移步至pc端')
      } else {
        this.getKngType(item)
      }
    },
    async getKngType (item) {
      try {
        const { fileType } = await api.getKnowledgeType(item.id)
        if (fileType === 'zip') {
          this.$toast.fail('zip知识只可以在PC端观看')
        } else {
          this.skipKngDetailAudit(fileType, item)
        }
      } catch (_) {
        this.$toast.fail('知识不存在')
      }
    },
    skipKngDetailAudit (type, item) {
      const query = this.getKngDetailParams(type, item)
      const name = this.getKngDetailName(type)
      if (window.isApp) {
        window.yxt.custom({
          name: 'action.kng.detail', // 自定义协议名
          param: {
            preview: 1,
            ...query
          }, // 传参
          onSuccess: () => {
          }, // 成功回调
          onFail: () => {
          } // 失败回调
        })
      } else {
        this.$router.push({
          name,
          query: { ...query }
        })
      }
    },
    /**
     * 跳转详情参数
     * @param type
     * @param item
     * @returns {{targetId: string, targetCode: string, type: number, isSupportApp: *, status: number}}
     */
    getKngDetailParams (type, item) {
      let query = {
        targetId: '',
        targetCode: 'kng',
        isSupportApp: item.appEnabled,
        type: 0,
        status: 2
      }

      if (type === 'course') {
        query.courseId = item.id
      } else {
        query.id = item.id
      }

      return query
    },
    /**
     * 跳转详情名称
     * @param type
     * @returns {string}
     */
    getKngDetailName (type) {
      const kngDetailMaper = {
        'course': 'coursedetail',
        'scorm': 'scormdetail',
        'html': 'ebookdetail',
        'video': 'videodetail',
        'audio': 'audiodetail',
        'img': 'documentdetail',
        'excel': 'documentdetail',
        'pdf': 'documentdetail',
        'ppt': 'documentdetail',
        'word': 'documentdetail',
        'xuanyes': 'xuanyesdetail'
      }

      return `${kngDetailMaper[type]}audit`
    }
  }
}
</script>
