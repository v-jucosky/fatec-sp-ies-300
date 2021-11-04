const TILE_MAXIMUM_NUMBER = 3;
const DECK_MAXIMUM_SIZE = 3;
const PLAYER_LIMIT = 2;

const themePalette = [
    {
        name: 'Padrão',
        code: '#3f51b5'
    },
    {
        name: 'Roxo',
        code: '#9c27b0'
    },
    {
        name: 'Vermelho',
        code: '#d32f2f'
    },
    {
        name: 'Laranja',
        code: '#ED6C02'
    },
    {
        name: 'Verde',
        code: '#2e7d32'
    }
];

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

export { DECK_MAXIMUM_SIZE, PLAYER_LIMIT, themePalette, buildSleep, getTileFromSleep };
