
// declare/define the function
async function includeHTML() {
	
    const includeFile = async (selector, url) => {
        try {
            const response = await fetch(url); // fetch url from server
			
            if (!response.ok) throw new Error(`${url} not found`); // error url not found message
			
            const html = await response.text(); // convert response to plain text
			
            document.querySelector(selector).innerHTML = html; // insert plain text into the html file inside of div with "id" = "selector"
			
        } catch (err) {
            console.error(err);
        }
    };

    // Load header and footer
    await includeFile('#header', '/layout/header.html');
    await includeFile('#footer', '/layout/footer.html');
    
}


// Run the function
includeHTML();