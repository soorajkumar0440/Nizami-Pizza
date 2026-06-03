import fs from 'fs';
import path from 'path';

const ROOT = path.join(import.meta.dirname, '..', 'src');
const SKIP = ['useScrollReveal.js', 'ImmersiveCards'];

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (/\.(jsx|tsx)$/.test(f)) out.push(p);
  }
  return out;
}

function stripMotionProps(s) {
  const props = [
    'initial',
    'animate',
    'exit',
    'whileInView',
    'whileHover',
    'whileTap',
    'viewport',
    'transition',
    'variants',
    'layoutId',
    'layout',
    'drag',
    'dragConstraints',
  ];
  for (const prop of props) {
    const re = new RegExp(`\\s+${prop}=\\{`, 'g');
    let m;
    while ((m = re.exec(s)) !== null) {
      const start = m.index;
      let i = m.index + m[0].length;
      let depth = 1;
      while (i < s.length && depth > 0) {
        if (s[i] === '{') depth++;
        if (s[i] === '}') depth--;
        i++;
      }
      s = s.slice(0, start) + s.slice(i);
      re.lastIndex = start;
    }
  }
  return s;
}

for (const file of walk(ROOT)) {
  if (SKIP.some((sk) => file.includes(sk))) continue;
  let s = fs.readFileSync(file, 'utf8');
  if (!s.includes('framer-motion') && !s.includes('motion.')) continue;
  const orig = s;

  s = s.replace(/import\s*\{[^}]*\}\s*from\s*['"]framer-motion['"];\s*\n/g, '');
  s = s.replace(/import\s+gsap[^;]*;\s*\n/g, '');
  s = s.replace(/import\s*\{[^}]*ScrollTrigger[^}]*\}\s*from\s*['"]gsap\/ScrollTrigger['"];\s*\n/g, '');
  s = s.replace(/gsap\.registerPlugin\([^)]*\);\s*\n/g, '');
  s = s.replace(/,\s*useScroll,\s*useTransform/g, '');
  s = s.replace(/useScroll,\s*useTransform,\s*/g, '');
  s = s.replace(/useScroll,\s*/g, '');
  s = s.replace(/useTransform,\s*/g, '');

  s = stripMotionProps(s);

  s = s.replace(/<AnimatePresence[^>]*>/g, '');
  s = s.replace(/<\/AnimatePresence>/g, '');
  s = s.replace(/<motion\.([a-zA-Z][a-zA-Z0-9]*)/g, '<$1');
  s = s.replace(/<\/motion\.([a-zA-Z][a-zA-Z0-9]*)>/g, '</$1>');

  s = s.replace(/\s+data-reveal(?:-[a-z-]+)?="[^"]*"/g, '');

  if (s.includes('<Fragment') && !/import\s*\{[^}]*Fragment/.test(s)) {
    s = s.replace(/import\s*\{([^}]+)\}\s*from\s*'react'/, (m, inner) => {
      if (inner.includes('Fragment')) return m;
      return `import { ${inner.trim()}, Fragment } from 'react'`;
    });
  }

  const scrollY = /const\s*\{\s*scrollYProgress\s*\}\s*=\s*useScroll\(\);?\s*\n/g;
  const scaleLine = /const\s+scale\s*=\s*useTransform\([^;]+;\s*\n/g;
  s = s.replace(scrollY, '');
  s = s.replace(scaleLine, '');

  if (s !== orig) {
    fs.writeFileSync(file, s);
    console.log('updated', path.relative(ROOT, file));
  }
}
