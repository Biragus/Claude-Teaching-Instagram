// Hand-drawn parametric 2D avatar (pure SVG, no AI generation).
// avatarSVG({ pose, eyes, brows, mouth, glow }) -> SVG string (viewBox 0 0 600 760)
//
// pose:  idle | pointUp | pointLeft | thinking | thumbsUp | shrug | celebrate | phone
// eyes:  open | blink | wink | happy | lookLeft | lookUp
// brows: neutral | raised | skeptical | focused
// mouth: smile | closed | talkA | talkB | O | grin

const C = {
  ink: '#101114',
  skin: '#EDB894',
  skinShade: '#D79C76',
  skinLine: '#A86C4A',
  hair: '#141418',
  hairHi: '#34343F',
  blazer: '#1E4FD8',
  blazerShade: '#163DAA',
  blazerHi: '#2C63F0',
  shirt: '#FFFFFF',
  shirtShade: '#DDE3EE',
  iris: '#5B3A21',
  neon: '#39FF14',
};

const SW = 5; // outline width

function hand(x, y, angle, type) {
  const s = `fill="${C.skin}" stroke="${C.ink}" stroke-width="${SW}" stroke-linejoin="round"`;
  const crease = `stroke="${C.skinLine}" stroke-width="3" stroke-linecap="round" fill="none"`;
  let g = '';
  if (type === 'point') {
    // slim index finger up, curled fingers as bumps, thumb across palm
    g = `<rect x="-17" y="-84" width="19" height="66" rx="9.5" ${s}/>
         <rect x="-26" y="-26" width="54" height="52" rx="20" ${s}/>
         <path d="M2 -24 q8 -8 13 0 q8 -8 13 4" ${crease}/>
         <path d="M-8 -2 q14 -6 24 4" ${crease}/>
         <rect x="-34" y="-10" width="18" height="34" rx="9" transform="rotate(-25 -25 7)" ${s}/>`;
  } else if (type === 'thumb') {
    // fist seen from the side with a fat thumb up
    g = `<rect x="-24" y="-74" width="24" height="54" rx="12" ${s}/>
         <rect x="-30" y="-28" width="62" height="56" rx="18" ${s}/>
         <path d="M0 -12 h26 M0 2 h26 M0 16 h22" ${crease}/>`;
  } else if (type === 'open') {
    g = [-28, -13, 2, 17]
      .map((fx, i) => `<rect x="${fx}" y="${-66 + (i === 0 || i === 3 ? 8 : 0)}" width="13" height="50" rx="6.5" ${s}/>`)
      .join('') +
      `<rect x="24" y="-30" width="13" height="38" rx="6.5" transform="rotate(35 30 -10)" ${s}/>
       <rect x="-32" y="-28" width="64" height="58" rx="24" ${s}/>
       <path d="M-14 4 q14 8 28 0" ${crease}/>`;
  } else { // fist
    g = `<rect x="-30" y="-28" width="60" height="56" rx="22" ${s}/>
         <path d="M-16 -26 v12 M0 -27 v12 M16 -26 v12" ${crease}/>
         <path d="M-22 6 q16 -8 30 2" ${crease}/>`;
  }
  return `<g transform="translate(${x} ${y}) rotate(${angle})">${g}</g>`;
}

function arm(sh, el, hd, handAngle, handType) {
  const d = `M${sh[0]} ${sh[1]} L${el[0]} ${el[1]} L${hd[0]} ${hd[1]}`;
  // cuff sits 34px back from the hand toward the elbow
  const dx = el[0] - hd[0], dy = el[1] - hd[1];
  const L = Math.hypot(dx, dy) || 1;
  const cx = hd[0] + (dx / L) * 34, cy = hd[1] + (dy / L) * 34;
  return `<g>
    <path d="${d}" fill="none" stroke="${C.ink}" stroke-width="${68 + SW * 2}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="${C.blazer}" stroke-width="68" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${cx}" cy="${cy}" r="27" fill="${C.shirt}" stroke="${C.ink}" stroke-width="${SW}"/>
    ${hand(hd[0], hd[1], handAngle, handType)}
  </g>`;
}

