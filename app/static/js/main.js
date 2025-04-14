// Main JavaScript file for AI Experiments System

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Auto-hide flash messages after 5 seconds
    setTimeout(function() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(function(alert) {
            // Create bootstrap alert instance and use hide method
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);
    
    // Add active class to current nav item
    const currentLocation = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(function(link) {
        const linkPath = link.getAttribute('href');
        if (linkPath && currentLocation.startsWith(linkPath) && linkPath !== '/') {
            link.classList.add('active');
        } else if (linkPath === '/' && currentLocation === '/') {
            link.classList.add('active');
        }
    });
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Dataset preview toggle
    const previewToggle = document.getElementById('preview-toggle');
    if (previewToggle) {
        previewToggle.addEventListener('click', function() {
            const previewContainer = document.getElementById('dataset-preview');
            if (previewContainer.style.display === 'none') {
                previewContainer.style.display = 'block';
                previewToggle.textContent = 'Hide Preview';
            } else {
                previewContainer.style.display = 'none';
                previewToggle.textContent = 'Show Preview';
            }
        });
    }
    
    // Form validation for dataset uploads
    const datasetForm = document.getElementById('dataset-form');
    if (datasetForm) {
        datasetForm.addEventListener('submit', function(event) {
            const fileInput = document.getElementById('file');
            const allowedExtensions = /(\.csv)$/i;
            
            if (fileInput && fileInput.files.length > 0) {
                if (!allowedExtensions.exec(fileInput.value)) {
                    alert('Please upload only CSV files.');
                    event.preventDefault();
                    return false;
                }
            }
            return true;
        });
    }
    
    // Dynamic form fields for model training based on model type
    const modelTypeSelect = document.getElementById('model_type');
    if (modelTypeSelect) {
        const hyperparamsContainer = document.getElementById('hyperparams-container');
        
        modelTypeSelect.addEventListener('change', function() {
            const modelType = this.value;
            
            // Hide all hyperparameter groups first
            const allGroups = hyperparamsContainer.querySelectorAll('.hyperparams-group');
            allGroups.forEach(group => group.style.display = 'none');
            
            // Show the specific group for the selected model type
            const selectedGroup = document.getElementById(`${modelType}-params`);
            if (selectedGroup) {
                selectedGroup.style.display = 'block';
            }
        });
        
        // Trigger change event to set initial state
        modelTypeSelect.dispatchEvent(new Event('change'));
    }
}); 