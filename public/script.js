document.addEventListener('DOMContentLoaded', () => {
    // --- Selección Robusta de Elementos ---
    const getEl = (id) => document.getElementById(id);
    const introOverlay = getEl('intro-overlay'), chatContainer = getEl('chat-container');
    const bgCanvas = getEl('bg-canvas'), neuralCanvas = getEl('neural-canvas');
    const chatBox = getEl('chat-box'), chatForm = getEl('chat-form'), userInput = getEl('user-input');
    const toggleMemoryBtn = getEl('toggle-memory-btn'), copyBtn = getEl('copy-btn');
    const clearBtn = getEl('clear-btn');
    const colorCore = getEl('color-core'), coreCenter = getEl('core-center'), coreSwatches = getEl('core-swatches');
    const notificationContainer = getEl('notification-container');
    
    // --- Comprobación de existencia de elementos críticos ---
    if (!bgCanvas || !neuralCanvas || !chatContainer || !chatForm) {
        console.error("Error crítico: Faltan elementos esenciales del HTML.");
        document.body.innerHTML = "<h1>Error de Carga: Faltan elementos de la interfaz.</h1>";
        return;
    }
    const bgCtx = bgCanvas.getContext('2d'), neuralCtx = neuralCanvas.getContext('2d');

    // --- Estado de la Aplicación ---
    let chatHistory = [], isMemoryEnabled = true, lastAiResponse = "";
    let isColorCoreOpen = false;
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, radius: 150 };

    // --- Lógica de Intro ---
    setTimeout(() => {
        if(introOverlay) introOverlay.classList.add('hidden');
        if(chatContainer) chatContainer.classList.add('visible');
        addMessage("Protocolo Singularidad iniciado. Soy Nexus. Estoy a tu disposición.", 'ai');
    }, 3000);

    // --- Lógica de Temas con Posicionamiento JS ---
    const themes = {
        'Quantum Blue': { primary: '#00f6ff', userGradient: 'linear-gradient(135deg, #00f6ff, #6d28d9)'},
        'Gold Standard': { primary: '#ffd700', userGradient: 'linear-gradient(135deg, #ffd700, #fca311)' },
        'Axiom White': { primary: '#f0f0f0', userGradient: 'linear-gradient(135deg, #f0f0f0, #b0b0b0)' },
        'Matrix Green': { primary: '#39ff14', userGradient: 'linear-gradient(135deg, #39ff14, #00b33c)' },
        'Supernova Red': { primary: '#ff003b', userGradient: 'linear-gradient(135deg, #ff003b, #c1121f)' },
        'Nebula Pink': { primary: '#ff00c1', userGradient: 'linear-gradient(135deg, #ff00c1, #e01e84)' },
        'Gravity Violet': { primary: '#9400d3', userGradient: 'linear-gradient(135deg, #9400d3, #4a00e0)' },
    };
    function applyTheme(themeName, showNotif = false) {
        const theme = themes[themeName]; if (!theme) return;
        document.documentElement.style.setProperty('--primary-color', theme.primary);
        document.documentElement.style.setProperty('--glow-color', `${theme.primary}4D`);
        document.documentElement.style.setProperty('--user-bg', theme.userGradient);
        localStorage.setItem('nexusTheme', themeName);
        if (showNotif) showTempNotification(`Tema activado: ${themeName}`);
    }
    
    function closeColorCore() {
        isColorCoreOpen = false;
        if(colorCore) colorCore.classList.remove('is-open');
    }

    function setupColorCore() {
        if (!coreSwatches || !coreCenter) return;
        coreSwatches.innerHTML = '';
        const themeNames = Object.keys(themes);
        const radius = 45;
        themeNames.forEach((name, i) => {
            const angle = (i / themeNames.length) * 2 * Math.PI;
            const swatch = document.createElement('div');
            swatch.className = 'swatch';
            swatch.style.background = themes[name].primary;
            swatch.title = name;
            swatch.style.left = `calc(50% + ${radius * Math.cos(angle)}px)`;
            swatch.style.top = `calc(50% + ${radius * Math.sin(angle)}px)`;
            swatch.addEventListener('click', (e) => {
                e.stopPropagation();
                applyTheme(name, true);
                closeColorCore();
            });
            coreSwatches.appendChild(swatch);
        });
        
        coreCenter.addEventListener('click', (e) => {
            e.stopPropagation();
            isColorCoreOpen = !isColorCoreOpen;
            colorCore.classList.toggle('is-open', isColorCoreOpen);
        });
    }

    // --- Animación de Fondo: Red Neuronal Viva ---
    let neurons = [];
    class Neuron {
        constructor() { this.x = Math.random() * window.innerWidth; this.y = Math.random() * window.innerHeight; this.size = Math.random() * 1.5 + 1; this.vx = (Math.random() - 0.5) * 0.2; this.vy = (Math.random() - 0.5) * 0.2; this.baseColor = '#8a94a6'; }
        draw(ctx, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
        update(ctx, mouse, color) {
            let dx = mouse.x - this.x, dy = mouse.y - this.y, dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) { this.x -= (dx / dist) * 2; this.y -= (dy / dist) * 2; } 
            else { if (this.x < 0 || this.x > ctx.canvas.width) this.vx *= -1; if (this.y < 0 || this.y > ctx.canvas.height) this.vy *= -1; this.x += this.vx; this.y += this.vy; }
            this.draw(ctx, (dist < mouse.radius) ? color : this.baseColor);
        }
        connect(ctx, others, color) {
            others.forEach(o => {
                let dx = o.x - this.x, dy = o.y - this.y, dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) { ctx.strokeStyle = `${color}${Math.floor((1 - dist / 100) * 50).toString(16).padStart(2, '0')}`; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(o.x, o.y); ctx.stroke(); }
            });
        }
    }
    function initCanvases() {
        [bgCanvas, neuralCanvas].forEach(c => { c.width = window.innerWidth; c.height = window.innerHeight; });
        neurons = []; const neuronCount = Math.floor((window.innerWidth * window.innerHeight) / 10000);
        for (let i = 0; i < neuronCount; i++) neurons.push(new Neuron());
    }
    function animate() {
        bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        neuralCtx.clearRect(0, 0, neuralCanvas.width, neuralCanvas.height);
        const theme = themes[localStorage.getItem('nexusTheme') || 'Quantum Blue'];
        const gradient = bgCtx.createRadialGradient(bgCanvas.width / 2, bgCanvas.height / 2, 0, bgCanvas.width / 2, bgCanvas.height / 2, bgCanvas.width/2);
        gradient.addColorStop(0, `${theme.primary}1A`); gradient.addColorStop(1, `${theme.primary}00`);
        bgCtx.fillStyle = gradient; bgCtx.fillRect(0,0,bgCanvas.width, bgCanvas.height);
        neurons.forEach(n => n.update(neuralCtx, mouse, theme.primary));
        neurons.forEach(n => n.connect(neuralCtx, neurons, theme.primary));
        requestAnimationFrame(animate);
    }

    // --- Lógica del Chat y Botones (CON LA URL DE RENDER INTEGRADA) ---
    async function handleFormSubmit(e) {
        if(e) e.preventDefault();
        const userMessage = userInput.value.trim(); if (!userMessage) return;
        const startTime = Date.now(); addMessage(userMessage, 'user'); userInput.value = '';
        const loading = addLoadingIndicator();

        // ** AQUÍ ESTÁ EL CAMBIO **
        const backendUrl = 'https://ai-experta-1.onrender.com';

        try {
            const history = isMemoryEnabled ? chatHistory : [];
            const res = await fetch(`${backendUrl}/api/chat`, { // Usamos la URL completa
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ message: userMessage, history }) 
            });
            if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
            const data = await res.json();
            const responseTime = ((Date.now() - startTime) / 1000).toFixed(2);
            lastAiResponse = data.reply;
            if (isMemoryEnabled) { chatHistory.push({ role: 'user', content: userMessage }, { role: 'assistant', content: data.reply }); }
            loading.remove(); addMessage(data.reply, 'ai', responseTime);
        } catch (err) { 
            console.error(err); 
            loading.remove(); 
            addMessage('La conexión con la Singularidad ha fallado. Revisa la conexión del servidor y la API Key.', 'ai'); 
        }
    }
    
    // --- Listeners y Notificaciones ---
    function showTempNotification(message) { if (!notificationContainer) return; const toast = document.createElement('div'); toast.className = 'notification-toast'; toast.textContent = message; notificationContainer.appendChild(toast); setTimeout(() => toast.remove(), 4900); }
    if(chatForm) chatForm.addEventListener('submit', handleFormSubmit);
    if(toggleMemoryBtn) toggleMemoryBtn.addEventListener('click', () => { isMemoryEnabled = !isMemoryEnabled; toggleMemoryBtn.classList.toggle('active', isMemoryEnabled); showTempNotification(`Memoria Cognitiva ${isMemoryEnabled ? 'Activada' : 'Desactivada'}`); });
    if(clearBtn) clearBtn.addEventListener('click', () => { chatBox.innerHTML = ''; chatHistory = []; lastAiResponse = ""; showTempNotification('Simulación Reiniciada'); addMessage("Protocolo Singularidad reiniciado.", 'ai');});
    if(copyBtn) copyBtn.addEventListener('click', () => { lastAiResponse ? navigator.clipboard.writeText(lastAiResponse).then(() => showTempNotification('Respuesta Clonada al Portapapeles')).catch(() => showTempNotification('Error de Clonación')) : showTempNotification('No hay datos para clonar.'); });
    
    window.addEventListener('click', (e) => {
        if(isColorCoreOpen) {
            closeColorCore();
        }
    });

    // --- Helpers de Renderizado con Metadatos e Iconos ---
    const ICONS = {
        ai: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 0 0-9.95 9.126L2 12l.05.274A10 10 0 0 0 12 22a10 10 0 0 0 10-10c0-5.52-4.48-10-10-10zm-3.5 7A1.5 1.5 0 0 1 10 10.5 1.5 1.5 0 0 1 8.5 12 1.5 1.5 0 0 1 7 10.5 1.5 1.5 0 0 1 8.5 9zm7 0A1.5 1.5 0 0 1 17 10.5 1.5 1.5 0 0 1 15.5 12 1.5 1.5 0 0 1 14 10.5 1.5 1.5 0 0 1 15.5 9zM7.12 14h9.76c.03.16.05.33.05.5a5.5 5.5 0 0 1-11 0c0-.17.02-.34.05-.5z"/></svg>`,
        user: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`
    }
    function addMessage(text, sender, meta = null) {
        if (!chatBox) return; const wrapper = document.createElement('div'); wrapper.className = `message-wrapper ${sender}-message-wrapper`;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const metaText = sender === 'user' ? time : (meta ? `Respuesta generada en ${meta}s` : 'Analizando...');
        wrapper.innerHTML = `<div class="avatar">${ICONS[sender]}</div><div class="message-content"><div class="message"><p>${text}</p></div><div class="message-meta">${metaText}</div></div>`;
        chatBox.appendChild(wrapper); chatBox.scrollTop = chatBox.scrollHeight;
    }
    function addLoadingIndicator() {
        const wrapper = document.createElement('div'); wrapper.className = 'message-wrapper ai-message-wrapper';
        wrapper.innerHTML = `<div class="avatar">${ICONS.ai}</div><div class="message-content"><div class="message"><p>Accediendo a la red...</p></div><div class="message-meta">Estableciendo conexión...</div></div>`;
        chatBox.appendChild(wrapper); chatBox.scrollTop = chatBox.scrollHeight; return wrapper;
    }
    
    // --- INICIALIZACIÓN FINAL ---
    setupColorCore();
    applyTheme(localStorage.getItem('nexusTheme') || 'Quantum Blue');
    initCanvases();
    animate();
    window.addEventListener('resize', initCanvases);
    window.addEventListener('mousemove', e => { mouse.x = e.x; mouse.y = e.y; });
});