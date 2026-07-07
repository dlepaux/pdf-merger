/** Trigger a browser download of `bytes` as `filename`. */
export function downloadBytes(bytes: Uint8Array, filename: string): void {
  // @types/node's Uint8Array<ArrayBufferLike> vs lib.dom's BlobPart (Uint8Array<ArrayBuffer>)
  // is a known TS 5.7+ typing mismatch; the value is a plain Uint8Array at runtime so this is safe.
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  // Deferred one tick: some browsers cancel the download if the blob URL
  // is revoked in the same tick as the anchor click.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
