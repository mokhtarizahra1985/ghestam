# راهنمای دیپلوی روی سرور اختصاصی (مثلا account.sunrad.ir)

این راهنما فرض می‌کند به یک VPS با دسترسی SSH و یک دامنه (`account.sunrad.ir`) که به IP همان سرور اشاره می‌کند دسترسی دارید.

## ۱. پیش‌نیازها روی سرور

```bash
ssh user@account.sunrad.ir

# Node.js 20 (در صورت نبودن)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx

# PM2 برای مدیریت پروسس
sudo npm install -g pm2
```

## ۲. کلون و نصب پروژه

```bash
cd /var/www
git clone https://github.com/mokhtarizahra1985/ghestam.git
cd ghestam
git checkout claude/loan-installment-tracker-1xqp5l   # یا main بعد از مرج شدن PR

npm install
cp .env.example .env
```

`.env` را باز کنید و مطمئن شوید مسیر دیتابیس درست است (پیش‌فرض کافی است):

```
DATABASE_URL="file:./dev.db"
```

## ۳. ساخت دیتابیس و بیلد پروژه

```bash
npx prisma migrate deploy
npm run build
```

## ۴. اجرا با PM2

```bash
pm2 start npm --name qestyar -- start
pm2 save
pm2 startup   # دستوری که چاپ می‌کند را کپی و اجرا کنید تا بعد از ریبوت سرور هم بالا بیاید
```

اپ حالا روی پورت 3000 روی خود سرور در حال اجراست. برای چک کردن:

```bash
curl http://localhost:3000
```

## ۵. تنظیم Nginx به‌عنوان reverse proxy

فایل `/etc/nginx/sites-available/qestyar` را بسازید:

```nginx
server {
    listen 80;
    server_name account.sunrad.ir;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

فعال‌سازی:

```bash
sudo ln -s /etc/nginx/sites-available/qestyar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## ۶. گواهی SSL رایگان (اختیاری ولی توصیه‌شده)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d account.sunrad.ir
```

بعد از این مرحله سایت روی `https://account.sunrad.ir` در دسترس خواهد بود.

## به‌روزرسانی بعد از تغییرات جدید کد

```bash
cd /var/www/ghestam
git pull
npm install
npx prisma migrate deploy
npm run build
pm2 restart qestyar
```

## نکات

- دیتابیس SQLite در همان مسیر پروژه (`dev.db`) روی دیسک سرور ذخیره می‌شود و بین ری‌استارت‌ها/آپدیت‌ها پایدار می‌ماند.
- از این فایل به‌طور منظم بکاپ بگیرید، مثلا با یک کرون ساده:
  ```bash
  0 3 * * * cp /var/www/ghestam/dev.db /var/backups/qestyar-$(date +\%F).db
  ```
