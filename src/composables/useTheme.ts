/**
 * Typed design tokens — the single source of truth for colour, size, spacing,
 * alignment and variants. Components take these enums as props (never raw
 * strings) and resolve them here, so nothing is styled with magic values.
 * Theme-aware colours point at the light/dark CSS variables in assets/base.css;
 * everything else is a literal owned here.
 */
import type { CSSProperties } from 'vue'

export enum Size {
  Xs = 'xs',
  Sm = 'sm',
  Md = 'md',
  Lg = 'lg',
  Xl = 'xl',
  Xxl = 'xxl',
}

export enum Color {
  Brand = 'brand',
  OnBrand = 'onBrand',
  Correct = 'correct',
  CorrectSoft = 'correctSoft',
  Wrong = 'wrong',
  Heading = 'heading',
  Text = 'text',
  Background = 'background',
  Surface = 'surface',
  Muted = 'muted',
  Border = 'border',
  BorderStrong = 'borderStrong',
}

export enum Align {
  Start = 'start',
  Center = 'center',
  End = 'end',
  Between = 'between',
}

export enum Direction {
  Row = 'row',
  Col = 'col',
}

export enum Variant {
  Primary = 'primary',
  Plain = 'plain',
  Ghost = 'ghost',
}

export enum Space {
  Xxs = 'xxs',
  Xs = 'xs',
  Sm = 'sm',
  Md = 'md',
  Lg = 'lg',
  Xl = 'xl',
}

const colors: Record<Color, string> = {
  [Color.Brand]: 'var(--brand)',
  [Color.OnBrand]: '#ffffff',
  [Color.Correct]: '#16a34a',
  [Color.CorrectSoft]: 'rgba(22, 163, 74, 0.13)',
  [Color.Wrong]: '#dc2626',
  [Color.Heading]: 'var(--color-heading)',
  [Color.Text]: 'var(--color-text)',
  [Color.Background]: 'var(--color-background)',
  [Color.Surface]: 'var(--color-background-soft)',
  [Color.Muted]: 'var(--color-background-mute)',
  [Color.Border]: 'var(--color-border)',
  [Color.BorderStrong]: 'var(--color-border-hover)',
}

const fontSizes: Record<Size, string> = {
  [Size.Xs]: '0.8rem',
  [Size.Sm]: '0.9rem',
  [Size.Md]: '1rem',
  [Size.Lg]: '1.25rem',
  [Size.Xl]: '1.5rem',
  [Size.Xxl]: '2.75rem',
}

const flexAlign: Record<Align, string> = {
  [Align.Start]: 'flex-start',
  [Align.Center]: 'center',
  [Align.End]: 'flex-end',
  [Align.Between]: 'space-between',
}

const textAlign: Record<Align, CSSProperties['textAlign']> = {
  [Align.Start]: 'left',
  [Align.Center]: 'center',
  [Align.End]: 'right',
  [Align.Between]: 'justify',
}

const spaces: Record<Space, string> = {
  [Space.Xxs]: '0.3rem',
  [Space.Xs]: '0.5rem',
  [Space.Sm]: '0.75rem',
  [Space.Md]: '1rem',
  [Space.Lg]: '1.25rem',
  [Space.Xl]: '1.5rem',
}

export function useTheme() {
  return {
    color: (c: Color): string => colors[c],
    fontSize: (s: Size): string => fontSizes[s],
    flexAlign: (a: Align): string => flexAlign[a],
    textAlign: (a: Align): CSSProperties['textAlign'] => textAlign[a],
    space: (s: Space): string => spaces[s],
  }
}
