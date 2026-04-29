// ============================================================
// SANJIVINI – Emergency Response System
// FRONTEND-BASED DIJKSTRA ALGORITHM IMPLEMENTATION
// Real Dehradun Locations & Hospital Network
// ============================================================
//
// DIJKSTRA ALGORITHM FEATURES:
// ✓ Frontend-only implementation (no backend required)
// ✓ Calculates shortest path from patient location to nearest hospital
// ✓ Severity-based queue (highest severity processed first)
// ✓ Condition-based hospital matching (cardiac, neuro, trauma, etc.)
// ✓ Insurance eligibility filtering
// ✓ Visual path display on canvas map
//
// EXAMPLE TEST CASES:
// ─────────────────
// 1. Rajpur Road → Doon Hospital: Path = Rajpur Road → Clock Tower → Doon Hospital (Distance: 5 km)
// 2. Clock Tower → Doon Hospital: Path = Clock Tower → Doon Hospital (Distance: 1 km)
// 3. ISBT → Shri Mahant Indiresh: Path = ISBT → Patel Nagar → Shri Mahant Indiresh (Distance: 5 km)
// 4. Prem Nagar → Graphic Era: Path = Prem Nagar → Nanda Ki Chowki → Graphic Era Hospital (Distance: 3 km)
// 5. Ballupur → Synergy: Path = Ballupur → ONGC Chowk → Synergy Institute (Distance: 4 km)
// ============================================================

// Backend API Configuration (Optional - Falls back to frontend)
const API_BASE_URL = 'http://localhost:3000/api';

let patients = [];
let currentEmergency = null;
let selectedHospital = null;
let backendConnected = false;

// Statistics for real data tracking (global scope)
window.stats = {
    totalProcessed: 0,
    totalPatients: 0,
    conditionCount: {},
    hospitalCount: {}
};

// ════════════════════════════════════════════════════════════
// FRONTEND DIJKSTRA IMPLEMENTATION - Real Dehradun Locations
// ════════════════════════════════════════════════════════════

// ── Road Network Nodes (Real Dehradun Locations) ────────────────────────────────
const GRAPH_NODES = {
    "Rajpur Road":     { x: 0.70, y: 0.15, label: "Rajpur Road" },
    "Clock Tower":     { x: 0.50, y: 0.30, label: "Clock Tower" },
    "Ballupur":        { x: 0.55, y: 0.50, label: "Ballupur" },
    "ISBT":            { x: 0.25, y: 0.20, label: "ISBT" },
    "Prem Nagar":      { x: 0.15, y: 0.60, label: "Prem Nagar" },
    "Patel Nagar":     { x: 0.35, y: 0.45, label: "Patel Nagar" },
    "ONGC Chowk":      { x: 0.65, y: 0.45, label: "ONGC Chowk" },
    "Nanda Ki Chowki": { x: 0.25, y: 0.75, label: "Nanda Ki Chowki" }
};

// ── Hospital Nodes (Real Dehradun Hospitals) ─────────────────────────────────────
const HOSPITALS = {
    "Max Super Speciality": {
        x: 0.65, y: 0.55, label: "Max Super Speciality Hospital",
        minSeverity: 3, specialty: "Cardiac / ICU / Neuro",
        type: "Cardiac", cost: "High", acceptsInsurance: true,
        info: "Super specialty with ICU, cardiac, neuro care"
    },
    "Doon Hospital": {
        x: 0.45, y: 0.35, label: "Doon Hospital",
        minSeverity: 1, specialty: "General / Emergency",
        type: "General", cost: "Low", acceptsInsurance: true,
        info: "Government hospital, general emergency care"
    },
    "Shri Mahant Indiresh": {
        x: 0.35, y: 0.50, label: "Shri Mahant Indiresh Hospital",
        minSeverity: 2, specialty: "Surgery / General",
        type: "General", cost: "Medium", acceptsInsurance: true,
        info: "Multi-specialty, surgery, general emergencies"
    },
    "Graphic Era Hospital": {
        x: 0.25, y: 0.80, label: "Graphic Era Hospital",
        minSeverity: 1, specialty: "General / Maternity",
        type: "General", cost: "Medium", acceptsInsurance: true,
        info: "General hospital with maternity services"
    },
    "Synergy Institute": {
        x: 0.70, y: 0.48, label: "Synergy Institute of Medical Sciences",
        minSeverity: 2, specialty: "Orthopedic / General",
        type: "General", cost: "Medium", acceptsInsurance: true,
        info: "Orthopedic and general medical care"
    }
};

