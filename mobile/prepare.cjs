const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const platform=process.argv[2];
if(!['android','ios'].includes(platform))throw Error('Use: node prepare.cjs android|ios');
const cap=path.join(__dirname,'node_modules/@capacitor/cli/bin/capacitor');
const run=(...args)=>execFileSync(process.execPath,[cap,...args],{cwd:__dirname,stdio:'inherit'});
if(!fs.existsSync(path.join(__dirname,platform)))run('add',platform);
run('sync',platform);
if(platform==='android'){
 const manifest=path.join(__dirname,'android/app/src/main/AndroidManifest.xml');
 let xml=fs.readFileSync(manifest,'utf8');
 if(!xml.includes('android.permission.RECORD_AUDIO'))xml=xml.replace('</manifest>','<uses-permission android:name="android.permission.RECORD_AUDIO" />\n</manifest>');
 xml=xml.replace('android:allowBackup="true"','android:allowBackup="false"');
 fs.writeFileSync(manifest,xml);
 const res=path.join(__dirname,'android/app/src/main/res');
 for(const folder of fs.readdirSync(res).filter(x=>x.startsWith('mipmap-')&&!x.includes('anydpi'))){
  for(const name of ['ic_launcher.png','ic_launcher_round.png','ic_launcher_foreground.png'])fs.copyFileSync(path.join(__dirname,'../icon-512.png'),path.join(res,folder,name));
 }
 // Android 8+ adaptive icon references the same branded foreground.
 for(const file of ['ic_launcher.xml','ic_launcher_round.xml']){
  const p=path.join(res,'mipmap-anydpi-v26',file);
  if(fs.existsSync(p))fs.writeFileSync(p,'<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@color/ic_launcher_background"/><foreground android:drawable="@mipmap/ic_launcher_foreground"/></adaptive-icon>');
 }
}else{
 const plist=path.join(__dirname,'ios/App/App/Info.plist');let xml=fs.readFileSync(plist,'utf8');
 if(!xml.includes('NSMicrophoneUsageDescription'))xml=xml.replace('</dict>','<key>NSMicrophoneUsageDescription</key><string>Konuşma alıştırmalarında sesini kaydedip dinleyebilmen için mikrofon kullanılır.</string>\n</dict>');
 fs.writeFileSync(plist,xml);
 if(process.platform==='darwin')execFileSync('sips',['-z','1024','1024',path.join(__dirname,'../icon-512.png'),'--out',path.join(__dirname,'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png')]);
}
