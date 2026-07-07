/** A dropped PDF held in memory. `id` is stable for dnd-kit keying/reordering. */
export type PdfItem = { id: string; name: string; size: number; bytes: Uint8Array }
