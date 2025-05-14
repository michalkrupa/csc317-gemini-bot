const form = document.getElementById('form');
const geminiResponseContainer = document.getElementById('responseContainer');
const sendButton = document.getElementById('sendButton');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessageDiv = document.getElementById('error-message');

function formatTimeFromNow() {
    const now = Date.now();
    const date = new Date(now);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    return formattedTime;
}

function disableForm(form) {
    const formElements = form.elements;
    for (let i = 0; i < formElements.length; i++) {
        formElements[i].disabled = true;
    }
    sendButton.disabled = true;
    loadingIndicator.style.display = 'block'; // Show the loading indicator
}

function enableForm(form) {
    const formElements = form.elements;
    for (let i = 0; i < formElements.length; i++) {
        formElements[i].disabled = false;
    }
    sendButton.disabled = false;
    loadingIndicator.style.display = 'none'; // Hide the loading indicator
}

function addMessageToContainer(message, isUserMessage) {
    const messageElem = document.createElement('pre');
    const datetimeElem = document.createElement('span');
    datetimeElem.textContent = formatTimeFromNow();
    messageElem.textContent = message;
    if (isUserMessage) {
        messageElem.classList.add('user-message');
    } else {
        messageElem.classList.add('gemini-message');
    }
    messageElem.appendChild(datetimeElem);
    geminiResponseContainer.prepend(messageElem);
}


form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const inputText = document.getElementById("userInput");
    const userQuery = inputText.value.trim();

    if (!userQuery) return;

    addMessageToContainer(userQuery, true);

    disableForm(form);
    errorMessageDiv.textContent = ''; // Clear any previous error message
    try {
        const response = await fetch('/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userQuery }),
        });

        if (!response.ok) {
            const errorText = await response.text(); // Get the error message from the response
            throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
        }

        const data = await response.json();  // Get the response as text
        let jsonResponse;
        try {
            jsonResponse = await JSON.parse(data); // Try to parse the JSON
        } catch (jsonError) {
            console.error('Error parsing JSON:', jsonError);
            errorMessageDiv.textContent = `Error parsing JSON response: ${jsonError.message}.  Raw response: ${data}`; // Show raw response for debugging
            return; // Exit the function if JSON parsing fails
        }

        if (!jsonResponse.candidates || !jsonResponse.candidates[0] || !jsonResponse.candidates[0].content || !jsonResponse.candidates[0].content.parts || !jsonResponse.candidates[0].content.parts[0] || !jsonResponse.candidates[0].content.parts[0].text) {
            console.error('Invalid JSON structure:', jsonResponse);
            errorMessageDiv.textContent = "Error: Invalid JSON structure received from the server.";
            return; // Exit if the structure is wrong
        }


        const geminiResponse = jsonResponse.candidates[0].content.parts[0].text;

        addMessageToContainer(geminiResponse, false);

        form.reset();
    } catch (error) {
        console.error('Error during fetch:', error);
        errorMessageDiv.textContent = `Error: ${error.message}`; // Display error in the error div
    } finally {
        enableForm(form);
    }
});