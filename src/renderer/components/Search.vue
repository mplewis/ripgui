<template>
<div class="ripgui">
  <div class="header">
    <h1>RipGUI</h1>

    <div class="inputs">
      <input v-model="query" v-stream:keyup="query$" placeholder="needle" />
      <input v-model="path" v-stream:keyup="path$" v-bind:placeholder="cwd" />
      <input v-model="options" v-stream:keyup="options$" placeholder="ripgrep options" />
    </div>
  </div>

  <div class="output">
    <p v-if="loading">Loading...</p>
    <div v-else-if="queryPresent">
      <pre class="error"><code>{{ stderr }}</code></pre>
      <div v-for="(result, index) in results" v-bind:key="index">
        <FileResults v-bind:file="result.file" v-bind:lines="result.lines" />
      </div>
    </div>
    <div v-else>
      <p>Type a query to grep for.</p>
      <p>Press Escape to escape regex characters.</p>
    </div>
  </div>
</div>
</template>

<script>
import { basename } from 'path'
import { Observable } from 'rxjs/Observable'
import { isEqual, escapeRegExp } from 'lodash'

import rg from '@/interfaces/rg'
import FileResults from './FileResults'

export default {
  name: 'Search',
  components: { FileResults },
  data: () => ({
    cwd: `haystack (…/${basename(process.cwd())})`,
    query: '',
    path: '',
    options: '',
    loading: false,
    queryPresent: false,
    results: '',
    stderr: '',
  }),
  domStreams: ['query$', 'path$', 'options$'],

  mounted() {
    this.eventStream().subscribe(({ query, path, options }) => {
      this.queryPresent = query !== '';
      this.loading = false
      if (!this.queryPresent) return

      this.loading = true
      rg(query, path, options).then(({ results, stderr }) => {
        this.loading = false
        this.results = results
        this.stderr = stderr
      })
    })
  },

  methods: {
    eventStream() {
      const empty = Observable.of('')

      const queryWithEscaping = this.query$.map(({ event }) => {
        if (event.key === 'Escape') this.query = escapeRegExp(this.query)
        return this.query
      })

      const query = Observable.concat(empty, queryWithEscaping)
      const path = Observable.concat(empty, this.path$.map(() => this.path))
      const options = Observable.concat(empty, this.options$.map(() => this.options))

      const updates = Observable
        .combineLatest([query, path, options])
        .distinctUntilChanged(isEqual)
        .map(([query, path, options]) => ({ query, path, options }))
        .debounceTime(200);
      return updates
    }
  }
}
</script>

<style>
body {
  margin: 0;
}

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

.ripgui {
  font-family: "Helvetica Neue", Helvetica, sans-serif;
  margin-left: 20px;
  margin-right: 20px;
}

.header {
  position: fixed;
  box-sizing: border-box;
  left: 0;
  top: 0;
  width: 100%;
  padding-left: 20px;
  padding-right: 20px;
  height: 120px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: white;
}

.output {
  margin-top: 140px;
}

.inputs {
  display: flex;
}

.inputs * {
  flex: 1;
}

.inputs *:not(:first-child) {
  margin-left: 20px;
}

.error {
  color: red;
  word-wrap: break-word;
}
</style>
