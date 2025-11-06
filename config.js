// Configuration / Environment Variables
window.ENV = {
    // GitHub Repository Settings
    GITHUB_USERNAME: 'sergenaras',
    REPO_NAME: 'hafiza',
    BRANCH: 'main',
    
    // Data Source
    get EVENTS_JSON_URL() {
        return `https://cdn.jsdelivr.net/gh/${this.GITHUB_USERNAME}/${this.REPO_NAME}@${this.BRANCH}/events/events.json`;
    },
    
    // GitHub Issue URL
    get GITHUB_ISSUE_URL() {
        return `https://github.com/${this.GITHUB_USERNAME}/${this.REPO_NAME}/issues/new?template=new-event.yml&title=Yeni+Olay:+`;
    },
    
    // Timeline Settings
    ZOOM_LEVELS: [
        {
            id: 1,
            name: 'years',
            pixelsPerYear: 150,      // Her yıl 150px
            showYears: true,
            showMonths: false,
            showDays: false
        },
        {
            id: 2,
            name: 'months',
            pixelsPerYear: 1800,     // Her yıl 1800px = Her ay 150px
            showYears: true,
            showMonths: true,
            showDays: false
        },
        {
            id: 3,
            name: 'days',
            pixelsPerYear: 10950,    // Her yıl 10950px = Her gün ~30px
            showYears: true,
            showMonths: true,
            showDays: true
        }
    ],
    
    // YENİ: Visual Settings (Beyaz arkaplana uygun renk teorisi)
    COLORS: {
        background: '#FFFFFF',
        text: '#212121',
        textLight: '#757575',
        textVeryLight: '#BDBDBD',
        
        ruler: '#E0E0E0',
        todayMarker: '#E53935',    // Güçlü Kırmızı
        hoverMarker: '#1E88E5',    // Güçlü Mavi (Yeni)
        
        yearLine: '#BDBDBD',
        yearLineThick: '#757575',
        monthLine: '#EEEEEE',
        dayLine: '#F5F5F5',
        
        eventBar: '#757575',
        eventBarHover: '#1E88E5'   // Mavi
    },

    // YENİ: Yerleşim Ayarları
    LAYOUT: {
        rulerYOffset: 150,     // Cetveli dikey merkezden 150px aşağıya kaydır
        infoBoxY: 80,          // Olay bilgi kutusunun dikey konumu (üstte)
        eventBarBaseY: -60     // Olay çubuklarının cetvele göre dikey konumu (cetvelin 60px üstü)
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
    
    // Language
    DEFAULT_LANGUAGE: 'tr',
    
    // Cache Settings
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};