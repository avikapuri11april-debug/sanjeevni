const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ════════════════════════════════════════════════════════════
// Graph Data (from Dehradun roads)
// ════════════════════════════════════════════════════════════

const GRAPH_NODES = {
    "ISBT": { x: 0.10, y: 0.22, label: "ISBT Dehradun" },
    "Parade Ground": { x: 0.28, y: 0.30, label: "Parade Ground" },
    "Clock Tower": { x: 0.36, y: 0.42, label: "Clock Tower" },
    "Paltan Bazaar": { x: 0.44, y: 0.36, label: "Paltan Bazaar" },
    "Rajpur Road": { x: 0.54, y: 0.20, label: "Rajpur Road" },
    "EC Road": { x: 0.62, y: 0.33, label: "EC Road" },
    "Patel Nagar": { x: 0.24, y: 0.54, label: "Patel Nagar" },
    "Dalanwala": { x: 0.42, y: 0.52, label: "Dalanwala" },
    "Ballupur": { x: 0.50, y: 0.62, label: "Ballupur Chowk" },
    "Sahastradhara": { x: 0.70, y: 0.26, label: "Sahastradhara Rd" },
    "GMS Road": { x: 0.18, y: 0.70, label: "GMS Road" },
    "Doiwala": { x: 0.08, y: 0.76, label: "Doiwala" },
    "Nehru Colony": { x: 0.54, y: 0.70, label: "Nehru Colony" },
    "Kanwali": { x: 0.66, y: 0.62, label: "Kanwali Road" },
    "Dharampur": { x: 0.76, y: 0.48, label: "Dharampur" },
    "Rispana": { x: 0.32, y: 0.74, label: "Rispana Bridge" },
    "Haridwar Bypass": { x: 0.06, y: 0.50, label: "Haridwar Bypass" },
    "Raipur Road": { x: 0.74, y: 0.74, label: "Raipur Road" },
    "Prem Nagar": { x: 0.14, y: 0.62, label: "Prem Nagar" },
    "Nanda Ki Chowki": { x: 0.20, y: 0.68, label: "Nanda Ki Chowki" },
    "ONGC Chowk": { x: 0.58, y: 0.65, label: "ONGC Chowk" }
};

const HOSPITALS = {
    "Doon Hospital": {
        x: 0.36, y: 0.44, label: "Doon Hospital (Govt)",
        minSeverity: 1, specialty: "General / Emergency",
        type: "General", cost: "Low", acceptsInsurance: true,
        info: "Government hospital, 24x7 emergency, all general cases"
    },
    "Shri Mahant Indiresh": {
        x: 0.22, y: 0.62, label: "Shri Mahant Indiresh Hospital",
        minSeverity: 2, specialty: "Surgery / Emergency",
        type: "General", cost: "Medium", acceptsInsurance: true,
        info: "Multi-specialty, surgery, burns, general emergencies"
    },
    "Synergy Hospital": {
        x: 0.68, y: 0.56, label: "Synergy Hospital",
        minSeverity: 1, specialty: "General / Orthopedic",
        type: "General", cost: "Medium", acceptsInsurance: true,
        info: "Orthopedic, fractures, general cases"
    },
    "Max Hospital": {
        x: 0.58, y: 0.50, label: "Max Super Speciality",
        minSeverity: 3, specialty: "ICU / Cardiac / Neuro",
        type: "Cardiac", cost: "High", acceptsInsurance: true,
        info: "Full ICU, cardiac care, neuro, multi-organ support"
    },
    "Himalayan Hospital": {
        x: 0.84, y: 0.34, label: "Himalayan Institute",
        minSeverity: 4, specialty: "Trauma / Burns / ICU",
        type: "Trauma", cost: "High", acceptsInsurance: true,
        info: "Level-1 trauma center, burns unit, critical ICU"
    },
    "Pacific Hospital": {
        x: 0.46, y: 0.80, label: "Pacific Hospital",
        minSeverity: 1, specialty: "General / Maternity",
        type: "General", cost: "Low", acceptsInsurance: false,
        info: "Maternity, general medicine, low-cost care"
    },
    "Graphic Era Hospital": {
        x: 0.16, y: 0.72, label: "Graphic Era Hospital",
        minSeverity: 1, specialty: "General / Maternity / Orthopedic",
        type: "General", cost: "Medium", acceptsInsurance: true,
        info: "Multi-specialty hospital, maternity, orthopedic cases"
    }
};

