export function deleteRange(text: string, start: number, end: number): string {
  let s = start
  let e = end
  if (s > e) {
    const tmp = s
    s = e
    e = tmp
  }
  s = Math.max(0, s)
  e = Math.min(text.length, e)
  return text.slice(0, s) + text.slice(e)
}

export function insertAt(text: string, index: number, insert: string): string {
  const i = Math.max(0, Math.min(text.length, index))
  return text.slice(0, i) + insert + text.slice(i)
}
