if (window.location.pathname.includes('/en/')) {
    document.documentElement.setAttribute('data-lang', 'en');
} else {
    document.documentElement.setAttribute('data-lang', 'pl');
}

async function includeHTML() {

    const elements = document.querySelectorAll('[data-insert-html]');

    for (const element of elements){

        const url = element.getAttribute('data-insert-html');

        try {

            const response = await fetch(url);

            if (!response.ok) throw new Error(`${response.status} (file not found)`);

            const htmlText = await response.text();

            element.outerHTML = htmlText;

        } catch (err) {
            console.error("Failed to load component:", url, err);
            // element.innerHTML = `<span style="color: red;">Did not load: ${url}</span>`;
            element.outerHTML = `
            <div style="padding: 10px; border: 1px dashed red; color: red; font-size: 12px;">
                ⚠️ Failed to load component: ${url}
            </div>`;
        }

    }

    updateCurrentYear();

};

async function updateCurrentYear() {
    const year = document.getElementById('current-year');
    if (year) {
        year.textContent = new Date().getFullYear();
    }
};

function switchLanguage(targetLang) {
    let path = window.location.pathname;

    if (targetLang === 'en') {
        if (path.includes('/en/')) return;
        
        if (path.endsWith('.html')) {
            path = path.replace(/([^/]+\.html)$/, 'en/$1');
        } else {
            path = path.endsWith('/') ? path + 'en/' : path + '/en/';
        }
    } 
    else if (targetLang === 'pl') {
        if (!path.includes('/en/')) return;
        path = path.replace('/en/', '/');
    }

    window.location.href = path;
}

// --- GLASSMORPHISM ---
window.addEventListener('scroll', function() {
    const nav = document.getElementById('nav');
    
    if (nav) {
        if (window.scrollY > 50) {
            nav.classList.add('glass');
        } else {
            nav.classList.remove('glass');
        }
    }
});

includeHTML();