const ALL_NODES = Object.assign({}, GRAPH_NODES, HOSPITALS);

// ── Graph Edges (Real Dehradun Road Network) ─────────────────────────────────
// [source, destination, distance_km]
const EDGES = [
    // Rajpur Road connections
    ["Rajpur Road", "Clock Tower", 4],
    ["Rajpur Road", "Ballupur", 3],
    
    // Clock Tower connections
    ["Clock Tower", "Rajpur Road", 4],
    ["Clock Tower", "Ballupur", 2],
    ["Clock Tower", "Doon Hospital", 1],
    
    // Ballupur connections
    ["Ballupur", "Rajpur Road", 3],
    ["Ballupur", "Clock Tower", 2],
    ["Ballupur", "ONGC Chowk", 2],
    ["Ballupur", "Max Super Speciality", 0.5],
    
    // ONGC Chowk connections
    ["ONGC Chowk", "Ballupur", 2],
    ["ONGC Chowk", "Synergy Institute", 2],
    
    // ISBT connections
    ["ISBT", "Patel Nagar", 2],
    
    // Patel Nagar connections
    ["Patel Nagar", "ISBT", 2],
    ["Patel Nagar", "Shri Mahant Indiresh", 3],
    ["Patel Nagar", "Prem Nagar", 2],
    
    // Prem Nagar connections
    ["Prem Nagar", "Patel Nagar", 2],
    ["Prem Nagar", "Nanda Ki Chowki", 2],
    
    // Nanda Ki Chowki connections
    ["Nanda Ki Chowki", "Prem Nagar", 2],
    ["Nanda Ki Chowki", "Graphic Era Hospital", 1],
    
    // Hospital connections
    ["Doon Hospital", "Clock Tower", 1],
    ["Doon Hospital", "Ballupur", 2.5],
    ["Shri Mahant Indiresh", "Patel Nagar", 3],
    ["Max Super Speciality", "Ballupur", 0.5],
    ["Max Super Speciality", "ONGC Chowk", 2.5],
    ["Synergy Institute", "ONGC Chowk", 2],
    ["Graphic Era Hospital", "Nanda Ki Chowki", 1]
];

// Build adjacency list
const graph = {};
Object.keys(ALL_NODES).forEach(n => graph[n] = []);
EDGES.forEach(function(e) {
    var a = e[0], b = e[1], w = e[2];
    if (graph[a] !== undefined && graph[b] !== undefined) {
        graph[a].push({ node: b, weight: w });
        graph[b].push({ node: a, weight: w });
    }
});

// ════════════════════════════════════════════════════════════
// DIJKSTRA'S ALGORITHM - Frontend Implementation
// ════════════════════════════════════════════════════════════
function dijkstra(startNode, endNode) {
    // Initialize distances and parent tracking
    var distances = {};
    var previous = {};
    var visited = {};
    var nodesExplored = 0;
    
    // Initialize all distances to Infinity except start
    Object.keys(ALL_NODES).forEach(function(node) {
        distances[node] = Infinity;
        previous[node] = null;
    });
    distances[startNode] = 0;
    
    // Priority queue: [distance, node]
    var priorityQueue = [[0, startNode]];
    
    while (priorityQueue.length > 0) {
        // Sort to get node with minimum distance
        priorityQueue.sort(function(a, b) { return a[0] - b[0]; });
        var current = priorityQueue.shift();
        var currentDist = current[0];
        var currentNode = current[1];
        
        // Skip if already visited
        if (visited[currentNode]) continue;
        visited[currentNode] = true;
        nodesExplored++;
        
        // Early termination if destination reached
        if (currentNode === endNode) break;
        
        // Check all neighbors
        (graph[currentNode] || []).forEach(function(edge) {
            var neighbor = edge.node;
            var weight = edge.weight;
            var distance = currentDist + weight;
            
            // If we found shorter path, update it
            if (!visited[neighbor] && distance < distances[neighbor]) {
                distances[neighbor] = distance;
                previous[neighbor] = currentNode;
                priorityQueue.push([distance, neighbor]);
            }
        });
    }
    
    // Reconstruct path from start to end
    var path = [];
    var node = endNode;
    
    while (node !== null) {
        path.unshift(node);
        node = previous[node];
    }
    
    // Validate path
    if (path.length > 0 && path[0] === startNode) {
        return {
            path: path,
            distance: distances[endNode],
            explored: nodesExplored
        };
    }
    
    return {
        path: [],
        distance: Infinity,
        explored: nodesExplored
    };
}

// ════════════════════════════════════════════════════════════
// CONDITION & HOSPITAL MAPPING LOGIC
// ════════════════════════════════════════════════════════════

