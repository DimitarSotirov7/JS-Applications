import elements from './htmlElements.js';

const router = Sammy('#main', sammyFunc);

function sammyFunc() {

    this.use('Handlebars', 'hbs');
}

router.run('/home');