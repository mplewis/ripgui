<template>
<div class="ripgui">
  <div class="header">

    <div class="inputs">
      <input v-model="query" v-stream:keyup="query$" placeholder="Query" />
      <input v-model="path" v-stream:keyup="path$" placeholder="Target directory" />
      <input v-model="options" v-stream:keyup="options$" placeholder="ripgrep options" />
    </div>
  </div>

  <div class="output">
    <div v-if="!queryPresent">
      <h1>RipGUI</h1>
      <p>Current target directory: {{ targetDirectory }}</p>
      <p>Type a query to grep for. Press Escape to escape regex characters.</p>
    </div>

    <p v-else-if="searching">Searching...</p>

    <div v-else-if="results.length === 0" class="no-results">
      No results found for query:
      <div><pre><code>{{ query }}</code></pre></div>
    </div>

    <div v-else>
      <pre class="error"><code>{{ stderr }}</code></pre>
      <div v-for="(result, index) in results" v-bind:key="index">
        <FileResults v-bind:file="result.file" v-bind:lines="result.lines" />
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { basename, resolve } from 'path'
import { Observable } from 'rxjs/Observable'
import { isEqual, escapeRegExp } from 'lodash'

import rg from '@/interfaces/rg'
import FileResults from './FileResults'

export default {
  name: 'Search',
  components: { FileResults },
  data: () => ({
    targetDirectory: null,
    query: '',
    path: '',
    options: '',
    queryPresent: false,
    searching: false,
    results: [],
    stderr: '',
  }),
  domStreams: ['query$', 'path$', 'options$'],

  mounted() {
    this.eventStream().subscribe(({ query, path, options }) => {
      this.queryPresent = query !== '';
      this.searching = false
      if (!this.queryPresent) return

      this.searching = true
      rg(query, path, options).then(({ results, stderr }) => {
        this.searching = false
        this.results = results
        this.stderr = stderr
      })
    })

    this.eventStream().subscribe(({ path }) => {
      this.targetDirectory = resolve(path)
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
        .debounceTime(250);

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
  padding: 4px 8px;
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
  height: 70px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: white;
}

.output {
  margin-top: 90px;
}

.no-results pre {
  display: inline-block;
  margin-top: 10px;
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.inputs {
  display: flex;
  margin-top: 20px;
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
