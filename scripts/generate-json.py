#!/usr/bin/env python3
"""
Hafıza Cetveli - Event JSON Generator
Bu script events/data/ klasöründeki tüm .md dosyalarını okur ve events.json oluşturur.
"""

import os
import json
import re # <- YENİ EKLENDİ (Regex için)
from pathlib import Path
from datetime import datetime

def parse_markdown_file(file_path):
    """Markdown dosyasını parse et ve event bilgilerini çıkar"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # YAML front matter'ı parse et
    yaml_pattern = r'^---\s*\n(.*?)\n---\s*\n(.*?)$'
    match = re.match(yaml_pattern, content, re.DOTALL)
    
    if not match:
        print(f"⚠️  Uyarı: {file_path.name} dosyasında YAML front matter bulunamadı")
        return None
    
    yaml_content = match.group(1)
    description_content = match.group(2).strip()
    
    event = {}
    for line in yaml_content.split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            event[key] = value
    
    event['description'] = description_content
    
    # Dosya adını da JSON'a ekle
    event['filename'] = file_path.name
    
    if 'date' not in event or 'title' not in event:
        print(f"⚠️  Uyarı: {file_path.name} dosyasında 'date' veya 'title' eksik")
        return None
    
    # --- GÜNCELLENMİŞ SAAT İŞLEME MANTIĞI ---
    try:
        event_date_str = event['date'] # YYYY-MM-DD
        event_time_str = event.get('time', None) 
        
        clean_time = None
        if event_time_str:
            clean_time = event_time_str.strip()

        # Regex: Saat formatını (SS:DD) kontrol et (örn: 14:30, 09:05)
        time_pattern = re.compile(r'^([01]\d|2[0-3]):([0-5]\d)$')

        if clean_time and time_pattern.match(clean_time):
            # Saat geçerli ve format doğruysa: T ve saniye :00 ile birleştir
            full_iso_str = f"{event_date_str}T{clean_time}:00"
        else:
            # Saat yoksa, boşsa, "_No response_" ise veya formatı bozuksa: 12:00 kullan
            full_iso_str = f"{event_date_str}T12:00:00"
            
            # Eğer saat alanı dolu ama geçersizse (örn: _No response_) kullanıcıyı bilgilendir
            if clean_time and clean_time != '_No response_':
                print(f"   ℹ️  Bilgi: {file_path.name} dosyasında geçersiz saat formatı ('{clean_time}'). 12:00 varsayılan olarak kullanıldı.")
        
        # String'i tarih nesnesine çevir (Bu, 2025-02-31 gibi geçersiz tarihleri de yakalar)
        event_date = datetime.fromisoformat(full_iso_str)
        
        # event['date']'i JS'nin okuyacağı son ISO string haliyle güncelle
        event['date'] = full_iso_str 
        event['year'] = event_date.year

    except ValueError as e:
        # Hata genellikle geçersiz 'date' alanından (örn: 2025-02-30) kaynaklanır
        print(f"⚠️  Uyarı: {file_path.name} dosyasında geçersiz tarih/saat formatı: {e} (Tarih: {event.get('date')}, Saat: {event.get('time')})")
        return None
    # ------------------------------------
    
    if 'sources' not in event:
        event['sources'] = ""
        
    return event

def generate_events_json():
    """Tüm markdown dosyalarını oku ve events.json oluştur"""
    
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    events_dir = repo_root / 'events' / 'data'
    output_file = repo_root / 'events' / 'events.json'
    
    print(f"📂 Events klasörü: {events_dir}")
    print(f"📝 Çıktı dosyası: {output_file}")
    
    if not events_dir.exists():
        print(f"❌ Events klasörü bulunamadı: {events_dir}")
        return False
    
    events = []
    md_files = list(events_dir.glob('*.md'))
    
    print(f"\n🔍 {len(md_files)} adet .md dosyası bulundu\n")
    
    for md_file in md_files:
        print(f"📖 Okunuyor: {md_file.name}")
        event = parse_markdown_file(md_file)
        if event:
            events.append(event)
            print(f"   ✅ {event['year']} - {event['title']}")
        else:
            print(f"   ❌ Dosya parse edilemedi")
    
    # Olayları tam tarihe göre sırala (ISO string sıralaması çalışır)
    events.sort(key=lambda x: x['date'])
    
    output_data = {
        "events": events,
        "metadata": {
            "total_events": len(events),
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "generator": "Zaman Yolculuğu Event Generator v2.2" # Versiyon güncellendi
        }
    }
    
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✨ Başarılı! {len(events)} olay events.json dosyasına yazıldı")
    print(f"📊 Dosya boyutu: {output_file.stat().st_size} bytes")
    
    return True

if __name__ == "__main__":
    success = generate_events_json()
    exit(0 if success else 1)