function phoneProp(x, y, angle) {
  return `<g transform="translate(${x} ${y}) rotate(${angle})">
    <rect x="-38" y="-72" width="76" height="140" rx="14" fill="${C.ink}" stroke="${C.ink}" stroke-width="${SW}"/>
    <rect x="-31" y="-62" width="62" height="118" rx="8" fill="#0B1A10"/>
    <rect x="-24" y="-50" width="48" height="10" rx="5" fill="${C.neon}"/>
    <rect x="-24" y="-32" width="36" height="7" rx="3.5" fill="#2E4A36"/>
    <rect x="-24" y="-20" width="42" height="7" rx="3.5" fill="#2E4A36"/>
  </g>`;
}

const POSES = {
  idle: { back: '', front: '' },
  pointUp: { front: arm([150, 485], [95, 600], [125, 405], -8, 'point') },
  pointLeft: { front: arm([150, 485], [70, 545], [30, 420], -38, 'point') },
  thinking: { front: arm([160, 495], [190, 625], [256, 430], -8, 'point'), afterHead: true },
  thumbsUp: { front: arm([450, 485], [535, 600], [492, 440], 8, 'thumb') },
  shrug: {
    front:
      arm([150, 485], [60, 560], [60, 470], -20, 'open') +
      arm([450, 485], [540, 560], [540, 470], 20, 'open'),
  },
  celebrate: {
    front:
      arm([150, 485], [70, 395], [108, 250], -10, 'fist') +
      arm([450, 485], [530, 395], [492, 250], 10, 'fist'),
  },
  phone: { front: '', phone: true },
};

function eyesSVG(type) {
  const eye = (cx, cy, look = [0, 0]) => `
    <ellipse cx="${cx}" cy="${cy}" rx="17" ry="12" fill="#fff" stroke="${C.ink}" stroke-width="3.5"/>
    <circle cx="${cx + look[0]}" cy="${cy + 1 + look[1]}" r="9" fill="${C.iris}"/>
    <circle cx="${cx + look[0]}" cy="${cy + 1 + look[1]}" r="4.5" fill="${C.ink}"/>
    <circle cx="${cx + 3 + look[0]}" cy="${cy - 2 + look[1]}" r="2.6" fill="#fff"/>
    <path d="M${cx - 19} ${cy - 3} Q${cx} ${cy - 18} ${cx + 19} ${cy - 3}" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`;
  const closed = (cx, cy) =>
    `<path d="M${cx - 17} ${cy} Q${cx} ${cy + 9} ${cx + 17} ${cy}" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`;
  const happy = (cx, cy) =>
    `<path d="M${cx - 16} ${cy + 4} Q${cx} ${cy - 12} ${cx + 16} ${cy + 4}" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`;
  const L = [265, 258], R = [335, 258];
  switch (type) {
    case 'blink': return closed(...L) + closed(...R);
    case 'wink': return eye(...L) + happy(...R);
    case 'happy': return happy(...L) + happy(...R);
    case 'lookLeft': return eye(...L, [-6, 0]) + eye(...R, [-6, 0]);
    case 'lookUp': return eye(...L, [-3, -4]) + eye(...R, [-3, -4]);
    default: return eye(...L) + eye(...R);
  }
}

function browsSVG(type) {
  let l = 0, r = 0, li = 0, ri = 0; // vertical offsets: outer / inner ends
  if (type === 'raised') { l = r = -9; li = ri = -9; }
  if (type === 'skeptical') { r = -12; ri = -8; li = 3; }
  if (type === 'focused') { li = ri = 6; }
  const s = `fill="none" stroke="${C.hair}" stroke-width="11" stroke-linecap="round"`;
  return `
    <path d="M240 ${238 + l} Q260 ${224 + (l + li) / 2} ${288} ${230 + li}" ${s}/>
    <path d="M312 ${230 + ri} Q340 ${224 + (r + ri) / 2} ${360} ${238 + r}" ${s}/>`;
}

