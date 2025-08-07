// Enhanced Piezoelectric Circuit Builder with Analytics Dashboard
class EnhancedCircuitBuilder {
    constructor() {
        // Core simulation properties
        this.canvas = document.getElementById('circuitCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.components = [];
        this.wires = [];
        this.selectedComponent = null;
        this.isSimulating = false;
        this.wireMode = false;
        this.wireStart = null;
        this.draggedComponent = null;
        this.autoStepInterval = null;
        this.nextComponentId = 1;
        this.nextWireId = 1;
        this.hoveredConnectionPoint = null;
        this.previewWire = null;
        this.draggedFromLibrary = null;
        this.dragOffset = null;
        
        // Enhanced UI properties
        this.currentTheme = 'light';
        this.drawerOpen = true;
        this.currentTab = 'circuit';
        this.analyticsInitialized = false;
        
        // Analytics properties
        this.charts = {};
        this.analyticsData = null;
        this.currentTrafficScenario = 'single_walker';
        this.calculatorValues = {
            weight: 70,
            steps: 5000,
            speed: 'normal',
            tiles: 10
        };

        // Load analytics data
        this.loadAnalyticsData();
        
        // Component specifications
        this.componentSpecs = {
            piezo_single: { 
                width: 120, height: 80, voltage_peak: 15, current_peak: 2, 
                symbol: "⚡", color: "#00BCD4", label: "15V/2mA",
                connectionPoints: [
                    {id: "ac1", x: 20, y: 40, type: "ac"},
                    {id: "ac2", x: 100, y: 40, type: "ac"}
                ]
            },
            piezo_series: { 
                width: 160, height: 80, voltage_peak: 30, current_peak: 2, 
                symbol: "⚡⚡", color: "#00BCD4", label: "30V/2mA",
                connectionPoints: [
                    {id: "ac1", x: 20, y: 40, type: "ac"},
                    {id: "ac2", x: 140, y: 40, type: "ac"}
                ]
            },
            piezo_parallel: { 
                width: 120, height: 120, voltage_peak: 15, current_peak: 4, 
                symbol: "⚡|⚡", color: "#00BCD4", label: "15V/4mA",
                connectionPoints: [
                    {id: "ac1", x: 20, y: 60, type: "ac"},
                    {id: "ac2", x: 100, y: 60, type: "ac"}
                ]
            },
            piezo_quad: { 
                width: 160, height: 120, voltage_peak: 30, current_peak: 4, 
                symbol: "⚡⚡\n⚡⚡", color: "#00BCD4", label: "30V/4mA",
                connectionPoints: [
                    {id: "ac1", x: 20, y: 60, type: "ac"},
                    {id: "ac2", x: 140, y: 60, type: "ac"}
                ]
            },
            diode: { 
                width: 80, height: 50, forward_voltage: 0.7, 
                symbol: "▷|", color: "#6B7280", label: "0.7V",
                connectionPoints: [
                    {id: "anode", x: 10, y: 25, type: "positive"},
                    {id: "cathode", x: 70, y: 25, type: "negative"}
                ]
            },
            bridge_rectifier: { 
                width: 120, height: 100, voltage_drop: 1.4, efficiency: 0.9, 
                symbol: "◇", color: "#6B7280", label: "Bridge",
                connectionPoints: [
                    {id: "ac1", x: 10, y: 50, type: "ac"},
                    {id: "ac2", x: 110, y: 50, type: "ac"},
                    {id: "dc_pos", x: 60, y: 10, type: "positive"},
                    {id: "dc_neg", x: 60, y: 90, type: "negative"}
                ]
            },
            schottky_diode: { 
                width: 80, height: 50, forward_voltage: 0.3, 
                symbol: "▷||", color: "#6B7280", label: "0.3V",
                connectionPoints: [
                    {id: "anode", x: 10, y: 25, type: "positive"},
                    {id: "cathode", x: 70, y: 25, type: "negative"}
                ]
            },
            capacitor_100uf: { 
                width: 80, height: 80, capacitance: 0.0001, voltage_rating: 16, 
                symbol: "||", color: "#0097A7", label: "100µF/16V",
                connectionPoints: [
                    {id: "positive", x: 20, y: 40, type: "positive"},
                    {id: "negative", x: 60, y: 40, type: "negative"}
                ]
            },
            capacitor_1mf: { 
                width: 100, height: 80, capacitance: 0.001, voltage_rating: 25, 
                symbol: "||", color: "#0097A7", label: "1mF/25V",
                connectionPoints: [
                    {id: "positive", x: 25, y: 40, type: "positive"},
                    {id: "negative", x: 75, y: 40, type: "negative"}
                ]
            },
            capacitor_10mf: { 
                width: 120, height: 80, capacitance: 0.01, voltage_rating: 16, 
                symbol: "||", color: "#0097A7", label: "10mF/16V",
                connectionPoints: [
                    {id: "positive", x: 30, y: 40, type: "positive"},
                    {id: "negative", x: 90, y: 40, type: "negative"}
                ]
            },
            battery_liion: { 
                width: 100, height: 60, voltage: 3.7, capacity: 2000, 
                symbol: "|+−|", color: "#F59E0B", label: "3.7V Li-ion",
                connectionPoints: [
                    {id: "positive", x: 20, y: 30, type: "positive"},
                    {id: "negative", x: 80, y: 30, type: "negative"}
                ]
            },
            lm7805: { 
                width: 120, height: 80, input_min: 7, output: 5, efficiency: 0.7, 
                symbol: "7805", color: "#1F2937", label: "5V Reg",
                connectionPoints: [
                    {id: "input", x: 20, y: 25, type: "positive"},
                    {id: "ground", x: 60, y: 70, type: "negative"},
                    {id: "output", x: 100, y: 25, type: "positive"}
                ]
            },
            ltc3588: { 
                width: 120, height: 80, input_min: 2.7, output: 3.3, efficiency: 0.9, 
                symbol: "3588", color: "#1F2937", label: "3.3V Reg",
                connectionPoints: [
                    {id: "vin", x: 20, y: 25, type: "positive"},
                    {id: "gnd", x: 60, y: 70, type: "negative"},
                    {id: "vout", x: 100, y: 25, type: "positive"}
                ]
            },
            led_red: { 
                width: 60, height: 60, voltage: 2.0, current: 20, 
                symbol: "💡", color: "#EF4444", label: "Red LED",
                connectionPoints: [
                    {id: "anode", x: 15, y: 30, type: "positive"},
                    {id: "cathode", x: 45, y: 30, type: "negative"}
                ]
            },
            led_white: { 
                width: 60, height: 60, voltage: 3.3, current: 20, 
                symbol: "💡", color: "#F3F4F6", label: "White LED",
                connectionPoints: [
                    {id: "anode", x: 15, y: 30, type: "positive"},
                    {id: "cathode", x: 45, y: 30, type: "negative"}
                ]
            },
            usb_port: { 
                width: 100, height: 60, voltage: 5.0, current: 500, 
                symbol: "USB", color: "#1F2937", label: "USB Port",
                connectionPoints: [
                    {id: "vbus", x: 20, y: 20, type: "positive"},
                    {id: "gnd", x: 20, y: 40, type: "negative"}
                ]
            }
        };

        this.wireColors = {
            positive: "#EF4444",
            negative: "#1F2937", 
            ac: "#3B82F6"
        };

        this.currentValues = {
            piezoVoltage: 0,
            rectifierVoltage: 0,
            storageVoltage: 0,
            loadCurrent: 0,
            powerGenerated: 0,
            energyStored: 0
        };

        // Initialize after DOM is fully loaded
        this.initializeUI();
        this.initializeEventListeners();
        if (this.canvas) {
            this.setupCanvas();
        }
        this.updateMeasurements();
    }

    loadAnalyticsData() {
        this.analyticsData = {
            "traffic_data": {
                "hourly_percentages": [2, 1, 1, 1, 2, 5, 12, 18, 15, 10, 8, 12, 15, 10, 8, 10, 15, 20, 18, 12, 8, 6, 4, 3],
                "peak_hours": [7, 8, 17, 18],
                "daily_patterns": {
                    "weekday_multiplier": 1.0,
                    "saturday_multiplier": 0.85,
                    "sunday_multiplier": 0.75
                }
            },
            "energy_per_step": {
                "by_weight_and_speed": {
                    "light_person_50kg": {"slow": 2.0, "normal": 2.5, "fast": 3.0},
                    "average_person_70kg": {"slow": 2.8, "normal": 3.5, "fast": 4.2},
                    "heavy_person_100kg": {"slow": 3.6, "normal": 4.5, "fast": 5.4}
                },
                "factors": {
                    "weight_coefficient": 0.03,
                    "speed_coefficient": 0.15,
                    "tile_efficiency": 0.75,
                    "material_quality_factor": 1.2
                }
            },
            "charging_times": {
                "devices": {
                    "led_light": {"capacity_mah": 500, "power_w": 1, "single_walker": 4, "moderate_traffic": 1.5, "high_traffic": 0.5},
                    "iot_sensor": {"capacity_mah": 100, "power_w": 0.05, "single_walker": 0.5, "moderate_traffic": 0.2, "high_traffic": 0.1},
                    "smartphone": {"capacity_mah": 3000, "power_w": 5, "single_walker": 20, "moderate_traffic": 8, "high_traffic": 3},
                    "tablet": {"capacity_mah": 6000, "power_w": 10, "single_walker": 40, "moderate_traffic": 16, "high_traffic": 6}
                }
            },
            "location_potential": {
                "residential_sidewalk": {"min_kwh": 0.1, "max_kwh": 0.5, "people_per_day": 50, "cost_per_kwh": 0.12},
                "office_building": {"min_kwh": 0.5, "max_kwh": 2.0, "people_per_day": 200, "cost_per_kwh": 0.10},
                "shopping_mall": {"min_kwh": 2.0, "max_kwh": 8.0, "people_per_day": 1000, "cost_per_kwh": 0.08},
                "train_station": {"min_kwh": 5.0, "max_kwh": 15.0, "people_per_day": 5000, "cost_per_kwh": 0.06}
            },
            "efficiency_breakdown": {
                "mechanical_to_electrical": 75,
                "rectification_efficiency": 90,
                "storage_efficiency": 95,
                "voltage_regulation": 85,
                "overall_system": 55
            },
            "technology_comparison": {
                "piezoelectric": {"power_density": "0.5-5 W/m²", "cost_per_watt": "$15-25", "installation": "Medium", "maintenance": "Low"},
                "solar": {"power_density": "150-200 W/m²", "cost_per_watt": "$1-3", "installation": "Easy", "maintenance": "Low"},
                "wind_micro": {"power_density": "10-50 W/m²", "cost_per_watt": "$5-10", "installation": "Hard", "maintenance": "Medium"},
                "thermal": {"power_density": "1-10 W/m²", "cost_per_watt": "$8-15", "installation": "Medium", "maintenance": "Medium"}
            }
        };
    }

    initializeUI() {
        // Theme initialization
        this.applyTheme(this.currentTheme);
        
        // Tab initialization - ensure circuit tab is active by default
        this.switchTab('circuit');
        
        // Initialize ripple effects
        this.initializeRippleEffects();
    }

    initializeAnalytics() {
        if (!this.analyticsInitialized) {
            console.log('Initializing analytics dashboard...');
            // Delay chart creation to ensure DOM is ready
            setTimeout(() => {
                this.createCharts();
                this.initializeCalculator();
                this.populateDataTable();
                this.analyticsInitialized = true;
                console.log('Analytics dashboard initialized successfully');
            }, 250);
        }
    }

    createCharts() {
        const isDark = this.currentTheme === 'dark';
        const textColor = isDark ? '#E0E0E0' : '#1F2937';
        const gridColor = isDark ? 'rgba(224, 224, 224, 0.1)' : 'rgba(31, 41, 55, 0.1)';

        Chart.defaults.color = textColor;
        Chart.defaults.borderColor = gridColor;
        Chart.defaults.backgroundColor = 'rgba(0, 188, 212, 0.1)';

        try {
            // 1. Peak Traffic Chart
            this.createTrafficChart();
            
            // 2. Energy Per Footstep Chart
            this.createFootstepChart();
            
            // 3. Device Charging Times Chart
            this.createChargingChart();
            
            // 4. Energy Generation Potential Chart
            this.createPotentialChart();
            
            // 5. Efficiency Breakdown Chart
            this.createEfficiencyChart();
            
            // 6. Technology Comparison Chart
            this.createComparisonChart();
            
            console.log('All charts created successfully');
        } catch (error) {
            console.error('Error creating charts:', error);
        }
    }

    createTrafficChart() {
        const ctx = document.getElementById('trafficChart');
        if (!ctx) {
            console.warn('Traffic chart canvas not found');
            return;
        }

        const data = this.analyticsData.traffic_data.hourly_percentages;
        const peakHours = this.analyticsData.traffic_data.peak_hours;

        this.charts.traffic = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Array.from({length: 24}, (_, i) => `${i}:00`),
                datasets: [{
                    label: 'Foot Traffic %',
                    data: data,
                    backgroundColor: data.map((_, index) => 
                        peakHours.includes(index) ? '#1FB8CD' : '#FFC185'
                    ),
                    borderColor: data.map((_, index) => 
                        peakHours.includes(index) ? '#00BCD4' : '#FF6F61'
                    ),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Peak hours highlighted in teal'
                    },
                    legend: {
                        display: true
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const hour = context.dataIndex;
                                const percentage = context.parsed.y;
                                const isPeak = peakHours.includes(hour);
                                return `${percentage}% of daily traffic${isPeak ? ' (Peak Hour)' : ''}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Traffic Percentage (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Hour of Day'
                        }
                    }
                }
            }
        });
    }

    createFootstepChart() {
        const ctx = document.getElementById('footstepChart');
        if (!ctx) {
            console.warn('Footstep chart canvas not found');
            return;
        }

        const energyData = this.analyticsData.energy_per_step.by_weight_and_speed;

        this.charts.footstep = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Light Person (50kg)', 'Average Person (70kg)', 'Heavy Person (100kg)'],
                datasets: [{
                    label: 'Slow Walking',
                    data: [energyData.light_person_50kg.slow, energyData.average_person_70kg.slow, energyData.heavy_person_100kg.slow],
                    backgroundColor: '#1FB8CD'
                }, {
                    label: 'Normal Walking',
                    data: [energyData.light_person_50kg.normal, energyData.average_person_70kg.normal, energyData.heavy_person_100kg.normal],
                    backgroundColor: '#FFC185'
                }, {
                    label: 'Fast Walking',
                    data: [energyData.light_person_50kg.fast, energyData.average_person_70kg.fast, energyData.heavy_person_100kg.fast],
                    backgroundColor: '#B4413C'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Energy output varies with person weight and walking speed'
                    },
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Energy per Step (Joules)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Person Category'
                        }
                    }
                }
            }
        });
    }

    createChargingChart() {
        const ctx = document.getElementById('chargingChart');
        if (!ctx) {
            console.warn('Charging chart canvas not found');
            return;
        }

        this.updateChargingChart();
    }

    updateChargingChart() {
        const ctx = document.getElementById('chargingChart');
        if (!ctx) return;

        const devices = this.analyticsData.charging_times.devices;
        const scenario = this.currentTrafficScenario;

        if (this.charts.charging) {
            this.charts.charging.destroy();
        }

        const deviceNames = ['LED Light', 'IoT Sensor', 'Smartphone', 'Tablet'];
        const deviceKeys = ['led_light', 'iot_sensor', 'smartphone', 'tablet'];
        const chargingTimes = deviceKeys.map(key => devices[key][scenario]);

        this.charts.charging = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: deviceNames,
                datasets: [{
                    label: 'Charging Time (hours)',
                    data: chargingTimes,
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5'],
                    borderColor: ['#00BCD4', '#FF6F61', '#8B0000', '#D3D3D3'],
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Charging times for ${scenario.replace('_', ' ')} scenario`
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        type: 'logarithmic',
                        title: {
                            display: true,
                            text: 'Hours to Full Charge (Log Scale)'
                        }
                    }
                }
            }
        });
    }

    createPotentialChart() {
        const ctx = document.getElementById('potentialChart');
        if (!ctx) {
            console.warn('Potential chart canvas not found');
            return;
        }

        const locations = this.analyticsData.location_potential;
        const locationNames = ['Residential', 'Office Building', 'Shopping Mall', 'Train Station'];
        const locationKeys = ['residential_sidewalk', 'office_building', 'shopping_mall', 'train_station'];

        const minValues = locationKeys.map(key => locations[key].min_kwh);
        const maxValues = locationKeys.map(key => locations[key].max_kwh);

        this.charts.potential = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: locationNames,
                datasets: [{
                    label: 'Minimum Energy',
                    data: minValues,
                    backgroundColor: '#5D878F'
                }, {
                    label: 'Maximum Energy',
                    data: maxValues,
                    backgroundColor: '#1FB8CD'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Daily energy generation potential by location type'
                    },
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Energy Generation (kWh/day)'
                        }
                    }
                }
            }
        });
    }

    createEfficiencyChart() {
        const ctx = document.getElementById('efficiencyChart');
        if (!ctx) {
            console.warn('Efficiency chart canvas not found');
            return;
        }

        this.charts.efficiency = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [
                    'Mechanical to Electrical (75%)',
                    'Rectification Loss (10%)',
                    'Storage Loss (5%)', 
                    'Voltage Regulation Loss (15%)',
                    'System Losses (45%)'
                ],
                datasets: [{
                    data: [75, 10, 5, 15, 45],
                    backgroundColor: [
                        '#1FB8CD',
                        '#FFC185', 
                        '#B4413C',
                        '#ECEBD5',
                        '#5D878F'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Where energy is lost in the system'
                    },
                    legend: {
                        display: true,
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    createComparisonChart() {
        const ctx = document.getElementById('comparisonChart');
        if (!ctx) {
            console.warn('Comparison chart canvas not found');
            return;
        }

        this.charts.comparison = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Power Density', 'Cost Efficiency', 'Installation Ease', 'Maintenance'],
                datasets: [{
                    label: 'Piezoelectric',
                    data: [2, 4, 6, 9],
                    backgroundColor: 'rgba(31, 184, 205, 0.2)',
                    borderColor: '#1FB8CD',
                    pointBackgroundColor: '#1FB8CD'
                }, {
                    label: 'Solar',
                    data: [10, 9, 9, 9],
                    backgroundColor: 'rgba(255, 193, 133, 0.2)',
                    borderColor: '#FFC185',
                    pointBackgroundColor: '#FFC185'
                }, {
                    label: 'Wind (Micro)',
                    data: [6, 7, 3, 6],
                    backgroundColor: 'rgba(180, 65, 60, 0.2)',
                    borderColor: '#B4413C',
                    pointBackgroundColor: '#B4413C'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Technology comparison (1-10 scale)'
                    },
                    legend: {
                        display: true
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 10,
                        ticks: {
                            stepSize: 2
                        }
                    }
                }
            }
        });
    }

    initializeCalculator() {
        const inputs = ['calcWeight', 'calcSteps', 'calcSpeed', 'calcTiles'];
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.updateCalculator());
            }
        });
        this.updateCalculator();
    }

    updateCalculator() {
        const weight = parseFloat(document.getElementById('calcWeight')?.value) || 70;
        const steps = parseInt(document.getElementById('calcSteps')?.value) || 5000;
        const speed = document.getElementById('calcSpeed')?.value || 'normal';
        const tiles = parseInt(document.getElementById('calcTiles')?.value) || 10;

        // Calculate energy per step based on weight and speed
        let baseEnergy = 3.5; // Default for 70kg normal walking
        const energyData = this.analyticsData.energy_per_step.by_weight_and_speed;
        
        if (weight <= 55) {
            baseEnergy = energyData.light_person_50kg[speed];
        } else if (weight <= 85) {
            baseEnergy = energyData.average_person_70kg[speed];
        } else {
            baseEnergy = energyData.heavy_person_100kg[speed];
        }

        const dailyEnergy = (baseEnergy * steps * tiles) / 3600000; // Convert J to kWh
        const ledsPowered = Math.floor(dailyEnergy * 1000 / 20); // 20Wh per LED per day
        const co2Savings = dailyEnergy * 0.45; // kg CO2 per kWh

        const energyPerStepEl = document.getElementById('energyPerStep');
        const dailyEnergyEl = document.getElementById('dailyEnergy');
        const devicesPoweredEl = document.getElementById('devicesPowered');
        const co2SavingsEl = document.getElementById('co2Savings');

        if (energyPerStepEl) energyPerStepEl.textContent = baseEnergy.toFixed(1) + ' J';
        if (dailyEnergyEl) dailyEnergyEl.textContent = dailyEnergy.toFixed(2) + ' kWh';
        if (devicesPoweredEl) devicesPoweredEl.textContent = ledsPowered + ' LED lights';
        if (co2SavingsEl) co2SavingsEl.textContent = co2Savings.toFixed(2) + ' kg/day';
    }

    populateDataTable() {
        const tableBody = document.getElementById('tableBody');
        if (!tableBody) return;

        const caseStudies = [
            {
                location: 'Bird Street, London',
                tiles: 12,
                energy: 2.5,
                cost: '$50,000',
                roi: 8,
                status: 'Operational'
            },
            {
                location: 'Generic University',
                tiles: 50,
                energy: 15.0,
                cost: '$200,000',
                roi: 10,
                status: 'Operational'
            },
            {
                location: 'Mall Walkway',
                tiles: 100,
                energy: 40.0,
                cost: '$350,000',
                roi: 7,
                status: 'Planning'
            },
            {
                location: 'Metro Station',
                tiles: 200,
                energy: 120.0,
                cost: '$600,000',
                roi: 6,
                status: 'Proposed'
            }
        ];

        tableBody.innerHTML = caseStudies.map(study => `
            <tr>
                <td>${study.location}</td>
                <td>${study.tiles}</td>
                <td>${study.energy}</td>
                <td>${study.cost}</td>
                <td>${study.roi}</td>
                <td><span class="status status--${this.getStatusClass(study.status)}">${study.status}</span></td>
            </tr>
        `).join('');
    }

    getStatusClass(status) {
        switch(status) {
            case 'Operational': return 'success';
            case 'Planning': return 'warning';
            case 'Proposed': return 'info';
            default: return 'info';
        }
    }

    initializeRippleEffects() {
        document.querySelectorAll('.ripple').forEach(element => {
            element.addEventListener('click', this.createRipple.bind(this));
        });
    }

    createRipple(event) {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.classList.add('ripple-effect');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    initializeEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('change', (e) => {
                this.currentTheme = e.target.checked ? 'dark' : 'light';
                this.applyTheme(this.currentTheme);
            });
        }

        // Tab navigation - Fix the critical bug
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = e.target.closest('.tab-btn').dataset.tab;
                console.log('Tab clicked:', tabName);
                this.switchTab(tabName);
            });
        });

        // Drawer toggle
        const drawerToggle = document.getElementById('drawerToggle');
        if (drawerToggle) {
            drawerToggle.addEventListener('click', () => {
                this.toggleDrawer();
            });
        }

        // Component library drag and drop - Fix drag and drop
        const componentItems = document.querySelectorAll('.component-item');
        componentItems.forEach(item => {
            item.addEventListener('mousedown', (e) => this.handleComponentMouseDown(e));
            item.addEventListener('dragstart', (e) => e.preventDefault()); // Prevent default drag
            item.addEventListener('mouseenter', (e) => this.showTooltip(e));
            item.addEventListener('mouseleave', () => this.hideTooltip());
        });

        // Canvas events
        if (this.canvas) {
            this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
            this.canvas.addEventListener('mousedown', (e) => this.handleCanvasMouseDown(e));
            this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
            this.canvas.addEventListener('mouseup', (e) => this.handleCanvasMouseUp(e));
            this.canvas.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.handleRightClick(e);
            });
        }

        // Global mouse events for drag and drop
        document.addEventListener('mousemove', (e) => this.handleGlobalMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleGlobalMouseUp(e));

        // Control buttons
        const clearCircuit = document.getElementById('clearCircuit');
        if (clearCircuit) {
            clearCircuit.addEventListener('click', () => this.clearCircuit());
        }

        const loadTemplate = document.getElementById('loadTemplate');
        if (loadTemplate) {
            loadTemplate.addEventListener('click', () => this.showTemplateModal());
        }

        const startSimulation = document.getElementById('startSimulation');
        if (startSimulation) {
            startSimulation.addEventListener('click', () => this.startSimulation());
        }

        const stopSimulation = document.getElementById('stopSimulation');
        if (stopSimulation) {
            stopSimulation.addEventListener('click', () => this.stopSimulation());
        }

        const wireToggle = document.getElementById('wireToggle');
        if (wireToggle) {
            wireToggle.addEventListener('click', () => this.toggleWireMode());
        }

        const manualStep = document.getElementById('manualStep');
        if (manualStep) {
            manualStep.addEventListener('click', () => this.manualStep());
        }

        const autoStep = document.getElementById('autoStep');
        if (autoStep) {
            autoStep.addEventListener('click', () => this.startAutoStep());
        }

        const stopAuto = document.getElementById('stopAuto');
        if (stopAuto) {
            stopAuto.addEventListener('click', () => this.stopAutoStep());
        }

        // Sliders
        const pressureSlider = document.getElementById('pressureSlider');
        if (pressureSlider) {
            pressureSlider.addEventListener('input', (e) => {
                const pressureValue = document.getElementById('pressureValue');
                if (pressureValue) {
                    pressureValue.textContent = e.target.value + 'N';
                }
            });
        }

        const frequencySlider = document.getElementById('frequencySlider');
        if (frequencySlider) {
            frequencySlider.addEventListener('input', (e) => {
                const frequencyValue = document.getElementById('frequencyValue');
                if (frequencyValue) {
                    frequencyValue.textContent = parseFloat(e.target.value).toFixed(1) + 'Hz';
                }
            });
        }

        // Analytics controls
        const trafficScenario = document.getElementById('trafficScenario');
        if (trafficScenario) {
            trafficScenario.addEventListener('change', (e) => {
                this.currentTrafficScenario = e.target.value;
                this.updateChargingChart();
            });
        }

        // Export buttons
        document.querySelectorAll('.chart-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chartType = e.target.closest('[data-chart]')?.dataset.chart;
                if (chartType) {
                    this.exportChart(chartType);
                }
            });
        });

        const exportAll = document.getElementById('exportAll');
        if (exportAll) {
            exportAll.addEventListener('click', () => this.exportAllData());
        }

        const exportTable = document.getElementById('exportTable');
        if (exportTable) {
            exportTable.addEventListener('click', () => this.exportTableData());
        }

        // Modal events
        const modalClose = document.querySelector('.modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => this.hideTemplateModal());
        }
        
        const templateModal = document.getElementById('templateModal');
        if (templateModal) {
            templateModal.addEventListener('click', (e) => {
                if (e.target.id === 'templateModal') this.hideTemplateModal();
            });
        }

        // Template selection
        document.querySelectorAll('.template-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const template = e.currentTarget.dataset.template;
                this.loadTemplate(template);
                this.hideTemplateModal();
            });
        });
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.checked = theme === 'dark';
        }
        
        // Update charts for new theme
        if (this.analyticsInitialized && Object.keys(this.charts).length > 0) {
            setTimeout(() => {
                this.updateChartsTheme(theme);
                if (this.canvas) {
                    this.redraw();
                }
            }, 100);
        }
        
        this.updateStatus(`Switched to ${theme} theme`, 'info');
    }

    updateChartsTheme(theme) {
        const isDark = theme === 'dark';
        const textColor = isDark ? '#E0E0E0' : '#1F2937';
        const gridColor = isDark ? 'rgba(224, 224, 224, 0.1)' : 'rgba(31, 41, 55, 0.1)';

        Chart.defaults.color = textColor;
        Chart.defaults.borderColor = gridColor;

        Object.values(this.charts).forEach(chart => {
            if (chart && chart.options) {
                chart.options.plugins = chart.options.plugins || {};
                chart.options.plugins.legend = chart.options.plugins.legend || {};
                chart.options.plugins.legend.labels = chart.options.plugins.legend.labels || {};
                chart.options.plugins.legend.labels.color = textColor;
                
                if (chart.options.scales) {
                    Object.values(chart.options.scales).forEach(scale => {
                        if (scale.grid) scale.grid.color = gridColor;
                        if (scale.ticks) scale.ticks.color = textColor;
                        if (scale.title) scale.title.color = textColor;
                    });
                }
                
                chart.update();
            }
        });
    }

    switchTab(tabName) {
        console.log('Switching to tab:', tabName);
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            console.log('Tab button activated:', tabName);
        }

        // Update tab content - this is the critical fix
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        const activeTab = document.getElementById(`${tabName}-tab`);
        if (activeTab) {
            activeTab.classList.add('active');
            console.log('Tab content activated:', tabName);
        } else {
            console.error('Tab content not found:', `${tabName}-tab`);
        }

        this.currentTab = tabName;
        
        // Initialize analytics if switching to analytics tab
        if (tabName === 'analytics') {
            console.log('Initializing analytics dashboard...');
            setTimeout(() => this.initializeAnalytics(), 150);
        }
        
        this.updateStatus(`Switched to ${tabName} tab`, 'info');
    }

    exportChart(chartType) {
        const chart = this.charts[chartType];
        if (!chart) return;

        const canvas = chart.canvas;
        const url = canvas.toDataURL('image/png');
        
        const link = document.createElement('a');
        link.download = `${chartType}-chart.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.updateStatus(`${chartType} chart exported as PNG`, 'success');
    }

    exportAllData() {
        const data = {
            timestamp: new Date().toISOString(),
            traffic_data: this.analyticsData.traffic_data,
            energy_data: this.analyticsData.energy_per_step,
            charging_data: this.analyticsData.charging_times,
            location_data: this.analyticsData.location_potential,
            efficiency_data: this.analyticsData.efficiency_breakdown,
            comparison_data: this.analyticsData.technology_comparison
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = 'piezoelectric-analytics-data.json';
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.updateStatus('All analytics data exported as JSON', 'success');
    }

    exportTableData() {
        const table = document.getElementById('caseStudyTable');
        if (!table) return;

        let csv = [];
        const rows = table.querySelectorAll('tr');
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('th, td');
            const rowData = Array.from(cells).map(cell => {
                let text = cell.textContent.trim();
                // Remove status indicators
                if (cell.querySelector('.status')) {
                    text = cell.querySelector('.status').textContent.trim();
                }
                return `"${text}"`;
            });
            csv.push(rowData.join(','));
        });

        const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = 'case-studies.csv';
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.updateStatus('Case study data exported as CSV', 'success');
    }

    // Circuit builder methods (implementing all existing functionality)
    toggleDrawer() {
        this.drawerOpen = !this.drawerOpen;
        const drawer = document.getElementById('componentDrawer');
        
        if (drawer) {
            if (this.drawerOpen) {
                drawer.classList.remove('collapsed');
                drawer.classList.add('open');
            } else {
                drawer.classList.add('collapsed');
                drawer.classList.remove('open');
            }
        }
        
        this.updateStatus(`Component drawer ${this.drawerOpen ? 'opened' : 'collapsed'}`, 'info');
    }

    handleComponentMouseDown(e) {
        e.preventDefault();
        const componentType = e.target.closest('.component-item')?.dataset.type;
        
        if (componentType) {
            this.draggedFromLibrary = {
                type: componentType,
                offsetX: e.offsetX || 0,
                offsetY: e.offsetY || 0
            };
            
            const componentItem = e.target.closest('.component-item');
            componentItem.classList.add('dragging');
            
            this.updateStatus(`Dragging ${componentType.replace('_', ' ')} - Drop on canvas to place`, 'info');
        }
    }

    handleGlobalMouseMove(e) {
        if (this.draggedFromLibrary) {
            document.body.style.cursor = 'grabbing';
        }
    }

    handleGlobalMouseUp(e) {
        if (this.draggedFromLibrary && this.canvas) {
            const canvasRect = this.canvas.getBoundingClientRect();
            
            if (e.clientX >= canvasRect.left && e.clientX <= canvasRect.right &&
                e.clientY >= canvasRect.top && e.clientY <= canvasRect.bottom) {
                
                const x = Math.round((e.clientX - canvasRect.left) / 20) * 20;
                const y = Math.round((e.clientY - canvasRect.top) / 20) * 20;
                
                this.addComponent(this.draggedFromLibrary.type, x, y);
            }
            
            document.querySelectorAll('.component-item').forEach(item => {
                item.classList.remove('dragging');
            });
            document.body.style.cursor = '';
            this.draggedFromLibrary = null;
        }
    }

    setupCanvas() {
        if (!this.canvas) return;
        
        this.resizeCanvas();
        this.redraw();
        
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.redraw();
        });
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth - 2;
        this.canvas.height = container.clientHeight - 2;
    }

    addComponent(type, x, y) {
        const spec = this.componentSpecs[type];
        if (!spec) return;

        const component = {
            id: 'comp_' + this.nextComponentId++,
            type: type,
            x: x,
            y: y,
            width: spec.width,
            height: spec.height,
            connectionPoints: spec.connectionPoints.map(cp => ({
                ...cp,
                absoluteX: x + cp.x,
                absoluteY: y + cp.y
            })),
            properties: { ...spec },
            voltage: 0,
            current: 0,
            active: false,
            storedEnergy: 0
        };

        this.components.push(component);
        this.redraw();
        this.updateStatus(`Added ${type.replace('_', ' ')} to circuit`, 'success');
    }

    toggleWireMode() {
        this.wireMode = !this.wireMode;
        
        const wireToggle = document.getElementById('wireToggle');
        const wireModeIndicator = document.getElementById('wireMode');
        
        if (wireToggle && wireModeIndicator) {
            if (this.wireMode) {
                wireModeIndicator.classList.remove('hidden');
                wireToggle.textContent = 'Exit Wire Mode';
                wireToggle.className = 'btn btn--primary btn--sm ripple';
                if (this.canvas) {
                    this.canvas.style.cursor = 'crosshair';
                }
                this.updateStatus('Wire mode active - Click connection points (red/black/blue circles) to create wires', 'info');
            } else {
                this.exitWireMode();
            }
            this.redraw();
        }
    }

    exitWireMode() {
        this.wireMode = false;
        this.wireStart = null;
        this.previewWire = null;
        
        const wireToggle = document.getElementById('wireToggle');
        const wireModeIndicator = document.getElementById('wireMode');
        
        if (wireToggle && wireModeIndicator) {
            wireModeIndicator.classList.add('hidden');
            wireToggle.textContent = 'Wire Mode';
            wireToggle.className = 'btn btn--secondary btn--sm ripple';
            if (this.canvas) {
                this.canvas.style.cursor = 'default';
            }
        }
        
        this.updateStatus('Wire mode disabled', 'info');
        this.redraw();
    }

    handleCanvasClick(e) {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.wireMode) {
            const connectionPoint = this.getConnectionPointAt(x, y);
            if (connectionPoint) {
                this.handleWireClick(connectionPoint);
            } else {
                if (this.wireStart) {
                    this.wireStart = null;
                    this.previewWire = null;
                    this.redraw();
                    this.updateStatus('Wire selection cleared - Click a connection point to start new wire', 'info');
                }
            }
        } else {
            const clickedComponent = this.getComponentAt(x, y);
            this.selectComponent(clickedComponent);
            
            if (this.isSimulating && clickedComponent && clickedComponent.type.startsWith('piezo_')) {
                this.activatePiezo(clickedComponent);
            }
        }
    }

    handleWireClick(connectionPoint) {
        if (!this.wireStart) {
            this.wireStart = connectionPoint;
            this.updateStatus(`Selected ${connectionPoint.type} connection point - Click another point to create wire`, 'info');
            this.redraw();
        } else if (this.wireStart !== connectionPoint && this.wireStart.component !== connectionPoint.component) {
            this.createWire(this.wireStart, connectionPoint);
            this.wireStart = null;
            this.previewWire = null;
            this.redraw();
        } else {
            this.updateStatus('Cannot connect component to itself - Select a different component', 'warning');
        }
    }

    createWire(startPoint, endPoint) {
        const existingWire = this.wires.find(wire => 
            (wire.startPoint.component === startPoint.component && wire.startPoint.id === startPoint.id &&
             wire.endPoint.component === endPoint.component && wire.endPoint.id === endPoint.id) ||
            (wire.startPoint.component === endPoint.component && wire.startPoint.id === endPoint.id &&
             wire.endPoint.component === startPoint.component && wire.endPoint.id === startPoint.id)
        );

        if (existingWire) {
            this.updateStatus('Wire already exists between these points', 'warning');
            return;
        }

        let wireType = 'positive';
        if (startPoint.type === 'ac' || endPoint.type === 'ac') {
            wireType = 'ac';
        } else if (startPoint.type === 'negative' || endPoint.type === 'negative') {
            wireType = 'negative';
        }

        const wire = {
            id: 'wire_' + this.nextWireId++,
            startPoint: { ...startPoint },
            endPoint: { ...endPoint },
            type: wireType,
            active: false,
            currentFlow: 0
        };

        this.wires.push(wire);
        this.updateStatus(`Created ${wireType} wire connection`, 'success');
    }

    getConnectionPointAt(x, y) {
        for (let component of this.components) {
            for (let point of component.connectionPoints) {
                const distance = Math.sqrt(
                    Math.pow(x - point.absoluteX, 2) + Math.pow(y - point.absoluteY, 2)
                );
                if (distance <= 12) {
                    return {
                        ...point,
                        component: component
                    };
                }
            }
        }
        return null;
    }

    getComponentAt(x, y) {
        for (let i = this.components.length - 1; i >= 0; i--) {
            const comp = this.components[i];
            if (x >= comp.x && x <= comp.x + comp.width &&
                y >= comp.y && y <= comp.y + comp.height) {
                return comp;
            }
        }
        return null;
    }

    handleCanvasMouseMove(e) {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.draggedComponent && !this.wireMode) {
            this.draggedComponent.x = Math.round((x - this.dragOffset.x) / 20) * 20;
            this.draggedComponent.y = Math.round((y - this.dragOffset.y) / 20) * 20;
            
            this.updateConnectionPoints(this.draggedComponent);
            this.redraw();
        }

        if (this.wireMode && this.wireStart) {
            this.previewWire = {
                startX: this.wireStart.absoluteX,
                startY: this.wireStart.absoluteY,
                endX: x,
                endY: y
            };
            this.redraw();
        }

        const hoveredPoint = this.getConnectionPointAt(x, y);
        if (hoveredPoint !== this.hoveredConnectionPoint) {
            this.hoveredConnectionPoint = hoveredPoint;
            if (this.wireMode || this.selectedComponent) {
                this.redraw();
            }
        }
    }

    updateConnectionPoints(component) {
        component.connectionPoints.forEach(point => {
            point.absoluteX = component.x + point.x;
            point.absoluteY = component.y + point.y;
        });
        
        this.wires.forEach(wire => {
            if (wire.startPoint.component === component) {
                wire.startPoint.absoluteX = component.x + wire.startPoint.x;
                wire.startPoint.absoluteY = component.y + wire.startPoint.y;
            }
            if (wire.endPoint.component === component) {
                wire.endPoint.absoluteX = component.x + wire.endPoint.x;
                wire.endPoint.absoluteY = component.y + wire.endPoint.y;
            }
        });
    }

    handleCanvasMouseDown(e) {
        if (this.wireMode || !this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const component = this.getComponentAt(x, y);
        if (component) {
            this.draggedComponent = component;
            this.dragOffset = {
                x: x - component.x,
                y: y - component.y
            };
            this.canvas.style.cursor = 'grabbing';
        }
    }

    handleCanvasMouseUp(e) {
        this.draggedComponent = null;
        if (this.canvas) {
            this.canvas.style.cursor = this.wireMode ? 'crosshair' : 'default';
        }
    }

    handleRightClick(e) {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const clickedWire = this.getWireAt(x, y);
        if (clickedWire) {
            this.removeWire(clickedWire);
            return;
        }

        const component = this.getComponentAt(x, y);
        if (component) {
            this.removeComponent(component);
        }
    }

    getWireAt(x, y) {
        for (let wire of this.wires) {
            const dist1 = this.distanceToLine(
                x, y,
                wire.startPoint.absoluteX, wire.startPoint.absoluteY,
                (wire.startPoint.absoluteX + wire.endPoint.absoluteX) / 2, wire.startPoint.absoluteY
            );
            const dist2 = this.distanceToLine(
                x, y,
                (wire.startPoint.absoluteX + wire.endPoint.absoluteX) / 2, wire.startPoint.absoluteY,
                (wire.startPoint.absoluteX + wire.endPoint.absoluteX) / 2, wire.endPoint.absoluteY
            );
            const dist3 = this.distanceToLine(
                x, y,
                (wire.startPoint.absoluteX + wire.endPoint.absoluteX) / 2, wire.endPoint.absoluteY,
                wire.endPoint.absoluteX, wire.endPoint.absoluteY
            );
            
            if (dist1 <= 8 || dist2 <= 8 || dist3 <= 8) {
                return wire;
            }
        }
        return null;
    }

    distanceToLine(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        
        if (lenSq === 0) return Math.sqrt(A * A + B * B);
        
        let param = dot / lenSq;
        param = Math.max(0, Math.min(1, param));
        
        const xx = x1 + param * C;
        const yy = y1 + param * D;
        
        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    removeWire(wire) {
        this.wires = this.wires.filter(w => w.id !== wire.id);
        this.redraw();
        this.updateStatus('Wire removed', 'info');
    }

    removeComponent(component) {
        this.wires = this.wires.filter(wire => 
            wire.startPoint.component !== component && wire.endPoint.component !== component
        );
        
        this.components = this.components.filter(comp => comp.id !== component.id);
        
        if (this.selectedComponent === component) {
            this.selectedComponent = null;
            this.updateComponentDetails(null);
        }
        
        this.redraw();
        this.updateStatus('Component removed', 'info');
    }

    selectComponent(component) {
        if (this.selectedComponent) {
            this.selectedComponent.selected = false;
        }
        
        this.selectedComponent = component;
        if (component) {
            component.selected = true;
        }
        
        this.updateComponentDetails(component);
        this.redraw();
    }

    activatePiezo(piezo) {
        const pressureSlider = document.getElementById('pressureSlider');
        const pressureLevel = parseInt(pressureSlider?.value || 100);
        const voltageMultiplier = pressureLevel / 100;
        
        piezo.voltage = piezo.properties.voltage_peak * voltageMultiplier;
        piezo.active = true;
        
        piezo.activatedAt = Date.now();
        
        this.simulateCircuit();
        this.redraw();
        
        this.updateStatus(`Piezo activated! Generated ${piezo.voltage.toFixed(1)}V`, 'success');
        
        setTimeout(() => {
            const decayRate = 0.92;
            const decayStep = () => {
                piezo.voltage *= decayRate;
                if (piezo.voltage < 0.1) {
                    piezo.voltage = 0;
                    piezo.active = false;
                    piezo.activatedAt = null;
                } else {
                    setTimeout(decayStep, 50);
                }
                this.simulateCircuit();
                this.redraw();
            };
            decayStep();
        }, 100);
    }

    redraw() {
        if (!this.canvas || !this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        this.drawWires();
        this.drawComponents();
        this.drawPreviewWire();
    }

    drawGrid() {
        if (!this.ctx || !this.canvas) return;
        
        const gridSize = 20;
        const isDark = this.currentTheme === 'dark';
        this.ctx.strokeStyle = isDark ? 
            'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        this.ctx.lineWidth = 1;

        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawComponents() {
        this.components.forEach(component => {
            this.drawComponent(component);
        });
    }

    drawComponent(component) {
        if (!this.ctx) return;
        
        const spec = component.properties;
        const isDark = this.currentTheme === 'dark';
        
        let bgColor = isDark ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)';
        if (component.selected) {
            bgColor = 'rgba(0, 188, 212, 0.2)';
        } else if (component.active) {
            const now = Date.now();
            const pulse = component.activatedAt ? 
                Math.sin((now - component.activatedAt) * 0.01) * 0.1 + 0.2 : 0.1;
            bgColor = `rgba(0, 188, 212, ${pulse})`;
        }
        
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(component.x, component.y, component.width, component.height);
        
        this.ctx.strokeStyle = component.selected ? '#00BCD4' : 
                               component.active ? '#00BCD4' : 
                               isDark ? '#30363D' : '#E5E7EB';
        this.ctx.lineWidth = component.selected ? 3 : component.active ? 2 : 1;
        this.ctx.strokeRect(component.x, component.y, component.width, component.height);
        
        this.ctx.fillStyle = spec.color || '#6B7280';
        this.ctx.font = 'bold 20px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const centerX = component.x + component.width / 2;
        const centerY = component.y + component.height / 2;
        
        const symbolLines = spec.symbol.split('\n');
        if (symbolLines.length > 1) {
            symbolLines.forEach((line, index) => {
                const yOffset = (index - (symbolLines.length - 1) / 2) * 20;
                this.ctx.fillText(line, centerX, centerY + yOffset - 8);
            });
        } else {
            this.ctx.fillText(spec.symbol, centerX, centerY - 8);
        }
        
        this.ctx.fillStyle = isDark ? '#E0E0E0' : '#1F2937';
        this.ctx.font = '12px Inter, sans-serif';
        this.ctx.fillText(spec.label, centerX, centerY + 18);
        
        if (component.type.startsWith('led_') && component.active) {
            this.ctx.save();
            this.ctx.shadowColor = spec.color;
            this.ctx.shadowBlur = 25;
            this.ctx.globalAlpha = 0.8;
            this.ctx.fillStyle = spec.color;
            this.ctx.fillRect(component.x + 4, component.y + 4, component.width - 8, component.height - 8);
            this.ctx.restore();
        }
        
        if (this.wireMode || component.selected) {
            this.drawConnectionPoints(component);
        }
        
        if (this.isSimulating && component.voltage > 0.1) {
            this.ctx.fillStyle = '#00BCD4';
            this.ctx.font = 'bold 14px Inter, sans-serif';
            this.ctx.fillText(`${component.voltage.toFixed(1)}V`, centerX, component.y - 8);
        }
    }

    drawConnectionPoints(component) {
        if (!this.ctx) return;
        
        component.connectionPoints.forEach(point => {
            const radius = 7;
            const isHovered = this.hoveredConnectionPoint && 
                             this.hoveredConnectionPoint.absoluteX === point.absoluteX && 
                             this.hoveredConnectionPoint.absoluteY === point.absoluteY;
            const isSelected = this.wireStart && this.wireStart.absoluteX === point.absoluteX && 
                              this.wireStart.absoluteY === point.absoluteY;
            
            let color;
            switch(point.type) {
                case 'positive': color = '#EF4444'; break;
                case 'negative': color = '#1F2937'; break;
                case 'ac': color = '#3B82F6'; break;
                default: color = '#00BCD4';
            }
            
            this.ctx.fillStyle = isSelected ? '#10B981' : color;
            this.ctx.beginPath();
            this.ctx.arc(point.absoluteX, point.absoluteY, isHovered ? 9 : radius, 0, 2 * Math.PI);
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = isSelected ? 3 : 2;
            this.ctx.stroke();
            
            if (isHovered || isSelected) {
                this.ctx.save();
                this.ctx.shadowColor = color;
                this.ctx.shadowBlur = 15;
                this.ctx.globalAlpha = 0.6;
                this.ctx.beginPath();
                this.ctx.arc(point.absoluteX, point.absoluteY, radius + 3, 0, 2 * Math.PI);
                this.ctx.stroke();
                this.ctx.restore();
            }
        });
    }

    drawWires() {
        this.wires.forEach(wire => {
            this.drawWire(wire);
        });
    }

    drawWire(wire) {
        if (!this.ctx) return;
        
        const color = this.wireColors[wire.type] || '#6B7280';
        const isActive = wire.active && this.isSimulating;
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = isActive ? 5 : 3;
        
        if (isActive) {
            this.ctx.setLineDash([8, 8]);
        } else {
            this.ctx.setLineDash([]);
        }
        
        this.ctx.beginPath();
        
        const startX = wire.startPoint.absoluteX;
        const startY = wire.startPoint.absoluteY;
        const endX = wire.endPoint.absoluteX;
        const endY = wire.endPoint.absoluteY;
        
        const midX = (startX + endX) / 2;
        
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(midX, startY);
        this.ctx.lineTo(midX, endY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        
        if (isActive) {
            this.drawCurrentFlow(wire);
        }
        
        this.ctx.setLineDash([]);
    }

    drawCurrentFlow(wire) {
        if (!this.ctx) return;
        
        const time = Date.now() * 0.005;
        const progress = (Math.sin(time) + 1) / 2;
        
        const startX = wire.startPoint.absoluteX;
        const startY = wire.startPoint.absoluteY;
        const endX = wire.endPoint.absoluteX;
        const endY = wire.endPoint.absoluteY;
        const midX = (startX + endX) / 2;
        
        let currentX, currentY;
        if (progress < 0.33) {
            const t = progress / 0.33;
            currentX = startX + (midX - startX) * t;
            currentY = startY;
        } else if (progress < 0.66) {
            const t = (progress - 0.33) / 0.33;
            currentX = midX;
            currentY = startY + (endY - startY) * t;
        } else {
            const t = (progress - 0.66) / 0.34;
            currentX = midX + (endX - midX) * t;
            currentY = endY;
        }
        
        this.ctx.save();
        this.ctx.fillStyle = '#FF6F61';
        this.ctx.shadowColor = '#FF6F61';
        this.ctx.shadowBlur = 12;
        this.ctx.globalAlpha = 0.9;
        this.ctx.beginPath();
        this.ctx.arc(currentX, currentY, 5, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.restore();
    }

    drawPreviewWire() {
        if (!this.ctx || !this.previewWire) return;
        
        this.ctx.strokeStyle = '#00BCD4';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([6, 6]);
        this.ctx.globalAlpha = 0.8;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.previewWire.startX, this.previewWire.startY);
        this.ctx.lineTo(this.previewWire.endX, this.previewWire.endY);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
        this.ctx.globalAlpha = 1;
    }

    simulateCircuit() {
        this.currentValues = {
            piezoVoltage: 0,
            rectifierVoltage: 0,
            storageVoltage: 0,
            loadCurrent: 0,
            powerGenerated: 0,
            energyStored: 0
        };

        this.wires.forEach(wire => wire.active = false);

        const activePiezos = this.components.filter(comp => 
            comp.type.startsWith('piezo_') && comp.voltage > 0
        );

        if (activePiezos.length === 0) {
            this.updateMeasurements();
            return;
        }

        let totalPiezoVoltage = 0;
        activePiezos.forEach(piezo => {
            totalPiezoVoltage += piezo.voltage;
            this.activateConnectedWires(piezo);
        });
        this.currentValues.piezoVoltage = totalPiezoVoltage;

        this.processRectifiers(totalPiezoVoltage);
        this.processEnergyStorage();
        this.processRegulators();
        this.processLoads();
        
        this.updateMeasurements();
    }

    activateConnectedWires(component) {
        this.wires.forEach(wire => {
            if (wire.startPoint.component === component || wire.endPoint.component === component) {
                wire.active = true;
            }
        });
    }

    processRectifiers(inputVoltage) {
        const rectifiers = this.components.filter(comp => comp.type === 'bridge_rectifier');
        if (rectifiers.length > 0) {
            const rectifier = rectifiers[0];
            rectifier.voltage = Math.max(0, inputVoltage - rectifier.properties.voltage_drop);
            rectifier.active = rectifier.voltage > 0;
            this.currentValues.rectifierVoltage = rectifier.voltage;
            
            if (rectifier.active) {
                this.activateConnectedWires(rectifier);
            }
        }
    }

    processEnergyStorage() {
        const capacitors = this.components.filter(comp => comp.type.startsWith('capacitor_'));
        const rectifiers = this.components.filter(comp => comp.type === 'bridge_rectifier');
        
        if (capacitors.length > 0) {
            const capacitor = capacitors[0];
            const inputVoltage = rectifiers.length > 0 ? rectifiers[0].voltage : this.currentValues.piezoVoltage;
            
            if (inputVoltage > capacitor.voltage) {
                const chargingRate = 0.08;
                capacitor.voltage += (inputVoltage - capacitor.voltage) * chargingRate;
                capacitor.active = true;
                this.activateConnectedWires(capacitor);
            }
            
            capacitor.storedEnergy = 0.5 * capacitor.properties.capacitance * Math.pow(capacitor.voltage, 2);
            this.currentValues.energyStored = capacitor.storedEnergy * 1000000;
            this.currentValues.storageVoltage = capacitor.voltage;
        }
    }

    processRegulators() {
        const regulators = this.components.filter(comp => 
            comp.type.startsWith('lm') || comp.type.startsWith('ltc')
        );
        const capacitors = this.components.filter(comp => comp.type.startsWith('capacitor_'));
        
        if (regulators.length > 0 && capacitors.length > 0) {
            const regulator = regulators[0];
            const inputVoltage = capacitors[0].voltage;
            
            if (inputVoltage >= regulator.properties.input_min) {
                regulator.voltage = regulator.properties.output;
                regulator.active = true;
                this.activateConnectedWires(regulator);
            } else {
                regulator.voltage = 0;
                regulator.active = false;
            }
        }
    }

    processLoads() {
        const loads = this.components.filter(comp => 
            comp.type.startsWith('led_') || comp.type.startsWith('usb_')
        );
        const regulators = this.components.filter(comp => 
            comp.type.startsWith('lm') || comp.type.startsWith('ltc')
        );
        const capacitors = this.components.filter(comp => comp.type.startsWith('capacitor_'));
        
        if (loads.length > 0) {
            const load = loads[0];
            let supplyVoltage = 0;
            
            if (regulators.length > 0 && regulators[0].active) {
                supplyVoltage = regulators[0].voltage;
            } else if (capacitors.length > 0) {
                supplyVoltage = capacitors[0].voltage;
            }
            
            if (supplyVoltage >= load.properties.voltage) {
                load.current = load.properties.current;
                load.active = true;
                load.activatedAt = Date.now();
                this.activateConnectedWires(load);
                this.currentValues.loadCurrent = load.current;
                this.currentValues.powerGenerated = supplyVoltage * (load.current / 1000);
                
                if (capacitors.length > 0) {
                    const dischargeCurrent = load.current / 1000;
                    const dischargeRate = dischargeCurrent / (capacitors[0].properties.capacitance * 1000);
                    capacitors[0].voltage = Math.max(0, capacitors[0].voltage - dischargeRate * 0.01);
                }
            } else {
                load.current = 0;
                load.active = false;
                load.activatedAt = null;
            }
        }
    }

    startSimulation() {
        this.isSimulating = true;
        const startBtn = document.getElementById('startSimulation');
        const stopBtn = document.getElementById('stopSimulation');
        
        if (startBtn) startBtn.classList.add('hidden');
        if (stopBtn) stopBtn.classList.remove('hidden');
        
        this.updateStatus('Simulation started! Click piezo components to generate energy', 'success');
        this.animationLoop();
    }

    stopSimulation() {
        this.isSimulating = false;
        const startBtn = document.getElementById('startSimulation');
        const stopBtn = document.getElementById('stopSimulation');
        
        if (startBtn) startBtn.classList.remove('hidden');
        if (stopBtn) stopBtn.classList.add('hidden');
        
        this.components.forEach(comp => {
            comp.active = false;
            comp.voltage = 0;
            comp.current = 0;
            comp.activatedAt = null;
        });
        
        this.wires.forEach(wire => wire.active = false);
        
        this.currentValues = {
            piezoVoltage: 0,
            rectifierVoltage: 0,
            storageVoltage: 0,
            loadCurrent: 0,
            powerGenerated: 0,
            energyStored: 0
        };
        
        this.updateMeasurements();
        this.redraw();
        this.updateStatus('Simulation stopped', 'info');
    }

    animationLoop() {
        if (!this.isSimulating) return;
        
        this.redraw();
        requestAnimationFrame(() => this.animationLoop());
    }

    manualStep() {
        if (!this.isSimulating) {
            this.updateStatus('Start simulation first to generate energy', 'warning');
            return;
        }
        
        const piezos = this.components.filter(comp => comp.type.startsWith('piezo_'));
        if (piezos.length === 0) {
            this.updateStatus('Add piezo components to generate energy', 'warning');
            return;
        }
        
        piezos.forEach(piezo => this.activatePiezo(piezo));
    }

    startAutoStep() {
        if (!this.isSimulating) {
            this.updateStatus('Start simulation first', 'warning');
            return;
        }
        
        const frequencySlider = document.getElementById('frequencySlider');
        const frequency = parseFloat(frequencySlider?.value || 1);
        const interval = 1000 / frequency;
        
        const autoBtn = document.getElementById('autoStep');
        const stopBtn = document.getElementById('stopAuto');
        
        if (autoBtn) autoBtn.classList.add('hidden');
        if (stopBtn) stopBtn.classList.remove('hidden');
        
        this.autoStepInterval = setInterval(() => {
            this.manualStep();
        }, interval);
        
        this.updateStatus(`Auto-stepping at ${frequency}Hz`, 'info');
    }

    stopAutoStep() {
        if (this.autoStepInterval) {
            clearInterval(this.autoStepInterval);
            this.autoStepInterval = null;
        }
        
        const autoBtn = document.getElementById('autoStep');
        const stopBtn = document.getElementById('stopAuto');
        
        if (autoBtn) autoBtn.classList.remove('hidden');
        if (stopBtn) stopBtn.classList.add('hidden');
        
        this.updateStatus('Auto-stepping stopped', 'info');
    }

    updateMeasurements() {
        const elements = {
            piezoVoltage: this.currentValues.piezoVoltage.toFixed(1) + 'V',
            rectifierVoltage: this.currentValues.rectifierVoltage.toFixed(1) + 'V',
            storageVoltage: this.currentValues.storageVoltage.toFixed(1) + 'V',
            loadCurrent: this.currentValues.loadCurrent.toFixed(1) + 'mA',
            powerGenerated: this.currentValues.powerGenerated.toFixed(1) + 'mW',
            energyStored: this.currentValues.energyStored.toFixed(1) + 'mJ'
        };

        Object.keys(elements).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = elements[id];
            }
        });
    }

    updateComponentDetails(component) {
        const detailsEl = document.getElementById('componentDetails');
        if (!detailsEl) return;
        
        if (!component) {
            detailsEl.innerHTML = '<p>Click a component to view details</p>';
            return;
        }
        
        const spec = component.properties;
        let html = `<h5>${component.type.replace('_', ' ').toUpperCase()}</h5>`;
        html += `<p><strong>Size:</strong> ${component.width}x${component.height}px</p>`;
        
        switch (component.type.split('_')[0]) {
            case 'piezo':
                html += `<p><strong>Peak Voltage:</strong> ${spec.voltage_peak}V</p>`;
                html += `<p><strong>Peak Current:</strong> ${spec.current_peak}mA</p>`;
                html += `<p><strong>Current Voltage:</strong> ${component.voltage.toFixed(1)}V</p>`;
                html += `<p><strong>Status:</strong> ${component.active ? '⚡ Active' : '⚪ Inactive'}</p>`;
                break;
            case 'capacitor':
                const capacitanceValue = spec.capacitance >= 0.001 ? 
                    (spec.capacitance * 1000).toFixed(0) + 'mF' : 
                    (spec.capacitance * 1000000).toFixed(0) + 'μF';
                html += `<p><strong>Capacitance:</strong> ${capacitanceValue}</p>`;
                html += `<p><strong>Voltage Rating:</strong> ${spec.voltage_rating}V</p>`;
                html += `<p><strong>Current Voltage:</strong> ${component.voltage.toFixed(1)}V</p>`;
                html += `<p><strong>Stored Energy:</strong> ${(component.storedEnergy * 1000000).toFixed(1)}mJ</p>`;
                break;
            case 'led':
                html += `<p><strong>Forward Voltage:</strong> ${spec.voltage}V</p>`;
                html += `<p><strong>Current:</strong> ${spec.current}mA</p>`;
                html += `<p><strong>Status:</strong> ${component.active ? '💡 ON' : '⚪ OFF'}</p>`;
                break;
            default:
                html += `<p><strong>Type:</strong> ${component.type.replace('_', ' ')}</p>`;
                html += `<p><em>Right-click to remove component</em></p>`;
        }
        
        detailsEl.innerHTML = html;
    }

    updateStatus(message, type) {
        const messagesEl = document.getElementById('circuitMessages');
        if (!messagesEl) return;
        
        const messageEl = document.createElement('div');
        messageEl.className = `status-message status--${type}`;
        messageEl.textContent = message;
        
        messagesEl.innerHTML = '';
        messagesEl.appendChild(messageEl);
        
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 5000);
    }

    clearCircuit() {
        this.components = [];
        this.wires = [];
        this.selectedComponent = null;
        this.exitWireMode();
        this.stopSimulation();
        this.redraw();
        this.updateStatus('Circuit cleared', 'info');
        this.updateComponentDetails(null);
    }

    showTemplateModal() {
        const modal = document.getElementById('templateModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.updateStatus('Select a template to load', 'info');
        }
    }

    hideTemplateModal() {
        const modal = document.getElementById('templateModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    loadTemplate(templateName) {
        const templates = {
            basic_harvester: {
                components: [
                    { type: "piezo_single", x: 80, y: 100 },
                    { type: "bridge_rectifier", x: 260, y: 100 },
                    { type: "capacitor_1mf", x: 440, y: 110 },
                    { type: "led_red", x: 600, y: 110 }
                ],
                wires: [
                    { from: 0, fromPoint: "ac1", to: 1, toPoint: "ac1" },
                    { from: 0, fromPoint: "ac2", to: 1, toPoint: "ac2" },
                    { from: 1, fromPoint: "dc_pos", to: 2, toPoint: "positive" },
                    { from: 1, fromPoint: "dc_neg", to: 2, toPoint: "negative" },
                    { from: 2, fromPoint: "positive", to: 3, toPoint: "anode" },
                    { from: 2, fromPoint: "negative", to: 3, toPoint: "cathode" }
                ]
            },
            regulated_system: {
                components: [
                    { type: "piezo_series", x: 60, y: 80 },
                    { type: "bridge_rectifier", x: 280, y: 80 },
                    { type: "capacitor_10mf", x: 460, y: 90 },
                    { type: "ltc3588", x: 640, y: 80 },
                    { type: "usb_port", x: 820, y: 90 }
                ],
                wires: [
                    { from: 0, fromPoint: "ac1", to: 1, toPoint: "ac1" },
                    { from: 0, fromPoint: "ac2", to: 1, toPoint: "ac2" },
                    { from: 1, fromPoint: "dc_pos", to: 2, toPoint: "positive" },
                    { from: 1, fromPoint: "dc_neg", to: 2, toPoint: "negative" },
                    { from: 2, fromPoint: "positive", to: 3, toPoint: "vin" },
                    { from: 2, fromPoint: "negative", to: 3, toPoint: "gnd" },
                    { from: 3, fromPoint: "vout", to: 4, toPoint: "vbus" },
                    { from: 3, fromPoint: "gnd", to: 4, toPoint: "gnd" }
                ]
            }
        };
        
        const template = templates[templateName];
        if (!template) return;
        
        this.clearCircuit();
        
        template.components.forEach(compData => {
            this.addComponent(compData.type, compData.x, compData.y);
        });
        
        setTimeout(() => {
            template.wires.forEach(wireData => {
                const fromComp = this.components[wireData.from];
                const toComp = this.components[wireData.to];
                
                if (fromComp && toComp) {
                    const fromPoint = fromComp.connectionPoints.find(p => p.id === wireData.fromPoint);
                    const toPoint = toComp.connectionPoints.find(p => p.id === wireData.toPoint);
                    
                    if (fromPoint && toPoint) {
                        this.createWire(
                            { ...fromPoint, component: fromComp },
                            { ...toPoint, component: toComp }
                        );
                    }
                }
            });
            this.redraw();
        }, 100);
        
        this.updateStatus(`Template loaded: ${templateName.replace('_', ' ')}`, 'success');
    }

    showTooltip(e) {
        const tooltip = document.getElementById('tooltip');
        const tooltipText = e.target.closest('.component-item')?.dataset.tooltip;
        
        if (tooltip && tooltipText) {
            tooltip.textContent = tooltipText;
            tooltip.classList.remove('hidden');
            
            const rect = e.target.getBoundingClientRect();
            tooltip.style.left = Math.min(rect.right + 12, window.innerWidth - 250) + 'px';
            tooltip.style.top = rect.top + 'px';
        }
    }

    hideTooltip() {
        const tooltip = document.getElementById('tooltip');
        if (tooltip) {
            tooltip.classList.add('hidden');
        }
    }
}

// Initialize the enhanced application
document.addEventListener('DOMContentLoaded', () => {
    window.circuitBuilder = new EnhancedCircuitBuilder();
    console.log('Enhanced Piezoelectric Circuit Builder with Analytics Dashboard initialized');
});