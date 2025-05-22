# CRM Kanban Visualizer - WordPress Theme

## Overview

This is a specialized WordPress theme designed to create a Kanban-style CRM (Customer Relationship Management) visualizer. The theme provides a single-page application interface where users can upload CSV files containing CRM data and visualize customer pipeline stages in an interactive Kanban board format.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **WordPress Theme Structure**: Traditional WordPress theme with custom templates
- **Static Site Approach**: Primarily client-side JavaScript application embedded within WordPress
- **Single Page Application**: Main functionality concentrated in a custom Kanban page template
- **Responsive Design**: CSS-based responsive layout with mobile-first approach

### Backend Architecture
- **WordPress Core**: Leverages WordPress as the content management system
- **PHP Templates**: Standard WordPress template hierarchy (header.php, footer.php, functions.php)
- **Static File Serving**: PHP built-in server for development (configured in .replit)
- **No Database Integration**: CRM data is processed client-side from uploaded CSV files

## Key Components

### WordPress Theme Files
- **functions.php**: Theme setup, asset enqueuing, and custom page template routing
- **header.php/footer.php**: Standard WordPress template structure
- **index.php**: Default theme template with embedded Kanban interface
- **page-kanban.php**: Custom template for dedicated Kanban CRM page
- **style.css**: Theme definition file that imports main stylesheet

### Frontend Assets
- **CSS**: Modern CSS with custom properties for theming, located in `assets/css/kanban.css`
- **JavaScript**: Vanilla JavaScript Kanban implementation in `assets/js/kanban.js`
- **SVG Assets**: Theme-aware logo files for light and dark modes

### Core Features
- **CSV File Upload**: Client-side CSV parsing and data visualization
- **Drag-and-Drop**: File upload interface with visual feedback
- **Theme Switching**: Light/dark mode toggle with persistent preferences
- **Pipeline Stages**: Predefined CRM stages (New, Prospecção, Agenda Reunião, etc.)
- **Real-time Updates**: Dynamic card counting and stage management

## Data Flow

### File Upload Process
1. User selects CSV file via upload button or drag-and-drop
2. JavaScript reads file content using FileReader API
3. CSV data is parsed client-side into structured objects
4. Data is categorized by pipeline_stage column
5. Kanban cards are dynamically generated and populated

### Pipeline Stages
- **new**: Initial contact stage
- **prospeccao**: Prospecting/qualification stage
- **agenda_reuniao**: Meeting scheduling stage
- **Additional stages**: Configurable through CSV data

### Theme Management
- Theme preference stored in localStorage
- CSS custom properties enable seamless theme switching
- Logo assets automatically switch based on current theme

## External Dependencies

### WordPress Core
- Leverages WordPress hooks and functions for theme integration
- Uses WordPress asset enqueuing system for proper resource management
- Integrates with WordPress template hierarchy

### Browser APIs
- **FileReader API**: For client-side CSV file processing
- **localStorage**: For theme preference persistence
- **Drag and Drop API**: For enhanced file upload experience

### No External Libraries
- Vanilla JavaScript implementation (no jQuery or other frameworks)
- Pure CSS styling (no external CSS frameworks)
- Self-contained SVG assets

## Deployment Strategy

### Development Environment
- **Replit Configuration**: Uses PHP built-in server on port 5000
- **Node.js Module**: Configured for development tooling support
- **Hot Reload**: PHP server automatically serves updated files

### Production Considerations
- Standard WordPress hosting requirements (PHP 7.4+)
- No database dependencies beyond WordPress core tables
- Static asset optimization through WordPress asset pipeline
- Compatible with standard WordPress deployment practices

### File Structure
```
/
├── .replit (Replit configuration)
├── functions.php (WordPress theme functions)
├── header.php (WordPress header template)
├── footer.php (WordPress footer template)
├── index.php (Main theme template)
├── page-kanban.php (Custom Kanban page template)
├── style.css (Theme definition)
├── assets/
│   ├── css/kanban.css (Main stylesheet)
│   ├── js/kanban.js (Kanban functionality)
│   └── images/ (Logo assets)
└── attached_assets/
    └── CRM_rows.csv (Sample data)
```

The architecture prioritizes simplicity and maintainability while providing a robust CRM visualization tool that integrates seamlessly with WordPress environments.