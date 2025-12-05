# 📋 لیست کامل فایل‌هایی که باید به GitHub اضافه کنید

## ✅ فایل‌های اصلی (Root):

```
✅ .gitignore
✅ package.json
✅ package-lock.json
✅ README.md
✅ index.html
✅ vite.config.ts
✅ tsconfig.json
✅ tsconfig.node.json
```

---

## ✅ پوشه src/ (تمام محتویات):

```
✅ src/
   ✅ App.tsx
   ✅ App.css
   ✅ main.tsx
   ✅ index.css
   
   ✅ src/components/
      ✅ AddHabitForm.tsx
      ✅ AddHabitForm.css
      ✅ Calendar.tsx
      ✅ Calendar.css
      ✅ DataManager.tsx
      ✅ DataManager.css
      ✅ HabitItem.tsx
      ✅ HabitItem.css
      ✅ HabitList.tsx
      ✅ HabitList.css
      ✅ Header.tsx
      ✅ Header.css
      ✅ ProgressChart.tsx
      ✅ ProgressChart.css
      ✅ StatsDashboard.tsx
      ✅ StatsDashboard.css
   
   ✅ src/contexts/
      ✅ HabitContext.tsx
      ✅ NotificationContext.tsx
      ✅ ThemeContext.tsx
   
   ✅ src/utils/
      ✅ jalali.ts
```

---

## ✅ پوشه .github/ (برای Deploy):

```
✅ .github/
   ✅ workflows/
      ✅ deploy.yml
```

---

## ✅ فایل‌های راهنما (اختیاری اما مفید):

```
✅ DEPLOY_GUIDE.md
✅ FILES_TO_UPLOAD.md
✅ GITHUB_SETUP.md
```

---

## 📝 خلاصه:

**مجموعاً حدود 33 فایل** که باید آپلود کنید.

**فایل‌های مهم:**
- تمام فایل‌های `.tsx`, `.ts`, `.css`
- `package.json` و `package-lock.json`
- `README.md`
- `.gitignore`
- فایل‌های تنظیمات (vite.config.ts, tsconfig.json)

---

## ❌ فایل‌هایی که نباید آپلود کنید:

- ❌ `node_modules/` (پوشه کامل)
- ❌ `dist/` (پوشه کامل)
- ❌ `.DS_Store`
- ❌ فایل‌های `.log`

---

## 🎯 روش آپلود:

### روش 1: استفاده از Git (توصیه می‌شود)
```bash
git add .
git commit -m "Add Habit Tracker app"
git push origin main
```
(فایل‌های غیرضروری خودکار ignore می‌شوند)

### روش 2: آپلود دستی در GitHub
1. به repository خود بروید
2. "uploading an existing file" را بزنید
3. فقط فایل‌های ✅ را انتخاب کنید
4. از انتخاب `node_modules` و `dist` خودداری کنید

