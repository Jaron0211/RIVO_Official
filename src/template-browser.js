/**
 * RIVO Template Browser - UI component for browsing and selecting templates
 */

class TemplateBrowser {
    constructor(containerId, templateManager) {
        this.container = document.getElementById(containerId);
        this.templateManager = templateManager;
        this.selectedTemplate = null;
        this.currentCategory = 'all';
        this.searchQuery = '';

        this.init();
    }

    async init() {
        // Load templates if not already loaded
        if (!this.templateManager.loaded) {
            await this.templateManager.loadTemplates();
        }

        this.render();
        this.attachEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="template-browser">
                <div class="template-header">
                    <h3>感測器範本庫</h3>
                    <p class="template-subtitle">選擇範本快速建立感測器配置</p>
                </div>
                
                <div class="template-filters">
                    <div class="filter-group">
                        <label for="category-filter">類別</label>
                        <select id="category-filter">
                            <option value="all">所有類別</option>
                            ${this.renderCategoryOptions()}
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label for="search-templates">搜尋</label>
                        <input type="text" id="search-templates" 
                               placeholder="搜尋感測器名稱或標籤..." 
                               value="${this.searchQuery}">
                    </div>
                </div>
                
                <div class="template-grid">
                    ${this.renderTemplates()}
                </div>
                
                <div class="template-preview" id="template-preview" style="display: none;">
                    <!-- Template preview will be injected here -->
                </div>
            </div>
        `;
    }

    renderCategoryOptions() {
        const categories = this.templateManager.getCategories();
        return categories.map(cat =>
            `<option value="${cat.id}">${cat.name}</option>`
        ).join('');
    }

    renderTemplates() {
        let templates = this.templateManager.getTemplates();

        // Apply filters
        if (this.currentCategory !== 'all') {
            templates = templates.filter(t => t.category === this.currentCategory);
        }

        if (this.searchQuery) {
            templates = this.templateManager.searchTemplates(this.searchQuery);
        }

        if (templates.length === 0) {
            return '<div class="no-templates">找不到符合條件的範本</div>';
        }

        return templates.map(template => this.renderTemplateCard(template)).join('');
    }

    renderTemplateCard(template) {
        const protocols = template.protocols.map(p =>
            `<span class="protocol-badge">${p}</span>`
        ).join('');

        const tags = template.tags.slice(0, 3).map(tag =>
            `<span class="tag-badge">${tag}</span>`
        ).join('');

        return `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-card-header">
                    <h4>${template.name}</h4>
                    <div class="template-protocols">${protocols}</div>
                </div>
                <div class="template-card-body">
                    <p class="template-description">${template.description}</p>
                    <div class="template-tags">${tags}</div>
                </div>
                <div class="template-card-footer">
                    <button class="btn-preview" data-template-id="${template.id}">
                        預覽
                    </button>
                    <button class="btn-use-template btn-primary" data-template-id="${template.id}">
                        使用範本
                    </button>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Category filter
        const categoryFilter = this.container.querySelector('#category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentCategory = e.target.value;
                this.render();
                this.attachEventListeners();
            });
        }

        // Search input
        const searchInput = this.container.querySelector('#search-templates');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.render();
                this.attachEventListeners();
            });
        }

        // Preview buttons
        this.container.querySelectorAll('.btn-preview').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const templateId = e.target.dataset.templateId;
                this.showPreview(templateId);
            });
        });

        // Use template buttons
        this.container.querySelectorAll('.btn-use-template').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const templateId = e.target.dataset.templateId;
                this.selectTemplate(templateId);
            });
        });
    }

    async showPreview(templateId) {
        const template = this.templateManager.getTemplate(templateId);
        if (!template) return;

        const yamlContent = await this.templateManager.loadTemplateFile(template);

        const previewContainer = this.container.querySelector('#template-preview');
        previewContainer.style.display = 'block';
        previewContainer.innerHTML = `
            <div class="preview-header">
                <h4>${template.name}</h4>
                <button class="btn-close-preview">&times;</button>
            </div>
            <div class="preview-details">
                <div class="detail-row">
                    <strong>製造商:</strong> ${template.manufacturer}
                </div>
                <div class="detail-row">
                    <strong>協議:</strong> ${template.protocols.join(', ')}
                </div>
                ${template.i2c_addresses ? `
                <div class="detail-row">
                    <strong>I2C 位址:</strong> ${template.i2c_addresses.join(', ')}
                </div>
                ` : ''}
                ${template.datasheet ? `
                <div class="detail-row">
                    <strong>資料手冊:</strong> 
                    <a href="${template.datasheet}" target="_blank">開啟 PDF</a>
                </div>
                ` : ''}
            </div>
            <div class="preview-yaml">
                <h5>YAML 配置預覽</h5>
                <pre><code>${yamlContent}</code></pre>
            </div>
        `;

        // Attach close button event
        previewContainer.querySelector('.btn-close-preview').addEventListener('click', () => {
            previewContainer.style.display = 'none';
        });
    }

    async selectTemplate(templateId) {
        const template = this.templateManager.getTemplate(templateId);
        if (!template) return;

        this.selectedTemplate = template;
        const yamlContent = await this.templateManager.loadTemplateFile(template);

        // Trigger custom event for other components to handle
        const event = new CustomEvent('template-selected', {
            detail: {
                template: template,
                yamlContent: yamlContent
            }
        });
        this.container.dispatchEvent(event);

        console.log('Template selected:', template.name);
    }

    getSelectedTemplate() {
        return this.selectedTemplate;
    }
}

// Export as global
if (typeof window !== 'undefined') {
    window.TemplateBrowser = TemplateBrowser;
}
