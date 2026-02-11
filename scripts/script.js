const state = {
    files: new Map(),
    currentFileId: null,
    currentSection: null
};

const sidebarHeader = document.getElementById('sidebar-header');
const sidebarNav = document.getElementById('sidebar-nav');
const sidebarFooter = document.getElementById('sidebar-footer');
const contentBody = document.getElementById('content-body');
const breadcrumb = document.getElementById('breadcrumb');
const toggleSidebar = document.getElementById('toggle-sidebar');
const sidebar = document.querySelector('.sidebar');
const scrollTopBtn = document.getElementById('scroll-top');
const searchInput = document.getElementById('search-input');

async function init() {
    try {
        populateSidebarHeaderFooter();
        await loadMarkdownFiles();
        populateSidebar();
        setupEventListeners();
        showWelcomeScreen();
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Failed to load documentation files');
    }
}

function populateSidebarHeaderFooter() {
    sidebarHeader.innerHTML = `
        <h1>${DOCS_CONFIG.siteTitle}</h1>
        <p>${DOCS_CONFIG.siteSubtitle}</p>
    `;

    const footerLinksHTML = DOCS_CONFIG.footerLinks.map(link =>
        `<a href="${link.url}" target="_blank">${link.text}</a>`
    ).join('');

    sidebarFooter.innerHTML = `
        ${footerLinksHTML}
        <p>${DOCS_CONFIG.footerText}</p>
    `;
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

function extractTopics(markdown) {
    const topics = [];
    const lines = markdown.split('\n');
    const headingLevel = DOCS_CONFIG.navigationHeadingLevel || 2;
    const headingPattern = new RegExp(`^${'#'.repeat(headingLevel)}\\s+(.+)$`);

    for (let line of lines) {
        const match = line.match(headingPattern);
        if (match) {
            const title = match[1].trim();
            if (!title.toLowerCase().includes('table of contents') &&
                !title.toLowerCase().includes('from basic to advanced')) {
                topics.push({
                    title: title,
                    id: title.toLowerCase()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/\s+/g, '-')
                });
            }
        }
    }

    return topics;
}

// Populate sidebar with topics from all files
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
                const topics = extractTopics(fileData.content);

                // Show file name if multiple files in section OR if config says so
                if (section.files.length > 1 || DOCS_CONFIG.showFileNameInNav) {
                    navHTML += `<li class="file-header" title="${fileConfig.name}">📄 ${fileConfig.name}</li>`;
                }

                // Add all topics from this file
                if (topics.length === 0) {
                    navHTML += `<li class="no-topics">No headings found in this file</li>`;
                } else {
                    topics.forEach(topic => {
                        navHTML += `<li class="topic-item" data-file-id="${fileConfig.id}" data-section="${topic.id}">${topic.title}</li>`;
                    });
                }
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

    // Add click listeners to all topic items
    document.querySelectorAll('.nav-section li.topic-item').forEach(item => {
        item.addEventListener('click', () => {
            const fileId = item.dataset.fileId;
            const section = item.dataset.section;
            loadSection(fileId, section);

            // Update active state
            document.querySelectorAll('.nav-section li.topic-item').forEach(li => li.classList.remove('active'));
            item.classList.add('active');

            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });
    });
}

// Load and display a specific section
function loadSection(fileId, sectionId) {
    const fileData = state.files.get(fileId);

    if (!fileData) {
        showError('File not found');
        return;
    }

    // Find the section in the markdown
    const section = extractSection(fileData.content, sectionId);

    if (section) {
        // Convert markdown to HTML
        const html = marked.parse(section);

        // Display content
        contentBody.innerHTML = `<div class="markdown-content">${html}</div>`;

        // Apply syntax highlighting
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });

        // Update breadcrumb
        updateBreadcrumb(fileData.name, sectionId);

        // Scroll to top
        contentBody.scrollTop = 0;

        // Update state
        state.currentFileId = fileId;
        state.currentSection = sectionId;
    } else {
        showError('Section not found');
    }
}