function mouthSVG(type) {
  const line = `stroke="${C.ink}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"`;
  switch (type) {
    case 'closed':
      return `<path d="M283 334 Q300 338 317 334" fill="none" ${line}/>`;
    case 'talkA':
      return `<path d="M281 330 Q300 334 319 330 Q312 348 300 348 Q288 348 281 330 Z" fill="#5A1E1E" ${line}/>
              <path d="M288 342 Q300 338 312 342" fill="none" stroke="#E07A7A" stroke-width="5" stroke-linecap="round"/>`;
    case 'talkB':
      return `<path d="M276 328 Q300 334 324 328 Q318 362 300 362 Q282 362 276 328 Z" fill="#5A1E1E" ${line}/>
              <path d="M281 331 Q300 336 319 331 L317 338 Q300 342 283 338 Z" fill="#fff"/>
              <path d="M287 354 Q300 348 313 354" fill="none" stroke="#E07A7A" stroke-width="6" stroke-linecap="round"/>`;
    case 'O':
      return `<ellipse cx="300" cy="342" rx="13" ry="16" fill="#5A1E1E" ${line}/>`;
    case 'grin':
      return `<path d="M272 326 Q300 336 328 326 Q322 358 300 358 Q278 358 272 326 Z" fill="#fff" ${line}/>
              <path d="M276 336 Q300 342 324 336" fill="none" stroke="${C.ink}" stroke-width="2.5" opacity=".35"/>`;
    default: // smile
      return `<path d="M279 330 Q300 344 321 330" fill="none" ${line}/>
              <path d="M276 327 Q279 330 280 333 M324 327 Q321 330 320 333" fill="none" stroke="${C.skinLine}" stroke-width="3" stroke-linecap="round"/>`;
  }
}

function head(eyes, brows, mouth) {
  const o = `stroke="${C.ink}" stroke-width="${SW}" stroke-linejoin="round"`;
  return `
  <!-- ears -->
  <ellipse cx="221" cy="274" rx="15" ry="25" fill="${C.skin}" ${o}/>
  <ellipse cx="379" cy="274" rx="15" ry="25" fill="${C.skin}" ${o}/>
  <path d="M218 264 q8 10 0 20 M382 264 q-8 10 0 20" fill="none" stroke="${C.skinLine}" stroke-width="3" stroke-linecap="round"/>
  <!-- face -->
  <path d="M224 232 C222 160 378 160 376 232 C377 270 375 298 367 324 C354 362 330 384 300 386 C270 384 246 362 233 324 C225 298 223 270 224 232 Z" fill="${C.skin}" ${o}/>
  <!-- face shading (his left side) -->
  <path d="M352 210 C372 240 372 300 360 330 C348 360 328 378 306 384 C334 360 350 320 352 270 Z" fill="${C.skinShade}" opacity=".55"/>
  <!-- stubble -->
  <path d="M236 318 C248 358 272 380 300 382 C328 380 352 358 364 318 C350 346 328 356 300 356 C272 356 250 346 236 318 Z" fill="#3B2A20" opacity=".2"/>
  <path d="M276 318 Q300 310 324 318 Q300 324 276 318 Z" fill="#3B2A20" opacity=".22"/>
  <!-- hair: swept-back volume, higher hairline, short tapered sides -->
  <path d="M222 262 C204 224 202 168 226 138 C250 110 296 102 334 106 C376 110 404 134 402 174 C402 208 388 238 378 262 C376 240 370 222 360 214 C346 204 322 198 300 199 C276 200 254 206 242 216 C232 226 227 242 224 262 Z" fill="${C.hair}" ${o}/>
  <!-- volume highlight + back-swept strands -->
  <path d="M240 156 C262 124 316 112 360 126 C386 136 396 156 396 176 C380 148 344 134 304 136 C278 138 254 146 240 156 Z" fill="${C.hairHi}"/>
  <path d="M252 198 C262 168 300 146 352 140 M276 196 C288 172 320 158 372 158 M314 198 C326 182 352 172 390 180 M238 208 C234 180 248 158 280 144" fill="none" stroke="#50505E" stroke-width="3.5" stroke-linecap="round" opacity=".85"/>
  <!-- loose front strand -->
  <path d="M292 200 C288 186 296 174 310 170" fill="none" stroke="${C.hair}" stroke-width="5" stroke-linecap="round"/>
  <!-- short sides / sideburns -->
  <path d="M226 236 C224 250 226 268 230 282 L236 282 C234 266 234 250 236 236 Z M374 236 C376 250 374 268 370 282 L364 282 C366 266 366 250 364 236 Z" fill="${C.hair}"/>
  ${browsSVG(brows)}
  ${eyesSVG(eyes)}
  <!-- nose -->
  <path d="M302 266 Q298 290 290 302 Q299 310 312 303" fill="none" stroke="${C.skinLine}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  ${mouthSVG(mouth)}`;
}

