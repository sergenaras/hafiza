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
        this.targetOffsetX = 0; // Animasyon hedefi için
        this.zoomMode = 'pinch'; // 'pinch' or 'doubleclick'
        
        // Touch/Mouse state
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this.touchStartDistance = 0;
        this.lastTouchDistance = 0;
        
        // Hover state
        this.hoveredEvent = null;
        this.selectedEvent = null;
        this.hoverX = -1; // Mavi hover çizgisi için mouse X konumu
        
        // Today reference
        this.today = new Date();
        
        // Initialize
        this.resize();
        this.setupEventListeners();
        this.loadEvents();
        
        // Animasyon döngüsünü başlat
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
        this.centerY = this.height / 2; // Dikey merkez
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
    
    // Ana animasyon döngüsü (pürüzsüz kaydırma için)
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
        
        // Cetvelin dikey konumunu config'den al
        const baselineY = this.centerY + window.ENV.LAYOUT.rulerYOffset;
        
        // Clear canvas
        ctx.fillStyle = window.ENV.COLORS.background;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw ruler line
        ctx.strokeStyle = window.ENV.COLORS.ruler;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, baselineY);
        ctx.lineTo(this.width, baselineY);
        ctx.stroke();
        
        // Draw time markers
        if (level.showDays) {
            this.renderDaysView(ctx, level, baselineY);
        } else if (level.showMonths) {
            this.renderMonthsView(ctx, level, baselineY);
        } else {
            this.renderYearsView(ctx, level, baselineY);
        }
        
        // Draw today marker
        this.renderTodayMarker(ctx, level, baselineY);
        
        // Draw events
        this.renderEvents(ctx, level, baselineY);

        // Mavi hover çizgisini çiz
        this.renderHoverMarker(ctx, baselineY);

        // Üstteki bilgi kutusunu çiz
        this.renderInfoBox(ctx);
    }
    
    // Render Years View (Level 1)
    renderYearsView(ctx, level, baselineY) {
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
            ctx.moveTo(x, baselineY - 15);
            ctx.lineTo(x, baselineY + 15);
            ctx.stroke();
            
            // Year label
            ctx.fillStyle = window.ENV.COLORS.text;
            ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(year.toString(), x, baselineY + 35);
        }
    }
    
    // Render Months View (Level 2)
    renderMonthsView(ctx, level, baselineY) {
        const yearWidth = level.pixelsPerYear;
        const monthWidth = yearWidth / 12;
        const currentYear = this.today.getFullYear();
        const monthLabelOffset = window.ENV.LAYOUT.monthLabelOffset;
        
        const startYear = Math.floor((0 - this.centerX - this.offsetX) / yearWidth) + currentYear - 1;
        const endYear = Math.ceil((this.width - this.centerX - this.offsetX) / yearWidth) + currentYear + 1;
        
        const renderedMonthLabels = [];

        for (let year = startYear; year <= endYear; year++) {
            const yearX = this.centerX + ((year - currentYear) * yearWidth) + this.offsetX;
            
            // Year line (thick)
            ctx.strokeStyle = window.ENV.COLORS.yearLineThick;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(yearX, baselineY - 20);
            ctx.lineTo(yearX, baselineY + 20);
            ctx.stroke();
            
            // Year label
            ctx.fillStyle = window.ENV.COLORS.text;
            ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(year.toString(), yearX, baselineY + 40);
            
            // Month lines and labels
            for (let month = 0; month < 12; month++) {
                const monthX = yearX + (month * monthWidth);
                
                // Month line (thin)
                ctx.strokeStyle = window.ENV.COLORS.monthLine;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(monthX, baselineY - 12);
                ctx.lineTo(monthX, baselineY + 12);
                ctx.stroke();
                
                const monthText = window.i18n.t('months.full')[month];
                ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif'; // Fontu ölçümden önce ayarla
                const textMetrics = ctx.measureText(monthText);
                const textWidth = textMetrics.width;
                const textHeight = 10; // Yaklaşık font yüksekliği
                
                const labelRect = {
                    x: monthX - textHeight, 
                    y: baselineY - monthLabelOffset - textWidth,
                    width: textHeight,
                    height: textWidth
                };

                let canRender = true;
                for (const existingLabel of renderedMonthLabels) {
                    if (labelRect.x < existingLabel.x + existingLabel.width &&
                        labelRect.x + labelRect.width > existingLabel.x) { // Sadece X ekseninde çakışma kontrolü
                        canRender = false;
                        break;
                    }
                }

                if (canRender) {
                    ctx.save();
                    ctx.translate(monthX, baselineY - monthLabelOffset);
                    ctx.rotate(-Math.PI / 2);
                    ctx.fillStyle = window.ENV.COLORS.textLight;
                    ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
                    
                    // DÜZELTME: 'right' yerine 'left' kullanarak cetvelin üstüne (yukarı) çiz
                    ctx.textAlign = 'left'; 
                    
                    ctx.fillText(monthText, 0, 0);
                    ctx.restore();
                    renderedMonthLabels.push(labelRect);
                }
            }
        }
    }
    
    // Render Days View (Level 3)
    renderDaysView(ctx, level, baselineY) {
        const yearWidth = level.pixelsPerYear;
        const dayWidth = yearWidth / 365;
        const currentYear = this.today.getFullYear();
        const monthLabelOffset = window.ENV.LAYOUT.monthLabelOffset;
        
        const startYear = Math.floor((0 - this.centerX - this.offsetX) / yearWidth) + currentYear - 1;
        const endYear = Math.ceil((this.width - this.centerX - this.offsetX) / yearWidth) + currentYear + 1;
        
        const renderedMonthLabels = [];

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
                ctx.moveTo(monthX, baselineY - 18);
                ctx.lineTo(monthX, baselineY + 18);
                ctx.stroke();
                
                // --- Ay Etiketi Çizimi ---
                const monthText = window.i18n.t('months.full')[month];
                ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif'; // Fontu ölçümden önce ayarla
                const textMetrics = ctx.measureText(monthText);
                const textWidth = textMetrics.width;
                const textHeight = 11; // Yaklaşık font yüksekliği

                const labelRect = {
                    x: monthX - textHeight,
                    y: baselineY - monthLabelOffset - textWidth,
                    width: textHeight,
                    height: textWidth
                };

                let canRender = true;
                for (const existingLabel of renderedMonthLabels) {
                     if (labelRect.x < existingLabel.x + existingLabel.width &&
                        labelRect.x + labelRect.width > existingLabel.x) {
                        canRender = false;
                        break;
                    }
                }
                
                if (canRender) {
                    ctx.save();
                    ctx.translate(monthX, baselineY - monthLabelOffset);
                    ctx.rotate(-Math.PI / 2);
                    ctx.fillStyle = window.ENV.COLORS.text;
                    ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
                    
                    // DÜZELTME: 'right' yerine 'left' kullanarak cetvelin üstüne (yukarı) çiz
                    ctx.textAlign = 'left'; 
                    
                    ctx.fillText(monthText, 0, 0);
                    ctx.restore();
                    renderedMonthLabels.push(labelRect);
                }

                // Draw days
                for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(year, month, day);
                    const dayOfYearNum = this.getDayOfYear(date);
                    const dayX = yearX + (dayOfYearNum * dayWidth);
                    
                    // Day line
                    ctx.strokeStyle = window.ENV.COLORS.dayLine;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(dayX, baselineY - 8);
                    ctx.lineTo(dayX, baselineY + 8);
                    ctx.stroke();
                    
                    // Day number (horizontal, above ruler)
                    ctx.fillStyle = window.ENV.COLORS.textVeryLight;
                    ctx.font = '9px -apple-system, BlinkMacSystemFont, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(day.toString(), dayX, baselineY - 15);
                }
            }
            
            // Year label at end
            ctx.fillStyle = window.ENV.COLORS.text;
            ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            const yearEndX = yearX + yearWidth;
            ctx.fillText(year.toString(), yearEndX, baselineY + 40);
        }
    }
    
    getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }
    
    // Render today marker
    renderTodayMarker(ctx, level, baselineY) {
        const x = this.centerX + this.offsetX;
        const markerLength = window.ENV.LAYOUT.markerLineLength / 2;

        // Red line (KISA ÇİZGİ)
        ctx.strokeStyle = window.ENV.COLORS.todayMarker;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, baselineY - markerLength);
        ctx.lineTo(x, baselineY + markerLength);
        ctx.stroke();
        
        // "Şimdi" label
        // ctx.fillStyle = window.ENV.COLORS.todayMarker;
        // ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, sans-serif';
        // ctx.textAlign = 'center';
        // ctx.fillText(window.t('now').toUpperCase(), x, window.ENV.LAYOUT.infoBoxY + 40);
    }
    
    // Render events
    renderEvents(ctx, level, baselineY) {
        this.events.forEach(event => {
            const eventDate = event.date;
            
            const diffMs = eventDate.getTime() - this.today.getTime();
            const diffDays = diffMs / (1000 * 60 * 60 * 24);
            const pixelsPerDay = level.pixelsPerYear / 365;
            
            const x = this.centerX + (diffDays * pixelsPerDay) + this.offsetX;
            
            if (x < -50 || x > this.width + 50) return;
            
            const barHeight = window.ENV.EVENT_BAR_HEIGHT;
            const barSpacing = window.ENV.EVENT_BAR_SPACING;
            const yOffset = (event.stackLevel || 0) * (barHeight + barSpacing);
            const y = baselineY + window.ENV.LAYOUT.eventBarBaseY - yOffset;
            const barWidth = 3;
            
            const isHovered = this.hoveredEvent === event;
            ctx.fillStyle = isHovered ? window.ENV.COLORS.eventBarHover : window.ENV.COLORS.eventBar;
            
            ctx.fillRect(x - barWidth/2, y - barHeight, barWidth, barHeight);
            
            event._renderX = x;
            event._renderY = y;
            event._renderWidth = barWidth;
            event._renderHeight = barHeight;
        });
    }

    // Mavi hover çizgisini çiz
    renderHoverMarker(ctx, baselineY) {
        if (this.hoverX === -1 || this.isDragging) return; 

        const markerLength = window.ENV.LAYOUT.markerLineLength / 2; 

        ctx.strokeStyle = window.ENV.COLORS.hoverMarker;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.hoverX, baselineY - markerLength);
        ctx.lineTo(this.hoverX, baselineY + markerLength);
        ctx.stroke();
    }

    // Üstteki bilgi kutusunu çiz
    renderInfoBox(ctx) {
        if (!this.hoveredEvent) return;

        const event = this.hoveredEvent;
        const infoY = window.ENV.LAYOUT.infoBoxY;

        ctx.fillStyle = window.ENV.COLORS.text;
        ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(event.title, this.centerX, infoY);

        const dateString = window.formatDate(event.date, 'full');
        ctx.fillStyle = window.ENV.COLORS.textLight;
        ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText(dateString, this.centerX, infoY + 22);
    }
    
    // Event listeners setup
    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('mouseleave', () => this.onMouseLeave());
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
        this.canvas.addEventListener('click', (e) => this.onClick(e));
        this.canvas.addEventListener('dblclick', (e) => this.onDoubleClick(e));
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.onMouseEnd(e));
    }
    
    onMouseDown(e) {
        this.isDragging = true;
        this.lastX = e.clientX;
        this.canvas.classList.add('grabbing');
        this.targetOffsetX = this.offsetX; 
    }
    
    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.hoverX = x;
        
        if (this.isDragging) {
            const dx = e.clientX - this.lastX;
            this.targetOffsetX += dx; 
            this.lastX = e.clientX;
        } else {
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
        this.hoverX = -1;
        this.hoveredEvent = null;
    }
    
    onWheel(e) {
        // Shift tuşu basılıysa yatay kaydırma yap
        if (e.shiftKey) {
            e.preventDefault(); // Sayfanın kaymasını engelle
            this.targetOffsetX -= e.deltaY;
        } 
        // Değilse, odaklı zoom yap
        else {
            e.preventDefault(); // Zoom yaparken sayfanın kaymasını engelle
            
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            
            if (e.deltaY < 0) {
                this.zoomIn(mouseX);
            } else if (e.deltaY > 0) {
                this.zoomOut(mouseX);
            }
        }
    }
    
    onClick(e) {
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
            // YENİ: Tıklanan noktaya zoom yap
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            this.zoomIn(x);
        }
    }
    
    onTouchStart(e) {
        e.preventDefault();
        
        if (e.touches.length === 1) {
            this.isDragging = true;
            this.lastX = e.touches[0].clientX;
            this.lastY = e.touches[0].clientY;
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
            this.targetOffsetX += dx;
            this.lastX = e.touches[0].clientX;
        } else if (e.touches.length === 2 && this.zoomMode === 'pinch') {
            const dx = e.touches[1].clientX - e.touches[0].clientX;
            const dy = e.touches[1].clientY - e.touches[0].clientY;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if (Math.abs(distance - this.lastTouchDistance) > window.ENV.MIN_PINCH_DISTANCE) {
                // YENİ: Pinch zoom için merkez noktasını hesapla
                const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = midX - rect.left;

                if (distance > this.lastTouchDistance) {
                    this.zoomIn(mouseX);
                } else {
                    this.zoomOut(mouseX);
                }
                this.lastTouchDistance = distance;
            }
        }
    }
    
    onMouseEnd(e) { // touchend
        this.isDragging = false;
        this.touchStartDistance = 0;
    }
    
    checkHover(x, y) {
        const hoveredEvent = this.getEventAtPosition(x, y);
        
        if (hoveredEvent !== this.hoveredEvent) {
            this.hoveredEvent = hoveredEvent;
        }
    }
    
    getEventAtPosition(x, y) {
        for (const event of this.events) {
            if (!event._renderX) continue;
            
            const baselineY = this.centerY + window.ENV.LAYOUT.rulerYOffset;
            const barHeight = window.ENV.EVENT_BAR_HEIGHT;
            const barSpacing = window.ENV.EVENT_BAR_SPACING;
            const yOffset = (event.stackLevel || 0) * (barHeight + barSpacing);
            const eventBaseY = baselineY + window.ENV.LAYOUT.eventBarBaseY - yOffset;

            const hitMarginX = 10;
            const hitMarginY = 10;
            
            if (x >= event._renderX - hitMarginX &&
                x <= event._renderX + hitMarginX &&
                y >= eventBaseY - barHeight - hitMarginY && 
                y <= eventBaseY + hitMarginY) {             
                return event;
            }
        }
        return null;
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

    // --- YENİ: ODAKLI ZOOM YARDIMCI FONKSİYONLARI ---

    /**
     * Ekrandaki bir X koordinatını, 'today'den kaç gün fark olduğuna dönüştürür.
     */
    xToDays(x, zoomLevel) {
        const level = window.ENV.ZOOM_LEVELS[zoomLevel];
        const pixelsPerDay = level.pixelsPerYear / 365;
        // 'today' marker'ından (merkez + offset) olan piksel farkını bul
        const screenOffset = x - this.centerX - this.offsetX;
        const diffDays = screenOffset / pixelsPerDay;
        return diffDays;
    }

    /**
     * Belirli bir 'gün farkı'nın (today'den)
     * yeni zoom seviyesinde, hedeflenen X noktasında olması için
     * gereken yeni 'offsetX' değerini hesaplar.
     */
    daysToOffsetX(diffDays, zoomLevel, targetX) {
        const level = window.ENV.ZOOM_LEVELS[zoomLevel];
        const pixelsPerDay = level.pixelsPerYear / 365;
        // Gün farkının yeni zoom seviyesindeki piksel karşılığı
        const screenOffset = diffDays * pixelsPerDay;
        // Yeni offset = hedefX - merkez - (dünya koordinatı)
        const newOffsetX = targetX - this.centerX - screenOffset;
        return newOffsetX;
    }

    // --- YENİ: ODAKLI ZOOM FONKSİYONLARI ---

    zoomIn(mouseX = this.centerX) {
        if (this.zoomLevel >= window.ENV.ZOOM_LEVELS.length - 1) return; // Zaten en yakın

        // 1. Mevcut pozisyonu (gün farkı olarak) al
        const currentDays = this.xToDays(mouseX, this.zoomLevel);
        
        // 2. Yeni zoom seviyesini ayarla
        const newZoomLevel = this.zoomLevel + 1;

        // 3. O 'gün farkı'nın yeni zoom seviyesinde 'mouseX'e gelmesi için gereken offset'i hesapla
        const newOffsetX = this.daysToOffsetX(currentDays, newZoomLevel, mouseX);

        // 4. Zoom ve offset'i uygula (animasyonu atlamak için ikisini de ayarla)
        this.zoomLevel = newZoomLevel;
        this.targetOffsetX = newOffsetX;
        this.offsetX = newOffsetX; // Animasyonun "kaymasını" önlemek için
        
        this.showZoomIndicator();
    }
    
    zoomOut(mouseX = this.centerX) {
        if (this.zoomLevel <= 0) return; // Zaten en uzak

        // 1. Mevcut pozisyonu (gün farkı olarak) al
        const currentDays = this.xToDays(mouseX, this.zoomLevel);

        // 2. Yeni zoom seviyesini ayarla
        const newZoomLevel = this.zoomLevel - 1;

        // 3. O 'gün farkı'nın yeni zoom seviyesinde 'mouseX'e gelmesi için gereken offset'i hesapla
        const newOffsetX = this.daysToOffsetX(currentDays, newZoomLevel, mouseX);
        
        // 4. Zoom ve offset'i uygula
        this.zoomLevel = newZoomLevel;
        this.targetOffsetX = newOffsetX;
        this.offsetX = newOffsetX; // Animasyonun "kaymasını" önlemek için

        this.showZoomIndicator();
    }
    
    showZoomIndicator() {
        const indicator = document.getElementById('zoomIndicator');
        const level = window.ENV.ZOOM_LEVELS[this.zoomLevel];
        
        indicator.textContent = `×${level.id} - ${window.t('zoomLevel' + level.id)}`;
        
        indicator.classList.add('active');
        
        setTimeout(() => {
            indicator.classList.remove('active');
        }, 1500);
    }
    
    setZoomMode(mode) {
        this.zoomMode = mode;
    }
    
    goToToday() {
        this.targetOffsetX = 0;
    }
    
    goToDate(selectedDate) {
        const diffMs = selectedDate.getTime() - this.today.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        
        const level = window.ENV.ZOOM_LEVELS[this.zoomLevel];
        const pixelsPerDay = level.pixelsPerYear / 365;
        
        this.targetOffsetX = -(diffDays * pixelsPerDay);
    }
}

// Initialize timeline
function initTimeline() {
    window.timeline = new Timeline('timelineCanvas');
}