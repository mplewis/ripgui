<template>
<div class="ripgrep">
  <h1>RipGUI</h1>

  <div class="inputs">
    <input v-model="query" v-stream:keyup="{subject: query$, data: query}" placeholder="needle" />
    <input v-model="path" v-stream:keyup="{subject: path$, data: path}" placeholder="/home/haystack" />
    <input v-model="options" v-stream:keyup="{subject: options$, data: options}" placeholder="ripgrep options" />
  </div>

  <p v-if="loading">Loading...</p>
  <pre v-else-if="queryPresent"><code>{{ stdout }}</code></pre>
  <p v-else>Type a query to grep for.</p>

  <pre class="error"><code>{{ stderr }}</code></pre>
</div>
</template>

<script>
import process from 'child_process'
import { Observable } from 'rxjs/Observable'
import { isEqual } from 'lodash'

const DEFAULT_OPTIONS = '-C 3'

export default {
  name: 'Ripgrep',
  data: () => ({
    query: '',
    path: '',
    options: '',
    loading: false,
    queryPresent: false,
    stdout: '',
    stderr: '',
  }),
  domStreams: ['query$', 'path$', 'options$'],
  subscriptions () {
    return {
      args: this.eventStream()
    }
  },

  mounted() {
    this.eventStream().subscribe(({ query, path, options }) => {
      console.log(query, path, options)
      this.queryPresent = query !== '';
      this.loading = false
      if (!this.queryPresent) return

      options = [DEFAULT_OPTIONS, options].join(' ')
      const cmd = ['rg', ...options.split(' '), query, path].filter(chunk => chunk !== '')
      console.log(cmd.join(' '))

      this.loading = true
      backgroundProcess(...cmd).then(({ stdout, stderr }) => {
        this.loading = false
        this.stdout = stdout
        this.stderr = stderr
      })
    })
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
        .map(([query, path, options]) => ({ query, path, options }))
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
      if (stderr !== '') console.warn(stderr)
      resolve({ code, stdout, stderr })
    })
  })
}
</script>

<style>
h1 {
  margin-bottom: 10px;
}

code {
  font-family: "Fira Code", monospace;
}

input {
  font-size: 18px;
  font-family: "Fira Code", monospace;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.ripgrep {
  font-family: "Helvetica Neue", Helvetica, sans-serif;
  margin-left: 40px;
  margin-right: 40px;
}

.inputs {
  display: flex;
}

.inputs input {
  flex: 1;
}

.inputs input:not(:first-child) {
  margin-left: 20px;
}

.error {
  color: red;
  word-wrap: break-word;
}
</style>
