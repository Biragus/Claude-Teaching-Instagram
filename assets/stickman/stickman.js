// Hand-drawn stickman mascot (pure SVG). Black head, spiky hair, neon-green face.
// stickmanSVG({ outfit, pose, face, blink, talk, tilt }) -> SVG string, viewBox 0 0 400 640
//
// outfit: hoodie | suit
// pose:   idle | hips | pointUp | pointLeft | thinking | celebrate | shrug | phone | slump
// face:   neutral | sad | shock | determined | happy | smug
// blink:  true closes the eyes (for blink frames)
// talk:   0..1 mouth openness, overrides the mouth for lip-flap
// tilt:   head rotation in degrees

const NEON = '#39FF14';
const INK = '#0E0F12';

const OUTFITS = {
  hoodie: { top: '#8E939B', topShade: '#767B83', pants: '#4D5157', shoes: '#E6DFCF', accent: '#FFFFFF' },
  suit: { top: '#1C2A4D', topShade: '#14203D', pants: '#1C2A4D', shoes: '#FFFFFF', accent: '#FF7A1A' },
};

const SH_L = [158, 232], SH_R = [242, 232];

// [shoulder, elbow, hand] for left (viewer-left) and right arms; finger = draw a pointing finger
const POSES = {
  idle:      { L: [SH_L, [140, 312], [146, 392]], R: [SH_R, [260, 312], [254, 392]] },
  hips:      { L: [SH_L, [128, 300], [176, 338]], R: [SH_R, [272, 300], [224, 338]] },
  pointUp:   { L: [SH_L, [112, 196], [96, 120]], R: [SH_R, [260, 312], [254, 392]], fingerL: true },
  pointLeft: { L: [SH_L, [104, 238], [52, 196]], R: [SH_R, [260, 312], [254, 392]], fingerL: true },
  thinking:  { L: [SH_L, [140, 312], [146, 392]], R: [SH_R, [278, 300], [222, 212]], fingerR: true },
  celebrate: { L: [SH_L, [112, 170], [118, 86]], R: [SH_R, [288, 170], [282, 86]] },
  shrug:     { L: [SH_L, [104, 290], [80, 236]], R: [SH_R, [296, 290], [320, 236]] },
  phone:     { L: [SH_L, [140, 312], [146, 392]], R: [SH_R, [274, 322], [222, 296]], phone: true },
  slump:     { L: [SH_L, [150, 318], [160, 400]], R: [SH_R, [250, 318], [240, 400]], headDrop: 10 },
};

