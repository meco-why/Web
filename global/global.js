

async function includeHTML() {

    const elements = document.querySelectorAll('[insert-HTML]');

    for (const element of elements){

        const url = element.getAttribute('insert-HTML');

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


includeHTML();






