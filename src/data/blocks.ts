import blocks from './blocks.json'

export type Kanji = { char: string; meaning: string; kana: string }
export type Block = { id: string; level: string; name: string; kanji: Kanji[] }

/** Data-access seam: swap the JSON import for a `fetch()` when a backend exists. */
export const loadBlocks = async (): Promise<Block[]> => blocks as Block[]

/** JLPT levels present in the data, easiest first (file order). */
export const levelsOf = (blocks: Block[]): string[] => [...new Set(blocks.map((b) => b.level))]

/** Categories belonging to any of the given levels — levels mix freely. */
export const blocksIn = (blocks: Block[], levels: string[]): Block[] =>
  blocks.filter((b) => levels.includes(b.level))

/** The kanji the user has opted into — the quiz pool and its distractors. */
export const poolOf = (blocks: Block[], ids: string[]): Kanji[] =>
  blocks.filter((b) => ids.includes(b.id)).flatMap((b) => b.kanji)

/** A level's accent colour, blue (easiest) to red (hardest). */
export const levelColor = (level: string): string =>
  `var(--lv-${level}, var(--color-border-hover))`