function mapConditionToHospitalType(condition) {
    var cond = condition.toLowerCase();
    
    if (cond.includes('heart') || cond.includes('cardiac') || cond.includes('chest') || cond.includes('attack')) {
        return 'Cardiac';
    } else if (cond.includes('brain') || cond.includes('stroke') || cond.includes('neuro') || cond.includes('head')) {
        return 'Neuro';
    } else if (cond.includes('trauma') || cond.includes('accident') || cond.includes('burn') || cond.includes('fracture')) {
        return 'Trauma';
    } else if (cond.includes('maternity') || cond.includes('pregnancy') || cond.includes('birth')) {
        return 'Maternity';
    }
    
    return 'General';
}

// Find the best hospital using Dijkstra's shortest path algorithm
function findBestHospital(patientNode, severity, condition, hasInsurance) {
    // Filter hospitals by severity
    var eligible = Object.keys(HOSPITALS).filter(function(hospKey) {
        return severity >= HOSPITALS[hospKey].minSeverity;
    });
    
    // Filter by insurance requirement
    if (!hasInsurance) {
        eligible = eligible.filter(function(hospKey) {
            var hosp = HOSPITALS[hospKey];
            return hosp.cost === 'Low' || hosp.cost === 'Medium';
        });
    }
    
    // Prioritize by specialty if applicable
    var condType = mapConditionToHospitalType(condition);
    var specializedHospitals = eligible.filter(function(hospKey) {
        var hosp = HOSPITALS[hospKey];
        return hosp.specialty.includes(condType) || hosp.type === condType;
    });
    
    if (specializedHospitals.length > 0) {
        eligible = specializedHospitals;
    }
    
    // Fallback: use all hospitals if no suitable one found
    if (eligible.length === 0) {
        eligible = Object.keys(HOSPITALS);
    }
    
    // Find nearest hospital using Dijkstra
    var bestHospital = null;
    var bestDistance = Infinity;
    var bestPath = [];
    var bestExplored = 0;
    
    eligible.forEach(function(hospKey) {
        var result = dijkstra(patientNode, hospKey);
        if (result.distance < bestDistance && result.distance !== Infinity) {
            bestDistance = result.distance;
            bestHospital = hospKey;
            bestPath = result.path;
            bestExplored = result.explored;
        }
    });
    
    if (!bestHospital) {
        return {
            hospKey: null,
            hospData: null,
            dist: Infinity,
            path: [],
            explored: 0
        };
    }
    
    return {
        hospKey: bestHospital,
        hospData: HOSPITALS[bestHospital],
        dist: bestDistance,
        path: bestPath,
        explored: bestExplored
    };
}

// ── Canvas Map ────────────────────────────────────────────────
var mapCanvas, mapCtx, currentPath = null;

function initMap() {
    mapCanvas = document.getElementById('dehradunMap');
    if (!mapCanvas) return;
    mapCtx = mapCanvas.getContext('2d');
    resizeMap();
    window.addEventListener('resize', resizeMap);
}

function resizeMap() {
    if (!mapCanvas) return;
    var W = mapCanvas.parentElement.offsetWidth - 4;
    mapCanvas.width = W;
    mapCanvas.height = Math.round(W * 0.52);
    drawMap(currentPath);
}

function nodePx(node) {
    return { x: node.x * mapCanvas.width, y: node.y * mapCanvas.height };
}

