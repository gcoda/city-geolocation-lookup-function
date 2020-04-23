import fs from 'fs'
import readline from 'readline'
import path from 'path'
export const root = (...p: string[]) => path.resolve(__dirname, '..', ...p)
export const readStream = (name: string) =>
  fs.createReadStream(root('inputs', name), { encoding: 'utf8' })
export const writeStream = (name: string) =>
  fs.createWriteStream(root('generated', name), { encoding: 'utf8' })
export const readGenerated = (name: string) => {
  try {
    const file = fs.readFileSync(root('generated', name), { encoding: 'utf8' })
    return JSON.parse(file)
  } catch (e) {
    console.log(e)
    return {}
  }
}

interface LineProcess {
  readable: fs.ReadStream
  writable: fs.WriteStream
  onStart?: string
  onClose?: string
  onLine: (l: string, c: number) => string | false | null
}
export const processLines = ({
  readable,
  writable,
  onStart = '[',
  onClose = ']',
  onLine,
}: LineProcess) => {
  let lineCount = 0

  writable.write(onStart)

  const rl = readline.createInterface({
    input: readable,
    terminal: false,
  })
  rl.on('line', input => {
    lineCount++
    const line = onLine(input, lineCount)
    if (line !== false && line !== null) writable.write(line)
  })
  return new Promise(resolve => {
    rl.once('close', () => {
      writable.write(onClose)
      writable.end()
      // resolve(lineCount)
    })
    writable.once('close', () => resolve(lineCount))
  })
}
