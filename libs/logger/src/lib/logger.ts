import { createLogger, transports } from 'winston'

export const Logger = createLogger({
  level: process.env['LOG_LEVEL'] ?? 'info',
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'combined.log' }),
  ],
})
