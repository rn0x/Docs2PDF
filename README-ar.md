# Docs2PDF

تطبيق سطح مكتب لتحويل ملفات Word و Excel و PowerPoint إلى PDF باستخدام [office2pdf](https://github.com/developer0hye/office2pdf).

**[English](README.md)**

## لقطات الشاذه

| اختيار اللغه | اختيار الملفات | اكتمال التحويل | الاعدادات |
|:---:|:---:|:---:|:---:|
| ![Language](https://raw.githubusercontent.com/rn0x/Docs2PDF/main/screenshot/Screenshot%20From%202026-08-27%2020-53-56.png) | ![Files](https://raw.githubusercontent.com/rn0x/Docs2PDF/main/screenshot/Screenshot%20From%202026-08-27%2020-54-26.png) | ![Done](https://raw.githubusercontent.com/rn0x/Docs2PDF/main/screenshot/Screenshot%20From%202026-08-27%2020-54-34.png) | ![Settings](https://raw.githubusercontent.com/rn0x/Docs2PDF/main/screenshot/Screenshot%20From%202026-08-27%2020-54-45.png) |

## المميزات

- سحب وإفلات أو تحديد الملفات
- تحويل مجمع
- أحجام ورقيات متعددة واتجاه
- دعم PDF/A
- 16 لغة
- ثيم داكن/فاتح

## المتطلبات

- Node.js >= 18
- npm أو yarn

## التثبيت

```bash
git clone https://github.com/rn0x/Docs2PDF.git
cd Docs2PDF
npm install
npm run download:binaries
```

## التشغيل في وضع التطوير

```bash
npm run electron:dev
```

## البناء

```bash
npm run pack:linux    # Linux
npm run pack:win      # Windows
npm run pack:mac      # macOS
```

## طريقة العمل

1. حدد أو اسحب الملفات (.docx, .xlsx, .pptx)
2. اختر مجلد الحفظ
3. اضغط "تحويل"
4. افتح مجلد الإخراج عند الانتهاء

## الصيغ المدعومة

| الإدخال | الإخراج |
|---------|---------|
| .docx | .pdf |
| .xlsx | .pdf |
| .pptx | .pdf |

## الترخيص

رخصة MIT