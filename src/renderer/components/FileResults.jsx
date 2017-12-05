// @flow
import { spawn } from 'child_process'

import './FileResults.css'

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

export default {
  name: 'FileResults',
  props: {
    file: { type: String, required: true },
    lines: { type: Array, required: true }
  },
  data: () => ({ line: null }),
  mounted () {
    this.line = this.lines.filter(l => l.exact)[0].num
  },
  methods: {
    open () {
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
    },
    renderLines () {
      return this.lines.map(line => (
        <div class={['result', { exact: line.exact }]}>
          <div class="num">{line.num}</div>
          <div class="content">
            <pre>
              <code>{line.content}</code>
            </pre>
          </div>
        </div>
      ))
    }
  },
  render () {
    return (
      <div class="file-result" onClick={this.open}>
        <p class="file-with-line">
          {this.file} @ line {this.line}
        </p>
        <div class="scrollable-lines">{this.renderLines()}</div>
      </div>
    )
  }
}