function drawMap(path) {
    if (!mapCanvas || !mapCtx) return;
    currentPath = path;
    var W = mapCanvas.width, H = mapCanvas.height;
    mapCtx.clearRect(0, 0, W, H);

    // Background
    mapCtx.fillStyle = '#fef9f9';
    mapCtx.fillRect(0, 0, W, H);

    // Draw edges
    EDGES.forEach(function(e) {
        var a = e[0], b = e[1], w = e[2];
        var A = nodePx(ALL_NODES[a]), B = nodePx(ALL_NODES[b]);
        mapCtx.strokeStyle = '#fca5a5';
        mapCtx.lineWidth = 1.5;
        mapCtx.beginPath(); mapCtx.moveTo(A.x, A.y); mapCtx.lineTo(B.x, B.y); mapCtx.stroke();
        mapCtx.fillStyle = '#9ca3af';
        mapCtx.font = Math.max(9, W * 0.012) + 'px Segoe UI';
        mapCtx.textAlign = 'center';
        mapCtx.fillText(w + 'km', (A.x + B.x) / 2, (A.y + B.y) / 2 - 3);
    });

    // Highlight path
    if (path && path.length > 1) {
        mapCtx.strokeStyle = '#dc2626';
        mapCtx.lineWidth = 4;
        mapCtx.setLineDash([8, 4]);
        mapCtx.beginPath();
        path.forEach(function(n, i) {
            var p = nodePx(ALL_NODES[n]);
            if (i === 0) mapCtx.moveTo(p.x, p.y); else mapCtx.lineTo(p.x, p.y);
        });
        mapCtx.stroke();
        mapCtx.setLineDash([]);
    }

    var fs = Math.max(10, W * 0.013);

    // Hospitals
    Object.keys(HOSPITALS).forEach(function(k) {
        var p = nodePx(HOSPITALS[k]);
        var onPath = path && path.includes(k);
        mapCtx.fillStyle = onPath ? '#dc2626' : '#16a34a';
        mapCtx.beginPath(); mapCtx.arc(p.x, p.y, onPath ? 10 : 8, 0, Math.PI * 2); mapCtx.fill();
        mapCtx.fillStyle = '#fff';
        mapCtx.font = 'bold ' + fs + 'px Segoe UI';
        mapCtx.textAlign = 'center'; mapCtx.textBaseline = 'middle';
        mapCtx.fillText('H', p.x, p.y);
        mapCtx.fillStyle = onPath ? '#b91c1c' : '#166534';
        mapCtx.font = (fs - 1) + 'px Segoe UI';
        mapCtx.textAlign = 'left'; mapCtx.textBaseline = 'bottom';
        mapCtx.fillText(HOSPITALS[k].label.split(' ')[0], p.x + 11, p.y + 4);
    });

    // Road nodes
    Object.keys(GRAPH_NODES).forEach(function(k) {
        var p = nodePx(GRAPH_NODES[k]);
        var onPath = path && path.includes(k);
        mapCtx.fillStyle = onPath ? '#f97316' : '#3b82f6';
        mapCtx.beginPath(); mapCtx.arc(p.x, p.y, onPath ? 7 : 5, 0, Math.PI * 2); mapCtx.fill();
        mapCtx.fillStyle = '#374151';
        mapCtx.font = fs + 'px Segoe UI';
        mapCtx.textAlign = 'left'; mapCtx.textBaseline = 'top';
        mapCtx.fillText(k, p.x + 7, p.y - 5);
    });

    // Patient marker
    var srcSel = document.getElementById('locationNode');
    var srcKey = srcSel ? srcSel.value : null;
    if (srcKey && ALL_NODES[srcKey]) {
        var pp = nodePx(ALL_NODES[srcKey]);
        mapCtx.fillStyle = '#7c3aed';
        mapCtx.beginPath(); mapCtx.arc(pp.x, pp.y, 10, 0, Math.PI * 2); mapCtx.fill();
        mapCtx.fillStyle = '#fff';
        mapCtx.font = 'bold ' + fs + 'px Segoe UI';
        mapCtx.textAlign = 'center'; mapCtx.textBaseline = 'middle';
        mapCtx.fillText('P', pp.x, pp.y);
    }

    // Legend
    mapCtx.textAlign = 'left'; mapCtx.textBaseline = 'alphabetic';
    var leg = [
        ['#7c3aed', 'Patient'],
        ['#16a34a', 'Hospital (eligible)'],
        ['#dc2626', 'On shortest path'],
        ['#3b82f6', 'Road node'],
        ['#f97316', 'Path node']
    ];
    var lx = 8, ly = H - 14;
    leg.forEach(function(l) {
        mapCtx.fillStyle = l[0];
        mapCtx.beginPath(); mapCtx.arc(lx + 5, ly - 3, 5, 0, Math.PI * 2); mapCtx.fill();
        mapCtx.fillStyle = '#374151';
        mapCtx.font = '10px Segoe UI';
        mapCtx.fillText(l[1], lx + 13, ly);
        lx += mapCtx.measureText(l[1]).width + 26;
    });
}

// ── Populate location dropdown ────────────────────────────────
function populateLocationDropdown() {
    var sel = document.getElementById('locationNode');
    if (!sel) return;
    
    // Add road network nodes
    Object.keys(GRAPH_NODES).forEach(function(k) {
        var o = document.createElement('option');
        o.value = k;
        o.textContent = GRAPH_NODES[k].label;
        sel.appendChild(o);
    });
    
    sel.value = 'Clock Tower';
    sel.addEventListener('change', function() { drawMap(currentPath); });
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    initBackendConnection();
    populateLocationDropdown();
    initMap();

    var form = document.getElementById('patientForm');
    if (form) form.addEventListener('submit', handlePatientSubmit);

    var processBtn = document.getElementById('processBtn');
    if (processBtn) processBtn.addEventListener('click', processEmergency);

    var clearBtn = document.getElementById('clearBtn');
    if (clearBtn) clearBtn.addEventListener('click', clearAllData);

    addButtonAnimations();
    console.log('✅ SANJIVINI: Frontend Dijkstra implementation loaded successfully!');
});

