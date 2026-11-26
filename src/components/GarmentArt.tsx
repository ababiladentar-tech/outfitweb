'use client';

import { useId, useState } from 'react';
import { isLight, shade } from '@/lib/color';

type Pattern = 'plain' | 'stripe' | 'batik' | 'denim' | 'knit' | 'embroidery' | 'pleat' | 'satin' | 'twill';

interface ShapeDef {
  body: string;
  extra?: (stroke: string, accent: string) => React.ReactNode;
}

const buttons = (xs: number[], ys: number[], fill: string): React.ReactNode =>
  ys.map((y, i) => <circle key={i} cx={xs[i % xs.length]} cy={y} r={2.2} fill={fill} />);

const SHAPES: Record<string, ShapeDef> = {
  tee: {
    body: 'M64 42 L86 32 Q100 46 114 32 L136 42 L164 66 L148 86 L136 76 L136 198 L64 198 L64 76 L52 86 L36 66 Z',
  },
  shirt: {
    body: 'M64 42 L86 32 L100 46 L114 32 L136 42 L160 70 L170 154 L152 158 L140 94 L140 206 L60 206 L60 94 L48 158 L30 154 L40 70 Z',
    extra: (s, a) => (
      <g>
        <path d="M86 32 L100 56 L114 32 L106 29 L100 40 L94 29 Z" fill="rgba(255,255,255,0.18)" stroke={s} strokeWidth={1} />
        <line x1={100} y1={56} x2={100} y2={206} stroke={s} strokeWidth={0.9} />
        {buttons([104], [72, 98, 124, 150, 176], a)}
        <rect x={68} y={78} width={20} height={18} rx={2} fill="none" stroke={s} strokeWidth={0.8} />
      </g>
    ),
  },
  blouse: {
    body: 'M66 42 L88 34 L112 34 L134 42 L156 68 L160 128 L144 130 L138 92 L136 190 L64 190 L62 92 L56 130 L40 128 L44 68 Z',
    extra: (s, a) => (
      <g>
        <path d="M88 34 Q100 40 112 34 L112 28 Q100 34 88 28 Z" fill="rgba(0,0,0,0.06)" stroke={s} strokeWidth={0.9} />
        <line x1={100} y1={37} x2={100} y2={92} stroke={s} strokeWidth={0.9} />
        {buttons([100], [50, 64, 78], a)}
      </g>
    ),
  },
  tunic: {
    body: 'M64 42 L88 32 L112 32 L136 42 L160 70 L166 150 L150 152 L140 96 L146 222 L54 222 L60 96 L50 152 L34 150 L40 70 Z',
    extra: (s, a) => (
      <g>
        <path d="M88 32 Q100 52 112 32" fill="none" stroke={s} strokeWidth={1} />
        <path d="M84 56 Q100 76 116 56" fill="none" stroke={a} strokeWidth={1.4} strokeDasharray="2 3" />
        <path d="M80 66 Q100 92 120 66" fill="none" stroke={a} strokeWidth={1.2} strokeDasharray="1.5 3" />
      </g>
    ),
  },
  kimono: {
    body: 'M58 40 L88 32 L100 118 L112 32 L142 40 L178 72 L168 118 L146 104 L146 216 L54 216 L54 104 L32 118 L22 72 Z',
    extra: (s) => (
      <g>
        <path d="M88 32 L96 216 M112 32 L104 216" fill="none" stroke={s} strokeWidth={1} />
        <line x1={54} y1={104} x2={74} y2={60} stroke={s} strokeWidth={0.6} opacity={0.5} />
        <line x1={146} y1={104} x2={126} y2={60} stroke={s} strokeWidth={0.6} opacity={0.5} />
      </g>
    ),
  },
  jacket: {
    body: 'M62 42 L86 32 L100 44 L114 32 L138 42 L162 70 L170 150 L152 154 L142 96 L142 180 L58 180 L58 96 L48 154 L30 150 L38 70 Z',
    extra: (s, a) => (
      <g>
        <path d="M86 32 L100 52 L114 32" fill="none" stroke={s} strokeWidth={1.2} />
        <line x1={100} y1={52} x2={100} y2={180} stroke={s} strokeWidth={1} />
        <rect x={66} y={70} width={22} height={20} rx={1} fill="none" stroke={a} strokeWidth={1} strokeDasharray="2 2" />
        <rect x={112} y={70} width={22} height={20} rx={1} fill="none" stroke={a} strokeWidth={1} strokeDasharray="2 2" />
        <line x1={58} y1={168} x2={142} y2={168} stroke={a} strokeWidth={1} strokeDasharray="2 2" />
        {buttons([104], [64, 92, 120, 148], a)}
      </g>
    ),
  },
  blazer: {
    body: 'M60 40 L86 30 L100 40 L114 30 L140 40 L164 70 L170 158 L152 160 L144 98 L146 204 L54 204 L56 98 L48 160 L30 158 L36 70 Z',
    extra: (s, a) => (
      <g>
        <path d="M86 30 L80 64 L92 70 L100 132 L108 70 L120 64 L114 30" fill="rgba(0,0,0,0.05)" stroke={s} strokeWidth={1.1} />
        <line x1={100} y1={132} x2={100} y2={204} stroke={s} strokeWidth={1} />
        <line x1={66} y1={150} x2={86} y2={150} stroke={s} strokeWidth={1} />
        <line x1={114} y1={150} x2={134} y2={150} stroke={s} strokeWidth={1} />
        {buttons([100], [142, 162], a)}
      </g>
    ),
  },
  cardigan: {
    body: 'M64 42 L88 32 L100 92 L112 32 L136 42 L160 70 L168 156 L150 158 L140 96 L140 196 L60 196 L60 96 L50 158 L32 156 L40 70 Z',
    extra: (s, a) => (
      <g>
        <line x1={100} y1={92} x2={100} y2={196} stroke={s} strokeWidth={1} />
        <rect x={60} y={184} width={80} height={12} fill="rgba(0,0,0,0.06)" />
        {buttons([104], [104, 124, 144, 164], a)}
      </g>
    ),
  },
  trousers: {
    body: 'M66 34 L134 34 L142 212 L108 212 L100 92 L92 212 L58 212 Z',
    extra: (s) => (
      <g>
        <rect x={66} y={34} width={68} height={10} fill="rgba(0,0,0,0.07)" />
        <line x1={84} y1={44} x2={78} y2={212} stroke={s} strokeWidth={0.7} />
        <line x1={116} y1={44} x2={122} y2={212} stroke={s} strokeWidth={0.7} />
      </g>
    ),
  },
  culottes: {
    body: 'M66 34 L134 34 L158 196 L106 196 L100 98 L94 196 L42 196 Z',
    extra: () => <rect x={66} y={34} width={68} height={12} fill="rgba(0,0,0,0.08)" />,
  },
  jeans: {
    body: 'M68 34 L132 34 L138 214 L106 214 L100 92 L94 214 L62 214 Z',
    extra: (s, a) => (
      <g>
        <rect x={68} y={34} width={64} height={9} fill="rgba(0,0,0,0.08)" />
        <path d="M70 46 Q82 62 92 48" fill="none" stroke={a} strokeWidth={1} strokeDasharray="2 2" />
        <path d="M130 46 Q118 62 108 48" fill="none" stroke={a} strokeWidth={1} strokeDasharray="2 2" />
        <line x1={100} y1={43} x2={100} y2={84} stroke={a} strokeWidth={1} strokeDasharray="2 2" />
        <circle cx={100} cy={38.5} r={2.4} fill={a} />
        <line x1={62} y1={206} x2={94} y2={206} stroke={s} strokeWidth={0.8} />
        <line x1={106} y1={206} x2={138} y2={206} stroke={s} strokeWidth={0.8} />
      </g>
    ),
  },
  widejeans: {
    body: 'M68 34 L132 34 L154 214 L106 214 L100 96 L94 214 L46 214 Z',
    extra: (_s, a) => (
      <g>
        <rect x={68} y={34} width={64} height={9} fill="rgba(0,0,0,0.08)" />
        <path d="M70 46 Q82 62 92 48" fill="none" stroke={a} strokeWidth={1} strokeDasharray="2 2" />
        <path d="M130 46 Q118 62 108 48" fill="none" stroke={a} strokeWidth={1} strokeDasharray="2 2" />
        <circle cx={100} cy={38.5} r={2.4} fill={a} />
      </g>
    ),
  },
  skirt: {
    body: 'M72 46 L128 46 L158 200 L42 200 Z',
    extra: () => <rect x={72} y={46} width={56} height={10} fill="rgba(0,0,0,0.08)" />,
  },
  dress: {
    body: 'M80 30 L92 28 Q100 42 108 28 L120 30 L138 46 L132 64 L124 60 Q118 84 120 98 L160 216 L40 216 L80 98 Q82 84 76 60 L68 64 L62 46 Z',
    extra: (s, a) => (
      <g>
        <path d="M80 98 Q100 104 120 98" fill="none" stroke={a} strokeWidth={3} />
        <path d="M96 102 L90 128 M104 102 L110 128" stroke={a} strokeWidth={1.6} />
        <line x1={62} y1={46} x2={76} y2={60} stroke={s} strokeWidth={0.6} opacity={0.6} />
      </g>
    ),
  },
  slipdress: {
    body: 'M76 54 Q100 64 124 54 L128 98 L152 216 L48 216 L72 98 Z',
    extra: (s) => (
      <g>
        <line x1={80} y1={55} x2={86} y2={24} stroke={s} strokeWidth={1.4} />
        <line x1={120} y1={55} x2={114} y2={24} stroke={s} strokeWidth={1.4} />
        <path d="M72 98 Q100 104 128 98" fill="none" stroke={s} strokeWidth={0.8} opacity={0.6} />
      </g>
    ),
  },
  hijab: {
    body: 'M46 40 L154 40 L154 204 L46 204 Z',
    extra: (s, a) => (
      <g>
        <rect x={52} y={46} width={96} height={152} fill="none" stroke={s} strokeWidth={0.7} strokeDasharray="2 2.5" />
        <path d="M46 40 L154 204" stroke={s} strokeWidth={0.8} opacity={0.35} />
        <path d="M46 40 L154 40 L46 204 Z" fill="rgba(255,255,255,0.12)" />
        <g transform="translate(130 180)" fill={a}>
          <path d="M0 -10 q5 6 0 10 q-5 -4 0 -10 Z" />
          <path d="M-10 0 q6 -5 10 0 q-4 5 -10 0 Z" />
          <path d="M10 0 q-6 -5 -10 0 q4 5 10 0 Z" opacity={0.8} />
          <circle r={1.8} />
        </g>
      </g>
    ),
  },
  sneaker: {
    body: 'M28 148 Q32 118 60 114 L96 102 Q112 98 120 110 L150 132 Q174 138 174 156 L174 164 L28 164 Z',
    extra: (s, a) => (
      <g>
        <rect x={24} y={160} width={154} height={16} rx={6} fill={a} />
        <path d="M84 110 L96 126 M94 106 L106 122 M104 104 L116 118" stroke={s} strokeWidth={1.4} />
        <path d="M28 148 Q60 150 80 140" fill="none" stroke={s} strokeWidth={0.8} />
      </g>
    ),
  },
  loafer: {
    body: 'M26 154 Q28 126 62 122 L122 118 Q162 120 174 146 L174 164 L26 164 Z',
    extra: (s) => (
      <g>
        <rect x={22} y={160} width={156} height={12} rx={4} fill={shade(s, -10)} />
        <path d="M92 124 L140 124 Q150 132 144 140 L98 140 Q88 132 92 124 Z" fill="rgba(0,0,0,0.12)" stroke={s} strokeWidth={0.8} />
        <ellipse cx={118} cy={132} rx={8} ry={3} fill="rgba(0,0,0,0.25)" />
      </g>
    ),
  },
  tote: {
    body: 'M48 90 L152 90 L160 208 L40 208 Z',
    extra: (s) => (
      <g>
        <path d="M74 90 Q74 38 100 38 Q126 38 126 90" fill="none" stroke={s} strokeWidth={5} />
        <line x1={48} y1={102} x2={152} y2={102} stroke={s} strokeWidth={0.8} strokeDasharray="2 2" />
      </g>
    ),
  },
  sling: {
    body: 'M58 118 Q58 104 72 104 L128 104 Q142 104 142 118 L142 184 Q142 196 130 196 L70 196 Q58 196 58 184 Z',
    extra: (s, a) => (
      <g>
        <path d="M64 108 Q60 30 100 30 Q140 30 136 108" fill="none" stroke={s} strokeWidth={3} />
        <path d="M58 118 Q58 104 72 104 L128 104 Q142 104 142 118 L142 146 L58 146 Z" fill="rgba(0,0,0,0.1)" stroke={s} strokeWidth={0.8} />
        <rect x={94} y={140} width={12} height={10} rx={2} fill={a} />
      </g>
    ),
  },
};

