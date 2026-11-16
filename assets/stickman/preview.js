// Renders stickman-sheet.png: outfits, poses and expressions on light + dark
const { chromium } = require('playwright');
const path = require('path');
const { stickmanSVG, FACES } = require('./stickman');

const card = (opts, label, bg, fg = '#9BA3AE', w = 200, h = 300) =>
  `<div style="background:${bg};border-radius:16px;padding:8px 0 10px;text-align:center">
     <div style="width:${w}px;height:${h}px;margin:auto">${stickmanSVG(opts)}</div>
     <div style="font:600 13px system-ui;color:${fg};letter-spacing:.06em">${label}</div></div>`;

const head = (face, bg, fg) =>
  `<div style="text-align:center"><div style="width:110px;height:122px;margin:auto">${stickmanSVG({ face, shadow: false, crop: 'head' })}</div>
     <div style="font:500 13px system-ui;color:${fg}">${face}</div></div>`;

(async () => {
  const night = 'radial-gradient(circle at 50% 30%,#18241C,#0C0F12 75%)';
  const html = `<html><body style="margin:0;background:#07090B;padding:20px;font-family:system-ui">
   <div style="display:grid;grid-template-columns:repeat(5,200px);gap:12px">
     ${card({ outfit: 'hoodie', pose: 'slump', face: 'sad' }, 'BEFORE · broke', '#D7DAE0', '#55606B')}
     ${card({ outfit: 'suit', pose: 'hips', face: 'smug' }, 'AFTER · night', night)}
     ${card({ outfit: 'suit', pose: 'pointLeft', face: 'neutral', talk: 0.8 }, 'point at card', night)}
     ${card({ outfit: 'suit', pose: 'thinking', face: 'determined' }, 'thinking', night)}
     ${card({ outfit: 'suit', pose: 'celebrate', face: 'happy' }, 'celebrate', night)}
     ${card({ outfit: 'hoodie', pose: 'shrug', face: 'shock' }, 'shock / shrug', night)}
     ${card({ outfit: 'suit', pose: 'pointUp', face: 'happy', talk: 0.5 }, 'point up', night)}
     ${card({ outfit: 'suit', pose: 'phone', face: 'smug' }, 'phone (CTA)', night)}
     ${card({ outfit: 'hoodie', pose: 'idle', face: 'neutral', blink: true }, 'blink', night)}
     ${card({ outfit: 'suit', pose: 'idle', face: 'neutral', talk: 1 }, 'talking', night)}
   </div>
   <div style="display:flex;gap:18px;justify-content:center;margin-top:16px;background:#fff;border-radius:16px;padding:14px">
     ${FACES.map((f) => head(f, '#fff', '#333')).join('')}</div>
   <div style="display:flex;gap:18px;justify-content:center;margin-top:12px;background:#121A14;border-radius:16px;padding:14px">
     ${FACES.map((f) => head(f, '#121A14', '#9BA3AE')).join('')}</div>
  </body></html>`;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: 1 });
  await p.setContent(html);
  await p.screenshot({ path: path.join(__dirname, 'stickman-sheet.png'), fullPage: true });
  await b.close();
})();