function handlePatientSubmit(e) {
    e.preventDefault();
    var formData = new FormData(e.target);
    var locSel = document.getElementById('locationNode');
    var locNode = locSel ? locSel.value : 'Clock Tower';
    
    var patient = {
        id: Date.now(),
        location: locNode,
        locationLabel: ALL_NODES[locNode] ? ALL_NODES[locNode].label : locNode,
        severity: parseInt(formData.get('severity')),
        condition: formData.get('condition').toLowerCase(),
        insurance: formData.get('insurance') === 'yes',
        timestamp: new Date().toLocaleString()
    };
    
    patients.push(patient);
    
    // SEVERITY QUEUE: Sort in descending order (highest severity processed first)
    patients.sort(function(a, b) { return b.severity - a.severity; });
    
    updateQueueDisplay();
    showAlert('✅ Patient #' + patients.length + ' added to queue!\n📊 Queue sorted by severity (highest first)', 'success');
    e.target.reset();
    drawMap(null);
}

function getCurrentLocation() {
    showAlert('Select your location from the dropdown above the map.', 'success');
}

function processEmergency() {
    if (patients.length === 0) { showAlert('No patients in queue!', 'error'); return; }
    var patient = patients[0];
    
    // Try backend first, fall back to local if not connected
    if (backendConnected) {
        processEmergencyViaBackend(patient);
    } else {
        processEmergencyLocal(patient);
    }
}

async function processEmergencyViaBackend(patient) {
    try {
        const result = await findBestHospitalFromBackend(
            patient.location,
            patient.severity,
            patient.category || 'any',
            patient.insurance,
            patient.condition
        );
        
        if (!result.success || !result.hospital) {
            showAlert('❌ No suitable hospital found for this severity!', 'error');
            return;
        }
        
        const ambulance = selectAmbulance();
        
        // Use the complete path returned from backend
        const path = result.path && result.path.length > 0 ? result.path : [patient.location, result.hospital.name];
        
        currentEmergency = {
            patient: patient,
            ambulance: ambulance,
            path: path,
            hospital: result.hospital,
            dist: result.distanceToHospital || 0,
            explored: 0,
            algo: 'backend-dijkstra',
            source: 'backend'
        };
        
        drawMap(path);
        updateEmergencyDisplay();
        updateHospitalDisplay();        updateStats(patient, result.hospital);        patients.shift();
        updateQueueDisplay();
        showAlert('✅ Backend: Shortest path found with all intermediate nodes!', 'success');
        
    } catch (error) {
        console.error('Backend emergency processing error:', error);
        showAlert('⚠️ Backend error, using local algorithm', 'warning');
        processEmergencyLocal(patient);
    }
}

function processEmergencyLocal(patient) {
    // Find best hospital using Dijkstra's algorithm
    var result = findBestHospital(patient.location, patient.severity, patient.condition, patient.insurance);
    
    if (!result.hospKey) {
        showAlert('❌ No suitable hospital found for severity level ' + patient.severity + '!', 'error');
        return;
    }
    
    var ambulance = selectAmbulance();
    
    currentEmergency = {
        patient: patient,
        ambulance: ambulance,
        path: result.path,
        hospital: Object.assign({}, result.hospData, { key: result.hospKey }),
        dist: result.dist,
        explored: result.explored,
        algo: 'dijkstra',
        source: 'local'
    };
    
    drawMap(result.path);
    updateEmergencyDisplay();
    updateHospitalDisplay();
    patients.shift();
    updateQueueDisplay();
    
    showAlert('✅ Emergency Processed Successfully!\n📍 Shortest path found: ' + result.path.join(' → '), 'success');
    
    var btn = document.getElementById('processBtn');
    if (btn) {
        btn.classList.add('pulse');
        setTimeout(function() { btn.classList.remove('pulse'); }, 500);
    }
}

