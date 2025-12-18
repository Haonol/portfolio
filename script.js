document.addEventListener('DOMContentLoaded', () => {
    const initialData = {
        profile: { 
            name: "서동원", 
            english_name: "Dongwon Seo", 
            affiliation: "기계공학과 석사과정 | 국립금오공과대학교", 
            headline: "Tribology Researcher & AI-driven Energy Harvester Enthusiast",
            research_tags: "Tribology, TENG, MOFs, AI for Materials", 
            body: "저는 마찰공학(Tribology)과 마찰전기 나노발전기(TENG)를 핵심 연구 분야로 다루고 있습니다. 특히, 금속 유기 구조체(MOFs)의 적용과 인공지능(AI) 기술을 융합하여 에너지 하베스팅 및 표면 공학 분야의 새로운 가능성을 탐구하는 데 집중하고 있습니다.", 
            avatar: "https://i.imgur.com/81BCR6A.png",
            cv_link: "#", 
            email: "your.email@example.com", 
            google_scholar: "https://scholar.google.com/citations?user=yourid", 
            linkedin: "#" 
        },
        publications: [
            { title: "Scott-Russel linkage-based triboelectric self-powered sensor for contact material-independent force sensing and tactile recognition", authors: "<strong>Dongwon Seo</strong>, Jimin Kong, and Jihoon Chung*", journal: "<em>Small</em> (2023 IF: 13.0, JCR Top 10%)", year: "2024", link_text: "DOI", link_url: "#" },
            { title: "Vertical Contact/Separation Triboelectric Generator Utilizing Surface Characteristics of Metal-Organic Frameworks", authors: "Kyoung-Hwan Kim, Jimin Kong, <strong>Dongwon Seo</strong>, and Jihoon Chung*", journal: "<em>Journal of the Korean Society of Manufacturing Process Engineers (KCI)</em>", year: "2025", link_text: "Link", link_url: "#" }
        ],
        conferences: [
            { title: "Pantograph Structure based Self-powered Force Sensor", description: "SPIE in Los Angeles 2024" },
            { title: "Optimized Spinning-Wheel Design for Enhanced Electrical Output", description: "KSMPE Fall Conference 2024" }
        ],
        education: [
            { title: "M.S. in Mechanical Engineering", description: "Kumoh National Institute of Technology, 2024 - Present" },
            { title: "B.S. in Mechanical Engineering", description: "Kumoh National Institute of Technology, 2020 - 2024" }
        ],
        awards: [
            { title: "Best Poster Award", description: "The Korean Society of Tribologists and Lubrication Engineers (KSTLE), 2025" }
        ]
    };

    let siteData;
    let adminMode = false;
    let editIndex = null;
    let passwordPurpose = 'login'; 

    const allowedTags = ['STRONG', 'EM', 'A', 'SPAN', 'BR'];
    const allowedAttributes = { 'A': ['href', 'target', 'rel', 'title'] };

    function sanitizeHtml(input) {
        if (!input) return '';
        const parser = new DOMParser();
        const doc = parser.parseFromString(input, 'text/html');
        doc.querySelectorAll('script, style, iframe, object, embed').forEach(el => el.remove());
        doc.querySelectorAll('*').forEach(node => {
            if (!allowedTags.includes(node.tagName)) {
                const textNode = document.createTextNode(node.textContent);
                node.replaceWith(textNode);
                return;
            }
            [...node.attributes].forEach(attr => {
                const isAllowed = (allowedAttributes[node.tagName] || []).includes(attr.name.toLowerCase());
                if (!isAllowed) {
                    node.removeAttribute(attr.name);
                    return;
                }
                if (attr.name.toLowerCase() === 'href' && !/^https?:|mailto:/i.test(attr.value)) {
                    node.removeAttribute(attr.name);
                }
            });
            if (node.tagName === 'A') {
                node.setAttribute('rel', 'noopener noreferrer');
                if (!node.getAttribute('target')) {
                    node.setAttribute('target', '_blank');
                }
            }
        });
        return doc.body.innerHTML;
    }

    function sanitizeUrl(url, { allowMailto = false } = {}) {
        if (!url) return '';
        const trimmed = url.trim();
        if (/^https?:\/\//i.test(trimmed)) return trimmed;
        if (allowMailto && /^mailto:[^\s]+$/i.test(trimmed)) return trimmed;
        return '';
    }

    function escapeAttribute(value = '') {
        return sanitizeHtml(value).replace(/"/g, '&quot;');
    }

    const passwordModal = document.getElementById('password-modal');
    const editModal = document.getElementById('edit-modal');
    const adminFab = document.getElementById('admin-fab');

    function parseMaybeString(data) {
        if (typeof data === 'string') {
            try {
                return JSON.parse(data);
            } catch (error) {
                console.warn('Failed to parse server data string, using defaults instead.', error);
                return null;
            }
        }
        return data;
    }

    function mergeWithDefaults(remoteData = {}) {
        const parsed = parseMaybeString(remoteData);
        const safeData = typeof parsed === 'object' && parsed !== null ? parsed : {};
        return {
            profile: { ...initialData.profile, ...safeData.profile },
            publications: Array.isArray(safeData.publications) ? safeData.publications : initialData.publications,
            conferences: Array.isArray(safeData.conferences) ? safeData.conferences : initialData.conferences,
            education: Array.isArray(safeData.education) ? safeData.education : initialData.education,
            awards: Array.isArray(safeData.awards) ? safeData.awards : initialData.awards,
        };
    }

    async function loadData() {
        try {
            const response = await fetch('/api/get-data');
            if (!response.ok) { throw new Error(`Server responded with ${response.status}`); }
            const dataFromServer = await response.json();
            siteData = mergeWithDefaults(dataFromServer && (dataFromServer.profile || typeof dataFromServer === 'string') ? dataFromServer : initialData);
        } catch (error) {
            console.error("Failed to load data from server. Using initial default data.", error);
            siteData = mergeWithDefaults(initialData);
        }
        renderAll();
    }

    async function performSave(password) {
        const updatedData = mergeWithDefaults(siteData);

        document.querySelectorAll('[data-editable]').forEach(el => {
            const keys = el.dataset.editable.split('.');
            let temp = updatedData;
            for (let i = 0; i < keys.length - 1; i++) { temp = temp[keys[i]]; }
            let value = sanitizeHtml(el.innerHTML);
            if (el.dataset.editable === 'profile.research_tags') {
                value = el.textContent.split(',').map(tag => sanitizeHtml(tag.trim())).filter(Boolean).join(', ');
            }
            temp[keys[keys.length - 1]] = value;
        });
        siteData = updatedData;

        try {
            const response = await fetch('/api/save-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, data: updatedData }),
            });
            const result = await response.json();
            if (response.ok) {
                alert(result.message || '성공적으로 저장되었습니다!');
                exitAdminMode();
            } else {
                throw new Error(result.error || '알 수 없는 서버 오류가 발생했습니다.');
            }
        } catch (error) {
            alert(`저장에 실패했습니다: ${error.message}`);
        }
    }

    function renderAll() {
        if (!siteData) return;
        renderProfile(siteData.profile);
        renderPublications(siteData.publications);
        renderList('conferences-list', siteData.conferences, 'conferences');
        renderList('education-list', siteData.education, 'education');
        renderList('awards-list', siteData.awards, 'awards');
        document.getElementById('current-year').textContent = new Date().getFullYear();
        updateAdminUI();
    }
    
    function renderProfile(data) {
        const container = document.getElementById('about');
        if(!container || !data) return;
        const name = sanitizeHtml(data.name);
        const affiliation = sanitizeHtml(data.affiliation);
        const headline = sanitizeHtml(data.headline || '');
        const body = sanitizeHtml(data.body);
        const researchTags = (data.research_tags || '').split(',').map(tag => tag.trim()).filter(Boolean);
        const avatar = sanitizeUrl(data.avatar) || 'https://i.imgur.com/81BCR6A.png';
        const cvLink = sanitizeUrl(data.cv_link) || '#';
        const scholarLink = sanitizeUrl(data.google_scholar) || '#';
        const emailHref = sanitizeUrl(`mailto:${data.email}`, { allowMailto: true }) || '#';
        container.innerHTML = `
            <div class="flex flex-col md:flex-row items-center justify-center gap-10 bg-white p-10 rounded-2xl shadow-2xl profile-card">
                <div class="md:w-auto md:flex-shrink-0">
                    <div id="profile-image-wrapper" class="profile-image-wrapper mx-auto">
                        <img id="profile-avatar" src="${avatar}" alt="프로필 사진">
                        <button id="change-photo-btn" class="admin-only-feature">사진 변경</button>
                    </div>
                </div>
                <div class="md:w-2/3 space-y-4">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold shadow-sm">현 연구 주제</div>
                    <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight text-center md:text-left" data-editable="profile.name">${name}</h1>
                    <p class="text-lg text-gray-600 font-semibold" data-editable="profile.headline">${headline}</p>
                    <p class="text-xl text-indigo-600 font-semibold" data-editable="profile.affiliation">${affiliation}</p>
                    <p class="mb-6 text-base leading-relaxed text-gray-700" data-editable="profile.body">${body}</p>
                    <div class="flex flex-wrap gap-2" aria-label="연구 키워드" data-editable="profile.research_tags">${researchTags.map(tag => `<span class="tag-pill">${sanitizeHtml(tag)}</span>`).join('<span class="tag-separator">, </span>')}</div>
                    <div class="flex items-center flex-wrap gap-4">
                        <a href="${cvLink}" class="primary-button">CV 다운로드</a>
                        <a href="${emailHref}" title="Email" class="social-icon-link enhanced-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                        </a>
                        <a href="${scholarLink}" target="_blank" rel="noopener noreferrer" title="Google Scholar" class="social-icon-link enhanced-icon">
                            <svg fill="currentColor" viewBox="0 0 24 24"><path d="M5.242 13.769L0 9.5L12 0l12 9.5l-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5s-5.548 1.748-6.758 4.269zM12 10.9c-1.39 0-2.583.52-3.483 1.343l3.483 2.829l3.483-2.829C14.583 11.42 13.39 10.9 12 10.9z"/></svg>
                        </a>
                    </div>
                </div>
            </div>`;
        document.getElementById('nav-logo').innerHTML = sanitizeHtml(data.english_name);
        document.getElementById('footer-name').innerHTML = sanitizeHtml(data.english_name);
    }

    function renderPublications(data) {
        const container = document.getElementById('publications-container');
        if (!container) return;
        
        container.innerHTML = (data || []).map((item, index) => {
            const styledJournal = sanitizeHtml(item.journal || '').replace(/<em>(.*?)<\/em>/g, '<span class="journal-name">$1</span>');
            const linkUrl = sanitizeUrl(item.link_url);
            return `
            <div class="publication-card relative">
                <div>
                    <p class="publication-title">${sanitizeHtml(item.title)}</p>
                    <p class="publication-authors">${sanitizeHtml(item.authors)}</p>
                    <p class="publication-journal">${styledJournal}</p>
                </div>
                <div class="publication-meta">
                    <span class="publication-year">${sanitizeHtml(item.year)}</span>
                    <div>
                        ${linkUrl && item.link_text ? `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="publication-link">${sanitizeHtml(item.link_text)}</a>` : ''}
                    </div>
                </div>
                <div class="absolute top-4 right-4 flex gap-2">
                     <button class="admin-only-btn edit-item-btn" data-section="publications" data-index="${index}">✏️</button>
                     <button class="admin-only-btn delete-item-btn" data-section="publications" data-index="${index}">-</button>
                </div>
            </div>
            `
        }).join('');
    }

    function renderList(containerId, data, sectionName) {
        const container = document.getElementById(containerId);
        if (!container) return;
        if (!Array.isArray(data)) { data = []; }
        container.innerHTML = data.map((item, index) => `
            <li class="flex items-start gap-4 py-3">
                <div class="flex-grow">
                    <span class="font-bold text-gray-800">${sanitizeHtml(item.title)}</span>
                    <p class="text-gray-500 mt-1">${sanitizeHtml(item.description)}</p>
                </div>
                <div class="flex items-center gap-2">
                    <button class="admin-only-btn edit-item-btn" data-section="${sectionName}" data-index="${index}">✏️</button>
                    <button class="admin-only-btn delete-item-btn" data-section="${sectionName}" data-index="${index}">-</button>
                </div>
            </li>`).join('');
    }

    function enterAdminMode() { 
        adminMode = true; 
        document.body.classList.add('admin-mode-active');
        renderAll(); 
    }
    function exitAdminMode() { 
        adminMode = false; 
        document.body.classList.remove('admin-mode-active');
        renderAll();
    }
    
    function updateAdminUI() {
        document.querySelectorAll('[data-editable]').forEach(el => el.setAttribute('contenteditable', adminMode));
        document.getElementById('edit-icon').classList.toggle('hidden', adminMode);
        document.getElementById('save-icon').classList.toggle('hidden', !adminMode);
        const hint = document.getElementById('edit-hint');
        if (hint) {
            hint.classList.toggle('hidden', !adminMode);
        }
    }

    adminFab.addEventListener('click', () => {
        if (!adminMode) {
            passwordPurpose = 'login';
            passwordModal.classList.remove('hidden');
            document.getElementById('password-input').focus();
        } else { 
            passwordPurpose = 'save';
            passwordModal.classList.remove('hidden');
            document.getElementById('password-input').focus();
        }
    });

    document.getElementById('password-submit').addEventListener('click', async () => {
        const input = document.getElementById('password-input');
        const password = input.value;
        const button = document.getElementById('password-submit');
        button.textContent = '확인 중...';
        button.disabled = true;

        try {
            if (passwordPurpose === 'login') {
                const response = await fetch('/api/check-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password }),
                });
                const result = await response.json();
                if (response.ok && result.success) {
                    enterAdminMode();
                } else {
                    alert(result.message || '인증에 실패했습니다.');
                }
            } else if (passwordPurpose === 'save') {
                await performSave(password);
            }
        } catch (error) {
            alert(`오류가 발생했습니다: ${error.message}`);
        } finally {
            input.value = '';
            passwordModal.classList.add('hidden');
            button.textContent = '확인';
            button.disabled = false;
        }
    });

    document.getElementById('password-cancel').addEventListener('click', () => {
        document.getElementById('password-input').value = '';
        passwordModal.classList.add('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!adminMode) return;
        
        if (e.target.id === 'change-photo-btn') {
            const newAvatarUrl = prompt("새로운 프로필 사진 이미지 URL을 입력하세요:");
            if (newAvatarUrl) {
                siteData.profile.avatar = newAvatarUrl;
                document.getElementById('profile-avatar').src = newAvatarUrl;
            }
        }

        const button = e.target.closest('button');
        if (!button) return;
        if (button.classList.contains('add-item-btn')) { openEditModal(button.dataset.section); }
        if (button.classList.contains('edit-item-btn')) { openEditModal(button.dataset.section, parseInt(button.dataset.index, 10)); }
        if (button.classList.contains('delete-item-btn')) {
            if (!confirm('정말로 이 항목을 삭제하시겠습니까?')) return;
            const section = button.dataset.section;
            const index = parseInt(button.dataset.index, 10);
            siteData[section].splice(index, 1);
            renderAll();
        }
    });

    function openEditModal(section, index = null) {
        editIndex = index;
        const isNew = index === null;
        const item = isNew ? {} : siteData[section][index];
        const modalContent = document.getElementById('edit-modal-content');
        let fieldsHtml = '';
        if (section === 'publications') {
            fieldsHtml = `<label class="font-semibold">Year</label><input type="text" id="edit-year" class="w-full p-2 border rounded" value="${escapeAttribute(item.year || '')}"><label class="font-semibold">Title</label><input type="text" id="edit-title" class="w-full p-2 border rounded" value="${escapeAttribute(item.title || '')}"><label class="font-semibold">Authors</label><input type="text" id="edit-authors" class="w-full p-2 border rounded" value="${escapeAttribute(item.authors || '')}"><label class="font-semibold">Journal / Conference</label><textarea id="edit-journal" class="w-full p-2 border rounded h-20">${sanitizeHtml(item.journal || '')}</textarea><label class="font-semibold">Link Text</label><input type="text" id="edit-link-text" class="w-full p-2 border rounded" value="${escapeAttribute(item.link_text || '')}"><label class="font-semibold">Link URL</label><input type="text" id="edit-link-url" class="w-full p-2 border rounded" value="${escapeAttribute(item.link_url || '')}">`;
        } else {
            fieldsHtml = `<label class="font-semibold">Title</label><input type="text" id="edit-title" class="w-full p-2 border rounded" value="${escapeAttribute(item.title || '')}"><label class="font-semibold">Description</label><textarea id="edit-description" class="w-full p-2 border rounded h-24">${sanitizeHtml(item.description || '')}</textarea>`;
        }
        modalContent.innerHTML = `<h3 class="text-lg font-bold mb-4">${isNew ? '항목 추가' : '항목 수정'}</h3><div class="space-y-4 edit-form">${fieldsHtml}</div><div class="mt-6 text-right"><button id="edit-cancel" class="px-4 py-2 bg-gray-200 rounded mr-2">취소</button><button id="edit-save" class="px-4 py-2 bg-indigo-600 text-white rounded">저장</button></div>`;
        document.getElementById('edit-save').onclick = () => saveEdit(section);
        document.getElementById('edit-cancel').onclick = () => editModal.classList.add('hidden');
        editModal.classList.remove('hidden');
    }
    
    function saveEdit(section) {
        const isNew = editIndex === null;
        let updatedItem;
        if (section === 'publications') {
            const title = document.getElementById('edit-title').value;
            const authors = document.getElementById('edit-authors').value;
            const journal = document.getElementById('edit-journal').value;
            const year = document.getElementById('edit-year').value;
            const linkText = document.getElementById('edit-link-text').value;
            const linkUrl = document.getElementById('edit-link-url').value;
            updatedItem = { 
                title: sanitizeHtml(title), 
                authors: sanitizeHtml(authors), 
                journal: sanitizeHtml(journal), 
                year: sanitizeHtml(year), 
                link_text: sanitizeHtml(linkText), 
                link_url: sanitizeUrl(linkUrl) 
            };
        } else {
             updatedItem = { 
                title: sanitizeHtml(document.getElementById('edit-title').value), 
                description: sanitizeHtml(document.getElementById('edit-description').value) 
            };
        }
        if (isNew) {
            if (!Array.isArray(siteData[section])) { siteData[section] = []; }
            siteData[section].push(updatedItem);
        } else {
            siteData[section][editIndex] = updatedItem;
        }
        editModal.classList.add('hidden');
        renderAll();
    }

    loadData();

    const reveals = document.querySelectorAll('.reveal');
    function revealSections() {
        reveals.forEach(reveal => {
            const windowHeight = window.innerHeight;
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - 150) {
                reveal.classList.add('active');
            }
        });
    }
    window.addEventListener('scroll', revealSections);
    revealSections();
});
