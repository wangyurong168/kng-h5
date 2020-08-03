<template>
  <div>
    <div class="detailAudit__btns" v-if="status === auditStatusEnum.WAIT">
      <yxt-button round type="primary" size="larger" class="detailAudit__btns--left" @click="showDialog(auditStatusEnum.REJECT)">退回重传</yxt-button>
      <yxt-button round size="medium" class="detailAudit__btns--right" @click="showDialog(auditStatusEnum.AGREE)">审核通过</yxt-button>
    </div>
    <div class="detailAudit__btns" v-else>
      <yxt-button round size="medium" class="detailAudit__btns--right" @click="seeAuditInfo">查看审核意见</yxt-button>
    </div>
    <!-- 弹框 -->
    <yxt-dialog v-model="isShowDialog" show-cancel-button
                :title="btnHandlerMapper[dialogStatus].title"
                :before-close="beforeConfirm"
                @confirm="confirmHandler">
      <div class="detailAudit__text">
        <yxt-field type="textarea" v-model="inputReason"
                   maxlength="100" limit-display  :autosize="{ minRows: 2, maxRows: 6}"
                   :placeholder="btnHandlerMapper[dialogStatus].placeholder"
        />
      </div>
    </yxt-dialog>
  </div>
</template>

<script>
import api from '@/service/knowledge.service'
import { auditStatusEnum, btnHandlerMapper } from '@/views/kngDetailAudit/config'
import { isEmpty } from '@/core/utils'

export default {
  name: 'btnGroup',
  props: {
    id: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      auditStatusEnum,
      btnHandlerMapper,
      remark: '',
      isShowDialog: false,
      dialogStatus: auditStatusEnum.AGREE,
      inputReason: '',
      status: auditStatusEnum.WAIT
    }
  },
  mounted () {
    this.getStatus()
  },
  methods: {
    confirmHandler () {
      this[btnHandlerMapper[this.dialogStatus].confirmHandler]()
    },
    async getStatus () {
      const { remark, status } = await api.getAuditRemark(this.id)
      this.status = status
      this.remark = remark
      this.$emit('getStatus', status)
      // this.$router.go(-1)
    },
    // 查看审核意见
    seeAuditInfo () {
      this.Dialog.confirm({
        title: '审核意见',
        message: this.remark,
        closeOnPopstate: true,
        showCancelButton: false,
        confirmButtonText: '关闭'
      })
    },
    // 点击-出现弹框
    showDialog (type) {
      this.dialogStatus = type
      this.isShowDialog = true
      this.inputReason = this.btnHandlerMapper[this.dialogStatus].defaultInput // 清除选择记录
    },
    beforeConfirm (action, done) {
      if (action === 'confirm' && isEmpty(this.inputReason)) {
        this.$toast.fail(btnHandlerMapper[this.dialogStatus].placeholder)
        done(false)
      } else {
        done()
      }
    },
    // 接口 - 确认
    clickConfirm () {
      if (!isEmpty(this.inputReason)) {
        let bodyParams = {
          enableCommon: this.enableCommon,
          kngId: this.id,
          remark: this.inputReason
        }
        api[btnHandlerMapper[this.dialogStatus].api](bodyParams).then(res => {
          this.getStatus()
          this.$toast.success('操作成功!')
          this.$router.go(-1)
        }).catch(err => {
          if (err.error.key === 'apis.kng.audit.knowledge.status.illegal') {
            this.$toast.fail('该知识已审核完毕，无需重复审核！')
          }
        })
      }
    },
    // 点击审核通过
    async clickAuditPass () {
      if (!isEmpty(this.inputReason)) {
        await api.getMyEnabledEdit(this.id).then(() => {
          this.clickConfirm()
        }).catch(err => {
          if (err.error.key === 'apis.kng.audit.knowledge.status.illegal') {
            this.$toast.fail('该知识已审核完毕，无需重复审核！')
          }
        })
      }
    }
  }
}
</script>
