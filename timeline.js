// Timeline Engine - Canvas Based
class Timeline {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.container = this.canvas.parentElement;
        
        // State
        this.events = [];
        this.zoomLevel = 2; // Varsayılan x3
        this.offsetX = 0;
        this.targetOffsetX = 0; 
        this.zoomMode = 'pinch';
        
        // Touch/Mouse state
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this.touchStartDistance = 0;
        this.lastTouchDistance = 0;
        
        // Hover state
        this.hoveredEvent = null;
        this.selectedEvent = null;
        this.hoverX = -1; 
        
        this.today = new Date(); // Tam saat ile
        
        // Initialize
        this.resize();
        this.setupEventListeners();
        this.loadEvents(); 
        
        this.animate(); 
    }
    
    // Setup canvas size
    resize() {
        // ... (Bu fonksiyon değişmedi) ...
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
    }
    
    // Load events from JSON
    async loadEvents() {
        // ... (Bu fonksiyon değişmedi) ...
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
            
            this.events.sort((a, b) => a.date - b.date);
            
            this.calculateEventStacks();
            
            document.getElementById('loading').style.display = 'none';

            if (window.initializeUI) {
                window.initializeUI(this.events);
            }

        } catch (error) {
            console.error('Error loading events:', error);
        }
    }
    
    // Calculate vertical stacking for events on same day
    calculateEventStacks() {
        // ... (Bu fonksiyon değişmedi) ...
        const dayGroups = {};
        
        this.events.forEach(event => {
            const dayKey = this.getDateKey(event.date);
            if (!dayGroups[dayKey]) {
                dayGroups[dayKey] = [];
            }
            dayGroups[dayKey].push(event);
        });
        
        Object.values(dayGroups).forEach(group => {
            group.forEach((event, index) => {
                event.stackLevel = Math.min(index, window.ENV.EVENT_MAX_STACK - 1);
            });
        });
    }
    
    getDateKey(date) {
        // ... (Bu fonksiyon değişmedi) ...
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }
    
    // Ana animasyon döngüsü (pürüzsüz kaydırma için)
    animate() {
        const dx = this.targetOffsetX - this.offsetX;
        
        // --- DEĞİŞİKLİK (Animasyon Yavaşlatıldı) ---
        // Katsayı 0.05'ten 0.03'e düşürüldü
        if (Math.abs(dx) > 0.1) {
            this.offsetX += dx * 0.03; 
        } else {
            this.offsetX = this.targetOffsetX;
        }
        // ----------------------------------------
        
        this.render();
        requestAnimationFrame(this.animate.bind(this));
    }
    
    // Main render function
    render() {
        // ... (Bu fonksiyon değişmedi) ...
        const ctx = this.ctx;
        const level = window.ENV.ZOOM_LEVELS[this.zoomLevel];
        const baselineY = this.centerY + (window.ENV.LAYOUT.rulerYOffset || 0);
        
        ctx.fillStyle = window.ENV.COLORS.background;
        ctx.fillRect(0, 0, this.width, this.height);
        
        ctx.strokeStyle = window.ENV.COLORS.ruler;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, baselineY);
        ctx.lineTo(this.width, baselineY);
        ctx.stroke();
        
        if (level.showHours) {
            this.renderHoursView(ctx, level, baselineY);
        } else if (level.showDays) {
            this.renderDaysView(ctx, level, baselineY);
        } else if (level.showMonths) {
            this.renderMonthsView(ctx, level, baselineY);
        } else {
            this.renderYearsView(ctx, level, baselineY);
        }
        
        this.renderTodayMarker(ctx, level, baselineY);
        this.renderEvents(ctx, level, baselineY);
        this.renderHoverMarker(ctx, baselineY);
    }
    
    daysFromToday(date) {
        // ... (Bu fonksiyon değişmedi) ...
        const diffMs = date.getTime() - this.today.getTime();
        return diffMs / (1000 * 60 * 60 * 24);
    }

    // Render Years View (Level 1)
    renderYearsView(ctx, level, baselineY) {
        // ... (Bu fonksiyon değişmedi) ...
        const pixelsPerDay = level.pixelsPerYear / 365;
        const startDays = this.xToDays(-this.width / 2, this.zoomLevel);
        const endDays = this.xToDays(this.width * 1.5, this.zoomLevel);
        const startDate = new Date(this.today.getTime() + startDays * 1000 * 60 * 60 * 24);
        const endDate = new Date(this.today.getTime() + endDays * 1000 * 60 * 60 * 24);
        const startYear = startDate.getFullYear();
        const endYear = endDate.getFullYear();
        
        for (let year = startYear; year <= endYear; year++) {
            const yearStartDate = new Date(year, 0, 1);
            const diffDays = this.daysFromToday(yearStartDate);
            const x = this.centerX + (diffDays * pixelsPerDay) + this.offsetX;
            
            ctx.strokeStyle = window.ENV.COLORS.yearLine;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, baselineY - 15);
            ctx.lineTo(x, baselineY + 15);
            ctx.stroke();
            
            ctx.fillStyle = window.ENV.COLORS.text;
            ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(year.toString(), x, baselineY + 35);
        }
    }
    
    // Render Months View (Level 2)
    renderMonthsView(ctx, level, baselineY) {
        // ... (Bu fonksiyon değişmedi) ...
        const pixelsPerDay = level.pixelsPerYear / 365;
        const monthLabelOffset = window.ENV.LAYOUT.monthLabelOffset;
        const startDays = this.xToDays(-this.width / 2, this.zoomLevel);
        const endDays = this.xToDays(this.width * 1.5, this.zoomLevel);
        const startDate = new Date(this.today.getTime() + startDays * 1000 * 60 * 60 * 24);
        const endDate = new Date(this.today.getTime() + endDays * 1000 * 60 * 60 * 24);
        const startYear = startDate.getFullYear();
        const endYear = endDate.getFullYear();
        const renderedMonthLabels = [];

        for (let year = startYear; year <= endYear; year++) {
            const yearStartDate = new Date(year, 0, 1);
            const yearDiffDays = this.daysFromToday(yearStartDate);
            const yearX = this.centerX + (yearDiffDays * pixelsPerDay) + this.offsetX;
            
            ctx.strokeStyle = window.ENV.COLORS.yearLineThick;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(yearX, baselineY - 20);
            ctx.lineTo(yearX, baselineY + 20);
            ctx.stroke();
            
            ctx.fillStyle = window.ENV.COLORS.text;
            ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(year.toString(), yearX, baselineY + 40);
            
            for (let month = 0; month < 12; month++) {
                const monthStartDate = new Date(year, month, 1);
                const monthDiffDays = this.daysFromToday(monthStartDate);
                const monthX = this.centerX + (monthDiffDays * pixelsPerDay) + this.offsetX;
                
                if (month > 0) {
                    ctx.strokeStyle = window.ENV.COLORS.monthLine;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(monthX, baselineY - 12);
                    ctx.lineTo(monthX, baselineY + 12);
                    ctx.stroke();
                }
                
                const monthText = window.i18n.t('months.full')[month];
                ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
                const textMetrics = ctx.measureText(monthText);
                const textWidth = textMetrics.width;
                const textHeight = 10; 
                const labelRect = { x: monthX - textHeight, y: baselineY - monthLabelOffset - textWidth, width: textHeight, height: textWidth };

                let canRender = true;
                for (const existingLabel of renderedMonthLabels) {
                    if (labelRect.x < existingLabel.x + existingLabel.width) { 
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
        // ... (Bu fonksiyon değişmedi) ...
        const pixelsPerDay = level.pixelsPerYear / 365;
        const monthLabelOffset = window.ENV.LAYOUT.monthLabelOffset;
        const startDays = this.xToDays(-this.width / 2, this.zoomLevel);
        const endDays = this.xToDays(this.width * 1.5, this.zoomLevel);
        const startDate = new Date(this.today.getTime() + startDays * 1000 * 60 * 60 * 24);
        const endDate = new Date(this.today.getTime() + endDays * 1000 * 60 * 60 * 24);
        const startYear = startDate.getFullYear();
        const endYear = endDate.getFullYear();
        const renderedMonthLabels = [];

        for (let year = startYear; year <= endYear; year++) {
            for (let month = 0; month < 12; month++) {
                const monthStart = new Date(year, month, 1);
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const monthDiffDays = this.daysFromToday(monthStart);
                const monthX = this.centerX + (monthDiffDays * pixelsPerDay) + this.offsetX;

                if (monthX < -this.width / 2 || monthX > this.width * 1.5) {
                    continue;
                }

                ctx.strokeStyle = window.ENV.COLORS.yearLineThick;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(monthX, baselineY - 18);
                ctx.lineTo(monthX, baselineY + 18);
                ctx.stroke();
                
                if (month === 0) {
                    ctx.fillStyle = window.ENV.COLORS.text;
                    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(year.toString(), monthX, baselineY + 40);
                }
                
                const monthText = window.i18n.t('months.full')[month];
                ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
                const textMetrics = ctx.measureText(monthText);
                const textWidth = textMetrics.width;
                const textHeight = 11; 
                const labelRect = { x: monthX - textHeight, y: baselineY - monthLabelOffset - textWidth, width: textHeight, height: textWidth };

                let canRender = true;
                for (const existingLabel of renderedMonthLabels) {
                     if (labelRect.x < existingLabel.x + existingLabel.width) {
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
                    ctx.textAlign = 'left'; 
                    ctx.fillText(monthText, 0, 0);
                    ctx.restore();
                    renderedMonthLabels.push(labelRect);
                }

                for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(year, month, day);
                    const dayDiffDays = this.daysFromToday(date);
                    const dayX = this.centerX + (dayDiffDays * pixelsPerDay) + this.offsetX;
                    
                    if (day > 1) {
                        if (dayX < 0 || dayX > this.width) continue; 
                        ctx.strokeStyle = window.ENV.COLORS.dayLine;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(dayX, baselineY - 8);
                        ctx.lineTo(dayX, baselineY + 8);
                        ctx.stroke();
                    }
                    
                    if (dayX < 0 || dayX > this.width) continue; 
                    
                    ctx.fillStyle = window.ENV.COLORS.textVeryLight;
                    ctx.font = '9px -apple-system, BlinkMacSystemFont, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(day.toString(), dayX, baselineY - 15);
                }
            }
        }
    }

    // Render Hours View (Level 4)
    renderHoursView(ctx, level, baselineY) {
        // ... (Bu fonksiyon değişmedi) ...
        const pixelsPerDay = level.pixelsPerYear / 365;
        const pixelsPerHour = pixelsPerDay / 24;
        const monthLabelOffset = window.ENV.LAYOUT.monthLabelOffset;
        
        const startDays = this.xToDays(-this.width / 2, this.zoomLevel);
        const endDays = this.xToDays(this.width * 1.5, this.zoomLevel);
        
        const startDate = new Date(this.today.getTime() + startDays * 1000 * 60 * 60 * 24);
        const endDate = new Date(this.today.getTime() + endDays * 1000 * 60 * 60 * 24);
        
        const visibleDays = endDays - startDays;
        
        if (visibleDays > 3) {
             this.renderDaysView(ctx, level, baselineY);
             return;
        }
        
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth();
        const startDay = startDate.getDate();
        
        const endYear = endDate.getFullYear();
        const endMonth = endDate.getMonth();
        const endDay = endDate.getDate();

        let currentDay = new Date(startYear, startMonth, startDay);

        while (currentDay <= endDate) {
            const dayDiffDays = this.daysFromToday(currentDay);
            const dayX = this.centerX + (dayDiffDays * pixelsPerDay) + this.offsetX;

            if (dayX < -this.width / 2 || dayX > this.width * 1.5) {
                currentDay.setDate(currentDay.getDate() + 1); 
                continue;
            }

            ctx.strokeStyle = window.ENV.COLORS.yearLineThick;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(dayX, baselineY - 20);
            ctx.lineTo(dayX, baselineY + 20);
            ctx.stroke();

            const dayText = `${currentDay.getDate()} ${window.i18n.t('months.full')[currentDay.getMonth()]} ${currentDay.getFullYear()}`;
            ctx.fillStyle = window.ENV.COLORS.text;
            ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(dayText, dayX, baselineY + 40);

            for (let hour = 0; hour < 24; hour++) {
                const hourDate = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate(), hour);
                const hourDiffDays = this.daysFromToday(hourDate);
                const hourX = this.centerX + (hourDiffDays * pixelsPerDay) + this.offsetX;

                if (hourX < 0 || hourX > this.width) continue; 
                
                if (hour > 0) {
                    ctx.strokeStyle = window.ENV.COLORS.dayLine; 
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(hourX, baselineY - 12);
                    ctx.lineTo(hourX, baselineY + 12);
                    ctx.stroke();
                    
                    ctx.fillStyle = window.ENV.COLORS.textLight;
                    ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(`${hour.toString().padStart(2, '0')}:00`, hourX, baselineY - 18);
                }
            }
            
            currentDay.setDate(currentDay.getDate() + 1); 
        }
    }
    
    // Render today marker
    renderTodayMarker(ctx, level, baselineY) {
        // ... (Bu fonksiyon değişmedi) ...
        const diffDays = this.daysFromToday(this.today);
        const pixelsPerDay = level.pixelsPerYear / 365;
        const x = this.centerX + (diffDays * pixelsPerDay) + this.offsetX; 
        
        const markerLength = window.ENV.LAYOUT.markerLineLength / 2;

        ctx.strokeStyle = window.ENV.COLORS.todayMarker;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, baselineY - markerLength);
        ctx.lineTo(x, baselineY + markerLength);
        ctx.stroke();
        
        ctx.fillStyle = window.ENV.COLORS.todayMarker;
        ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(window.t('now').toUpperCase(), x, baselineY - window.ENV.LAYOUT.monthLabelOffset - 10);
    }
    
    // Render events
    renderEvents(ctx, level, baselineY) {
        // ... (Bu fonksiyon değişmedi) ...
        const pixelsPerDay = level.pixelsPerYear / 365;

        this.events.forEach(event => {
            const eventDate = event.date;
            const diffDays = this.daysFromToday(eventDate);
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
        // ... (Bu fonksiyon değişmedi) ...
        if (this.hoverX === -1 || this.isDragging) return; 
        const markerLength = window.ENV.LAYOUT.markerLineLength / 2; 
        ctx.strokeStyle = window.ENV.COLORS.hoverMarker;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.hoverX, baselineY - markerLength);
        ctx.lineTo(this.hoverX, baselineY + markerLength);
        ctx.stroke();
    }
    
    // Event listeners setup
    setupEventListeners() {
        // ... (Bu fonksiyon değişmedi) ...
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.onMouseLeave());
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
        this.canvas.addEventListener('click', (e) => this.onClick(e));
        this.canvas.addEventListener('dblclick', (e) => this.onDoubleClick(e));
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.onMouseEnd(e));
    }
    
    onMouseDown(e) {
        // ... (Bu fonksiyon değişmedi) ...
        this.isDragging = true;
        this.lastX = e.clientX;
        this.canvas.classList.add('grabbing');
        this.targetOffsetX = this.offsetX; 
    }
    
    onMouseMove(e) {
        // ... (Bu fonksiyon değişmedi) ...
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
        // ... (Bu fonksiyon değişmedi) ...
        this.isDragging = false;
        this.canvas.classList.remove('grabbing');
    }
    
    onMouseLeave() {
        // ... (Bu fonksiyon değişmedi) ...
        this.isDragging = false;
        this.canvas.classList.remove('grabbing');
        this.hoverX = -1;
        this.hoveredEvent = null;
    }
    
    onWheel(e) {
        // ... (Bu fonksiyon değişmedi) ...
        if (e.shiftKey) {
            e.preventDefault(); 
            this.targetOffsetX -= e.deltaY;
        } 
        else {
            e.preventDefault(); 
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
        // ... (Bu fonksiyon değişmedi) ...
        if (Math.abs(this.targetOffsetX - this.offsetX) > 2) return; 

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const clickedEvent = this.getEventAtPosition(x, y);
        if (clickedEvent) {
            if (window.selectEvent) {
                window.selectEvent(clickedEvent);
            }
        }
    }
    
    onDoubleClick(e) {
        // ... (Bu fonksiyon değişmedi) ...
        if (this.zoomMode === 'doubleclick') {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            this.zoomIn(x);
        }
    }
    
    onTouchStart(e) {
        // ... (Bu fonksiyon değişmedi) ...
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
        // ... (Bu fonksiyon değişmedi) ...
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
        // ... (Bu fonksiyon değişmedi) ...
        this.isDragging = false;
        this.touchStartDistance = 0;
    }
    
    checkHover(x, y) {
        // ... (Bu fonksiyon değişmedi) ...
        const hoveredEvent = this.getEventAtPosition(x, y);
        
        if (hoveredEvent !== this.hoveredEvent) {
            this.hoveredEvent = hoveredEvent;
        }
    }
    
    getEventAtPosition(x, y) {
        // ... (Bu fonksiyon değişmedi) ...
        const baselineY = this.centerY + (window.ENV.LAYOUT.rulerYOffset || 0);

        for (const event of this.events) {
            if (!event._renderX) continue;
            
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

    // --- ODAKLI ZOOM FONKSİYONLARI ---

    xToDays(x, zoomLevel) {
        // ... (Bu fonksiyon değişmedi) ...
        const level = window.ENV.ZOOM_LEVELS[zoomLevel];
        const pixelsPerDay = level.pixelsPerYear / 365;
        const screenOffset = x - this.centerX - this.offsetX;
        const diffDays = screenOffset / pixelsPerDay;
        return diffDays;
    }

    daysToOffsetX(diffDays, zoomLevel, targetX) {
        // ... (Bu fonksiyon değişmedi) ...
        const level = window.ENV.ZOOM_LEVELS[zoomLevel];
        const pixelsPerDay = level.pixelsPerYear / 365;
        const screenOffset = diffDays * pixelsPerDay;
        const newOffsetX = targetX - this.centerX - screenOffset;
        return newOffsetX;
    }

    zoomIn(mouseX = this.centerX) {
        // ... (Bu fonksiyon değişmedi) ...
        if (this.zoomLevel >= window.ENV.ZOOM_LEVELS.length - 1) return;
        const currentDays = this.xToDays(mouseX, this.zoomLevel);
        const newZoomLevel = this.zoomLevel + 1;
        const newOffsetX = this.daysToOffsetX(currentDays, newZoomLevel, mouseX);
        this.zoomLevel = newZoomLevel;
        this.targetOffsetX = newOffsetX;
        this.showZoomIndicator();
    }
    
    zoomOut(mouseX = this.centerX) {
        // ... (Bu fonksiyon değişmedi) ...
        if (this.zoomLevel <= 0) return;
        const currentDays = this.xToDays(mouseX, this.zoomLevel);
        const newZoomLevel = this.zoomLevel - 1;
        const newOffsetX = this.daysToOffsetX(currentDays, newZoomLevel, mouseX);
        this.zoomLevel = newZoomLevel;
        this.targetOffsetX = newOffsetX;
        this.showZoomIndicator();
    }
    
    showZoomIndicator() {
        // ... (Bu fonksiyon değişmedi) ...
        const indicator = document.getElementById('zoomIndicator');
        const level = window.ENV.ZOOM_LEVELS[this.zoomLevel];
        indicator.textContent = `×${level.id} - ${window.t('zoomLevel'D + level.id)}`;
        indicator.classList.add('active');
        setTimeout(() => {
            indicator.classList.remove('active');
        }, 1500);
    }
    
    setZoomMode(mode) {
        // ... (Bu fonksiyon değişmedi) ...
        this.zoomMode = mode;
    }
    
    goToToday() {
        // ... (Bu fonksiyon değişmedi) ...
        this.targetOffsetX = 0;
    }
    
    goToDate(selectedDate) {
        // ... (Bu fonksiyon değişmedi) ...
        const diffDays = this.daysFromToday(selectedDate);
        const level = window.ENV.ZOOM_LEVELS[this.zoomLevel];
        const pixelsPerDay = level.pixelsPerYear / 365;
        this.targetOffsetX = -(diffDays * pixelsPerDay);
    }
}

// Initialize timeline
function initTimeline() {
    window.timeline = new Timeline('timelineCanvas');
}