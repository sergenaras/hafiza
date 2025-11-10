#!/usr/bin/env python3
"""
Hafıza Cetveli - Atatürk Kronoloji Kazıyıcı (Yerel Dosyadan)
'xxx.html' (MEB Statik Sayfa HTML'i) dosyasını okur
ve 'events/data/' klasörüne .md dosyaları olarak kaydeder.
"""

import os
import re
import sys
from pathlib import Path
from bs4 import BeautifulSoup

# --- AYARLAR ---
LOCAL_FILE = "xxx.html" # Proje ana dizininizdeki dosya
OUTPUT_DIR = "events/data"
EVENT_CATEGORY = "tarih"
SOURCE_URL = "https://www.meb.gov.tr/ataturk/Hayati/Kronoloji"
# ---------------

# Türkçe ay isimlerini sayısal formata çevirmek için harita
MONTH_MAP = {
    "Ocak": "01", "Şubat": "02", "Mart": "03", "Nisan": "04",
    "Mayıs": "05", "Haziran": "06", "Temmuz": "07", "Ağustos": "08",
    "Eylül": "09", "Ekim": "10", "Kasım": "11", "Aralık": "12"
}

def slugify(text):
    """Metni dosya adı için güvenli formata dönüştürür."""
    text = text.lower()
    text = text.replace('ğ', 'g').replace('ü', 'u').replace('ş', 's').replace('ı', 'i').replace('ö', 'o').replace('ç', 'c')
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s-]+', '-', text)
    return text.strip('-')

def format_meb_date(date_str):
    """
    MEB sitesindeki düzensiz tarihleri (örn: "19 Mayıs 1919", "1920", "8/9 Ağustos")
    "YYYY-AA-GG" formatına dönüştürür.
    """
    date_str = date_str.strip().replace('-', ' ').replace('/', ' ') # Aralıkları ('-') ve eğik çizgileri ('/') boşluğa çevir
    
    # 1. Tam Tarih (örn: "19 Mayıs 1919")
    # (Aralıktaki ilk tarihi alır, örn: "8 9 Ağustos" -> 8 Ağustos)
    match_full = re.search(r'(\d+)\s+(\w+)\s+(\d{4})', date_str)
    if match_full:
        day = match_full.group(1).zfill(2)
        month_name = match_full.group(2)
        year = match_full.group(3)
        month = MONTH_MAP.get(month_name)
        if month:
            return f"{year}-{month}-{day}"

    # 2. Sadece Yıl (örn: "1881", "1888 1893")
    match_year = re.search(r'(\d{4})', date_str)
    if match_year:
        year = match_year.group(1)
        # Yıl biliniyor, ay/gün bilinmiyorsa varsayılan olarak 01-01 kullan
        return f"{year}-01-01"
        
    # 3. Ay ve Yıl (örn: "Mart 1920")
    match_month_year = re.search(r'(\w+)\s+(\d{4})', date_str)
    if match_month_year:
        month_name = match_month_year.group(1)
        year = match_month_year.group(2)
        month = MONTH_MAP.get(month_name)
        if month:
            # Ay biliniyor, gün bilinmiyorsa varsayılan olarak 01 kullan
            return f"{year}-{month}-01"

    print(f"    ⚠️  Anlaşılamayan tarih formatı: '{date_str}'")
    return None

def create_markdown_file(date, title, description):
    """Verilen bilgilere göre events/data/ klasörüne bir .md dosyası yazar."""
    slug = slugify(title)
    if not slug:
        print(f"    ⚠️  Başlık {title} slug'a dönüştürülemedi, atlanıyor.")
        return False

    filename = f"{date}-{slug}.md"
    filepath = Path(OUTPUT_DIR) / filename
    
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

def scrape_local_html(local_file):
    """
    Ana kazıma (scraping) fonksiyonu (Yerel dosyadan).
    """
    print(f"📜 Yerel HTML dosyasından veri okunuyor: {local_file}")
    
    filepath = Path(local_file)
    if not filepath.exists():
        print(f"❌ HATA: Dosya bulunamadı: {local_file}")
        print("Lütfen 'xxx.html' dosyasının 'hafiza' ana dizininde olduğundan emin olun.")
        return

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            html_content = f.read()
    except Exception as e:
        print(f"❌ HATA: Dosya okunurken hata: {e}")
        return

    soup = BeautifulSoup(html_content, 'html.parser')
    
    # HTML'deki ana içerik div'ini bul
    content_div = soup.find('div', {'class': 'sub-content'})
    
    if not content_div:
        print("❌ HATA: HTML yapısı değişmiş, 'div.sub-content' alanı bulunamadı.")
        return

    Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
    
    event_count = 0
    
    # Tarihleri içeren tüm <b> etiketlerini bul
    date_tags = content_div.find_all('b')
    
    print(f"... {len(date_tags)} adet potansiyel tarih (<b> etiketi) bulundu. İşleniyor ...")

    for tag in date_tags:
        # Yıl başlıklarını (örn: 1881-1908) atla
        if tag.find_parent('p', align='center'):
            continue
        
        date_str = tag.get_text(strip=True)
        full_date = format_meb_date(date_str)
        
        if not full_date:
            # Bu <b> etiketi geçerli bir tarih değildi (örn: "MUSTAFA")
            continue
            
        # Açıklama, <b> etiketinden hemen sonra gelen metindir
        description_node = tag.next_sibling
        description = ""
        
        if description_node and isinstance(description_node, str):
            description = str(description_node).strip()
            # Baştaki " - " karakterlerini temizle
            if description.startswith(('-', '–')):
                description = description[1:].strip()

        if not description:
            print(f"    ℹ️  Açıklama bulunamadı: {date_str}")
            continue

        # Başlığı oluştur
        title = (description.split('.')[0]).strip()
        if len(title) > 60: 
            title = title[:60].strip() + "..."
        elif not title:
             title = f"{full_date} Olayı"

        if create_markdown_file(full_date, title, description):
            event_count += 1

    print(f"\n✨ İşlem tamamlandı. Toplam {event_count} olay dosyası oluşturuldu.")

if __name__ == "__main__":
    # Betiğin 'hafiza' ana dizininden çalıştırıldığını varsayarak,
    # 'xxx.html' dosyasını da orada arar.
    scrape_local_html(LOCAL_FILE)