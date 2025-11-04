Bir GitHub tabanlı zaman çizelgesi projesi geliştir:

## Temel Gereksinimler:

1. **Tasarım**
   - Minimal, beyaz arka plan
   - Ana odak: Yatay cetvel/ruler görünümü
   - Sol taraf: Geçmiş (0'den başlayan)
   - Sağ taraf: Gelecek (günümüze kadar)
   - Ortada kırmızı işaret: "ŞİMDİ" (mevcut yıl)
   - Her 10 yılda kalın çizgi ve yıl etiketi
   - Ara yıllarda ince çizgiler
   - Olaylar: Cetvel üzerinde siyah noktalar (hover'da detay göster)
   - Cetvel üzerinde sağa sola hareket edebilmemiz gerekiyor. 
   - 3 aşamalı olarak da yaklaştırabilmeliyiz.
   - - yılların göründüğü, ayların göründüğü detaylı olarak günlerin göründüğü 

2. **Veri Yapısı**
   - Olaylar: Markdown dosyalarında saklanır (`events/data/YILI-baslik.md`)
   - YAML front matter:
```yaml
     ---
     year: 2024
     title: "Olay Başlığı"
     date: 2024-03-15
     category: teknoloji
     ---
     Olay açıklaması buraya...
```
   - Python script ile MD → JSON otomatik dönüşümü
   - events.json: Tüm olayları içeren tek dosya

3. **GitHub Entegrasyonu**
   - Public repository
   - GitHub Pages ile hosting
   - GitHub Issues ile yeni olay önerileri
   - Issue template formu (yıl, başlık, açıklama, kategori)

4. **Otomasyon**
   - GitHub Actions workflow:
     * MD dosyası değişince tetiklenir
     * Python script çalışır
     * events.json güncellenir
     * Otomatik commit yapar
   - CDN (jsdelivr) üzerinden JSON fetch
   - Client-side rendering

5. **Özellikler**
   - Yatay kaydırma (scrollable timeline)
   - "Şimdiye Git" butonu (merkeze scroll)
   - "Yeni Olay Ekle" butonu (GitHub Issue'ya yönlendir)
   - İstatistikler: Toplam/Geçmiş/Gelecek olay sayısı
   - Responsive tasarım

6. **İş Akışı**
   - Kullanıcı → Issue açar (form doldurur)
   - Maintainer → Issue'yu kontrol eder
   - Maintainer → Manuel olarak MD dosyası oluşturur
   - Git push → GitHub Actions tetiklenir
   - events.json otomatik güncellenir
   - Site otomatik yenilenir

## Teknik Detaylar:
- HTML + Vanilla JavaScript (framework yok)
- Python 3 (JSON generator için)
- GitHub Actions (CI/CD)
- Her yıl = 50 piksel genişlik
- Zaman aralığı: 1850-2150
- Kategori seçenekleri: teknoloji, bilim, tarih, kültür, spor, politika, diğer

## Dosya Yapısı:
```
repo/
├── index.html
├── events/
│   ├── events.json
│   └── data/*.md
├── .github/
│   ├── workflows/generate-events.yml
│   └── ISSUE_TEMPLATE/new-event.yml
├── scripts/generate-json.py
└── README.md
```

Tüm sistemi oluştur ve kullanıma hazır hale getir.