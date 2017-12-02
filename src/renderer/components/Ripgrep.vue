<template>
<div class="ripgrep">
  <h1>Hello world!</h1>
  <p>I'm Ripgrep.</p>
  <input v-model="query" v-stream:keyup="{subject: query$, data: query}" placeholder="query" />
  <input v-model="path" v-stream:keyup="{subject: path$, data: path}" placeholder="path" />
  <input v-model="options" v-stream:keyup="{subject: options$, data: options}" placeholder="options" />
  <pre><code>{{ args }}</code></pre>
</div>
</template>

<script>
import { Observable } from 'rxjs/Observable'
import { isEqual } from 'lodash'

export default {
  name: 'Ripgrep',
  data: () => ({ query: '', path: '', options: '', args: null }),
  domStreams: ['query$', 'path$', 'options$'],
  mounted () {
    this.eventStream().subscribe(args => this.args = args)
  },

  methods: {
    eventStream() {
      const empty = Observable.of('')
      const query = Observable.concat(empty, this.query$.map(({ data }) => data))
      const path = Observable.concat(empty, this.path$.map(({ data }) => data))
      const options = Observable.concat(empty, this.options$.map(({ data }) => data))

      const updates = Observable
        .combineLatest([query, path, options])
        .filter(([query,]) => query !== '')
        .distinctUntilChanged(isEqual)
        .debounceTime(300);
      return updates
    }
  }
}
</script>

<style>
.ripgrep {
  font-family: "Helvetica Neue", Helvetica, sans-serif;
  margin-left: 40px;
  margin-right: 40px;
}
</style>
