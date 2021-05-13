function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}


class Store {
    static getData() {
        let data;
        if (localStorage.getItem(`data`) === null) {
            data = [];
        } else {
            data = JSON.parse(localStorage.getItem(`data}`));
        }
        return data;
    }

    static addData(newData) {
        const datas = Store.getData();
        console.log(datas)
        datas['high-score'] = newData;
        localStorage.setItem(`data`, JSON.stringify(datas));
    }


}
Store.addData(34);