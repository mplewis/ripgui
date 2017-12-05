import process from 'child_process'
import { compact } from 'lodash'

import parseAsync from '@/parsers/rg'

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
  const args = compact([...options, query, path])
  const { stdout, stderr } = await backgroundProcess('rg', args)

  const results = await parseAsync(stdout)
  return { results, stderr }
}
