import type { Block, Kanji } from './blocks'

type Row = { key: string; items: [string, string, string][] }

const ROWS: Row[] = [
  { key: 'A', items: [['あ', 'ア', 'a'], ['い', 'イ', 'i'], ['う', 'ウ', 'u'], ['え', 'エ', 'e'], ['お', 'オ', 'o']] },
  { key: 'KA', items: [['か', 'カ', 'ka'], ['き', 'キ', 'ki'], ['く', 'ク', 'ku'], ['け', 'ケ', 'ke'], ['こ', 'コ', 'ko']] },
  { key: 'SA', items: [['さ', 'サ', 'sa'], ['し', 'シ', 'shi'], ['す', 'ス', 'su'], ['せ', 'セ', 'se'], ['そ', 'ソ', 'so']] },
  { key: 'TA', items: [['た', 'タ', 'ta'], ['ち', 'チ', 'chi'], ['つ', 'ツ', 'tsu'], ['て', 'テ', 'te'], ['と', 'ト', 'to']] },
  { key: 'NA', items: [['な', 'ナ', 'na'], ['に', 'ニ', 'ni'], ['ぬ', 'ヌ', 'nu'], ['ね', 'ネ', 'ne'], ['の', 'ノ', 'no']] },
  { key: 'HA', items: [['は', 'ハ', 'ha'], ['ひ', 'ヒ', 'hi'], ['ふ', 'フ', 'fu'], ['へ', 'ヘ', 'he'], ['ほ', 'ホ', 'ho']] },
  { key: 'MA', items: [['ま', 'マ', 'ma'], ['み', 'ミ', 'mi'], ['む', 'ム', 'mu'], ['め', 'メ', 'me'], ['も', 'モ', 'mo']] },
  { key: 'YA', items: [['や', 'ヤ', 'ya'], ['ゆ', 'ユ', 'yu'], ['よ', 'ヨ', 'yo']] },
  { key: 'RA', items: [['ら', 'ラ', 'ra'], ['り', 'リ', 'ri'], ['る', 'ル', 'ru'], ['れ', 'レ', 're'], ['ろ', 'ロ', 'ro']] },
  { key: 'WA', items: [['わ', 'ワ', 'wa'], ['を', 'ヲ', 'wo']] },
  { key: 'N', items: [['ん', 'ン', 'n']] },
]

const entry = (glyph: string, roma: string): Kanji => ({ char: glyph, kana: roma, meaning: roma })

function buildBlocks(): Block[] {
  const blocks: Block[] = []
  for (const r of ROWS) {
    blocks.push({ id: `h-${r.key}`, level: 'Hiragana', name: r.key, kanji: r.items.map(([h, , ro]) => entry(h, ro)) })
  }
  for (const r of ROWS) {
    blocks.push({ id: `k-${r.key}`, level: 'Katakana', name: r.key, kanji: r.items.map(([, k, ro]) => entry(k, ro)) })
  }
  for (const r of ROWS) {
    blocks.push({
      id: `b-${r.key}`,
      level: 'Both',
      name: r.key,
      kanji: r.items.flatMap(([h, k, ro]) => [entry(h, ro), entry(k, ro)]),
    })
  }
  return blocks
}

const BLOCKS = buildBlocks()

export const loadKana = async (): Promise<Block[]> => BLOCKS
