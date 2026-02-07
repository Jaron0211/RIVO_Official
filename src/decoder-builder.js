/**
 * RIVO Decoder Builder - Generates decoder configurations
 */

class DecoderBuilder {
    constructor() {
        this.decoderTypes = {
            'raw_to_int': {
                name: '整數轉換',
                fields: [
                    { name: 'byte_order', label: '位元組順序', type: 'select', options: ['big_endian', 'little_endian'], default: 'big_endian' },
                    { name: 'signed', label: '有符號', type: 'checkbox', default: false },
                    { name: 'bits', label: '位元數', type: 'number', default: 16, min: 1, max: 64 },
                    { name: 'bit_shift', label: '位元位移 (可選)', type: 'number', default: 0 },
                    { name: 'bit_mask', label: '位元遮罩 (可選)', type: 'text', placeholder: '0xFF' },
                    { name: 'scale', label: '縮放係數', type: 'number', default: 1.0, step: 'any' },
                    { name: 'offset', label: '偏移量', type: 'number', default: 0, step: 'any' }
                ]
            },
            'ieee754_float': {
                name: 'IEEE 754 浮點數',
                fields: [
                    { name: 'byte_order', label: '位元組順序', type: 'select', options: ['big_endian', 'little_endian'], default: 'big_endian' },
                    { name: 'precision', label: '精度', type: 'select', options: [32, 64], default: 32 }
                ]
            },
            'modbus_int16_be': {
                name: 'Modbus 16-bit 整數 (BE)',
                fields: []
            },
            'modbus_uint16_be': {
                name: 'Modbus 16-bit 無符號整數 (BE)',
                fields: []
            },
            'modbus_int32_be': {
                name: 'Modbus 32-bit 整數 (ABCD)',
                fields: [
                    { name: 'byte_order', label: '字組順序', type: 'select', options: ['ABCD', 'CDAB', 'BADC', 'DCBA'], default: 'ABCD' }
                ]
            },
            'modbus_uint32_be': {
                name: 'Modbus 32-bit 無符號整數',
                fields: [
                    { name: 'byte_order', label: '字組順序', type: 'select', options: ['ABCD', 'CDAB', 'BADC', 'DCBA'], default: 'ABCD' }
                ]
            },
            'modbus_float32_be': {
                name: 'Modbus 32-bit 浮點數',
                fields: [
                    { name: 'byte_order', label: '字組順序', type: 'select', options: ['ABCD', 'CDAB', 'BADC', 'DCBA'], default: 'ABCD' }
                ]
            },
            'bcd': {
                name: 'BCD (Binary-Coded Decimal)',
                fields: [
                    { name: 'packed', label: 'Packed BCD', type: 'checkbox', default: true }
                ]
            },
            'ascii': {
                name: 'ASCII 字串',
                fields: [
                    { name: 'trim', label: '移除空白', type: 'checkbox', default: true },
                    { name: 'encoding', label: '編碼', type: 'select', options: ['ascii', 'utf8'], default: 'ascii' }
                ]
            },
            'bitmap': {
                name: '位元遮罩',
                fields: [
                    { name: 'mask', label: '遮罩值', type: 'text', placeholder: '0xFF', required: true },
                    { name: 'shift', label: '位元位移', type: 'number', default: 0 }
                ]
            },
            'custom_expression': {
                name: '自訂運算式',
                fields: [
                    { name: 'expression', label: '運算式', type: 'text', placeholder: '${input} * 1.8 + 32', required: true }
                ]
            }
        };

        // Legacy aliases for backward compatibility
        this.aliases = {
            'bme280_temp': 'raw_to_int',
            'bme280_pressure': 'raw_to_int',
            'bme280_humidity': 'raw_to_int',
            'dht22_temp': 'raw_to_int',
            'dht22_humidity': 'raw_to_int',
            'int8': 'raw_to_int',
            'uint8': 'raw_to_int',
            'int16_le': 'raw_to_int',
            'int16_be': 'raw_to_int',
            'uint16_le': 'raw_to_int',
            'uint16_be': 'raw_to_int',
            'int32_le': 'raw_to_int',
            'int32_be': 'raw_to_int',
            'float32': 'ieee754_float'
        };
    }

