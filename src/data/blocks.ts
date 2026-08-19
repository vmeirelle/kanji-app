import blocks from './blocks.json'

export type Kanji = { char: string; meaning: string; kana: string }
export type Block = { id: string; level: string; name: string; kanji: Kanji[] }

export const loadBlocks = async (): Promise<Block[]> => blocks as Block[]

export const levelsOf = (blocks: Block[]): string[] => [...new Set(blocks.map((b) => b.level))]

export const blocksIn = (blocks: Block[], levels: string[]): Block[] =>
  blocks.filter((b) => levels.includes(b.level))

export const poolOf = (blocks: Block[], ids: string[]): Kanji[] =>
  blocks.filter((b) => ids.includes(b.id)).flatMap((b) => b.kanji)

export const levelColor = (level: string): string =>
  `var(--lv-${level}, var(--color-border-hover))`
