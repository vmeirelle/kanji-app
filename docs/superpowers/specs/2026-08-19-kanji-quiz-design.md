# Kanji Quiz — Design Spec

**Date:** 2026-08-19
**Status:** Approved for planning

## Goal

A mobile-first kanji learning app. The user picks a block of kanji, steps
through each one, chooses a quiz mode (meaning or kana), and answers by tapping
one of 9 large squares. Wrong answers are tracked and re-quizzed immediately
after the block. No accounts, rankings, or backend yet — but the structure must
make those additions localized, not sweeping.

## Decisions (locked)

- **Frontend-only Vue 3 + Vite + TypeScript SPA.** No Laravel now. The existing
  scaffold is reused; demo components (HelloWorld, TheWelcome, logo) are removed.
- **All persistent data is JSON.** Block content is a JSON file; quiz progress is
  persisted to `localStorage` as JSON.
- **Answer squares are uniform per question:** the chosen mode fixes the answer
  format (all 9 squares are meanings, or all 9 are kana). "Mixing formats"
  happens across questions/modes, not within one question.
- **Wrong answer → reveal + auto-advance:** flash the tapped square red,
  highlight the correct square (~0.8s), record the kanji as incorrect, advance.
  The kanji returns in the retry pass.
- **Vitest** covers the pure quiz logic only. UI is left untested.

## Data model

```ts
type Kanji  = { char: string; meaning: string; kana: string }
type Block  = { id: string; name: string; kanji: Kanji[] }
```

- `src/data/blocks.json` — the block content (exactly 2 blocks to start).
- `src/data/blocks.ts` — types + `loadBlocks(): Promise<Block[]>` that imports the
  JSON. Async signature is the swap point for a future Laravel API (`fetch()`).
- Adding blocks later = append to `blocks.json`. No other code changes.

## Generic quiz core — `src/quiz.ts` (pure, no Vue)

```ts
type Format = 'char' | 'meaning' | 'kana'   // = keys of Kanji
type Mode   = { id: string; label: string; prompt: Format; answer: Format }

const MODES: Mode[] = [
  { id: 'meaning', label: 'Meaning', prompt: 'char', answer: 'meaning' },
  { id: 'kana',    label: 'Kana',    prompt: 'char', answer: 'kana' },
]

type Option   = { key: string; label: string; correct: boolean }
type Question = { prompt: string; options: Option[] }

buildQuestion(target: Kanji, pool: Kanji[], mode: Mode, count = 9): Question
shuffle<T>(xs: T[]): T[]
```

- Prompt rendered in `mode.prompt`; the 9 options rendered in `mode.answer`.
- Distractors: random kanji from the block, **deduped by their answer-format
  label** so no two squares read the same. Result shuffled. If the pool is
  smaller than `count`, return as many unique options as exist (never duplicate).
- **Extension surface (the whole thing):** a new question/answer mode = one entry
  in `MODES`; a new format (e.g. `onyomi`) = one field on `Kanji` + one member of
  `Format`.

## State machine — `src/useQuiz.ts` (composable)

Phases: `block → mode → question → (repeat per kanji) → done`.

- Pick block → build an ordered `queue` from its kanji.
- Per kanji: pick mode (per-kanji, per spec) → `buildQuestion` → answer.
- Wrong answers accumulate into `incorrect[]`.
- Queue empties → if `incorrect` is non-empty: `queue = incorrect; incorrect = []`
  and repeat (retry-only-wrong loop) until clean → `done`.
- State (block id, queue, current index, incorrect, phase) is persisted to
  `localStorage` as JSON on change and restored on load, so refresh resumes.

## Persistence — `src/storage.ts`

```ts
loadState(): QuizState | null      // JSON.parse from localStorage
saveState(s: QuizState): void      // JSON.stringify to localStorage
clearState(): void
```

Single localStorage key. This is also the seam where per-user data moves
server-side once accounts exist.

## Components (3 total)

- **`SquareGrid.vue`** — the one reusable primitive. Props: `items: {key,label}[]`,
  optional per-item state for feedback (correct/wrong). Renders large tappable
  squares in a responsive CSS grid; emits `select(key)`. Reused for the block
  picker (2), mode picker (2), and answer options (9).
- **`QuizView.vue`** — renders the prompt kanji + a `SquareGrid` of answers;
  handles tap → feedback (correct=green/advance, wrong=red + reveal correct) and
  reports the result upward.
- **`App.vue`** — orchestrates phases via `useQuiz`, swapping between block
  picker, mode picker, `QuizView`, and the done screen.

## UI / styling

Mobile-first. Answer grid uses CSS `grid` with `auto-fit` / `minmax` so 9 squares
tile 3×3 on phones and stay clean, centered (`max-width`) on desktop. Large tap
targets, large kanji glyphs. A single minimal stylesheet replaces the scaffold's
demo CSS.

## Testing

Vitest (dev dependency) covering `quiz.ts`:
- `buildQuestion` returns `count` options, includes exactly one correct, no
  duplicate labels, prompt/answer rendered in the right formats.
- Small-pool case returns unique options without duplication.
- Retry-queue reducer: incorrect set becomes the next queue; empty incorrect →
  done.

## Future-proofing (seams only, no code now)

- `loadBlocks()` async → Laravel API drop-in.
- `useQuiz` + `storage.ts` centralize state → accounts/rankings attach there.

## Dependencies

- Runtime: Vue only (already present).
- Dev: add Vitest.

## Out of scope (YAGNI)

Authentication, accounts, rankings, spaced repetition, audio, more than 2 blocks
of seed content, backend of any kind.
