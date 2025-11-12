window.i18n = {
    currentLanguage: window.ENV.DEFAULT_LANGUAGE,
    
    translations: {
        tr: {
            // App
            appName: 'Hafıza Cetveli',
            loading: 'Yükleniyor...',
            addEvent: '+ Olay Ekle',
            goToDate: 'Tarihe Git', 
            
            // Zoom levels
            zoomLevel1: 'Yıllar',
            zoomLevel2: 'Aylar',
            zoomLevel3: 'Günler',
            zoomLevel4: 'Saatler',
            
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
                all: 'Tümü', 
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
            
            // Errors
            errorLoading: 'Olaylar yüklenirken hata oluştu',
            errorNoEvents: 'Henüz olay eklenmemiş',
            
            // Modal
            closeModal: 'Kapat',

            // Panel
            panel: {
                detailsTitle: 'Olay Detayları',
                listTitle: 'Olay Listesi',
                editLink: '(Bu Olayı Düzenle)',
                detailsPlaceholder: 'Olay Listesi üzerinden seçilen bir olayın detayları burada görünecektir.',
                noEventsFound: 'Bu kategoride olay bulunamadı.'
            },
            
            // Buttons
            buttons: {
                edit: 'Düzenle',
                delete: 'Sil'
            },

            // Sort
            sort: {
                newest: 'En Yeni Üstte',
                oldest: 'En Eski Üstte'
            }
        },
        
        en: {
            // App
            appName: 'Memory Timeline',
            loading: 'Loading...',
            addEvent: '+ Add Event',
            goToDate: 'Go to Date',
            
            // Zoom levels
            zoomLevel1: 'Years',
            zoomLevel2: 'Months',
            zoomLevel3: 'Days',
            zoomLevel4: 'Hours',
            
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
                all: 'All',
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
            
            // Errors
            errorLoading: 'Error loading events',
            errorNoEvents: 'No events yet',
            
            // Modal
            closeModal: 'Close',

            // Panel
            panel: {
                detailsTitle: 'Event Details',
                listTitle: 'Event List',
                editLink: '(Edit This Event)',
                detailsPlaceholder: 'Details for a selected event from the list will appear here.',
                noEventsFound: 'No events found in this category.'
            },
            
            // Buttons
            buttons: {
                edit: 'Edit',
                delete: 'Delete'
            },

            // Sort
            sort: {
                newest: 'Newest First',
                oldest: 'Oldest First'
            }
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
                return key;
            }
        }
        
        return value || key;
    },
    
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            this.updateDOM();
        }
    },
    
    updateDOM() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                 if(element.placeholder) element.placeholder = this.t(key);
            } else {
                element.textContent = this.t(key);
            }
        });
    },
    
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
        
        return date.toLocaleString(this.currentLanguage);
    }
};

function initI18n() {
    window.i18n.updateDOM();
}

window.t = (key) => window.i18n.t(key);
window.formatDate = (date, format) => window.i18n.formatDate(date, format);