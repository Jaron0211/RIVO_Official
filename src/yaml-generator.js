/**
 * Enhanced YAML Generation for RIVO Visual Protocol Editor
 * Handles all node types including calibration chains and output mappings
 */

function generateEnhancedYAML(graph) {
    const nodes = graph._nodes;
    const links = graph.links;

    // Basic validation
    if (nodes.length === 0) {
        return { error: '請先添加節點' };
    }

    // Categorize nodes
    const sensorNodes = nodes.filter(n => n.type === 'input/sensor');
    const constantNodes = nodes.filter(n => n.type === 'input/constant');
    const calibrationNodes = nodes.filter(n => n.type === 'process/calibration');
    const outputStatusNodes = nodes.filter(n => n.type === 'output/status');
    const outputTelemetryNodes = nodes.filter(n => n.type === 'output/telemetry');

    if (sensorNodes.length === 0) {
        return { error: '至少需要一個感測器輸入節點' };
    }

    // Helper function to find connected source node
    function findSourceNode(targetNodeId) {
        const inputLinks = Object.values(links).filter(l => l && l.target_id === targetNodeId);
        if (inputLinks.length > 0) {
            return nodes.find(n => n.id === inputLinks[0].origin_id);
        }
        return null;
    }

    // Build YAML
    let yaml = "# RIVO Node Protocol - Generated from Visual Editor\n\n";
    yaml += "id: \"generated-protocol\"\n";
    yaml += "type: \"sensor\"\n";
    yaml += "bus: \"i2c\"\n";
    yaml += "address: \"0x76\"\n\n";

    // Identification section
    yaml += "identify:\n";
    yaml += "  whoami_reg: \"0xD0\"\n";
    yaml += "  whoami_value: \"0x60\"\n\n";

    // Read section
    yaml += "read:\n";
    yaml += "  interval_ms: 500\n";
    yaml += "  registers:\n";

    sensorNodes.forEach(node => {
        yaml += `    - name: "${node.properties.variable_name}"\n`;
        yaml += `      reg: "${node.properties.register}"\n`;
        yaml += `      len: ${node.properties.length}\n`;
        yaml += `      decode: "${node.properties.decoder}"\n`;
    });

    // Constants section
    if (constantNodes.length > 0) {
        yaml += "\nconstants:\n";
        constantNodes.forEach(node => {
            yaml += `  ${node.properties.name}: ${node.properties.value}\n`;
        });
    }

    // Calibration section
    if (calibrationNodes.length > 0) {
        yaml += "\ncalibrate:\n";
        calibrationNodes.forEach((node, idx) => {
            const sourceNode = findSourceNode(node.id);
            if (sourceNode && sourceNode.type === 'input/sensor') {
                yaml += `  calib_${idx + 1}:\n`;
                yaml += `    input: "${sourceNode.properties.variable_name}"\n`;
                yaml += `    expr: "${node.properties.expression}"\n`;
                if (node.properties.description) {
                    yaml += `    # ${node.properties.description}\n`;
                }
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
            const sourceNode = findSourceNode(node.id);
            let dataSource = "";

            if (sourceNode) {
                if (sourceNode.type === 'input/sensor') {
                    dataSource = sourceNode.properties.variable_name;
                } else if (sourceNode.type === 'process/calibration') {
                    const calibIdx = calibrationNodes.indexOf(sourceNode);
                    dataSource = `calib_${calibIdx + 1}`;
                }
            }

            yaml += `      - id: "${node.properties.sensor_id}"\n`;
            yaml += `        type: "${node.properties.sensor_type}"\n`;
            yaml += `        source: "${dataSource}"\n`;
            if (node.properties.unit) {
                yaml += `        unit: "${node.properties.unit}"\n`;
            }
        });
    } else {
        yaml += "  status:\n";
        yaml += "    sensor_overview: []\n";
    }

    // Telemetry mapping
    if (outputTelemetryNodes.length > 0) {
        yaml += "  telemetry:\n";
        outputTelemetryNodes.forEach(node => {
            const sourceNode = findSourceNode(node.id);
            let dataSource = "";

            if (sourceNode) {
                if (sourceNode.type === 'input/sensor') {
                    dataSource = sourceNode.properties.variable_name;
                } else if (sourceNode.type === 'process/calibration') {
                    const calibIdx = calibrationNodes.indexOf(sourceNode);
                    dataSource = `calib_${calibIdx + 1}`;
                }
            }

            yaml += `    ${node.properties.topic}:\n`;
            yaml += `      ${node.properties.field}: "${dataSource}"\n`;
        });
    } else {
        yaml += "  telemetry: {}\n";
    }

    return { yaml };
}
