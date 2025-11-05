// Internationalization (i18n) System
window.i18n = {
    currentLanguage: window.ENV.DEFAULT_LANGUAGE,
    
    translations: {
        tr: {
            // App
            appName: 'Hafıza Cetveli',
            loading: 'Yükleniyor...',
            addEvent: '+ Olay Ekle',
            
            // Zoom modes
            zoomPinch: 'Pinch Zoom',
            zoomDoubleClick: 'Çift Tıklama',
            
            // Instructions
            instructionsPinch: '🤏 Pinch: Zoom | 👆 Sürükle: Hareket',
            instructionsDoubleClick: '🖱️ Çift Tık: Zoom | 🔽 Basılı Tut & Sürükle: Hareket',
            
            // Zoom levels
            zoomLevel1: 'Yıllar',
            zoomLevel2: 'Aylar',
            zoomLevel3: 'Günler',
            
            // Months
            months: {
                full: [
                    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
                ],
                short: [
                    'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
                    'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'
                ]
            },
            
            // Days of week
            days: {
                full: [
                    'Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'
                ],
                short: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
            },
            
            // Categories
            categories: {
                teknoloji: 'Teknoloji',
                bilim: 'Bilim',
                tarih: 'Tarih',
                kültür: 'Kültür',
                spor: 'Spor',
                politika: 'Politika',
                diğer: 'Diğer',
                film: 'Film'
            },
            
            // Time references
            today: 'Bugün',
            now: 'Şimdi',
            
            // Stats
            totalEvents: 'Toplam',
            pastEvents: 'Geçmiş',
            futureEvents: 'Gelecek',
            
            // Errors
            errorLoading: 'Olaylar yüklenirken hata oluştu',
            errorNoEvents: 'Henüz olay eklenmemiş',
            
            // Modal
            closeModal: 'Kapat'
        },
        
        en: {
            // App
            appName: 'Memory Timeline',
            loading: 'Loading...',
            addEvent: '+ Add Event',
            
            // Zoom modes
            zoomPinch: 'Pinch Zoom',
            zoomDoubleClick: 'Double Click',
            
            // Instructions
            instructionsPinch: '🤏 Pinch: Zoom | 👆 Drag: Move',
            instructionsDoubleClick: '🖱️ Double Click: Zoom | 🔽 Hold & Drag: Move',
            
            // Zoom levels
            zoomLevel1: 'Years',
            zoomLevel2: 'Months',
            zoomLevel3: 'Days',
            
            // Months
            months: {
                full: [
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                ],
                short: [
                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                ]
            },
            
            // Days of week
            days: {
                full: [
                    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
                ],
                short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            },
            
            // Categories
            categories: {
                teknoloji: 'Technology',
                bilim: 'Science',
                tarih: 'History',
                kültür: 'Culture',
                spor: 'Sports',
                politika: 'Politics',
                diğer: 'Other',
                film: 'Film'
            },
            
            // Time references
            today: 'Today',
            now: 'Now',
            
            // Stats
            totalEvents: 'Total',
            pastEvents: 'Past',
            futureEvents: 'Future',
            
            // Errors
            errorLoading: 'Error loading events',
            errorNoEvents: 'No events yet',
            
            // Modal
            closeModal: 'Close'
        }
    },
    
    // Get translation
    t(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return key; // Return key if translation not found
            }
        }
        
        return value || key;
    },
    
    // Set language
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            this.updateDOM();
        }
    },
    
    // Update DOM elements with i18n attributes
    updateDOM() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });
    },
    
    // Format date
    formatDate(date, format = 'full') {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();
        
        if (format === 'full') {
            return `${day} ${this.t('months.full')[month]} ${year}`;
        } else if (format === 'short') {
            return `${day} ${this.t('months.short')[month]} ${year}`;
        } else if (format === 'yearMonth') {
            return `${this.t('months.full')[month]} ${year}`;
        }
        
        return date.toLocaleDateString(this.currentLanguage);
    }
};

// Initialize i18n
function initI18n() {
    window.i18n.updateDOM();
}

// Export for use in other modules
window.t = (key) => window.i18n.t(key);
window.formatDate = (date, format) => window.i18n.formatDate(date, format);
