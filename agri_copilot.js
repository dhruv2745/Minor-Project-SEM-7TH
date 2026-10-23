/**
 * CloudAgri Studio - AI Agronomist Copilot ("AgriCopilot")
 * Intelligent Conversational Assistant grounded in live IoT field telemetry,
 * soil chemistry, plant pathology, and variable-rate prescriptions.
 */

class AgriCopilot {
    constructor() {
        this.chatHistory = [
            {
                sender: "ai",
                time: "14:30",
                text: "Hello! I am **AgriCopilot**, your autonomous agronomic intelligence advisor. I am actively monitoring telemetry across all 430 acres. How can I assist with crop nutrition, disease diagnosis, or irrigation optimization today?"
            }
        ];

        this.quickPrompts = [
            "Why is Zone B flagged with a water stress warning?",
            "What is the recommended nitrogen top-dress for Zone A Wheat?",
            "How should I manage Alternaria solani in humid conditions?",
            "Calculate expected harvest revenue if market prices drop 5%?",
            "Deploy autonomous drone spray mission for Zone B"
        ];
    }

    /**
     * Generate contextual response based on current live farm telemetry
     */
    ask(question) {
        const text = question.trim().toLowerCase();
        const summary = window.farmSimulator.getSummary();
        const selectedZone = summary.selectedZone;
        const now = `${summary.time}`;

        this.chatHistory.push({ sender: "user", time: now, text: question });

        let responseText = "";

        if (text.includes("zone b") || text.includes("corn") || text.includes("water stress")) {
            const zb = summary.zones.find(z => z.id === "zone-b");
            responseText = `**Zone B (Sweet Corn - 110 Acres) Telemetry Assessment:**
- **Current Soil Moisture:** ${zb.moisture}% (Target: 32-45%).
- **Depletion Status:** Available water capacity has dipped into the stress threshold due to high midday evapotranspiration (${window.yieldEngine.calculateET0(summary.temp, summary.humidity, summary.solar, summary.wind)} mm/day).
- **Automated Recommendation:** Variable Rate Irrigation valve **#V-02** is currently **${zb.valveOpen ? "PUMPING (Active)" : "STANDBY"}**. We recommend maintaining a 2.5-hour drip cycle delivering approximately 18,000 gallons to replenish root-zone field capacity without inducing runoff.`;
        } 
        else if (text.includes("nitrogen") || text.includes("fertilizer") || text.includes("zone a") || text.includes("wheat")) {
            const za = summary.zones.find(z => z.id === "zone-a");
            responseText = `**Zone A (Winter Wheat - 120 Acres) Fertility Advisory:**
- **Current Soil Nitrogen (N):** ${za.nitrogen} mg/kg (Adequate to High).
- **Phenological Stage:** ${za.stage} (Feekes 10.5.1).
- **Agronomic Action:** At this grain-filling stage, high nitrate applications risk lodging. Instead, apply a targeted **foliar urea solution (12-0-0)** at 5 kg/ha with micronutrient zinc to elevate grain protein content without excessive vegetative biomass.`;
        }
        else if (text.includes("alternaria") || text.includes("blight") || text.includes("disease") || text.includes("fungicide")) {
            responseText = `**Pathology Advisory: Alternaria solani (Early Blight):**
- **Infection Dynamics:** Spores germinate when free moisture persists on leaves for >6 hours at temperatures between 24°C and 29°C.
- **Immediate Intervention:** 
  1. Rotate to **Azoxystrobin 23% SC** (1.0 ml/L) or **Chlorothalonil 75% WP** (2.0 g/L).
  2. For organic management, dispatch **Bacillus subtilis** (Serenade ASO) bio-fungicide at 2 kg/ha.
  3. Ensure canopy aeration and avoid late-afternoon overhead irrigation to minimize leaf wetness duration.`;
        }
        else if (text.includes("revenue") || text.includes("price") || text.includes("market") || text.includes("profit")) {
            responseText = `**Economic Sensitivity Simulation (-5% Commodity Price Shock):**
- **Current Farm Projected Gross:** $1,185,350 across 430 acres.
- **Adjusted Gross (-5%):** $1,126,082 (Variance: -$59,268).
- **Total Input OpEx:** $104,220.
- **Adjusted Net Operating Profit:** **$1,021,862** (Net Margin: **90.7%**).
- **Risk Mitigation:** Recommend executing forward futures hedging contracts on 40% of the standing Winter Wheat crop at the current $6.85/bushel Chicago Board of Trade (CBOT) rate.`;
        }
        else if (text.includes("drone") || text.includes("deploy") || text.includes("spray")) {
            responseText = `**Robotics Mission Dispatched:**
- **Unit:** Agras T40 Autonomous Bio-Sprayer (Drone #02).
- **Payload:** 40L Bio-fungicide & micronutrient suspension.
- **Flight Path:** High-precision RTK autonomous trajectory over Zone B canopy at 2.5m altitude.
- **Telemetry:** Battery 88%, Signal: Strong, Flow Rate: 4.5 L/min.`;
            // Trigger drone spray animation
            window.app.dispatchDroneScan();
        }
        else {
            responseText = `**Field Telemetry Synthesis for ${selectedZone.name}:**
- **Crop:** ${selectedZone.crop} (${selectedZone.stage})
- **Soil Moisture:** ${selectedZone.moisture}% | **Soil Temp:** ${selectedZone.soilTemp}°C | **pH:** ${selectedZone.ph}
- **NDVI Canopy Vigor:** ${selectedZone.ndvi} (${selectedZone.healthStatus})
- **Atmospheric Demand (ET₀):** ${window.yieldEngine.calculateET0(summary.temp, summary.humidity, summary.solar, summary.wind)} mm/day
- Everything is operating within healthy precision agriculture parameters. Ask me anything specific regarding pest control, soil amendments, or irrigation schedules!`;
        }

        this.chatHistory.push({ sender: "ai", time: now, text: responseText });
        return responseText;
    }
}

window.agriCopilot = new AgriCopilot();
