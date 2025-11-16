#!/usr/bin/env python3
"""
Hafıza Cetveli - Event JSON Generator (Improved Version)
Bu script events/data/ klasöründeki tüm .md dosyalarını okur ve events.json oluşturur.
"""

import os
import json
import re
from pathlib import Path
from datetime import datetime
import sys

def clean_text(text):
    """Metni temizle - gizli etiketleri ve gereksiz boşlukları kaldır"""
    if not text:
        return ""
    
    # Gizli HTML comment'lerini kaldır
    text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)
    
    # _No response_ veya *No response* ifadelerini temizle
    text = re.sub(r'[_*]No response[_*]', '', text)
    
    # Birden fazla boş satırı tek satıra indir
    text = re.sub(r'\n\s*\n+', '\n\n', text)
    
    return text.strip()

def parse_markdown_file(file_path):
    """Markdown dosyasını parse et ve event bilgilerini çıkar"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"⚠️  HATA: {file_path.name} dosyası okunamadı: {e}")
        return None
    
    # YAML front matter'ı ayır
    yaml_pattern = r'^---\s*\n(.*?)\n---\s*\n(.*?)$'
    match = re.match(yaml_pattern, content, re.DOTALL)
    
    if not match:
        print(f"⚠️  Uyarı: {file_path.name} dosyasında YAML front matter bulunamadı")
        return None
    
    yaml_content = match.group(1)
    body_content = match.group(2).strip()
    
    # YAML'ı parse et
    event = {}
    for line in yaml_content.split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            
            # Boş veya geçersiz değerleri temizle
            if value and value.lower() not in ['null', 'none', '_no response_', '*no response*']:
                event[key] = value
            else:
                event[key] = ''
    
    # Body içeriğini temizle
    body_content = clean_text(body_content)
    
    # Açıklama ve kaynakları ayır
    sources_pattern = r'^##\s*Kaynaklar\s*$'
    sources_match = re.search(sources_pattern, body_content, re.MULTILINE | re.IGNORECASE)
    
    if sources_match:
        # Kaynaklar bölümünden önce ve sonrasını ayır
        description = body_content[:sources_match.start()].strip()
        sources = body_content[sources_match.end():].strip()
        
        event['description'] = clean_text(description)
        event['sources'] = clean_text(sources)
    else:
        # Kaynaklar bölümü yoksa tüm içerik açıklama olsun
        event['description'] = body_content
        event['sources'] = ''
    
    # Kategori kontrolü
    if event.get('category') == 'diğer' and event.get('other_category'):
        event['category'] = event.get('other_category').strip()
    
    # Gereksiz alanları temizle
    event.pop('other_category', None)
    
    # Dosya adını ekle (debugging için)
    event['filename'] = file_path.name
    
    # Zorunlu alanları kontrol et
    if not event.get('title'):
        print(f"⚠️  Uyarı: {file_path.name} dosyasında 'title' eksik")
        return None
    
    if not event.get('date'):
        print(f"⚠️  Uyarı: {file_path.name} dosyasında 'date' eksik")
        return None
    
    # Tarih ve saat işleme
    try:
        event_date_str = event.get('date', '').strip()
        event_time_str = event.get('time', '').strip()
        
        # Orijinal saat değerini sakla (UI'da göstermek için)
        event['original_time'] = event_time_str if event_time_str else ""
        
        # Saat formatını kontrol et (SS:DD)
        time_pattern = re.compile(r'^([01]\d|2[0-3]):([0-5]\d)$')
        
        if event_time_str and time_pattern.match(event_time_str):
            # Geçerli saat varsa ISO formatına çevir
            full_iso_str = f"{event_date_str}T{event_time_str}:00"
        else:
            # Geçerli saat yoksa varsayılan olarak 12:00 kullan
            full_iso_str = f"{event_date_str}T12:00:00"
            
            if event_time_str and event_time_str not in ['', '_No response_', '*No response*']:
                print(f"   ℹ️  Bilgi: {file_path.name} - Geçersiz saat formatı ('{event_time_str}'). Varsayılan: 12:00")
        
        # Tarihi parse et
        event_date = datetime.fromisoformat(full_iso_str)
        
        # JSON için ISO string olarak sakla
        event['date'] = full_iso_str
        event['year'] = event_date.year
        
        # time alanını kaldır (date içinde zaten var)
        event.pop('time', None)
        
    except ValueError as e:
        print(f"⚠️  HATA: {file_path.name} - Geçersiz tarih formatı: {e}")
        print(f"   Tarih: {event.get('date')}, Saat: {event.get('time')}")
        return None
    
    return event

def generate_events_json():
    """Ana fonksiyon - events.json dosyasını oluştur"""
    
    # Dizin yapısını bul
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    events_dir = repo_root / 'events' / 'data'
    output_file = repo_root / 'events' / 'events.json'
    
    print(f"📂 Events klasörü: {events_dir}")
    print(f"📄 Çıktı dosyası: {output_file}")
    print("-" * 50)
    
    # Events klasörünü kontrol et
    if not events_dir.exists():
        print(f"❌ HATA: Events klasörü bulunamadı: {events_dir}")
        return False
    
    # .md dosyalarını bul
    md_files = sorted(list(events_dir.glob('*.md')))
    
    if not md_files:
        print(f"⚠️  Uyarı: {events_dir} klasöründe hiç .md dosyası bulunamadı")
        # Boş bir JSON oluştur
        output_data = {
            "events": [],
            "metadata": {
                "total_events": 0,
                "generated_at": datetime.utcnow().isoformat() + "Z",
                "generator": "Hafiza Cetveli JSON Generator v2.0"
            }
        }
        output_file.parent.mkdir(parents=True, exist_ok=True)
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        print("✨ Boş events.json dosyası oluşturuldu")
        return True
    
    print(f"📚 {len(md_files)} adet .md dosyası bulundu\n")
    
    # Olayları parse et
    events = []
    success_count = 0
    error_count = 0
    
    for md_file in md_files:
        print(f"📖 İşleniyor: {md_file.name}")
        event = parse_markdown_file(md_file)
        
        if event:
            events.append(event)
            success_count += 1
            print(f"   ✅ {event['year']} - {event['title']}")
        else:
            error_count += 1
            print(f"   ❌ Dosya parse edilemedi")
    
    print("\n" + "-" * 50)
    print(f"📊 Özet: {success_count} başarılı, {error_count} hatalı")
    
    # Olayları tarihe göre sırala (en yeni önce)
    events.sort(key=lambda x: x['date'], reverse=True)
    
    # Çıktı JSON'ı oluştur
    output_data = {
        "events": events,
        "metadata": {
            "total_events": len(events),
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "generator": "Hafiza Cetveli JSON Generator v2.0",
            "success_count": success_count,
            "error_count": error_count
        }
    }
    
    # JSON dosyasını yaz
    try:
        output_file.parent.mkdir(parents=True, exist_ok=True)
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        
        print("-" * 50)
        print(f"✨ BAŞARILI! {len(events)} olay events.json dosyasına yazıldı")
        print(f"📊 Dosya boyutu: {output_file.stat().st_size:,} bytes")
        print(f"📍 Konum: {output_file}")
        
        return True
        
    except Exception as e:
        print(f"❌ HATA: JSON dosyası yazılamadı: {e}")
        return False

def main():
    """Ana giriş noktası"""
    print("=" * 50)
    print("🚀 Hafıza Cetveli JSON Generator v2.0")
    print("=" * 50)
    print()
    
    success = generate_events_json()
    
    print()
    print("=" * 50)
    
    if success:
        print("✅ İşlem başarıyla tamamlandı!")
        sys.exit(0)
    else:
        print("❌ İşlem hatalı sonuçlandı!")
        sys.exit(1)

if __name__ == "__main__":
    main()
