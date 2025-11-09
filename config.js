// Configuration / Environment Variables
window.ENV = {
    // GitHub Repository Settings (Geri geldi)
    GITHUB_USERNAME: 'sergenaras',
    REPO_NAME: 'hafiza',
    BRANCH: 'main',
    
    // Data Source (Geri geldi)
    get EVENTS_JSON_URL() {
        return `https://cdn.jsdelivr.net/gh/${this.GITHUB_USERNAME}/${this.REPO_NAME}@${this.BRANCH}/events/events.json`;
    },
    
    // GitHub Issue URL (Geri geldi)
    get GITHUB_ISSUE_URL() {
        return `https://github.com/${this.GITHUB_USERNAME}/${this.REPO_NAME}/issues/new?template=new-event.yml&title=Yeni+Olay:+`;
    },
    
    ZOOM_LEVELS: [
        { id: 1, pixelsPerYear: 100, showDays: false, showMonths: false }, // x1 Yıl
        { id: 2, pixelsPerYear: 1200, showDays: false, showMonths: true }, // x2 Ay
        { id: 3, pixelsPerYear: 365 * 50, showDays: true, showMonths: true }, // x3 Gün
        { id: 4, pixelsPerYear: 365 * 24 * 60, showDays: true, showMonths: true, showHours: true } // x4 Saat
    ],
    
    // Visual Settings (Yeni Renk Paleti)
    COLORS: {
        background: '#FFFFFF',
        text: '#212121',
        textLight: '#757575',
        textVeryLight: '#BDBDBD',
        
        ruler: '#E0E0E0',
        todayMarker: '#E53935',    // Güçlü Kırmızı
        hoverMarker: '#1E88E5',    // Güçlü Mavi
        
        yearLine: '#BDBDBD',
        yearLineThick: '#757575',
        monthLine: '#EEEEEE',
        dayLine: '#F5F5F5',
        
        eventBar: '#757575',
        eventBarHover: '#1E88E5'   // Mavi
    },

    // Yerleşim Ayarları (Doğru ve güncel)
    LAYOUT: {
        rulerYOffset: 0,       // DÜZELTME: 0 olarak ayarlandı (ortalamak için)
        infoBoxY: 80,          // Bu artık kullanılmıyor ama kalsın
        eventBarBaseY: -60,    // Olay çubuklarının cetvele göre dikey konumu (cetvelin 60px üstü)
        markerLineLength: 40,  // Kırmızı ve mavi çizgilerin toplam uzunluğu
        monthLabelOffset: 25   // Ay isimlerinin cetvelden dikey uzaklığı
    },
    
    // Event Display Settings
    EVENT_BAR_HEIGHT: 8,
    EVENT_BAR_SPACING: 4,
    EVENT_MAX_STACK: 5,
    
    // Animation Settings
    ANIMATION_DURATION: 300,
    ANIMATION_EASING: 'easeOutCubic',
    
    // Touch/Gesture Settings
    PINCH_ZOOM_SENSITIVITY: 0.005,
    MIN_PINCH_DISTANCE: 50,
    DOUBLE_CLICK_DELAY: 300,
    
    // Language (EN ÖNEMLİ DÜZELTME - Geri geldi)
    DEFAULT_LANGUAGE: 'tr',
    
    // Cache Settings
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};