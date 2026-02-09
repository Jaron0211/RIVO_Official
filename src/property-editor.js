/**
 * Node Property Editor - Sidebar for editing node properties
 */

class NodePropertyEditor {
    constructor(editor, options = {}) {
        this.editor = editor;
        this.containerId = 'property-editor-container';
        this.currentNode = null;
        this.onSave = options.onSave || null;
        // Bind methods
        this.save = this.save.bind(this);
    }

    open(node) {
        this.currentNode = node;
        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.innerHTML = '';

        // Ensure the Node Detail tab is active
        if (window.switchSidebarTab) {
            window.switchSidebarTab('node-detail');
        }

        // Create form container
        const form = document.createElement('div');
        form.className = 'property-sidebar-form';

        // Generate fields based on node properties
        if (node.properties) {
            Object.entries(node.properties).forEach(([key, value]) => {
                const field = this.createField(key, value, node.type);
                form.appendChild(field);
            });
        }

        container.appendChild(form);

        // Add Auto-Save listener to all inputs
        const inputs = form.querySelectorAll('.property-input');
        inputs.forEach(input => {
            input.addEventListener('change', this.save);
            // Also save on input for text fields for smoother feel, or stick to change?
            // 'input' might be too aggressive for YAML generation, 'change' is better.
            if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
                input.addEventListener('blur', this.save);
            }
        });

        // Hide empty state message
        const emptyState = document.querySelector('.empty-state-message');
        if (emptyState) emptyState.style.display = 'none';

