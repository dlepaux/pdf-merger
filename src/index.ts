import { log } from './log.ts'
import { startService } from './service.ts'

const inboxDir = process.env.PDF_MERGER_INBOX ?? 'inbox'
const distDir = process.env.PDF_MERGER_DIST ?? 'dist'

await startService({ inboxDir, distDir })
log.info(`watching ${inboxDir}/ — drop PDFs there, merged output lands in ${distDir}/`)
