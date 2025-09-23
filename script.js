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
                pdf_link: "#",
                doi_link: "#"
            },
            {
                title: "AI-based Prediction of Material Tribological Properties",
                authors: "이영희, <strong>서동원</strong>",
                journal: "<em>Proceedings of the International Conference on Mechanical Engineering (ICME)</em>, Busan, South Korea.",
                year: "2024",
                pdf_link: "#"
            }
        ],
        conferences: [
            { title: "A Study on TENG Performance Optimization", description: "Oral Presentation, KSTLE 2025 (한국트라이볼로지학회), Jeju, South Korea, 2025년 4월." },
            { title: "Introduction to Metal Organic Frameworks", description: "Poster Presentation, KICHE 2024 (한국화학공학회), Daejeon, South Korea, 2024년 10월." }
        ],
        awards: [
            { title: "최우수 포스터상", description: "KSTLE 2025 (한국트라이볼로지학회), 2025년." },
            { title: "BK21 대학원 혁신지원사업 장학금", description: "국립금오공과대학교, 2024년 - 현재." }
        ]
    };

    // --- 데이터 관리 ---
    let siteData;

    function loadData() {
        const savedData = localStorage.getItem('portfolioData');
        if (savedData) {
            siteData = JSON.parse(savedData);
        } else {
            siteData = JSON.parse(JSON.stringify(initialData)); // Deep copy
        }
        renderAll();
    }

    function saveData() {
        // 편집 가능한 모든 요소에서 텍스트를 가져와 siteData 객체를 업데이트합니다.
        document.querySelectorAll('[data-editable]').forEach(el => {
            const key = el.dataset.editable;
            // 간단한 키-값 구조만 지원 (프로필 정보)
            if (siteData.profile.hasOwnProperty(key)) {
                siteData.profile[key] = el.innerHTML;
            }
        });
        localStorage.setItem('portfolioData', JSON.stringify(siteData));
        alert('내용이 저장되었습니다!');
    }

    // --- 렌더링 함수 ---
    function renderAll() {
        renderProfile(siteData.profile);
        renderPublications(siteData.publications);
        renderList('conferences-list', siteData.conferences);
        renderList('awards-list', siteData.awards);
        document.getElementById('current-year').textContent = new Date().getFullYear();
    }

    function renderProfile(data) {
        const container = document.getElementById('about');
        const socialLinks = `
            <a href="${data.google_scholar}" class="text-gray-500 hover:text-indigo-600 transition-colors" title="Google Scholar">
                <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M5.242 13.769L0 9.5L12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10.9c-1.39 0-2.583.52-3.483 1.343l3.483 2.829l3.483-2.829C14.583 11.42 13.39 10.9 12 10.9zm0 3.843L8.517 11.914C9.417 11.09 10.61 10.56 12 10.56s2.583.53 3.483 1.354L12 14.743z" transform="translate(0 5)"></path></svg>
            </a>
            <a href="${data.linkedin}" class="text-gray-500 hover:text-indigo-600 transition-colors" title="LinkedIn">
                 <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
            </a>`;
        container.innerHTML = `
            <div class="flex flex-col md:flex-row items-center bg-white p-8 rounded-xl shadow-lg">
                <div class="md:w-1/3 text-center mb-6 md:mb-0">
                    <img src="${data.avatar}" alt="프로필 사진" class="rounded-full w-48 h-48 mx-auto object-cover border-4 border-indigo-200 shadow-md">
                </div>
                <div class="md:w-2/3 md:pl-12">
                    <h1 class="text-5xl font-bold text-gray-900 mb-2" data-editable="name">${data.name}</h1>
                    <p class="text-xl text-indigo-600 font-semibold mb-5" data-editable="affiliation">${data.affiliation}</p>
                    <p class="mb-6 text-base leading-relaxed" data-editable="body">${data.body}</p>
                    <div class="flex items-center space-x-5">
                        <a href="${data.cv_link}" class="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-300">CV 다운로드</a>
                        ${socialLinks}
                    </div>
                </div>
            </div>`;
        document.getElementById('nav-logo').textContent = data.english_name;
        document.getElementById('footer-name').textContent = data.english_name;
    }

    function renderPublications(data) {
        const container = document.getElementById('publications-list');
        // 지금은 단순 렌더링만 지원, 복잡한 리스트 수정은 추후 확장 필요
        container.innerHTML = data.map(item => `
            <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <p class="text-lg font-semibold text-gray-800">${item.title}</p>
                <p class="text-sm text-gray-600 mb-2">${item.authors}. (${item.year}). ${item.journal}</p>
                <div class="flex space-x-4 text-sm mt-3">
                    ${item.pdf_link ? `<a href="${item.pdf_link}" class="text-indigo-500 font-semibold hover:underline">[PDF]</a>` : ''}
                    ${item.doi_link ? `<a href="${item.doi_link}" class="text-indigo-500 font-semibold hover:underline">[DOI]</a>` : ''}
                </div>
            </div>`).join('');
    }

    function renderList(containerId, data) {
        const container = document.getElementById(containerId);
        // 지금은 단순 렌더링만 지원, 복잡한 리스트 수정은 추후 확장 필요
        container.innerHTML = data.map(item => `
            <li><span class="font-semibold">"${item.title}"</span>, ${item.description}</li>
        `).join('');
    }

    // --- 관리자 모드 기능 ---
    const ADMIN_PASSWORD = "your_password"; // 🚨 실제 사용할 비밀번호로 변경하세요!
    let adminMode = false;
    
    const adminControls = document.getElementById('admin-controls');
    const editBtn = document.getElementById('edit-btn');
    const saveBtn = document.getElementById('save-btn');

    // Ctrl + M 또는 Command + M 키를 눌러 관리자 모드 버튼 표시/숨김
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
            e.preventDefault();
            adminControls.classList.toggle('hidden');
        }
    });

    editBtn.addEventListener('click', () => {
        const password = prompt("관리자 비밀번호를 입력하세요:");
        if (password === ADMIN_PASSWORD) {
            enableEditMode();
        } else if (password) {
            alert("비밀번호가 틀렸습니다.");
        }
    });

    saveBtn.addEventListener('click', () => {
        saveData();
        disableEditMode();
    });

    function enableEditMode() {
        adminMode = true;
        document.querySelectorAll('[data-editable]').forEach(el => {
            el.setAttribute('contenteditable', 'true');
        });
        editBtn.classList.add('hidden');
        saveBtn.classList.remove('hidden');
    }

    function disableEditMode() {
        adminMode = false;
        document.querySelectorAll('[data-editable]').forEach(el => {
            el.setAttribute('contenteditable', 'false');
        });
        editBtn.classList.remove('hidden');
        saveBtn.classList.add('hidden');
    }

    // --- 초기화 및 UI 스크립트 ---
    loadData();

    // 스크롤 애니메이션
    function revealSections() {
        const reveals = document.querySelectorAll('.reveal');
        reveals.forEach(reveal => {
            const windowHeight = window.innerHeight;
            const elementTop = reveal.getBoundingClientRect().top;
            const elementVisible = 150;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            } else {
                reveal.classList.remove('active');
            }
        });
    }
    window.addEventListener('scroll', revealSections);
    revealSections();

    // 모바일 메뉴
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // 스크롤에 따른 네비게이션 활성화
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a.nav-link');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 80) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
});