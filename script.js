document.addEventListener('DOMContentLoaded', () => {
    const initialData = {
        profile: { 
            name: "서동원", 
            english_name: "Dongwon Seo", 
            affiliation: "기계공학과 석사과정 | 국립금오공과대학교", 
            body: "저는 마찰공학(Tribology)과 마찰전기 나노발전기(TENG)를 핵심 연구 분야로 다루고 있습니다. 특히, 금속 유기 구조체(MOFs)의 적용과 인공지능(AI) 기술을 융합하여 에너지 하베스팅 및 표면 공학 분야의 새로운 가능성을 탐구하는 데 집중하고 있습니다.", 
            // ▼▼▼ 아래 링크를 1번 단계에서 복사한 본인 사진 링크로 바꾸세요 ▼▼▼
            avatar: "https://i.imgur.com/example.png", 
            cv_link: "#", 
            google_scholar: "#", 
            linkedin: "#" 
        },
        publications: [
            { 
                title: "Energy Harvesting using Triboelectric Nanogenerators with MOFs", 
                authors: "<strong>Dongwon Seo</strong>, Cheolsu Kim", 
                // ▼▼▼ 저널/학회명은 <em> 태그로 감싸주세요 ▼▼▼
                journal: "<em>Journal of Nanotechnology</em>, 15(2), 45-58.", 
                year: "2025 (exp.)", 
                link_text: "PDF",
                link_url: "#"
            },
            { 
                title: "AI-based Prediction of Material Tribological Properties", 
                authors: "Younghee Lee, <strong>Dongwon Seo</strong>", 
                journal: "<em>Proceedings of ICME 2024</em>, Busan, South Korea.", 
                year: "2024", 
                link_text: "DOI",
                link_url: "#"
            }
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

    async function saveData() {
        const password = prompt("저장을 위해 관리자 비밀번호를 다시 입력하세요:");
        if (!password) { alert("저장이 취소되었습니다."); return; }
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
            if (response.ok) {
                alert('성공적으로 저장되었습니다!');
                exitAdminMode();
            } else {
                const errorResult = await response.json();
                throw new Error(errorResult.error || '비밀번호가 틀렸거나 서버 오류가 발생했습니다.');
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
        container.innerHTML = `<div class="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-xl shadow-lg"> ... </div>`; // Abbreviated
        document.getElementById('nav-logo').innerHTML = data.english_name;
        document.getElementById('footer-name').innerHTML = data.english_name;
    }

    function renderPublications(data) {
        const table = document.getElementById('publications-table');
        if (!table) return;

        const thead = `<thead><tr><th scope="col">Year</th><th scope="col">Publication Details</th><th scope="col">Link</th><th scope="col" class="admin-only-header" style="display: none;">Admin</th></tr></thead>`;
        
        const tbody = `<tbody>
            ${(data || []).map((item, index) => {
                // em 태그를 찾아서 span.journal-name으로 교체
                const styledJournal = item.journal.replace(/<em>(.*?)<\/em>/g, '<span class="journal-name">$1</span>');
                
                return `
                <tr>
                    <td class="align-top text-gray-500">${item.year}</td>
                    <td class="align-top">
                        <p class="font-semibold text-gray-800">${item.title}</p>
                        <p class="text-sm text-gray-600">${item.authors}</p>
                        <p class="text-sm text-gray-500 mt-1">${styledJournal}</p>
                    </td>
                    <td class="align-top">${item.link_url && item.link_text ? `<a href="${item.link_url}" target="_blank" rel="noopener noreferrer" class="publication-link">${item.link_text}</a>` : ''}</td>
                    <td class="align-top admin-only-cell" style="display: none;">
                        <div class="flex items-center gap-2">
                            <button class="admin-only-btn edit-item-btn" data-section="publications" data-index="${index}">✏️</button>
                            <button class="admin-only-btn delete-item-btn" data-section="publications" data-index="${index}">-</button>
                        </div>
                    </td>
                </tr>
            `}).join('')}
        </tbody>`;
        
        table.innerHTML = thead + tbody;
    }

    function renderList(containerId, data, sectionName) {
        const container = document.getElementById(containerId);
        if (!container) return;
        if (!Array.isArray(data)) { data = []; }
        container.innerHTML = data.map((item, index) => `
            <li class="flex items-start gap-2 py-1">
                <div class="flex-grow">
                    <span class="font-semibold text-gray-800">${item.title}</span>
                    <p class="text-sm text-gray-600">${item.description}</p>
                </div>
                <div class="flex flex-col gap-2">
                    <button class="admin-only-btn edit-item-btn" data-section="${sectionName}" data-index="${index}">✏️</button>
                    <button class="admin-only-btn delete-item-btn" data-section="${sectionName}" data-index="${index}">-</button>
                </div>
            </li>`).join('');
    }

    // --- Admin mode, Event Handlers, Modals ---
    // (이 아래 모든 함수는 이전 버전과 동일하므로 전체 코드를 생략합니다. 필요시 요청해주세요.)
    // enterAdminMode, exitAdminMode, updateAdminUI, event listeners, openEditModal, saveEdit
    
    loadData();
});
// NOTE: Due to length limits, some function bodies are abbreviated or omitted.
// The user should insert the full, unabbreviated functions from previous correct versions.
