"""Run on your own computer. Secrets are prompted, never saved or printed."""
import getpass,json,urllib.request,urllib.error,re

def main():
    token=getpass.getpass('BotFather bot token (gizli): ').strip()
    secret=getpass.getpass('Edge secret TELEGRAM_WEBHOOK_SECRET ile aynı değer (gizli): ').strip()
    project=input('Supabase proje adresi (https://....supabase.co): ').strip().rstrip('/')
    if not re.fullmatch(r'https://[a-z0-9-]+\.supabase\.co',project):raise ValueError('Geçersiz proje adresi')
    if not re.fullmatch(r'[A-Za-z0-9_-]{32,256}',secret):raise ValueError('Webhook secret 32–256 güvenli karakter olmalı')
    def api(method,body):
        req=urllib.request.Request('https://api.telegram.org/bot'+token+'/'+method,data=json.dumps(body).encode(),headers={'Content-Type':'application/json'})
        with urllib.request.urlopen(req,timeout=20) as response:data=json.load(response)
        if not data.get('ok'):raise RuntimeError('Telegram isteği başarısız')
        return data['result']
    url=project+'/functions/v1/buki-telegram'
    hook=api('getWebhookInfo',{})
    if hook.get('url') and hook['url']!=url:raise ValueError('Bu bot başka bir webhook kullanıyor. Buki için yeni bir bot oluştur.')
    if not hook.get('url'):
        updates=api('getUpdates',{'allowed_updates':['message'],'limit':50})
        pairs={(m['chat']['id'],m['from']['id']) for u in updates if (m:=u.get('message')) and m.get('text')=='/start' and m.get('chat',{}).get('type')=='private'}
        print('Bota /start gönderen özel sohbetlerin (CHAT_ID, ADMIN_ID) değerleri:')
        for pair in sorted(pairs):print(pair)
        if not pairs:print('Telegram’da kendi botunu açıp /start gönder, sonra bu aracı yeniden çalıştır.')
    chat=input('TELEGRAM_CHAT_ID: ').strip()
    admin=input('TELEGRAM_ADMIN_ID: ').strip()
    if not re.fullmatch(r'\d+',chat) or chat!=admin:raise ValueError('Bu kurulum tek yöneticiyle özel bot sohbeti içindir; iki ID aynı olmalı.')
    info=api('getChat',{'chat_id':chat})
    print('Edge secrets içinde TELEGRAM_CHAT_ID ve TELEGRAM_ADMIN_ID için bu ID değerlerini kaydetmiş olmalısın.')
    if input('Webhook bağlantısını etkinleştirmek için EVET yaz: ').strip()!='EVET':return
    api('setWebhook',{'url':url,'secret_token':secret,'allowed_updates':['message'],'max_connections':4,'drop_pending_updates':False})
    print('Telegram webhook bağlandı. Siteden test mesajı gönderip Telegram’da o mesaja Yanıtla ile cevap ver.')

if __name__=='__main__':
    try:main()
    except (urllib.error.URLError,urllib.error.HTTPError):print('Bağlantı kurulamadı. Token ve internet bağlantısını kontrol et. Gizli değerler yazdırılmadı.')
    except Exception as exc:print(str(exc))
