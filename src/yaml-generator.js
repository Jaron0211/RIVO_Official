/**
 * Enhanced YAML Generation for RIVO Visual Protocol Editor
 * Handles all node types including calibration chains and output mappings
 */

function generateEnhancedYAML(graph) {
    const nodes = graph._nodes || [];
    const links = graph.links || {};

    // Basic validation
    if (nodes.length === 0) {
        return { error: '請先添加節點' };
    }

    const NODE_INPUTS = {
        'input/sensor': [],
        'input/constant': [],
        'input/modbus_sensor': [],
        'input/analog_sensor': [],
        'process/calibration': ['input'],
        'process/math': ['input'],
        'process/binary_op': ['a', 'b'],
        'process/bit_shift': ['input'],
        'process/bit_mask': ['input'],
        'output/status': ['value'],
        'output/telemetry': ['value']
    };

    // Categorize nodes
    const sensorNodes = nodes.filter(n => n.type === 'input/sensor');
    const outputStatusNodes = nodes.filter(n => n.type === 'output/status');
    const outputTelemetryNodes = nodes.filter(n => n.type === 'output/telemetry');

    if (sensorNodes.length === 0) {
        return { error: '至少需要一個感測器輸入節點' };
    }

    const nodesById = new Map(nodes.map(node => [node.id, node]));
    const incoming = {};

    Object.values(links).forEach(link => {
        if (!link) return;
        if (!incoming[link.target_id]) incoming[link.target_id] = [];
        incoming[link.target_id].push({
            origin_id: link.origin_id,
            origin_port: link.origin_port,
            target_port: link.target_port
        });
    });

    const constants = new Map();
    const calibrations = [];
    const calibrationNames = new Map();
    const valueCache = new Map();
    let calibrationIndex = 1;

    nodes.filter(n => n.type === 'input/constant').forEach(node => {
        const props = node.properties || {};
        const constName = props.name || `const_${node.id}`;
        if (!constants.has(constName)) {
            constants.set(constName, props.value ?? 0);
        }
    });

    function getIncomingLink(nodeId, portIndex) {
        const linksForNode = incoming[nodeId] || [];
        if (portIndex !== undefined && portIndex !== null) {
            const match = linksForNode.find(l => l.target_port === portIndex);
            if (match) return match;
            if (linksForNode.length > portIndex) return linksForNode[portIndex];
        }
        return linksForNode[0] || null;
    }

    function getCalibrationName(nodeId) {
        if (!calibrationNames.has(nodeId)) {
            calibrationNames.set(nodeId, `calib_${calibrationIndex++}`);
        }
        return calibrationNames.get(nodeId);
    }

    function resolveInputVar(nodeId, portIndex) {
        const link = getIncomingLink(nodeId, portIndex);
        if (!link) return '';
        return resolveNodeValue(link.origin_id);
    }

    function resolveNodeValue(nodeId) {
        if (valueCache.has(nodeId)) return valueCache.get(nodeId);
        const node = nodesById.get(nodeId);
        if (!node) return '';

        let value = '';
        const props = node.properties || {};

        switch (node.type) {
            case 'input/sensor':
                value = props.variable_name || `var_${nodeId}`;
                break;
            case 'input/constant': {
                const constName = props.name || `const_${nodeId}`;
                if (!constants.has(constName)) {
                    constants.set(constName, props.value ?? 0);
                }
                value = constName;
                break;
            }
            case 'process/calibration': {
                const inputVar = resolveInputVar(nodeId, 0);
                const name = getCalibrationName(nodeId);
                calibrations.push({
                    name,
                    input: inputVar || 'input',
                    expr: props.expression || '$input',
                    description: props.description || ''
                });
                value = name;
                break;
            }
            case 'process/math': {
                const inputVar = resolveInputVar(nodeId, 0);
                const name = getCalibrationName(nodeId);
                const fn = props.function || 'abs';
                const paramVal = Number(props.parameter);
                const hasParam = Number.isFinite(paramVal) && props.parameter !== '';
                const expr = fn === 'pow' && hasParam ? `pow($input, ${paramVal})` : `${fn}($input)`;
                calibrations.push({
                    name,
                    input: inputVar || 'input',
                    expr
                });
                value = name;
                break;
            }
            case 'process/binary_op': {
                const inputA = resolveInputVar(nodeId, 0);
                const inputB = resolveInputVar(nodeId, 1);
                const name = getCalibrationName(nodeId);
                const aKey = (props.input_a_name || 'a').trim() || 'a';
                const bKey = (props.input_b_name || 'b').trim() || 'b';
                const op = props.operation || '+';
                const inputs = {};
                if (inputA) inputs[aKey] = inputA;
                if (inputB) inputs[bKey] = inputB;
                const expr = `$${aKey} ${op} $${bKey}`;
                calibrations.push({
                    name,
                    inputs,
                    expr
                });
                value = name;
                break;
            }
            case 'process/bit_shift': {
                const inputVar = resolveInputVar(nodeId, 0);
                const name = getCalibrationName(nodeId);
                const op = props.operation === '>>' ? '>>' : '<<';
                const shiftBits = Number(props.shift_bits) || 0;
                calibrations.push({
                    name,
                    input: inputVar || 'input',
                    expr: `$input ${op} ${shiftBits}`
                });
                value = name;
                break;
            }
            case 'process/bit_mask': {
                const inputVar = resolveInputVar(nodeId, 0);
                const name = getCalibrationName(nodeId);
                const op = props.operation || '&';
                const mask = props.mask || '0xFF';
                calibrations.push({
                    name,
                    input: inputVar || 'input',
                    expr: `$input ${op} ${mask}`
                });
                value = name;
                break;
            }
            default:
                value = '';
                break;
        }

        valueCache.set(nodeId, value);
        return value;
    }

    function resolveSourceVar(nodeId) {
        const link = getIncomingLink(nodeId, 0);
        if (!link) return '';
        return resolveNodeValue(link.origin_id);
    }

    function wrapValue(varName) {
        if (!varName) return '';
        return `\${${varName}}`;
    }

    // Get bus and address from first sensor node (assuming single device context)
    const primarySensor = sensorNodes[0];
    const protocolBus = primarySensor ? (primarySensor.properties.bus || "i2c") : "i2c";
    const protocolAddress = primarySensor ? (primarySensor.properties.address || "0x76") : "0x76";

    // Build YAML
    let yaml = "# RIVO Node Protocol - Generated from Visual Editor\n\n";
    yaml += "id: \"generated-protocol\"\n";
    yaml += "type: \"sensor\"\n";
    yaml += `bus: "${protocolBus}"\n`;
    yaml += `address: "${protocolAddress}"\n\n`;

    // Identification section
    yaml += "identify:\n";
    yaml += "  whoami_reg: \"0xD0\"\n";
    yaml += "  whoami_value: \"0x60\"\n\n";

    // Read section
    yaml += "read:\n";
    yaml += "  interval_ms: 500\n";
    yaml += "  registers:\n";

    sensorNodes.forEach(node => {
        const props = node.properties || {};
        yaml += `    - name: "${props.variable_name || 'raw_value'}"\n`;
        yaml += `      reg: "${props.register || '0x00'}"\n`;
        yaml += `      len: ${props.length || 1}\n`;
        yaml += `      decode: "${props.decoder || 'raw_to_int'}"\n`;
    });

    // Constants section
    if (constants.size > 0) {
        yaml += "\nconstants:\n";
        constants.forEach((value, name) => {
            yaml += `  ${name}: ${value}\n`;
        });
    }

    // Calibration section
    if (calibrations.length > 0) {
        yaml += "\ncalibrate:\n";
        calibrations.forEach(entry => {
            yaml += `  ${entry.name}:\n`;
            if (entry.input) {
                yaml += `    input: "${entry.input}"\n`;
            }
            if (entry.inputs && Object.keys(entry.inputs).length > 0) {
                yaml += "    inputs:\n";
                Object.entries(entry.inputs).forEach(([key, value]) => {
                    yaml += `      ${key}: "${value}"\n`;
                });
            }
            yaml += `    expr: "${entry.expr}"\n`;
            if (entry.description) {
                yaml += `    # ${entry.description}\n`;
            }
        });
    }

    // Map section  
    yaml += "\nmap:\n";

    // Status mapping
    if (outputStatusNodes.length > 0) {
        yaml += "  status:\n";
        yaml += "    sensor_overview:\n";
        outputStatusNodes.forEach(node => {
            const props = node.properties || {};
            const dataSource = resolveSourceVar(node.id);
            yaml += `      - sensor_id: "${props.sensor_id || 'sensor_1'}"\n`;
            yaml += `        sensor_type: "${props.sensor_type || 'Sensor'}"\n`;
            yaml += `        value: "${wrapValue(dataSource)}"\n`;
            if (props.unit) {
                yaml += `        unit: "${props.unit}"\n`;
            }
        });
    } else {
        yaml += "  status:\n";
        yaml += "    sensor_overview: []\n";
    }

    // Telemetry mapping
    if (outputTelemetryNodes.length > 0) {
        yaml += "  telemetry:\n";
        const telemetryGroups = {};
        outputTelemetryNodes.forEach(node => {
            const props = node.properties || {};
            const topic = props.topic || '/topic';
            const field = props.field || 'value';
            const dataSource = resolveSourceVar(node.id);
            if (!telemetryGroups[topic]) telemetryGroups[topic] = {};
            telemetryGroups[topic][field] = wrapValue(dataSource);
        });

        Object.entries(telemetryGroups).forEach(([topic, fields]) => {
            yaml += `    "${topic}":\n`;
            Object.entries(fields).forEach(([field, value]) => {
                yaml += `      ${field}: "${value}"\n`;
            });
        });
    } else {
        yaml += "  telemetry: {}\n";
    }

    return { yaml };
}
