/**
 * RIVO YAML-to-Graph Reverse Parser
 * Converts a RIVO Node protocol YAML into node editor graph data.
 * Deterministic layout: inputs (left) → processing (center) → outputs (right).
 */

function parseYAMLToGraph(yamlText) {
    // Minimal YAML parser for flat RIVO protocol structure.
    // Uses js-yaml if available, otherwise a simple line parser.
    let doc;
    if (typeof jsyaml !== 'undefined') {
        try { doc = jsyaml.load(yamlText); } catch (e) { return { error: 'YAML parse error: ' + e.message }; }
    } else {
        doc = simpleYAMLParse(yamlText);
    }
    if (!doc || typeof doc !== 'object') return { error: 'Invalid YAML document' };

    const nodes = [];
    const connections = [];
    let nextId = 1;
    const COL_INPUT = 80, COL_PROCESS = 350, COL_OUTPUT = 620;
    let inputY = 60, processY = 60, outputY = 60;
    const ROW_GAP = 130;

    // Track variable → nodeId mapping for auto-connecting
    const varToNode = {};

    // ── Input Nodes ──────────────────────────────────────────

    // Modbus read_registers (new format)
    const readRegs = doc.read_registers || [];
    readRegs.forEach(reg => {
        const id = nextId++;
        nodes.push({
            id, type: 'input/modbus_sensor',
            x: COL_INPUT, y: inputY,
            properties: {
                bus: 'modbus-rtu',
                address: formatHex(reg.address),
                function_code: reg.function === 'read_input' ? '0x04' : '0x03',
                register: formatHex(reg.address),
                length: reg.decode && reg.decode.startsWith('float32') ? 4 : 2,
                decoder: 'modbus_' + (reg.decode || 'uint16'),
                variable_name: reg.name || 'value',
                scale: reg.scale,
                unit: reg.unit || ''
            },
            title: reg.name || 'Modbus Read'
        });
        varToNode[reg.name] = id;
        inputY += ROW_GAP;
    });

    // Legacy modbus.registers
    const modbusRegs = (doc.modbus && doc.modbus.registers) || [];
    modbusRegs.forEach(reg => {
        const id = nextId++;
        nodes.push({
            id, type: 'input/modbus_sensor',
            x: COL_INPUT, y: inputY,
            properties: {
                bus: 'modbus-rtu',
                address: formatHex(doc.modbus.start_reg + reg.index),
                function_code: doc.modbus.function_code === 4 ? '0x04' : '0x03',
                register: formatHex(doc.modbus.start_reg + reg.index),
                length: 2,
                decoder: 'modbus_' + (reg.decode || 'uint16'),
                variable_name: reg.name,
                scale: reg.scale
            },
            title: reg.name || 'Register'
        });
        varToNode[reg.name] = id;
        inputY += ROW_GAP;
    });

    // I2C/UART read.registers or read.fields
    const readRegisters = (doc.read && doc.read.registers) || [];
    readRegisters.forEach(reg => {
        const id = nextId++;
        nodes.push({
            id, type: 'input/sensor',
            x: COL_INPUT, y: inputY,
            properties: {
                bus: doc.bus || 'i2c',
                address: doc.address || '0x00',
                register: reg.reg || '0x00',
                length: reg.len || 1,
                decoder: reg.decode || 'raw_to_int',
                variable_name: reg.name
            },
            title: reg.name || 'Sensor'
        });
        varToNode[reg.name] = id;
        inputY += ROW_GAP;
    });

    const readFields = (doc.read && doc.read.fields) || [];
    readFields.forEach(field => {
        const id = nextId++;
        nodes.push({
            id, type: 'input/sensor',
            x: COL_INPUT, y: inputY,
            properties: {
                bus: doc.bus || 'uart',
                address: doc.address || '',
                register: '0x' + (field.offset || 0).toString(16),
                length: field.len || 1,
                decoder: field.decode || 'uint16',
                variable_name: field.name,
                scale: field.scale
            },
            title: field.name || 'Field'
        });
        varToNode[field.name] = id;
        inputY += ROW_GAP;
    });

    // Constants
    const constants = doc.constants || {};
    Object.entries(constants).forEach(([name, value]) => {
        const id = nextId++;
        nodes.push({
            id, type: 'input/constant',
            x: COL_INPUT, y: inputY,
            properties: { name, value: value },
            title: name
        });
        varToNode[name] = id;
        inputY += ROW_GAP;
    });

    // ── Processing Nodes ─────────────────────────────────────

    const calibrations = doc.calibrate || {};
    Object.entries(calibrations).forEach(([name, cal]) => {
        const id = nextId++;
        const props = {
            expression: cal.expr || '$input',
            description: cal.description || ''
        };
        nodes.push({
            id, type: 'process/calibration',
            x: COL_PROCESS, y: processY,
            properties: props,
            title: name
        });
        // Connect input
        if (cal.input && varToNode[cal.input]) {
            connections.push({
                origin_id: varToNode[cal.input],
                origin_port: 0,
                target_id: id,
                target_port: 0
            });
        }
        if (cal.inputs) {
            Object.values(cal.inputs).forEach((inputVar, idx) => {
                if (varToNode[inputVar]) {
                    connections.push({
                        origin_id: varToNode[inputVar],
                        origin_port: 0,
                        target_id: id,
                        target_port: idx
                    });
                }
            });
        }
        varToNode[name] = id;
        processY += ROW_GAP;
    });

    // ── Output Nodes ─────────────────────────────────────────

    // Status output (sensor_overview)
    const statusOverview = (doc.map && doc.map.status && doc.map.status.sensor_overview) || [];
    statusOverview.forEach(entry => {
        const id = nextId++;
        nodes.push({
            id, type: 'output/status',
            x: COL_OUTPUT, y: outputY,
            properties: {
                sensor_id: entry.sensor_id || '',
                sensor_type: entry.sensor_type || 'Sensor',
                unit: entry.unit || ''
            },
            title: entry.sensor_id || 'Status'
        });
        // Connect from source variable
        const srcVar = extractVarName(entry.value);
        if (srcVar && varToNode[srcVar]) {
            connections.push({
                origin_id: varToNode[srcVar],
                origin_port: 0,
                target_id: id,
                target_port: 0
            });
        }
        outputY += ROW_GAP;
    });

    // Telemetry outputs
    const telemetry = (doc.map && doc.map.telemetry) || {};
    Object.entries(telemetry).forEach(([topic, fields]) => {
        if (typeof fields !== 'object') return;
        Object.entries(fields).forEach(([fieldName, srcExpr]) => {
            const id = nextId++;
            nodes.push({
                id, type: 'output/telemetry',
                x: COL_OUTPUT, y: outputY,
                properties: {
                    topic: topic,
                    field: fieldName
                },
                title: topic + '/' + fieldName
            });
            const srcVar = extractVarName(String(srcExpr));
            if (srcVar && varToNode[srcVar]) {
                connections.push({
                    origin_id: varToNode[srcVar],
                    origin_port: 0,
                    target_id: id,
                    target_port: 0
                });
            }
            outputY += ROW_GAP;
        });
    });

    // Write registers (actuator outputs)
    const writeRegs = doc.write_registers || [];
    writeRegs.forEach(wr => {
        const id = nextId++;
        nodes.push({
            id, type: 'output/actuator_write',
            x: COL_OUTPUT, y: outputY,
            properties: {
                name: wr.name || 'actuator',
                address: formatHex(wr.address),
                function: wr.function || 'write_register',
                decode: wr.decode || 'int16',
                scale: wr.scale || 1.0,
                unit: wr.unit || '',
                range_min: (wr.range && wr.range[0]) || 0,
                range_max: (wr.range && wr.range[1]) || 65535,
                command_topic: wr.command_topic || ''
            },
            title: wr.name || 'Actuator Write'
        });
        outputY += ROW_GAP;
    });

    // Custom commands (also actuator outputs)
    const customCmds = doc.custom_commands || [];
    customCmds.forEach(cc => {
        const id = nextId++;
        nodes.push({
            id, type: 'output/actuator_write',
            x: COL_OUTPUT, y: outputY,
            properties: {
                name: cc.name || 'custom_cmd',
                address: '0x' + (cc.function_code || 0).toString(16),
                function: 'custom_fc',
                decode: 'custom',
                command_topic: cc.command_topic || ''
            },
            title: cc.name || 'Custom FC'
        });
        outputY += ROW_GAP;
    });

    // ── Protocol metadata (header info) ──────────────────────
    const metadata = {
        id: doc.id || 'unknown',
        type: doc.type || 'sensor',
        bus: doc.bus || 'unknown',
        enabled: doc.enabled !== false,
        port: doc.port || '',
        baud: doc.baud || 0
    };
    if (doc.modbus) {
        metadata.slave_id = doc.modbus.slave_id || 1;
    }

    return { nodes, connections, metadata };
}

