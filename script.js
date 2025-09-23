document.addEventListener('DOMContentLoaded', () => {
    const initialData = {
        profile: { 
            name: "서동원", 
            english_name: "Dongwon Seo", 
            affiliation: "기계공학과 석사과정 | 국립금오공과대학교", 
            body: "저는 마찰공학(Tribology)과 마찰전기 나노발전기(TENG)를 핵심 연구 분야로 다루고 있습니다. 특히, 금속 유기 구조체(MOFs)의 적용과 인공지능(AI) 기술을 융합하여 에너지 하베스팅 및 표면 공학 분야의 새로운 가능성을 탐구하는 데 집중하고 있습니다.", 
            avatar: "https://i.imgur.com/81BCR6A.png",
            cv_link: "#", 
            google_scholar: "#", 
            linkedin: "#" 
        },
        publications: [
            { title: "Scott-Russel linkage-based triboelectric self-powered sensor for contact material-independent force sensing and tactile recognition", authors: "<strong>Dongwon Seo</strong>, Jimin Kong, and Jihoon Chung*", journal: "<em>Small</em> (2023 IF: 13.0, JCR Top 10%)", year: "2024", link_text: "DOI", link_url: "#" },
            { title: "Vertical Contact/Separation Triboelectric Generator Utilizing Surface Characteristics of Metal-Organic Frameworks", authors: "Kyoung-Hwan Kim, Jimin Kong, <strong>Dongwon Seo</strong>, and Jihoon Chung*", journal: "<em>Journal of the Korean Society of Manufacturing Process Engineers (KCI)</em>", year: "2025", link_text: "Link", link_url: "#" }
        ],
        conferences: [
            { title: "A Study on TENG Performance Optimization", description: "Oral Presentation, KSTLE 2025, Jeju, South Korea" }
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

    const passwordModal = document.getElementById('password-modal');
    const editModal = document.getElementById('edit-modal');
    const adminFab = document.getElementById('admin-fab');

    async function loadData() {
        try {
            const response = await fetch('/api/get-data');
            if (!response.ok) { throw new Error(`Server responded with ${response.status}`); }
            const dataFromServer = await response.json();
            siteData = (dataFromServer && dataFromServer.profile) ? dataFromServer : initialData;
        } catch (error) {
            console.error("Failed to load data from server. Using initial default data.", error);
            siteData = initialData;
        }
        renderAll();
    }

    async function performSave(password) {
        document.querySelectorAll('[data-editable]').forEach(el => {
            const keys = el.dataset.editable.split('.');
            let temp = siteData;
            for (let i = 0; i < keys.length - 1; i++) { temp = temp[keys[i]]; }
            temp[keys[keys.length - 1]] = el.innerHTML;
        });

        try {
            const response = await fetch('/api/save-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, data: siteData }),
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
    
    // ===== 이 함수의 HTML 구조가 수정되었습니다 =====
    function renderProfile(data) {
        const container = document.getElementById('about');
        if(!container || !data) return;
        container.innerHTML = `
            <div class="flex flex-col md:flex-row items-center justify-center gap-8 bg-white p-8 rounded-xl shadow-lg">
                <div class="md:w-auto md:flex-shrink-0">
                    <div id="profile-image-wrapper" class="profile-image-wrapper mx-auto">
                        <img id="profile-avatar" src="${data.avatar}" alt="프로필 사진">
                        <button id="change-photo-btn" class="admin-only-feature">사진 변경</button>
                    </div>
                </div>
                <div class="md:w-2/3">
                    <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 mb-2 text-center md:text-left" data-editable="profile.name">${data.name}</h1>
                    <p class="text-xl text-indigo-600 font-semibold mb-5 text-center md:text-left" data-editable="profile.affiliation">${data.affiliation}</p>
                    <p class="mb-6 text-base leading-relaxed text-gray-600" data-editable="profile.body">${data.body}</p>
                    <div class="flex items-center justify-center md:justify-start space-x-5">
                        <a href="${data.cv_link}" class="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 shadow-md transition-all">CV 다운로드</a>
                    </div>
                </div>
            </div>`;
        document.getElementById('nav-logo').innerHTML = data.english_name;
        document.getElementById('footer-name').innerHTML = data.english_name;
    }

    function renderPublications(data) {
        const container = document.getElementById('publications-container');
        if (!container) return;
        
        container.innerHTML = (data || []).map((item, index) => {
            const styledJournal = item.journal.replace(/<em>(.*?)<\/em>/g, '<span class="journal-name">$1</span>');
            return `
            <div class="publication-card relative">
                <div>
                    <p class="publication-title">${item.title}</p>
                    <p class="publication-authors">${item.authors}</p>
                    <p class="publication-journal">${styledJournal}</p>
                </div>
                <div class="publication-meta">
                    <span class="publication-year">${item.year}</span>
                    <div>
                        ${item.link_url && item.link_text ? `<a href="${item.link_url}" target="_blank" rel="noopener noreferrer" class="publication-link">${item.link_text}</a>` : ''}
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
            <li class="flex items-start gap-2 py-2">
                <div class="flex-grow">
                    <span class="text-lg font-bold text-gray-800">${item.title}</span>
                    <p class="text-sm text-gray-600 mt-1">${item.description}</p>
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
            fieldsHtml = `<label class="font-semibold">Year</label><input type="text" id="edit-year" class="w-full p-2 border rounded" value="${item.year || ''}"><label class="font-semibold">Title</label><input type="text" id="edit-title" class="w-full p-2 border rounded" value="${item.title || ''}"><label class="font-semibold">Authors</label><input type="text" id="edit-authors" class="w-full p-2 border rounded" value="${item.authors || ''}"><label class="font-semibold">Journal / Conference</label><textarea id="edit-journal" class="w-full p-2 border rounded h-20">${item.journal || ''}</textarea><label class="font-semibold">Link Text</label><input type="text" id="edit-link-text" class="w-full p-2 border rounded" value="${item.link_text || ''}"><label class="font-semibold">Link URL</label><input type="text" id="edit-link-url" class="w-full p-2 border rounded" value="${item.link_url || ''}">`;
        } else {
            fieldsHtml = `<label class="font-semibold">Title</label><input type="text" id="edit-title" class="w-full p-2 border rounded" value="${item.title || ''}"><label class="font-semibold">Description</label><textarea id="edit-description" class="w-full p-2 border rounded h-24">${item.description || ''}</textarea>`;
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
            updatedItem = { title: document.getElementById('edit-title').value, authors: document.getElementById('edit-authors').value, journal: document.getElementById('edit-journal').value, year: document.getElementById('edit-year').value, link_text: document.getElementById('edit-link-text').value, link_url: document.getElementById('edit-link-url').value };
        } else {
             updatedItem = { title: document.getElementById('edit-title').value, description: document.getElementById('edit-description').value };
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