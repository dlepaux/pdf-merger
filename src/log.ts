/** Minimal console styling: dim timestamp + colored status symbol per line. */

const useColor = process.stdout.isTTY === true && process.env.NO_COLOR === undefined

function paint(code: string, text: string): string {
  return useColor ? `\u001b[${code}m${text}\u001b[0m` : text
}

/** Paths under cwd read shorter in logs; foreign paths stay absolute. */
export function displayPath(path: string): string {
  const cwd = `${process.cwd()}/`
  return path.startsWith(cwd) ? path.slice(cwd.length) : path
}

/** Library errors can be paragraphs — keep the first sentence, capped. */
export function shortReason(reason: string): string {
  const firstSentence = reason.split('. ')[0] ?? reason
  return firstSentence.length > 120 ? `${firstSentence.slice(0, 119)}…` : firstSentence
}

function line(symbol: string, message: string): string {
  const time = new Date().toTimeString().slice(0, 8)
  return `${paint('2', time)} ${symbol} ${message}`
}

export const log = {
  info: (message: string): void => console.log(line(paint('36', '●'), message)),
  success: (message: string): void => console.log(line(paint('32', '✓'), message)),
  warn: (message: string): void => console.warn(line(paint('33', '▲'), message)),
  error: (message: string): void => console.error(line(paint('31', '✕'), message)),
}
