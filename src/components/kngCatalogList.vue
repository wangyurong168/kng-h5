<template>
  <div id="cataloglist">
    <ul class='search-menu-s clearfix' :style="totalSty" style="margin-top: 1.2rem;">
      <li :style="{'width' : width + 'px'}" style="position: relative; width: 33.333%;" v-for='(item, parentIndex) in items' class='pull-left' :key="parentIndex">
        <ul>
          <li @click='selectAll(parentIndex)'><span class="knglist-catalog-text pl10 pr5">全部</span></li>
          <li v-for='(d, index) in item' :class='{true:"active color-primary-6"}[selectedArr[parentIndex] == index]' @click='select(parentIndex, index)' :key="index">
            <span class="line-2 d-in-block knglist-catalog-text pl10 pr5" v-text='d.catalogname'></span>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
<script type='text/ecmascript-6'>
export default {
  props: ['catalogs', 'path', 'goCatalogIndex', 'index'],
  data () {
    return {
      selectedArr: this.path || []
    }
  },
  computed: {
    width () {
      return $(window).width() / 3
    },
    items: {
      get () {
        return this.catalogs
      },
      set () {}
    },
    totalSty () {
      // 点击的显示目录的动画
      let length = this.catalogs ? this.catalogs.length : 0
      $(this.$el).animate({ 'scrollLeft': length * this.width }, 500)
      return {
        position: 'relative',
        width: this.width * length + 'px'
      }
    }
  },
  methods: {
    /**
     * 选择目录
     * 创建人: 张朋
     * @param  {int} parent 目录层级 e.g: 0 第一层 1 第二层 ...
     * @param  {int} index  当前目录列表中的位置 e.g: 1 当前层第二个目录
     * selectArr 数组存放层级目录
     * selectArr = [2, 2, 3]
     * 表示: 一级目录选中是当前目录列表中的索引为2的目录, 二级目录选中是当前目录列表中的索引为2的目录, 三级目录选中是当前目录列表中的索引为3的目录
     */
    select (parent, index) {
      let flag = (this.selectedArr[parent] !== index) // 是否点击同一个目录
      this.selectedArr = this.selectedArr.slice(0, parent + 1) // 保留点击所在目录层级及父级们目录
      this.selectedArr[parent] = index // 更新点击的目录

      this.items = this.items.slice(0, parent + 2) // 保留原来的父目录和子目录
      if (flag) {
        this.$emit('releaseCatalogs', parent) // vue不推荐在子组件中直接修改父组件对象 所以使用事件
        // this.items = this.items.slice(0, parent + 1) // 去除原来的子目录 准备添加进新的子目录
        window.setTimeout(() => {
          this.$emit('select', { id: this.items[parent][index].id, name: this.items[parent][index].catalogname, path: this.selectedArr, orderIndex: this.items[parent][index].orderType })
        })
      }
      // this.$sendBehaviorLog('knowledge_multiMenu_select', this)
    },
    selectAll (parent) {
      /**
       * 点击目录顶部全部
       * 说明
       * selectArr = [2]
       * 当点击第二层级上全部时候,要把第一层第三个目录的name和id传给selectAll事件对应的函数
       */
      this.$emit('releaseCatalogs', parent)
      this.selectedArr = this.selectedArr.slice(0, parent) // 获取点击层级的上层所有目录索引
      parent = parent - 1 > 0 ? parent - 1 : 0 // 对第一层级特殊处理
      var index = this.selectedArr[parent] > -1 ? this.selectedArr[parent] : -1
      var id = index > -1 ? this.items[parent][index].id : ''
      var name = index > -1 ? this.items[parent][index].catalogname : '全部'
      var orderType = index > -1 ? this.items[parent][index].orderType : 0
      window.setTimeout(() => {
        this.$emit('selectAll', { id: id, name: name, path: this.selectedArr, orderIndex: orderType })
      })
      // this.$sendBehaviorLog('knowledge_multiMenu_selectAll', this)
    }
  },
  watch: {
    'goCatalogIndex' (newVal) {
      this.selectedArr.push(newVal)
    },
    'index' (val) {
      // 点击目录，自动滚动
      if (val === 1) {
        // 选中四级以后目录，再次点击，需要展示1,2,3级，而不是2,3,4
        $(this.$el).animate({ 'scrollLeft': 0 }, 300)
        $('li.pull-left:first ul li.active')[0] && $('li.pull-left:first').scrollTop($('li.pull-left:first ul li.active')[0].offsetTop - 100)
      }
    }
  },
  destroyed () {
    this.$off()
  }
}
</script>
