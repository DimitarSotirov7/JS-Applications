import elements from './htmlElements.js';
import errorHandler from './errorHandler.js';

const mainPartials = {
    'header': './templates/common/header.hbs',
    'footer': './templates/common/footer.hbs'
};

const router = Sammy('#main', sammyFunc);

function sammyFunc() {

    this.use('Handlebars', 'hbs');

    // ---------- GET ----------

    this.get('/home', function (context) {

        const userLogged = localStorage.getItem('userInfo');

        if (userLogged) {
            this.loggedIn = true;
            this.email = JSON.parse(userLogged).email;
        }

        this.loadPartials(mainPartials)
            .then(function () {
                this.partial('./templates/home/home.hbs');
            });
    });

    this.get('/about', function (context) {

        const userLogged = localStorage.getItem('userInfo');

        if (userLogged) {
            this.loggedIn = true;
            this.email = JSON.parse(userLogged).email;
        }

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

    this.get('logout', function (context) {

        firebase.auth().signOut()
            .then(r => {
                localStorage.removeItem('userInfo');
                this.redirect('/home');
            })
            .catch(err => errorHandler(err.message));
    });

    this.get('/catalog', function (context) {
        
        this.hasNoTeam = true;
        const userLogged = localStorage.getItem('userInfo');

        if (userLogged) {
            this.loggedIn = true;
            this.email = JSON.parse(userLogged).email;
        }

        const allPartials = Object.assign(mainPartials, {
            'team': './templates/catalog/team.hbs'
        });

        this.loadPartials(allPartials)
            .then(function (context) {
                this.partial('./templates/catalog/teamCatalog.hbs');
            });
    });

    this.get('/create', function (context) { });

    this.get('/edit', function (context) { });

    // ---------- POST ----------

    this.post('/register', function (context) {
        const { email, password, repeatPassword } = context.params;

        if (password !== repeatPassword) {
            const message = 'The password must be equal to repeatPassword!';
            errorHandler(message);
            return;
        }

        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((user) => {
                this.redirect('/login');
            })
            .catch(err => errorHandler(err.message));
    });

    this.post('/login', function (context) {

        const { email, password } = context.params;

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(({ user: { uid, email } }) => {

                localStorage.setItem('userInfo', JSON.stringify({ email, password, uid }));
                this.redirect('/home');
            })
            .catch(err => errorHandler(err.message));
    });
}

router.run('/home');