// Extract a specific section from markdown
function extractSection(markdown, sectionId) {
    const lines = markdown.split('\n');
    let inSection = false;
    let sectionContent = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check if this is the start of our section
        if (line.match(/^##\s+/)) {
            const title = line.replace(/^##\s+/, '').trim();
            const id = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

            if (id === sectionId) {
                inSection = true;
                sectionContent.push(line);
                continue;
            } else if (inSection) {
                // We've hit the next section, stop
                break;
            }
        }

        if (inSection) {
            sectionContent.push(line);
        }
    }

    return sectionContent.join('\n');
}

// Update breadcrumb navigation
function updateBreadcrumb(fileName, sectionId) {
    const sectionName = sectionId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    breadcrumb.innerHTML = `
        <span>Home</span>
        <span>›</span>
        <span>${fileName}</span>
        <span>›</span>
        <span>${sectionName}</span>
    `;
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
            const topics = extractTopics(loadedFiles[0].content);
            if (topics.length > 0) {
                setTimeout(() => {
                    loadSection(loadedFiles[0].id, topics[0].id);

                    // Highlight in sidebar
                    const listItem = document.querySelector(`li[data-file-id="${loadedFiles[0].id}"][data-section="${topics[0].id}"]`);
                    if (listItem) {
                        listItem.classList.add('active');
                    }
                }, 500);
            }
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

    // Add each file's topics (table of contents)
    files.forEach(file => {
        const topics = extractTopics(file.content);

        // Create file header with remove button
        const fileHeaderLi = document.createElement('li');
        fileHeaderLi.className = 'file-header';
        fileHeaderLi.dataset.fileId = file.id;
        fileHeaderLi.title = file.name;
        fileHeaderLi.innerHTML = `
            <span class="file-name">📄 ${file.name}</span>
            <button class="remove-file-btn" data-file-id="${file.id}" title="Remove this file">✕</button>
        `;
        uploadedNav.appendChild(fileHeaderLi);

        // Add remove button click handler
        const removeBtn = fileHeaderLi.querySelector('.remove-file-btn');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeUploadedFile(file.id);
        });

        // Add all topics from this file
        if (topics.length === 0) {
            // If no topics found, show a message
            const noTopicsLi = document.createElement('li');
            noTopicsLi.className = 'no-topics';
            noTopicsLi.dataset.fileId = file.id;
            noTopicsLi.textContent = 'No headings found in this file';
            uploadedNav.appendChild(noTopicsLi);
        } else {
            topics.forEach(topic => {
                const li = document.createElement('li');
                li.dataset.fileId = file.id;
                li.dataset.section = topic.id;
                li.textContent = topic.title;
                li.classList.add('topic-item');

                li.addEventListener('click', () => {
                    loadSection(file.id, topic.id);

                    // Update active state
                    document.querySelectorAll('.nav-section li.topic-item').forEach(item => item.classList.remove('active'));
                    li.classList.add('active');

                    // Close sidebar on mobile
                    if (window.innerWidth <= 768) {
                        sidebar.classList.remove('active');
                    }
                });

                uploadedNav.appendChild(li);
            });
        }
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
    const topNav = document.querySelector('.content-header');

    contentBody.addEventListener('scroll', () => {
        const scrollTop = contentBody.scrollTop;

        // Auto-hide/show top nav based on scroll direction
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down - hide nav
            topNav.classList.add('nav-hidden');
        } else {
            // Scrolling up - show nav
            topNav.classList.remove('nav-hidden');
        }

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

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterTopics(searchTerm);
    });

    // Quick link cards - use event delegation since they're dynamically created
    contentBody.addEventListener('click', (e) => {
        const card = e.target.closest('.quick-link-card');
        if (card) {
            const fileId = card.dataset.fileId;
            const fileData = state.files.get(fileId);

            if (fileData) {
                const topics = extractTopics(fileData.content);

                if (topics.length > 0) {
                    loadSection(fileId, topics[0].id);

                    // Highlight in sidebar
                    const listItem = document.querySelector(`li[data-file-id="${fileId}"][data-section="${topics[0].id}"]`);
                    if (listItem) {
                        document.querySelectorAll('.nav-section li').forEach(li => li.classList.remove('active'));
                        listItem.classList.add('active');
                    }
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

// Filter topics based on search term
function filterTopics(searchTerm) {
    document.querySelectorAll('.nav-section li').forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
