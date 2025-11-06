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
            pixelsPerYear: 1800,     // Arttırdım: Her yıl 1800px = Her ay 150px
            showYears: true,
            showMonths: true,
            showDays: false
        },
        {
            id: 3,
            name: 'days',
            pixelsPerYear: 10950,    // Arttırdım: Her yıl 10950px = Her gün ~30px
            showYears: true,
            showMonths: true,
            showDays: true
        }
    ],
    
    // Visual Settings
    COLORS: {
        background: '#ffffff',
        ruler: '#dddddd',
        todayMarker: '#ff4444',
        yearLine: '#999999',
        yearLineThick: '#333333',
        monthLine: '#cccccc',
        dayLine: '#eeeeee',
        eventBar: '#999999',
        eventBarHover: '#666666',
        text: '#333333',
        textLight: '#666666',
        textVeryLight: '#999999'
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
