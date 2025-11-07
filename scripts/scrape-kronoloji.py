#!/usr/bin/env python3
"""
Hafıza Cetveli - Wikipedia Kronoloji Kazıyıcı
https://tr.wikipedia.org/wiki/Türk_Kurtuluş_Savaşı_kronolojisi sayfasındaki
verileri okur ve 'events/data/' klasörüne .md dosyaları olarak kaydeder.
"""

import os
import re
import requests
from bs4 import BeautifulSoup
from pathlib import Path

# --- AYARLAR ---
TARGET_URL = "https://tr.wikipedia.org/wiki/Türk_Kurtuluş_Savaşı_kronolojisi"
OUTPUT_DIR = "events/data"
EVENT_CATEGORY = "tarih" # Tüm olaylar için varsayılan kategori
SOURCE_URL = "https://tr.wikipedia.org/wiki/Türk_Kurtuluş_Savaşı_kronolojisi"
# ---------------

# Türkçe ay isimlerini sayısal formata çevirmek için harita
MONTH_MAP = {
    "Ocak": "01", "Şubat": "02", "Mart": "03", "Nisan": "04",
    "Mayıs": "05", "Haziran": "06", "Temmuz": "07", "Ağustos": "08",
    "Eylül": "09", "Ekim": "10", "Kasım": "11", "Aralık": "12"
}

def slugify(text):
    """
    Verilen metni (örn: "Ay'a İlk İniş")
    dosya adı için güvenli bir formata (örn: "aya-ilk-inis") dönüştürür.
    """
    text = text.lower()
    # Türkçe karakterleri dönüştür
    text = text.replace('ğ', 'g').replace('ü', 'u').replace('ş', 's').replace('ı', 'i').replace('ö', 'o').replace('ç', 'c')
    # Kalan tüm geçersiz karakterleri '-' ile değiştir
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    # Boşlukları '-' ile değiştir
    text = re.sub(r'[\s-]+', '-', text)
    return text.strip('-')

def format_date(day_month_str, year_str):
    """
    "30 Ekim" ve "1918" gibi iki metni "1918-10-30" formatına dönüştürür.
    """
    try:
        parts = day_month_str.split()
        if len(parts) < 2:
             return None 
             
        day = parts[0]
        month_name = parts[1]
        
        # "1-2 Aralık" gibi aralıkları işle
        day = day.split('-')[0]
        if not day.isdigit():
            return None

        month = MONTH_MAP.get(month_name)
        if not month:
            return None
            
        day = day.zfill(2) # 01, 02...
        return f"{year_str}-{month}-{day}"
    except Exception as e:
        # print(f"    ⚠️  Tarih formatı hatası: {e} ({day_month_str})")
        return None

def create_markdown_file(date, title, description):
    """
    Verilen bilgilere göre events/data/ klasörüne bir .md dosyası yazar.
    """
    slug = slugify(title)
    if not slug:
        print(f"    ⚠️  Başlık {title} slug'a dönüştürülemedi, atlanıyor.")
        return False

    filename = f"{date}-{slug}.md"
    filepath = Path(OUTPUT_DIR) / filename
    
    # YAML front matter ve içeriği hazırla
    content = f"""---
title: "{title}"
date: {date}
category: {EVENT_CATEGORY}
---

{description.strip()}

## Kaynaklar

{SOURCE_URL}
"""
    
    try:
        if filepath.exists():
            print(f"    ℹ️  Dosya zaten var, atlanıyor: {filename}")
            return False

        filepath.write_text(content, encoding='utf-8')
        print(f"    ✅  Oluşturuldu: {filename}")
        return True
    except Exception as e:
        print(f"    ❌  HATA: {filename} dosyası yazılamadı: {e}")
        return False

def scrape_chronology():
    """
    Ana kazıma (scraping) fonksiyonu.
    """
    print(f"📜 Wikipedia sayfasından veri çekiliyor: {TARGET_URL}")
    
    try:
        headers = {'User-Agent': 'HafizaCetveliScraper/1.0 (https://github.com/sergenaras/hafiza)'}
        response = requests.get(TARGET_URL, headers=headers)
        response.raise_for_status() 
    except requests.RequestException as e:
        print(f"❌ HATA: Wikipedia sayfasına erişilemedi: {e}")
        return

    soup = BeautifulSoup(response.text, 'html.parser')
    
    content_div = soup.find('div', {'class': 'mw-parser-output'})
    if not content_div:
        print("❌ HATA: Sayfa yapısı değişmiş, 'mw-parser-output' alanı bulunamadı.")
        return

    Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
    
    event_count = 0
    
    # DÜZELTME: 'span' yerine doğrudan 'h2' etiketlerini bul
    headlines = content_div.find_all('h2')
    
    current_year = ""

    for headline in headlines:
        # h2 etiketinin 'id' özelliğini al (span'den değil)
        year_id = headline.get('id')
        
        if not year_id:
            continue # ID'si olmayan h2'leri (örn: "Kaynakça") atla
        
        # ID'nin 4 haneli bir yıl olup olmadığını kontrol et
        if re.fullmatch(r'\d{4}', year_id):
            current_year = year_id
            print(f"\n🗓️  Yıl işleniyor: {current_year}")
            
            # Bu 'h2' etiketini içeren 'div.mw-heading'i bul
            parent_div = headline.find_parent('div', {'class': 'mw-heading'})
            if not parent_div:
                parent_div = headline # Bazen div olmayabilir, h2'yi temel al

            # O başlıktan sonraki 'table' etiketini bul
            # HATA DÜZELTMESİ: {'class': 'wikitable'} kaldırıldı
            table = parent_div.find_next_sibling('table')
            
            if not table:
                print(f"    ℹ️  {current_year} yılı için tablo bulunamadı, atlanıyor.")
                continue
                
            # Eğer bu bir 'navbox' ise atla (sayfa sonundaki şablonlar)
            if 'navbox' in (table.get('class') or []):
                continue

            # Tabloyu işle
            for row in table.find_all('tr'):
                cells = row.find_all('td')
                
                if len(cells) < 2:
                    continue # Header (th) veya geçersiz satır
                
                day_month_str = cells[0].get_text(strip=True)
                description = cells[1].get_text(strip=True)
                
                full_date = format_date(day_month_str, current_year)
                if not full_date:
                    continue # Tarih formatı anlaşılamadı
                
                if not description:
                    description = "Açıklama bulunamadı."
                
                # Başlığı oluştur
                title = (description.split('.')[0]).strip()
                if len(title) > 60: 
                    title = title[:60].strip() + "..."
                elif not title:
                     title = f"{current_year} Olayı"

                if create_markdown_file(full_date, title, description):
                    event_count += 1

    print(f"\n✨ İşlem tamamlandı. Toplam {event_count} olay dosyası oluşturuldu.")

if __name__ == "__main__":
    scrape_chronology()