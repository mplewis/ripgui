// @flow
import { compact } from 'lodash'
import { backgroundProcess } from './system'
import parseAsync from '../parsers/rg'

const DEFAULT_OPTIONS = '-n -C 3'

export default async function rg (query: string, path: string, options: string) {
  const optionsArr = `${DEFAULT_OPTIONS} ${options}`.split(' ')
  const args = compact([...optionsArr, query, path])
  const { stdout, stderr } = await backgroundProcess('rg', args)
  const results: Object[] = await parseAsync(stdout)
  return { results, stderr }
}