function armSVG([s, e, h], color, finger, watch) {
  const d = `M${s[0]} ${s[1]} L${e[0]} ${e[1]} L${h[0]} ${h[1]}`;
  let f = '';
  if (finger) {
    const dx = h[0] - e[0], dy = h[1] - e[1], L = Math.hypot(dx, dy);
    f = `<path d="M${h[0]} ${h[1]} l${(dx / L) * 26} ${(dy / L) * 26}" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>`;
  }
  const w = watch
    ? (() => {
        const dx = e[0] - h[0], dy = e[1] - h[1], L = Math.hypot(dx, dy);
        return `<circle cx="${h[0] + (dx / L) * 16}" cy="${h[1] + (dy / L) * 16}" r="8" fill="#F2C14E" stroke="#FFF3C4" stroke-width="2.5"/>`;
      })()
    : '';
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
    ${w}${f}<circle cx="${h[0]}" cy="${h[1]}" r="14" fill="${INK}"/>`;
}

function eye(cx, cy, kind, blink) {
  const g = `fill="${NEON}"`;
  if (blink) return `<path d="M${cx - 12} ${cy + 2} Q${cx} ${cy + 8} ${cx + 12} ${cy + 2}" fill="none" stroke="${NEON}" stroke-width="5" stroke-linecap="round"/>`;
  switch (kind) {
    case 'shock':
      return `<circle cx="${cx}" cy="${cy}" r="15" ${g}/><circle cx="${cx}" cy="${cy}" r="6" fill="${INK}"/>`;
    case 'sad': // droopy lid slanting down toward the outside
      return `<ellipse cx="${cx}" cy="${cy + 2}" rx="12" ry="13" ${g}/>
        <path d="M${cx - 16} ${cy - 14} L${cx + 16} ${cy - 14} L${cx + 16} ${cy + (cx < 200 ? -6 : 4)} L${cx - 16} ${cy + (cx < 200 ? 4 : -6)} Z" fill="${INK}"/>`;
    case 'determined': // angry brow lid slanting down toward the centre
      return `<ellipse cx="${cx}" cy="${cy + 3}" rx="12" ry="12" ${g}/>
        <path d="M${cx - 16} ${cy - 14} L${cx + 16} ${cy - 14} L${cx + 16} ${cy + (cx < 200 ? 4 : -6)} L${cx - 16} ${cy + (cx < 200 ? -6 : 4)} Z" fill="${INK}"/>`;
    case 'happy': // upside-down U
      return `<path d="M${cx - 12} ${cy + 5} Q${cx} ${cy - 14} ${cx + 12} ${cy + 5}" fill="none" stroke="${NEON}" stroke-width="6" stroke-linecap="round"/>`;
    case 'smug': // half-lidded, flat lid
      return `<ellipse cx="${cx}" cy="${cy + 3}" rx="12" ry="12" ${g}/>
        <rect x="${cx - 16}" y="${cy - 14}" width="32" height="14" fill="${INK}"/>
        <path d="M${cx - 13} ${cy} h26" stroke="${NEON}" stroke-width="3" stroke-linecap="round"/>`;
    default:
      return `<ellipse cx="${cx}" cy="${cy}" rx="11" ry="14" ${g}/><circle cx="${cx + 3}" cy="${cy - 4}" r="3.2" fill="${INK}" opacity=".55"/>`;
  }
}

function mouth(kind, talk) {
  const st = `fill="none" stroke="${NEON}" stroke-width="5" stroke-linecap="round"`;
  if (talk != null && talk > 0.05) {
    const h = 4 + talk * 16;
    return `<path d="M188 172 Q200 ${172 + 3} 212 172 Q210 ${172 + h} 200 ${172 + h} Q190 ${172 + h} 188 172 Z" fill="${NEON}"/>`;
  }
  switch (kind) {
    case 'sad': return `<path d="M188 180 Q200 168 212 180" ${st}/>`;
    case 'shock': return `<ellipse cx="200" cy="178" rx="6" ry="8" fill="${NEON}"/>`;
    case 'determined': return `<path d="M190 176 h20" ${st}/>`;
    case 'happy': return `<path d="M184 168 Q200 170 216 168 Q213 190 200 190 Q187 190 184 168 Z" fill="${NEON}"/>`;
    case 'smug': return `<path d="M190 176 Q204 180 214 168" ${st}/>`;
    default: return `<path d="M188 172 Q200 182 212 172" ${st}/>`;
  }
}

function headSVG(face, blink, talk, tilt, drop) {
  return `<g transform="translate(0 ${drop}) rotate(${tilt} 200 170) translate(200 172) scale(1.22) translate(-200 -172)" filter="url(#rim)">
    <!-- spiky hair -->
    <path d="M146 128 L150 70 L170 104 L178 44 L196 96 L212 48 L222 98 L246 64 L254 128 Z" fill="${INK}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="200" cy="150" r="58" fill="${INK}"/>
    ${eye(180, 146, face, blink)}${eye(220, 146, face, blink)}
    ${mouth(face, talk)}
  </g>`;
}

function bodySVG(o, outfit) {
  const hoodieExtras = `
    <path d="M160 214 Q200 252 240 214" fill="none" stroke="${o.topShade}" stroke-width="10" stroke-linecap="round"/>
    <path d="M190 236 v38 M210 236 v38" stroke="${o.accent}" stroke-width="4" stroke-linecap="round"/>
    <rect x="172" y="318" width="56" height="30" rx="8" fill="${o.topShade}"/>`;
  const suitExtras = `
    <path d="M182 214 L200 268 L218 214 Z" fill="${o.accent}"/>
    <path d="M182 214 L200 268 L190 300 M218 214 L200 268 L210 300" fill="none" stroke="${o.topShade}" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="200" cy="318" r="4" fill="${o.topShade}"/>`;
  return `
    <!-- legs -->
    <rect x="166" y="380" width="28" height="170" rx="8" fill="${o.pants}"/>
    <rect x="206" y="380" width="28" height="170" rx="8" fill="${o.pants}"/>
    <ellipse cx="172" cy="556" rx="26" ry="13" fill="${o.shoes}"/>
    <ellipse cx="228" cy="556" rx="26" ry="13" fill="${o.shoes}"/>
    <!-- torso -->
    <path d="M160 212 Q200 202 240 212 Q256 216 258 236 L262 390 Q200 400 138 390 L142 236 Q144 216 160 212 Z" fill="${o.top}"/>
    ${outfit === 'suit' ? suitExtras : hoodieExtras}`;
}

function phoneSVG() {
  return `<g transform="translate(214 262) rotate(-10)">
    <rect x="-22" y="-40" width="44" height="80" rx="9" fill="${INK}" stroke="#2A2D33" stroke-width="3"/>
    <rect x="-16" y="-32" width="32" height="7" rx="3.5" fill="${NEON}"/>
    <rect x="-16" y="-20" width="24" height="5" rx="2.5" fill="#2E4A36"/>
    <rect x="-16" y="-10" width="28" height="5" rx="2.5" fill="#2E4A36"/>
  </g>`;
}

function stickmanSVG({ outfit = 'suit', pose = 'idle', face = 'neutral', blink = false, talk = null, tilt = 0, shadow = true, crop = null } = {}) {
  const o = OUTFITS[outfit] || OUTFITS.suit;
  const P = POSES[pose] || POSES.idle;
  const watch = outfit === 'suit';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${crop === 'head' ? '110 20 180 200' : '0 0 400 640'}" width="100%" height="100%">
    <defs><filter id="rim" x="-30%" y="-30%" width="160%" height="160%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="2" result="d"/>
      <feFlood flood-color="${NEON}" flood-opacity=".55"/><feComposite in2="d" operator="in" result="e"/>
      <feGaussianBlur in="e" stdDeviation="4" result="g"/>
      <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    ${shadow ? `<ellipse cx="200" cy="570" rx="90" ry="14" fill="#000" opacity=".22"/>` : ''}
    ${bodySVG(o, outfit)}
    ${armSVG(P.L, o.top, P.fingerL, false)}
    ${headSVG(face, blink, talk, tilt, P.headDrop || 0)}
    ${P.phone ? phoneSVG() : ''}
    ${armSVG(P.R, o.top, P.fingerR, watch)}
  </svg>`;
}

module.exports = { stickmanSVG, POSES: Object.keys(POSES), FACES: ['neutral', 'sad', 'shock', 'determined', 'happy', 'smug'], NEON, INK };
