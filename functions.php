<?php
function kanban_theme_setup() {
    // Add theme support for various features
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
    ));
    
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
}
add_action('after_setup_theme', 'kanban_theme_setup');

function kanban_scripts() {
    wp_enqueue_style('kanban-style', get_template_directory_uri() . '/assets/css/kanban.css', array(), '1.0.0');
    wp_enqueue_script('kanban-script', get_template_directory_uri() . '/assets/js/kanban.js', array(), '1.0.0', true);
}
add_action('wp_enqueue_scripts', 'kanban_scripts');

// Remove admin bar for clean visualization
add_filter('show_admin_bar', '__return_false');

// Custom page templates
function kanban_page_template($template) {
    if (is_page('kanban')) {
        $new_template = locate_template(array('page-kanban.php'));
        if (!empty($new_template)) {
            return $new_template;
        }
    }
    if (is_page('dashboard')) {
        $new_template = locate_template(array('page-dashboard.php'));
        if (!empty($new_template)) {
            return $new_template;
        }
    }
    return $template;
}
add_filter('template_include', 'kanban_page_template');

// Create pages automatically when theme is activated
function kanban_create_pages() {
    // Create Kanban page
    $kanban_page = get_page_by_title('Kanban');
    if (!$kanban_page) {
        wp_insert_post(array(
            'post_title' => 'Kanban',
            'post_name' => 'kanban',
            'post_content' => 'CRM Kanban View',
            'post_status' => 'publish',
            'post_type' => 'page'
        ));
    }
    
    // Create Dashboard page
    $dashboard_page = get_page_by_title('Dashboard');
    if (!$dashboard_page) {
        wp_insert_post(array(
            'post_title' => 'Dashboard',
            'post_name' => 'dashboard',
            'post_content' => 'CRM Dashboard Analytics',
            'post_status' => 'publish',
            'post_type' => 'page'
        ));
    }
}
add_action('after_switch_theme', 'kanban_create_pages');
?>
