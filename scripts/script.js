const state = {
    files: new Map(),
    currentFileId: null,
    currentSection: null
};

const sidebarNav = document.getElementById('sidebar-nav');
const contentBody = document.getElementById('content-body');
const breadcrumb = document.getElementById('breadcrumb');
const toggleSidebar = document.getElementById('toggle-sidebar');
const sidebar = document.querySelector('.sidebar');
const scrollTopBtn = document.getElementById('scroll-top');

async function init() {
    try {
        await loadMarkdownFiles();
        populateSidebar();
        setupEventListeners();
        showWelcomeScreen();
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Failed to load documentation files');
    }
}

async function loadMarkdownFiles() {
    try {
        const filePromises = [];

        DOCS_CONFIG.sections.forEach(section => {
            section.files.forEach(file => {
                filePromises.push(
                    fetch(file.file)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`Failed to fetch ${file.file}`);
                            }
                            return response.text();
                        })
                        .then(content => ({
                            id: file.id,
                            name: file.name,
                            content: content,
                            sectionId: section.id
                        }))
                );
            });
        });

        const results = await Promise.all(filePromises);

        results.forEach(result => {
            state.files.set(result.id, result);
        });

        // Load uploaded files from localStorage
        loadUploadedFilesFromStorage();

    } catch (error) {
        console.error('Error loading markdown files:', error);
        throw error;
    }
}

// Load uploaded files from localStorage
function loadUploadedFilesFromStorage() {
    try {
        const savedFiles = localStorage.getItem('uploadedFiles');
        if (savedFiles) {
            const files = JSON.parse(savedFiles);
            files.forEach(file => {
                state.files.set(file.id, file);
            });
        }
    } catch (error) {
        console.error('Error loading files from storage:', error);
    }
}

// Save uploaded files to localStorage
function saveUploadedFilesToStorage() {
    try {
        const uploadedFiles = Array.from(state.files.values()).filter(file => file.sectionId === 'uploaded');
        localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
    } catch (error) {
        console.error('Error saving files to storage:', error);
    }
}

// Parse markdown and return parsed HTML
function parseMarkdown(markdown) {
    return marked.parse(markdown);
}

// Populate sidebar with files - just add files as clickable items
function populateSidebar() {
    let navHTML = '';

    // Iterate through each section in config
    DOCS_CONFIG.sections.forEach(section => {
        navHTML += `<div class="nav-section">`;
        navHTML += `<h3>${section.name}</h3>`;
        navHTML += `<ul>`;

        // Iterate through each file in the section
        section.files.forEach(fileConfig => {
            const fileData = state.files.get(fileConfig.id);

            if (fileData) {
                // Add file as a clickable item
                navHTML += `<li class="file-item" data-file-id="${fileConfig.id}">📄 ${fileConfig.name}</li>`;
            }
        });

        navHTML += `</ul>`;
        navHTML += `</div>`;
    });

    sidebarNav.innerHTML = navHTML;

    // Add uploaded files to sidebar if they exist
    const uploadedFiles = Array.from(state.files.values()).filter(file => file.sectionId === 'uploaded');
    if (uploadedFiles.length > 0) {
        addUploadedFilesToSidebar(uploadedFiles);
    }

    // Add click listeners to all file items
    document.querySelectorAll('.file-item').forEach(item => {
        item.addEventListener('click', () => {
            const fileId = item.dataset.fileId;
            loadFullFile(fileId);

            // Update active state
            document.querySelectorAll('.file-item, .uploaded-file-item').forEach(li => li.classList.remove('active'));
            item.classList.add('active');

            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });
    });
}

// Extract headings from markdown content
function extractHeadings(content) {
    const headings = [];
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
        const level = match[1].length; // 1-6
        const title = match[2];
        headings.push({ level, title });
    }

    return headings;
}

// Generate slug from heading text
function generateSlug(text) {
    let slug = text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

    // Ensure ID doesn't start with a digit (invalid CSS selector)
    if (/^\d/.test(slug)) {
        slug = 'h-' + slug;
    }

    return slug || 'heading';
}

// Add IDs to headings in HTML content
function addHeadingIds(html) {
    // Match heading tags and add IDs
    return html.replace(/<(h[1-6])>(.+?)<\/\1>/g, (match, tag, content) => {
        const id = generateSlug(content);
        return `<${tag} id="${id}">${content}</${tag}>`;
    });
}

