(function() {
    // Datos de Presets (Configuraciones rápidas)
    const presetsData = [
        { name: 'Patatas Fritas', icon: 'utensils', temp: 200, time: 20 },
        { name: 'Pollo / Alitas', icon: 'drumstick', temp: 200, time: 25 },
        { name: 'Pizza', icon: 'pizza', temp: 220, time: 15 },
        { name: 'Pescado', icon: 'fish', temp: 180, time: 12 },
        { name: 'Repostería', icon: 'cake', temp: 175, time: 30 },
        { name: 'Verduras', icon: 'leaf', temp: 190, time: 12 }
    ];

    // Variables de estado
    let timerInterval = null;
    let totalSeconds = 0;
    let remainingSeconds = 0;

    // Inicializar después de que el DOM esté listo
    function init() {
        // Elementos del DOM
        const ovenTempInput = document.getElementById('oven-temp');
        const ovenTimeInput = document.getElementById('oven-time');
        const airTempResult = document.getElementById('air-temp');
        const airTimeResult = document.getElementById('air-time');
        const presetsContainer = document.getElementById('presets');

        const btnTempMinus = document.getElementById('btn-temp-minus');
        const btnTempPlus = document.getElementById('btn-temp-plus');
        const btnTimeMinus = document.getElementById('btn-time-minus');
        const btnTimePlus = document.getElementById('btn-time-plus');

        const timerText = document.getElementById('timer-text');
        const progressBar = document.getElementById('progress-bar');
        const btnSyncTime = document.getElementById('btn-sync-time');
        const btnTimerStart = document.getElementById('btn-timer-start');
        const btnTimerReset = document.getElementById('btn-timer-reset');
        const alarmSound = document.getElementById('alarm-sound');

        /**
         * Lógica de conversión
         */
        function calculateConversion() {
            const ovenTemp = parseInt(ovenTempInput.value) || 0;
            const ovenTime = parseInt(ovenTimeInput.value) || 0;

            let convertedTemp = ovenTemp - 20;
            if (convertedTemp < 80 && ovenTemp > 0) convertedTemp = 80;
            
            let convertedTime = Math.round(ovenTime * 0.75);
            if (convertedTime < 1 && ovenTime > 0) convertedTime = 1;

            updateDisplay(airTempResult, convertedTemp);
            updateDisplay(airTimeResult, convertedTime);
        }

        function updateDisplay(element, value) {
            if (element.innerText != value) {
                element.innerText = value;
                element.animate([
                    { transform: 'scale(1.2)', color: '#F97316' },
                    { transform: 'scale(1)', color: 'inherit' }
                ], { duration: 300 });
            }
        }

        // Eventos de botones +/- (Vinculación robusta)
        if (btnTempMinus) btnTempMinus.onclick = () => {
            ovenTempInput.value = Math.max(80, parseInt(ovenTempInput.value) - 5);
            calculateConversion();
        };
        if (btnTempPlus) btnTempPlus.onclick = () => {
            ovenTempInput.value = Math.min(250, parseInt(ovenTempInput.value) + 5);
            calculateConversion();
        };
        if (btnTimeMinus) btnTimeMinus.onclick = () => {
            ovenTimeInput.value = Math.max(1, parseInt(ovenTimeInput.value) - 1);
            calculateConversion();
        };
        if (btnTimePlus) btnTimePlus.onclick = () => {
            ovenTimeInput.value = Math.min(180, parseInt(ovenTimeInput.value) + 1);
            calculateConversion();
        };

        /**
         * Lógica del Temporizador
         */
        function formatTime(seconds) {
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }

        function updateTimerUI() {
            timerText.innerText = formatTime(remainingSeconds);
            const progress = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;
            progressBar.style.width = `${progress}%`;
        }

        if (btnSyncTime) btnSyncTime.onclick = () => {
            const mins = parseInt(airTimeResult.innerText);
            totalSeconds = mins * 60;
            remainingSeconds = totalSeconds;
            updateTimerUI();
            stopTimer();
        };

        function startTimer() {
            if (remainingSeconds <= 0) return;
            
            btnTimerStart.innerText = 'Pausar';
            btnTimerStart.classList.replace('btn-primary', 'btn-secondary');
            
            timerInterval = setInterval(() => {
                remainingSeconds--;
                updateTimerUI();
                
                if (remainingSeconds <= 0) {
                    stopTimer();
                    alarmSound.play();
                    alert('¡Tiempo cumplido! Tu comida está lista.');
                }
            }, 1000);
        }

        function stopTimer() {
            clearInterval(timerInterval);
            timerInterval = null;
            btnTimerStart.innerText = 'Iniciar';
            btnTimerStart.classList.replace('btn-secondary', 'btn-primary');
        }

        if (btnTimerStart) btnTimerStart.onclick = () => {
            if (timerInterval) {
                stopTimer();
            } else {
                startTimer();
            }
        };

        if (btnTimerReset) btnTimerReset.onclick = () => {
            stopTimer();
            remainingSeconds = 0;
            totalSeconds = 0;
            updateTimerUI();
        };

        // Eventos de teclado (input) para actualización en tiempo real
        ovenTempInput.oninput = calculateConversion;
        ovenTimeInput.oninput = calculateConversion;

        // Cargar Presets
        presetsData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'preset-card';
            card.innerHTML = `<i data-lucide="${item.icon}"></i><span>${item.name}</span>`;
            card.onclick = () => {
                ovenTempInput.value = item.temp;
                ovenTimeInput.value = item.time;
                calculateConversion();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
            presetsContainer.appendChild(card);
        });

        // Setup inicial
        calculateConversion();
        if (typeof lucide !== 'undefined') lucide.createIcons();

        // --- Lógica de Cookies ---
        const cookieModal = document.getElementById('cookie-modal');
        const btnAccept = document.getElementById('btn-cookie-accept');
        const btnDeny = document.getElementById('btn-cookie-deny');

        // Comprobar si ya existe una decisión
        const consent = localStorage.getItem('cookieConsent');
        
        if (!consent) {
            // Mostrar modal después de un pequeño retraso para efecto suave
            setTimeout(() => {
                cookieModal.classList.remove('hidden');
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }, 1000);
        }

        if (btnAccept) btnAccept.onclick = () => {
            localStorage.setItem('cookieConsent', 'accepted');
            cookieModal.classList.add('hidden');
        };

        if (btnDeny) btnDeny.onclick = () => {
            localStorage.setItem('cookieConsent', 'denied');
            cookieModal.classList.add('hidden');
        };
    }

    // Asegurar que el script corra después de que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
