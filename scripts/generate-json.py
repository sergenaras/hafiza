#!/usr/bin/env python3
"""
Hafıza Cetveli - Event JSON Generator
Bu script events/data/ klasöründeki tüm .md dosyalarını okur ve events.json oluşturur.
"""

import os
import json
import re 
from pathlib import Path
from datetime import datetime

def parse_markdown_file(file_path):
    """Markdown dosyasını parse et ve event bilgilerini çıkar"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    yaml_pattern = r'^---\s*\n(.*?)\n---\s*\n(.*?)$'
    match = re.match(yaml_pattern, content, re.DOTALL)
    
    if not match:
        print(f"⚠️  Uyarı: {file_path.name} dosyasında YAML front matter bulunamadı")
        return None
    
    yaml_content = match.group(1)
    full_content = match.group(2).strip() 
    
    event = {}
    for line in yaml_content.split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            event[key] = value if value.lower() != 'null' and value.lower() != '_no response_' else ''
    
    # --- DÜZELTİLEN SATIR (Gizli etiketi temizle) ---
    # JSON'a gitmeden önce, (varsa) 'FILENAME' etiketini temizle
    full_content = re.sub(r'', '', full_content).strip()
    # -------------------------------------------

    # --- DÜZELTME: AÇIKLAMA VE KAYNAKLARI AYIR ---
    sources_header = "## Kaynaklar"
    header_match = re.search(r'^##\s*Kaynaklar\s*$', full_content, re.MULTILINE | re.IGNORECASE)
    
    if header_match:
        description_part = full_content[:header_match.start()]
        sources_part = full_content[header_match.end():]
        event['description'] = description_part.strip()
        event['sources'] = sources_part.strip()
    else:
        event['description'] = full_content
        event['sources'] = "" 
    # -----------------------------------------------
    
    if event.get('category') == 'diğer' and event.get('other_category'):
        event['category'] = event.get('other_category').strip()
    
    event.pop('other_category', None)

    event['filename'] = file_path.name
    
    if 'date' not in event or 'title' not in event:
        print(f"⚠️  Uyarı: {file_path.name} dosyasında 'date' veya 'title' eksik")
        return None
    
    # --- GÜNCELLENMİŞ SAAT İŞLEME MANTIĞI ---
    try:
        event_date_str = event['date'] 
        event_time_str = event.get('time', None) 

        event['original_time'] = event_time_str.strip() if event_time_str else ""

        clean_time = None
        if event_time_str:
            clean_time = event_time_str.strip()

        time_pattern = re.compile(r'^([01]\d|2[0-3]):([0-5]\d)$')

        if clean_time and time_pattern.match(clean_time):
            full_iso_str = f"{event_date_str}T{clean_time}:00"
        else:
            full_iso_str = f"{event_date_str}T12:00:00"
            
            if clean_time and clean_time != '_No response_':
                print(f"   ℹ️  Bilgi: {file_path.name} dosyasında geçersiz saat formatı ('{clean_time}'). 12:00 varsayılan olarak kullanıldı.")
        
        event_date = datetime.fromisoformat(full_iso_str)
        
        event['date'] = full_iso_str 
        event['year'] = event_date.year
        
        event.pop('time', None)

    except ValueError as e:
        print(f"⚠️  Uyarı: {file_path.name} dosyasında geçersiz tarih/saat formatı: {e} (Tarih: {event.get('date')}, Saat: {event.get('original_time')})")
        return None
    # ------------------------------------
        
    return event

def generate_events_json():
    # ... (Bu fonksiyonun geri kalanı değişmedi) ...
    
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
    
    events.sort(key=lambda x: x['date'])
    
    output_data = {
        "events": events,
        "metadata": {
            "total_events": len(events),
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "generator": "Zaman Yolculuğu Event Generator v2.3"
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