// Dashboard CRM Analytics JavaScript
class DashboardCRM {
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
        const kanbanBtn = document.getElementById('kanbanBtn');

        // Kanban button click
        if (kanbanBtn) {
            kanbanBtn.addEventListener('click', () => {
                // Check if we're in WordPress or standalone
                if (window.location.hostname.includes('localhost') || window.location.pathname.includes('.html')) {
                    window.location.href = 'standalone.html';
                } else {
                    window.location.href = '/kanban/';
                }
            });
        }

        // Upload button click
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                if (csvFile) {
                    csvFile.click();
                }
            });
        }

        // File input change
        if (csvFile) {
            csvFile.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleFileUpload(file);
                }
            });
        }

        // Theme toggle
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
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
            this.renderDashboard();
            
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

    renderDashboard() {
        const dashboardContent = document.getElementById('dashboardContent');
        const emptyState = document.getElementById('emptyState');
        
        // Hide empty state and show dashboard content
        emptyState.style.display = 'none';
        dashboardContent.style.display = 'flex';

        this.updateSummaryCards();
        this.renderCharts();
        this.renderAnalysisTable();
    }

    updateSummaryCards() {
        const totalLeads = this.data.length;
        const totalValue = this.data.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
        const wonLeads = this.data.filter(item => item.pipeline_stage === 'won').length;
        const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads * 100) : 0;
        const avgTicket = totalLeads > 0 ? totalValue / totalLeads : 0;

        const formatCurrency = (value) => {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(value);
        };

        document.getElementById('totalLeads').textContent = totalLeads.toLocaleString('pt-BR');
        document.getElementById('totalValue').textContent = formatCurrency(totalValue);
        document.getElementById('conversionRate').textContent = `${conversionRate.toFixed(1)}%`;
        document.getElementById('avgTicket').textContent = formatCurrency(avgTicket);
    }

    renderCharts() {
        this.renderLeadsByStageChart();
        this.renderValueByStageChart();
        this.renderConversionFunnelChart();
        this.renderTypeDistributionChart();
    }

    renderLeadsByStageChart() {
        const canvas = document.getElementById('leadsByStageChart');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = 400;
        canvas.height = 300;
        
        const stages = ['new', 'prospeccao', 'follow_up_a', 'follow_up_b', 'follow_up_c', 
                       'agenda_reuniao', 'follow_up_d', 'follow_up_e', 'won', 'lost'];
        
        const stageLabels = ['New', 'Prospecção', 'Follow A', 'Follow B', 'Follow C', 
                            'Agenda', 'Follow D', 'Follow E', 'Won', 'Lost'];
        
        const stageCounts = stages.map(stage => 
            this.data.filter(item => item.pipeline_stage === stage).length
        );

        this.drawBarChart(ctx, stageLabels, stageCounts, 'Leads por Etapa');
    }

    renderValueByStageChart() {
        const canvas = document.getElementById('valueByStageChart');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 400;
        canvas.height = 300;
        
        const stages = ['new', 'prospeccao', 'follow_up_a', 'follow_up_b', 'follow_up_c', 
                       'agenda_reuniao', 'follow_up_d', 'follow_up_e', 'won', 'lost'];
        
        const stageLabels = ['New', 'Prospecção', 'Follow A', 'Follow B', 'Follow C', 
                            'Agenda', 'Follow D', 'Follow E', 'Won', 'Lost'];
        
        const stageValues = stages.map(stage => 
            this.data.filter(item => item.pipeline_stage === stage)
                     .reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0)
        );

        this.drawBarChart(ctx, stageLabels, stageValues, 'Valor por Etapa', true);
    }

    renderConversionFunnelChart() {
        const canvas = document.getElementById('conversionFunnelChart');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 400;
        canvas.height = 300;
        
        const funnelStages = ['new', 'prospeccao', 'agenda_reuniao', 'won'];
        const funnelLabels = ['Novos Leads', 'Em Prospecção', 'Agenda Reunião', 'Fechados'];
        
        const funnelCounts = funnelStages.map(stage => 
            this.data.filter(item => item.pipeline_stage === stage).length
        );

        this.drawFunnelChart(ctx, funnelLabels, funnelCounts);
    }

    renderTypeDistributionChart() {
        const canvas = document.getElementById('typeDistributionChart');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 400;
        canvas.height = 300;
        
        const typeDistribution = {};
        this.data.forEach(item => {
            const type = item.type || 'Não informado';
            typeDistribution[type] = (typeDistribution[type] || 0) + 1;
        });

        const labels = Object.keys(typeDistribution);
        const values = Object.values(typeDistribution);

        this.drawPieChart(ctx, labels, values);
    }

    drawBarChart(ctx, labels, data, title, isCurrency = false) {
        const padding = 40;
        const chartWidth = ctx.canvas.width - 2 * padding;
        const chartHeight = ctx.canvas.height - 2 * padding;
        const barWidth = chartWidth / labels.length * 0.8;
        const maxValue = Math.max(...data);
        
        // Clear canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Set colors based on theme
        const isDark = this.currentTheme === 'dark';
        const textColor = isDark ? '#f9fafb' : '#1f2937';
        const barColor = '#3b82f6';
        
        ctx.fillStyle = textColor;
        ctx.font = '12px Arial';
        
        // Draw bars
        data.forEach((value, index) => {
            const barHeight = maxValue > 0 ? (value / maxValue) * (chartHeight - 30) : 0;
            const x = padding + index * (chartWidth / labels.length) + (chartWidth / labels.length - barWidth) / 2;
            const y = padding + chartHeight - 30 - barHeight;
            
            // Draw bar
            ctx.fillStyle = barColor;
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Draw label
            ctx.fillStyle = textColor;
            ctx.save();
            ctx.translate(x + barWidth / 2, padding + chartHeight - 15);
            ctx.rotate(-Math.PI / 4);
            ctx.textAlign = 'right';
            ctx.fillText(labels[index], 0, 0);
            ctx.restore();
            
            // Draw value
            ctx.textAlign = 'center';
            const displayValue = isCurrency ? 
                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value) :
                value.toString();
            ctx.fillText(displayValue, x + barWidth / 2, y - 5);
        });
    }

    drawPieChart(ctx, labels, data) {
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 40;
        const total = data.reduce((sum, value) => sum + value, 0);
        
        // Clear canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
        let currentAngle = -Math.PI / 2;
        
        // Draw pie slices
        data.forEach((value, index) => {
            const sliceAngle = (value / total) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();
            
            // Draw label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
            
            const isDark = this.currentTheme === 'dark';
            ctx.fillStyle = isDark ? '#f9fafb' : '#1f2937';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(labels[index], labelX, labelY);
            ctx.fillText(`${Math.round(value / total * 100)}%`, labelX, labelY + 15);
            
            currentAngle += sliceAngle;
        });
    }

    drawFunnelChart(ctx, labels, data) {
        const padding = 40;
        const chartWidth = ctx.canvas.width - 2 * padding;
        const chartHeight = ctx.canvas.height - 2 * padding;
        const maxValue = Math.max(...data);
        
        // Clear canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        const isDark = this.currentTheme === 'dark';
        const textColor = isDark ? '#f9fafb' : '#1f2937';
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
        
        // Draw funnel segments
        data.forEach((value, index) => {
            const segmentHeight = chartHeight / labels.length;
            const segmentWidth = maxValue > 0 ? (value / maxValue) * chartWidth : 0;
            const y = padding + index * segmentHeight;
            const x = padding + (chartWidth - segmentWidth) / 2;
            
            // Draw segment
            ctx.fillStyle = colors[index % colors.length];
            ctx.fillRect(x, y, segmentWidth, segmentHeight * 0.8);
            
            // Draw label and value
            ctx.fillStyle = textColor;
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`${labels[index]}: ${value}`, padding, y + segmentHeight * 0.5);
        });
    }

    renderAnalysisTable() {
        const tbody = document.querySelector('#stageAnalysisTable tbody');
        tbody.innerHTML = '';
        
        const stages = ['new', 'prospeccao', 'follow_up_a', 'follow_up_b', 'follow_up_c', 
                       'agenda_reuniao', 'follow_up_d', 'follow_up_e', 'won', 'lost'];
        
        const stageLabels = ['New', 'Prospecção', 'Follow Up A', 'Follow Up B', 'Follow Up C', 
                            'Agenda Reunião', 'Follow Up D', 'Follow Up E', 'Won', 'Lost'];
        
        const totalLeads = this.data.length;
        const formatCurrency = (value) => {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(value);
        };
        
        stages.forEach((stage, index) => {
            const stageData = this.data.filter(item => item.pipeline_stage === stage);
            const count = stageData.length;
            const totalValue = stageData.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
            const avgValue = count > 0 ? totalValue / count : 0;
            const percentage = totalLeads > 0 ? (count / totalLeads * 100) : 0;
            
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${stageLabels[index]}</td>
                <td>${count}</td>
                <td>${formatCurrency(totalValue)}</td>
                <td>${formatCurrency(avgValue)}</td>
                <td>${percentage.toFixed(1)}%</td>
            `;
        });
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
                    this.renderDashboard();
                }
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }
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
        
        // Re-render charts with new theme
        if (this.data.length > 0) {
            this.renderCharts();
        }
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        // Update logo
        const logo = document.getElementById('logo');
        if (logo) {
            const basePath = '.';
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
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardCRM();
});