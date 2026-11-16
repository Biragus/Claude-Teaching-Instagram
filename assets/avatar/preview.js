// Renders a contact sheet of avatar poses/expressions to avatar-sheet.png
const { chromium } = require('playwright');
const path = require('path');
const { avatarSVG } = require('./avatar');

const looks = [
  ['idle', 'open', 'neutral', 'smile', 'idle · smile'],
  ['pointUp', 'open', 'raised', 'talkB', 'point up · talking'],
  ['pointLeft', 'lookLeft', 'neutral', 'talkA', 'point at card'],
  ['thinking', 'lookUp', 'skeptical', 'closed', 'thinking'],
  ['thumbsUp', 'wink', 'neutral', 'grin', 'thumbs up · wink'],
  ['shrug', 'open', 'raised', 'O', 'shrug · wow'],
  ['celebrate', 'happy', 'raised', 'grin', 'celebrate'],
  ['phone', 'open', 'neutral', 'smile', 'phone (CTA)'],
];

(async () => {
  const cells = looks
    .map(([pose, eyes, brows, mouth, label]) =>
      `<div class="c"><div class="a">${avatarSVG({ pose, eyes, brows, mouth })}</div><p>${label}</p></div>`)
    .join('');
  const html = `<html><body style="margin:0;background:#06080A;font-family:system-ui;color:#9BA3AE">
    <div style="display:grid;grid-template-columns:repeat(4,360px);gap:8px;padding:16px">${cells}</div>
    <style>.a{width:360px;height:405px}.c{background:radial-gradient(circle at 50% 40%,#0f1a12,#06080A 70%);border:1px solid #16201A;border-radius:12px}p{text-align:center;margin:0 0 10px;font-size:14px}</style>
  </body></html>`;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1500, height: 900 }, deviceScaleFactor: 1 });
  await p.setContent(html);
  await p.screenshot({ path: path.join(__dirname, process.argv[2] || 'avatar-sheet.png'), fullPage: true });
  await b.close();
})();
