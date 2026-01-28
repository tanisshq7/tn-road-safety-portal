
let currentLang = 'en';

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'ta' : 'en';
    updateContent();
    localStorage.setItem('preferredLang', currentLang);
}

function updateContent() {
    const langData = translations[currentLang];

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n], [data-i18n-title], [data-i18n-placeholder]').forEach(element => {
        const textKey = element.getAttribute('data-i18n');
        const titleKey = element.getAttribute('data-i18n-title');
        const placeholderKey = element.getAttribute('data-i18n-placeholder');

        if (textKey && langData[textKey]) {
            element.innerText = langData[textKey];
        }

        if (titleKey && langData[titleKey]) {
            element.title = langData[titleKey];
        }

        if (placeholderKey && langData[placeholderKey]) {
            element.placeholder = langData[placeholderKey];
        }
    });

    // Update fonts for Tamil
    if (currentLang === 'ta') {
        document.body.style.fontFamily = '"Noto Sans Tamil", sans-serif';
    } else {
        document.body.style.fontFamily = '"Inter", sans-serif';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('preferredLang');
    if (savedLang) {
        currentLang = savedLang;
    }

    const langBtn = document.getElementById('lang-switch-btn');
    if (langBtn) {
        langBtn.addEventListener('click', toggleLanguage);
    }

    const feedbackForm = document.getElementById('citizen-feedback');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert(translations[currentLang].feedback_success);
            feedbackForm.reset();
        });
    }

    updateContent();
    initStatsCounters();
});

function initStatsCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const count = 0;
        const updateCount = () => {
            const current = +counter.innerText;
            const increment = target / 100;
            if (current < target) {
                counter.innerText = Math.ceil(current + increment);
                setTimeout(updateCount, 20);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
}
