// Auto-generate Table of Contents from headings
function generateTOC() {
    const mainContent = document.querySelector('.main-content');
    const tocLinks = document.querySelector('.toc-links');

    if (!mainContent || !tocLinks) return;

    const headings = mainContent.querySelectorAll('h2, h3');
    tocLinks.innerHTML = '';

    headings.forEach((heading, index) => {
        // Create anchor ID if it doesn't exist
        if (!heading.id) {
            heading.id = `heading-${index}`;
        }

        const link = document.createElement('a');
        link.href = `#${heading.id}`;
        link.className = `toc-link ${heading.tagName === 'H3' ? 'level-3' : ''}`;
        link.textContent = heading.textContent;
        tocLinks.appendChild(link);
    });

    // Add scroll spy
    addScrollSpy();
}

function addScrollSpy() {
    const tocLinks = document.querySelectorAll('.toc-link');
    const headings = document.querySelectorAll('.main-content h2, .main-content h3');

    if (!tocLinks.length || !headings.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                tocLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        rootMargin: '-80px 0px -80% 0px'
    });

    headings.forEach(heading => observer.observe(heading));
}

// Initialize TOC when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', generateTOC);
} else {
    generateTOC();
}
