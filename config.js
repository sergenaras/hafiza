window.ENV = {
    EVENTS_JSON_URL: './events.json', // URL of your events JSON file
    GITHUB_ISSUE_URL: 'https://github.com/sergeneraras/hafiza/issues/new?assignees=sergeneraras&labels=event&projects=&template=olay-ekle.md&title=Yeni+olay%3A+%5BOLAY+ADI%5D', // URL for adding new events

    // Zoom Levels Configuration
    ZOOM_LEVELS: [
        { id: 1, label: 'Years', pixelsPerYear: 50 },    // Default - 50 pixels per year
        { id: 2, label: 'Months', pixelsPerYear: 150 },   // 150 pixels per year
        { id: 3, label: 'Days', pixelsPerYear: 730 }     // ~2 pixels per day
    ],

    // Layout Settings
    LAYOUT: {
        rulerYOffset: 0, // Cetvelin dikey merkezden ofseti. 0 = tam orta.
        eventBarBaseY: 60, // Olay çubuklarının cetvele göre dikey ofseti
        monthLabelOffset: 60, // Ay etiketlerinin cetvele göre dikey ofseti (döndürüldüğü için X ekseninde)
        markerLineLength: 60, // Today/Hover çizgisinin uzunluğu
        infoBoxY: 20 // KALDIRILDI, artık index.html'deki panel kullanılıyor
    },

    // Event Bar Settings
    EVENT_BAR_HEIGHT: 12,
    EVENT_BAR_SPACING: 4, // Space between stacked event bars
    EVENT_MAX_STACK: 3, // Maximum number of events to stack vertically before overlapping

    // Colors
    COLORS: {
        background: '#f4f4f4',
        ruler: '#ccc',
        todayMarker: '#e74c3c', // Red
        hoverMarker: '#3498db', // Blue
        yearLine: '#aaa',
        yearLineThick: '#888',
        monthLine: '#bbb',
        dayLine: '#ddd',
        text: '#333',
        textLight: '#777',
        textVeryLight: '#999',
        eventBar: '#6c5ce7', // Purple
        eventBarHover: '#a29bfe' // Lighter purple
    },

    MIN_PINCH_DISTANCE: 10 // Minimum pixel change for pinch zoom to register
};