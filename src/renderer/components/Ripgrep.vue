<template>
<div class="ripgrep">
  <h1>Hello world!</h1>
  <p>I'm Ripgrep.</p>

  <input v-model="query" v-stream:keyup="{subject: query$, data: query}" placeholder="query" />
  <input v-model="path" v-stream:keyup="{subject: path$, data: path}" placeholder="path" />
  <input v-model="options" v-stream:keyup="{subject: options$, data: options}" placeholder="options" />

  <pre v-if="args && args[0] !== ''"><code>{{ args }}</code></pre>
  <p v-else>Type a query to grep for.</p>

  <pre><code>{{ stdout }}</code></pre>
</div>
</template>

<script>
import process from 'child_process'
import { Observable } from 'rxjs/Observable'
import { isEqual } from 'lodash'

export default {
  name: 'Ripgrep',
  data: () => ({ query: '', path: '', options: '', args: null, stdout: '' }),
  domStreams: ['query$', 'path$', 'options$'],
  subscriptions () {
    return {
      args: this.eventStream()
    }
  },

  mounted() {
    backgroundProcess('ls', '-la').then(({ stdout }) => this.stdout = stdout);
  },

  methods: {
    eventStream() {
      const empty = Observable.of('')
      const query = Observable.concat(empty, this.query$.map(({ data }) => data))
      const path = Observable.concat(empty, this.path$.map(({ data }) => data))
      const options = Observable.concat(empty, this.options$.map(({ data }) => data))

      const updates = Observable
        .combineLatest([query, path, options])
        .distinctUntilChanged(isEqual)
        .debounceTime(300);
      return updates
    }
  }
}

function backgroundProcess(cmd, ...args) {
  return new Promise((resolve, reject) => {
    const proc = process.spawn(cmd, args);
    let stdout = ''
    let stderr = ''
    proc.stdout.on('data', data => stdout += data)
    proc.stderr.on('data', data => stderr += data)
    proc.on('close', code => {
      console.warn('Exited with return code', code)
      console.warn(stderr)
      resolve({ code, stdout, stderr })
    })
  })
}
</script>

<style>
.ripgrep {
  font-family: "Helvetica Neue", Helvetica, sans-serif;
  margin-left: 40px;
  margin-right: 40px;
}

code {
  font-family: "Fira Code", monospace;
}
</style>
