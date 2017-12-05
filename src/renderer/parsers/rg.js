// @flow

import { join } from 'path'

export default function parseAsync (stdout: string) {
  const worker = new Worker(join(__dirname, 'rg_worker.js'))
  worker.postMessage(stdout)
  return new Promise(
    resolve => (worker.onmessage = ({ data }) => resolve(data))
  )
}
