<template>
<div class="file-result" v-on:click="open">
  <p class="file-with-line">{{ file }} @ line {{ line }}</p>
  <Result
    v-for="(line, index) in lines"
    v-bind:key="index"
    v-bind:num="line.num"
    v-bind:exact="line.exact"
    v-bind:content="line.content"
  />
</div>
</template>

<script>
import { spawn } from 'child_process'

import Result from './Result'

export default {
  name: 'FileResults',
  components: { Result },
  props: {
    file: { type: String, required: true },
    lines: { type: Array, required: true }
  },
  data: () => ({
    line: '',
  }),
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
          action: {
            text: '✖',
            onClick: (e, toast) => toast.goAway(0)
          }
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

.file-with-line {
  margin-top: 0;
  margin-bottom: 8px;
  font-weight: bold;
}

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
