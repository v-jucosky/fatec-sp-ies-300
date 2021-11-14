function buildSleep(size) {
    let sleep = [];

    for (let i = 0; i <= size; i++) {
        for (let j = i; j <= size; j++) {
            sleep.push({
                id: i.toString() + '_' + j.toString(),
                left: i,
                right: j
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

    _tile.left = tile.right;
    _tile.right = tile.left;

    return _tile;
};

export { buildSleep, getTileFromSleep, flipTile };
