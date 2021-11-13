function buildSleep(size) {
    let sleep = [];

    for (let i = 0; i <= size; i++) {
        for (let j = i; j <= size; j++) {
            let x = i.toString();
            let y = j.toString();

            sleep.push({
                id: x + '_' + y,
                leftString: x,
                leftNumber: i,
                rightString: y,
                rightNumber: j
            });
        };
    };

    return sleep;
};

function getTileFromSleep(sleep) {
    let index = Math.floor(Math.random() * sleep.length);
    let tile = sleep[index];

    sleep.splice(index, 1);

    return tile;
};

function flipTile(tile) {
    let _tile = Object.assign({}, tile);

    tile.leftString = _tile.rightString;
    tile.leftNumber = _tile.rightNumber;
    tile.rightString = _tile.leftString;
    tile.rightNumber = _tile.leftNumber;

    return _tile;
};

export { buildSleep, getTileFromSleep, flipTile };