const EDGES = [
    ["ISBT", "Parade Ground", 2.1],
    ["ISBT", "Haridwar Bypass", 2.6],
    ["ISBT", "Patel Nagar", 3.2],
    ["Parade Ground", "Clock Tower", 1.8],
    ["Parade Ground", "Rajpur Road", 2.3],
    ["Clock Tower", "Paltan Bazaar", 0.9],
    ["Clock Tower", "Dalanwala", 1.3],
    ["Clock Tower", "Doon Hospital", 1.0],
    ["Paltan Bazaar", "EC Road", 2.4],
    ["Paltan Bazaar", "Dalanwala", 1.1],
    ["Rajpur Road", "EC Road", 1.6],
    ["EC Road", "Sahastradhara", 2.2],
    ["EC Road", "Dharampur", 2.7],
    ["EC Road", "Kanwali", 1.8],
    ["Sahastradhara", "Himalayan Hospital", 3.1],
    ["Sahastradhara", "Max Hospital", 4.5],
    ["Dharampur", "Himalayan Hospital", 2.4],
    ["Dharampur", "Raipur Road", 1.6],
    ["Dharampur", "Kanwali", 2.1],
    ["Dalanwala", "Ballupur", 1.7],
    ["Dalanwala", "Patel Nagar", 1.9],
    ["Patel Nagar", "GMS Road", 2.0],
    ["Patel Nagar", "Shri Mahant Indiresh", 1.5],
    ["Patel Nagar", "Nanda Ki Chowki", 1.2],
    ["GMS Road", "Doiwala", 3.5],
    ["GMS Road", "Rispana", 2.1],
    ["GMS Road", "Prem Nagar", 1.5],
    ["Haridwar Bypass", "Doiwala", 2.8],
    ["Haridwar Bypass", "Prem Nagar", 2.8],
    ["Ballupur", "Nehru Colony", 1.2],
    ["Ballupur", "Rispana", 2.3],
    ["Ballupur", "ONGC Chowk", 0.8],
    ["Nehru Colony", "Kanwali", 1.5],
    ["Nehru Colony", "Raipur Road", 1.4],
    ["Kanwali", "Dharampur", 2.1],
    ["Kanwali", "Raipur Road", 1.3],
    ["Kanwali", "Synergy Hospital", 0.8],
    ["Kanwali", "ONGC Chowk", 1.2],
    ["Rispana", "Doiwala", 1.6],
    ["Rispana", "Nanda Ki Chowki", 0.9],
    ["Rispana", "Prem Nagar", 1.3],
    ["Nanda Ki Chowki", "Prem Nagar", 0.6],
    ["Nanda Ki Chowki", "Graphic Era Hospital", 0.8],
    ["Prem Nagar", "Graphic Era Hospital", 1.2],
    ["Synergy Hospital", "ONGC Chowk", 0.8],
    ["ONGC Chowk", "Ballupur", 0.8],
    ["Max Hospital", "Sahastradhara", 1.2],
    ["Himalayan Hospital", "Dharampur", 0.9]
];

const ALL_NODES = Object.assign({}, GRAPH_NODES, HOSPITALS);

// ════════════════════════════════════════════════════════════
// Dijkstra's Algorithm Implementation
// ════════════════════════════════════════════════════════════

function buildAdjacencyList(nodes, edges) {
    const adj = {};
    for (let node in nodes) {
        adj[node] = [];
    }
    
    edges.forEach(([from, to, distance]) => {
        if (adj[from]) adj[from].push({ node: to, dist: distance });
        if (adj[to]) adj[to].push({ node: from, dist: distance });
    });
    
    return adj;
}

function dijkstra(startNode) {
    const adj = buildAdjacencyList(ALL_NODES, EDGES);
    const dist = {};
    const parent = {};
    const visited = new Set();
    
    for (let node in ALL_NODES) {
        dist[node] = Infinity;
        parent[node] = null;
    }
    dist[startNode] = 0;
    
    for (let i = 0; i < Object.keys(ALL_NODES).length; i++) {
        let minNode = null;
        let minDist = Infinity;
        
        for (let node in dist) {
            if (!visited.has(node) && dist[node] < minDist) {
                minDist = dist[node];
                minNode = node;
            }
        }
        
        if (minNode === null) break;
        visited.add(minNode);
        
        (adj[minNode] || []).forEach(({ node: neighbor, dist: edgeDist }) => {
            if (!visited.has(neighbor)) {
                const newDist = dist[minNode] + edgeDist;
                if (newDist < dist[neighbor]) {
                    dist[neighbor] = newDist;
                    parent[neighbor] = minNode;
                }
            }
        });
    }
    
    return { dist, parent };
}