    /**
     * Get decoder type configuration
     */
    getDecoderType(typeId) {
        // Check if it's an alias
        if (this.aliases[typeId]) {
            return this.decoderTypes[this.aliases[typeId]];
        }
        return this.decoderTypes[typeId];
    }

    /**
     * Get all decoder types
     */
    getDecoderTypes() {
        return Object.keys(this.decoderTypes).map(id => ({
            id: id,
            name: this.decoderTypes[id].name
        }));
    }

    /**
     * Render decoder configuration fields
     */
    renderDecoderFields(typeId, values = {}) {
        const decoderType = this.getDecoderType(typeId);
        if (!decoderType || !decoderType.fields) return '';

        if (decoderType.fields.length === 0) {
            return '<p class="decoder-note">此解碼器類型不需額外設定</p>';
        }

        return decoderType.fields.map(field => {
            const value = values[field.name] !== undefined ? values[field.name] : field.default;

            if (field.type === 'checkbox') {
                return `
                    <div class="form-group checkbox-group">
                        <label>
                            <input type="checkbox" 
                                   id="decoder_${field.name}" 
                                   name="${field.name}"
                                   ${value ? 'checked' : ''}>
                            ${field.label}
                        </label>
                    </div>
                `;
            } else if (field.type === 'select') {
                return `
                    <div class="form-group">
                        <label for="decoder_${field.name}">${field.label}</label>
                        <select id="decoder_${field.name}" name="${field.name}">
                            ${field.options.map(opt =>
                    `<option value="${opt}" ${value == opt ? 'selected' : ''}>${opt}</option>`
                ).join('')}
                        </select>
                    </div>
                `;
            } else {
                return `
                    <div class="form-group">
                        <label for="decoder_${field.name}">${field.label}</label>
                        <input type="${field.type}" 
                               id="decoder_${field.name}" 
                               name="${field.name}"
                               value="${value || ''}"
                               placeholder="${field.placeholder || ''}"
                               ${field.required ? 'required' : ''}
                               ${field.min !== undefined ? `min="${field.min}"` : ''}
                               ${field.max !== undefined ? `max="${field.max}"` : ''}
                               ${field.step ? `step="${field.step}"` : ''}>
                    </div>
                `;
            }
        }).join('');
    }

    /**
     * Build decoder configuration object from form data
     */
    buildConfig(typeId, formData) {
        const decoderType = this.getDecoderType(typeId);
        if (!decoderType) return null;

        const config = {
            type: typeId
        };

        if (decoderType.fields) {
            decoderType.fields.forEach(field => {
                if (formData[field.name] !== undefined && formData[field.name] !== '') {
                    config[field.name] = formData[field.name];
                }
            });
        }

        return config;
    }

    /**
     * Convert legacy decoder string to new config format
     */
    convertLegacyDecoder(decoderString) {
        // If it's already an object, return as is
        if (typeof decoderString === 'object') {
            return decoderString;
        }

        // Check if it's a known alias
        const baseType = this.aliases[decoderString] || decoderString;

        // Create config based on known patterns
        const config = { type: baseType };

        // Apply specific configurations for common aliases
        if (decoderString === 'bme280_temp') {
            return {
                type: 'raw_to_int',
                byte_order: 'big_endian',
                signed: true,
                bits: 20,
                bit_shift: 4,
                scale: 0.01,
                offset: 0
            };
        }
        // Add more legacy conversions as needed

        return config;
    }

    /**
     * Generate YAML decoder block
     */
    generateYAML(config) {
        if (typeof config === 'string') {
            return `decode: "${config}"`;
        }

        let yaml = 'decode:\n';
        yaml += `  type: "${config.type}"\n`;

        Object.keys(config).forEach(key => {
            if (key !== 'type') {
                const value = config[key];
                if (typeof value === 'string') {
                    yaml += `  ${key}: "${value}"\n`;
                } else if (typeof value === 'boolean') {
                    yaml += `  ${key}: ${value}\n`;
                } else {
                    yaml += `  ${key}: ${value}\n`;
                }
            }
        });

        return yaml;
    }
}

// Export as global
if (typeof window !== 'undefined') {
    window.DecoderBuilder = DecoderBuilder;
}
