const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
test('mobile package includes production authentication and excludes QA fixtures / secrets',()=>{
 const files=fs.readdirSync(path.join(root,'www'));
 assert(!files.some(x=>/qa|test|supabase|\.sql/.test(x)));
 const html=fs.readFileSync(path.join(root,'www/index.html'),'utf8');
 assert(html.includes('/auth/v1/token'));assert(!html.includes('qaXP'));assert(!html.includes('nvapi-'));
 assert(html.includes('native.js'));assert(html.includes('if(window.BukiNative)return;'));
});
test('native shell bundles local content, keeps HTTPS and enables native authenticated HTTP',()=>{
 const config=require('../capacitor.config.json');
 assert.equal(config.webDir,'www');assert(!config.server.url);assert(!config.server.cleartext);assert(!config.server.allowNavigation);
 assert.equal(config.android.allowMixedContent,false);assert.equal(config.plugins.CapacitorHttp.enabled,true);
});
test('native microphone declarations exist and Android backups exclude sessions',()=>{
 const android=path.join(root,'android/app/src/main/AndroidManifest.xml');
 if(fs.existsSync(android)){const s=fs.readFileSync(android,'utf8');assert(s.includes('android.permission.RECORD_AUDIO'));assert(s.includes('android:allowBackup="false"'));}
 const ios=path.join(root,'ios/App/App/Info.plist');
 if(fs.existsSync(ios))assert(fs.readFileSync(ios,'utf8').includes('NSMicrophoneUsageDescription'));
});
