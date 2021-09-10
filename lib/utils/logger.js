const log = (incomingMessage, level) =>
  process.stdout.write(`[ ${level.toUpperCase()} ] - ${incomingMessage}\n`)

export const info = (msg) => log(msg, 'info')
export const warn = (msg) => log(msg, 'warn')
export const error = (msg) => log(msg, 'error')
export const debug = (msg) => log(msg, 'debug')
export const warnErr = (msg) => log(msg, 'warn-error')
