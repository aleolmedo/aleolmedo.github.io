// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.sidebar');
    const menuButton = document.querySelector('.navigation-bar .button');
    const closeButton = document.querySelector('.sidebar .only-mobile');
    const navigationBar = document.querySelector('.navigation-bar');
    
    // Function to toggle the sidebar
    function toggleSidebar() {
        sidebar.classList.toggle('show');
        
        // Add body class to prevent scrolling when menu is open
        document.body.classList.toggle('menu-open', sidebar.classList.contains('show'));
    }
    
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
            if (window.innerWidth <= 1024) {
                sidebar.classList.remove('show');
                document.body.classList.remove('menu-open');
            }
        });
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 1024 && 
            !e.target.closest('.sidebar') && 
            !e.target.closest('.navigation-bar') && 
            sidebar.classList.contains('show')) {
            sidebar.classList.remove('show');
            document.body.classList.remove('menu-open');
        }
    });
    
    // Update the title in the mobile navigation bar
    const titleElement = document.querySelector('.navigation-bar .title');
    if (titleElement) {
        // Use the text from the active link
        const activeLink = document.querySelector('.sidebar a.active');
        if (activeLink) {
            titleElement.textContent = activeLink.textContent.trim();
        }
    }
});

// Add CSS for body state when menu is open
const style = document.createElement('style');
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