// filename, line number, line content
const EXACT = /(.+):(\d+):(.*)/
const CONTEXT = /(.+)-(\d+)-(.*)/

function parseLine (line) {
  let match = line.match(CONTEXT)
  if (match) return [false].concat(match.slice(1, 4))
  match = line.match(EXACT)
  if (match) return [true].concat(match.slice(1, 4))
  return null
}

function matchToObject ([exact, file, num, content]) {
  num = parseInt(num)
  return { exact, file, num, content }
}

function parseBundle (raw) {
  return raw
    .split('\n')
    .map(parseLine)
    .filter(Boolean)
    .map(matchToObject)
}

function groupByFile (lines) {
  if (!lines || lines.length === 0) return
  const file = lines[0].file
  lines.forEach(line => delete line.file)
  return { file, lines }
}

function parse (stdout) {
  stdout = stdout.trim()
  if (stdout === '') return []
  return stdout
    .split('\n--\n')
    .map(parseBundle)
    .map(groupByFile)
}

onmessage = ({ data }) => postMessage(parse(data))