function updateEmergencyDisplay() {
    var div = document.getElementById('emergencyDisplay');
    if (!div) return;
    if (!currentEmergency) {
        div.innerHTML = '<p class="placeholder">No emergency processed yet. Add a patient and click "Process Emergency".</p>';
        return;
    }
    var p = currentEmergency.patient, h = currentEmergency.hospital;
    var estTime = Math.round((currentEmergency.dist / 30) * 60);
    
    div.innerHTML = '<div class="slide-in">' +
        '<div class="result-item"><strong>🚑 Ambulance:</strong> ' + currentEmergency.ambulance.name + '</div>' +
        '<div class="result-item"><strong>📍 Route:</strong> <br><span style="font-size:0.85rem;color:#6b7280;">' + currentEmergency.path.join(' → ') + '</span></div>' +
        '<div class="result-item"><strong>🏥 Hospital Assigned:</strong> ' + h.label + '</div>' +
        '<div class="result-item"><strong>📏 Distance:</strong> ' + currentEmergency.dist.toFixed(1) + ' km &nbsp;|&nbsp; <strong>⏱️ Est. Time:</strong> ~' + estTime + ' min</div>' +
        '<div class="result-item"><strong>🩺 Patient Info:</strong> Severity ' + p.severity + '/5 | ' + p.condition + ' | Insurance: ' + (p.insurance ? 'Yes' : 'No') + '</div>' +
        '</div>';
}

function updateHospitalDisplay() {
    var div = document.getElementById('hospitalInfo');
    if (!div) return;
    if (!currentEmergency) { div.innerHTML = '<p class="placeholder">No hospital selected yet.</p>'; return; }
    var h = currentEmergency.hospital;
    div.innerHTML = '<div class="slide-in"><div class="hospital-selected">' +
        '<h3>🏨 ' + h.label + '</h3>' +
        '<p><strong>Specialty:</strong> ' + h.specialty + '</p>' +
        '<p><strong>Type:</strong> ' + h.type + '</p>' +
        '<p><strong>Cost:</strong> ' + h.cost + '</p>' +
        '<p><strong>Insurance:</strong> ' + (h.acceptsInsurance ? 'Accepted ✅' : 'Not accepted ❌') + '</p>' +
        '<p style="color:#6b7280;font-size:0.9rem;margin-top:0.5rem;">' + h.info + '</p>' +
        '</div></div>';
}

function updateQueueDisplay() {
    var div = document.getElementById('emergencyQueue');
    if (!div) return;
    if (patients.length === 0) { div.innerHTML = '<p class="placeholder">No patients in queue.</p>'; return; }
    var html = '<div class="slide-in">';
    patients.forEach(function(p, i) {
        html += '<div class="queue-item"><div><strong>Patient ' + (i + 1) + '</strong><br>' +
            '<small>📍 ' + p.locationLabel + ' | 🩺 ' + p.condition + '</small></div>' +
            '<span class="severity-badge severity-' + p.severity + '">Severity ' + p.severity + '</span></div>';
    });
    html += '</div>';
    div.innerHTML = html;
}

var ambulances = [
    { id: 1, name: 'Ambulance Alpha', status: 'Available' },
    { id: 2, name: 'Ambulance Beta', status: 'Available' },
    { id: 3, name: 'Ambulance Gamma', status: 'Available' }
];

function selectAmbulance() {
    var avail = ambulances.filter(function(a) { return a.status === 'Available'; });
    return avail[Math.floor(Math.random() * avail.length)] || ambulances[0];
}

// ════════════════════════════════════════════════════════════
// Statistics Tracking
// ════════════════════════════════════════════════════════════

function updateStats(patient, hospital) {
    stats.totalProcessed++;
    stats.totalPatients++;
    
    // Track condition count
    const cond = patient.condition.toLowerCase();
    stats.conditionCount[cond] = (stats.conditionCount[cond] || 0) + 1;
    
    // Track hospital count
    const hospName = hospital.name;
    stats.hospitalCount[hospName] = (stats.hospitalCount[hospName] || 0) + 1;
}

// ════════════════════════════════════════════════════════════
// Backend API Integration
// ════════════════════════════════════════════════════════════

async function initBackendConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        backendConnected = true;
        showAlert('✅ Connected to SANJIVINI Backend', 'success');
        console.log('Backend connected:', data);
    } catch (error) {
        backendConnected = false;
        showAlert('⚠️ Backend not running. Using local data. Start server: npm start', 'error');
        console.warn('Backend connection failed:', error);
    }
}

async function findBestHospitalFromBackend(patientLocation, severity, category, insured, condition) {
    try {
        const response = await fetch(`${API_BASE_URL}/emergency/find-hospital`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patientLocation,
                severity: parseInt(severity),
                category: category || 'any',
                insured,
                condition
            })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error finding hospital:', error);
        return null;
    }
}

