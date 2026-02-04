/**
 * Node Property Editor - Modal dialog for editing node properties
 */

class NodePropertyEditor {
    constructor(editor) {
        this.editor = editor;
        this.modal = null;
        this.currentNode = null;
        this.createModal();
    }

    createModal() {
        // Create modal HTML
        const modalHTML = `
            <div id="propertyEditorModal" class="property-modal" style="display: none;">
                <div class="property-modal-overlay"></div>
                <div class="property-modal-content">
                    <div class="property-modal-header">
                        <h3>編輯節點屬性</h3>
                        <button class="close-btn" onclick="propertyEditor.close()">×</button>
                    </div>
                    <div class="property-modal-body" id="propertyFields">
                        <!-- Fields will be dynamically generated -->
                    </div>
                    <div class="property-modal-footer">
                        <button class="btn-cancel" onclick="propertyEditor.close()">取消</button>
                        <button class="btn-save" onclick="propertyEditor.save()">儲存</button>
                    </div>
                </div>
            </div>
        `;

        // Append to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('propertyEditorModal');
    }

    open(node) {
        this.currentNode = node;
        const fieldsContainer = document.getElementById('propertyFields');
        fieldsContainer.innerHTML = '';

        // Generate fields based on node properties
        Object.entries(node.properties).forEach(([key, value]) => {
            const field = this.createField(key, value, node.type);
            fieldsContainer.appendChild(field);
        });

        this.modal.style.display = 'block';
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
        const labels = {
            register: '暫存器位址',
            length: '讀取長度',
            decoder: '解碼器',
            variable_name: '變數名稱',
            name: '常數名稱',
            value: '數值',
            expression: '運算式',
            description: '說明',
            function: '函數',
            operation: '運算',
            input_a_name: '輸入 A 名稱',
            input_b_name: '輸入 B 名稱',
            parameter: '參數',
            sensor_id: '感測器 ID',
            sensor_type: '感測器類型',
            unit: '單位',
            topic: '主題',
            field: '欄位',
            shift_bits: '位移位數',
            mask: '遮罩值'
        };
        return labels[key] || key;
    }

    createInput(key, value, nodeType) {
        let input;

        // Special inputs for specific fields
        if (key === 'expression') {
            input = document.createElement('textarea');
            input.rows = 3;
            input.value = value;
            input.placeholder = '例如: ($input * 1.8) + 32';
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
        } else if (key === 'decoder') {
            input = document.createElement('select');
            ['int8', 'uint8', 'int16', 'uint16', 'int32', 'uint32', 'float', 'bme280_temp', 'bme280_pressure', 'bme280_humidity'].forEach(dec => {
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
        const inputs = this.modal.querySelectorAll('.property-input');
        inputs.forEach(input => {
            const key = input.dataset.propertyKey;
            let value = input.value;

            // Convert to appropriate type  
            if (input.type === 'number') {
                value = parseFloat(value);
            }

            this.currentNode.properties[key] = value;
        });

        this.editor.render();
        this.close();
    }

    close() {
        this.modal.style.display = 'none';
        this.currentNode = null;
    }
}
