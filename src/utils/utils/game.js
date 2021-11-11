const TILE_MAXIMUM_NUMBER = 3;
const DECK_MAXIMUM_SIZE = 3;
const PLAYER_LIMIT = 2;

function buildSleep() {
    let sleep = [];

    for (let i = 0; i <= TILE_MAXIMUM_NUMBER; i++) {
        for (let j = i; j <= TILE_MAXIMUM_NUMBER; j++) {
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

export { DECK_MAXIMUM_SIZE, PLAYER_LIMIT, buildSleep, getTileFromSleep, flipTile };
