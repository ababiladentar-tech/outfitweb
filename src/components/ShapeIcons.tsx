import type { BodyShape, FaceShape, Gender } from '@/lib/types';

interface Proportion {
  s: number;
  w: number;
  h: number;
}

const GIRL: Partial<Record<BodyShape, Proportion>> = {
  hourglass: { s: 13, w: 7.5, h: 13.5 },
  apple: { s: 12, w: 14.5, h: 12 },
  inverted_triangle: { s: 16, w: 10, h: 9.5 },
  rectangle: { s: 12, w: 11, h: 12 },
  pear: { s: 10, w: 8.5, h: 15.5 },
};

const BOY: Partial<Record<BodyShape, Proportion>> = {
  oval: { s: 13, w: 15.5, h: 12 },
  rectangle: { s: 13, w: 12, h: 12 },
  triangle: { s: 10.5, w: 12, h: 14.5 },
  trapezoid: { s: 15.5, w: 11.5, h: 11.5 },
  inverted_triangle: { s: 17.5, w: 10, h: 10 },
};

export const BODY_SHAPES: Record<Gender, { key: BodyShape; label: string; hint: string }[]> = {
  girl: [
    { key: 'hourglass', label: 'Hourglass', hint: 'Bahu dan pinggul seimbang, pinggang ramping' },
    { key: 'apple', label: 'Apple', hint: 'Volume di area perut, kaki ramping' },
    { key: 'inverted_triangle', label: 'Inverted Triangle', hint: 'Bahu lebih lebar dari pinggul' },
    { key: 'rectangle', label: 'Rectangle', hint: 'Bahu, pinggang, pinggul hampir sejajar' },
    { key: 'pear', label: 'Pear', hint: 'Pinggul lebih lebar dari bahu' },
  ],
  boy: [
    { key: 'oval', label: 'Oval', hint: 'Volume di tengah tubuh' },
    { key: 'rectangle', label: 'Rectangle', hint: 'Bahu dan pinggang sejajar' },
    { key: 'triangle', label: 'Triangle', hint: 'Pinggul lebih lebar dari bahu' },
    { key: 'trapezoid', label: 'Trapezoid', hint: 'Bahu sedikit lebih lebar, pinggang sedang' },
    { key: 'inverted_triangle', label: 'Inverted Triangle', hint: 'Bahu jauh lebih lebar' },
  ],
};

export function BodyShapeIcon({ shape, gender, className = '' }: { shape: BodyShape; gender: Gender; className?: string }) {
  const p = (gender === 'girl' ? GIRL[shape] : BOY[shape]) ?? { s: 12, w: 11, h: 12 };
  const c = 30;
  const L = (x: number): number => c - x;
  const R = (x: number): number => c + x;
  const d = [
    `M${L(4)} 21 Q${L(p.s)} 22 ${L(p.s)} 28`,
    `Q${L(p.s) + 1} 42 ${L(p.w)} 52`,
    `Q${L(p.h) - 1} 60 ${L(p.h)} 68`,
    `L${L(p.h) + 5} 96`,
    `M${R(4)} 21 Q${R(p.s)} 22 ${R(p.s)} 28`,
    `Q${R(p.s) - 1} 42 ${R(p.w)} 52`,
    `Q${R(p.h) + 1} 60 ${R(p.h)} 68`,
    `L${R(p.h) - 5} 96`,
    `M${c} 74 L${c} 96`,
  ].join(' ');
  return (
    <svg viewBox="0 0 60 100" className={className} fill="none" stroke="currentColor" strokeWidth={1.1} strokeLinecap="round">
      <circle cx={c} cy={11} r={6} />
      <path d={`M${L(3)} 17 L${L(4)} 21 M${R(3)} 17 L${R(4)} 21`} />
      <path d={d} />
      <g strokeDasharray="1.5 2.5" opacity={0.45} strokeWidth={0.7}>
        <line x1={L(p.s)} y1={28} x2={R(p.s)} y2={28} />
        <line x1={L(p.w)} y1={52} x2={R(p.w)} y2={52} />
        <line x1={L(p.h)} y1={68} x2={R(p.h)} y2={68} />
      </g>
    </svg>
  );
}

const FACE_PATHS: Record<FaceShape, string> = {
  oval: 'M30 4 C44 4 49 18 49 34 C49 52 40 68 30 68 C20 68 11 52 11 34 C11 18 16 4 30 4 Z',
  round: 'M30 6 C45 6 52 18 52 36 C52 54 42 66 30 66 C18 66 8 54 8 36 C8 18 15 6 30 6 Z',
  square: 'M11 14 Q11 6 19 6 L41 6 Q49 6 49 14 L49 52 Q49 64 38 66 L22 66 Q11 64 11 52 Z',
  rectangle: 'M14 10 Q14 4 20 4 L40 4 Q46 4 46 10 L46 56 Q46 68 36 69 L24 69 Q14 68 14 56 Z',
  hexagonal: 'M21 5 L39 5 L50 27 L46 50 L30 67 L14 50 L10 27 Z',
  triangle: 'M23 5 L37 5 Q45 6 47 28 L51 51 Q49 66 30 68 Q11 66 9 51 L13 28 Q15 6 23 5 Z',
  heart: 'M8 20 Q8 4 30 4 Q52 4 52 20 Q52 42 30 68 Q8 42 8 20 Z',
  diamond: 'M30 4 Q41 12 50 32 Q44 52 30 68 Q16 52 10 32 Q19 12 30 4 Z',
};

export const FACE_SHAPES: { key: FaceShape; label: string }[] = [
  { key: 'rectangle', label: 'Rectangle' },
  { key: 'square', label: 'Square' },
  { key: 'hexagonal', label: 'Hexagonal' },
  { key: 'round', label: 'Round' },
  { key: 'oval', label: 'Oval' },
  { key: 'triangle', label: 'Triangle' },
  { key: 'heart', label: 'Heart' },
  { key: 'diamond', label: 'Diamond' },
];

export function FaceShapeIcon({ shape, className = '' }: { shape: FaceShape; className?: string }) {
  return (
    <svg viewBox="0 0 60 72" className={className} fill="none" stroke="currentColor" strokeWidth={1.1} strokeLinejoin="round">
      <path d={FACE_PATHS[shape]} />
      <g strokeDasharray="1.5 2.5" opacity={0.4} strokeWidth={0.7}>
        <line x1={6} y1={18} x2={54} y2={18} />
        <line x1={4} y1={34} x2={56} y2={34} />
        <line x1={8} y1={54} x2={52} y2={54} />
      </g>
    </svg>
  );
}
