<template>
<div class="ripgui">
  <h1>RipGUI</h1>

  <div class="inputs">
    <input v-model="query" v-stream:keyup="query$" v:keyup="console.log" placeholder="needle" />
    <input v-model="path" v-stream:keyup="path$" v-bind:placeholder="cwd" />
    <input v-model="options" v-stream:keyup="options$" placeholder="ripgrep options" />
  </div>

  <p v-if="loading">Loading...</p>
  <div v-else-if="queryPresent">
    <pre class="error"><code>{{ stderr }}</code></pre>
    <div v-for="(result, index) in results" v-bind:key="index">
      <pre><code>{{ result }}</code></pre>
    </div>
  </div>
  <div v-else>
    <p>Type a query to grep for.</p>
    <p>Press Escape to escape regex characters.</p>
  </div>
</div>
</template>

<script>
import { basename } from 'path'
import { Observable } from 'rxjs/Observable'
import { isEqual, escapeRegExp } from 'lodash'

import rg from '@/interfaces/rg'

export default {
  name: 'Search',
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
        console.log(results)
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
        .debounceTime(300);
      return updates
    }
  }
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

.ripgui {
  font-family: "Helvetica Neue", Helvetica, sans-serif;
  margin-left: 20px;
  margin-right: 20px;
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