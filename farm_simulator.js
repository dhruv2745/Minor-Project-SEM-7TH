/**
 * CloudAgri Studio - Farm Digital Twin Simulation Engine
 * Manages 500-Acre Multi-Zone Telemetry, IoT Soil Sensors,
 * Crop Phenology, Microclimate Events, and Automation Loops.
 */

class FarmSimulator {
    constructor() {
        this.simulationRunning = true;
        this.simSpeed = 1; // 1x, 5x, 24x
        this.simDay = 48;
        this.simHour = 14;
        this.simMinute = 30;
        this.weatherState = "Sunny & Clear";
        this.ambientTemp = 27.5; // Celsius
        this.relativeHumidity = 54; // %
        this.solarRadiation = 780; // W/m2
        this.windSpeed = 12.4; // km/h

        this.zones = [
            {
                id: "zone-a",
                name: "Zone A: Winter Wheat",
                crop: "Wheat (Triticum aestivum)",
                acres: 120,
                soilType: "Clay Loam",
                moisture: 36.2, // %
                soilTemp: 22.8, // C
                ph: 6.6,
                ec: 1.4, // mS/cm
                nitrogen: 78, // mg/kg
                phosphorus: 34,
                potassium: 195,
                ndvi: 0.82,
                healthStatus: "Optimal",
                stage: "Grain Filling",
                daysToHarvest: 32,
                irrigationStatus: "Standby",
                valveOpen: false,
                color: "#10b981",
                waterUsageGal: 48200
            },
            {
                id: "zone-b",
                name: "Zone B: Sweet Corn",
                crop: "Corn (Zea mays)",
                acres: 110,
                soilType: "Silt Loam",
                moisture: 27.8, // Slightly dry
                soilTemp: 24.1,
                ph: 6.4,
                ec: 1.8,
                nitrogen: 92,
                phosphorus: 42,
                potassium: 210,
                ndvi: 0.69,
                healthStatus: "Water Stress Warning",
                stage: "Tasseling / Silking",
                daysToHarvest: 45,
                irrigationStatus: "Irrigation Active",
                valveOpen: true,
                color: "#f59e0b",
                waterUsageGal: 89400
            },
            {
                id: "zone-c",
                name: "Zone C: Premium Vineyard",
                crop: "Cabernet Sauvignon Grapes",
                acres: 75,
                soilType: "Rocky Gravel Alluvium",
                moisture: 22.4, // Controlled deficit irrigation
                soilTemp: 25.2,
                ph: 7.1,
                ec: 1.1,
                nitrogen: 45,
                phosphorus: 28,
                potassium: 165,
                ndvi: 0.74,
                healthStatus: "Optimal (Veraison)",
                stage: "Veraison (Berry Softening)",
                daysToHarvest: 28,
                irrigationStatus: "Controlled Deficit",
                valveOpen: false,
                color: "#8b5cf6",
                waterUsageGal: 32100
            },
            {
                id: "zone-d",
                name: "Zone D: Smart Greenhouse",
                crop: "Hydroponic Bell Peppers",
                acres: 30,
                soilType: "Rockwool / Soilless NFT",
                moisture: 68.0,
                soilTemp: 23.5,
                ph: 5.8,
                ec: 2.2,
                nitrogen: 140,
                phosphorus: 55,
                potassium: 260,
                ndvi: 0.91,
                healthStatus: "Peak Productivity",
                stage: "Continuous Harvesting",
                daysToHarvest: 7,
                irrigationStatus: "Automated Pulse Drip",
                valveOpen: true,
                color: "#0ea5e9",
                waterUsageGal: 18500
            },
            {
                id: "zone-e",
                name: "Zone E: Organic Soybeans",
                crop: "Soybeans (Glycine max)",
                acres: 95,
                soilType: "Rich Loam",
                moisture: 38.5,
                soilTemp: 22.1,
                ph: 6.8,
                ec: 1.3,
                nitrogen: 65, // N-fixing
                phosphorus: 38,
                potassium: 180,
                ndvi: 0.77,
                healthStatus: "Optimal",
                stage: "Pod Development",
                daysToHarvest: 38,
                irrigationStatus: "Standby",
                valveOpen: false,
                color: "#22c55e",
                waterUsageGal: 41200
            }
        ];

        this.selectedZoneId = "zone-a";
        this.simulationTimer = null;
        this.startLoop();
    }

    startLoop() {
        if (this.simulationTimer) clearInterval(this.simulationTimer);
        this.simulationTimer = setInterval(() => {
            if (this.simulationRunning) {
                this.tick();
            }
        }, 1000);
    }

