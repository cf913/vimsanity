export type VimMode =
  | 'normal'
  | 'insert'
  | 'visual'
  | 'visual-line'
  | 'visual-block'

export const VIM_MODES: Record<string, VimMode> = {
  NORMAL: 'normal',
  INSERT: 'insert',
  VISUAL: 'visual',
  VISUAL_LINE: 'visual-line',
  VISUAL_BLOCK: 'visual-block',
}
