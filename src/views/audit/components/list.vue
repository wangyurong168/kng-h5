<template>
  <yxt-list v-model="loading" :finished="finished" v-if="list.length > 0"
            finished-text="没有更多了"
            :immediate-check="false"
            @load="$emit('load')"
  >
    <ul class="waitting-audit-list">
      <list-item v-for="(item, index) in list"
                 :type="type"
                 :key="index"
                 :item="item"
      />
    </ul>
  </yxt-list>
  <div v-else>
    <yxt-empty>
      <div class="title">暂无数据</div>
    </yxt-empty>
  </div>
</template>

<script>
import listItem from './item'

export default {
  name: 'list',
  components: {
    listItem
  },
  props: {
    list: {
      type: Array
    },
    finished: {
      type: Boolean
    },
    type: {
      type: String
    }
  },
  data () {
    return {
      loading: false
    }
  }
}
</script>
<style scoped>
  /deep/ .yxt-empty {
    position: fixed !important;
  }
</style>
