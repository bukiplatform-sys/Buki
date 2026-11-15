const fs=require('node:fs'),path=require('node:path');
const read=n=>fs.readFileSync(path.join(__dirname,n),'utf8');
let html=read('base-v2.html'),plus=read('buki-plus.js');
function replaceOnce(a,b){if(!html.includes(a))throw Error('Missing build target: '+a.slice(0,80));html=html.replace(a,b);}
// Keep previously delivered HTML self-contained.
replaceOnce('<body>', '<body><a class="studio-skip" href="#app">İçeriğe geç / Skip to content</a>');
replaceOnce('<div id="app">', '<div id="app" tabindex="-1">');
replaceOnce('app.innerHTML=h;localize(app)', 'app.innerHTML=h;localize(app);window.BukiDesign?.afterRender()');
replaceOnce('<script>','<script>\n'+read('level-engine.js')+'\n'+read('learning-engine.js')+'\n'+read('journey-engine.js')+'\n');
replaceOnce('</style></head>',read('courses.css')+'\n'+read('learning-ui.css')+'\n'+read('polish.css')+'\n'+read('journey.css')+'\n'+read('studio.css')+'\n'+read('support.css')+'\n'+read('world.css')+'\n'+read('adventure.css')+'\n</style><link rel="manifest" href="./manifest.webmanifest"><link rel="apple-touch-icon" href="./icon-192.png"><meta name="theme-color" content="#214f3e"></head>');
replaceOnce('<header>', '<div class="brand-line"><div class="brand-word">buki<span>.</span></div><span class="brand-note">YOUR DAILY ENGLISH COMPANION</span></div><header>');
html=html.replaceAll('Buki 2.1','Buki 4.0');
// Restore the header's existing --cham feedback binding on every cosmetic avatar.
// The #mas selector keeps profile and leaderboard portraits in their own colours.
replaceOnce('<ellipse cx="32" cy="40" rx="23" ry="19"', '<ellipse class="b" cx="32" cy="40" rx="23" ry="19"');
replaceOnce("BAD='#ff9a62'", "BAD='#ff6b6b'");
// The existing leaderboard remains authoritative for lifetime points.
replaceOnce("return r.j||{}}\nasync function board()", "const j=r.j||{};if(j.me&&Number.isFinite(+j.me.points)&&key()){localStorage.setItem(key(),String(Math.max(get(),+j.me.points)));}return j}\nasync function board()");
replaceOnce('${e(me.nick)}</b> · ${me.points}', '${e(me.nick)}</b> <span class=level-badge>Level ${BukiLevels.rank(me.points).level}</span> · ${me.points}');
replaceOnce('${e(u.nick)}</span><b>${u.points}', '${e(u.nick)} <span class=level-badge>Level ${BukiLevels.rank(u.points).level}</span></span><b>${u.points}');
replaceOnce("window.BK={award,xp:get,board,settings,av}",`async function selectAvatar(avatar){if(avatar<0||avatar>=Math.min(12,BukiLevels.rank(get()).level))return false;const j=await top();if(!j.me?.nick)return false;const t=await token();if(!t)return false;const r=await post('/rest/v1/rpc/lb_profile',{n:j.me.nick,av:avatar},t);return r.ok&&!r.j?.error;}\nwindow.BK={award,xp:get,board,settings,av,refresh:top,selectAvatar}`);
replaceOnce('${av(me.av,44)}','<span class="reward-portrait frame-${[8,5,3,2].find(n=>BukiLevels.rank(me.points).level>=n)||1}">${av(me.av,44)}</span>');
replaceOnce('${av(u.av,30)}','<span class="reward-portrait frame-${[8,5,3,2].find(n=>BukiLevels.rank(u.points).level>=n)||1}">${av(u.av,30)}</span>');
replaceOnce('data-a="${i}">${av(i,56)}','data-a="${i}" ${i>=BukiLevels.rank(get()).level?"disabled":""} title="Level ${i+1}">${av(i,56)}');
replaceOnce("m.textContent='Kaydedildi ✅'", "m.textContent='Kaydedildi ✅';window.BukiAppearanceSaved?.(sel)");
replaceOnce('},20000)', '},1500)');
replaceOnce('<div class=card><button class=opt data-o>Çıkış yap</button>', '<div class=card><h2>Canlı destek / Support</h2><p>Yöneticiye yaz ve geçmiş sohbetlerini gör.</p><button class=opt data-support>Canlı desteği aç / Open support chat</button></div><div class=card><button class=opt data-o>Çıkış yap</button>');
replaceOnce("q('[data-o]').onclick=", "q('[data-support]').onclick=()=>{o.remove();window.BukiSupport?.();};\n q('[data-o]').onclick=");
// Same verified account may reopen cached public content offline; no API response is cached.
replaceOnce("if(r.ok)return keyv();", "if(r.ok){try{const s=sess(),u=JSON.parse(atob(s.a.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).sub;localStorage.removeItem('bukiOfflineAccess:'+u);}catch(e){}return keyv();}");
replaceOnce("function done(){gate.remove();", "function done(offline=false){if(!offline){try{const s=sess(),u=JSON.parse(atob(s.a.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).sub;localStorage.setItem('bukiOfflineAccess:'+u,String(Date.now()+7*864e5));}catch(e){}}gate.remove();");
replaceOnce("async function check(){\n view(", "function offlineAllowed(){try{const s=sess(),u=JSON.parse(atob(s.a.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).sub;return !!u&&+(localStorage.getItem('bukiOfflineAccess:'+u)||0)>Date.now();}catch(e){return false;}}\nasync function check(){\n if(!navigator.onLine&&offlineAllowed())return done(true);\n view(");
replaceOnce("view('<h1>🦎 Buki</h1><p>Bağlantı hatası", "if(offlineAllowed()&&!r.ok)return done(true);\n view('<h1>🦎 Buki</h1><p>Bağlantı hatası");
replaceOnce("const fin=()=>{if(finished)return;finished=true;", "const fin=()=>{if(finished)return;finished=true;window.BukiPracticeFinished?.();");
replaceOnce('<div id=hn></div><div id=fb></div></div>', '<div id=hn></div><div id=fb></div>${reportButton(q)}</div>');
replaceOnce('const r=sc/p.qs.length;', "window.BukiUnitStepComplete?.('reading');const r=sc/p.qs.length;");
replaceOnce('<h1>🛡️ Yönetici Paneli</h1>', '<h1>🛡️ Yönetici Paneli</h1><button class=opt data-reports>🚩 Soru bildirimleri</button>');
replaceOnce("const q=s=>o.querySelector(s);q('[data-c]').onclick=()=>o.remove();", "const q=s=>o.querySelector(s);q('[data-reports]').onclick=()=>window.BukiReportsAdmin(pw);q('[data-c]').onclick=()=>o.remove();");
// Independent course settings, available even without a nickname.
replaceOnce('<div class=card><button class=opt data-o>Çıkış yap</button>', '<div class=card id=courseSettings><h2>İngilizce bölümüm / My course</h2><p>A1, A2, B1 ve B2 ayrı çalışma alanlarıdır.</p><label for=profileCourse>Bölüm / Course</label><select id=profileCourse>${["A1","A2","B1","B2"].map(l=>`<option value="${l}" ${window.BukiCourses?.preferred()===l?"selected":""}>${l}</option>`).join("")}</select><button class=opt data-course-go>Bölümü kaydet ve aç / Save & open</button>${window.BukiCourses?BukiCourses.levelPanel():""}</div><div class=card><button class=opt data-o>Çıkış yap</button>');
replaceOnce("q('[data-o]').onclick=", "q('[data-course-go]').onclick=()=>{const level=q('#profileCourse').value;o.remove();BukiCourses.open(level);};\n q('[data-o]').onclick=");
// Registration: record the choice only against the successfully created account.
replaceOnce('<button class=opt data-a=go>${mode?', '${mode?`<label for=signupCourse>İngilizce bölümün / Your English course</label><select id=signupCourse><option value=A1>A1 · Başlangıç / Beginner</option><option value=A2>A2 · Temel / Elementary</option><option value=B1>B1 · Orta / Intermediate</option><option value=B2>B2 · Orta üstü / Upper intermediate</option></select>`:""}<button class=opt data-a=go>${mode?');
replaceOnce("if(keep(r))return check();", "if(keep(r)){if(mode){const level=q('#signupCourse').value;const user=JSON.parse(atob(sess().a.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).sub;localStorage.setItem('bukiSignupCourse',JSON.stringify({user,level}));}return check();}");
replaceOnce("api('/auth/v1/signup',{email:em,password:pw})", "api('/auth/v1/signup',{email:em,password:pw,data:{cefr:q('#signupCourse').value}})");
replaceOnce("const e=(r.j&&(r.j.msg", "if(mode&&r.ok&&r.j?.user?.id)localStorage.setItem('bukiSignupCourse',JSON.stringify({user:r.j.user.id,level:q('#signupCourse').value}));\n  const e=(r.j&&(r.j.msg");
replaceOnce('Kayıt tamamlanamadı: e-posta zaten kayıtlı olabilir, giriş yapmayı dene','E-postanı kontrol et. Onay bağlantısı geldiyse onaylayıp giriş yap; zaten hesabın varsa giriş ekranını kullan.');
// Central event rewards replace the two older answer-only award calls.
replaceOnce('window.BK&&BK.award(hinted?5:(ex?12:10));','');
replaceOnce('window.BK&&BK.award(sc*10);','');
// Existing lower-level practice screens use the active course arrays.
replaceOnce('Alıştırma (6 soru, şıklı)','Alıştırma (${gq(i).length} soru, şıklı)');
plus=plus.replaceAll("'bukiDraft:'+scope","'bukiDraft:'+draftScope()").replaceAll("'bukiMock:'+scope","'bukiMock:'+draftScope()");
plus=plus.replace('function listening(){const words=sh(W).slice(0,5);','function listening(selectedWords){const words=freshWords(5,selectedWords||W);');
plus=plus.replace('const w=words[i];if(!w)return plusRender',"const w=words[i];if(!w)window.BukiUnitStepComplete?.('listening');if(!w)return plusRender");
plus=plus.replace('function speaking(){const topic=sh(SPEAK_TOPICS)[0];','function speaking(chosenTopic){const topic=chosenTopic||sh(SPEAK_TOPICS)[0];');
plus=plus.replace('function writingNotebook(id){','function writingNotebook(id,chosenTopic){').replace("draft&&(!id||draft.id===id)?draft", "draft&&(!id||draft.id===id)&&(!chosenTopic||draft.topic===chosenTopic)?draft").replace('topic:sh(TOP)[0][1]','topic:chosenTopic||sh(TOP)[0][1]');
plus=plus.replaceAll('120–200','${courseConfig().min}–${courseConfig().max}');
// The target strings inside L() are ordinary strings: use a value expression there.
plus=plus.replaceAll("L('kelime · hedef: ${courseConfig().min}–${courseConfig().max}','words · target: ${courseConfig().min}–${courseConfig().max}')","L('kelime · hedef: ','words · target: ')+courseConfig().min+'–'+courseConfig().max");
plus=plus.replaceAll('Assess this B2 practice essay.','Assess this ${cefr} practice writing.');
plus=plus.replace('if(wordCount(entry.first)<40)','if(wordCount(entry.first)<Math.min(40,courseConfig().min))').replace("L('Önce en az 40 kelime yaz.','Write at least 40 words first.')","L('Önce en az ','First write at least ')+Math.min(40,courseConfig().min)+L(' kelime yaz.',' words.')");
plus=plus.replace('end:Date.now()+35*60e3','end:Date.now()+courseConfig().minutes*60e3');
plus=plus.replace("L('B2 deneme sınavı','B2 mock exam')","cefr+' '+L('deneme sınavı','mock exam')");
plus=plus.replace("L('35 dakika: 10 kelime, 10 gramer, 5 okuma sorusu ve ${courseConfig().min}–${courseConfig().max} kelimelik yazma görevi. Kelime soruları İngilizce–Türkçe anlam çalışması içerir.','35 minutes: 10 vocabulary, 10 grammar and 5 reading questions, plus a ${courseConfig().min}–${courseConfig().max} word writing task. Vocabulary questions include English–Turkish meaning practice.')", "L(`${courseConfig().minutes} dakika: 10 kelime, 10 gramer, 5 okuma sorusu ve ${courseConfig().min}–${courseConfig().max} kelimelik yazma görevi.`,`${courseConfig().minutes} minutes: 10 vocabulary, 10 grammar and 5 reading questions, plus ${courseConfig().min}–${courseConfig().max} words of writing.`)");
const speakingStart=plus.indexOf('function speaking('),speakingEnd=plus.indexOf('// Reading vocabulary');
let speaking=plus.slice(speakingStart,speakingEnd).replaceAll('90-seconds','courseConfig().speak-seconds').replaceAll('seconds=90','seconds=courseConfig().speak').replace("L('30 saniye hazırlan, sonra 90 saniye konuş. Kaydını dinleyip kendini değerlendir.','Prepare for 30 seconds, then speak for 90 seconds. Listen to your recording and assess yourself.')", "L(`30 saniye hazırlan, sonra ${courseConfig().speak} saniye konuş. Kaydını dinleyip kendini değerlendir.`,`Prepare for 30 seconds, then speak for ${courseConfig().speak} seconds. Listen and assess yourself.`)");
plus=plus.slice(0,speakingStart)+speaking+plus.slice(speakingEnd);
const start=html.indexOf('/* Personal learning workspace.'),end=html.indexOf('\nhub();',start);
if(start<0||end<0)throw Error('Could not locate integration boundary');
html=html.slice(0,start)+plus+'\n'+read('curriculum.js')+'\n'+read('course-ui.js')+'\n'+read('learning-content.js')+'\n'+read('learning-ui.js')+'\n'+read('dialogues.js')+'\n'+read('polish.js')+'\n'+read('expansion-content.js')+'\n'+read('stories.js')+'\n'+read('sentences.js')+'\n'+read('journey-ui.js')+'\n'+read('community-ui.js')+'\n'+read('offline-ui.js')+'\n'+read('studio-ui.js')+'\n'+read('support-ui.js')+'\n'+read('world-ui.js')+'\n'+read('ai-learning.js')+'\n'+read('adventure-content.js')+'\n'+read('adventure-ui.js')+'\n'+read('release-notes.js')+'\n'+html.slice(end);
html=html.replaceAll('${unitStates().filter(u=>u.passed).length}/4','${unitStates().filter(u=>u.passed).length}/${unitStates().length}');
html=html.replace('${q.o.map((o,k)=>`<button class=opt data-assess=${k}>${esc(o)}</button>`).join(\'\')}</div><p id=assessmentFeedback', '${q.o.map((o,k)=>`<button class=opt data-assess=${k}>${esc(o)}</button>`).join(\'\')}</div>${record?reportButton(q):\'\'}<p id=assessmentFeedback');
html=html.replaceAll('BUKI 3.0','BUKI 4.0').replaceAll('Upper-Int Kelime Bahçesi','${cefr} Kelime Bahçesi');
html=html.replaceAll('sh(W).slice(0,10)','freshWords(10)').replaceAll('sh(W).slice(0,20)','freshWords(20)');
html=html.replaceAll('Buki 4.0','Buki 5.3').replaceAll('BUKI 4.0','BUKI 5.3');
for(const name of ['sw.js','manifest.webmanifest','icon-192.png','icon-512.png'])if(fs.existsSync(path.join(__dirname,name)))fs.copyFileSync(path.join(__dirname,name),path.join(__dirname,'dist',name));
fs.writeFileSync(path.join(__dirname,'index.html'),html);fs.writeFileSync(path.join(__dirname,'dist/index.html'),html);
// Local UI fixture omits account-only network scripts; never ship this fixture.
let qa=html.replace(/<script>\s*\(\(\)=>\{\s*const SB=.*?<\/script>/gs,'').replace(/<div id=gate.*?<\/div><\/div>/s,'');
qa=qa.replace('<head>','<head><meta http-equiv="Content-Security-Policy" content="connect-src \'none\';">');
// Isolated test account API exercises rank changes without a production account.
const avatarSource=html.slice(html.indexOf('const BGc='),html.indexOf("const st=document.createElement('style')"));
qa=qa.replace('const RAW=',`${avatarSource}\nwindow.BK={av,xp:()=>+(localStorage.getItem('qaXP')||0),award:n=>localStorage.setItem('qaXP',String(+(localStorage.getItem('qaXP')||0)+n)),board:()=>{},settings:()=>{}};\nconst RAW=`);
fs.writeFileSync(path.join(__dirname,'dist/qa.html'),qa);
console.log('Built Buki 5.3 Support and offline assets');
