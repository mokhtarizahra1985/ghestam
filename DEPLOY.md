# راهنمای دیپلوی روی سرور اختصاصی (مثلا account.sunrad.ir)

این راهنما فرض می‌کند به یک VPS با دسترسی SSH و یک دامنه (مثلا `account.sunrad.ir`) دسترسی دارید.

## ۱. پیش‌نیازها روی سرور

```bash
ssh user@your-server-ip

# Node.js (در صورت نبودن)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx

# PM2 برای مدیریت پروسس
sudo npm install -g pm2
```

## ۲. کلون و نصب پروژه

```bash
cd /var/www
sudo git clone https://github.com/mokhtarizahra1985/ghestam.git
cd ghestam
sudo git checkout claude/loan-installment-tracker-1xqp5l   # یا main بعد از مرج شدن PR

sudo npm install
sudo cp .env.example .env
```

`npm install` خودش Prisma Client رو هم می‌سازه (`postinstall` hook)، نیازی به دستور جدا نیست.

`.env` را باز کنید و مطمئن شوید مسیر دیتابیس درست است (پیش‌فرض کافی است):

```
DATABASE_URL="file:./dev.db"
```

## ۳. ساخت دیتابیس و بیلد پروژه

```bash
sudo npx prisma migrate deploy
sudo npm run build
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

اگر HTML صفحه («قسط‌یار») را دید، اپ درست کار می‌کند و می‌توانید به مرحله‌ی بعد بروید.

## ۵. تنظیم DNS دامنه

قبل از راه‌اندازی Nginx، باید دامنه (زیردامنه) به IP همین سرور اشاره کند. IP سرور را با یکی از این‌ها پیدا کنید:

```bash
curl -s https://icanhazip.com
```

سپس در پنل مدیریت DNS دامنه (جایی که `sunrad.ir` را مدیریت می‌کنید) یک رکورد از این نوع اضافه کنید:

| نوع | نام | مقدار |
|---|---|---|
| A | account | IP سرور (مثلا 89.42.199.40) |

انتشار DNS معمولاً چند دقیقه تا چند ساعت طول می‌کشد. برای چک کردن اینکه رکورد نشسته:

```bash
getent hosts account.sunrad.ir
```

اگر خروجی خالی بود یعنی هنوز منتشر نشده یا رکورد اشتباه ثبت شده.

## ۶. محافظت با یوزر/پسورد (Basic Auth) — اختیاری

اگر می‌خواهید قبل از رسیدن به اپ، مرورگر یوزر/پسورد بپرسد:

```bash
sudo apt-get install -y apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd-qestyar admin   # یوزرنیم: admin، پسورد را همین‌جا تایپ می‌کنید
```

## ۷. تنظیم Nginx به‌عنوان reverse proxy

فایل `/etc/nginx/sites-available/qestyar` را بسازید (اگر مرحله‌ی ۶ را رد کردید، دو خط `auth_basic` را حذف کنید):

```bash
sudo tee /etc/nginx/sites-available/qestyar > /dev/null << 'EOF'
server {
    listen 80;
    server_name account.sunrad.ir;

    auth_basic "Restricted";
    auth_basic_user_file /etc/nginx/.htpasswd-qestyar;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/qestyar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

اگر روی سرور سایت‌های دیگری هم فعال هستند، قبلش با این دستور مطمئن شوید نام دامنه‌ی جدید با هیچ‌کدام تداخل ندارد:

```bash
grep -r server_name /etc/nginx/sites-enabled/ | grep -v '#'
```

تست بدون نیاز به DNS (با IP مستقیم):

```bash
curl -I -H "Host: account.sunrad.ir" http://localhost          # باید 401 بدهد (auth لازم است)
curl -u admin:رمزتان -H "Host: account.sunrad.ir" http://localhost | head -20
```

## ۸. گواهی SSL رایگان (اختیاری ولی توصیه‌شده)

بعد از اینکه DNS منتشر شد:

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

## عیب‌یابی سریع

| علامت | احتمال مشکل | راه‌حل |
|---|---|---|
| مرورگر می‌گه "This site can't be reached" | DNS دامنه هنوز منتشر نشده یا اشتباهه | `getent hosts account.sunrad.ir` را چک کنید |
| `curl http://localhost:3000` جواب نمی‌ده | اپ با PM2 بالا نیامده | `pm2 status` و `pm2 logs qestyar` |
| nginx کار می‌کنه ولی دامنه جواب نمی‌ده | کانفیگ سایت enable نشده | `ls /etc/nginx/sites-enabled/` و مطمئن شوید `qestyar` آنجاست |
| خطای build درباره‌ی `@/generated/prisma` | Prisma Client ساخته نشده | `npm install` دوباره بزنید (postinstall خودش `prisma generate` را اجرا می‌کند) یا مستقیم `npx prisma generate` |
| `cp .env.example .env` می‌گه فایل نیست | نسخه‌ی قدیمی کد را دارید | `git pull` بزنید، این فایل از یک commit به بعد اضافه شده |

## نکات

- دیتابیس SQLite در همان مسیر پروژه (`dev.db`) روی دیسک سرور ذخیره می‌شود و بین ری‌استارت‌ها/آپدیت‌ها پایدار می‌ماند.
- از این فایل به‌طور منظم بکاپ بگیرید، مثلا با یک کرون ساده:
  ```bash
  0 3 * * * cp /var/www/ghestam/dev.db /var/backups/qestyar-$(date +\%F).db
  ```
