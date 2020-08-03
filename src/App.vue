<template>
  <div id="app">
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>
  </div>
</template>

<script>
export default {
  destroyed () {
    this.$off()
  }
}
</script>

<style>
#app .yxtbiz-doc-viewer__slide img {
  max-height: none;
}
</style>
