/**
 * RIVO Simple Node Editor - Lightweight node-based editor with connection ports
 * No external dependencies required
 */

class SimpleNodeEditor {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.connections = [];
        this.selectedNode = null;
        this.isDragging = false;
        this.isConnecting = false;
        this.connectionStart = null;
        this.connectionEnd = null;
        this.dragOffset = { x: 0, y: 0 };
        this.nextNodeId = 1;

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
        return node;
    }

    getNodeInputs(type) {
        const inputs = {
            'input/sensor': [],
            'input/constant': [],
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
                register: '0xFA',
                length: 3,
                decoder: 'bme280_temp',
                variable_name: 'raw_temp'
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
        const titles = {
            'input/sensor': '感測器輸入',
            'input/constant': '常數',
            'process/calibration': '校正運算',
            'process/math': '數學函數',
            'process/binary_op': '二元運算',
            'process/bit_shift': '位元位移',
            'process/bit_mask': '位元遮罩',
            'output/status': '狀態輸出',
            'output/telemetry': '遙測輸出'
        };
        return titles[type] || 'Node';
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
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

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
                this.render();
                return;
            }
        }
    }

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.isConnecting) {
            this.connectionEnd = { x, y };
            this.render();
        } else if (this.isDragging && this.selectedNode) {
            this.selectedNode.x = x - this.dragOffset.x;
            this.selectedNode.y = y - this.dragOffset.y;
            this.render();
        }
    }

    onMouseUp(e) {
        if (this.isConnecting) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

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
                        break;
                    }
                }
            }

            this.isConnecting = false;
            this.connectionStart = null;
            this.connectionEnd = null;
            this.render();
        }

        this.isDragging = false;
    }

    onDoubleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if double-clicking on a node
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            const node = this.nodes[i];
            if (x >= node.x && x <= node.x + node.width &&
                y >= node.y && y <= node.y + node.height) {
                // Open property editor if available
                if (typeof propertyEditor !== 'undefined') {
                    propertyEditor.open(node);
                }
                return;
            }
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#F5F5F5';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.drawGrid();

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
    }

    drawGrid() {
        const gridSize = 20;
        this.ctx.strokeStyle = '#E5E5E5';
        this.ctx.lineWidth = 1;

        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y < this.canvas.height; y += gridSize) {
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
            const text = `${key}: ${value}`;
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
