import '@testing-library/jest-dom/vitest'

// jsdom does not implement Blob/File.arrayBuffer(), which DropZone (and the
// Task 8 integration test) use to read dropped PDFs. Polyfill it via FileReader,
// which jsdom does implement, so component tests exercise the real code path.
if (typeof Blob !== 'undefined' && !Blob.prototype.arrayBuffer) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(Blob.prototype as any).arrayBuffer = function arrayBuffer(): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(this as Blob)
    })
  }
}
