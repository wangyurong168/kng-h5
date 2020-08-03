import api from '@/service/knowledge.service'

// 水印
export const watermarkConfigMixin = {
  data () {
    return {
      // 水印配置
      option: {},
      // 文档水印配置
      docOption: {}
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
    }
  }
}