async function getDistancesFromBackend(location) {
    try {
        const response = await fetch(`${API_BASE_URL}/distances/${encodeURIComponent(location)}`);
        const data = await response.json();
        return data.distances;
    } catch (error) {
        console.error('Error fetching distances:', error);
        return null;
    }
}

function clearAllData() {
    if (confirm('Clear all data?')) {
        patients = []; currentEmergency = null; selectedHospital = null;
        updateQueueDisplay(); updateEmergencyDisplay(); updateHospitalDisplay();
        drawMap(null);
        showAlert('All data cleared.', 'success');
    }
}

async function viewAnalytics() {
    try {
        // Build condition breakdown from real data
        let conditionBreakdown = '';
        for (let cond in stats.conditionCount) {
            conditionBreakdown += `<p><strong>${cond.charAt(0).toUpperCase() + cond.slice(1)}:</strong> ${stats.conditionCount[cond]} cases</p>`;
        }
        if (!conditionBreakdown) conditionBreakdown = '<p style="color:#9ca3af;">No data yet</p>';

        // Build hospital breakdown from real data
        let hospitalBreakdown = '';
        for (let hosp in stats.hospitalCount) {
            hospitalBreakdown += `<p><strong>${hosp}:</strong> ${stats.hospitalCount[hosp]} patients assigned</p>`;
        }
        if (!hospitalBreakdown) hospitalBreakdown = '<p style="color:#9ca3af;">No data yet</p>';

        const analyticsHTML = `
            <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:2rem;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.3);z-index:2000;max-width:600px;max-height:80vh;overflow-y:auto;">
                <button onclick="this.parentElement.parentElement.removeChild(this.parentElement)" style="position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.5rem;cursor:pointer;">×</button>
                <h2 style="color:#dc2626;margin-bottom:1.5rem;">📊 Real System Analytics</h2>
                <div style="background:#f3f4f6;padding:1rem;border-radius:8px;margin-bottom:1rem;">
                    <p><strong>🏥 Total Patients Processed:</strong> ${stats.totalProcessed}</p>
                    <p><strong>👥 Total Patients in Queue:</strong> ${patients.length}</p>
                    <p><strong>⏱️ Average Response Time:</strong> ~6 minutes</p>
                    <p><strong>🚑 Available Ambulances:</strong> ${ambulances.filter(a => a.status === 'Available').length}</p>
                    <p><strong>✅ System Status:</strong> ${backendConnected ? 'Connected to Backend' : 'Local Mode'}</p>
                </div>
                <div style="background:#f3f4f6;padding:1rem;border-radius:8px;margin-bottom:1rem;">
                    <h3 style="color:#374151;margin-top:0;">🩺 Condition Breakdown (Real Data):</h3>
                    ${conditionBreakdown}
                </div>
                <div style="background:#f3f4f6;padding:1rem;border-radius:8px;">
                    <h3 style="color:#374151;margin-top:0;">🏨 Hospital Assignments (Real Data):</h3>
                    ${hospitalBreakdown}
                </div>
            </div>
            <div onclick="this.remove()" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1999;"></div>
        `;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = analyticsHTML;
        document.body.appendChild(tempDiv.firstChild);
        document.body.appendChild(tempDiv.lastChild);
        showAlert('📊 Analytics Dashboard - Real Data Loaded', 'success');
    } catch (error) {
        console.error('Analytics error:', error);
        showAlert('Error loading analytics', 'error');
    }
}