// Reconstruct the shortest path from start to end node
function getShortestPath(startNode, endNode, parent) {
    const path = [];
    let current = endNode;
    
    while (current !== null) {
        path.unshift(current);
        current = parent[current];
    }
    
    // If path doesn't start with startNode, return empty path (no connection)
    if (path[0] !== startNode) {
        return [];
    }
    
    return path;
}

// ════════════════════════════════════════════════════════════
// Hospital Finding Logic
// ════════════════════════════════════════════════════════════

function getHospitalType(condition) {
    const cond = condition.toLowerCase();
    const mapping = {
        'heart': 'cardiac',
        'accident': 'trauma',
        'cancer': 'oncology',
        'pregnancy': 'maternity',
        'brain': 'neuro',
        'surgery': 'surgery'
    };
    return mapping[cond] || 'general';
}

function findNearestHospital(severity, category, insured, condition, patientDistances) {
    const hospitalType = getHospitalType(condition);
    let bestHospital = null;
    let minDistance = Infinity;
    
    for (let hospitalName in HOSPITALS) {
        const hospital = HOSPITALS[hospitalName];
        
        // Check severity match
        if (hospital.minSeverity > severity) continue;
        
        // Check insurance - if patient doesn't have insurance, only show affordable hospitals
        if (!insured && hospital.cost === 'High') continue;
        if (!insured && !hospital.acceptsInsurance && hospital.cost !== 'Low') continue;
        
        // Check category preference
        if (category === 'government' && hospital.cost !== 'Low') continue;
        if (category === 'private' && hospital.cost === 'Low') continue;
        
        // Get distance
        const distance = patientDistances[hospitalName] || Infinity;
        
        if (distance < minDistance) {
            minDistance = distance;
            bestHospital = {
                name: hospitalName,
                ...hospital,
                distance: minDistance
            };
        }
    }
    
    return bestHospital;
}

// ════════════════════════════════════════════════════════════
// API Routes
// ════════════════════════════════════════════════════════════

// Get all nodes (locations and hospitals)
app.get('/api/nodes', (req, res) => {
    res.json(ALL_NODES);
});

// Get all hospitals
app.get('/api/hospitals', (req, res) => {
    res.json(HOSPITALS);
});

// Get graph edges
app.get('/api/edges', (req, res) => {
    res.json(EDGES);
});

// Calculate distances from a location using Dijkstra
app.get('/api/distances/:location', (req, res) => {
    const location = req.params.location;
    
    if (!ALL_NODES[location]) {
        return res.status(400).json({ error: 'Location not found' });
    }
    
    const result = dijkstra(location);
    res.json({ location, distances: result.dist, parent: result.parent });
});

// Get shortest path between two nodes
app.get('/api/path/:from/:to', (req, res) => {
    const from = req.params.from;
    const to = req.params.to;
    
    if (!ALL_NODES[from] || !ALL_NODES[to]) {
        return res.status(400).json({ error: 'Invalid location' });
    }
    
    const result = dijkstra(from);
    const path = getShortestPath(from, to, result.parent);
    const distance = result.dist[to];
    
    if (path.length === 0 || distance === Infinity) {
        return res.json({ 
            from, to, 
            path: [], 
            distance: Infinity, 
            error: 'No path found' 
        });
    }
    
    res.json({ from, to, path, distance });
});

// Find nearest hospital for emergency
app.post('/api/emergency/find-hospital', (req, res) => {
    const { patientLocation, severity, category, insured, condition } = req.body;
    
    // Validate input
    if (!patientLocation || !severity || !condition) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Calculate distances from patient location using Dijkstra
    const result = dijkstra(patientLocation);
    const distances = result.dist;
    const parent = result.parent;
    
    // Find best hospital
    const hospital = findNearestHospital(severity, category || 'any', insured, condition, distances);
    
    if (!hospital) {
        return res.json({ 
            success: false, 
            message: 'No suitable hospital found',
            hospital: null,
            path: [],
            distanceToHospital: Infinity
        });
    }
    
    // Get the complete path from patient location to hospital
    const path = getShortestPath(patientLocation, hospital.name, parent);
    const distanceToHospital = distances[hospital.name];
    
    res.json({
        success: true,
        hospital,
        distanceToHospital,
        path,
        patientLocation
    });
});

