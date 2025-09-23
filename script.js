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
            { 
                title: "Energy Harvesting using Triboelectric Nanogenerators with MOFs", 
                authors: "<strong>서동원</strong>, 김철수", 
                journal: "<em>Journal of Nanotechnology</em>, 15(2), 45-58.", 
                year: "2025", 
                link_text: "PDF",
                link_url: "#"
            }, 
            { 
                title: "AI-based Prediction of Material Tribological Properties", 
                authors: "이영희, <strong>서동원</strong>", 
                journal: "<em>Proceedings of ICME</em>, Busan, South Korea.", 
                year: "2024", 
                link_text: "DOI",
                link_url: "#"
            }
        ],
        conferences: [
            { 
                title: "A Study on TENG Performance Optimization", 
                description: "Oral Presentation, KSTLE 2025 (한국트라이볼로지학회), Jeju, South Korea, 2025년 4월." 
            }, 
            { 
                title: "Introduction to Metal Organic Frameworks", 
                description: "Poster Presentation, KICHE 2024 (한국화학공학회), Daejeon, South Korea, 2024년 10월." 
            }
        ],
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
        awards: [
            { 
                title: "최우수 포스터상", 
                description: "KSTLE 2025 (한국트라이볼로지학회), 2025년." 
            }, 
            { 
                title: "BK21 대학원 혁신지원사업 장학금", 
                description: "국립금오공과대학교, 2024년 - 현재." 
            }
        ]
    };

    // ===== 디버깅 코드 시작 =====
    console.log("--- 디버깅 시작: initialData 객체를 확인합니다. ---");
    console.log(initialData);
    console.log("--- 'education' 키가 존재하나요? ---", initialData.hasOwnProperty('education'));
    // ===== 디버깅 코드 끝 =====

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
            for (let i = 0; i < keys.length - 1; i++) {
                temp = temp[keys[i]];
            }
            temp[keys[keys.length - 1]] = el.innerHTML;
        });
        localStorage.setItem('portfolioData', JSON.stringify(siteData));
        alert('성공적으로 저장되었습니다!');
    }

    function renderAll() {
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
        container.innerHTML = `
            <div class="flex flex-col md:flex-row items-center bg-white p-8 rounded-xl shadow-lg">
                <div class="md:w-1-3 text-center mb-6 md:mb-0"><img src="${data.avatar}" alt="프로필 사진" class="rounded-full w-48 h-48 mx-auto object-cover border-4 border-indigo-200 shadow-md"></div>
                <div class="md:w-2/3 md:pl-12">
                    <h1 class="text-5xl font-bold text-gray-900 mb-2" data-editable="profile.name">${data.name}</h1>
                    <p class="text-xl text-indigo-600 font-semibold mb-5" data-editable="profile.affiliation">${data.affiliation}</p>
                    <p class="mb-6 text-base leading-relaxed" data-editable="profile.body">${data.body}</p>
                    <div class="flex items-center space-x-5">
                        <a href="${data.cv_link}" class="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 shadow-md">CV 다운로드</a>
                    </div>
                </div>
            </div>`;
        document.getElementById('nav-logo').innerHTML = data.english_name;
        document.getElementById('footer-name').innerHTML = data.english_name;
    }

    function renderPublications(data) {
        const table = document.getElementById('publications-table');
        if (!table) return;

        const thead = `
            <thead>
                <tr>
                    <th scope="col">Title & Authors</th>
                    <th scope="col">Journal / Conference</th>
                    <th scope="col">Year</th>
                    <th scope="col">Link</th>
                    <th scope="col" class="admin-only-header" style="display: none;">Edit</th>
                </tr>
            </thead>`;

        const tbody = `
            <tbody>
                ${(data || []).map((item, index) => `
                    <tr>
                        <td class="align-top">
                            <p class="font-semibold text-gray-800">${item.title}</p>
                            <p class="text-xs text-gray-600">${item.authors}</p>
                        </td>
                        <td class="align-top">${item.journal}</td>
                        <td class="align-top">${item.year}</td>
                        <td class="align-top">
                            ${item.link_url && item.link_text ? `<a href="${item.link_url}" target="_blank" rel="noopener noreferrer" class="publication-link">${item.link_text}</a>` : ''}
                        </td>
                        <td class="align-top admin-only-cell" style="display: none;">
                            <div class="flex items-center gap-2">
                                <button class="admin-only-btn edit-item-btn" data-section="publications" data-index="${index}">✏️</button>
                                <button class="admin-only-btn delete-item-btn" data-section="publications" data-index="${index}">-</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>`;

        table.innerHTML = thead + tbody;
    }

    function renderList(containerId, data, sectionName) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!Array.isArray(data)) {
            // 이 부분이 현재 오류를 발생시키는 지점입니다.
            console.error(`Data for section "${sectionName}" is not an array.`, data);
            data = [];
        }
        container.innerHTML = data.map((item, index) => `
            <li class="flex items-start gap-2">
                <span class="flex-grow"><span class="font-semibold">"${item.title}"</span>, ${item.description}</span>
                <div class="flex flex-col gap-2">
                    <button class="admin-only-btn edit-item-btn" data-section="${sectionName}" data-index="${index}">✏️</button>
                    <button class="admin-only-btn delete-item-btn" data-section="${sectionName}" data-index="${index}">-</button>
                </div>
            </li>`).join('');
    }

    // ... (이 아래 코드는 변경사항 없습니다) ...

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
        
        const adminElements = document.querySelectorAll('.admin-only-btn, .admin-only-header, .admin-only-cell');
        adminElements.forEach(el => {
            el.style.display = adminMode ? '' : 'none';
        });
        
        document.getElementById('edit-icon').classList.toggle('hidden', adminMode);
        document.getElementById('save-icon').classList.toggle('hidden', !adminMode);
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
    
    document.addEventListener('click', (e) => {
        if (!adminMode) return;

        const target = e.target.closest('button');
        if (!target) return;

        if (target.classList.contains('add-item-btn')) {
            const section = target.dataset.section;
            openEditModal(section);
        }
        if (target.classList.contains('edit-item-btn')) {
            const section = target.dataset.section;
            const index = parseInt(target.dataset.index, 10);
            openEditModal(section, index);
        }
        if (target.classList.contains('delete-item-btn')) {
            if (!confirm('정말로 이 항목을 삭제하시겠습니까?')) return;
            const section = target.dataset.section;
            const index = parseInt(target.dataset.index, 10);
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
            fieldsHtml = `
                <label class="font-semibold">Title</label><input type="text" id="edit-title" class="w-full p-2 border rounded" value="${item.title || ''}">
                <label class="font-semibold">Authors</label><input type="text" id="edit-authors" class="w-full p-2 border rounded" value="${item.authors || ''}">
                <label class="font-semibold">Journal / Conference</label><input type="text" id="edit-journal" class="w-full p-2 border rounded" value="${item.journal || ''}">
                <label class="font-semibold">Year</label><input type="text" id="edit-year" class="w-full p-2 border rounded" value="${item.year || ''}">
                <label class="font-semibold">Link Text (e.g., PDF, DOI)</label><input type="text" id="edit-link-text" class="w-full p-2 border rounded" value="${item.link_text || ''}">
                <label class="font-semibold">Link URL (주소)</label><input type="text" id="edit-link-url" class="w-full p-2 border rounded" value="${item.link_url || ''}">
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
                link_text: document.getElementById('edit-link-text').value,
                link_url: document.getElementById('edit-link-url').value
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
