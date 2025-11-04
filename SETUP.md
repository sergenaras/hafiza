# 📋 Hızlı Kurulum Rehberi

Bu dokümanda projeyi GitHub'a yükleyip çalıştırmanız için adım adım talimatlar bulunmaktadır.

## 🎯 Adım 1: GitHub Repository Oluşturma

1. GitHub'da oturum açın
2. Sağ üst köşedeki **+** işaretine tıklayın
3. **New repository** seçin
4. Repository adı: `zaman-yolculugu` (veya istediğiniz bir isim)
5. **Public** seçin (önemli!)
6. **Create repository** butonuna tıklayın

## 📤 Adım 2: Dosyaları Yükleme

### Seçenek A: GitHub Web Interface (Kolay)

1. Oluşturduğunuz repository sayfasında **Add file → Upload files**
2. Tüm proje dosyalarını sürükle-bırak yapın
3. Commit message: "Initial commit"
4. **Commit changes** butonuna tıklayın

### Seçenek B: Git Command Line (İleri seviye)

```bash
# Proje klasörüne gidin
cd timeline-project

# Git başlatın
git init

# Tüm dosyaları ekleyin
git add .

# İlk commit
git commit -m "Initial commit"

# Remote ekleyin (KULLANICI-ADI ve REPO-ADI'nizi yazın)
git remote add origin https://github.com/KULLANICI-ADI/REPO-ADI.git

# Push edin
git branch -M main
git push -u origin main
```

## ⚙️ Adım 3: Yapılandırma

### 3.1 GitHub Pages Ayarları

1. Repository sayfasında **Settings** sekmesine gidin
2. Sol menüden **Pages** seçin
3. **Source** bölümünde:
   - Branch: `main`
   - Folder: `/ (root)`
4. **Save** butonuna tıklayın
5. 2-3 dakika bekleyin, sayfa yenileyin
6. Yeşil kutuya sitenizin URL'si yazılacak:
   `https://KULLANICI-ADI.github.io/REPO-ADI/`

### 3.2 index.html Dosyasını Düzenleme

1. Repository'de `index.html` dosyasını açın
2. Sağ üstte **✏️ Edit** butonuna tıklayın
3. Şu satırları bulun ve değiştirin:

```javascript
const GITHUB_USERNAME = 'KULLANICI-ADI'; // Kendi kullanıcı adınızı yazın
const REPO_NAME = 'REPO-ADI';           // Repository adınızı yazın
const BRANCH = 'main';                   // Çoğunlukla 'main', eski repolar 'master'
```

4. Örnek:
```javascript
const GITHUB_USERNAME = 'ahmetson';
const REPO_NAME = 'zaman-yolculugu';
const BRANCH = 'main';
```

5. Sağ üstte **Commit changes** butonuna tıklayın
6. Commit message: "Configure GitHub settings"
7. **Commit changes** onaylayın

### 3.3 Issue Template'i Düzenleme

1. `.github/ISSUE_TEMPLATE/new-event.yml` dosyasını açın
2. **✏️ Edit** butonuna tıklayın
3. Şu satırı bulun ve değiştirin:

```yaml
assignees:
  - KULLANICI-ADI  # Kendi kullanıcı adınızı yazın
```

4. Commit edin

### 3.4 README'yi Güncelleme

1. `README.md` dosyasını açın
2. **✏️ Edit** butonuna tıklayın
3. İçerikte geçen tüm `KULLANICI-ADI` ve `REPO-ADI` yerlerini değiştirin
4. Commit edin

## 🧪 Adım 4: Test Etme

### 4.1 GitHub Actions Kontrolü

1. Repository'de **Actions** sekmesine gidin
2. "Generate Events JSON" workflow'unu görmelisiniz
3. Yeşil ✅ işareti varsa çalışıyor demektir

### 4.2 Sitenizi Ziyaret Edin

1. `https://KULLANICI-ADI.github.io/REPO-ADI/` adresine gidin
2. Timeline'ı görmelisiniz
3. 6 örnek olay yüklenmiş olmalı

## ✨ Adım 5: İlk Olayınızı Ekleyin

### Yöntem 1: GitHub Issue (Tavsiye Edilen)

1. Sitenizde **+ Yeni Olay Ekle** butonuna tıklayın
2. GitHub issue sayfası açılacak
3. Formu doldurun:
   - Yıl: 2025
   - Başlık: İlk Test Olayım
   - Açıklama: Bu benim eklediğim ilk olay!
   - Kategori: diğer
4. **Submit new issue** butonuna tıklayın

### Yöntem 2: Doğrudan MD Dosyası Ekleme

1. Repository'de `events/data/` klasörüne gidin
2. **Add file → Create new file** tıklayın
3. Dosya adı: `2025-ilk-test.md`
4. İçerik:

```markdown
---
year: 2025
title: "İlk Test Olayım"
date: 2025-11-04
category: diğer
---

Bu benim eklediğim ilk test olayı. Sistem çalışıyor! 🎉
```

5. **Commit new file** tıklayın
6. **Actions** sekmesine gidin
7. "Generate Events JSON" workflow'unun çalıştığını göreceksiniz
8. ✅ Yeşil olunca başarılı demektir
9. 2-3 dakika sonra sitenizi yenileyin - yeni olayınız görünecek!

## 🔧 Adım 6: Sorun Giderme

### events.json oluşmuyorsa:

1. **Actions** sekmesinde workflow loglarını kontrol edin
2. Python script hata veriyor olabilir
3. MD dosyalarında YAML formatı doğru mu kontrol edin

### Site yüklenmiyor:

1. GitHub Pages ayarlarını kontrol edin
2. `index.html` içindeki USERNAME ve REPO_NAME doğru mu?
3. Tarayıcı console'unda (F12) hata var mı?

### JSON fetch hatası:

1. `events/events.json` dosyası var mı kontrol edin
2. Repository public mi? (Private repolarda CDN çalışmaz)
3. Birkaç dakika bekleyin (CDN cache temizlenir)

## 🎨 Sonraki Adımlar

✅ Sistemi özelleştirin:
- Renkler
- Yazı tipleri
- Kategoriler
- Timeline ölçeği

✅ Daha fazla olay ekleyin

✅ Arkadaşlarınızı davet edin katkıda bulunmaları için

✅ Social media'da paylaşın

## 💡 İpuçları

- Her MD dosyasını anlamlı bir isimle adlandırın: `YILI-olay-adi.md`
- Açıklamaları kısa ve öz tutun (2-3 paragraf maksimum)
- Kategorileri tutarlı kullanın
- Tarihleri YYYY-MM-DD formatında yazın

## 📞 Yardım

Sorunlarınız için:
1. README.md dosyasını okuyun
2. GitHub Issues'de bir issue açın
3. Actions loglarını kontrol edin

---

🎉 **Tebrikler! Artık çalışan bir zaman yolculuğu siteniz var!**