        // Refresh i18n
        if (window.I18n) {
            I18n.updateDOM();
        }
    }

    createField(key, value, nodeType) {
        const field = document.createElement('div');
        field.className = 'property-field';

        const label = document.createElement('label');
        label.textContent = this.getFieldLabel(key);
        field.appendChild(label);

        // Create appropriate input type
        const input = this.createInput(key, value, nodeType);
        input.dataset.propertyKey = key;
        field.appendChild(input);

        return field;
    }

    getFieldLabel(key) {
        // Use i18n if available, otherwise fall back to key
        const i18nKey = `protocolCreator.propertyEditor.fields.${key}`;
        if (window.I18n) {
            const translation = I18n.t(i18nKey);
            if (translation !== i18nKey) return translation;
        }
        // Fallback labels
        const fallbackLabels = {
            bus: 'Bus Type',
            address: 'Device Address',
            function_code: 'Function Code',
            register: 'Register Address',
            length: 'Read Length',
            decoder: 'Decoder',
            variable_name: 'Variable Name',
            adc_address: 'ADC Address',
            adc_channel: 'ADC Channel',
            current_range: 'Current Range',
            name: 'Constant Name',
            value: 'Value',
            expression: 'Expression',
            description: 'Description',
            function: 'Function',
            operation: 'Operation',
            input_a_name: 'Input A Name',
            input_b_name: 'Input B Name',
            parameter: 'Parameter',
            sensor_id: 'Sensor ID',
            sensor_type: 'Sensor Type',
            unit: 'Unit',
            topic: 'Topic',
            field: 'Field',
            shift_bits: 'Shift Bits',
            mask: 'Mask Value',
            direction: 'Direction'
        };
        return fallbackLabels[key] || key;
    }


    createInput(key, value, nodeType) {
        let input;

        // Special inputs for specific fields
        if (key === 'expression') {
            input = document.createElement('textarea');
            input.rows = 3;
            input.value = value;
            input.placeholder = 'e.g., ($input * 1.8) + 32';
        } else if (key === 'function') {
            input = document.createElement('select');
            ['abs', 'sqrt', 'pow', 'log', 'log10', 'exp', 'sin', 'cos', 'tan'].forEach(fn => {
                const option = document.createElement('option');
                option.value = fn;
                option.textContent = fn;
                option.selected = fn === value;
                input.appendChild(option);
            });
        } else if (key === 'operation') {
            input = document.createElement('select');
            ['+', '-', '*', '/', '%', 'pow', 'log', '<<', '>>', '&', '|', '^'].forEach(op => {
                const option = document.createElement('option');
                option.value = op;
                option.textContent = op;
                option.selected = op === value;
                input.appendChild(option);
            });
        } else if (key === 'bus') {
            input = document.createElement('select');
            const buses = [
                { val: 'i2c', label: 'I2C' },
                { val: 'uart', label: 'UART' },
                { val: 'rs485', label: 'RS485' },
                { val: 'modbus_rtu', label: 'Modbus RTU' },
                { val: 'modbus_ascii', label: 'Modbus ASCII' },
                { val: 'spi', label: 'SPI' },
                { val: 'analog', label: 'Analog (ADC)' }
            ];
            buses.forEach(b => {
                const option = document.createElement('option');
                option.value = b.val;
                option.textContent = b.label;
                option.selected = b.val === value;
                input.appendChild(option);
            });

            // Auto-update decoder based on bus type
            input.addEventListener('change', (e) => {
                const newBus = e.target.value;
                const decoderInput = document.querySelector(`[data-property-key="decoder"]`);
                if (decoderInput) {
                    let suggestedDecoder = '';
                    if (newBus === 'i2c' || newBus === 'spi') suggestedDecoder = 'int16_be';
                    else if (newBus.startsWith('modbus_') || newBus === 'uart' || newBus === 'rs485') suggestedDecoder = 'modbus_int16_be';
                    else if (newBus === 'analog') suggestedDecoder = 'raw_to_int';

                    if (suggestedDecoder) {
                        decoderInput.value = suggestedDecoder;
                        // Manually trigger change for property sync
                        const event = new Event('change');
                        decoderInput.dispatchEvent(event);
                    }
                }
            });
        } else if (key === 'decoder') {
            input = document.createElement('select');
            [
                'raw_to_int',
                'ieee754_float',
                'int8',
                'uint8',
                'int16_le',
                'int16_be',
                'uint16_le',
                'uint16_be',
                'int32_le',
                'int32_be',
                'uint32_le',
                'uint32_be',
                'float32',
                'modbus_int16_be',
                'modbus_uint16_be',
                'modbus_int32_be',
                'modbus_uint32_be',
                'modbus_float32_be',
                'bme280_temp',
                'bme280_press',
                'bme280_hum',
                'dht22_temp',
                'dht22_humidity'
            ].forEach(dec => {
                const option = document.createElement('option');
                option.value = dec;
                option.textContent = dec;
                option.selected = dec === value;
                input.appendChild(option);
            });
        } else if (key === 'length') {
            input = document.createElement('input');
            input.type = 'number';
            input.min = 1;
            input.max = 32;
            input.value = value;
        } else if (typeof value === 'number') {
            input = document.createElement('input');
            input.type = 'number';
            input.value = value;
            input.step = 'any';
        } else {
            input = document.createElement('input');
            input.type = 'text';
            input.value = value;
        }

        input.className = 'property-input';
        return input;
    }

    save() {
        if (!this.currentNode) return;

        const container = document.getElementById(this.containerId);
        const inputs = container.querySelectorAll('.property-input');

        inputs.forEach(input => {
            const key = input.dataset.propertyKey;
            let value = input.value;

            // Convert to appropriate type  
            if (input.type === 'number') {
                value = parseFloat(value);
                if (isNaN(value)) value = 0;
            }

            this.currentNode.properties[key] = value;
        });

        // Trigger Editor Update
        this.editor.render();

        // Notify parent
        if (this.onSave) {
            this.onSave();
        }
    }

    close() {
        // Clear selection or just empty the panel?
        // For sidebar, we might just want to show "Select a node"
        this.currentNode = null;
        const container = document.getElementById(this.containerId);
        if (container) container.innerHTML = '';

        const emptyState = document.querySelector('.empty-state-message');
        if (emptyState) emptyState.style.display = 'block';
    }
}