// Get emergency response summary
app.post('/api/emergency/summary', (req, res) => {
    const { patientLocation, severity, category, insured, condition } = req.body;
    
    const result = dijkstra(patientLocation);
    const distances = result.dist;
    const parent = result.parent;
    
    const hospital = findNearestHospital(severity, category || 'any', insured, condition, distances);
    
    // Get path to hospital if found
    let path = [];
    if (hospital) {
        path = getShortestPath(patientLocation, hospital.name, parent);
    }
    
    const response = {
        patient: {
            location: patientLocation,
            severity,
            condition,
            category: category || 'any',
            insured
        },
        hospital: hospital || null,
        path: path,
        distances,
        timestamp: new Date().toISOString()
    };
    
    res.json(response);
});

// ════════════════════════════════════════════════════════════
// Emergency Services API Endpoints
// ════════════════════════════════════════════════════════════

// Ambulance Dispatch Request
app.post('/api/services/ambulance-dispatch', (req, res) => {
    const { patientLocation, severity, patientName, phoneNumber, condition } = req.body;
    
    if (!patientLocation || !severity || !patientName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Find nearest ambulance station
    const result = dijkstra(patientLocation);
    const dispatch = {
        requestId: `AMB-${Date.now()}`,
        status: 'DISPATCHED',
        ambulanceId: `AMB-${Math.floor(Math.random() * 999) + 100}`,
        ambulanceType: severity >= 4 ? 'Advanced Life Support' : 'Basic Life Support',
        driverName: ['Amit Kumar', 'Priya Singh', 'Rajesh Patel', 'Neha Sharma'][Math.floor(Math.random() * 4)],
        paramedic: ['Dr. Vivek', 'Nurse Sarah', 'Tech Arjun', 'Medic Deepak'][Math.floor(Math.random() * 4)],
        patientName,
        patientLocation,
        severity,
        condition,
        phoneNumber,
        estimatedArrivalTime: `${Math.floor(Math.random() * 10) + 5} minutes`,
        status: 'En Route',
        timestamp: new Date().toISOString(),
        gpsTracking: true,
        equipment: ['Defibrillator', 'Oxygen', 'Stretcher', 'Monitor', 'IV Stand'],
        equipmentAvailable: severity >= 3
    };
    
    res.json({
        success: true,
        message: 'Ambulance dispatched successfully',
        dispatch
    });
});

// Find Hospital
app.post('/api/services/find-hospital', (req, res) => {
    const { patientLocation, severity, condition, insured } = req.body;
    
    if (!patientLocation || !severity) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = dijkstra(patientLocation);
    const hospital = findNearestHospital(severity, 'any', insured, condition, result.dist);
    
    if (!hospital) {
        return res.json({
            success: false,
            message: 'No suitable hospital found',
            hospital: null
        });
    }
    
    res.json({
        success: true,
        hospital: {
            name: hospital.name,
            ...hospital,
            bedStatus: Math.floor(Math.random() * 8) + 1 + ' beds available',
            staffAvailable: true,
            specialistAvailable: severity >= 3,
            estimatedCheckInTime: '15-20 minutes',
            contactNumber: '+91-135-2799999'
        }
    });
});

// Emergency Triage Assessment
app.post('/api/services/emergency-triage', (req, res) => {
    const { patientName, age, condition, symptoms, medicalHistory, severity } = req.body;
    
    if (!patientName || !condition || !symptoms) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const triageResult = {
        triageId: `TRIAGE-${Date.now()}`,
        patientName,
        age,
        condition,
        symptoms,
        medicalHistory,
        assessmentTime: new Date().toISOString(),
        priority: severity >= 4 ? 'CRITICAL' : severity >= 3 ? 'HIGH' : 'MEDIUM',
        severityScore: severity,
        recommendations: [
            'Immediate paramedic assessment',
            'Monitor vital signs',
            'Prepare for hospitalization',
            'Notify specialist team'
        ],
        nextSteps: 'Patient prioritized in emergency queue',
        estimatedWaitTime: severity >= 4 ? '0 min' : severity >= 3 ? '5 min' : '15 min'
    };
    
    res.json({
        success: true,
        message: 'Triage assessment completed',
        triage: triageResult
    });
});

// Telemedicine Consultation
app.post('/api/services/telemedicine-consult', (req, res) => {
    const { patientName, condition, symptoms, age } = req.body;
    
    if (!patientName || !condition) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const doctors = [
        { name: 'Dr. Rajesh Kumar', specialization: 'General Medicine', experience: '15 years' },
        { name: 'Dr. Priya Sharma', specialization: 'Emergency Medicine', experience: '12 years' },
        { name: 'Dr. Vikram Singh', specialization: 'Cardiology', experience: '10 years' },
        { name: 'Dr. Neha Verma', specialization: 'Neurology', experience: '8 years' }
    ];
    
    const assignedDoctor = doctors[Math.floor(Math.random() * doctors.length)];
    
    const consultation = {
        consultationId: `CONSULT-${Date.now()}`,
        patientName,
        assignedDoctor,
        condition,
        symptoms,
        age,
        consultationType: 'Audio Consultation',
        sessionDuration: '15 minutes',
        cost: 'Free (Under emergency assistance)',
        startTime: new Date(Date.now() + 60000).toISOString(),
        audioLink: 'https://call.sanjivini.health/session/' + Math.random().toString(36).substr(2, 9),
        firstAidGuidance: [
            'Keep patient calm',
            'Ensure proper ventilation',
            'Monitor vital signs',
            'Prepare for ambulance arrival'
        ],
        medicalAdvice: 'First aid protocol initiated. Ambulance en route.',
        status: 'READY'
    };
    
    res.json({
        success: true,
        message: 'Doctor consultation scheduled',
        consultation
    });
});

// Access Medical Records
app.post('/api/services/medical-records', (req, res) => {
    const { patientName, patientId, dateOfBirth } = req.body;
    
    if (!patientName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const medicalRecords = {
        patientId: patientId || `PAT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        patientName,
        dateOfBirth,
        bloodGroup: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'][Math.floor(Math.random() * 8)],
        allergies: ['Penicillin', 'Sulfa drugs', 'None', 'Aspirin'][Math.floor(Math.random() * 4)],
        currentMedications: [
            'Aspirin - 75mg daily',
            'Lisinopril - 10mg daily',
            'Metformin - 500mg twice daily'
        ],
        medicalHistory: [
            'Hypertension (diagnosed 2018)',
            'Type 2 Diabetes (diagnosed 2019)',
            'Previous hospitalization for chest pain (2022)'
        ],
        familyHistory: 'Father - Coronary Artery Disease',
        emergencyContacts: [
            { name: 'Spouse', phone: '+91-98765-43210' },
            { name: 'Child', phone: '+91-98765-43211' }
        ],
        lastCheckup: '2025-12-15',
        insuranceProvider: 'HDFC Insurance',
        insurancePolicyNumber: 'POL-2024-98765',
        recordAccessTime: new Date().toISOString()
    };
    
    res.json({
        success: true,
        message: 'Medical records retrieved successfully',
        records: medicalRecords
    });
});

// Get Service Status
app.get('/api/services/status/:serviceType', (req, res) => {
    const { serviceType } = req.params;
    
    const statuses = {
        ambulance: { available: Math.floor(Math.random() * 5) + 1, avgResponse: '6-8 min' },
        hospital: { activeBeds: Math.floor(Math.random() * 20) + 5, waiting: Math.floor(Math.random() * 8) + 1 },
        doctor: { available: Math.random() > 0.3, avgWait: '2-5 min' },
        triage: { queue: Math.floor(Math.random() * 10) + 1, avgTime: '10-15 min' }
    };
    
    res.json({
        serviceType,
        status: 'OPERATIONAL',
        details: statuses[serviceType] || { status: 'Available' },
        timestamp: new Date().toISOString()
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// ════════════════════════════════════════════════════════════
// Start Server
// ════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚨 SANJIVINI Backend Server running on http://localhost:${PORT}`);
    console.log(`📍 Serving emergency response routing for Dehradun region`);
});
