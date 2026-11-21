/** Dependency-free palette check: node scripts/audit-palettes.mjs
 * Reads the light UI tokens actually used by styles.css, including high contrast.
 * Simulates Machado et al. (2009), severity 1, in linear sRGB. Not a user test.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const modes = ['none', 'protanopia', 'deuteranopia', 'tritanopia'];
const matrices = {
  protanopia: [[.152286,1.052583,-.204868],[.114503,.786281,.099216],[-.003882,-.048116,1.051998]],
  deuteranopia: [[.367322,.860646,-.227968],[.280085,.672501,.047413],[-.011820,.042940,.968881]],
  tritanopia: [[1.255528,-.076749,-.178779],[-.078411,.930809,.147602],[.004733,.691367,.303900]],
};
const clamp = x => Math.max(0, Math.min(1, x));
function linear(value) {
  const [L, C, h] = value.match(/[\d.]+/g).map(Number);
  const a=C*Math.cos(h*Math.PI/180), b=C*Math.sin(h*Math.PI/180);
  const l=(L+.3963377774*a+.2158037573*b)**3;
  const m=(L-.1055613458*a-.0638541728*b)**3;
  const s=(L-.0894841775*a-1.291485548*b)**3;
  return [4.0767416621*l-3.3077115913*m+.2309699292*s,-1.2684380046*l+2.6097574011*m-.3413193965*s,-.0041960863*l-.7034186147*m+1.707614701*s].map(clamp);
}
function palette(mode, highContrast, source=css, dark=false) {
  const vars = {};
  for (const [, selector, body] of source.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors=selector.trim().split(',').map(s=>s.trim());
    if (!(dark && (selectors.includes('.dark') || selectors.includes('html.dark') || selectors.includes(`html.dark[data-color-vision="${mode}"]`) || (highContrast && selectors.includes('html.dark[data-high-contrast="true"]')))) && !selectors.includes(':root') && !selectors.includes(`html[data-color-vision="${mode}"]`) && !(highContrast && selectors.includes('html[data-high-contrast="true"]'))) continue;
    for (const [,name,value] of body.matchAll(/--([\w-]+):\s*([^;]+);/g)) vars[name]=value;
  }
  function get(name) {
    assert.ok(vars[name], `Missing token ${name}`);
    const ref=vars[name].match(/^var\(--([\w-]+)\)$/);
    return ref ? get(ref[1]) : linear(vars[name]);
  }
  return get;
}
const luminance = c => c[0]*.2126+c[1]*.7152+c[2]*.0722;
function contrast(a,b) {const x=luminance(a), y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
function simulate(c, mode) {return matrices[mode] ? matrices[mode].map(row=>clamp(row.reduce((n,v,i)=>n+v*c[i],0))) : c;}
function hex(c) {return '#'+c.map(x=>Math.round(255*(x<=.0031308?12.92*x:1.055*x**(1/2.4)-.055)).toString(16).padStart(2,'0')).join('');}
function lab([r,g,b]) {
  const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b), m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b), s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
  return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s];
}
const distance=(a,b)=>Math.hypot(...lab(a).map((v,i)=>v-lab(b)[i]));
assert.ok(Math.abs(contrast([0,0,0],[1,1,1])-21)<1e-9);
const pairs = [
 ['foreground','background',4.5],['foreground','card',4.5],['card-foreground','card',4.5],['popover-foreground','popover',4.5],
 ['muted-foreground','background',4.5],['muted-foreground','card',4.5],['muted-foreground','scene',4.5],['muted-foreground','review-surface',4.5],['muted-foreground','admin-surface',4.5],
 ['primary','background',4.5],['primary','scene',4.5],['primary-foreground','primary',4.5],['warm-accent','background',4.5],
 ['review-ink','review-surface',4.5],['admin-ink','admin-surface',4.5],['destructive','background',4.5],['destructive-foreground','destructive',4.5],
 ['input','label-background',3],['input','background',3],['accessibility-focus','background',3],['accessibility-focus','card',3],
 ...['critical','low','normal'].map(s=>['stock-'+s,'card',3]),
];
const results=[];
for(const dark of [false,true]) for(const mode of modes) for(const highContrast of [false,true]) {
 const get=palette(mode, highContrast, css, dark);
 const checks=pairs.map(([fg,bg,min])=>({fg,bg,min,ratio:contrast(get(fg),get(bg))}));
 const failed=checks.filter(c=>c.ratio<c.min);
 const stock=['critical','low','normal'].map(s=>get('stock-'+s));
 const perceived=stock.map(c=>simulate(c,mode));
 const distances=[[0,1],[0,2],[1,2]].map(([a,b])=>distance(perceived[a],perceived[b]));
 results.push({mode,highContrast,dark,checks,stock:stock.map(hex),simulated:perceived.map(hex),distances});
 assert.equal(failed.length,0,JSON.stringify({mode,highContrast,dark,failed},null,2));
 // Project regression guard, NOT a WCAG/perceptual certification threshold.
 if(mode!=='none') assert.ok(Math.min(...distances)>.08,`Similar simulated stock colors in ${mode}`);
 console.log(`${dark?'dark ':'light '}${mode}${highContrast?' + high contrast':''}: ${checks.length} contrast checks passed; simulated stock distances ${distances.map(x=>x.toFixed(3)).join(', ')}`);
}
writeFileSync(new URL('../docs/palette-audit.json',import.meta.url),JSON.stringify({method:'WCAG relative luminance; Machado 2009 severity 1 in linear sRGB; OKLab distance is only a regression heuristic',results},null,2)+'\n');
// Reproducible swatches, not generated imagery or screenshots of actual screens.
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="650" viewBox="0 0 1000 650"><rect width="1000" height="650" fill="#faf8f0"/><g font-family="sans-serif" fill="#202a23"><text x="30" y="38" font-size="24" font-weight="700">Gremlib · Paletas de stock</text><text x="30" y="65" font-size="14">Arriba: colores de interfaz. Abajo: simulación Machado (2009), severidad 1.</text>';
for(const [i,r] of results.filter(r=>!r.highContrast && !r.dark).entries()) {
 const x=30+(i%2)*490,y=100+Math.floor(i/2)*240;
 svg+=`<text x="${x}" y="${y}" font-size="20" font-weight="700">${r.mode==='none'?'Sin adaptación':r.mode}</text>`;
 for(const [j,label] of ['Crítico · 0–5','Bajo · 6–10','Normal · 11+'].entries()) {
  const sx=x+j*150;
  svg+=`<text x="${sx}" y="${y+29}" font-size="14">${label}</text>`;
  for(const [k,color] of [r.stock[j],r.simulated[j]].entries()) svg+=`<rect x="${sx}" y="${y+42+k*68}" width="135" height="40" rx="6" fill="${color}"/><text x="${sx}" y="${y+98+k*68}" font-size="13">${color}</text>`;
 }
}
svg+='<text x="30" y="608" font-size="14">La simulación no sustituye pruebas con personas. Sin adaptación: ambas filas son iguales.</text><text x="30" y="632" font-size="14">La app añade octágono / triángulo / círculo, etiqueta y unidades en todos los modos.</text></g></svg>';
writeFileSync(new URL('../docs/paletas-stock.svg',import.meta.url),svg);
if (process.argv[2]) {
 const before=readFileSync(process.argv[2],'utf8');
 for(const mode of modes) {
  const get=palette(mode,false,before);
  const colors=['destructive','warm-accent','primary'].map(t=>simulate(get(t),mode));
  console.log(`Baseline ${mode}: simulated critical/low OKLab distance ${distance(colors[0],colors[1]).toFixed(3)}; colors ${colors.map(hex).join(', ')}`);
 }
}