// ── Helpers ──────────────────────────────────────────────────

function formatHex(val) {
    if (val === undefined || val === null) return '0x0000';
    if (typeof val === 'string') return val;
    return '0x' + val.toString(16).toUpperCase().padStart(4, '0');
}

function extractVarName(expr) {
    if (!expr) return null;
    // Match ${varName} pattern
    const m = expr.match(/\$\{(\w+)\}/);
    if (m) return m[1];
    // Bare variable name (used in telemetry map values)
    if (/^\w+$/.test(expr)) return expr;
    return null;
}

/**
 * Simple YAML parser for flat RIVO protocol YAML.
 * Handles: scalars, arrays of objects, nested objects (2 levels).
 * Does NOT handle: multi-line strings, anchors, tags, flow mappings.
 */
function simpleYAMLParse(text) {
    const lines = text.split('\n');
    const result = {};
    let currentKey = null;
    let currentArray = null;
    let currentObj = null;
    let indent = 0;

    for (const rawLine of lines) {
        const line = rawLine.replace(/\r$/, '');
        if (/^\s*#/.test(line) || /^\s*$/.test(line)) continue;

        const spaces = line.match(/^(\s*)/)[1].length;
        const content = line.trim();

        // Array item
        if (content.startsWith('- ')) {
            if (currentArray !== null) {
                const item = content.substring(2);
                const kv = item.match(/^(\w+):\s*(.+)?$/);
                if (kv) {
                    currentObj = {};
                    currentObj[kv[1]] = parseValue(kv[2] || '');
                    currentArray.push(currentObj);
                } else {
                    currentArray.push(parseValue(item));
                    currentObj = null;
                }
            }
            continue;
        }

        // Key: value pair
        const kv = content.match(/^([\w.]+):\s*(.*)$/);
        if (kv) {
            const key = kv[1];
            const val = kv[2];

            if (spaces === 0) {
                // Top-level key
                if (val === '' || val === undefined) {
                    result[key] = {};
                    currentKey = key;
                    currentArray = null;
                    currentObj = null;
                    indent = spaces;
                } else {
                    result[key] = parseValue(val);
                    currentKey = null;
                    currentArray = null;
                }
            } else if (currentObj && spaces > indent + 2) {
                // Property of current array item
                currentObj[key] = parseValue(val || '');
            } else if (currentKey) {
                if (val === '' || val === undefined) {
                    // Nested object or start of array
                    if (typeof result[currentKey] === 'object' && !Array.isArray(result[currentKey])) {
                        result[currentKey][key] = {};
                    }
                } else if (val.startsWith('[') && val.endsWith(']')) {
                    // Inline array
                    const inner = val.slice(1, -1).split(',').map(s => parseValue(s.trim()));
                    if (typeof result[currentKey] === 'object') {
                        result[currentKey][key] = inner;
                    }
                } else {
                    if (typeof result[currentKey] === 'object' && !Array.isArray(result[currentKey])) {
                        result[currentKey][key] = parseValue(val);
                    }
                }
            }

            // Detect upcoming array
            if ((val === '' || val === undefined) && spaces >= 0) {
                // Check if next line starts with -
                const nextIdx = lines.indexOf(rawLine) + 1;
                if (nextIdx < lines.length && lines[nextIdx].trim().startsWith('- ')) {
                    if (spaces === 0) {
                        result[key] = [];
                        currentArray = result[key];
                        currentKey = key;
                        indent = spaces;
                    } else if (currentKey && typeof result[currentKey] === 'object') {
                        result[currentKey][key] = [];
                        currentArray = result[currentKey][key];
                        indent = spaces;
                    }
                }
            }
        }
    }
    return result;
}

function parseValue(s) {
    if (s === undefined || s === null) return '';
    s = s.trim();
    // Remove quotes
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
        return s.slice(1, -1);
    }
    if (s === 'true') return true;
    if (s === 'false') return false;
    if (s === 'null' || s === '~') return null;
    if (/^-?\d+$/.test(s)) return parseInt(s, 10);
    if (/^-?\d+\.\d+$/.test(s)) return parseFloat(s);
    if (/^0x[0-9a-fA-F]+$/.test(s)) return parseInt(s, 16);
    return s;
}

// Export
if (typeof window !== 'undefined') {
    window.parseYAMLToGraph = parseYAMLToGraph;
}
if (typeof module !== 'undefined') {
    module.exports = { parseYAMLToGraph };
}
