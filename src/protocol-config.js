/**
 * RIVO Protocol Configuration - Handles protocol-specific configurations
 */

class ProtocolConfig {
    constructor() {
        this.protocols = {
            'i2c': {
                name: 'I2C',
                fields: [
                    { name: 'address', label: 'I2C 位址', type: 'text', placeholder: '0x76', required: true },
                    { name: 'whoami_reg', label: 'WHO_AM_I 暫存器', type: 'text', placeholder: '0xD0' },
                    { name: 'whoami_value', label: '預期值', type: 'text', placeholder: '0x60' }
                ]
            },
            'uart': {
                name: 'UART',
                fields: [
                    { name: 'baud_rate', label: '鮑率', type: 'number', placeholder: '9600', required: true },
                    { name: 'data_bits', label: '資料位元', type: 'select', options: [7, 8], default: 8 },
                    { name: 'parity', label: '同位檢查', type: 'select', options: ['none', 'even', 'odd'], default: 'none' },
                    { name: 'stop_bits', label: '停止位元', type: 'select', options: [1, 2], default: 1 }
                ]
            },
            'modbus-rtu': {
                name: 'Modbus RTU',
                fields: [
                    { name: 'address', label: 'Modbus 位址 (1-247)', type: 'number', placeholder: '1', required: true, min: 1, max: 247 },
                    { name: 'baud_rate', label: '鮑率', type: 'select', options: [4800, 9600, 19200, 38400, 57600, 115200], default: 9600 },
                    { name: 'parity', label: '同位檢查', type: 'select', options: ['none', 'even', 'odd'], default: 'none' },
                    { name: 'stop_bits', label: '停止位元', type: 'select', options: [1, 2], default: 1 },
                    { name: 'data_bits', label: '資料位元', type: 'select', options: [7, 8], default: 8 }
                ]
            },
            'modbus-ascii': {
                name: 'Modbus ASCII',
                fields: [
                    { name: 'address', label: 'Modbus 位址 (1-247)', type: 'number', placeholder: '1', required: true, min: 1, max: 247 },
                    { name: 'baud_rate', label: '鮑率', type: 'select', options: [4800, 9600, 19200, 38400], default: 9600 },
                    { name: 'parity', label: '同位檢查', type: 'select', options: ['none', 'even', 'odd'], default: 'even' },
                    { name: 'stop_bits', label: '停止位元', type: 'select', options: [1, 2], default: 1 }
                ]
            },
            'rs485': {
                name: 'RS485',
                fields: [
                    { name: 'baud_rate', label: '鮑率', type: 'number', placeholder: '9600', required: true },
                    { name: 'data_bits', label: '資料位元', type: 'select', options: [7, 8], default: 8 },
                    { name: 'parity', label: '同位檢查', type: 'select', options: ['none', 'even', 'odd'], default: 'none' },
                    { name: 'stop_bits', label: '停止位元', type: 'select', options: [1, 2], default: 1 }
                ]
            },
            'analog': {
                name: 'Analog (4-20mA)',
                fields: [
                    { name: 'address', label: 'ADC I2C 位址', type: 'text', placeholder: '0x48' },
                    { name: 'adc_channel', label: 'ADC 通道', type: 'number', placeholder: '0', min: 0, max: 7 },
                    { name: 'current_range', label: '電流範圍', type: 'select', options: ['4-20mA', '0-20mA'], default: '4-20mA' },
                    { name: 'voltage_range', label: '電壓範圍', type: 'text', placeholder: '0-5V' }
                ]
            }
        };
    }

    /**
     * Get protocol configuration
     */
    getProtocol(protocolId) {
        return this.protocols[protocolId];
    }

    /**
     * Get all available protocols
     */
    getProtocols() {
        return Object.keys(this.protocols).map(id => ({
            id: id,
            name: this.protocols[id].name
        }));
    }

    /**
     * Render protocol fields as HTML
     */
    renderProtocolFields(protocolId, values = {}) {
        const protocol = this.protocols[protocolId];
        if (!protocol) return '';

        return protocol.fields.map(field => {
            const value = values[field.name] || field.default || '';

            if (field.type === 'select') {
                return `
                    <div class="form-group">
                        <label for="${field.name}">${field.label}</label>
                        <select id="${field.name}" name="${field.name}" ${field.required ? 'required' : ''}>
                            ${field.options.map(opt =>
                    `<option value="${opt}" ${value == opt ? 'selected' : ''}>${opt}</option>`
                ).join('')}
                        </select>
                    </div>
                `;
            } else {
                return `
                    <div class="form-group">
                        <label for="${field.name}">${field.label}</label>
                        <input type="${field.type}" 
                               id="${field.name}" 
                               name="${field.name}"
                               placeholder="${field.placeholder || ''}"
                               value="${value}"
                               ${field.required ? 'required' : ''}
                               ${field.min !== undefined ? `min="${field.min}"` : ''}
                               ${field.max !== undefined ? `max="${field.max}"` : ''}>
                    </div>
                `;
            }
        }).join('');
    }

    /**
     * Validate protocol configuration
     */
    validateConfig(protocolId, config) {
        const protocol = this.protocols[protocolId];
        if (!protocol) return { valid: false, errors: ['Unknown protocol'] };

        const errors = [];

        protocol.fields.forEach(field => {
            if (field.required && !config[field.name]) {
                errors.push(`${field.label} is required`);
            }

            if (field.type === 'number' && config[field.name]) {
                const num = parseInt(config[field.name]);
                if (field.min !== undefined && num < field.min) {
                    errors.push(`${field.label} must be at least ${field.min}`);
                }
                if (field.max !== undefined && num > field.max) {
                    errors.push(`${field.label} must be at most ${field.max}`);
                }
            }
        });

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
}

// Export as global
if (typeof window !== 'undefined') {
    window.ProtocolConfig = ProtocolConfig;
}
