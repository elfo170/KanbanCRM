// Kanban CRM Visualizer JavaScript
class KanbanCRM {
    constructor() {
        this.data = [];
        this.currentTheme = 'light';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTheme();
        this.loadDataFromStorage();
    }

    setupEventListeners() {
        const uploadBtn = document.getElementById('uploadBtn');
        const csvFile = document.getElementById('csvFile');
        const themeToggle = document.getElementById('themeToggle');
        const dashboardBtn = document.getElementById('dashboardBtn');

        // Dashboard button click
        if (dashboardBtn) {
            dashboardBtn.addEventListener('click', () => {
                // Save current data before navigating
                this.saveDataToStorage();
                window.location.href = 'dashboard.html';
            });
        }

        // Upload button click
        uploadBtn.addEventListener('click', () => {
            csvFile.click();
        });

        // File input change
        csvFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFileUpload(file);
            }
        });

        // Theme toggle
        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Drag and drop functionality for file upload
        const container = document.querySelector('.kanban-container');
        
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        });

        container.addEventListener('dragleave', (e) => {
            e.preventDefault();
            container.style.backgroundColor = '';
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.style.backgroundColor = '';
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type === 'text/csv') {
                this.handleFileUpload(files[0]);
            } else {
                this.showError('Please drop a valid CSV file.');
            }
        });
    }

    handleFileUpload(file) {
        if (!file.name.toLowerCase().endsWith('.csv')) {
            this.showError('Please select a valid CSV file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                this.parseCSV(csv);
            } catch (error) {
                this.showError('Error reading file: ' + error.message);
            }
        };

        reader.onerror = () => {
            this.showError('Error reading file. Please try again.');
        };

        reader.readAsText(file);
    }

    parseCSV(csvText) {
        try {
            const lines = csvText.trim().split('\n');
            
            if (lines.length < 2) {
                this.showError('CSV file appears to be empty or invalid.');
                return;
            }

            // Parse header
            const headers = this.parseCSVLine(lines[0]);
            
            // Validate required columns
            const requiredColumns = ['id', 'name', 'phone', 'email', 'type', 'value', 'pipeline_stage'];
            const missingColumns = requiredColumns.filter(col => !headers.includes(col));
            
            if (missingColumns.length > 0) {
                this.showError(`Missing required columns: ${missingColumns.join(', ')}`);
                return;
            }

            // Parse data rows
            const data = [];
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim()) {
                    const values = this.parseCSVLine(lines[i]);
                    const row = {};
                    
                    headers.forEach((header, index) => {
                        row[header] = values[index] || '';
                    });
                    
                    // Validate essential fields
                    if (row.id && row.pipeline_stage) {
                        data.push(row);
                    }
                }
            }

            if (data.length === 0) {
                this.showError('No valid data found in CSV file.');
                return;
            }

            this.data = data;
            this.saveDataToStorage();
            this.hideError();
            this.renderKanban();
            
        } catch (error) {
            this.showError('Error parsing CSV: ' + error.message);
        }
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    renderKanban() {
        const kanbanBoard = document.getElementById('kanbanBoard');
        const emptyState = document.getElementById('emptyState');
        
        // Hide empty state and show kanban board
        emptyState.style.display = 'none';
        kanbanBoard.style.display = 'flex';
        kanbanBoard.style.flexDirection = 'row';
        kanbanBoard.style.overflowX = 'auto';
        kanbanBoard.style.overflowY = 'hidden';
        kanbanBoard.style.flexWrap = 'nowrap';
        kanbanBoard.style.gap = '20px';

        // Get all pipeline stages
        const stages = ['new', 'prospeccao', 'follow_up_a', 'follow_up_b', 'follow_up_c', 
                       'agenda_reuniao', 'follow_up_d', 'follow_up_e', 'won', 'lost'];

        // Group data by pipeline stage
        const stageData = {};
        stages.forEach(stage => {
            stageData[stage] = this.data.filter(contact => contact.pipeline_stage === stage);
        });

        // Render each stage
        stages.forEach(stage => {
            const stageElement = document.querySelector(`[data-stage="${stage}"]`);
            if (stageElement) {
                this.renderStage(stageElement, stageData[stage]);
            }
        });
    }

    renderStage(stageElement, contacts) {
        const stageContent = stageElement.querySelector('.stage-content');
        const cardCount = stageElement.querySelector('.card-count');
        const stageValue = stageElement.querySelector('.stage-value');
        
        // Calculate total value for this stage
        const totalValue = contacts.reduce((sum, contact) => {
            const value = parseFloat(contact.value) || 0;
            return sum + value;
        }, 0);
        
        // Format value as currency
        const formatValue = (value) => {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(value);
        };
        
        // Update card count and stage value
        cardCount.textContent = contacts.length;
        if (stageValue) {
            stageValue.textContent = formatValue(totalValue);
        }
        
        // Clear existing content
        stageContent.innerHTML = '';
        
        // Add contacts
        contacts.forEach(contact => {
            const card = this.createContactCard(contact);
            stageContent.appendChild(card);
        });
    }

    createContactCard(contact) {
        const card = document.createElement('div');
        card.className = 'contact-card';
        
        // Format phone number
        const formatPhone = (phone) => {
            if (!phone) return '';
            // Simple Brazilian phone formatting
            const cleaned = phone.replace(/\D/g, '');
            if (cleaned.length === 13) {
                return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
            }
            return phone;
        };

        // Format value as currency
        const formatValue = (value) => {
            if (!value || isNaN(value)) return '';
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(value);
        };

        // WhatsApp indicator
        const whatsappIcon = contact.is_wpp === 'true' ? 
            `<svg class="whatsapp-indicator" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.109"/>
            </svg>` : '';

        card.innerHTML = `
            <div class="name">
                ${this.escapeHtml(contact.name || 'Unnamed Contact')}
                ${whatsappIcon}
            </div>
            
            <div class="contact-info">
                ${contact.phone ? `
                    <div class="contact-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        ${formatPhone(contact.phone)}
                    </div>
                ` : ''}
                
                ${contact.email ? `
                    <div class="contact-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        ${this.escapeHtml(contact.email)}
                    </div>
                ` : ''}
            </div>
            
            <div class="meta-info">
                <span class="type-badge ${contact.type ? contact.type.toLowerCase() : ''}">${this.escapeHtml(contact.type || '')}</span>
                <span class="value">${formatValue(contact.value)}</span>
            </div>
        `;

        return card;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            ${message}
        `;
        errorElement.style.display = 'flex';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    hideError() {
        const errorElement = document.getElementById('errorMessage');
        errorElement.style.display = 'none';
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        // Update logo
        const logo = document.getElementById('logo');
        if (logo) {
            // Check if running in WordPress or standalone
            const isWordPress = logo.src.includes('wp-content');
            let basePath;
            
            if (isWordPress) {
                // WordPress theme path
                const templateDir = logo.src.split('/wp-content')[0] + '/wp-content/themes/' + 
                    logo.src.split('/wp-content/themes/')[1].split('/')[0];
                basePath = templateDir;
            } else {
                // Standalone version - use relative path
                basePath = '.';
            }
            
            logo.src = this.currentTheme === 'light' ? 
                `${basePath}/assets/images/logo-light.png` : 
                `${basePath}/assets/images/logo-dark.png`;
        }
    }

    saveTheme() {
        localStorage.setItem('kanban-theme', this.currentTheme);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('kanban-theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
        }
        this.applyTheme();
    }

    saveDataToStorage() {
        localStorage.setItem('crm-kanban-data', JSON.stringify(this.data));
    }

    loadDataFromStorage() {
        const savedData = localStorage.getItem('crm-kanban-data');
        if (savedData) {
            try {
                this.data = JSON.parse(savedData);
                if (this.data.length > 0) {
                    this.renderKanban();
                }
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KanbanCRM();
});
