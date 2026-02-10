
// Login check removed as per user request
// if (!window.location.href.includes('login.html')) { ... }

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

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

    const accidentForm = document.getElementById('accident-report-form');
    if (accidentForm) {
        accidentForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Collect Data
            const reportData = {
                id: Date.now(),
                district: document.getElementById('acc-district').value,
                location: document.getElementById('acc-location').value,
                datetime: document.getElementById('acc-datetime').value,
                type: document.getElementById('acc-type').value,
                severity: document.getElementById('acc-severity').value,
                timestamp: new Date().toISOString()
            };

            // Store in LocalStorage
            let reports = JSON.parse(localStorage.getItem('reported_accidents')) || [];
            reports.push(reportData);
            localStorage.setItem('reported_accidents', JSON.stringify(reports));

            // Show Success Message
            alert(translations[currentLang].report_success);
            accidentForm.reset();
        });
    }


    updateContent();
    initStatsCounters();
    initDailyNews();
});

// --- Feature 2: SOS Logic ---
function toggleSOS() {
    const popup = document.getElementById('sos-popup');
    popup.classList.toggle('active');
}

function shareLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // In a real app, this would send an API request
                alert(`${translations[currentLang].sos_loc_sent}\nLat: ${latitude}\nLong: ${longitude}`);
                toggleSOS(); // Close popup
            },
            (error) => {
                alert(translations[currentLang].sos_loc_error || "Location access denied.");
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// --- Dynamic Daily News Logic ---
const newsDatabase = [
    { type: "new", text_en: "Feb 2026: New AI-powered traffic cameras installed in Chennai.", text_ta: "பிப்ரவரி 2026: சென்னையில் புதிய AI போக்குவரத்து கேமராக்கள் நிறுவப்பட்டன." },
    { type: "update", text_en: "Helmet Rule: 98% compliance recorded in Coimbatore.", text_ta: "தலைக்கவசம் விதி: கோயம்புத்தூரில் 98% பேர் விதிகளைப் பின்பற்றுகின்றனர்." },
    { type: "alert", text_en: "Heavy Rain Alert: Drive slow on ECR and OMR roads.", text_ta: "கனமழை எச்சரிக்கை: ECR மற்றும் OMR சாலைகளில் மெதுவாக செல்லவும்." },
    { type: "news", text_en: "School Zones: Speed limit reduced to 30 km/h statewide.", text_ta: "பள்ளி மண்டலங்கள்: மாநிலம் முழுவதும் வேக வரம்பு 30 கி.மீ/மணி ஆக குறைப்பு." },
    { type: "eco", text_en: "Green Transport: 500 new Electric Buses flagged off.", text_ta: "பசுமை போக்குவரத்து: 500 புதிய மின்சார பேருந்துகள் தொடங்கி வைக்கப்பட்டன." },
    { type: "alert", text_en: "Road Work: Diversion near Madurai Ring Road.", text_ta: "சாலைப் பணி: மதுரை வளையச் சாலை அருகே போக்குவரத்து மாற்றம்." },
    { type: "update", text_en: "License Renewal: Now completely online via Sarathi portal.", text_ta: "உரிமம் புதுப்பித்தல்: சாரதி தளம் மூலம் இப்போது முழுமையாக ஆன்லைனில்." }
];

function initDailyNews() {
    const newsContainer = document.querySelector('.news-list');
    if (!newsContainer) return;

    // Use current date to seed the random selection so it changes daily
    const today = new Date().getDate();
    const shuffled = newsDatabase.sort(() => 0.5 - Math.random()); // Simple shuffle
    const selectedNews = shuffled.slice(0, 5); // Pick 5 random items

    let html = '';
    selectedNews.forEach(item => {
        const text = currentLang === 'ta' ? item.text_ta : item.text_en;
        let badgeClass = '';
        let badgeText = '';

        // Map types to badge styles/text (simplified)
        switch (item.type) {
            case 'new': badgeText = currentLang === 'ta' ? 'புதியது' : 'New'; break;
            case 'update': badgeText = currentLang === 'ta' ? 'புதுப்பிப்பு' : 'Update'; break;
            case 'alert': badgeText = currentLang === 'ta' ? 'எச்சரிக்கை' : 'Alert'; break;
            case 'news': badgeText = currentLang === 'ta' ? 'செய்தி' : 'News'; break;
            case 'eco': badgeText = currentLang === 'ta' ? 'சூழல்' : 'Eco'; break;
        }

        html += `
            <li>
                <span class="news-date">${badgeText}</span>
                <p>${text}</p>
            </li>
        `;
    });

    newsContainer.innerHTML = html;
}

// Update News when language changes
const originalUpdateContent = updateContent;
updateContent = function () {
    originalUpdateContent(); // Call original function
    initDailyNews(); // Re-render news in correct language

    // Explicitly set Tamil font on body if Tamil
    if (currentLang === 'ta') {
        document.body.classList.add('lang-ta');
        document.documentElement.lang = 'ta';
    } else {
        document.body.classList.remove('lang-ta');
        document.documentElement.lang = 'en';
    }
};

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

// --- Feature 3: Fine Calculator Logic ---
const fineDatabase = {
    helmet: { base: 1000, tip_en: "Helmets reduce the risk of head injury by 69%.", tip_ta: "தலைக்கவசம் தலைக்காயத்தின் அபாயத்தை 69% குறைக்கிறது." },
    seatbelt: { base: 1000, tip_en: "Seatbelts save lives in rollovers and collisions.", tip_ta: "சீட் பெல்ட்கள் விபத்துகளின் போது உயிரைக் காக்கின்றன." },
    overspeed: { base: 1000, heavy_multiplier: 2, tip_en: "Speed thrills but kills. Stick to limits.", tip_ta: "வேகம் விபத்தை விளைவிக்கும். வரம்பிற்குள் செல்லுங்கள்." },
    drunk: { base: 10000, tip_en: "Don't drink and drive. Take a cab.", tip_ta: "குடித்துவிட்டு வாகனம் ஓட்ட வேண்டாம். வாடகை வண்டியைப் பயன்படுத்துங்கள்." },
    signal: { base: 1000, tip_en: "Red means STOP. Don't rush.", tip_ta: "சிவப்பு என்றால் நில். அவசரப்பட வேண்டாம்." },
    license: { base: 5000, tip_en: "Always carry a valid driving license.", tip_ta: "எப்போதும் செல்லுபடியாகும் ஓட்டுநர் உரிமத்தை வைத்திருங்கள்." },
    insurance: { base: 2000, tip_en: "Insurance protects you financially.", tip_ta: "காப்பீடு உங்களுக்கு நிதிப் பாதுகாப்பை அளிக்கிறது." }
};

function checkFine() {
    const vehicleType = document.getElementById('fine-vehicle').value;
    const violationType = document.getElementById('fine-violation').value;
    const resultBox = document.getElementById('fine-result');
    const amountDisplay = document.getElementById('fine-amount-display');
    const tipDisplay = document.getElementById('fine-tip-display');

    if (!fineDatabase[violationType]) return;

    const data = fineDatabase[violationType];
    let amount = data.base;

    // Heavy vehicles often have higher fines for speeding/permit violations
    if (violationType === 'overspeed' && vehicleType === 'heavy') {
        amount *= data.heavy_multiplier || 2;
    }

    // Update UI
    amountDisplay.innerText = `₹${amount.toLocaleString()}`;
    tipDisplay.innerText = currentLang === 'ta' ? data.tip_ta : data.tip_en;

    resultBox.style.display = 'block';
}

// --- Feature 4: Analytics Chart ---
let safetyChart = null;

function initCharts() {
    const ctx = document.getElementById('safetyChart');
    if (!ctx) return;

    const data = {
        labels: ['2020', '2021', '2022', '2023', '2024', '2025'],
        datasets: [
            {
                label: translations[currentLang].chart_label_accidents,
                data: [65000, 59000, 55000, 48000, 42000, 38000],
                backgroundColor: 'rgba(0, 74, 153, 0.6)',
                borderColor: 'rgba(0, 74, 153, 1)',
                borderWidth: 1
            },
            {
                label: translations[currentLang].chart_label_fatalities,
                data: [12000, 10500, 9800, 8500, 7200, 6500],
                backgroundColor: 'rgba(211, 47, 47, 0.6)',
                borderColor: 'rgba(211, 47, 47, 1)',
                borderWidth: 1
            }
        ]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: translations[currentLang].chart_title,
                    font: { size: 18 }
                }
            }
        }
    };

    if (safetyChart) {
        safetyChart.destroy();
    }
    safetyChart = new Chart(ctx, config);
}

// Hook chart update into language switch
const secondUpdateContent = updateContent;
updateContent = function () {
    secondUpdateContent();
    if (safetyChart) {
        initCharts(); // Re-render chart with new language labels
    }
};

// Initial call
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
});
