# 🚀 Zaman Yolculuğu - İnteraktif Tarih Çizelgesi

Geçmişten geleceğe uzanan, tamamen GitHub tabanlı, statik ama dinamik bir zaman çizelgesi projesi.

![Timeline Preview](https://img.shields.io/badge/Status-Active-success)
![GitHub Pages](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌟 Özellikler

- ✨ **Tamamen Otomatik**: Markdown dosyaları otomatik olarak JSON'a dönüştürülür
- 🎯 **GitHub Issues ile Katkı**: Yeni olaylar GitHub Issue formu ile eklenir
- 🔄 **GitHub Actions**: Her değişiklik otomatik olarak işlenir
- 📱 **Responsive**: Mobil ve masaüstü uyumlu
- 🎨 **Görsel**: Geçmişten geleceğe renk geçişli tasarım
- 🌐 **Statik**: Tamamen GitHub Pages üzerinde çalışır

## 🚀 Kurulum

### 1. Repository'yi Fork Edin veya Clone Edin

```bash
git clone https://github.com/KULLANICI-ADI/REPO-ADI.git
cd REPO-ADI
```

### 2. GitHub Ayarları

1. **Settings → Pages** bölümüne gidin
2. **Source** olarak `main` branch seçin
3. **Save** butonuna tıklayın
4. Siteniz `https://KULLANICI-ADI.github.io/REPO-ADI/` adresinde yayınlanacak

### 3. Dosyaları Yapılandırın

#### `index.html` dosyasında şunları güncelleyin:

```javascript
const GITHUB_USERNAME = 'KULLANICI-ADI';  // GitHub kullanıcı adınız
const REPO_NAME = 'REPO-ADI';              // Repository adı
const BRANCH = 'main';                     // veya 'master'
```

#### `.github/ISSUE_TEMPLATE/new-event.yml` dosyasında:

```yaml
assignees:
  - KULLANICI-ADI  # GitHub kullanıcı adınızı yazın
```

### 4. İlk JSON Oluşturma

Yerel olarak test etmek için:

```bash
python scripts/generate-json.py
```

Ardından commit edin:

```bash
git add events/events.json
git commit -m "Initial events.json"
git push
```

## 📝 Yeni Olay Ekleme

### Yöntem 1: GitHub Issues (Önerilen)

1. Sitenizde **"+ Yeni Olay Ekle"** butonuna tıklayın
2. GitHub Issue formunu doldurun
3. Issue oluşturulacak
4. Maintainer olarak siz:
   - Issue'yu onaylayın
   - Aşağıdaki şekilde yeni bir `.md` dosyası oluşturun
   - Commit edin
   - GitHub Actions otomatik olarak `events.json` güncelleyecek

### Yöntem 2: Doğrudan Markdown Dosyası Ekleme

`events/data/` klasörüne yeni bir `.md` dosyası ekleyin:

**Dosya adı formatı:** `YILI-baslik.md` (örn: `2024-ai-devrimi.md`)

**İçerik formatı:**

```markdown
---
year: 2024
title: "Yapay Zeka Devrimi"
date: 2024-03-15
category: teknoloji
---

Burada olay hakkında detaylı açıklama yazılır. Birden fazla paragraf olabilir.

İkinci paragraf da eklenebilir.
```

**Zorunlu alanlar:**
- `year`: Olayın yılı (integer)
- `title`: Olay başlığı (string)

**Opsiyonel alanlar:**
- `date`: Tam tarih (YYYY-MM-DD formatında)
- `category`: Kategori (teknoloji, bilim, tarih, kültür, spor, politika, diğer)

## 🔧 Nasıl Çalışır?

```
┌─────────────────┐
│  MD Dosyası     │
│  Oluştur/Düzenle│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Git Push       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GitHub Actions  │
│  Tetiklenir     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ generate-json.py│
│  Çalışır        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ events.json     │
│  Güncellenir    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Auto Commit    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GitHub Pages   │
│  Güncellenir    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Site JSON'ı    │
│  Fetch Eder     │
└─────────────────┘
```

## 📁 Proje Yapısı

```
.
├── index.html                      # Ana timeline sayfası
├── events/
│   ├── events.json                 # Otomatik oluşturulan JSON
│   └── data/
│       ├── 1969-moon-landing.md
│       ├── 1989-berlin-wall.md
│       └── ...
├── .github/
│   ├── workflows/
│   │   └── generate-events.yml     # GitHub Actions workflow
│   └── ISSUE_TEMPLATE/
│       └── new-event.yml           # Issue formu
├── scripts/
│   └── generate-json.py            # JSON generator script
└── README.md
```

## 🎨 Özelleştirme

### Renk Şeması

`index.html` içinde CSS değişkenlerini düzenleyin:

```css
/* Geçmiş olaylar için renk */
#ff6b6b → #YENI_RENK

/* Gelecek olaylar için renk */
#5f27cd → #YENI_RENK
```

### Zaman Ölçeği

Her yıl için piksel miktarını değiştirin:

```javascript
const position = 50 + (yearDiff * 3); // 3'ü değiştirin
```

## 🔒 Güvenlik

- Tüm veriler public GitHub repo'sunda saklanır
- Katkılar Issue ve PR sistemi ile moderasyona tabidir
- GitHub Actions `GITHUB_TOKEN` ile çalışır (ek token gerekmez)

## 📊 İstatistikler

Site otomatik olarak gösterir:
- Toplam olay sayısı
- Geçmiş olay sayısı
- Gelecek olay sayısı

## 🤝 Katkıda Bulunma

1. Repository'yi fork edin
2. Yeni bir branch oluşturun (`git checkout -b yeni-olay`)
3. Değişikliklerinizi commit edin
4. Branch'inizi push edin
5. Pull Request oluşturun

## 📜 Lisans

MIT License - Detaylar için LICENSE dosyasına bakın.

## 🙏 Teşekkürler

Bu proje şu teknolojileri kullanır:
- GitHub Pages (hosting)
- GitHub Actions (automation)
- jsdelivr CDN (fast JSON delivery)
- Python (JSON generation)

## 📞 İletişim

Sorularınız için [Issue açın](https://github.com/KULLANICI-ADI/REPO-ADI/issues)!

---

⭐ **Beğendiyseniz yıldız vermeyi unutmayın!**
