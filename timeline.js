// Timeline Engine - Canvas Based
class Timeline {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.container = this.canvas.parentElement;
        
        // State
        this.events = [];
        this.zoomLevel = 0; // 0, 1, 2 (years, months, days)
        this.offsetX = 0;
        this.targetOffsetX = 0; // YENİ EKLENDİ: Animasyon hedefi için
        this.zoomMode = 'pinch'; // 'pinch' or 'doubleclick'
        // this.isAnimating = false; // Artık bu şekilde kullanılmıyor
        
        // Touch/Mouse state
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this.touchStartDistance = 0;
        this.lastTouchDistance = 0;
        this.clickCount = 0;
        this.clickTimer = null;
        
        // Hover state
        this.hoveredEvent = null;
        this.selectedEvent = null;
        
        // Today reference
        this.today = new Date();
        
        // Initialize
        this.resize();
        this.setupEventListeners();
        this.loadEvents();
        
        // YENİ EKLENDİ: Animasyon döngüsünü başlat
        this.animate(); 
    }
    
    // Setup canvas size
    resize() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        this.width = rect.width;
        this.height = rect.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        
        // this.render(); // KALDIRILDI: Artık animate() döngüsü render ediyor
    }
    
    // Load events from JSON
    async loadEvents() {
        try {
            const response = await fetch(`${window.ENV.EVENTS_JSON_URL}?t=${Date.now()}`);
            if (!response.ok) throw new Error('Failed to fetch');
            
            const data = await response.json();
            this.events = (data.events || []).map(event => ({
                ...event,
                date: event.date ? new Date(event.date) : new Date(event.year, 0, 1),
                year: event.year,
                title: event.title,
                description: event.description,
                category: event.category || 'diğer'
            }));
            
            // Sort by date
            this.events.sort((a, b) => a.date - b.date);
            
            // Calculate event stacking
            this.calculateEventStacks();
            
            document.getElementById('loading').style.display = 'none';
            // this.render(); // KALDIRILDI: Artık animate() döngüsü render ediyor
        } catch (error) {
            console.error('Error loading events:', error);
            document.getElementById('loading').textContent = window.t('errorLoading');
        }
    }
    
    // Calculate vertical stacking for events on same day
    calculateEventStacks() {
        const dayGroups = {};
        
        this.events.forEach(event => {
            const dayKey = this.getDateKey(event.date);
            if (!dayGroups[dayKey]) {
                dayGroups[dayKey] = [];
            }
            dayGroups[dayKey].push(event);
        });
        
        // Assign stack levels
        Object.values(dayGroups).forEach(group => {
            group.forEach((event, index) => {
                event.stackLevel = Math.min(index, window.ENV.EVENT_MAX_STACK - 1);
            });
        });
    }
    
    getDateKey(date) {
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }
    
    // YENİ EKLENDİ: Ana animasyon döngüsü (pürüzsüz kaydırma için)
    animate() {
        // Easing (yumuşatma) ile hedef offset'e yaklaş
        const dx = this.targetOffsetX - this.offsetX;
        if (Math.abs(dx) > 0.1) {
            this.offsetX += dx * 0.1; // 0.1 = easing faktörü
        } else {
            this.offsetX = this.targetOffsetX;
        }
        
        // Her animasyon karesinde yeniden çiz
        this.render();
        
        // Döngüyü sürdür
        requestAnimationFrame(this.animate.bind(this));
    }
    
    // Main render function
    render() {
        const ctx = this.ctx;
        const level = window.ENV.ZOOM_LEVELS[this.zoomLevel];
        
        // Clear canvas
        ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw ruler line
        ctx.strokeStyle = window.ENV.COLORS.ruler;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, this.centerY);
        ctx.lineTo(this.width, this.centerY);
        ctx.stroke();
        
        // Draw time markers
        if (level.showDays) {
            this.renderDaysView(ctx, level);
        } else if (level.showMonths) {
            this.renderMonthsView(ctx, level);
        } else {
            this.renderYearsView(ctx, level);
        }
        
        // Draw today marker
        this.renderTodayMarker(ctx, level);
        
        // Draw events
        this.renderEvents(ctx, level);
    }
    
    // Render Years View (Level 1)
    renderYearsView(ctx, level) {
        const yearWidth = level.pixelsPerYear;
        const currentYear = this.today.getFullYear();
        
        const startYear = Math.floor((0 - this.centerX - this.offsetX) / yearWidth) + currentYear;
        const endYear = Math.ceil((this.width - this.centerX - this.offsetX) / yearWidth) + currentYear;
        
        for (let year = startYear; year <= endYear; year++) {
            const x = this.centerX + ((year - currentYear) * yearWidth) + this.offsetX;
            
            // Year line
            ctx.strokeStyle = window.ENV.COLORS.yearLine;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, this.centerY - 15);
            ctx.lineTo(x, this.centerY + 15);
            ctx.stroke();
            
            // Year label
            ctx.fillStyle = window.ENV.COLORS.text;
            ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(year.toString(), x, this.centerY + 35);
        }
    }
    
    // Render Months View (Level 2)
    renderMonthsView(ctx, level) {
        const yearWidth = level.pixelsPerYear;
        const monthWidth = yearWidth / 12;
        const currentYear = this.today.getFullYear();
        
        const startYear = Math.floor((0 - this.centerX - this.offsetX) / yearWidth) + currentYear - 1;
        const endYear = Math.ceil((this.width - this.centerX - this.offsetX) / yearWidth) + currentYear + 1;
        
        for (let year = startYear; year <= endYear; year++) {
            const yearX = this.centerX + ((year - currentYear) * yearWidth) + this.offsetX;
            
            // Year line (thick)
            ctx.strokeStyle = window.ENV.COLORS.yearLineThick;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(yearX, this.centerY - 20);
            ctx.lineTo(yearX, this.centerY + 20);
            ctx.stroke();
            
            // Year label
            ctx.fillStyle = window.ENV.COLORS.text;
            ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(year.toString(), yearX, this.centerY + 40);
            
            // Month lines and labels
            for (let month = 0; month < 12; month++) {
                const monthX = yearX + (month * monthWidth);
                
                // Month line (thin)
                ctx.strokeStyle = window.ENV.COLORS.monthLine;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(monthX, this.centerY - 12);
                ctx.lineTo(monthX, this.centerY + 12);
                ctx.stroke();
                
                // Month label (vertical)
                ctx.save();
                ctx.translate(monthX, this.centerY - 20);
                ctx.rotate(-Math.PI / 2);
                ctx.fillStyle = window.ENV.COLORS.textLight;
                ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
                ctx.textAlign = 'right';
                ctx.fillText(window.i18n.t('months.full')[month], 0, 0);
                ctx.restore();
            }
        }
    }
    
    // Render Days View (Level 3)
    renderDaysView(ctx, level) {
        const yearWidth = level.pixelsPerYear;
        const dayWidth = yearWidth / 365;
        const currentYear = this.today.getFullYear();
        
        const startYear = Math.floor((0 - this.centerX - this.offsetX) / yearWidth) + currentYear - 1;
        const endYear = Math.ceil((this.width - this.centerX - this.offsetX) / yearWidth) + currentYear + 1;
        
        for (let year = startYear; year <= endYear; year++) {
            const yearX = this.centerX + ((year - currentYear) * yearWidth) + this.offsetX;
            
            // Draw months
            for (let month = 0; month < 12; month++) {
                const monthStart = new Date(year, month, 1);
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const dayOfYear = this.getDayOfYear(monthStart);
                const monthX = yearX + (dayOfYear * dayWidth);
                
                // Month line (thick)
                ctx.strokeStyle = window.ENV.COLORS.yearLineThick;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(monthX, this.centerY - 18);
                ctx.lineTo(monthX, this.centerY + 18);
                ctx.stroke();
                
                // Month label (vertical)
                ctx.save();
                ctx.translate(monthX, this.centerY - 25);
                ctx.rotate(-Math.PI / 2);
                ctx.fillStyle = window.ENV.COLORS.text;
                ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
                ctx.textAlign = 'right';
                ctx.fillText(window.i18n.t('months.full')[month], 0, 0);
                ctx.restore();
                
                // Draw days
                for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(year, month, day);
                    const dayOfYearNum = this.getDayOfYear(date);
                    const dayX = yearX + (dayOfYearNum * dayWidth);
                    
                    // Day line
                    ctx.strokeStyle = window.ENV.COLORS.dayLine;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(dayX, this.centerY - 8);
                    ctx.lineTo(dayX, this.centerY + 8);
                    ctx.stroke();
                    
                    // Day number (horizontal, above ruler)
                    ctx.fillStyle = window.ENV.COLORS.textVeryLight;
                    ctx.font = '9px -apple-system, BlinkMacSystemFont, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(day.toString(), dayX, this.centerY - 15);
                }
            }
            
            // Year label at end
            ctx.fillStyle = window.ENV.COLORS.text;
            ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            const yearEndX = yearX + yearWidth;
            ctx.fillText(year.toString(), yearEndX, this.centerY + 40);
        }
    }
    
    getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }
    
    // Render today marker
    renderTodayMarker(ctx, level) {
        // DEĞİŞTİRİLDİ: 'today' anlık olarak hesaplanmıyor, this.today kullanılıyor
        // 'today'in 'offsetX'e göre konumu
        const todayDiffMs = this.today.getTime() - new Date(this.today.getFullYear(), 0, 0).getTime();
        const todayDayOfYear = todayDiffMs / (1000 * 60 * 60 * 24);
        
        const pixelsPerDay = level.pixelsPerYear / 365;
        
        // Bugün'ün x konumu, *sadece* this.offsetX'e değil,
        // (bugünün yıl içindeki konumu - bugünün yıl içindeki konumu) = 0'a göre hesaplanmalı
        // ... pardon, en basiti şu:
        // 'today'in x konumu her zaman merkez + offset olmalı
        
        const x = this.centerX + this.offsetX;
        
        // Red line
        ctx.strokeStyle = window.ENV.COLORS.todayMarker;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, this.centerY - 100);
        ctx.lineTo(x, this.centerY + 100);
        ctx.stroke();
        
        // "Şimdi" label
        ctx.fillStyle = window.ENV.COLORS.todayMarker;
        ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(window.t('now').toUpperCase(), x, this.centerY - 110);
    }
    
    // Render events
    renderEvents(ctx, level) {
        const yearWidth = level.pixelsPerYear;
        const currentYear = this.today.getFullYear();
        
        this.events.forEach(event => {
            const eventDate = event.date;
            
            // DEĞİŞTİRİLDİ: Olayın X konumunu 'today' referansına göre hesapla
            const diffMs = eventDate.getTime() - this.today.getTime();
            const diffDays = diffMs / (1000 * 60 * 60 * 24);
            const pixelsPerDay = level.pixelsPerYear / 365;
            
            // Olayın x konumu = merkez + (bugünden fark * gün başına piksel) + genel offset
            const x = this.centerX + (diffDays * pixelsPerDay) + this.offsetX;
            
            // Check if visible
            if (x < -50 || x > this.width + 50) return;
            
            // Event bar
            const barHeight = window.ENV.EVENT_BAR_HEIGHT;
            const barSpacing = window.ENV.EVENT_BAR_SPACING;
            const yOffset = (event.stackLevel || 0) * (barHeight + barSpacing);
            const y = this.centerY - 40 - yOffset;
            const barWidth = 3;
            
            // Color
            const isHovered = this.hoveredEvent === event;
            ctx.fillStyle = isHovered ? window.ENV.COLORS.eventBarHover : window.ENV.COLORS.eventBar;
            
            // Draw bar
            ctx.fillRect(x - barWidth/2, y - barHeight, barWidth, barHeight);
            
            // Store position for hit detection
            event._renderX = x;
            event._renderY = y;
            event._renderWidth = barWidth;
            event._renderHeight = barHeight;
        });
    }
    
    // Event listeners setup
    setupEventListeners() {
        // Resize
        window.addEventListener('resize', () => this.resize());
        
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('mouseleave', () => this.onMouseLeave());
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
        this.canvas.addEventListener('click', (e) => this.onClick(e));
        this.canvas.addEventListener('dblclick', (e) => this.onDoubleClick(e));
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.onTouchEnd(e));
    }
    
    onMouseDown(e) {
        if (this.zoomMode === 'doubleclick') {
            this.isDragging = true;
            this.lastX = e.clientX;
            this.canvas.classList.add('grabbing');
            
            // YENİ EKLENDİ: Sürüklemeye başlarken animasyonu durdur ve mevcut konumu hedef yap
            this.targetOffsetX = this.offsetX; 
        }
    }
    
    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.isDragging && this.zoomMode === 'doubleclick') {
            const dx = e.clientX - this.lastX;
            // DEĞİŞTİRİLDİ: 'offsetX'i değil, 'targetOffsetX'i güncelle
            this.targetOffsetX += dx; 
            this.lastX = e.clientX;
            // this.render(); // KALDIRILDI: 'animate' döngüsü render ediyor
        } else {
            // Check hover
            this.checkHover(x, y);
        }
    }
    
    onMouseUp(e) {
        this.isDragging = false;
        this.canvas.classList.remove('grabbing');
    }
    
    onMouseLeave() {
        this.isDragging = false;
        this.canvas.classList.remove('grabbing');
        this.hideTooltip();
    }
    
    onWheel(e) {
        if (this.zoomMode !== 'pinch') return;
        
        e.preventDefault();
        
        // Pan with shift, zoom without
        if (e.shiftKey) {
            // DEĞİŞTİRİLDİ: 'offsetX'i değil, 'targetOffsetX'i güncelle
            this.targetOffsetX -= e.deltaY;
            // this.render(); // KALDIRILDI: 'animate' döngüsü render ediyor
        } else {
            // Zoom
            if (e.deltaY < 0 && this.zoomLevel < window.ENV.ZOOM_LEVELS.length - 1) {
                this.zoomIn();
            } else if (e.deltaY > 0 && this.zoomLevel > 0) {
                this.zoomOut();
            }
        }
    }
    
    onClick(e) {
        // YENİ EKLENDİ: Eğer sürükleme yapılıyorsa tıklamayı iptal et
        if (Math.abs(this.targetOffsetX - this.offsetX) > 2) return; 

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const clickedEvent = this.getEventAtPosition(x, y);
        if (clickedEvent) {
            this.showEventModal(clickedEvent);
        }
    }
    
    onDoubleClick(e) {
        if (this.zoomMode === 'doubleclick') {
            this.zoomIn();
        }
    }
    
    onTouchStart(e) {
        e.preventDefault();
        
        if (e.touches.length === 1) {
            this.isDragging = true;
            this.lastX = e.touches[0].clientX;
            this.lastY = e.touches[0].clientY;
            
            // YENİ EKLENDİ: Sürüklemeye başlarken animasyonu durdur
            this.targetOffsetX = this.offsetX;
            
        } else if (e.touches.length === 2 && this.zoomMode === 'pinch') {
            const dx = e.touches[1].clientX - e.touches[0].clientX;
            const dy = e.touches[1].clientY - e.touches[0].clientY;
            this.touchStartDistance = Math.sqrt(dx*dx + dy*dy);
            this.lastTouchDistance = this.touchStartDistance;
        }
    }
    
    onTouchMove(e) {
        e.preventDefault();
        
        if (e.touches.length === 1 && this.isDragging) {
            const dx = e.touches[0].clientX - this.lastX;
            // DEĞİŞTİRİLDİ: 'offsetX'i değil, 'targetOffsetX'i güncelle
            this.targetOffsetX += dx;
            this.lastX = e.touches[0].clientX;
            // this.render(); // KALDIRILDI
        } else if (e.touches.length === 2 && this.zoomMode === 'pinch') {
            const dx = e.touches[1].clientX - e.touches[0].clientX;
            const dy = e.touches[1].clientY - e.touches[0].clientY;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if (Math.abs(distance - this.lastTouchDistance) > window.ENV.MIN_PINCH_DISTANCE) {
                if (distance > this.lastTouchDistance) {
                    this.zoomIn();
                } else {
                    this.zoomOut();
                }
                this.lastTouchDistance = distance;
            }
        }
    }
    
    onTouchEnd(e) {
        this.isDragging = false;
        this.touchStartDistance = 0;
    }
    
    checkHover(x, y) {
        const hoveredEvent = this.getEventAtPosition(x, y);
        
        if (hoveredEvent !== this.hoveredEvent) {
            this.hoveredEvent = hoveredEvent;
            
            if (hoveredEvent) {
                this.showTooltip(hoveredEvent, x, y);
            } else {
                this.hideTooltip();
            }
            
            // this.render(); // KALDIRILDI - 'animate' döngüsü zaten render ediyor
            // Ancak, hover durumunun *anında* güncellenmesi için bu kalmalı.
            // 'animate' döngüsü yavaş olabilir.
            // Düşünelim: 'animate' döngüsü zaten saniyede 60 kez render ediyor.
            // Bu yüzden 'checkHover' içinde render'a gerek YOKTUR.
        }
    }
    
    getEventAtPosition(x, y) {
        for (const event of this.events) {
            if (!event._renderX) continue;
            
            const hitMargin = 10;
            if (x >= event._renderX - hitMargin &&
                x <= event._renderX + hitMargin &&
                y >= event._renderY - event._renderHeight - hitMargin &&
                y <= event._renderY + hitMargin) {
                return event;
            }
        }
        return null;
    }
    
    showTooltip(event, x, y) {
        const tooltip = document.getElementById('tooltip');
        tooltip.textContent = event.title;
        tooltip.style.left = x + 'px';
        tooltip.style.top = (y - 40) + 'px';
        tooltip.classList.add('active');
    }
    
    hideTooltip() {
        document.getElementById('tooltip').classList.remove('active');
    }
    
    showEventModal(event) {
        document.getElementById('modalDate').textContent = window.formatDate(event.date, 'full');
        document.getElementById('modalTitle').textContent = event.title;
        document.getElementById('modalDescription').textContent = event.description;
        document.getElementById('modalCategory').textContent = window.t(`categories.${event.category}`);
        document.getElementById('modalOverlay').classList.add('active');
    }
    
    zoomIn() {
        if (this.zoomLevel < window.ENV.ZOOM_LEVELS.length - 1) {
            this.zoomLevel++;
            this.showZoomIndicator();
            // this.render(); // KALDIRILDI
        }
    }
    
    zoomOut() {
        if (this.zoomLevel > 0) {
            this.zoomLevel--;
            this.showZoomIndicator();
            // this.render(); // KALDIRILDI
        }
    }
    
    showZoomIndicator() {
        const indicator = document.getElementById('zoomIndicator');
        const level = window.ENV.ZOOM_LEVELS[this.zoomLevel];
        indicator.textContent = `×${level.id} - ${window.t('zoomLevel'D + level.id)}`;
        indicator.classList.add('active');
        
        setTimeout(() => {
            indicator.classList.remove('active');
        }, 1500);
    }
    
    setZoomMode(mode) {
        this.zoomMode = mode;
    }
    
    // reset() { // Bu fonksiyon artık 'goToToday' oldu
    //     this.zoomLevel = 0;
    //     this.offsetX = 0;
    //     this.render();
    // }
    
    // YENİ EKLENDİ: 'goToToday' fonksiyonu (UX Önerisi 2)
    goToToday() {
        this.targetOffsetX = 0;
    }
    
    // YENİ EKLENDİ: 'goToDate' fonksiyonu (UX Önerisi 2)
    goToDate(selectedDate) {
        // 'today' ile 'selectedDate' arasındaki gün farkını hesapla
        const diffMs = selectedDate.getTime() - this.today.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        
        // Mevcut zoom seviyesindeki 'gün başına piksel' değerini bul
        const level = window.ENV.ZOOM_LEVELS[this.zoomLevel];
        const pixelsPerDay = level.pixelsPerYear / 365;
        
        // Hedef offset'i ayarla (ters yönde)
        // Eğer 10 gün sonraya gidiyorsak (diffDays = 10),
        // timeline'ı sola çekmeliyiz (offset negatif olmalı).
        this.targetOffsetX = -(diffDays * pixelsPerDay);
    }
}

// Initialize timeline
function initTimeline() {
    window.timeline = new Timeline('timelineCanvas');
}