#!/usr/bin/env python3
"""
Zaman Çizelgesi - Event JSON Generator
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
    
    # YAML front matter'ı parse et
    yaml_pattern = r'^---\s*\n(.*?)\n---\s*\n(.*)$'
    match = re.match(yaml_pattern, content, re.DOTALL)
    
    if not match:
        print(f"⚠️  Uyarı: {file_path} dosyasında YAML front matter bulunamadı")
        return None
    
    yaml_content = match.group(1)
    description = match.group(2).strip()
    
    # YAML alanlarını parse et
    event = {}
    for line in yaml_content.split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            event[key] = value
    
    # Açıklamayı ekle
    event['description'] = description
    
    # Gerekli alanları kontrol et
    if 'year' not in event or 'title' not in event:
        print(f"⚠️  Uyarı: {file_path} dosyasında 'year' veya 'title' eksik")
        return None
    
    # Year'ı integer'a çevir
    try:
        event['year'] = int(event['year'])
    except ValueError:
        print(f"⚠️  Uyarı: {file_path} dosyasında geçersiz yıl değeri: {event['year']}")
        return None
    
    return event

def generate_events_json():
    """Tüm markdown dosyalarını oku ve events.json oluştur"""
    
    # Dosya yollarını belirle
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    events_dir = repo_root / 'events' / 'data'
    output_file = repo_root / 'events' / 'events.json'
    
    print(f"📂 Events klasörü: {events_dir}")
    print(f"📝 Çıktı dosyası: {output_file}")
    
    # Events klasörünü kontrol et
    if not events_dir.exists():
        print(f"❌ Events klasörü bulunamadı: {events_dir}")
        return False
    
    # Tüm markdown dosyalarını oku
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
    
    # Olayları yıla göre sırala
    events.sort(key=lambda x: x['year'])
    
    # JSON oluştur
    output_data = {
        "events": events,
        "metadata": {
            "total_events": len(events),
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "generator": "Zaman Yolculuğu Event Generator v1.0"
        }
    }
    
    # JSON dosyasını yaz
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✨ Başarılı! {len(events)} olay events.json dosyasına yazıldı")
    print(f"📊 Dosya boyutu: {output_file.stat().st_size} bytes")
    
    return True

if __name__ == "__main__":
    success = generate_events_json()
    exit(0 if success else 1)
