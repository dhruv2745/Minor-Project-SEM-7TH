/**
 * CloudAgri Studio - Main Application Controller
 * Enterprise Precision Agriculture & Farm Twin Simulator
 */

class CloudAgriApp {
    constructor() {
        this.activeMapLayer = "natural";
        this.droneAnimating = false;
        this.dronePosition = { x: 50, y: 50 };
        this.isFlirThermal = false;
    }

    init() {
        // Connect Simulation Telemetry Loop
        window.farmSimulator.onTick = (summary) => {
            this.handleTelemetryTick(summary);
        };

        // Initialize First Zone Display
        this.selectZone("zone-a");

        // Load Default Real Disease Sample
        this.loadDiseaseSample("tomato_blight");

        // Render VRT Table
        this.renderVrtTable();

        // Start Map Canvas Overlay
        this.initCanvasMapOverlay();
    }

    switchView(viewName) {
        const views = {
            farm: document.getElementById('viewFarm'),
            disease: document.getElementById('viewDisease'),
            fpv: document.getElementById('viewFpv'),
            fleet: document.getElementById('viewFleet'),
            copilot: document.getElementById('viewCopilot'),
            irrigation: document.getElementById('viewIrrigation'),
            yield: document.getElementById('viewYield'),
            weather: document.getElementById('viewWeather')
        };

        Object.keys(views).forEach(key => {
            if (views[key]) views[key].classList.remove('active');
        });

        const navIds = ['navFarm', 'navDisease', 'navFpv', 'navFleet', 'navCopilot', 'navIrrigation', 'navYield', 'navWeather'];
        navIds.forEach(id => document.getElementById(id)?.classList.remove('active'));

        if (views[viewName]) {
            views[viewName].classList.add('active');
        }

        const navBtnMap = {
            farm: 'navFarm',
            disease: 'navDisease',
            fpv: 'navFpv',
            fleet: 'navFleet',
            copilot: 'navCopilot',
            irrigation: 'navIrrigation',
            yield: 'navYield',
            weather: 'navWeather'
        };
        if (navBtnMap[viewName]) {
            document.getElementById(navBtnMap[viewName])?.classList.add('active');
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // -------------------------------------------------------------
    // Telemetry & Simulation Tick
    // -------------------------------------------------------------
    handleTelemetryTick(summary) {
        // Update Header Clock
        document.getElementById('simClockDisplay').innerText = `Day ${summary.day} | ${summary.time}`;

        // Aggregate Totals
        let totalMoist = 0;
        let totalNdvi = 0;
        let totalWater = 0;

        summary.zones.forEach(z => {
            totalMoist += z.moisture;
            totalNdvi += z.ndvi;
            totalWater += z.waterUsageGal;
        });

        const avgMoist = (totalMoist / summary.zones.length).toFixed(1);
        const avgNdvi = (totalNdvi / summary.zones.length).toFixed(2);

        document.getElementById('statAvgMoisture').innerText = `${avgMoist}%`;
        document.getElementById('statAvgNdvi').innerText = avgNdvi;
        document.getElementById('statWaterSaved').innerText = `${(142400 + totalWater * 0.15).toLocaleString(undefined, {maximumFractionDigits:0})} Gal`;

        document.getElementById('statWeatherCondition').innerText = `${summary.temp}°C | ${summary.humidity}%`;
        document.getElementById('statWeatherSub').innerText = summary.weather;

        // Update Zone Inspector
        const selected = summary.selectedZone;
        if (selected) {
            this.updateZoneInspectorUI(selected);
        }

        // Update VRT Table
        this.renderVrtTable();
    }

    selectZone(zoneId) {
        window.farmSimulator.selectedZoneId = zoneId;
        const summary = window.farmSimulator.getSummary();
        const zone = summary.zones.find(z => z.id === zoneId) || summary.zones[0];
        this.updateZoneInspectorUI(zone);
    }

    updateZoneInspectorUI(zone) {
        document.getElementById('inspectorZoneTitle').innerText = zone.name;
        document.getElementById('inspectorHealthBadge').innerText = zone.healthStatus;
        document.getElementById('inspectorHealthBadge').className = `hud-pill ${zone.moisture < 25 ? '' : 'active'}`;

        document.getElementById('inspectorMoisture').innerText = `${zone.moisture}%`;
        document.getElementById('inspectorMoistureBar').style.width = `${Math.min(100, zone.moisture)}%`;

        document.getElementById('inspectorNdvi').innerText = zone.ndvi;
        document.getElementById('inspectorNdviBar').style.width = `${Math.min(100, zone.ndvi * 100)}%`;

        document.getElementById('inspectorSoilTemp').innerText = `${zone.soilTemp}°C`;
        document.getElementById('inspectorPh').innerText = `${zone.ph}`;

        document.getElementById('inspectorN').innerText = zone.nitrogen;
        document.getElementById('inspectorP').innerText = zone.phosphorus;
        document.getElementById('inspectorK').innerText = zone.potassium;

        document.getElementById('inspectorStage').innerText = zone.stage;
        document.getElementById('inspectorHarvest').innerText = `${zone.daysToHarvest} Days`;

        const irrEl = document.getElementById('inspectorIrrigation');
        irrEl.innerText = zone.irrigationStatus;
        irrEl.className = `hud-pill ${zone.valveOpen ? 'active' : ''}`;

        const valveBtn = document.getElementById('btnToggleValve');
        valveBtn.innerText = zone.valveOpen ? "🛑 Close Variable Rate Valve" : "💧 Activate Variable Rate Irrigation";
    }

    toggleSelectedValve() {
        const zoneId = window.farmSimulator.selectedZoneId;
        const isOpen = window.farmSimulator.toggleIrrigation(zoneId);
        window.farmAudio.playValveClick();

        const valveBtn = document.getElementById('btnToggleValve');
        valveBtn.innerText = isOpen ? "🛑 Close Variable Rate Valve" : "💧 Activate Variable Rate Irrigation";
    }

    applyFertilizerToSelected() {
        const zoneId = window.farmSimulator.selectedZoneId;
        window.farmSimulator.applyFertilizer(zoneId);
        window.farmAudio.playSonarPing();
        alert(`Precision liquid fertigation applied to ${zoneId.toUpperCase()}. Soil NPK enhanced and leaf chlorophyll boosted.`);
    }

    // -------------------------------------------------------------
    // Soundscape Toggle
    // -------------------------------------------------------------
    toggleSoundscape() {
        const isAudible = window.farmAudio.toggleMute();
        const btn = document.getElementById('audioToggleBtn');
        btn.innerText = isAudible ? "🔊 Audio On" : "🔇 Audio Off";
        btn.style.color = isAudible ? "var(--emerald-primary)" : "#cbd5e1";
    }

    // -------------------------------------------------------------
    // Simulation Clock Controls
    // -------------------------------------------------------------
    togglePlayPause() {
        const running = window.farmSimulator.togglePlayPause();
        const btn = document.getElementById('simPlayBtn');
        btn.innerText = running ? "⏸ Pause" : "▶ Resume";
        btn.classList.toggle('active', running);
    }

    setSpeed(speed) {
        window.farmSimulator.setSpeed(speed);
        ['speed1x', 'speed5x', 'speed24x'].forEach(id => {
            document.getElementById(id)?.classList.remove('active');
        });
        document.getElementById(`speed${speed}x`)?.classList.add('active');
    }

    triggerWeatherEvent(eventName) {
        window.farmSimulator.triggerWeatherEvent(eventName);
        window.farmAudio.playSonarPing();
    }

    // -------------------------------------------------------------
    // Map Layers & Drone Animation
    // -------------------------------------------------------------
    setMapLayer(layer) {
        this.activeMapLayer = layer;
        ['btnLayerSat', 'btnLayerVector', 'btnLayerNdvi', 'btnLayerMoist'].forEach(id => {
            document.getElementById(id)?.classList.remove('active');
        });

        const img = document.getElementById('farmSatelliteImg');
        if (layer === 'natural') {
            document.getElementById('btnLayerSat')?.classList.add('active');
            img.src = "images/aerial_farm_drone.jpg";
        } else if (layer === 'vector') {
            document.getElementById('btnLayerVector')?.classList.add('active');
            img.src = "images/farm_satellite_map.svg";
        } else if (layer === 'ndvi') {
            document.getElementById('btnLayerNdvi')?.classList.add('active');
            img.src = "images/aerial_farm_drone.jpg";
        } else if (layer === 'moisture') {
            document.getElementById('btnLayerMoist')?.classList.add('active');
            img.src = "images/aerial_farm_drone.jpg";
        }

        document.getElementById('activeLayerPill').innerText = `Layer: ${layer.toUpperCase()}`;
        this.renderMapOverlay();
    }

    initCanvasMapOverlay() {
        this.renderMapOverlay();
    }

    renderMapOverlay() {
        const canvas = document.getElementById('farmOverlayCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (this.activeMapLayer === 'ndvi') {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.35)'; // Healthy
            ctx.fillRect(40, 40, 320, 180);

            ctx.fillStyle = 'rgba(245, 158, 11, 0.45)'; // Stress
            ctx.fillRect(400, 40, 350, 180);

            ctx.fillStyle = 'rgba(139, 92, 246, 0.35)';
            ctx.fillRect(40, 250, 240, 210);

            ctx.fillStyle = 'rgba(14, 165, 233, 0.4)';
            ctx.fillRect(310, 250, 210, 210);

            ctx.fillStyle = 'rgba(34, 197, 94, 0.35)';
            ctx.fillRect(550, 250, 210, 210);
        } else if (this.activeMapLayer === 'moisture') {
            ctx.fillStyle = 'rgba(14, 165, 233, 0.45)';
            ctx.fillRect(40, 40, 320, 180);

            ctx.fillStyle = 'rgba(239, 68, 68, 0.5)'; // Low moisture alert
            ctx.fillRect(400, 40, 350, 180);
        }

        // Draw Drone Trajectory
        if (this.droneAnimating) {
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(this.dronePosition.x, this.dronePosition.y, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(this.dronePosition.x, this.dronePosition.y, 24, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    dispatchDroneScan() {
        this.droneAnimating = true;
        this.dronePosition = { x: 50, y: 50 };
        window.farmAudio.playSonarPing();

        const interval = setInterval(() => {
            this.dronePosition.x += 14;
            this.dronePosition.y += 7;
            this.renderMapOverlay();

            if (this.dronePosition.x >= 750) {
                clearInterval(interval);
                this.droneAnimating = false;
                this.renderMapOverlay();
                window.farmAudio.playSonarPing();
                alert("Multispectral Autonomous Drone Survey completed! High-resolution NDVI and thermal layers synchronized.");
            }
        }, 80);
    }

    // -------------------------------------------------------------
    // FPV Cockpit
    // -------------------------------------------------------------
    toggleFlirThermal() {
        this.isFlirThermal = !this.isFlirThermal;
        const feed = document.getElementById('fpvCameraFeed');
        const btn = document.getElementById('btnToggleFlir');
        feed.classList.toggle('thermal-flir', this.isFlirThermal);
        btn.innerText = this.isFlirThermal ? "🌿 Normal Optical Mode" : "🔥 Toggle FLIR Thermal";
    }

    // -------------------------------------------------------------
    // AgriCopilot AI Assistant
    // -------------------------------------------------------------
    sendCopilotPrompt(promptText) {
        document.getElementById('copilotInput').value = promptText;
        this.sendCopilotMessage();
    }

    sendCopilotMessage() {
        const input = document.getElementById('copilotInput');
        const text = input.value.trim();
        if (!text) return;

        const container = document.getElementById('chatMessagesContainer');
        // Render user message
        const userDiv = document.createElement('div');
        userDiv.className = 'chat-bubble user';
        userDiv.innerText = text;
        container.appendChild(userDiv);
        input.value = '';

        // Generate AI response
        setTimeout(() => {
            const reply = window.agriCopilot.ask(text);
            const aiDiv = document.createElement('div');
            aiDiv.className = 'chat-bubble ai';
            aiDiv.innerHTML = reply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
            container.appendChild(aiDiv);
            container.scrollTop = container.scrollHeight;
            window.farmAudio.playSonarPing();
        }, 300);
    }

    // -------------------------------------------------------------
    // AI Disease Vision Lab
    // -------------------------------------------------------------
    loadDiseaseSample(sampleId) {
        const sample = window.diseaseVisionLab.scanSample(sampleId);
        const img = document.getElementById('activeScannerImg');
        img.src = sample.imagePath;
        img.onerror = () => { img.src = sample.fallbackImage; };

        document.getElementById('scannerCropTitle').innerText = sample.crop;
        this.updateDiseaseReportUI(sample);

        document.querySelectorAll('.gallery-thumb').forEach(thumb => {
            thumb.classList.remove('active');
        });
        event?.currentTarget?.classList.add('active');
    }

    handleCustomLeafUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            document.getElementById('activeScannerImg').src = dataUrl;
            const customDiagnosis = window.diseaseVisionLab.scanCustomImage(dataUrl);
            this.updateDiseaseReportUI(customDiagnosis);
            this.runAiDiseaseScan();
        };
        reader.readAsDataURL(file);
    }

    runAiDiseaseScan() {
        const laser = document.getElementById('scannerLaser');
        laser.classList.add('scanning');
        document.getElementById('scannerStatusPill').innerText = 'Neural Scanning...';
        window.farmAudio.playSonarPing();

        const sample = window.diseaseVisionLab.currentSelectedDisease;
        const container = document.getElementById('lesionsContainer');
        container.innerHTML = '';

        setTimeout(() => {
            laser.classList.remove('scanning');
            document.getElementById('scannerStatusPill').innerText = 'Scan Complete';
            window.farmAudio.playSonarPing();

            if (sample.lesions && sample.lesions.length > 0) {
                container.innerHTML = sample.lesions.map(l => `
                    <div class="lesion-box" style="left: ${l.x}px; top: ${l.y}px; width: ${l.w}px; height: ${l.h}px;">
                        <span class="lesion-tag">${l.label}</span>
                    </div>
                `).join('');
            }
        }, 1200);
    }

    updateDiseaseReportUI(diag) {
        document.getElementById('diagDiseaseName').innerText = diag.diseaseName;
        document.getElementById('diagPathogen').innerText = diag.pathogen;
        document.getElementById('diagConfidence').innerText = `${diag.confidence}%`;
        document.getElementById('diagSeverity').innerText = diag.severity;
        document.getElementById('diagSymptoms').innerText = diag.symptoms;

        document.getElementById('prescOrganic').innerText = diag.prescription.organic;
        document.getElementById('prescChemical').innerText = diag.prescription.chemical;
        document.getElementById('prescCultural').innerText = diag.prescription.cultural;

        document.getElementById('lesionsContainer').innerHTML = '';
    }

    dispatchDroneSpray() {
        window.farmAudio.playSonarPing();
        alert("Agro-chemical flight trajectory calculated. Autonomous DJI Agras T40 drone dispatched for targeted ultra-low volume precision foliar spray.");
    }

    // -------------------------------------------------------------
    // VRT Matrix Table
    // -------------------------------------------------------------
    renderVrtTable() {
        const tbody = document.getElementById('vrtTableBody');
        if (!tbody) return;

        const zones = window.farmSimulator.zones;
        tbody.innerHTML = zones.map(z => `
            <tr>
                <td><strong>${z.name.split(':')[0]}</strong></td>
                <td>${z.crop}</td>
                <td><strong style="color: ${z.moisture < 25 ? '#ef4444' : 'var(--emerald-primary)'};">${z.moisture}%</strong></td>
                <td>25% Low / 55% High</td>
                <td><span class="hud-pill ${z.valveOpen ? 'active' : ''}">${z.valveOpen ? 'PUMPING (Open)' : 'CLOSED (Standby)'}</span></td>
                <td>${z.waterUsageGal.toLocaleString()} Gal</td>
                <td>
                    <button class="btn-secondary" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="app.toggleValveById('${z.id}')">
                        ${z.valveOpen ? 'Close' : 'Open'}
                    </button>
                </td>
            </tr>
        `).join('');
    }

    toggleValveById(zoneId) {
        window.farmSimulator.toggleIrrigation(zoneId);
        window.farmAudio.playValveClick();
        this.renderVrtTable();
    }
}

// Global Bootstrap
window.addEventListener('DOMContentLoaded', () => {
    window.app = new CloudAgriApp();
    window.app.init();
});