// Create table of contents
function createTableOfContents(headings) {
    if (headings.length === 0) return '';
    let tocHTML = '<nav class="table-of-contents"><h3>Contents</h3>' +
        '<div class="toc-search-wrap"><input type="search" id="toc-search" placeholder="Search contents..." aria-label="Search contents"></div>' +
        '<ul class="toc-list">';
    let currentLevel = 0;
    const openLists = [];

    headings.forEach((heading) => {
        const slug = generateSlug(heading.title);

        // Handle level changes
        while (currentLevel < heading.level) {
            tocHTML += '<ul>';
            openLists.push('</ul>');
            currentLevel++;
        }

        while (currentLevel > heading.level) {
            tocHTML += openLists.pop();
            currentLevel--;
        }

        tocHTML += `<li title="${heading.title}"><a href="#${slug}" class="toc-link">${heading.title}</a></li>`;
    });

    // Close remaining open lists
    while (openLists.length > 0) {
        tocHTML += openLists.pop();
    }

    tocHTML += '</ul></nav>';
    return tocHTML;
}

// Load and display full markdown file with TOC
function loadFullFile(fileId) {
    const fileData = state.files.get(fileId);

    if (!fileData) {
        showError('File not found');
        return;
    }

    // Extract headings before parsing
    const headings = extractHeadings(fileData.content);

    // Convert markdown to HTML
    let html = marked.parse(fileData.content);

    // Add IDs to headings for anchor linking
    html = addHeadingIds(html);

    // Create table of contents
    const toc = createTableOfContents(headings);

    // Display content with TOC
    contentBody.innerHTML = `
        <div class="markdown-container">
            <div class="markdown-content">${html}</div>
            ${toc}
        </div>
    `;

    // Apply syntax highlighting
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });

    // Setup TOC click handlers
    document.querySelectorAll('.toc-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            const headingId = href.startsWith('#') ? href.substring(1) : href;
            const target = document.getElementById(headingId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Highlight the heading
                target.classList.add('highlight');
                setTimeout(() => target.classList.remove('highlight'), 2000);
            }
        });
    });

    // TOC search/filter behavior
    const tocSearch = document.getElementById('toc-search');
    if (tocSearch) {
        const tocListItems = Array.from(document.querySelectorAll('.table-of-contents .toc-list li'));

        function applyFilter() {
            const q = tocSearch.value.trim().toLowerCase();
            tocListItems.forEach(li => {
                const text = li.textContent.trim().toLowerCase();
                if (q === '' || text.indexOf(q) !== -1) {
                    li.style.display = '';
                } else {
                    li.style.display = 'none';
                }
            });
        }

        tocSearch.addEventListener('input', applyFilter);

        // Keyboard navigation inside TOC search: ArrowDown/ArrowUp to move, Enter to activate
        tocSearch.addEventListener('keydown', (ev) => {
            const visibleLinks = Array.from(document.querySelectorAll('.table-of-contents .toc-list li'))
                .filter(li => li.style.display !== 'none')
                .map(li => li.querySelector('.toc-link'))
                .filter(Boolean);

            if (visibleLinks.length === 0) return;

            const active = document.activeElement;
            let idx = visibleLinks.indexOf(active);

            if (ev.key === 'ArrowDown') {
                ev.preventDefault();
                const next = visibleLinks[Math.min(idx + 1, visibleLinks.length - 1)];
                if (next) next.focus();
            } else if (ev.key === 'ArrowUp') {
                ev.preventDefault();
                const prev = visibleLinks[Math.max(idx - 1, 0)];
                if (prev) prev.focus();
            }
        });

        // Allow Enter on focused link to trigger scroll
        document.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' && document.activeElement && document.activeElement.classList.contains('toc-link')) {
                document.activeElement.click();
            }
        });
    }

    // Scroll to top
    contentBody.scrollTop = 0;

    // Update state
    state.currentFileId = fileId;
}



// Show error message
function showError(message) {
    contentBody.innerHTML = `
        <div class="welcome-screen">
            <h1>⚠️ Error</h1>
            <p>${message}</p>
        </div>
    `;
}