function PatternDef({ id, pattern, stroke, accent }: { id: string; pattern: Pattern; stroke: string; accent: string }) {
  switch (pattern) {
    case 'stripe':
      return (
        <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="3" height="10" fill={accent} opacity="0.55" />
          <rect x="6" width="1" height="10" fill={stroke} opacity="0.35" />
        </pattern>
      );
    case 'batik':
      return (
        <pattern id={id} width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 11 Q5.5 4 11 11 T22 11" fill="none" stroke={accent} strokeWidth="1.6" opacity="0.8" />
          <circle cx="11" cy="3" r="1.6" fill={accent} opacity="0.85" />
          <circle cx="0" cy="19" r="1.2" fill={accent} opacity="0.6" />
          <circle cx="22" cy="19" r="1.2" fill={accent} opacity="0.6" />
        </pattern>
      );
    case 'denim':
      return (
        <pattern id={id} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
          <line x1="0" y1="0" x2="0" y2="4" stroke="#ffffff" strokeWidth="0.8" opacity="0.12" />
        </pattern>
      );
    case 'twill':
      return (
        <pattern id={id} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <line x1="0" y1="0" x2="0" y2="5" stroke={stroke} strokeWidth="0.7" opacity="0.18" />
        </pattern>
      );
    case 'knit':
      return (
        <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 0 L4 4 L8 0 M0 4 L4 8 L8 4" fill="none" stroke={stroke} strokeWidth="0.7" opacity="0.28" />
        </pattern>
      );
    case 'pleat':
      return (
        <pattern id={id} width="8" height="10" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="10" stroke={stroke} strokeWidth="1" opacity="0.45" />
          <rect x="1" width="3" height="10" fill="#ffffff" opacity="0.06" />
        </pattern>
      );
    case 'satin':
      return (
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.08" />
        </linearGradient>
      );
    case 'embroidery':
      return (
        <pattern id={id} width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="13" cy="13" r="1.2" fill={accent} opacity="0.5" />
        </pattern>
      );
    default:
      return (
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.06" />
        </linearGradient>
      );
  }
}

