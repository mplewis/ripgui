<template>
<div>
  <div class="title">Information</div>
  <div class="item" v-for="(item, index) in info" v-bind:key="index">
    <div class="name">{{ item.name }}</div>
    <div class="value">{{ item.value }}</div>
  </div>
</div>
</template>

<script>
import { version as vue } from 'vue/package.json'
import { platform } from 'os'

const { node } = process.versions
const electron = process.versions['atom-shell']

export default {
  data () {
    return {
      info: [
        { name: 'Path', value: this.$route.path },
        { name: 'Route Name', value: this.$route.name },
        { name: 'Vue', value: vue },
        { name: 'Electron', value: electron },
        { name: 'Node', value: node },
        { name: 'Platform', value: platform() }
      ]
    }
  }
}
</script>

<style scoped>
.title {
  color: #888;
  font-size: 18px;
  font-weight: initial;
  letter-spacing: 0.25px;
  margin-top: 10px;
}

.items {
  margin-top: 8px;
}

.item {
  display: flex;
  margin-bottom: 6px;
}

.item .name {
  color: #6a6a6a;
  margin-right: 6px;
}

.item .value {
  color: #35495e;
  font-weight: bold;
}
</style>