// Show welcome screen with file upload option
function showWelcomeScreen() {
    const quickLinksHTML = DOCS_CONFIG.welcome.quickLinks && DOCS_CONFIG.welcome.quickLinks.length > 0
        ? `<div class="quick-links">
            ${DOCS_CONFIG.welcome.quickLinks.map(link => `
                <div class="quick-link-card" data-file-id="${link.fileId}" style="background: ${link.gradient}">
                    <h3>${link.title}</h3>
                    <p>${link.description}</p>
                </div>
            `).join('')}
           </div>`
        : '';

    const statsHTML = DOCS_CONFIG.welcome.stats && DOCS_CONFIG.welcome.stats.length > 0
        ? `<div class="stats">
            ${DOCS_CONFIG.welcome.stats.map(stat => `
                <div class="stat-item">
                    <h4>${stat.value}</h4>
                    <p>${stat.label}</p>
                </div>
            `).join('')}
           </div>`
        : '';

    contentBody.innerHTML = `
        <div class="welcome-screen">
            <h1>${DOCS_CONFIG.welcome.title}</h1>
            <p>${DOCS_CONFIG.welcome.subtitle}</p>

            <div class="file-upload-section">
                <h3>📁 Load Your Markdown Files</h3>
                <div class="upload-area" id="upload-area">
                    <input type="file" id="file-input" accept=".md,.markdown" multiple style="display: none;">
                    <button id="upload-btn" class="upload-btn">
                        📤 Choose Markdown Files
                    </button>
                    <p class="upload-hint">or drag and drop .md files here</p>
                </div>
                <div id="loaded-files-list" class="loaded-files-list"></div>
            </div>

            ${quickLinksHTML}
            ${statsHTML}
        </div>
    `;

    // Setup file upload listeners
    setupFileUpload();
}

// Setup file upload functionality
function setupFileUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');

    // Click to upload
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }

    // File selection
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });
}

// Handle uploaded files
async function handleFiles(files) {
    const loadedFilesList = document.getElementById('loaded-files-list');
    const mdFiles = Array.from(files).filter(file =>
        file.name.endsWith('.md') || file.name.endsWith('.markdown')
    );

    if (mdFiles.length === 0) {
        alert('Please select markdown (.md) files');
        return;
    }

    // Check for duplicates before reading files
    const duplicates = [];
    const newFiles = [];

    mdFiles.forEach(file => {
        const fileId = 'uploaded-' + file.name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9]/g, '-');
        if (state.files.has(fileId)) {
            duplicates.push(file.name);
        } else {
            newFiles.push(file);
        }
    });

    // Show warning if duplicates found
    if (duplicates.length > 0) {
        const message = `The following file(s) are already uploaded:\n${duplicates.join('\n')}\n\nThey will be skipped.`;
        alert(message);
    }

    // If no new files to upload, return
    if (newFiles.length === 0) {
        return;
    }

    // Read all new files
    const filePromises = newFiles.map(file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                const fileId = 'uploaded-' + file.name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9]/g, '-');
                resolve({
                    id: fileId,
                    name: file.name.replace(/\.[^/.]+$/, ''),
                    content: content,
                    sectionId: 'uploaded'
                });
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    });

    try {
        const loadedFiles = await Promise.all(filePromises);

        // Add to state
        loadedFiles.forEach(file => {
            state.files.set(file.id, file);
        });

        // Save to localStorage
        saveUploadedFilesToStorage();

        // Update sidebar with new files
        addUploadedFilesToSidebar(loadedFiles);

        // Show loaded files
        const duplicateInfo = duplicates.length > 0
            ? `<p style="color: #ff9800; margin-top: 10px;">⚠️ ${duplicates.length} duplicate file(s) skipped</p>`
            : '';

        loadedFilesList.innerHTML = `
            <div class="success-message">
                ✅ Successfully loaded ${loadedFiles.length} file(s):
                <ul>
                    ${loadedFiles.map(f => `<li>${f.name}</li>`).join('')}
                </ul>
                ${duplicateInfo}
            </div>
        `;

        // Auto-load first file
        if (loadedFiles.length > 0) {
            setTimeout(() => {
                loadFullFile(loadedFiles[0].id);

                // Highlight in sidebar
                const listItem = document.querySelector(`li[data-file-id="${loadedFiles[0].id}"]`);
                if (listItem) {
                    listItem.classList.add('active');
                }
            }, 500);
        }

    } catch (error) {
        console.error('Error loading files:', error);
        // alert('Error loading files. Please try again.');
    }
}

