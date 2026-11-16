const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
fs.mkdirSync(path.join(root,'dist'), {recursive:true});
execFileSync(process.execPath, [path.join(root,'build-v3.cjs')], {cwd:root,stdio:'inherit'});
const out = path.join(__dirname,'www');
fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});
// Deliberate allowlist: QA fixtures and server source must never enter a mobile app.
for(const name of ['index.html','icon-192.png','icon-512.png','manifest.webmanifest'])
  fs.copyFileSync(path.join(root,name),path.join(out,name));
require('esbuild').buildSync({entryPoints:[path.join(__dirname,'bridge.js')],bundle:true,format:'iife',target:'es2022',outfile:path.join(out,'native.js')});
let html=fs.readFileSync(path.join(out,'index.html'),'utf8');
html=html.replace('<head>','<head><script src="native.js"></script>');
html=html.replace('</head>',`<style>
html{overscroll-behavior-y:none}body{padding-bottom:max(24px,env(safe-area-inset-bottom))}
@media(max-width:700px){input,textarea,select{font-size:16px!important}button{touch-action:manipulation;min-height:44px}.world-chat{max-height:calc(100dvh - 170px - env(safe-area-inset-top))}}
</style></head>`);
fs.writeFileSync(path.join(out,'index.html'),html);
console.log('Packaged Buki mobile web assets (production only).');
