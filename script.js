document.addEventListener('DOMContentLoaded', () => {
    // --- 초기 데이터 설정 ---
    const initialData = {
        profile: { 
            name: "서동원", 
            english_name: "Dongwon Seo", 
            affiliation: "기계공학과 석사과정 | 국립금오공과대학교", 
            body: "저는 마찰공학(Tribology)과 마찰전기 나노발전기(TENG)를 핵심 연구 분야로 다루고 있습니다. 특히, 금속 유기 구조체(MOFs)의 적용과 인공지능(AI) 기술을 융합하여 에너지 하베스팅 및 표면 공학 분야의 새로운 가능성을 탐구하는 데 집중하고 있습니다.", 
            avatar: "https://placehold.co/200x200/E0E7FF/333333?text=Profile+Pic", 
            cv_link: "#", 
            google_scholar: "#", 
            linkedin: "#" 
        },
        publications: [
            // ... 기존 데이터 ...
        ],
        conferences: [
            // ... 기존 데이터 ...
        ],
        // ===== 새로운 학업 데이터 =====
        education: [
            {
                title: "국립금오공과대학교, 기계공학 석사",
                description: "2024년 3월 - 현재"
            },
            {
                title: "국립금오공과대학교, 기계공학 학사",
                description: "GPA: 4.0/4.5 | 2020년 3월 - 2024년 2월"
            }
        ],
        // ==========================
        awards: [
            // ... 기존 데이터 ...
        ]
    };
    // (publications, conferences, awards의 기존 데이터는 생략했습니다. 그대로 유지하시면 됩니다.)

    let siteData;
    let adminMode = false;
    let editIndex = null;

    const passwordModal = document.getElementById('password-modal');
    const editModal = document.getElementById('edit-modal');
    const adminFab = document.getElementById('admin-fab');

    function loadData() {
        const savedData = localStorage.getItem('portfolioData');
        siteData = savedData ? JSON.parse(savedData) : JSON.parse(JSON.stringify(initialData));
        renderAll();
    }

    function saveData() {
        document.querySelectorAll('[data-editable]').forEach(el => {
            const keys = el.dataset.editable.split('.');
            let temp = siteData;
            keys.slice(0, -1).forEach(key => temp = temp[key]);
            temp[keys[keys.length - 1]] = el.innerHTML;
        });
        localStorage.setItem('portfolioData', JSON.stringify(siteData));
        alert('성공적으로 저장되었습니다!');
    }

    // --- 렌더링 ---
    function renderAll() {
        renderProfile(siteData.profile);
        renderPublications(siteData.publications);
        renderList('conferences-list', siteData.conferences, 'conferences');
        renderList('education-list', siteData.education, 'education'); // <-- 학업 렌더링 추가
        renderList('awards-list', siteData.awards, 'awards');
        document.getElementById('current-year').textContent = new Date().getFullYear();
        updateAdminUI();
    }

    function renderProfile(data) {
        // ... 변경 없음 ...
    }

    function renderPublications(data) {
        const container = document.getElementById('publications-list');
        container.innerHTML = data.map((item, index) => `
            <div class="bg-white p-6 rounded-lg shadow-md flex items-center gap-2">
                <div class="flex-grow">
                    <p class="text-lg font-semibold text-gray-800">${item.title}</p>
                    <p class="text-sm text-gray-600 mb-2">${item.authors}. (${item.year}). ${item.journal}</p>
                </div>
                <div class="flex flex-col gap-2">
                    <button class="admin-only-btn edit-item-btn" data-section="publications" data-index="${index}">✏️</button>
                    <button class="admin-only-btn delete-item-btn" data-section="publications" data-index="${index}">-</button>
                </div>
            </div>`).join('');
    }

    function renderList(containerId, data, sectionName) {
        const container = document.getElementById(containerId);
        container.innerHTML = data.map((item, index) => `
            <li class="flex items-start gap-2">
                <span class="flex-grow"><span class="font-semibold">"${item.title}"</span>, ${item.description}</span>
                <div class="flex flex-col gap-2">
                    <button class="admin-only-btn edit-item-btn" data-section="${sectionName}" data-index="${index}">✏️</button>
                    <button class="admin-only-btn delete-item-btn" data-section="${sectionName}" data-index="${index}">-</button>
                </div>
            </li>`).join('');
    }
    
    // --- 관리자 모드 및 이벤트 핸들러 ---
    // ... 이 아래 모든 코드는 변경할 필요가 없습니다 ...

    function enterAdminMode() {
        adminMode = true;
        renderAll();
    }

    function exitAdminMode() {
        adminMode = false;
        renderAll();
    }

    function updateAdminUI() {
        document.querySelectorAll('[data-editable]').forEach(el => el.setAttribute('contenteditable', adminMode));
        document.querySelectorAll('.admin-only-btn').forEach(btn => btn.style.display = adminMode ? 'inline-flex' : 'none');
        document.getElementById('edit-icon').classList.toggle('hidden', adminMode);
        document.getElementById('save-icon').classList.toggle('hidden', !adminMode);

        if (adminMode) {
            document.querySelectorAll('.add-item-btn').forEach(btn => btn.addEventListener('click', handleAddItem));
            document.querySelectorAll('.edit-item-btn').forEach(btn => btn.addEventListener('click', handleEditItem));
            document.querySelectorAll('.delete-item-btn').forEach(btn => btn.addEventListener('click', handleDeleteItem));
        }
    }

    adminFab.addEventListener('click', () => {
        if (!adminMode) {
            passwordModal.classList.remove('hidden');
            document.getElementById('password-input').focus();
        } else {
            saveData();
            exitAdminMode();
        }
    });

    document.getElementById('password-submit').addEventListener('click', async () => {
        const input = document.getElementById('password-input');
        const password = input.value;
        const button = document.getElementById('password-submit');

        button.textContent = '확인 중...';
        button.disabled = true;

        try {
            const response = await fetch('/.netlify/functions/check-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: password }),
            });
            const result = await response.json();

            if (response.ok && result.success) {
                passwordModal.classList.add('hidden');
                input.value = '';
                enterAdminMode();
            } else {
                alert(result.message || '인증에 실패했습니다.');
            }
        } catch (error) {
            console.error('인증 요청 중 오류 발생:', error);
            alert('서버와 통신 중 오류가 발생했습니다.');
        } finally {
            button.textContent = '확인';
            button.disabled = false;
        }
    });
    
    document.getElementById('password-cancel').addEventListener('click', () => {
        passwordModal.classList.add('hidden');
        document.getElementById('password-input').value = '';
    });
    
    function handleAddItem(e) {
        const section = e.target.dataset.section;
        openEditModal(section);
    }
    
    function handleEditItem(e) {
        const section = e.target.dataset.section;
        const index = parseInt(e.target.dataset.index, 10);
        openEditModal(section, index);
    }

    function handleDeleteItem(e) {
        if (!confirm('정말로 이 항목을 삭제하시겠습니까?')) return;
        const section = e.target.dataset.section;
        const index = parseInt(e.target.dataset.index, 10);
        siteData[section].splice(index, 1);
        renderAll();
    }

    function openEditModal(section, index = null) {
        editIndex = index;
        const isNew = index === null;
        const item = isNew ? {} : siteData[section][index];
        const modalContent = document.getElementById('edit-modal-content');
        
        let fieldsHtml = '';
        if (section === 'publications') {
            fieldsHtml = `
                <label class="font-semibold">Title</label><input type="text" id="edit-title" class="w-full p-2 border rounded" value="${item.title || ''}">
                <label class="font-semibold">Authors</label><input type="text" id="edit-authors" class="w-full p-2 border rounded" value="${item.authors || ''}">
                <label class="font-semibold">Journal</label><input type="text" id="edit-journal" class="w-full p-2 border rounded" value="${item.journal || ''}">
                <label class="font-semibold">Year</label><input type="text" id="edit-year" class="w-full p-2 border rounded" value="${item.year || ''}">
            `;
        } else {
            fieldsHtml = `
                <label class="font-semibold">Title</label><input type="text" id="edit-title" class="w-full p-2 border rounded" value="${item.title || ''}">
                <label class="font-semibold">Description</label><textarea id="edit-description" class="w-full p-2 border rounded h-24">${item.description || ''}</textarea>
            `;
        }

        modalContent.innerHTML = `
            <h3 class="text-lg font-bold mb-4">${isNew ? '항목 추가' : '항목 수정'}</h3>
            <div class="space-y-4 edit-form">${fieldsHtml}</div>
            <div class="mt-6 text-right">
                <button id="edit-cancel" class="px-4 py-2 bg-gray-200 rounded mr-2">취소</button>
                <button id="edit-save" class="px-4 py-2 bg-indigo-600 text-white rounded">저장</button>
            </div>
        `;
        
        document.getElementById('edit-save').onclick = () => saveEdit(section);
        document.getElementById('edit-cancel').onclick = () => editModal.classList.add('hidden');
        editModal.classList.remove('hidden');
    }

    function saveEdit(section) {
        const isNew = editIndex === null;
        let updatedItem;
        if (section === 'publications') {
            updatedItem = {
                title: document.getElementById('edit-title').value,
                authors: document.getElementById('edit-authors').value,
                journal: document.getElementById('edit-journal').value,
                year: document.getElementById('edit-year').value,
                pdf_link: (isNew ? "#" : siteData[section][editIndex].pdf_link),
                doi_link: (isNew ? "#" : siteData[section][editIndex].doi_link)
            };
        } else {
             updatedItem = {
                title: document.getElementById('edit-title').value,
                description: document.getElementById('edit-description').value
            };
        }

        if (isNew) {
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
