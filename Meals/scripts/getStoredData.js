function getStoredData(name) {
    return firebase.firestore().collection(name);
}

export default getStoredData;