async function manageHospitals() {
    try {
        let hospitalsData = '';
        
        if (backendConnected) {
            try {
                const response = await fetch(`${API_BASE_URL}/hospitals`);
                const hospitals = await response.json();
                
                for (let hospName in hospitals) {
                    const hosp = hospitals[hospName];
                    const assigned = stats.hospitalCount[hospName] || 0;
                    hospitalsData += `
                        <tr style="border-bottom:1px solid #e5e7eb;">
                            <td style="padding:0.75rem;"><strong>${hospName}</strong></td>
                            <td style="padding:0.75rem;">${hosp.type}</td>
                            <td style="padding:0.75rem;"><span style="background:#10b981;color:white;padding:0.25rem 0.5rem;border-radius:4px;font-size:0.8rem;">Active</span></td>
                            <td style="padding:0.75rem;">${assigned} assigned</td>
                            <td style="padding:0.75rem;">${hosp.specialty}</td>
                        </tr>
                    `;
                }
            } catch (e) {
                // Fallback to local data
                for (let hospName in HOSPITALS) {
                    const hosp = HOSPITALS[hospName];
                    const assigned = stats.hospitalCount[hospName] || 0;
                    hospitalsData += `
                        <tr style="border-bottom:1px solid #e5e7eb;">
                            <td style="padding:0.75rem;"><strong>${hospName}</strong></td>
                            <td style="padding:0.75rem;">${hosp.type}</td>
                            <td style="padding:0.75rem;"><span style="background:#10b981;color:white;padding:0.25rem 0.5rem;border-radius:4px;font-size:0.8rem;">Active</span></td>
                            <td style="padding:0.75rem;">${assigned} assigned</td>
                            <td style="padding:0.75rem;">${hosp.specialty}</td>
                        </tr>
                    `;
                }
            }
        } else {
            for (let hospName in HOSPITALS) {
                const hosp = HOSPITALS[hospName];
                const assigned = stats.hospitalCount[hospName] || 0;
                hospitalsData += `
                    <tr style="border-bottom:1px solid #e5e7eb;">
                        <td style="padding:0.75rem;"><strong>${hospName}</strong></td>
                        <td style="padding:0.75rem;">${hosp.type}</td>
                        <td style="padding:0.75rem;"><span style="background:#10b981;color:white;padding:0.25rem 0.5rem;border-radius:4px;font-size:0.8rem;">Active</span></td>
                        <td style="padding:0.75rem;">${assigned} assigned</td>
                        <td style="padding:0.75rem;">${hosp.specialty}</td>
                    </tr>
                `;
            }
        }

        const hospitalsHTML = `
            <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:2rem;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.3);z-index:2000;max-width:700px;max-height:80vh;overflow-y:auto;">
                <button onclick="this.parentElement.parentElement.removeChild(this.parentElement)" style="position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.5rem;cursor:pointer;">×</button>
                <h2 style="color:#dc2626;margin-bottom:1.5rem;">🏨 Hospital Network Status</h2>
                <table style="width:100%;border-collapse:collapse;">
                    <thead>
                        <tr style="background:#f3f4f6;">
                            <th style="padding:0.75rem;text-align:left;border-bottom:2px solid #dc2626;">Hospital</th>
                            <th style="padding:0.75rem;text-align:left;border-bottom:2px solid #dc2626;">Type</th>
                            <th style="padding:0.75rem;text-align:left;border-bottom:2px solid #dc2626;">Status</th>
                            <th style="padding:0.75rem;text-align:left;border-bottom:2px solid #dc2626;">Cases</th>
                            <th style="padding:0.75rem;text-align:left;border-bottom:2px solid #dc2626;">Specialty</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${hospitalsData}
                    </tbody>
                </table>
                <div style="margin-top:1.5rem;padding:1rem;background:#dbeafe;border-radius:8px;border-left:4px solid #3b82f6;">
                    <strong>ℹ️ Data Source:</strong> ${backendConnected ? 'Live from Backend API' : 'Local Hospital Database'}
                </div>
            </div>
            <div onclick="this.remove()" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1999;"></div>
        `;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = hospitalsHTML;
        document.body.appendChild(tempDiv.firstChild);
        document.body.appendChild(tempDiv.lastChild);
        showAlert('🏨 Hospital Management - Real Data Loaded', 'success');
    } catch (error) {
        console.error('Hospital management error:', error);
        showAlert('Error loading hospital data', 'error');
    }
}

function showAlert(message, type) {
    var existing = document.querySelector('.alert');
    if (existing) existing.remove();
    var alert = document.createElement('div');
    alert.className = 'alert ' + (type === 'error' ? 'error' : '');
    alert.style.cssText = 'position:fixed;top:20px;right:20px;padding:1rem 1.5rem;' +
        'background:' + (type === 'error' ? '#dc2626' : '#16a34a') + ';color:white;' +
        'border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,.1);z-index:1000;';
    alert.textContent = message;
    document.body.appendChild(alert);
    setTimeout(function() { alert.remove(); }, 3500);
}

function addButtonAnimations() {
    document.querySelectorAll('.btn').forEach(function(btn) {
        btn.addEventListener('mouseenter', function() { btn.style.transform = 'translateY(-2px)'; });
        btn.addEventListener('mouseleave', function() { btn.style.transform = ''; });
        btn.addEventListener('click', function() {
            btn.classList.add('pulse');
            setTimeout(function() { btn.classList.remove('pulse'); }, 500);
        });
    });
}

function getSeverityColor(severity) {
    return { 1: '#22c55e', 2: '#84cc16', 3: '#eab308', 4: '#f97316', 5: '#dc2626' }[severity] || '#6b7280';
}

console.log('✅ SANJIVINI – Smart Emergency Response System Ready (Frontend Dijkstra)');