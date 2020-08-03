<template>
    <div>
      <!--讲义图标-->
      <div v-if="isHandouts" class="teach_icon" @click="showHandouts">
        <!--<yxt-svg-icon :baseurl='kngUrl' width="18px" height="20px" icon-name="doc" />-->
        讲义
      </div>
      <!-- 讲义播放器 -->
      <yxt-popup class="closeBtn jangyi"
                 v-model="isHandoutsShow"
                 :lock-scroll="false"
                 position="bottom"
                 :round="false"
                 :overlay="false"
                 title="讲义"
                 :style="{ height: 'calc(100% - 210px)' }"
                 closeable="inner"
      >
        <yxtbiz-doc-viewer v-if="isHandoutsShow"
                           height="210px"
                           :start="startDoc"
                           :file-list="docLists"
                           :watermark-config="docOption"
                           @click="$emit('click')"
                           @page-change="$emit('page-change')">
        </yxtbiz-doc-viewer>
      </yxt-popup>
    </div>
</template>

<script>
export default {
  name: 'jiangyi.vue',
  props: {
    // 是否带讲义
    isHandouts: {
      type: Boolean
    },
    docOption: {
      type: Object
    },
    docLists: {
      type: Array,
      default () {
        return []
      }
    },
    startDoc: {
      type: Number
    }
  },
  data () {
    return {
      isHandoutsShow: false // 讲义弹窗显示隐藏
    }
  },
  methods: {
    // 显示讲义弹窗
    showHandouts () {
      this.isHandoutsShow = !this.isHandoutsShow
    }
  }
}
</script>
