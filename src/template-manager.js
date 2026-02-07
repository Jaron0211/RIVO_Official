/**
 * RIVO Template Manager - Manages sensor template loading and selection
 */

class TemplateManager {
    constructor() {
        this.templates = [];
        this.categories = {};
        this.loaded = false;
    }

    /**
     * Load templates from the templates.json file
     */
    async loadTemplates() {
        try {
            const response = await fetch('/src/sensor-templates/templates.json');
            const data = await response.json();

            this.categories = data.categories;
            this.templates = data.templates;
            this.loaded = true;

            console.log(`Loaded ${this.templates.length} sensor templates`);
            return true;
        } catch (error) {
            console.error('Failed to load templates:', error);
            return false;
        }
    }

    /**
     * Get all templates, optionally filtered by category
     */
    getTemplates(category = null) {
        if (!this.loaded) {
            console.warn('Templates not loaded yet');
            return [];
        }

        if (category) {
            return this.templates.filter(t => t.category === category);
        }
        return this.templates;
    }

    /**
     * Get a specific template by ID
     */
    getTemplate(id) {
        return this.templates.find(t => t.id === id);
    }

    /**
     * Search templates by name or tags
     */
    searchTemplates(query) {
        const lowerQuery = query.toLowerCase();
        return this.templates.filter(t =>
            t.name.toLowerCase().includes(lowerQuery) ||
            t.name_en.toLowerCase().includes(lowerQuery) ||
            t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * Load a template YAML file
     */
    async loadTemplateFile(template) {
        try {
            const response = await fetch(`/src/sensor-templates/${template.file}`);
            const yamlText = await response.text();
            return yamlText;
        } catch (error) {
            console.error(`Failed to load template file: ${template.file}`, error);
            return null;
        }
    }

    /**
     * Parse YAML to JSON (basic implementation)
     * For production, use a proper YAML parser library
     */
    parseYAML(yamlText) {
        // This is a simplified parser - in production use js-yaml or similar
        try {
            const lines = yamlText.split('\n');
            const result = {};
            let currentKey = null;
            let currentIndent = 0;

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed === '' || trimmed.startsWith('#')) continue;

                const colonIndex = trimmed.indexOf(':');
                if (colonIndex > -1) {
                    const key = trimmed.substring(0, colonIndex).trim();
                    const value = trimmed.substring(colonIndex + 1).trim();

                    if (value && value !== '') {
                        // Simple key-value
                        result[key] = value.replace(/['"]/g, '');
                    }
                }
            }

            return result;
        } catch (error) {
            console.error('YAML parsing error:', error);
            return null;
        }
    }

    /**
     * Get available protocols
     */
    getProtocols() {
        const protocols = new Set();
        this.templates.forEach(t => {
            t.protocols.forEach(p => protocols.add(p));
        });
        return Array.from(protocols);
    }

    /**
     * Filter templates by protocol
     */
    getTemplatesByProtocol(protocol) {
        return this.templates.filter(t => t.protocols.includes(protocol));
    }

    /**
     * Get all unique tags
     */
    getTags() {
        const tags = new Set();
        this.templates.forEach(t => {
            t.tags.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    }

    /**
     * Filter templates by tag
     */
    getTemplatesByTag(tag) {
        return this.templates.filter(t => t.tags.includes(tag));
    }

    /**
     * Get category information
     */
    getCategory(categoryId) {
        return this.categories[categoryId];
    }

    /**
     * Get all categories
     */
    getCategories() {
        return Object.keys(this.categories).map(id => ({
            id: id,
            ...this.categories[id]
        }));
    }
}

// Export as global for now, can be converted to module later
if (typeof window !== 'undefined') {
    window.TemplateManager = TemplateManager;
}