export interface GarmentArtProps {
  shape: string;
  pattern?: string;
  color: string;
  accent?: string;
  background?: string;
  className?: string;
  title?: string;
}

export function GarmentArt({ shape, pattern = 'plain', color, accent, background, className, title }: GarmentArtProps) {
  const rid = useId().replace(/:/g, '');
  const def = SHAPES[shape] ?? SHAPES.tee;
  const stroke = shade(color, isLight(color) ? -26 : -14);
  const acc = accent ?? shade(color, isLight(color) ? -35 : 30);
  const bg = background ?? '#F0EFE9';
  const pat = (['plain', 'stripe', 'batik', 'denim', 'knit', 'embroidery', 'pleat', 'satin', 'twill'] as const).includes(
    pattern as Pattern,
  )
    ? (pattern as Pattern)
    : 'plain';
  return (
    <svg
      viewBox="0 0 200 240"
      className={className}
      role="img"
      aria-label={title ?? 'Ilustrasi busana'}
      style={{ ['--art-bg' as string]: bg }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <PatternDef id={`p${rid}`} pattern={pat} stroke={stroke} accent={acc} />
        <clipPath id={`c${rid}`}>
          <path d={def.body} />
        </clipPath>
      </defs>
      <rect width="200" height="240" fill={bg} />
      <ellipse cx="100" cy="226" rx="64" ry="5" fill="#000" opacity="0.06" />
      <path d={def.body} fill={color} />
      <rect width="200" height="240" fill={`url(#p${rid})`} clipPath={`url(#c${rid})`} />
      <path d={def.body} fill="none" stroke={stroke} strokeWidth={1.1} strokeLinejoin="round" />
      {def.extra?.(stroke, acc)}
    </svg>
  );
}

export function parseArt(src: string, fallbackColors: string[] = []): GarmentArtProps | null {
  if (!src.startsWith('art:')) return null;
  const [spec, ...colors] = src.slice(4).split('|');
  const [shape, pattern] = spec.split(':');
  const palette = colors.length ? colors : fallbackColors;
  return {
    shape,
    pattern: pattern ?? 'plain',
    color: palette[0] ?? '#8B8C88',
    accent: palette[1],
  };
}

export function ProductImage({
  src,
  colors,
  alt,
  className = '',
  background,
}: {
  src: string;
  colors?: string[];
  alt: string;
  className?: string;
  background?: string;
}) {
  // A photo URL may carry its illustration as a fragment (photo.jpg#art:shirt:plain);
  // the browser never sends the fragment, and it is drawn if the photo fails.
  const hash = src.indexOf('#art:');
  const photo = hash >= 0 ? src.slice(0, hash) : src;
  const fallback = hash >= 0 ? src.slice(hash + 1) : null;
  const [failed, setFailed] = useState<string | null>(null);
  const art = parseArt(failed === photo && fallback ? fallback : photo, colors);
  if (art) return <GarmentArt {...art} background={background} className={`h-full w-full ${className}`} title={alt} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photo} alt={alt} width={720} height={900} decoding="async" onError={() => setFailed(photo)} className={`h-full w-full object-cover ${className}`} loading="lazy" />
  );
}
