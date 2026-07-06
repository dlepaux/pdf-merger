import { mkdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import chokidar, { type FSWatcher } from 'chokidar'
import { displayPath, log, shortReason } from './log.ts'
import { listPdfs, mergePdfs, writeAtomic } from './merge.ts'

export type ServiceConfig = {
  inboxDir: string
  distDir: string
  outputName?: string
  debounceMs?: number
}

type ResolvedConfig = Required<ServiceConfig>

/** One merge pass: inbox -> dist/<outputName>. Empty inbox keeps last output. */
export async function runMerge(cfg: ResolvedConfig): Promise<void> {
  const files = await listPdfs(cfg.inboxDir)
  if (files.length === 0) {
    log.info('inbox empty — waiting for PDFs')
    return
  }

  const result = await mergePdfs(files)
  for (const s of result?.skipped ?? []) {
    log.warn(`skipped ${displayPath(s.file)} — ${shortReason(s.reason)}`)
  }
  if (result === null) {
    log.warn('no readable PDF in inbox — output unchanged')
    return
  }

  const outPath = join(cfg.distDir, cfg.outputName)
  await writeAtomic(outPath, result.bytes)
  const count = result.merged.length
  log.success(`merged ${count} file${count === 1 ? '' : 's'} → ${displayPath(outPath)}`)
}

/**
 * Watch inbox and re-merge on every add/change/unlink, debounced.
 * awaitWriteFinish keeps half-copied files out of the merge; the
 * running/rerun latch keeps passes from overlapping.
 */
export async function startService(config: ServiceConfig): Promise<FSWatcher> {
  const cfg: ResolvedConfig = {
    outputName: 'merged.pdf',
    debounceMs: 500,
    ...config,
    inboxDir: resolve(config.inboxDir),
    distDir: resolve(config.distDir),
  }
  await mkdir(cfg.inboxDir, { recursive: true })
  await mkdir(cfg.distDir, { recursive: true })

  let timer: NodeJS.Timeout | undefined
  let running = false
  let rerun = false

  const schedule = (): void => {
    clearTimeout(timer)
    timer = setTimeout(trigger, cfg.debounceMs)
  }

  async function trigger(): Promise<void> {
    if (running) {
      rerun = true
      return
    }
    running = true
    try {
      await runMerge(cfg)
    } catch (err) {
      log.error(`merge pass failed — ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      running = false
    }
    if (rerun) {
      rerun = false
      schedule()
    }
  }

  await runMerge(cfg)

  const watcher = chokidar.watch(cfg.inboxDir, {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 400, pollInterval: 100 },
  })
  watcher.on('add', schedule).on('change', schedule).on('unlink', schedule)
  return watcher
}
