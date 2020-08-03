import api from '@/service/knowledge.service'

// 水印
export const watermarkConfigMixin = {
  data () {
    return {
      // 水印配置
      option: {}
    }
  },
  mounted () {
    this.getWatermarkConfig()
  },
  methods: {
    async getWatermarkConfig () {
      const res = await api.getWatermarkConfig()
      if (res.enabled) {
        this.option.enabled = 1
        res.type === 1 ? this.option.type = 1 : this.option.type = 0
        const resObj = {
          text: res.watermarkContent,
          color: res.otherColor,
          opacity: res.otherAlpha,
          fontSize: res.otherFontSize
        }
        this.option = Object.assign(this.option, resObj)
      } else {
        this.option.enabled = 0
      }
    }
  }
}
