import { createLogger, transports, format } from 'winston'
const { combine, timestamp, label, printf } = format

const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] ${message} `
  if (metadata && Object.keys(metadata).length) {
    msg += JSON.stringify(metadata)
  }
  return msg
})

export const Logger = createLogger({
  level: process.env['LOG_LEVEL'] ?? 'info',
  format: combine(format.colorize(), format.splat(), timestamp(), myFormat),
  transports: [new transports.Console(), new transports.File({ filename: 'combined.log' })],
})
