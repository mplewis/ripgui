import process from 'child_process'
import { compact } from 'lodash'

function backgroundProcess (cmd, args) {
  return new Promise((resolve, reject) => {
    const proc = process.spawn(cmd, args)
    let stdout = ''
    let stderr = ''
    proc.stdout.on('data', data => (stdout += data))
    proc.stderr.on('data', data => (stderr += data))
    proc.on('close', code => resolve({ code, stdout, stderr }))
  })
}

const DEFAULT_OPTIONS = '-n -C 3'

export default async function rg (query, path, options) {
  options = `${DEFAULT_OPTIONS} ${options}`.split(' ')
  return backgroundProcess('rg', compact([...options, query, path]))
}
