/**
 * RIVO YAML-to-Graph Reverse Parser
 * Converts a RIVO Node protocol YAML into node editor graph data.
 * Deterministic layout: inputs (left) → processing (center) → outputs (right).
 */

function parseYAMLToGraph(yamlText) {
    let doc;
    if (typeof jsyaml !== 'undefined') {
        try { doc = jsyaml.load(yamlText); } catch (e) { return { error: 'YAML parse error: ' + e.message }; }
    } else {
        // Fallback: use a regex-based extractor for key YAML sections
        doc = extractYAMLSections(yamlText);
    }
    if (!doc || typeof doc !== 'object') return { error: 'Invalid YAML document' };

    const nodes = [];
    const connections = [];
    let nextId = 1;
    const COL_INPUT = 60, COL_PROCESS = 340, COL_OUTPUT = 620;
    let inputY = 40, processY = 40, outputY = 40;
    const ROW_GAP = 160; // bigger gap for detailed nodes

    // Track variable → nodeId mapping for auto-connecting
    const varToNode = {};

    // ── Input Nodes ──────────────────────────────────────────

    // Modbus read_registers (new format)
    const readRegs = doc.read_registers || [];
    readRegs.forEach(reg => {
        const id = nextId++;
        const fc = reg.function === 'read_input' ? 'FC04 (Input)' : 'FC03 (Holding)';
        nodes.push({
            id, type: 'input/modbus_sensor',
            x: COL_INPUT, y: inputY,
            properties: {
                bus: doc.bus || 'modbus_rtu',
                address: formatHex(reg.address),
                function: fc,
                decode: reg.decode || 'uint16',
                scale: reg.scale || 1.0,
                unit: reg.unit || '',
                category: reg.category || 'sensor',
                telemetry_topic: reg.telemetry_topic || '',
                poll_interval_ms: reg.poll_interval_ms || ''
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
        const fcMap = { 'write_register': 'FC06', 'write_multiple': 'FC10', 'write_coil': 'FC05' };
        nodes.push({
            id, type: 'output/actuator_write',
            x: COL_OUTPUT, y: outputY,
            properties: {
                address: formatHex(wr.address),
                function: (fcMap[wr.function] || wr.function || 'FC06') + ' (' + (wr.function || 'write_register') + ')',
                decode: wr.decode || 'int16',
                scale: wr.scale || 1.0,
                unit: wr.unit || '',
                range_min: (wr.range && wr.range[0]) !== undefined ? wr.range[0] : '',
                range_max: (wr.range && wr.range[1]) !== undefined ? wr.range[1] : '',
                command_topic: wr.command_topic || ''
            },
            title: wr.name || 'Actuator Write'
        });
        outputY += ROW_GAP;
    });

    // Capabilities as fallback input nodes (when no read_registers/read.fields/modbus.registers exist)
    if (Object.keys(varToNode).length === 0 && Array.isArray(doc.capabilities)) {
        doc.capabilities.forEach(cap => {
            if (cap.category === 'actuator') return; // actuators go to output
            const id = nextId++;
            const busType = doc.bus || 'sensor';
            nodes.push({
                id, type: busType === 'modbus' || busType === 'modbus_rtu' ? 'input/modbus_sensor' : 'input/sensor',
                x: COL_INPUT, y: inputY,
                properties: {
                    bus: busType,
                    category: cap.category || 'sensor',
                    data_type: cap.data_type || 'float',
                    unit: cap.unit || '',
                    range_min: cap.range && cap.range[0] !== undefined ? cap.range[0] : '',
                    range_max: cap.range && cap.range[1] !== undefined ? cap.range[1] : '',
                    sample_interval_ms: cap.sample_interval_ms || '',
                    telemetry_topic: cap.telemetry_topic || ''
                },
                title: cap.name || 'Sensor'
            });
            varToNode[cap.name] = id;
            inputY += ROW_GAP;
        });
    }

    // Capabilities actuator entries as output nodes (when no write_registers exist)
    if (writeRegs.length === 0 && Array.isArray(doc.capabilities)) {
        doc.capabilities.filter(c => c.category === 'actuator').forEach(cap => {
            const id = nextId++;
            nodes.push({
                id, type: 'output/actuator_write',
                x: COL_OUTPUT, y: outputY,
                properties: {
                    name: cap.name || 'actuator',
                    unit: cap.unit || '',
                    command_topic: cap.command_topic || cap.telemetry_topic || ''
                },
                title: cap.name || 'Actuator'
            });
            outputY += ROW_GAP;
        });
    }

    // Custom commands (standalone command endpoints — no input port)
    const customCmds = doc.custom_commands || [];
    customCmds.forEach(cc => {
        const id = nextId++;
        const reqFields = (cc.request_fields || []).map(f => f.name).join(', ');
        nodes.push({
            id, type: 'output/actuator_write',
            x: COL_OUTPUT, y: outputY,
            _standalone: true, // mark as no-input command endpoint
            properties: {
                address: '0x' + (cc.function_code || 0).toString(16).toUpperCase(),
                function: 'Custom FC 0x' + (cc.function_code || 0).toString(16).toUpperCase(),
                decode: 'custom',
                command_topic: cc.command_topic || '',
                category: cc.category || 'actuator',
                request_fields: reqFields || '',
                description: cc.description || ''
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
 * extractYAMLSections — robust YAML parser using indentation-based recursive descent.
 * Handles nested objects, arrays of objects, inline arrays, and multi-level nesting.
 */
function extractYAMLSections(text) {
    const lines = text.split('\n').map(l => l.replace(/\r$/, ''));
    let pos = 0;

    function parseBlock(minIndent) {
        const result = {};
        while (pos < lines.length) {
            const line = lines[pos];
            if (/^\s*#/.test(line) || /^\s*$/.test(line)) { pos++; continue; }
            const indent = line.search(/\S/);
            if (indent < minIndent) break;
            const content = line.trim();

            // Array item at this level
            if (content.startsWith('- ')) {
                break; // let caller handle arrays
            }

            const kv = content.match(/^([\w_\-.\/]+):\s*(.*)$/);
            if (!kv) { pos++; continue; }

            const key = kv[1];
            const val = (kv[2] || '').trim();
            pos++;

            if (val === '' || val === undefined || val.length === 0) {
                // Check if next non-empty line is an array or nested object
                const nextContent = peekNextContent();
                if (nextContent && nextContent.trim().startsWith('- ')) {
                    result[key] = parseArray(indent + 2);
                } else {
                    result[key] = parseBlock(indent + 2);
                }
            } else if (val.startsWith('[') && val.endsWith(']')) {
                // Inline array: [0, 300]
                const inner = val.slice(1, -1).split(',').map(s => parseValue(s.trim()));
                result[key] = inner;
            } else {
                result[key] = parseValue(val);
            }
        }
        return result;
    }

    function parseArray(minIndent) {
        const arr = [];
        while (pos < lines.length) {
            const line = lines[pos];
            if (/^\s*#/.test(line) || /^\s*$/.test(line)) { pos++; continue; }
            const indent = line.search(/\S/);
            if (indent < minIndent - 2) break;
            const content = line.trim();
            if (!content.startsWith('- ')) break;

            // Array item
            const itemContent = content.substring(2).trim();
            const kv = itemContent.match(/^([\w_\-.\/]+):\s*(.*)$/);
            if (kv) {
                // Object item — parse remaining properties
                const obj = {};
                obj[kv[1]] = kv[2] ? parseValue(kv[2].trim()) : '';
                pos++;
                // Read continuation properties at deeper indent
                while (pos < lines.length) {
                    const nextLine = lines[pos];
                    if (/^\s*#/.test(nextLine) || /^\s*$/.test(nextLine)) { pos++; continue; }
                    const ni = nextLine.search(/\S/);
                    if (ni <= indent) break;
                    const nc = nextLine.trim();
                    if (nc.startsWith('- ')) break;
                    const nkv = nc.match(/^([\w_\-.\/]+):\s*(.*)$/);
                    if (nkv) {
                        const nval = (nkv[2] || '').trim();
                        if (nval === '') {
                            pos++;
                            const peekLine = peekNextContent();
                            if (peekLine && peekLine.trim().startsWith('- ')) {
                                obj[nkv[1]] = parseArray(ni + 4);
                            } else {
                                obj[nkv[1]] = parseBlock(ni + 2);
                            }
                        } else if (nval.startsWith('[') && nval.endsWith(']')) {
                            obj[nkv[1]] = nval.slice(1, -1).split(',').map(s => parseValue(s.trim()));
                            pos++;
                        } else {
                            obj[nkv[1]] = parseValue(nval);
                            pos++;
                        }
                    } else {
                        pos++;
                    }
                }
                arr.push(obj);
            } else {
                arr.push(parseValue(itemContent));
                pos++;
            }
        }
        return arr;
    }

    function peekNextContent() {
        for (let i = pos; i < lines.length; i++) {
            const l = lines[i].trim();
            if (l !== '' && !l.startsWith('#')) return lines[i];
        }
        return null;
    }

    return parseBlock(0);
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
