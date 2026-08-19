import blocks from './blocks.json'

export type Kanji = { char: string; meaning: string; kana: string }
export type Block = { id: string; level: string; name: string; kanji: Kanji[] }

/** Data-access seam: swap the JSON import for a `fetch()` when a backend exists. */
export const loadBlocks = async (): Promise<Block[]> => blocks as Block[]

/** Blocks grouped by JLPT level, in file order (N5 first). */
export function byLevel(blocks: Block[]): { level: string; blocks: Block[] }[] {
  const out: { level: string; blocks: Block[] }[] = []
  for (const b of blocks) {
    const g = out.find((g) => g.level === b.level)
    if (g) g.blocks.push(b)
    else out.push({ level: b.level, blocks: [b] })
  }
  return out
}

/** The kanji the user has opted into — the quiz pool and its distractors. */
export const poolOf = (blocks: Block[], ids: string[]): Kanji[] =>
  blocks.filter((b) => ids.includes(b.id)).flatMap((b) => b.kanji)
