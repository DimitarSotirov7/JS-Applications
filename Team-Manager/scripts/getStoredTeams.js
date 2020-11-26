const teams = [];
                
firebase.firestore().collection("teams").get().then((data) => {

    data.forEach((record) => {
        const { name, comment, creator } = record.data();

        teams.push({ name, comment, creator});
    });
});

export default teams;