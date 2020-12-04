import errorHandler from './errorHandler.js';
import successfulHandler from './successfulHandler.js';
import getLocaleData from './localeData.js';
import getStoredData from './getStoredData.js';

const Auth = firebase.auth();
const DB = firebase.firestore();

const router = Sammy('#container', sammyFunc);

function sammyFunc() {

    this.use('Handlebars', 'hbs');

    // ----- GET -----

    this.get('/home', function (context) {

        const user = getLocaleData('userInfo');
        if (user) {
            this.loggedIn = user;
            this.email = user.email;
        }

        this.loadPartials({

            'header': './templates/header.hbs',
            'footer': './templates/footer.hbs',
            'movie': './templates/movie.hbs',
        }).then(function (context) {

            DB.collection('movies').get()
                .then(res => {

                    const obj = {
                        movies: []
                    };

                    res.forEach(src => {

                        obj.movies.push({
                            id: src.id,
                            title: src.data().title,
                            description: src.data().description,
                            imageUrl: src.data().imageUrl,
                            creator: src.data().creator
                        });
                    });
                    this.partial('./templates/home.hbs', obj);
                });


        });
    });

    this.get('/register', function (context) {

        this.loadPartials({

            'header': './templates/header.hbs',
            'footer': './templates/footer.hbs',
        }).then(function (context) {

            this.partial('./templates/register.hbs');
        });
    });

    this.get('/login', function (context) {

        this.loadPartials({

            'header': './templates/header.hbs',
            'footer': './templates/footer.hbs',
        }).then(function (context) {

            this.partial('./templates/login.hbs');
        });
    });

    this.get('/logout', function (context) {

        localStorage.removeItem('userInfo');
        this.redirect('/home');
    });

    this.get('/addMovie', function (context) {

        const user = getLocaleData('userInfo');
        this.loggedIn = user;
        this.email = user.email;

        this.loadPartials({

            'header': './templates/header.hbs',
            'footer': './templates/footer.hbs',
        }).then(function (context) {
            this.partial('./templates/addMovie.hbs');
        });
    });

    this.get('/details/:id', function (context) {

        const id = context.params.id;

        const user = getLocaleData('userInfo');
        this.loggedIn = user;
        this.email = user.email;

        this.loadPartials({

            'header': './templates/header.hbs',
            'footer': './templates/footer.hbs',

        }).then(function (context) {

            DB.collection("movies").doc(id).get()
                .then((articlesSrc) => {

                    const data = {
                        title: articlesSrc.data().title,
                        description: articlesSrc.data().description,
                        imageUrl: articlesSrc.data().imageUrl,
                        creator: articlesSrc.data().creator === getLocaleData('userInfo').uid,
                        likes: articlesSrc.data().likes,
                        id,
                        user: getLocaleData('userInfo').uid
                    };

                    data.liked = data.likes.includes(getLocaleData('userInfo').uid);

                    this.partial('./templates/details.hbs', data);
                });
        });
    });

    this.get('/delete/:id', function (context) {

        const id = context.params.id;

        DB.collection("movies").doc(id).delete()
            .then(() => {

                this.redirect('/home');
            });
    });

    this.get('/edit/:id', function (context) {

        const id = context.params.id;

        const user = getLocaleData('userInfo');
        this.loggedIn = user;
        this.email = user.email;

        this.loadPartials({

            'header': './templates/header.hbs',
            'footer': './templates/footer.hbs',

        }).then(function (context) {

            DB.collection("movies").doc(id).get()
                .then((articlesSrc) => {

                    const data = {
                        title: articlesSrc.data().title,
                        description: articlesSrc.data().description,
                        imageUrl: articlesSrc.data().imageUrl,
                        creator: getLocaleData('userInfo').uid,
                        id
                    };

                    this.partial('./templates/edit.hbs', data);
                });
        });
    });

    this.get('/like/:user/:id', function (context) {

        const { user, id } = context.params;

        DB.collection('movies').doc(id).get()
            .then(res => {

                const likes = res.data().likes;
                likes.push(user);

                DB.collection("movies").doc(id).update({ likes })
                    .then(function (docRef) {

                        context.redirect('/home');
                    })
                    .catch(errorHandler);
            });
    });

    // ----- POST -----

    this.post('/register', function (context) {

        const { email, password, repeatPassword } = context.params;

        if (!email) {
            const error = { message: 'The email input must be filled'};
            errorHandler(error);
            return;
        }

        if (password !== repeatPassword) {
            const error = { message: 'The repeat password should be equal to the password'};
            errorHandler(error);
            return;
        }

        Auth.createUserWithEmailAndPassword(email, password)
            .then(() => {

                successfulHandler(context, '/login', 'Successful registration');
            })
            .catch(errorHandler);
    });

    this.post('/login', function (context) {

        const { email, password } = context.params;

        if (!email || !password) {
            const error = { message: 'The email and password inputs must be filled'};
            errorHandler(error);
            return;
        }

        Auth.signInWithEmailAndPassword(email, password)
            .then(({ user: { email, uid } }) => {

                localStorage.setItem('userInfo', JSON.stringify({ email, uid }));

                successfulHandler(context, '/home', 'Successful login');
            })
            .catch(errorHandler);
    });

    this.post('/addMovie', function (context) {

        const { title, description, imageUrl } = context.params;

        if (!title || !description || !imageUrl) {
            const error = { message: 'All inputs must be filled'};
            errorHandler(error);
            return;
        }

        const data = {
            title,
            description,
            imageUrl,
            creator: getLocaleData('userInfo').uid,
            likes: []
        };

        DB.collection("movies").add(data)
            .then(function (docRef) {

                successfulHandler(context, '/home', 'Successful createdMovie');
            })
            .catch(errorHandler);
    });

    this.post('/edit/:id', function (context) {

        const { title, description, imageUrl, id } = context.params;

        const data = {
            title,
            description,
            imageUrl,
            creator: getLocaleData('userInfo').uid,
        };

        DB.collection("movies").doc(id).update(data)
            .then(function (docRef) {

                context.redirect('/home');
            })
            .catch(errorHandler);
    });
}

router.run('/home');