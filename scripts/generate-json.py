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

def extract_title_from_description(description):
    """Açıklamadan ilk cümleyi başlık olarak çıkar"""
    if not description:
        return "Başlıksız Olay"
    
    # İlk cümleyi al (nokta, ünlem, soru işareti ile biten)
    first_sentence_match = re.match(r'^([^.!?]+[.!?])', description.strip())
    if first_sentence_match:
        title = first_sentence_match.group(1).strip()
        # Başlık çok uzunsa kısalt
        if len(title) > 100:
            title = title[:97] + "..."
        return title
    else:
        # Cümle yoksa ilk 50 karakteri al
        return description.strip()[:50] + ("..." if len(description) > 50 else "")

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
        event['