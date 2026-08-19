import blocks from './blocks.json'

export type Kanji = { char: string; meaning: string; kana: string }
export type Block = { id: string; name: string; kanji: Kanji[] }

/** Data-access seam: swap the JSON import for a `fetch()` when a backend exists. */
export const loadBlocks = async (): Promise<Block[]> => blocks as Block[]
