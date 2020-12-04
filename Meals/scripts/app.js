import errorHandler from './errorHandler.js';
import successfulHandler from './successfulHandler.js';
import getLocaleData from './localeData.js';
import getStoredData from './getStoredData.js';

const Auth = firebase.auth();
const DB = firebase.firestore();

const router = Sammy('#main', sammyFunc);

function sammyFunc() {

    this.use('Handlebars', 'hbs');

    // ----- GET -----

    this.get('/home', function (context) {

        const user = getLocaleData('userInfo');
        if (user) {
            this.loggedIn = user;
        }

        this.loadPartials({

            'header': './templates/header.hbs',
            'footer': './templates/footer.hbs',
            'dashboard': './templates/dashboard.hbs'
        }).then(function (context) {

            if (user) {

                DB.collection('ideas').get()
                    .then(res => {

                        const data = { ideas: [] };

                        res.forEach(src => {

                            data.ideas.push({
                                id: src.id,
                                title: src.data().title,
                                description: src.data().description,
                                imageURL: src.data().imageURL,
                                creator: src.data().creator === getLocaleData('userInfo').uid,
                                likes: src.data().likes,
                                comments: src.data().comments,
                            });
                        });

                        this.partial('./templates/home.hbs', data);
                    });
            } else {

                this.partial('./templates/home.hbs');
            }
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

    this.get('/create', function (context) {

        const user = getLocaleData('userInfo');
        this.loggedIn = user;

        this.loadPartials({

            'header': './templates/header.hbs',
            'footer': './templates/footer.hbs',
        }).then(function (context) {
            this.partial('./templates/create.hbs');
        });
    });

    this.get('/details/:id', function (context) {

        const id = context.params.id;

        const user = getLocaleData('userInfo');
        this.loggedIn = user;

        this.loadPartials({

            'header': './templates/header.hbs',
            'footer': './templates/footer.hbs',
        }).then(function (context) {

            DB.collection("ideas").doc(id).get()
                .then((src) => {

                    const data = {
                        id,
                        title: src.data().title,
                        description: src.data().description,
                        imageURL: src.data().imageURL,
                        creator: src.data().creator === getLocaleData('userInfo').uid,
                        likes: src.data().likes,
                        comments: src.data().comments.map(comment => {
                            return { comment };
                        })
                    };

                    this.partial('./templates/details.hbs', data);
                });
        });
    });

    this.get('/delete/:id', function (context) {

        const id = context.params.id;

        DB.collection("ideas").doc(id).delete()
            .then(() => {

                this.redirect('/home');
            });
    });

    this.get('/like/:id', function (context) {

        const id = context.params.id;

        DB.collection("ideas").doc(id).get()
            .then(res => {

                let likes = res.data().likes;
                likes++;

                DB.collection('ideas').doc(id).update({ likes })
                    .then(res => {

                        this.redirect('/home');
                    }).catch(errorHandler);
            });
    });

    // ----- POST -----

    this.post('/register', function (context) {

        const { email, password, repeatPassword } = context.params;

        if (password !== repeatPassword) {
            return;
        }

        Auth.createUserWithEmailAndPassword(email, password)
            .then(() => {

                //successfulHandler(context, '/login', 'Successful registration');  
                this.redirect('/login');
            })
            .catch(errorHandler);
    });

    this.post('/login', function (context) {

        const { email, password } = context.params;

        Auth.signInWithEmailAndPassword(email, password)
            .then(({ user: { email, uid } }) => {

                localStorage.setItem('userInfo', JSON.stringify({ email, uid }));
                //successfulHandler(context, '/home', 'Successful login');     
                this.redirect('/home');
            })
            .catch(errorHandler);
    });

    this.post('/create', function (context) {

        const { title, description, imageURL } = context.params;

        const data = {
            title,
            description,
            imageURL,
            creator: getLocaleData('userInfo').uid,
            likes: 0,
            comments: []
        };

        DB.collection("ideas").add(data)
            .then(function (docRef) {

                context.redirect('/home');
            })
            .catch(errorHandler);
    });

    this.post('/comments/:id', function (context) {

        const { newComment, id } = context.params;

        DB.collection('ideas').doc(id).get()
            .then(res => {

                const comments = res.data().comments;
                comments.push(newComment);

                DB.collection("ideas").doc(id).update({ comments })
                    .then(function (docRef) {

                        context.redirect('/home');
                    })
                    .catch(errorHandler);
            });
    });
}

router.run('/home');