// Add uploaded files to sidebar
function addUploadedFilesToSidebar(files) {
    // Check if "Uploaded Files" section exists
    let uploadedSection = document.querySelector('.nav-section[data-section-id="uploaded"]');

    if (!uploadedSection) {
        // Create new section at the top
        const navHTML = `
            <div class="nav-section" data-section-id="uploaded">
                <h3>📤 Uploaded Files</h3>
                <ul id="uploaded-files-nav"></ul>
            </div>
        `;
        sidebarNav.insertAdjacentHTML('afterbegin', navHTML);
        uploadedSection = document.querySelector('.nav-section[data-section-id="uploaded"]');
    }

    const uploadedNav = document.getElementById('uploaded-files-nav');

    // Add each file
    files.forEach(file => {
        // Create file item with remove button
        const fileLi = document.createElement('li');
        fileLi.className = 'uploaded-file-item';
        fileLi.title = file.name;
        fileLi.dataset.fileId = file.id;
        fileLi.innerHTML = `
            <span class="file-name">📄 ${file.name}</span>
            <button class="remove-file-btn" data-file-id="${file.id}" title="Remove this file">✕</button>
        `;
        uploadedNav.appendChild(fileLi);

        // Add click handler to open file
        // const fileSpan = fileLi.querySelector('.file-name');
        fileLi.addEventListener('click', (e) => {
            e.stopPropagation();
            loadFullFile(file.id);

            // Update active state
            document.querySelectorAll('.file-item, .uploaded-file-item').forEach(li => li.classList.remove('active'));
            fileLi.classList.add('active');

            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });

        // Add remove button click handler
        const removeBtn = fileLi.querySelector('.remove-file-btn');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeUploadedFile(file.id);
        });
    });
}

// Remove uploaded file
function removeUploadedFile(fileId) {
    // Confirm removal
    if (!confirm('Are you sure you want to remove this file?')) {
        return;
    }

    // Remove from state
    state.files.delete(fileId);

    // Update localStorage
    saveUploadedFilesToStorage();

    // Remove from sidebar - find all elements with this fileId
    const uploadedNav = document.getElementById('uploaded-files-nav');
    const elementsToRemove = uploadedNav.querySelectorAll(`[data-file-id="${fileId}"]`);
    elementsToRemove.forEach(el => el.remove());

    // If no more uploaded files, remove the entire section
    if (uploadedNav.children.length === 0) {
        const uploadedSection = document.querySelector('.nav-section[data-section-id="uploaded"]');
        if (uploadedSection) {
            uploadedSection.remove();
        }
    }

    // If the removed file was currently displayed, show welcome screen
    if (state.currentFileId === fileId) {
        showWelcomeScreen();
    }

    // Show success message
    showNotification('File removed successfully', 'success');
}

// Show notification message
function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Setup event listeners
function setupEventListeners() {
    // Toggle sidebar (works on both mobile and desktop)
    toggleSidebar.addEventListener('click', () => {
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            // On mobile, toggle 'active' class for slide-in effect
            sidebar.classList.toggle('active');
        } else {
            // On desktop, toggle 'sidebar-hidden' class
            sidebar.classList.toggle('sidebar-hidden');

            // Save sidebar state to localStorage (desktop only)
            const isHidden = sidebar.classList.contains('sidebar-hidden');
            localStorage.setItem('sidebarHidden', isHidden);
        }
    });

    // Restore sidebar state from localStorage (desktop only)
    if (window.innerWidth > 768) {
        const sidebarHidden = localStorage.getItem('sidebarHidden') === 'true';
        if (sidebarHidden) {
            sidebar.classList.add('sidebar-hidden');
        }
    }

    // Auto-hide top nav on scroll
    let lastScrollTop = 0;

    contentBody.addEventListener('scroll', () => {
        const scrollTop = contentBody.scrollTop;

        lastScrollTop = scrollTop;

        // Show/hide scroll to top button
        if (scrollTop > 300) {
            scrollTopBtn.style.display = 'flex';
        } else {
            scrollTopBtn.style.display = 'none';
        }
    });

    // Scroll to top button
    scrollTopBtn.addEventListener('click', () => {
        contentBody.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Quick link cards - use event delegation since they're dynamically created
    contentBody.addEventListener('click', (e) => {
        const card = e.target.closest('.quick-link-card');
        if (card) {
            const fileId = card.dataset.fileId;
            const fileData = state.files.get(fileId);

            if (fileData) {
                loadFullFile(fileId);

                // Highlight in sidebar
                const listItem = document.querySelector(`li[data-file-id="${fileId}"]`);
                if (listItem) {
                    document.querySelectorAll('.file-item, .uploaded-file-item').forEach(li => li.classList.remove('active'));
                    listItem.classList.add('active');
                }
            }
        }
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 &&
            !sidebar.contains(e.target) &&
            !toggleSidebar.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });

    // Setup header upload button
    setupHeaderUpload();
}

// Setup header upload button (always visible)
function setupHeaderUpload() {
    const headerFileInput = document.getElementById('header-file-input');
    const headerUploadBtn = document.getElementById('header-upload-btn');

    if (headerUploadBtn && headerFileInput) {
        headerUploadBtn.addEventListener('click', () => {
            headerFileInput.click();
        });

        headerFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFiles(e.target.files);
                // Reset input so same file can be uploaded again
                e.target.value = '';
            }
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
