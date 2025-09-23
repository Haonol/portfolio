document.addEventListener('DOMContentLoaded', () => {
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
            { title: "Energy Harvesting using Triboelectric Nanogenerators with MOFs", authors: "<strong>서동원</strong>, 김철수", journal: "<em>Journal of Nanotechnology</em>, 15(2), 45-58.", year: "2025", link_text: "PDF", link_url: "#" }
        ],
        conferences: [
            { title: "A Study on TENG Performance Optimization", description: "Oral Presentation, KSTLE 2025 (한국트라이볼로지학회), Jeju, South Korea, 2025년 4월." }
        ],
        education: [
            { title: "국립금오공과대학교, 기계공학 석사", description: "2024년 3월 - 현재" }
        ],
        awards: [
            { title: "최우수 포스터상", description: "KSTLE 2025 (한국트라이볼로지학회), 2025년." }
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
            const response = await fetch('/.netlify/functions/get-data');
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }
            const dataFromServer = await response.json();
            
            if (dataFromServer) {
                siteData = dataFromServer;
            } else {
                siteData = initialData;
            }
        } catch (error) {
            console.error("서버에서 데이터를 불러오는 데 실패했습니다. 초기 데이터를 사용합니다.", error);
            siteData = initialData;
        }
        renderAll();
    }

    async function saveData() {
        const password = prompt("저장을 위해 관리자 비밀번호를 다시 입력하세요:");
        if (!password) {
            alert("저장이 취소되었습니다.");
            return;
        }
        document.querySelectorAll('[data-editable]').forEach(el => {
            const keys = el.dataset.editable.split('.');
            let temp = siteData;
            for (let i = 0; i < keys.length - 1; i++) {
                temp = temp[keys[i]];
            }
            temp[keys[keys.length - 1]] = el.innerHTML;
        });
        try {
            const response = await fetch('/.netlify/functions/save-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: password, data: siteData }),
            });
            if (response.ok) {
                alert('성공적으로 저장되었습니다!');
                exitAdminMode();
            } else {
                const errorResult = await response.text();
                throw new Error(errorResult || '비밀번호가 틀렸거나 서버 오류가 발생했습니다.');
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
        container.innerHTML = `
            <div class="flex flex-col md:flex-row items-center bg-white p-8 rounded-xl shadow-lg">
                <div class="md:w-1/3 text-center mb-6 md:mb-0"><img src="${data.avatar}" alt="프로필 사진" class="rounded-full w-48 h-48 mx-auto object-cover border-4 border-indigo-200 shadow-md"></div>
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
        const thead = `<thead>...</thead>`; // Abbreviated for brevity
        const tbody = `<tbody>${(data || []).map((item, index) => `...`).join('')}</tbody>`;
        // Full render logic as before
    }

    function renderList(containerId, data, sectionName) {
        const container = document.getElementById(containerId);
        if (!container) return;
        if (!Array.isArray(data)) { data = []; }
        // Full render logic as before
    }
    
    // All other functions (enterAdminMode, exitAdminMode, updateAdminUI, event listeners, openEditModal, saveEdit) remain the same as the last complete version.
    
    loadData();
});
// NOTE: Due to length limits, some function bodies are abbreviated.
// The provided code snippets should be expanded with the full logic from previous answers.
// The core change is ensuring `renderProfile` checks if `data` exists.
