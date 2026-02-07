/**
 * RIVO Simple Node Editor - Lightweight node-based editor with connection ports
 * No external dependencies required
 */

class SimpleNodeEditor {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.connections = [];
        this.selectedNode = null;
        this.isDragging = false;
        this.isConnecting = false;
        this.isPanning = false;
        this.connectionStart = null;
        this.connectionEnd = null;
        this.dragOffset = { x: 0, y: 0 };
        this.dragStart = null;
        this.dragged = false;
        this.dragThreshold = 3;
        this.viewOffset = { x: 0, y: 0 };
        this.panStart = null;
        this.viewStart = null;
        this.nextNodeId = 1;

        // Callback for canvas changes (to update YAML)
        this.onCanvasChange = options.onCanvasChange || null;

        this.setupCanvas();
        this.setupEventListeners();
        this.render();
    }

    setupCanvas() {
        // Set canvas size
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('dblclick', this.onDoubleClick.bind(this));

        // Context menu for deleting connections
        this.canvas.addEventListener('contextmenu', this.onContextMenu.bind(this));

        // Keyboard events for deletion
        this.canvas.setAttribute('tabindex', '0'); // Make canvas focusable
        this.canvas.addEventListener('keydown', this.onKeyDown.bind(this));

        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.render();
        });
    }

    addNode(type, position) {
        const node = {
            id: this.nextNodeId++,
            type: type,
            x: position.x,
            y: position.y,
            width: 200,
            height: 100,
            properties: this.getDefaultProperties(type),
            title: this.getNodeTitle(type),
            inputs: this.getNodeInputs(type),
            outputs: this.getNodeOutputs(type)
        };
        this.nodes.push(node);
        this.render();

        // Trigger change callback
        if (this.onCanvasChange) this.onCanvasChange();

        return node;
    }

    screenToWorld(x, y) {
        return {
            x: x - this.viewOffset.x,
            y: y - this.viewOffset.y
        };
    }

    getNodeInputs(type) {
        const inputs = {
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
        return inputs[type] || [];
    }

    getNodeOutputs(type) {
        const outputs = {
            'input/sensor': ['value'],
            'input/constant': ['value'],
            'input/modbus_sensor': ['value'],
            'input/analog_sensor': ['value'],
            'process/calibration': ['result'],
            'process/math': ['result'],
            'process/binary_op': ['result'],
            'process/bit_shift': ['result'],
            'process/bit_mask': ['result'],
            'output/status': [],
            'output/telemetry': []
        };
        return outputs[type] || [];
    }

    getDefaultProperties(type) {
        const defaults = {
            'input/sensor': {
                bus: 'i2c',
                address: '0x76',
                register: '0xFA',
                length: 3,
                decoder: 'raw_to_int',
                variable_name: 'raw_temp'
            },
            'input/modbus_sensor': {
                bus: 'modbus-rtu',
                address: '0x01',
                function_code: '0x03',
                register: '0x0001',
                length: 2,
                decoder: 'modbus_float32_be',
                variable_name: 'sensor_value'
            },
            'input/analog_sensor': {
                bus: 'analog',
                adc_address: '0x48',
                adc_channel: 0,
                current_range: '4-20mA',
                decoder: 'raw_to_int',
                variable_name: 'analog_value'
            },
            'input/constant': {
                name: 'const_1',
                value: 0
            },
            'process/calibration': {
                expression: '$input * 1.0',
                description: ''
            },
            'process/math': {
                function: 'abs',
                parameter: 0
            },
            'process/binary_op': {
                operation: '+',
                input_a_name: 'a',
                input_b_name: 'b'
            },
            'process/bit_shift': {
                operation: '<<',
                shift_bits: 0
            },
            'process/bit_mask': {
                mask: '0xFF',
                operation: '&'
            },
            'output/status': {
                sensor_id: 'sensor_1',
                sensor_type: 'Sensor',
                unit: '°C'
            },
            'output/telemetry': {
                topic: '/topic',
                field: 'data'
            }
        };
        return defaults[type] || {};
    }

    getNodeTitle(type) {
        // Use i18n for node titles
        const i18nKeys = {
            'input/sensor': 'protocolCreator.nodeTypes.sensorInput',
            'input/modbus_sensor': 'protocolCreator.nodeTypes.modbusSensor',
            'input/analog_sensor': 'protocolCreator.nodeTypes.analogSensor',
            'input/constant': 'protocolCreator.nodeTypes.constant',
            'process/calibration': 'protocolCreator.nodeTypes.calibration',
            'process/math': 'protocolCreator.nodeTypes.mathFunction',
            'process/binary_op': 'protocolCreator.nodeTypes.binaryOp',
            'process/bit_shift': 'protocolCreator.nodeTypes.bitShift',
            'process/bit_mask': 'protocolCreator.nodeTypes.bitMask',
            'output/status': 'protocolCreator.nodeTypes.statusOutput',
            'output/telemetry': 'protocolCreator.nodeTypes.telemetryOutput'
        };

        // Try i18n first
        if (window.I18n && i18nKeys[type]) {
            const translation = I18n.t(i18nKeys[type]);
            if (translation !== i18nKeys[type]) {
                return translation;
            }
        }

        // Fallback English titles
        const fallbackTitles = {
            'input/sensor': 'Sensor Input (I2C/UART)',
            'input/modbus_sensor': 'Modbus Sensor',
            'input/analog_sensor': 'Analog Sensor (4-20mA)',
            'input/constant': 'Constant',
            'process/calibration': 'Calibration',
            'process/math': 'Math Function',
            'process/binary_op': 'Binary Operation',
            'process/bit_shift': 'Bit Shift',
            'process/bit_mask': 'Bit Mask',
            'output/status': 'Status Output',
            'output/telemetry': 'Telemetry Output'
        };
        return fallbackTitles[type] || 'Node';
    }

    getPropertyLabel(key) {
        const i18nKey = `protocolCreator.propertyEditor.fields.${key}`;
        if (window.I18n) {
            const translation = I18n.t(i18nKey);
            if (translation !== i18nKey) {
                return translation;
            }
        }
        return key.replace(/_/g, ' ');
    }

    getPortPosition(node, portIndex, isInput) {
        const portY = node.y + 40 + (portIndex * 20);
        const portX = isInput ? node.x : node.x + node.width;
        return { x: portX, y: portY };
    }

    hitTestPort(x, y, node, portIndex, isInput) {
        const pos = this.getPortPosition(node, portIndex, isInput);
        const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
        return dist < 8;
    }

    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const { x, y } = this.screenToWorld(screenX, screenY);

        // Focus canvas for keyboard events
        this.canvas.focus({ preventScroll: true });

        // Check if clicking on output ports (to start connection)
        for (let node of this.nodes) {
            for (let i = 0; i < node.outputs.length; i++) {
                if (this.hitTestPort(x, y, node, i, false)) {
                this.isConnecting = true;
                this.connectionStart = { node: node, portIndex: i, isInput: false };
                    this.connectionEnd = { x, y };
                    return;
                }
            }
        }

        // Check if clicking on a node
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            const node = this.nodes[i];
            if (x >= node.x && x <= node.x + node.width &&
                y >= node.y && y <= node.y + node.height) {
                this.selectedNode = node;
                this.isDragging = true;
                this.dragOffset = {
                    x: x - node.x,
                    y: y - node.y
                };
                this.dragStart = { x, y };
                this.dragged = false;
                this.render();
                return;
            }
        }

        // Start panning if clicking on empty canvas
        if (e.button === 0) {
            this.isPanning = true;
            this.panStart = { x: screenX, y: screenY };
            this.viewStart = { x: this.viewOffset.x, y: this.viewOffset.y };
        }
    }

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const { x, y } = this.screenToWorld(screenX, screenY);

        if (this.isConnecting) {
            this.connectionEnd = { x, y };
            this.render();
        } else if (this.isDragging && this.selectedNode) {
            const dx = x - (this.dragStart ? this.dragStart.x : x);
            const dy = y - (this.dragStart ? this.dragStart.y : y);
            if (!this.dragged && Math.hypot(dx, dy) > this.dragThreshold) {
                this.dragged = true;
            }
            this.selectedNode.x = x - this.dragOffset.x;
            this.selectedNode.y = y - this.dragOffset.y;
            this.render();
        } else if (this.isPanning && this.panStart && this.viewStart) {
            this.viewOffset.x = this.viewStart.x + (screenX - this.panStart.x);
            this.viewOffset.y = this.viewStart.y + (screenY - this.panStart.y);
            this.render();
        }
    }

    onMouseUp(e) {
        let changed = false;

        if (this.isConnecting) {
            const rect = this.canvas.getBoundingClientRect();
            const screenX = e.clientX - rect.left;
            const screenY = e.clientY - rect.top;
            const { x, y } = this.screenToWorld(screenX, screenY);

            // Check if released on an input port
            for (let node of this.nodes) {
                for (let i = 0; i < node.inputs.length; i++) {
                    if (this.hitTestPort(x, y, node, i, true)) {
                        // Create connection
                        this.connections.push({
                            from: this.connectionStart.node.id,
                            fromPort: this.connectionStart.portIndex,
                            to: node.id,
                            toPort: i
                        });
                        changed = true;
                        break;
                    }
                }
            }

            this.isConnecting = false;
            this.connectionStart = null;
            this.connectionEnd = null;
            this.render();
        }

        if (this.isDragging) {
            this.isDragging = false;
            if (this.dragged) {
                changed = true;
            } else if (this.selectedNode) {
                this.openPropertyEditor(this.selectedNode);
            }
        }

        if (this.isPanning) {
            this.isPanning = false;
            this.panStart = null;
            this.viewStart = null;
        }

        // Trigger change callback if structure changed
        if (changed && this.onCanvasChange) {
            this.onCanvasChange();
        }
    }

    onDoubleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const { x, y } = this.screenToWorld(screenX, screenY);

        // Check if double-clicking on a node
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            const node = this.nodes[i];
            if (x >= node.x && x <= node.x + node.width &&
                y >= node.y && y <= node.y + node.height) {
                this.openPropertyEditor(node);
                return;
            }
        }
    }

    openPropertyEditor(node) {
        if (typeof propertyEditor !== 'undefined' && propertyEditor) {
            propertyEditor.open(node);
        }
    }

    onContextMenu(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const { x, y } = this.screenToWorld(screenX, screenY);

        // Check if clicking on any port to remove connections
        for (let node of this.nodes) {
            // Check input ports
            for (let i = 0; i < node.inputs.length; i++) {
                if (this.hitTestPort(x, y, node, i, true)) {
                    this.removeConnectionsToPort(node.id, i, true);
                    return;
                }
            }
            // Check output ports
            for (let i = 0; i < node.outputs.length; i++) {
                if (this.hitTestPort(x, y, node, i, false)) {
                    this.removeConnectionsToPort(node.id, i, false);
                    return;
                }
            }
        }
    }

    onKeyDown(e) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (this.selectedNode) {
                this.deleteSelectedNode();
            }
        }
    }

    deleteSelectedNode() {
        if (!this.selectedNode) return;

        // Remove connections associated with this node
        this.connections = this.connections.filter(conn =>
            conn.from !== this.selectedNode.id && conn.to !== this.selectedNode.id
        );

        // Remove the node
        this.nodes = this.nodes.filter(node => node.id !== this.selectedNode.id);
        this.selectedNode = null;
        this.render();

        // Trigger change callback
        if (this.onCanvasChange) this.onCanvasChange();
    }

    removeConnectionsToPort(nodeId, portIndex, isInput) {
        const initialLength = this.connections.length;

        if (isInput) {
            this.connections = this.connections.filter(conn =>
                !(conn.to === nodeId && conn.toPort === portIndex)
            );
        } else {
            this.connections = this.connections.filter(conn =>
                !(conn.from === nodeId && conn.fromPort === portIndex)
            );
        }
        this.render();

        // Trigger change callback if connections removed
        if (this.connections.length !== initialLength && this.onCanvasChange) {
            this.onCanvasChange();
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#F5F5F5';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.drawGrid();

        this.ctx.save();
        this.ctx.translate(this.viewOffset.x, this.viewOffset.y);

        // Draw connections
        this.connections.forEach(conn => this.drawConnection(conn));

        // Draw temporary connection while dragging
        if (this.isConnecting && this.connectionStart && this.connectionEnd) {
            const startPos = this.getPortPosition(
                this.connectionStart.node,
                this.connectionStart.portIndex,
                false
            );
            this.drawWire(startPos.x, startPos.y, this.connectionEnd.x, this.connectionEnd.y, '#737373');
        }

        // Draw nodes
        this.nodes.forEach(node => this.drawNode(node));

        this.ctx.restore();
    }

    drawGrid() {
        const gridSize = 20;
        this.ctx.strokeStyle = '#E5E5E5';
        this.ctx.lineWidth = 1;

        const offsetX = ((this.viewOffset.x % gridSize) + gridSize) % gridSize;
        const offsetY = ((this.viewOffset.y % gridSize) + gridSize) % gridSize;

        for (let x = -offsetX; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = -offsetY; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawNode(node) {
        const isSelected = node === this.selectedNode;

        // Node background
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(node.x, node.y, node.width, node.height);

        // Node border
        this.ctx.strokeStyle = isSelected ? '#000000' : '#E5E5E5';
        this.ctx.lineWidth = isSelected ? 2 : 1;
        this.ctx.strokeRect(node.x, node.y, node.width, node.height);

        // Node title bar
        this.ctx.fillStyle = isSelected ? '#000000' : '#FAFAFA';
        this.ctx.fillRect(node.x, node.y, node.width, 30);

        // Title border
        this.ctx.strokeStyle = '#E5E5E5';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(node.x, node.y + 30);
        this.ctx.lineTo(node.x + node.width, node.y + 30);
        this.ctx.stroke();

        // Title text
        this.ctx.fillStyle = isSelected ? '#FFFFFF' : '#000000';
        this.ctx.font = '600 12px "Public Sans", sans-serif';
        this.ctx.fillText(node.title, node.x + 10, node.y + 19);

        // Draw input ports
        node.inputs.forEach((inputName, index) => {
            const pos = this.getPortPosition(node, index, true);
            this.drawPort(pos.x, pos.y, true);

            // Input label
            this.ctx.fillStyle = '#737373';
            this.ctx.font = '400 10px "Space Mono", monospace';
            this.ctx.fillText(inputName, node.x + 15, pos.y + 4);
        });

        // Draw output ports
        node.outputs.forEach((outputName, index) => {
            const pos = this.getPortPosition(node, index, false);
            this.drawPort(pos.x, pos.y, false);

            // Output label
            this.ctx.fillStyle = '#737373';
            this.ctx.font = '400 10px "Space Mono", monospace';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(outputName, node.x + node.width - 15, pos.y + 4);
            this.ctx.textAlign = 'left';
        });

        // Node properties text
        this.ctx.fillStyle = '#737373';
        this.ctx.font = '400 10px "Space Mono", monospace';
        let yOffset = 65;
        const props = Object.entries(node.properties).slice(0, 1);
        props.forEach(([key, value]) => {
            const label = this.getPropertyLabel(key);
            const text = `${label}: ${value}`;
            if (text.length > 25) {
                this.ctx.fillText(text.substring(0, 22) + '...', node.x + 10, node.y + yOffset);
            } else {
                this.ctx.fillText(text, node.x + 10, node.y + yOffset);
            }
            yOffset += 12;
        });
    }

    drawPort(x, y, isInput) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 6, 0, Math.PI * 2);
        this.ctx.fillStyle = isInput ? '#3B82F6' : '#22C55E';
        this.ctx.fill();
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawWire(x1, y1, x2, y2, color = '#000000') {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);

        // Bezier curve for smooth connection
        const cp1x = x1 + (x2 - x1) / 2;
        const cp1y = y1;
        const cp2x = x1 + (x2 - x1) / 2;
        const cp2y = y2;

        this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
        this.ctx.stroke();
    }

    drawConnection(conn) {
        const fromNode = this.nodes.find(n => n.id === conn.from);
        const toNode = this.nodes.find(n => n.id === conn.to);

        if (!fromNode || !toNode) return;

        const fromPos = this.getPortPosition(fromNode, conn.fromPort || 0, false);
        const toPos = this.getPortPosition(toNode, conn.toPort || 0, true);

        this.drawWire(fromPos.x, fromPos.y, toPos.x, toPos.y, '#000000');
    }

    connectNodes(fromNodeId, fromPortName, toNodeId, toPortName) {
        const fromNode = this.nodes.find(n => n.id === fromNodeId);
        const toNode = this.nodes.find(n => n.id === toNodeId);

        if (!fromNode || !toNode) return;

        const fromPortIndex = fromNode.outputs.indexOf(fromPortName);
        const toPortIndex = toNode.inputs.indexOf(toPortName);

        if (fromPortIndex !== -1 && toPortIndex !== -1) {
            this.connections.push({
                from: fromNodeId,
                fromPort: fromPortIndex,
                to: toNodeId,
                toPort: toPortIndex
            });
            this.render();
        }
    }

    connect(fromNodeId, toNodeId) {
        this.connections.push({ from: fromNodeId, to: toNodeId });
        this.render();
    }

    clearAll() {
        this.nodes = [];
        this.connections = [];
        this.selectedNode = null;
        this.nextNodeId = 1;
        this.render();
    }

    getNodes() {
        return this.nodes;
    }

    getConnections() {
        return this.connections;
    }
}
