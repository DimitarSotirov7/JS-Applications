function successfulHandler(context, redirect, message) {

    const notification = document.querySelector('#notification');

    fetch('./templates/notifications.hbs')
        .then(r => r.text())
        .then(templateSrc => {

            notification.style.display = 'block';
            const template = Handlebars.compile(templateSrc);
            notification.innerHTML = template({ message });

            setTimeout(function () {

                notification.style.display = 'none';
                context.redirect(redirect);
            }, 1000);
        });
}

export default successfulHandler;