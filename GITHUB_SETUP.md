# راهنمای آپلود به GitHub

## مراحل آپلود پروژه به GitHub:

### 1. ساخت Repository در GitHub
- به https://github.com بروید
- روی دکمه "+" کلیک کنید و "New repository" را انتخاب کنید
- نام repository را وارد کنید (مثلاً: habit-tracker)
- Public یا Private را انتخاب کنید
- **توجه**: گزینه "Initialize with README" را تیک نزنید
- روی "Create repository" کلیک کنید

### 2. اتصال پروژه به GitHub

در ترمینال، این دستورات را اجرا کنید:

```bash
# اضافه کردن تمام فایل‌ها
git add .

# ساخت commit اولیه
git commit -m "Initial commit: Habit Tracker app"

# اضافه کردن remote repository (آدرس را با آدرس repository خودتان جایگزین کنید)
git remote add origin https://github.com/YOUR_USERNAME/habit-tracker.git

# تغییر نام branch به main (اگر لازم باشد)
git branch -M main

# آپلود به GitHub
git push -u origin main
```

### 3. اگر قبلاً git initialize شده است

اگر قبلاً git initialize کرده‌اید:

```bash
# بررسی وضعیت
git status

# اضافه کردن فایل‌ها
git add .

# ساخت commit
git commit -m "Add Habit Tracker application"

# اضافه کردن remote (اگر اضافه نشده)
git remote add origin https://github.com/YOUR_USERNAME/habit-tracker.git

# آپلود
git push -u origin main
```

### 4. اگر خطای authentication گرفتید

اگر از HTTPS استفاده می‌کنید و خطای authentication گرفتید:

**روش 1: استفاده از Personal Access Token**
- به GitHub > Settings > Developer settings > Personal access tokens بروید
- یک token جدید بسازید
- به جای password از token استفاده کنید

**روش 2: استفاده از SSH**
```bash
# تغییر remote به SSH
git remote set-url origin git@github.com:YOUR_USERNAME/habit-tracker.git
```

### 5. بررسی

بعد از push، به صفحه repository در GitHub بروید و مطمئن شوید که همه فایل‌ها آپلود شده‌اند.

## نکات مهم:

✅ فایل‌های `node_modules` و `dist` به صورت خودکار ignore می‌شوند (در .gitignore)
✅ README.md به صورت خودکار در صفحه اصلی repository نمایش داده می‌شود
✅ می‌توانید بعداً GitHub Pages را فعال کنید تا برنامه را به صورت آنلاین نمایش دهید

## فعال‌سازی GitHub Pages (اختیاری):

1. به Settings > Pages بروید
2. Source را روی "Deploy from a branch" تنظیم کنید
3. Branch را "main" و folder را "/ (root)" انتخاب کنید
4. بعد از build، dist folder را deploy کنید

یا از GitHub Actions استفاده کنید:
- یک فایل `.github/workflows/deploy.yml` بسازید
- از action `vite-pages` استفاده کنید
