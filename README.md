# Hafıza Projesi - Düzeltmeler ve İyileştirmeler

Bu klasör, Hafıza projesindeki GitHub Actions workflow'ları ve olay yönetim sistemi için düzeltmeleri içermektedir.

## 🔧 Düzeltilen Sorunlar

### 1. Issue Parse Hatası (11-issue-to-pr.yml)
**Sorun:** AWK komutu GitHub Issue formatını doğru parse edemiyordu ve syntax hatası veriyordu.

**Çözüm:** 
- AWK yerine pure Bash kullanarak daha güvenilir bir parse mekanizması
- Markdown başlıklarını (`###`) doğru tespit etme
- Checkbox'ları filtreleme
- Temiz ve hatasız veri çıkarma

### 2. Olay Düzenleme Sistemi
**Yenilik:** Mevcut olayları düzenlemek için ayrı bir issue template ve workflow

**Özellikler:**
- `upgrade-event.yml`: Düzenleme formu
- Original dosya adını belirtme
- Mevcut olayın üzerine yazma kontrolü
- Güvenli güncelleme mekanizması

### 3. Olay Silme Sistemi
**Yenilik:** Olayları güvenli bir şekilde silmek için tam entegre sistem

**Özellikler:**
- `delete-event.yml`: Silme formu
- `13-delete-event-pr.yml`: Silme PR oluşturucu workflow
- Dosya varlığı kontrolü
- Silme nedeni dokümantasyonu
- Çift onay mekanizması

### 4. JSON Generator İyileştirmeleri
**İyileştirmeler:**
- Daha iyi hata yakalama ve raporlama
- Gizli HTML comment'lerini temizleme
- Geçersiz değerleri düzgün işleme
- Detaylı log çıktıları
- Boş klasör durumunu handle etme

## 📁 Dosya Listesi

```
hafiza-fixes/
├── 11-issue-to-pr.yml        # Yeni/Düzenleme PR oluşturucu (düzeltilmiş)
├── 13-delete-event-pr.yml    # Silme PR oluşturucu (yeni)
├── upgrade-event.yml          # Düzenleme issue template (yeni)
├── delete-event.yml           # Silme issue template (yeni)
├── generate-json.py           # İyileştirilmiş JSON generator
└── README.md                  # Bu dosya
```

## 🚀 Kurulum Adımları

### 1. GitHub Actions Workflow'larını Güncelle

```bash
# Ana repo'ya kopyala
cp 11-issue-to-pr.yml ../../.github/workflows/
cp 13-delete-event-pr.yml ../../.github/workflows/
```

### 2. Issue Template'lerini Ekle

```bash
# Issue templates klasörüne kopyala
cp upgrade-event.yml ../../.github/ISSUE_TEMPLATE/
cp delete-event.yml ../../.github/ISSUE_TEMPLATE/
```

### 3. Python Script'i Güncelle

```bash
# Scripts klasörüne kopyala
cp generate-json.py ../../scripts/
```

## 📋 Kullanım

### Yeni Olay Ekleme
1. GitHub'da "Issues" → "New issue"
2. "Yeni Olay Ekle" template'ini seç
3. Formu doldur ve issue'yu kapat
4. Otomatik PR oluşturulur
5. PR'ı merge et

### Mevcut Olayı Düzenleme
1. GitHub'da "Issues" → "New issue"
2. "Olay Düzenle" template'ini seç
3. Düzenlenecek dosya adını gir (örn: `2024-03-15-yapay-zeka.md`)
4. Güncel bilgileri gir
5. Issue'yu kapat → PR oluşturulur → Merge et

### Olay Silme
1. GitHub'da "Issues" → "New issue"
2. "Olay Sil" template'ini seç
3. Silinecek dosya adını gir
4. Silme nedenini açıkla
5. Issue'yu kapat → PR oluşturulur → Merge et

## 🔍 Parse Logic Açıklaması

Yeni parse mekanizması şu şekilde çalışır:

1. **Başlık Tespiti:** `###` ile başlayan satırları tespit eder
2. **İçerik Toplama:** Başlıktan sonraki içeriği toplar
3. **Checkbox Filtreleme:** `- [ ]` veya `- [x]` formatındaki satırları atlar
4. **Temizlik:** Carriage return ve fazla boşlukları temizler
5. **Varsayılan Değerler:** Eksik alanlar için güvenli varsayılanlar

## ⚠️ Önemli Notlar

1. **Türkçe Karakter Desteği:** Slug oluştururken Türkçe karakterler ASCII'ye çevrilir
2. **Dosya Adı Formatı:** `YYYY-AA-GG-slug.md` formatında otomatik oluşturulur
3. **Kategori Logic:** "diğer" seçilirse özel kategori kullanılır
4. **Saat Formatı:** SS:DD formatında, geçersizse 12:00 varsayılan

## 🐛 Debug İpuçları

Workflow'larda sorun yaşarsanız:

1. Actions sekmesinde workflow run'a tıklayın
2. "Parse issue body" adımındaki logları kontrol edin
3. `=== PARSED VALUES ===` bölümünü inceleyin
4. Eksik veya hatalı parse edilen alanları tespit edin

## 📝 Gelecek İyileştirmeler

- [ ] Toplu olay ekleme desteği
- [ ] Olay düzenleme geçmişi
- [ ] Otomatik kategori önerisi
- [ ] Kaynak URL doğrulama
- [ ] Tarih tutarlılık kontrolü

## 🤝 Katkıda Bulunma

Sorun bildirmek veya iyileştirme önermek için:
1. Issue açın
2. Detaylı açıklama ekleyin
3. Mümkünse hata loglarını paylaşın

---

**Hazırlayan:** Claude AI Assistant
**Tarih:** Kasım 2024
**Versiyon:** 2.0
