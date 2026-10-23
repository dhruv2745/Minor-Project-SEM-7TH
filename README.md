# 🌱 CloudAgri Studio
### Enterprise Autonomous Precision Agriculture & Farm Digital Twin Simulator

CloudAgri Studio is a next-generation precision agriculture platform. It combines high-resolution aerial drone imagery, macro botanical plant pathology photography, First-Person View (FPV) drone cockpit telemetry, multi-zone IoT soil stratigraphy, an autonomous robotics fleet hub, and an intelligent conversational AI Agronomist Copilot (**AgriCopilot**).

---

## 🌟 Advanced Platform Capabilities

### 1. 500-Acre Photorealistic Farm Digital Twin
- **High-Resolution Aerial Orthomosaic:** Toggle between true-color aerial drone photography (`aerial_farm_drone.jpg`), cadastral vector GIS parcels, NDVI infrared heatmaps, and soil moisture saturation zones.
- **3D Soil Stratigraphy Depth Inspector:** Real-time 3-tier soil profile monitoring (Topsoil 0-15cm, Subsoil 15-45cm, Deep Substratum 45-100cm) with moisture saturation, organic matter %, and cation-exchange capacity (CEC).

### 2. AI Plant Disease & Neural Vision Pathology Lab
- **Real Botanical Macro Photography:** Incorporates authentic close-up pathology photos for **Tomato Early Blight** (*Alternaria solani*) and **Corn Northern Leaf Blight** (*Exserohilum turcicum*), along with Late Blight and Stripe Rust samples.
- **Real-Time Lesion Segmentation:** Visualizes necrotic patches and chlorotic yellow margins with dynamic bounding boxes and confidence metrics (up to 99.1%).
- **Targeted Agronomic Prescriptions:** 3-tier interventions across biological/organic remedies, chemical formulations, and cultural microclimate adjustments.

### 3. FPV Drone Cockpit (AeroScan X40)
- **First-Person View Aerial HUD:** Live flight telemetry featuring pitch/roll artificial horizon, airspeed (32.4 km/h), altitude (45.2 m AGL), battery voltage, and RTK GPS positioning.
- **FLIR Thermal Infrared Mode:** One-click toggle between natural optical spectrum and FLIR thermal false-color infrared to identify canopy transpiration hotspots.

### 4. Autonomous Fleet & Robotics Hub
- Live telemetry and mission dispatching for:
  - **AeroScan X40** (Multispectral Aerial Mapping Drone)
  - **Agras T40 Bio-Sprayer** (High-Volume Precision Foliar Drone)
  - **TerraBot Pro** (Autonomous Electric LiDAR Weeding Rover)
  - **Pivot Sentinel Alpha** (Automated Variable-Rate Center-Pivot Rig)

### 5. AgriCopilot — AI Agronomic Intelligence Advisor
- Conversational agronomist assistant grounded in live IoT field telemetry.
- Answers questions regarding nitrogen top-dressing, disease biology, moisture deficits, and market commodity futures.

### 6. Web Audio API Ambient Farm Soundscapes
- Procedurally synthesized gentle wind breeze rustling through crop canopies, rain drop acoustics, and radar telemetry sonar pings. Toggleable with one click.

---

## 📂 Project Architecture
```
ai-farming-simulator/
│
├── index.html                   # Core dashboard (Digital Twin, Disease Lab, FPV Cockpit, Fleet, Copilot, VRT)
├── styles.css                   # Forest-tech theme, FPV HUD, chat bubbles, laser scanner, glassmorphism
├── farm_simulator.js           # 500-acre digital twin simulation engine, IoT sensors, weather events
├── disease_vision.js           # AI computer vision pathology lab, lesion detector & prescriptions
├── yield_engine.js             # FAO-56 Penman-Monteith ET0, GDD, yield prediction & carbon credits
├── fleet_robotics.js           # Autonomous robotics fleet management & telemetry
├── agri_copilot.js             # AI agronomist conversational chat assistant
├── farm_audio.js               # Web Audio API ambient wind & radar sonar synthesizer
├── app.js                       # UI controller, FPV cockpit, canvas layers & drone survey
├── server.py                    # Local Python web server with auto-browser launch
├── run_farming_simulator.bat    # 1-click Windows runner script
├── vercel.json                  # 1-click Vercel deployment configuration
├── netlify.toml                 # 1-click Netlify deployment configuration
├── images/                      # Real high-resolution photography & SVG assets
│   ├── aerial_farm_drone.jpg    # Ultra-realistic 500-acre aerial farm drone photo (1.07 MB)
│   ├── real_tomato_blight.jpg   # Macro photo of Alternaria solani early blight (885 KB)
│   ├── real_corn_blight.jpg     # Macro photo of Exserohilum turcicum corn blight (753 KB)
│   ├── smart_drone_spray.jpg    # Photo of agricultural spraying drone over wheat (971 KB)
│   ├── smart_greenhouse.jpg     # Photo of commercial hydroponic smart greenhouse (1.28 MB)
│   ├── farm_satellite_map.svg   # Cadastral parcel coordinate map
│   ├── potato_late_blight.svg   # Pathology sample
│   ├── wheat_yellow_rust.svg    # Pathology sample
│   └── healthy_crop.svg         # Healthy control sample
└── README.md                    # Platform documentation
```

---

## 🚀 How to Run Locally

### Option 1: 1-Click Windows Launch (Recommended)
Double-click `run_farming_simulator.bat`. It will start the local server and open your browser at `http://localhost:8080`.

### Option 2: Python Command Line
```bash
python server.py
```

### Option 3: Direct Browser Launch
Double-click `index.html` in Chrome, Edge, Brave, or Firefox. Everything executes 100% client-side with zero dependencies!

---

## 🌐 Instant Free Cloud Hosting (Live in 10 Seconds)

1. Open **[https://app.netlify.com/drop](https://app.netlify.com/drop)** in your web browser.
2. Drag and drop the `ai-farming-simulator` project folder (or `ai-farming-simulator.zip`).
3. Netlify will immediately publish your application with a public, secure `https://...` link.
