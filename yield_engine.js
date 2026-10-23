/**
 * CloudAgri Studio - Agronomic Yield Prediction & Precision Economics Engine
 * Implements FAO-56 Penman-Monteith Evapotranspiration, Growing Degree Days,
 * Yield Loss Sensitivity, Commodity Pricing, and Carbon Credit Accounting.
 */

class AgronomicYieldEngine {
    constructor() {
        this.commodityPrices = {
            wheat: { pricePerBushel: 6.85, baselineBushelsPerAcre: 68 },
            corn: { pricePerBushel: 4.60, baselineBushelsPerAcre: 185 },
            soybeans: { pricePerBushel: 12.40, baselineBushelsPerAcre: 52 },
            grapes: { pricePerTon: 2850, baselineTonsPerAcre: 4.2 },
            peppers: { pricePerLb: 1.85, baselineLbsPerAcre: 24000 }
        };

        this.inputCosts = {
            waterCostPer1000Gal: 1.80,
            fertilizerCostPerAcre: 65.00,
            dieselAndMachineryPerAcre: 42.00,
            laborAndOpsPerAcre: 35.00,
            carbonCreditPerTonCO2: 32.50
        };
    }

    /**
     * Compute FAO-56 Reference Evapotranspiration (ET0) approximation (mm/day)
     * Simplified Penman-Monteith for agricultural field management
     */
    calculateET0(tempC, humidityPct, solarRadiationWm2, windSpeedKmh) {
        // Net radiation conversion
        const Rn = solarRadiationWm2 * 0.0864 * 0.408; // approximate MJ/m2/day to mm/day
        const delta = 4098 * (0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3))) / Math.pow(tempC + 237.3, 2);
        const gamma = 0.066; // psychrometric constant kPa/C
        const u2 = windSpeedKmh / 3.6; // m/s
        const es = 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3));
        const ea = es * (humidityPct / 100);

        const et0 = (0.408 * delta * Rn + gamma * (900 / (tempC + 273)) * u2 * (es - ea)) / (delta + gamma * (1 + 0.34 * u2));
        return Math.max(1.2, Math.min(9.8, +et0.toFixed(2)));
    }

    /**
     * Compute Cumulative Growing Degree Days (GDD)
     * GDD = ((Tmax + Tmin) / 2) - Tbase
     */
    calculateGDD(tMax, tMin, tBase = 10) {
        const mean = (tMax + tMin) / 2;
        return Math.max(0, +(mean - tBase).toFixed(1));
    }

    /**
     * Forecast Yield for a given zone based on moisture, nutrients, and NDVI
     */
    predictZoneYield(zone) {
        let cropKey = "wheat";
        if (zone.id === "zone-b") cropKey = "corn";
        else if (zone.id === "zone-c") cropKey = "grapes";
        else if (zone.id === "zone-d") cropKey = "peppers";
        else if (zone.id === "zone-e") cropKey = "soybeans";

        const benchmark = this.commodityPrices[cropKey];

        // Moisture stress coefficient Ks (optimal between 30% and 55%)
        let moistureCoeff = 1.0;
        if (zone.moisture < 25) {
            moistureCoeff = 0.65 + (zone.moisture / 25) * 0.25;
        } else if (zone.moisture > 65 && zone.id !== "zone-d") {
            moistureCoeff = 0.82;
        }

        // Nutrient sufficiency factor based on NPK
        const nutrientAvg = (zone.nitrogen + zone.phosphorus * 1.5 + zone.potassium * 0.4) / 3;
        const nutrientCoeff = Math.min(1.15, Math.max(0.75, nutrientAvg / 80));

        // Projected yield calculation
        const projectedPerAcre = +(benchmark.baselineBushelsPerAcre 
            ? benchmark.baselineBushelsPerAcre * moistureCoeff * nutrientCoeff * (zone.ndvi / 0.8)
            : (benchmark.baselineTonsPerAcre || benchmark.baselineLbsPerAcre) * moistureCoeff * nutrientCoeff * (zone.ndvi / 0.8)).toFixed(1);

        const totalYield = Math.round(projectedPerAcre * zone.acres);

        // Revenue calculation
        let grossRevenue = 0;
        if (benchmark.pricePerBushel) {
            grossRevenue = Math.round(totalYield * benchmark.pricePerBushel);
        } else if (benchmark.pricePerTon) {
            grossRevenue = Math.round(totalYield * benchmark.pricePerTon);
        } else if (benchmark.pricePerLb) {
            grossRevenue = Math.round(totalYield * benchmark.pricePerLb);
        }

        // Cost estimation
        const waterCost = Math.round((zone.waterUsageGal / 1000) * this.inputCosts.waterCostPer1000Gal);
        const fertilizerCost = Math.round(zone.acres * this.inputCosts.fertilizerCostPerAcre);
        const machineryCost = Math.round(zone.acres * this.inputCosts.dieselAndMachineryPerAcre);
        const laborCost = Math.round(zone.acres * this.inputCosts.laborAndOpsPerAcre);
        const totalCost = waterCost + fertilizerCost + machineryCost + laborCost;

        const netProfit = grossRevenue - totalCost;
        const profitMarginPct = grossRevenue > 0 ? +((netProfit / grossRevenue) * 100).toFixed(1) : 0;

        // Carbon credit calculation (regenerative soil carbon sequestration ~0.85 MT CO2e/acre/yr)
        const carbonSequesteredTons = +(zone.acres * 0.85).toFixed(1);
        const carbonRevenue = Math.round(carbonSequesteredTons * this.inputCosts.carbonCreditPerTonCO2);

        return {
            cropKey,
            projectedPerAcre,
            totalYield,
            grossRevenue,
            waterCost,
            fertilizerCost,
            totalCost,
            netProfit,
            profitMarginPct,
            carbonSequesteredTons,
            carbonRevenue
        };
    }
}

window.yieldEngine = new AgronomicYieldE
