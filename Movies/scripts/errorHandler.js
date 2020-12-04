function errorHandler(error) {

    const notification = document.querySelector('#notification');

    fetch('./templates/notifications.hbs')
        .then(r => r.text())
        .then(templateSrc => {

            notification.style.display = 'block';
            const template = Handlebars.compile(templateSrc);
            notification.innerHTML = template({ error });

            setTimeout(function () {

                notification.style.display = 'none';
            }, 2000);
        });
}

export default errorHandler;