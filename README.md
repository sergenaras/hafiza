# 🚀 Hafıza Cetveli - Modern Timeline

Profesyonel, Canvas-tabanlı, yüksek performanslı zaman çizelgesi uygulaması.

## ✨ Özellikler

### 🎯 3 Zoom Seviyesi
- **×1 - Yıllar**: Geniş bakış, her yıl görünür
- **×2 - Aylar**: Yıllar + aylar, detaylı görünüm
- **×3 - Günler**: Tam detay, her gün numaralandırılmış

### 🖱️ İki Zoom Modu
1. **Pinch Zoom** (Mac Trackpad benzeri)
   - İki parmakla yakınlaştır/uzaklaştır
   - Sürükle ile hareket
   
2. **Çift Tıklama**
   - Çift tıkla → Zoom
   - Basılı tut & sürükle → Hareket

### 📊 Event Özellikleri
- Gri çubuklar ile gösterim
- Aynı gündeki olaylar otomatik stack'lenir
- Hover ile tooltip
- Tıkla ile detaylı modal
- Modal dışına tıkla ile kapat

### 🌍 Çoklu Dil
- Türkçe (varsayılan)
- İngilizce
- Kolayca genişletilebilir

### ⚡ Performans
- Canvas-based rendering
- Virtual rendering (sadece görünür alan)
- Smooth 60 FPS animasyonlar
- RequestAnimationFrame kullanımı

## 🛠️ Kurulum

### 1. Dosyaları Repoya Yükle

```bash
# Tüm dosyaları hafiza repo'suna kopyala
cp -r hafiza-timeline/* ~/hafiza/

cd ~/hafiza
git add .
git commit -m "Add modern timeline interface"
git push
```

### 2. Config Ayarları

`config.js` dosyasını düzenle:

```javascript
GITHUB_USERNAME: 'sergenaras',  // Kullanıcı adınız
REPO_NAME: 'hafiza',            // Repo adınız
BRANCH: 'main',                 // Branch adınız
```

### 3. GitHub Pages

- Settings → Pages
- Source: `main` branch, `/ (root)`
- Save

Site: `https://sergenaras.github.io/hafiza/`

## 📁 Dosya Yapısı

```
hafiza-timeline/
├── index.html          # Ana sayfa
├── config.js           # Ayarlar & ENV değişkenleri
├── i18n.js             # Çoklu dil sistemi
├── timeline.js         # Ana timeline motoru
└── README.md           # Bu dosya
```

## 🎨 Özelleştirme

### Renkleri Değiştir

`config.js` → `COLORS`:

```javascript
COLORS: {
    background: '#ffffff',
    todayMarker: '#ff4444',
    eventBar: '#999999',
    // ...
}
```

### Zoom Seviyelerini Ayarla

`config.js` → `ZOOM_LEVELS`:

```javascript
{
    pixelsPerYear: 150,  // Arttır = Daha geniş
    showYears: true,
    showMonths: false,
    showDays: false
}
```

### Dil Ekle

`i18n.js` → `translations`:

```javascript
de: {
    appName: 'Erinnerung Timeline',
    // ...
}
```

## 🔧 Teknik Detaylar

### Teknolojiler
- Vanilla JavaScript (framework yok!)
- Canvas API (performans)
- CSS3 animations
- Touch events API

### Tarayıcı Desteği
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari
- Chrome Android

### Performans Özellikleri
- Virtual rendering
- Event pooling
- RequestAnimationFrame
- Debounced resize
- Touch gesture optimization

## 📊 Veri Formatı

JSON yapısı (`events/events.json`):

```json
{
  "events": [
    {
      "year": 2024,
      "title": "Olay Başlığı",
      "date": "2024-03-15",
      "category": "teknoloji",
      "description": "Detaylı açıklama..."
    }
  ]
}
```

## 🎯 Kullanım

### Zoom Yapma
- **Pinch Mode**: İki parmak yakınlaştır/uzaklaştır
- **Double Click Mode**: Çift tıkla

### Hareket Etme
- **Pinch Mode**: Sürükle
- **Double Click Mode**: Basılı tut & sürükle

### Olay Görüntüleme
- **Hover**: Kısa bilgi (tooltip)
- **Tıkla**: Detaylı bilgi (modal)
- **Modal**: Dışına tıkla = kapat

## 🚀 Performans İpuçları

1. **Çok olay varsa**: `EVENT_MAX_STACK` değerini düşür
2. **Yavaşlık**: `pixelsPerYear` değerlerini azalt
3. **Animasyon**: `ANIMATION_DURATION` değiştir

## 📝 Lisans

MIT License - Özgürce kullanın!

## 🙏 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun
3. Commit edin
4. Push edin
5. Pull Request açın

## 📞 Destek

Sorun mu var? GitHub Issues'de bildirin!

---

**Yıldız vermeyi unutmayın!** ⭐
