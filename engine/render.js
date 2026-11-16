// Frame-accurate reel renderer.
// usage: node engine/render.js <reelDir> [--preview t1,t2,...] [--from s --to s]
//
// <reelDir>/scene.html must define window.DURATION, window.FPS, window.renderFrame(t)
// and window.SFX = [{ t, file, vol, dur? }]. Data files in <reelDir>/audio
// (words.json, env.json) are injected as window.WORDS / window.ENV.
// Output: <reelDir>/out/<name>.mp4 (voiceover + SFX mixed).
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const reelDir = path.resolve(process.argv[2]);
const args = process.argv.slice(3);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const outDir = path.join(reelDir, 'out');
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const words = JSON.parse(fs.readFileSync(path.join(reelDir, 'audio/words.json'))).words;
  const env = JSON.parse(fs.readFileSync(path.join(reelDir, 'audio/env.json')));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.addInitScript(({ words, env }) => { window.WORDS = words; window.ENV = env; }, { words, env });
  page.on('pageerror', (e) => { console.error('PAGE ERROR', e); process.exit(1); });
  await page.goto('file://' + path.join(reelDir, 'scene.html'));
  await page.evaluate(() => document.fonts.ready);
  const { DURATION, FPS, SFX, NAME } = await page.evaluate(() => ({ DURATION: window.DURATION, FPS: window.FPS, SFX: window.SFX, NAME: window.NAME || 'reel' }));

  // --- preview stills -------------------------------------------------------
  const prev = opt('--preview');
  if (prev) {
    for (const t of prev.split(',').map(Number)) {
      await page.evaluate((t) => window.renderFrame(t), t);
      await page.screenshot({ path: path.join(outDir, `still_${String(t).padStart(5, '0')}.png`) });
    }
    await browser.close();
    console.log('stills written');
    return;
  }

  // --- video frames → ffmpeg ------------------------------------------------
  const from = Number(opt('--from') || 0), to = Number(opt('--to') || DURATION);
  const silent = path.join(outDir, `${NAME}_video.mp4`);
  const ff = args.includes('--mix-only') ? null : spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n0 = args.includes('--mix-only') ? 0 : Math.round(from * FPS), n1 = args.includes('--mix-only') ? 0 : Math.round(to * FPS);
  const t0 = Date.now();
  for (let f = n0; f < n1; f++) {
    await page.evaluate((t) => window.renderFrame(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 60 === 0) process.stdout.write(`\rframe ${f}/${n1}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  if (ff) { ff.stdin.end(); await new Promise((r) => ff.on('close', r)); }
  await browser.close();
  console.log('\nvideo frames done');

  // --- audio mix: VO + SFX ---------------------------------------------------
  const inputs = ['-i', path.join(reelDir, 'audio/vo.mp3')];
  const chains = ['[1:a]aresample=48000,volume=1.0[vo]'];
  const labels = ['[vo]'];
  SFX.forEach((s, i) => {
    inputs.push('-i', path.join(reelDir, 'audio/sfx', s.file));
    const ms = Math.max(0, Math.round((s.t - from) * 1000));
    const trim = s.dur ? `atrim=0:${s.dur},afade=t=out:st=${Math.max(0, s.dur - 0.15)}:d=0.15,` : '';
    chains.push(`[${i + 2}:a]aresample=48000,${trim}volume=${s.vol},adelay=${ms}|${ms}[s${i}]`);
    labels.push(`[s${i}]`);
  });
  const dur = to - from;
  const filter = chains.join(';') + `;${labels.join('')}amix=inputs=${labels.length}:normalize=0:duration=longest,apad,` +
    `atrim=0:${dur},alimiter=limit=0.9,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[mix]`;
  const final = path.join(outDir, `${NAME}.mp4`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', silent, ...inputs, '-filter_complex', filter,
    '-map', '0:v', '-map', '[mix]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', final]);
  console.log('wrote', final);
})();
