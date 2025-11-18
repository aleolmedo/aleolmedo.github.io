// Navigation Template Loader for GitHub Pages
class NavigationLoader {
    constructor() {
        this.basePath = this.getBasePath();
        this.loaded = false;
    }

    // Determine the base path based on current page location
    getBasePath() {
        const path = window.location.pathname;
        
        // Remove leading and trailing slashes, and split into parts
        const pathParts = path.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
        
        // If we're at the root or index.html, base path is current directory
        if (path === '/' || path === '/index.html' || pathParts.length === 0) {
            return './';
        }
        
        // Count how many levels deep we are (excluding the filename)
        const depth = pathParts.length - (pathParts[pathParts.length - 1].includes('.') ? 1 : 0);
        
        // Build relative path back to root
        if (depth === 0) {
            return './';
        } else {
            return '../'.repeat(depth);
        }
    }

    // Load and inject navigation components
    async loadNavigation() {
        if (this.loaded) return;
        
        try {
            const sidebarUrl = `${this.basePath}includes/nav-sidebar.html`;
            const mobileUrl = `${this.basePath}includes/nav-mobile.html`;
            
            console.log('Loading navigation from:', { sidebarUrl, mobileUrl, basePath: this.basePath });
            
            // Load sidebar navigation
            const sidebarResponse = await fetch(sidebarUrl);
            if (!sidebarResponse.ok) {
                throw new Error(`Failed to load sidebar: ${sidebarResponse.status}`);
            }
            let sidebarHtml = await sidebarResponse.text();
            
            // Load mobile navigation
            const mobileResponse = await fetch(mobileUrl);
            if (!mobileResponse.ok) {
                throw new Error(`Failed to load mobile nav: ${mobileResponse.status}`);
            }
            const mobileHtml = await mobileResponse.text();
            
            // Adjust navigation links based on current location
            sidebarHtml = this.adjustNavigationLinks(sidebarHtml);
            
            // Inject sidebar navigation
            const sidebarPlaceholder = document.querySelector('[data-nav-placeholder="sidebar"]');
            if (sidebarPlaceholder) {
                sidebarPlaceholder.outerHTML = sidebarHtml;
            }
            
            // Inject mobile navigation
            const mobilePlaceholder = document.querySelector('[data-nav-placeholder="mobile"]');
            if (mobilePlaceholder) {
                mobilePlaceholder.outerHTML = mobileHtml;
            }
            
            // Note: Active link highlighting has been removed as requested
            
            // Update page title in mobile navigation
            this.updatePageTitle();
            
            this.loaded = true;
            
            // Re-initialize any navigation scripts if needed
            this.reinitializeNavigation();
            
        } catch (error) {
            console.error('Failed to load navigation:', error);
            // Fallback: show navigation placeholders as visible
            this.showFallbackNavigation();
        }
    }

    // Adjust navigation links to work from any page location
    adjustNavigationLinks(html) {
        // Create a temporary element to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Get all anchor tags
        const links = tempDiv.querySelectorAll('a[href]');
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            
            // Skip external links and mailto links
            if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) {
                return;
            }
            
            // Adjust relative paths based on current location
            if (href.startsWith('../')) {
                // If we're already using relative paths, adjust them
                const adjustedHref = this.basePath + href.replace(/^\.\.\//, '');
                link.setAttribute('href', adjustedHref);
            } else if (!href.startsWith('/')) {
                // For relative paths without ../ prefix, add the base path
                link.setAttribute('href', this.basePath + href);
            }
        });
        
        return tempDiv.innerHTML;
    }

    // Note: Active link highlighting functionality has been removed as requested

    // Update page title in mobile navigation with smart truncation
    updatePageTitle() {
        const pageTitle = document.querySelector('[data-page-title]');
        if (pageTitle) {
            const title = document.title.split(' - ')[0]; // Get main title part
            pageTitle.textContent = this.truncateTitle(title);
        }
    }

    // Smart title truncation for mobile navigation
    truncateTitle(title) {
        // Common abbreviations for long titles
        const abbreviations = {
            'Yandex Cup ML 2025': 'Yandex Cup ML',
            'Large Language Models': 'LLM',
            'Visual Language Models': 'VLM',
            'STEM problem illustrations': 'STEM Illustrations',
            'hallucinations robustness': 'Hallucinations'
        };

        // Try to find and replace long phrases with abbreviations
        let truncatedTitle = title;
        for (const [long, short] of Object.entries(abbreviations)) {
            if (truncatedTitle.includes(long)) {
                truncatedTitle = truncatedTitle.replace(long, short);
            }
        }

        // If still too long, use ellipsis truncation (CSS will handle this)
        return truncatedTitle;
    }

    // Re-initialize navigation functionality
    reinitializeNavigation() {
        this.setupMobileNavigation();
    }

    // Setup mobile navigation functionality
    setupMobileNavigation() {
        const sidebar = document.querySelector('.sidebar');
        const menuButton = document.querySelector('.navigation-bar .button');
        const closeButton = document.querySelector('.sidebar .only-mobile');
        
        // Function to toggle the sidebar
        const toggleSidebar = () => {
            if (sidebar) {
                sidebar.classList.toggle('show');
                document.body.classList.toggle('menu-open', sidebar.classList.contains('show'));
            }
        };
        
        // Add click event listeners
        if (menuButton) {
            menuButton.addEventListener('click', toggleSidebar);
        }
        
        if (closeButton) {
            closeButton.addEventListener('click', toggleSidebar);
        }
        
        // Close sidebar when clicking on a link
        const navLinks = document.querySelectorAll('.sidebar a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 1024 && sidebar) {
                    sidebar.classList.remove('show');
                    document.body.classList.remove('menu-open');
                }
            });
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024 && 
                sidebar && 
                !e.target.closest('.sidebar') && 
                !e.target.closest('.navigation-bar') && 
                sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
                document.body.classList.remove('menu-open');
            }
        });

        // Add CSS for body state when menu is open
        if (!document.querySelector('#mobile-menu-styles')) {
            const style = document.createElement('style');
            style.id = 'mobile-menu-styles';
            style.textContent = `
                body.menu-open {
                    overflow: hidden;
                }
                
                /* Adjust navigation bar position - move it down slightly */
                .navigation-bar {
                    top: 8px;
                    border-radius: 8px;
                    margin: 8px;
                    backdrop-filter: saturate(180%) blur(20px);
                    background-color: rgba(0, 0, 0, 0.8);
                }
                
                /* Style for mobile devices */
                @media (max-width: 1024px) {
                    .navigation-bar {
                        margin: 8px;
                        border-radius: 8px;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Fallback: show navigation placeholders if loading fails
    showFallbackNavigation() {
        const placeholders = document.querySelectorAll('[data-nav-placeholder]');
        placeholders.forEach(placeholder => {
            placeholder.style.display = 'block';
            placeholder.innerHTML = '<p style="color: #666; padding: 1rem;">Navigation failed to load</p>';
        });
    }
}

// Initialize and load navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const loader = new NavigationLoader();
    loader.loadNavigation();
});