    tick() {
        // Advance clock based on speed
        this.simMinute += 5 * this.simSpeed;
        if (this.simMinute >= 60) {
            this.simMinute = 0;
            this.simHour += 1;
            if (this.simHour >= 24) {
                this.simHour = 0;
                this.simDay += 1;
            }
        }

        // Simulate microclimate fluctuations
        const diurnalShift = Math.sin((this.simHour - 6) / 12 * Math.PI);
        this.ambientTemp = +(24 + diurnalShift * 6 + (Math.random() * 0.4 - 0.2)).toFixed(1);
        this.relativeHumidity = +(65 - diurnalShift * 20 + (Math.random() * 1.5 - 0.75)).toFixed(1);
        this.solarRadiation = this.simHour >= 6 && this.simHour <= 19 
            ? +(Math.max(0, Math.sin((this.simHour - 6) / 13 * Math.PI) * 920)).toFixed(0)
            : 0;

        // Simulate zone dynamics
        this.zones.forEach(zone => {
            if (zone.valveOpen) {
                // Soil moisture rises during active irrigation
                zone.moisture = +(Math.min(75, zone.moisture + 0.35 * this.simSpeed)).toFixed(1);
                zone.waterUsageGal += Math.round(15 * this.simSpeed);
                if (zone.moisture >= 45 && zone.id !== "zone-d") {
                    zone.valveOpen = false;
                    zone.irrigationStatus = "Standby (Target Reached)";
                }
            } else {
                // Soil moisture evaporates based on temp & solar radiation
                const evapRate = (this.solarRadiation > 200 ? 0.08 : 0.02) * this.simSpeed;
                zone.moisture = +(Math.max(15, zone.moisture - evapRate)).toFixed(1);

                // Auto-trigger smart irrigation if too dry
                if (zone.moisture < 25 && zone.id !== "zone-c") {
                    zone.valveOpen = true;
                    zone.irrigationStatus = "AI Auto-Triggered VRT";
                }
            }

            // Update status string
            if (zone.moisture < 24) {
                zone.healthStatus = "Severe Water Stress";
                zone.ndvi = +(Math.max(0.45, zone.ndvi - 0.002)).toFixed(2);
            } else if (zone.moisture > 65 && zone.id !== "zone-d") {
                zone.healthStatus = "Saturated / Root Anoxia Risk";
            } else {
                zone.healthStatus = "Optimal Photosynthesis";
            }
        });

        if (this.onTick) this.onTick(this.getSummary());
    }

    setSpeed(speed) {
        this.simSpeed = speed;
    }

    togglePlayPause() {
        this.simulationRunning = !this.simulationRunning;
        return this.simulationRunning;
    }

    triggerWeatherEvent(eventName) {
        if (eventName === "rain") {
            this.weatherState = "Torrential Rainfall (42mm)";
            this.relativeHumidity = 92;
            this.ambientTemp = 19.2;
            this.zones.forEach(z => {
                z.moisture = +(Math.min(80, z.moisture + 18)).toFixed(1);
                z.valveOpen = false;
                z.irrigationStatus = "Rain Suspension";
            });
        } else if (eventName === "heatwave") {
            this.weatherState = "Heatwave Advisory (39°C)";
            this.ambientTemp = 39.4;
            this.relativeHumidity = 22;
            this.solarRadiation = 980;
            this.zones.forEach(z => {
                z.moisture = +(Math.max(12, z.moisture - 8)).toFixed(1);
            });
        } else if (eventName === "frost") {
            this.weatherState = "Critical Frost Warning (1.5°C)";
            this.ambientTemp = 1.8;
            this.relativeHumidity = 78;
            this.solarRadiation = 150;
        } else if (eventName === "sunny") {
            this.weatherState = "Optimal Clear Sunshine";
            this.ambientTemp = 27.5;
            this.relativeHumidity = 52;
            this.solarRadiation = 820;
        }
        if (this.onTick) this.onTick(this.getSummary());
    }

    toggleIrrigation(zoneId) {
        const zone = this.zones.find(z => z.id === zoneId);
        if (zone) {
            zone.valveOpen = !zone.valveOpen;
            zone.irrigationStatus = zone.valveOpen ? "Manual Irrigation Active" : "Standby (Valve Closed)";
            if (this.onTick) this.onTick(this.getSummary());
            return zone.valveOpen;
        }
        return false;
    }

    applyFertilizer(zoneId) {
        const zone = this.zones.find(z => z.id === zoneId);
        if (zone) {
            zone.nitrogen += 25;
            zone.phosphorus += 12;
            zone.potassium += 30;
            zone.ndvi = +(Math.min(0.95, zone.ndvi + 0.04)).toFixed(2);
            if (this.onTick) this.onTick(this.getSummary());
            return true;
        }
        return false;
    }

    getSummary() {
        return {
            day: this.simDay,
            time: `${this.simHour.toString().padStart(2, '0')}:${this.simMinute.toString().padStart(2, '0')}`,
            speed: this.simSpeed,
            running: this.simulationRunning,
            weather: this.weatherState,
            temp: this.ambientTemp,
            humidity: this.relativeHumidity,
            solar: this.solarRadiation,
            wind: this.windSpeed,
            zones: this.zones,
            selectedZone: this.zones.find(z => z.id === this.selectedZoneId) || this.zones[0]
        };
    }
}

window.farmSimulator = new FarmSimulator();