function body() {
  const o = `stroke="${C.ink}" stroke-width="${SW}" stroke-linejoin="round"`;
  return `
  <!-- neck -->
  <path d="M268 340 L268 425 Q300 448 332 425 L332 340 Z" fill="${C.skinShade}" ${o}/>
  <!-- blazer -->
  <path d="M300 405 C250 408 190 425 140 455 C98 480 84 525 80 585 L72 770 L528 770 L520 585 C516 525 502 480 460 455 C410 425 350 408 300 405 Z" fill="${C.blazer}" ${o}/>
  <path d="M460 455 C502 480 516 525 520 585 L528 770 L470 770 C476 650 470 540 440 470 Z" fill="${C.blazerShade}"/>
  <!-- shirt V -->
  <path d="M258 412 L342 412 L330 520 L300 610 L270 520 Z" fill="${C.shirt}" ${o}/>
  <path d="M268 412 L300 445 L332 412" fill="${C.skinShade}" stroke="${C.ink}" stroke-width="3.5"/>
  <path d="M300 470 v120" stroke="${C.shirtShade}" stroke-width="4"/>
  <circle cx="300" cy="500" r="4" fill="${C.shirtShade}"/><circle cx="300" cy="550" r="4" fill="${C.shirtShade}"/>
  <!-- open collar -->
  <path d="M266 398 L240 446 L284 470 L300 440 Z" fill="${C.shirt}" ${o}/>
  <path d="M334 398 L360 446 L316 470 L300 440 Z" fill="${C.shirt}" ${o}/>
  <!-- lapels -->
  <path d="M244 420 L206 452 L232 472 L214 492 L300 655 L300 612 L268 520 L256 470 Z" fill="${C.blazerHi}" ${o}/>
  <path d="M356 420 L394 452 L368 472 L386 492 L300 655 L300 612 L332 520 L344 470 Z" fill="${C.blazerHi}" ${o}/>
  <!-- buttonhole + button -->
  <path d="M206 452 l14 -4" stroke="${C.ink}" stroke-width="3"/>
  <circle cx="300" cy="690" r="7" fill="${C.ink}"/>
  <!-- breast pocket + pocket square -->
  <path d="M388 572 L458 564" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>
  <path d="M392 572 L404 552 L418 566 L432 548 L446 562 L456 565 Z" fill="${C.shirt}" ${o}/>
  <!-- seam lines -->
  <path d="M140 455 C150 520 150 640 140 770 M460 455 C450 520 450 640 460 770" fill="none" stroke="${C.blazerShade}" stroke-width="4" opacity=".7"/>`;
}

function avatarSVG({ pose = 'idle', eyes = 'open', brows = 'neutral', mouth = 'smile', glow = true } = {}) {
  const P = POSES[pose] || POSES.idle;
  const front = P.front || '';
  const phone = P.phone
    ? arm([450, 485], [500, 640], [395, 560], -25, 'fist') + phoneProp(392, 500, -12) + hand(392, 556, -25, 'fist')
    : '';
  const inner = `
    ${body()}
    ${P.afterHead ? '' : front}
    ${head(eyes, brows, mouth)}
    ${P.afterHead ? front : ''}
    ${phone}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 60 640 720" width="100%" height="100%">
  <defs>
    <filter id="neonEdge" x="-20%" y="-20%" width="140%" height="140%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="fat"/>
      <feFlood flood-color="${C.neon}"/>
      <feComposite in2="fat" operator="in" result="edge"/>
      <feGaussianBlur in="edge" stdDeviation="9" result="glow"/>
      <feMerge><feMergeNode in="glow"/><feMergeNode in="edge"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <g ${glow ? 'filter="url(#neonEdge)"' : ''}>${inner}</g>
</svg>`;
}

module.exports = { avatarSVG, POSES: Object.keys(POSES), COLORS: C };
