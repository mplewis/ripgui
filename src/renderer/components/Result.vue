<template>
<div class="result" v-bind:class="['result', { exact }]">
  <div class="num">{{ num }}</div>
  <div class="content"><pre><code>{{ content }}</code></pre></div>
</div>
</template>

<script>
export default {
  props: {
    num: { type: Number, required: true },
    exact: { type: Boolean, required: true },
    content: { type: String, required: true }
  }
}
</script>

<style>
pre {
  margin: 0;
}

.result {
  display: flex;
  font-family: "Fira Code";
  font-size: 14px;
  color: rgba(0, 0, 0, 0.3);
}

.result.exact {
  color: rgba(0, 0, 0, 0.8);
}

.result .num {
  width: 40px;
  text-align: right;
  margin-right: 10px;
  flex: 0 0 auto;
}
</style>
