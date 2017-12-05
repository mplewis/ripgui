<template>
<div class="file-result" v-on:click="open">
  <p class="file-with-line">{{ file }} @ line {{ line }}</p>
  <div class="scrollable-lines">
    <div
      class="result"
      v-for="(line, index) in lines"
      v-bind:class="['result', { exact: line.exact }]"
      v-bind:key="index"
    >
      <div class="num">{{ line.num }}</div>
      <div class="content"><pre><code>{{ line.content }}</code></pre></div>
    </div>
  </div>
</div>
</template>

<script>
import { spawn } from 'child_process'

export default {
  name: 'FileResults',
  props: {
    file: { type: String, required: true },
    lines: { type: Array, required: true }
  },
  data: () => ({ line: null }),
  mounted() {
    this.line = this.lines.filter(l => l.exact)[0].num
  },
  methods: {
    open() {
      backgroundProcess('open', [this.file]).then(({ code, stderr }) => {
        if (code === 0) return
        this.$toasted.show(stderr, {
          className: 'toast',
          position: 'bottom-center',
          fullWidth: true,
          duration: 0,
          action: { text: '✖', onClick: (e, toast) => toast.goAway(0) }
        })
      })
    }
  }
}

function backgroundProcess (cmd, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args)
    let stdout = ''
    let stderr = ''
    proc.stdout.on('data', data => (stdout += data))
    proc.stderr.on('data', data => (stderr += data))
    proc.on('close', code => resolve({ code, stdout, stderr }))
  })
}
</script>

<style>
.file-result {
  background-color: rgba(52, 152, 219, 0.1);
  border-radius: 4px;
  margin-bottom: 20px;
  padding: 8px 12px;
}

.file-result:hover {
  background-color: rgba(52, 152, 219, 0.3);
  cursor: pointer;
}

.scrollable-lines {
  overflow-x: scroll;
  padding-left: 12px;
  margin-left: -12px;
  padding-right: 12px;
  margin-right: -12px;
}

.file-with-line {
  margin-top: 0;
  margin-bottom: 8px;
  font-weight: bold;
}

/* results */

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

/* toast errors */

.toasted-container.full-width {
  right: 2%;
  max-width: 96%;
  margin-bottom: -20px;
}

.toasted.primary {
  padding-top: 8px;
  padding-bottom: 8px;
  border-radius: 4px;
  font-family: "Helvetica Neue", Helvetica, sans-serif;
  font-weight: normal;
  color: white;
  background-color: rgba(231, 76, 60, 1);
}

.toasted-container .toasted .action {
  color: white;
}
</style>
