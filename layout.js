// layout.js: loads header and footer
async function includeHTML() {
    const includeFile = async (selector, url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`${url} not found`);
            const html = await response.text();
            document.querySelector(selector).innerHTML = html;
        } catch (err) {
            console.error(err);
        }
    };

    // Load header and footer
    await includeFile('#header', '/header.html');
    await includeFile('#footer', '/footer.html');
}

// Run the function
includeHTML();