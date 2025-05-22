<?php
/*
Template Name: Dashboard Page
*/
?>
<?php get_header(); ?>

<div class="dashboard-container">
    <div class="dashboard-header">
        <div class="logo-container">
            <img id="logo" src="<?php echo get_template_directory_uri(); ?>/assets/images/logo-light.svg" alt="Apex Soluções Digitais" class="logo">
        </div>
        <h1>CRM Dashboard</h1>
        <div class="controls">
            <input type="file" id="csvFile" accept=".csv" style="display: none;">
            <button id="uploadBtn" class="upload-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7,10 12,15 17,10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Upload CSV
            </button>
            <button id="kanbanBtn" class="kanban-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="7"></rect>
                    <rect x="3" y="14" width="18" height="7"></rect>
                </svg>
                Kanban
            </button>
            <button id="themeToggle" class="theme-toggle">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="5"></circle>
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
                </svg>
            </button>
        </div>
    </div>

    <div id="errorMessage" class="error-message" style="display: none;"></div>

    <div id="emptyState" class="empty-state">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <h2>No Data Loaded</h2>
        <p>Upload a CSV file to view dashboard analytics</p>
    </div>

    <div id="dashboardContent" class="dashboard-content" style="display: none;">
        <!-- Summary Cards -->
        <div class="summary-cards">
            <div class="summary-card">
                <div class="card-header">
                    <h3>Total Leads</h3>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
                <div class="card-value" id="totalLeads">0</div>
            </div>

            <div class="summary-card">
                <div class="card-header">
                    <h3>Total Value</h3>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                </div>
                <div class="card-value" id="totalValue">R$ 0,00</div>
            </div>

            <div class="summary-card">
                <div class="card-header">
                    <h3>Conversion Rate</h3>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"></polyline>
                    </svg>
                </div>
                <div class="card-value" id="conversionRate">0%</div>
            </div>

            <div class="summary-card">
                <div class="card-header">
                    <h3>Average Value</h3>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="20" x2="18" y2="10"></line>
                        <line x1="12" y1="20" x2="12" y2="4"></line>
                        <line x1="6" y1="20" x2="6" y2="14"></line>
                    </svg>
                </div>
                <div class="card-value" id="averageValue">R$ 0,00</div>
            </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-section">
            <div class="chart-container">
                <h3>Leads by Stage</h3>
                <canvas id="leadsByStageChart"></canvas>
            </div>

            <div class="chart-container">
                <h3>Value by Stage</h3>
                <canvas id="valueByStageChart"></canvas>
            </div>

            <div class="chart-container">
                <h3>Conversion Funnel</h3>
                <canvas id="conversionFunnelChart"></canvas>
            </div>

            <div class="chart-container">
                <h3>Lead Type Distribution</h3>
                <canvas id="typeDistributionChart"></canvas>
            </div>
        </div>

        <!-- Analysis Table -->
        <div class="analysis-section">
            <h3>Detailed Analysis</h3>
            <div class="table-container">
                <table id="analysisTable">
                    <thead>
                        <tr>
                            <th>Stage</th>
                            <th>Count</th>
                            <th>Total Value</th>
                            <th>Average Value</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<link rel="stylesheet" href="<?php echo get_template_directory_uri(); ?>/assets/css/dashboard.css">
<script src="<?php echo get_template_directory_uri(); ?>/assets/js/dashboard.js"></script>

<?php get_footer(); ?>