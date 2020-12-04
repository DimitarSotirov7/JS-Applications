function getLocaleData(name) {
    return JSON.parse(localStorage.getItem(name));
}

export default getLocaleData;