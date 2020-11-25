import elements from './htmlElements.js';

const mainPartials = {
    'header': './templates/common/header.hbs',
    'footer': './templates/common/footer.hbs'
};

const router = Sammy('#main', sammyFunc);

function sammyFunc() {

    this.use('Handlebars', 'hbs');

    // ---------- GET ----------

    this.get('/home', function (context) {

        this.loadPartials(mainPartials)
            .then(function () {
                this.partial('./templates/home/home.hbs');
            });
    });

    this.get('/about', function (context) {

        this.loadPartials(mainPartials)
            .then(function () {
                this.partial('./templates/about/about.hbs');
            });
    });

    this.get('/register', function (context) {

        const allPartials = Object.assign(mainPartials, {
            'registerForm': './templates/register/registerForm.hbs'
        });

        this.loadPartials(allPartials)
            .then(function () {
                this.partial('./templates/register/registerPage.hbs');
            });
    });

    this.get('/login', function (context) {

        const allPartials = Object.assign(mainPartials, {
            'loginForm': './templates/login/loginForm.hbs'
        });

        this.loadPartials(allPartials)
            .then(function () {
                this.partial('./templates/login/loginPage.hbs');
            });
    });

}

router.run('/home');