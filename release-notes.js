/* Historical features are grouped where old commits only recorded file uploads. */
(function(){
 const releases=[
 ['2026-11-15','Buki Expeditions',[
 ['A1, A2, B1 ve B2 için ayrı dedektif vakaları: tanıklara soru sorma, kanıt defteri ve kanıtla desteklenen sonuç.','Separate detective cases for A1–B2: witness questions, evidence notebooks and supported conclusions.'],
 ['Gezilebilir kasaba: kafe, istasyon, ev, dedektif bürosu ve kaçış kapısı. Karakterler son başarılı seçimi hatırlar; evde günlük tutulur.','Interactive town: café, station, home, detective bureau and escape door. Characters remember the last successful choice; home includes a diary.'],
 ['Dört kaçış odası: otel, tren, müze ve uzay istasyonu. Okuma, sesli ipucu, dil bilgisi ve üç haneli son kilit.','Four escape rooms: hotel, train, museum and space station. Reading, spoken clues, grammar and a three-digit final lock.'],
 ['Arkadaş meydan okuması: aynı beş soru, paylaşılabilir davet ve sonuç bağlantısı, konu bazında karşılaştırma. Resmî sıralamadan ayrı.','Friend challenges: five identical questions, invitation and return-result links, and topic comparisons. Separate from official rankings.'],
 ['Macera ilerlemesi mevcut hesap ve seviye kayıtlarına bağlandı. Ayarlara bu güncelleme geçmişi eklendi.','Adventure progress uses existing account and course records. Update history added to Settings.']]],
 ['2026-11-15','buki.AI portal',[
 ['Sohbetin açılışına 3D perspektif dönüşü, üç ışık halkası, parçacıklar ve maskot hareketi; kapanışına butona geri çekilme animasyonu eklendi.','Chat gained a perspective entrance, three light rings, particles and a mascot greeting, plus a return-to-button exit.'],
 ['Mobilde efektler hafifletildi. Hareket azaltma tercihleri korunuyor.','Mobile effects are lighter and reduced-motion preferences are respected.']]],
 ['2026-11-15','buki.AI · Reading & Writing',[
 ['Sohbet adı buki.AI olarak düzeltildi; çıkış butonuyla çakışması giderildi. Karşılama metni kısaltıldı.','Assistant renamed buki.AI; overlap with Sign out fixed. Greeting shortened.'],
 ['Reading metni, üç soru ve cevap açıklamaları seviyeye göre anlık AI üretimine bağlandı. Hazır okuma arşivi korundu.','Reading passages, three questions and explanations are generated for the selected level. Existing reading library retained.'],
 ['Writing konusu ve ilk/ikinci deneme geri bildirimi doğrudan NVIDIA bağlantısından alınır. Düzeltmeler, gerekçeler ve çalışma puanı yazıyla saklanır.','Writing topics and original/revised-draft feedback use NVIDIA directly. Corrections, reasons and practice scores are saved with the essay.'],
 ['Hatalı AI çıktı kontrolü, istek sınırı bildirimleri, hesap/seviye değişiminde eski yanıtların engellenmesi ve taslağı koruma eklendi.','Added AI output validation, rate-limit messages, protection against stale account/course responses and draft preservation.'],
 ['Fare işaretçisi mavi nokta oldu; yazı alanlarında metin imleci korundu.','Desktop cursor changed to a blue dot; text fields retain their text cursor.']]],
 ['2026-11-14','3D dünyalar ve AI sohbet',[
 ['A1 bahçesi, A2 adası, B1 kasabası ve B2 gökyüzü akademisi eklendi. 3D desteklenmeyen cihazlarda sade görünüm bulunur.','Added the A1 garden, A2 island, B1 town and B2 sky academy, with a simpler fallback where 3D is unavailable.'],
 ['Günlük küçük yolculuk, Buki aksesuarları, level kutlamaları ve ana sayfada AI sohbet eklendi.','Added the daily journey, Buki accessories, level celebrations and home-page AI chat.'],
 ['Açık ve koyu temada sohbet yazı kontrastı düzeltildi.','Fixed chat text contrast in light and dark themes.']]],
 ['2026-10-28','Canlı destek',[
 ['Ayarlardan açılan özel destek sohbeti ve Telegram üzerinden iki taraflı yönetici yanıtları eklendi. Sohbet geçmişi saklanır.','Added private support from Settings and two-way administrator replies through Telegram. Conversation history is retained.'],
 ['İlk sürümdeki 10 günlük otomatik silme kaldırıldı. Bağlantı bilgileri sunucu tarafında güvenli saklamaya taşındı.','Removed the initial ten-day automatic deletion. Connection credentials moved to secure server-side storage.']]],
 ['2026-10-21 / 27','Öğrenme platformunun temeli',[
 ['A1–B2 ayrı çalışma alanları, kayıt/ayarlardan seviye seçimi ve her bölüm için ayrı ilerleme.','Separate A1–B2 workspaces, course selection during signup/in Settings, and independent course progress.'],
 ['Kelime kartları, quiz, boşluk doldurma, eşleştirme ve sınavlar; gramer anlatımı ve alıştırmalar.','Vocabulary cards, quizzes, gap fills, matching and tests; grammar lessons and exercises.'],
 ['Collocation atölyesi, ifade düzeltme, cümle kurma, English in English ve gerçek hayat diyalogları.','Collocation workshop, expression correction, sentence building, English in English and everyday dialogues.'],
 ['Günlük plan, yanlış tekrarı, eksikler ekranı, hata kliniği, mini dersler, kalıcılık kontrolü ve çalışma takvimi.','Daily plan, mistake review, progress gaps, error clinic, mini lessons, retention checks and study calendar.'],
 ['Reading arşivi, okurken kelime kaydetme, writing defteri ve sürüm karşılaştırması, dinleme/dikte ve kayıt yapılabilen konuşma kartları.','Reading library, saved vocabulary, writing notebook and draft comparison, listening/dictation and speaking cards with recording.'],
 ['Sekiz üniteli bölüm haritaları, seçilebilir hikâyeler, seviye belirleme, zamanlı deneme ve sonuç raporları.','Eight-unit course maps, branching stories, placement, timed practice exams and results.'],
 ['XP/Level sistemi, isim yanında level gösteren sıralama, haftalık sıralama ve kişiselleştirilebilir profil.','XP/Level system, levels beside leaderboard names, weekly rankings and customizable profiles.'],
 ['Supabase ilerleme eşitleme, çevrimdışı çalışma ve ana ekrana kurulum desteği.','Supabase progress sync, offline study and home-screen installation support.'],
 ['Türkçe/İngilizce arayüz, tema ve hareket ayarları, yazı boyutu, sade mod, soru bildirimi ve bildirim takibi.','Turkish/English interface, themes and motion preferences, font size, focus mode, question reports and report tracking.'],
 ['Buki’nin doğru cevapta yeşil, yanlış cevapta kırmızı tepkisi korundu; kartlar ve ana sayfa tasarımı yenilendi.','Preserved Buki’s green/red answer feedback; refreshed cards and home-page design.']]]
 ];
 function show(){plusRender(backBar(L('Güncelleme notları','Update notes'))+`<div class="card"><span class=studio-kicker>BUKI · CHANGELOG</span><h1>${L('Buki’nin gelişim günlüğü','Buki’s development journal')}</h1><p>${L('En yeni değişiklikler üstte. Eski toplu yüklemeler, kesin sürüm tarihi bulunmadığında dönem başlığı altında birleştirildi.','Newest changes first. Older bulk uploads are grouped by period where exact release dates were not recorded.')}</p><div class=release-list>${releases.map(([date,title,items])=>`<article class=release-entry><time>${date}</time><h2>${esc(title)}</h2><ul>${items.map(x=>`<li>${esc(L(...x))}</li>`).join('')}</ul></article>`).join('')}</div></div>`,'release-notes');}
 const settings=studyPreferences;studyPreferences=function(){settings();app.insertAdjacentHTML('beforeend',`<div class=card><h2>${L('Buki’de neler yeni?','What’s new in Buki?')}</h2><p>${L('Yeni oyunları, geliştirmeleri ve geçmiş düzeltmeleri incele.','Explore new games, improvements and previous fixes.')}</p><button id=openReleaseNotes>${L('Güncelleme notları','Update notes')} ↗</button></div>`);document.getElementById('openReleaseNotes').onclick=show;};window.BukiStudyPreferences=studyPreferences;window.BukiReleaseNotes=show;
})();
