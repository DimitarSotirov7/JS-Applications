import elements from './htmlElements.js';

function errorHandler(message) {

    elements.errorBox.textContent = message;
    elements.errorBox.style.display = 'block';

    setTimeout(() => {
        elements.errorBox.style.display = 'none';
    }, 3000)
}

export default errorHandler;