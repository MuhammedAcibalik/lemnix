// tools/check-deps-lite.mjs
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const ROOT  = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const JSON_OUT = process.argv.includes('--json');
const TIMEOUT_MS = 120000; // 2 dk

const SKIP = new Set(['node_modules','.git','.next','dist','build','out','coverage','.turbo','.yarn']);

function run(cmd, cwd) {
  return new Promise((resolve) => {
    exec(cmd, { cwd, timeout: TIMEOUT_MS, maxBuffer: 1024 * 1024 * 32 }, (err, stdout, stderr) => {
      resolve({ err, stdout: stdout?.toString() ?? '', stderr: stderr?.toString() ?? '' });
    });
  });
}

async function findPackages(dir, found = []) {
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return found; }
  if (entries.some(e => e.isFile() && e.name === 'package.json')) found.push(path.join(dir, 'package.json'));
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (SKIP.has(e.name)) continue;
    await findPackages(path.join(dir, e.name), found);
  }
  return found;
}

function safeParse(jsonStr) {
  try { return JSON.parse(jsonStr); } catch { return null; }
}

(async () => {
  console.log(`▶️ Başladı: ${ROOT}`);
  const pkgFiles = await findPackages(ROOT);
  if (pkgFiles.length === 0) {
    console.error('⛔ package.json bulunamadı.');
    process.exit(2);
  }

  const report = [];
  for (const p of pkgFiles) {
    const dir = path.dirname(p);
    process.stdout.write(`\n📦 Paket: ${dir}\n   npm ls kontrol ediliyor... `);
    const { stdout, err } = await run('npm ls --json --all --long', dir);
    const tree = safeParse(stdout) || {};
    const problems = Array.isArray(tree.problems) ? tree.problems : [];
    const entry = { dir, name: tree.name || path.basename(dir), problems };

    // duplicate versiyon kontrolü (özet)
    const dup = {};
    (function walk(n){
      if (!n || !n.dependencies) return;
      for (const [k,v] of Object.entries(n.dependencies)) {
        const ver = v?.version || 'UNKNOWN';
        dup[k] = dup[k] || new Set();
        dup[k].add(ver);
        walk(v);
      }
    })(tree);
    entry.duplicates = Object.entries(dup)
      .filter(([, set]) => set.size > 1)
      .map(([name, set]) => ({ name, versions: Array.from(set).sort() }));

    report.push(entry);
    console.log('bitti.');
  }

  if (JSON_OUT) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  // İnsan okunur çıktı
  console.log('\n=== 🔴 npm ls problems (unmet peer / invalid / extraneous) ===');
  const anyProb = report.some(r => r.problems.length);
  if (!anyProb) console.log('✅ Problem yok.');
  for (const r of report) {
    if (!r.problems.length) continue;
    console.log(`\n[${r.name}] ${r.dir}`);
    for (const line of r.problems) console.log('  - ' + line);
  }

  console.log('\n=== 🟡 Çift kurulu (duplicate) paketler ===');
  const anyDup = report.some(r => r.duplicates.length);
  if (!anyDup) console.log('✅ Duplicate yok.');
  for (const r of report) {
    for (const d of r.duplicates) {
      console.log(`\n${d.name}: ${d.versions.join(', ')}\n   - ${r.dir}`);
    }
  }

  console.log('\n✅ Bitti.');
})();
