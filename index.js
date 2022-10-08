console.log('qwirkle');

const shapeMap = {
    'star': '★',
    'circle': '●',
    'square': '■',
    'asterisk': '*',
    'plus': '+',
    'cross': 'x',
}

const saturation = 100;
const lightness = 50;
const colorMap = {
    red: [0, saturation, lightness],
    orange: [30, saturation, lightness],
    yellow: [50, saturation, lightness],
    green: [120, saturation, lightness],
    blue: [200, saturation, lightness],
    purple: [255, saturation, lightness],
}

function fhsla(h, s, l, a) {
    return `hsla(${h},${s}%,${l}%, ${a})`;
}

const svgShapes = {
    square: (color) => svg(color, "M0 96C0 60.7 28.7 32 64 32H384c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96z", "0 0 448 512"),
    circle: (color) => svg(color, "M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512z", "0 0 512 512"),
    diamond: (color) => svg(color, "M284.3 11.7c-15.6-15.6-40.9-15.6-56.6 0l-216 216c-15.6 15.6-15.6 40.9 0 56.6l216 216c15.6 15.6 40.9 15.6 56.6 0l216-216c15.6-15.6 15.6-40.9 0-56.6l-216-216z", "0 0 512 512"),
    plus: (color) => svg(color, "M208 0h96V172.9L453.7 86.4l48 83.1L352 256l149.7 86.4-48 83.1L304 339.1V512H208V339.1L58.3 425.6l-48-83.1L160 256 10.3 169.6l48-83.1L208 172.9V0z", "0 0 512 512"),
    star: (color) => svg(color, "M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z", "0 0 576 512"),
    cross: (color) => svg(color, "M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z", "0 0 320 512"),
}

function svg(color, d, viewBox) {
    const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const iconPath = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
    );

    iconPath.setAttribute(
        'd', d
    );
    iconSvg.setAttribute('viewBox', viewBox);
    iconSvg.setAttribute('fill', color);
    iconSvg.appendChild(iconPath);
    return iconSvg;
}


const tiles = {
    live: [],
    next: [{ x: 0, y: 0 }],
}

function indexTile(tileset, x, y) {
    const index = tileset.findIndex(tile => tile.x === x && tile.y === y);
    return index;
}

function indexNextTile(x, y) {
    return indexTile(tiles.next, x, y);
}

function indexLiveTile(x, y) {
    return indexTile(tiles.live, x, y);
}

function liveTileExists(x, y) {
    return indexLiveTile(x, y) !== -1;
}

function nextTileExists(x, y) {
    return indexNextTile(x, y) !== -1;
}

function getTile(x, y) {
    // console.log('-', x, y);
    const index = indexLiveTile(x, y);
    if (index !== -1) {
        return tiles.live[index];
    } else {
        return console.error(`Attempted to get live tile which does not exist at (${x}, ${y}).`);
    }
}

function addNextTile(x, y) {
    if (!liveTileExists(x, y) && !nextTileExists(x, y)) {
        tiles.next.push({ x: x, y: y });
    } else {
        // console.warn(`Location (${x}, ${y}) is not available for next tile.`);
    }
}

function findFirstEmptyTile(x, y, inX) {
    const range = { min: 0, max: 0 };
    if (inX) {
        let dx = 1;
        while (liveTileExists(x - dx, y)) {
            dx++;
        }
        range.min = dx - 1;

        dx = 1;
        while (liveTileExists(x + dx, y)) {
            dx++;
        }
        range.max = dx - 1;
        // console.log('x', range);
    } else {

        let dy = 1;
        while (liveTileExists(x, y - dy)) {
            dy++;
        }
        range.min = dy - 1;

        dy = 1;
        while (liveTileExists(x, y + dy)) {
            dy++;
        }
        range.max = dy - 1;
        // console.log('y', range);
    }
    return range;
}

function isGroupValid(x, y, range, shape, color, getTileFnc) {
    if (range.min === 0 && range.max === 0) return true;
    const colors = new Set();
    const shapes = new Set();
    colors.add(color);
    shapes.add(shape);

    let areDuplicateColors = false;
    let areDuplicateShapes = false;
    // console.log('a', x, y, range);
    for (let i = x - range.min; i <= x + range.max; i++) {
        // console.log('i', i);
        if (i === x) continue;
        const tile = getTileFnc(i, y);
        if (colors.has(tile.color)) {
            areDuplicateColors = true;
        }
        if (shapes.has(tile.shape)) {
            areDuplicateShapes = true;
        }
        colors.add(tile.color);
        shapes.add(tile.shape);
    }

    const areColorsUnique = colors.size === 1;
    const areShapesUnique = shapes.size === 1;

    const isValid = (areColorsUnique && !areShapesUnique && !areDuplicateShapes) ||
        (!areColorsUnique && areShapesUnique && !areDuplicateColors);

    // console.log({
    //     xmin: x - range.min,
    //     xmax: x + range.max,
    //     y, areColorsUnique, areShapesUnique, isValid, colors, shapes
    // });

    return isValid;
}

function addLiveTile(x, y, shape, color) {
    // console.log({ x, y, shape, color });
    const index = indexNextTile(x, y);
    if (index !== -1) {
        const dx = findFirstEmptyTile(x, y, true);
        const dy = findFirstEmptyTile(x, y, false);

        const isValid = isGroupValid(x, y, dx, shape, color,
            (i, y) => getTile(i, y)) &&
            isGroupValid(y, x, dy, shape, color,
                (i, x) => getTile(x, i));

        if (isValid) {
            tiles.live.push({ ...tiles.next[index], shape, color });
            tiles.next.splice(index, 1);
            // addNextTile(x + 1, y);
            // addNextTile(x - 1, y);
            // addNextTile(x, y + 1);
            // addNextTile(x, y - 1);
            return true;
        } else {
            console.error(`Location (${x}, ${y}) is not valid for live tile (${color}, ${shape}).`);
        }
    } else {
        console.error(`Location (${x}, ${y}) is not available for next tile.`);
    }
    return false;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function newTileBag() {
    const colors = ["red", "orange", "yellow", "green", "blue", "purple"];
    // const colors = ["purple", "purple", "purple"];
    // const shapes = ["square", "star", "circle", "asterisk", "plus", "cross"]; 
    const shapes = Object.keys(svgShapes);

    return shuffleArray(
        [0, 1, 2]
            .map((_) =>
                colors.map((color) => shapes.map((shape) => ({ color, shape }))).flat()
            )
            .flat()
    );
}

function pickTileFromBag() {
    const tile = tileBag[tileBag.length - 1];
    // console.log(tile);
    tileBag.pop();
    return tile;
}



const tileAdds = [
    [0, 0, 'circle', 'purple'],
    [1, 0, 'star', 'purple'],
    [2, 0, 'square', 'purple'],
    [2, 1, 'square', 'red'],
    [2, 2, 'square', 'blue'],
    [1, 2, 'square', 'red'],
    [0, 2, 'square', 'purple'],

    [0, 3, 'star', 'purple'],
    // [0, 1, 'asterisk', 'purple'],

    [-1, 2, 'square', 'green'],
    [-1, 3, 'star', 'green'],
]

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

function sizeBoard(refBoard) {
    const boardRange = { x0: 0, x1: 0, y0: 0, y1: 0, x: 0, y: 0, dx: 0, dy: 0 };
    {
        for (const tile of tiles.live) {
            if (tile.x < boardRange.x0) boardRange.x0 = tile.x;
            if (tile.x > boardRange.x1) boardRange.x1 = tile.x;
            if (tile.y < boardRange.y0) boardRange.y0 = tile.y;
            if (tile.y > boardRange.y1) boardRange.y1 = tile.y;
        }
        boardRange.dx = (boardRange.x1 - boardRange.x0) + 3;
        boardRange.dy = (boardRange.y1 - boardRange.y0) + 3;
        boardRange.x = boardRange.x0 + (boardRange.x1 - boardRange.x0) / 2;
        boardRange.y = boardRange.y0 + (boardRange.y1 - boardRange.y0) / 2;
    }
    // console.log(boardRange);

    const tileSize = Math.min(refBoard.offsetWidth / boardRange.dx, refBoard.offsetHeight / boardRange.dy) - 10;

    return [boardRange, tileSize];
}

function renderNextTiles(tileList, boardRange, tileSize) {
    const refBoard = document.getElementById('board');
    for (const tile of tileList) {
        // console.log(tile);
        const ref = document.createElement('div');
        ref.classList.add('tile', 'next');
        // ref.innerText = `${tile.x} ${tile.y}`;
        ref.style.width = `${tileSize - borderSize}px`;
        ref.style.height = `${tileSize - borderSize}px`;
        ref.style.top = `${(tile.y - boardRange.y - 0.5) * tileSize + refBoard.offsetHeight / 2}px`;
        ref.style.left = `${(tile.x - boardRange.x - 0.5) * tileSize + refBoard.offsetWidth / 2}px`;

        ref.onclick = () => {
            const handTile = handTiles[handTileIndex];
            if (handTile !== undefined) {
                // console.log(tile.x, tile.y, handTile.shape, handTile.color);
                if (addLiveTile(tile.x, tile.y, handTile.shape, handTile.color)) {
                    document.getElementById('undo').classList.remove('disable');
                    document.getElementById('next').classList.remove('disable');
                    handTiles[handTileIndex] = undefined;
                    placedTiles.push(tile);
                    renderBoard();
                    renderHandTiles();
                } else {
                    const refHandTile = document.getElementById('hand-tile-' + handTileIndex);
                    refHandTile.classList.add('invalid');
                    setTimeout(() => {
                        refHandTile.classList.remove('invalid');
                    }, 3000);
                }
            }
        }
        refBoard.appendChild(ref);
    }
}

function renderBoard() {

    const refBoard = document.getElementById('board');
    const [boardRange, tileSize] = sizeBoard(refBoard);
    refBoard.innerHTML = '';
    // console.log(refBoard.offsetWidth);

    tiles.next = [];

    for (const tile of tiles.live) {
        const { x, y } = tile;
        addNextTile(x + 1, y);
        addNextTile(x - 1, y);
        addNextTile(x, y + 1);
        addNextTile(x, y - 1);
    }

    for (const tile of tiles.live) {
        // console.log(tile);
        const ref = document.createElement('div');
        ref.id = `live-tile-${tile.x}-${tile.y}`;
        ref.classList.add('tile');
        // ref.innerText = shapeMap[tile.shape];
        const color = colorMap[tile.color];
        // console.log(fhsla(...color, 1.0));
        ref.style.color = fhsla(...color, 1.0);

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            ref.style.backgroundColor = fhsla(color[0], 100, 5, 1.0);
        } else {
            ref.style.backgroundColor = fhsla(color[0], 100, 95, 1.0);
        }

        ref.style.width = `${tileSize - borderSize}px`;
        ref.style.height = `${tileSize - borderSize}px`;
        ref.style.fontSize = `${tileSize - borderSize}px`;
        ref.style.top = `${(tile.y - boardRange.y - 0.5) * tileSize + refBoard.offsetHeight / 2}px`;
        ref.style.left = `${(tile.x - boardRange.x - 0.5) * tileSize + refBoard.offsetWidth / 2}px`;
        ref.appendChild(svgShapes[tile.shape](fhsla(...color, 1.0)));
        refBoard.appendChild(ref);
    }

    if (placedTiles.length > 0) {
        const firstTile = placedTiles[0];
        // console.log('placedTiles', firstTile.x, firstTile.y);
        const dx = findFirstEmptyTile(firstTile.x, firstTile.y, true);
        const dy = findFirstEmptyTile(firstTile.x, firstTile.y, false);

        const qwirkle = (range) => {
            const points = range.max + range.min
            if (points === 0) {
                return 0;
            } else if (points < 5) {
                return points + 1;
            } else {
                return 12;
            }
        }

        score = qwirkle(dx) + qwirkle(dy);
        while (scoreList.length) { scoreList.pop(); };

        function scoreTileX(range, tile) {
            if (!(range.min === 0 && range.max === 0)) {
                scoreList.push(range.max + range.min + 1);
                for (let x = tile.x - range.min; x <= tile.x + range.max; ++x) {
                    scoreList.push({ x, y: tile.y });
                }

            }
        }

        function scoreTileY(range, tile) {
            if (!(range.min === 0 && range.max === 0)) {
                scoreList.push(range.max + range.min + 1);
                for (let y = tile.y - range.min; y <= tile.y + range.max; ++y) {
                    scoreList.push({ x: tile.x, y });
                }
            }
        }

        const validNextTiles = [];

        if (placedTiles.length > 1) {
            if (placedTiles[0].x === placedTiles[1].x) {
                validNextTiles.push({ x: firstTile.x, y: firstTile.y - dy.min - 1 });
                validNextTiles.push({ x: firstTile.x, y: firstTile.y + dy.max + 1 });

                for (const tile of placedTiles.slice(1)) {
                    const range = findFirstEmptyTile(tile.x, tile.y, true);
                    score += qwirkle(range);
                    scoreTileX(range, tile);
                }
            } else {
                validNextTiles.push({ x: firstTile.x - dx.min - 1, y: firstTile.y });
                validNextTiles.push({ x: firstTile.x + dx.max + 1, y: firstTile.y });

                for (const tile of placedTiles.slice(1)) {
                    const range = findFirstEmptyTile(tile.x, tile.y, false);
                    score += qwirkle(range);
                    scoreTileY(range, tile);
                }
            }
        } else {
            validNextTiles.push({ x: firstTile.x - dx.min - 1, y: firstTile.y });
            validNextTiles.push({ x: firstTile.x + dx.max + 1, y: firstTile.y });
            validNextTiles.push({ x: firstTile.x, y: firstTile.y - dy.min - 1 });
            validNextTiles.push({ x: firstTile.x, y: firstTile.y + dy.max + 1 });
        }

        scoreTileX(dx, firstTile);
        scoreTileY(dy, firstTile);

        console.log({ score, dy });
        document.getElementById('last-score').innerText = '+' + score;
        renderNextTiles(validNextTiles, boardRange, tileSize);
    } else {
        document.getElementById('last-score').innerText = '';
        renderNextTiles(tiles.next, boardRange, tileSize);
    }
}

function dragElement(ref, i) {
    let x = 0, y = 0, dx = 0, dy = 0;
    console.log(ref, i);

    ref.onmousedown = (e) => {
        e = e || window.event;
        e.preventDefault();
        x = e.clientX;
        y = e.clientY;

        document.onmouseup = () => {
            document.onmouseup = null;
            document.onmousemove = null;
        };

        document.onmousemove = (e) => {
            e = e || window.event;
            e.preventDefault();

            dx = x - e.clientX;
            dy = y - e.clientY;
            // x = e.clientX;
            // y = e.clientY;

            if (dx < -ref.offsetWidth) {
                console.log('shift');
                const temp = handTiles[i];
                handTiles[i] = handTiles[i + 1];
                handTiles[i + 1] = temp;
                handTileIndex++;
                ref.onmousedown = null;
                renderHandTiles();

            }
            // console.log(dx, ref.offsetWidth);

            // ref.style.top = (ref.offsetTop - dy) + "px";
            // ref.style.left = (ref.offsetLeft - dx) + "px";
        };
    }
}

function renderHandTiles() {
    const refHand = document.getElementById('hand');
    refHand.innerHTML = '';
    const tileSize = Math.min(refHand.offsetWidth / 7, refHand.offsetHeight / 1.5);
    let i = 0;
    for (const tile of handTiles) {
        if (tile == undefined) { i++; continue; }
        // console.log(tile);
        const ref = document.createElement('div');
        ref.classList.add('tile');
        ref.id = 'hand-tile-' + i;
        // ref.innerText = shapeMap[tile.shape];
        const color = colorMap[tile.color];
        ref.style.color = fhsla(...color, 1.0);
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            ref.style.backgroundColor = fhsla(color[0], 100, 5, 1.0);
        } else {
            ref.style.backgroundColor = fhsla(color[0], 100, 95, 1.0);
        }
        ref.style.width = `${tileSize - borderSize}px`;
        ref.style.height = `${tileSize - borderSize}px`;
        ref.style.top = `${-0.5 * tileSize + refHand.offsetHeight / 2}px`;
        ref.style.left = `${(i - 2.5) * tileSize + refHand.offsetWidth / 2}px`;

        // if (handTileIndex === i) {
        //     ref.classList.add('selected');
        //     // dragElement(ref, i);
        // }

        ref.onclick = ((k) => function () {
            const oldRef = document.getElementById('hand-tile-' + handTileIndex);
            if (oldRef !== null) {
                oldRef.classList.remove('selected');

                oldRef.firstChild.style.fill = fhsla(...colorMap[handTiles[handTileIndex].color], 0.6);

            }

            handTileIndex = k;
            const newRef = document.getElementById('hand-tile-' + k);
            newRef.classList.add('selected');
            newRef.firstChild.style.fill = fhsla(...color, 1.0);
            // renderHandTiles();
        })(i);



        ref.appendChild(svgShapes[tile.shape](fhsla(...color, 0.6)));

        refHand.appendChild(ref);
        i++;
    }
}

const borderSize = 5;
let handTileIndex = undefined;
let totalScore = 0;
let score = 0;
const tileBag = newTileBag();
const handTiles = [];
const placedTiles = [];
const scoreList = [];

{
    const ref = document.getElementById('next');
    ref.onclick = () => {
        if (ref.classList.contains('disable')) return;
        console.log('scoreList', scoreList);
        ref.classList.add('disable');
        document.getElementById('undo').classList.add('disable');

        (async () => {
            // const tile of scoreList
            for (let i = 0; i < scoreList.length; ++i) {
                const tile = scoreList[i];
                if (!Number.isInteger(tile)) {
                    const id = `live-tile-${tile.x}-${tile.y}`;
                    const ref = document.getElementById(id);
                    ref.classList.add('score');
                    setTimeout(() => {
                        ref.classList.remove('score');
                    }, 250);
                    totalScore++;
                    document.getElementById('score').innerText = totalScore;
                } else if (tile === 6) {
                    const j = i + 1;
                    for (i = j; i < j + 6; ++i) {
                        const tile = scoreList[i];
                        const id = `live-tile-${tile.x}-${tile.y}`;
                        const ref = document.getElementById(id);
                        ref.classList.add('qwirkle');
                        setTimeout(() => {
                            ref.classList.remove('qwirkle');
                        }, 250);
                    }
                    totalScore += 12;
                    document.getElementById('score').innerText = totalScore;
                }
                await delay(300);
            }

            document.getElementById('last-score').innerText = '';

            for (let i = 0; i < 6; i++) {
                if (handTiles[i] === undefined) {
                    handTiles[i] = pickTileFromBag();
                }
            }
            while (placedTiles.length) { placedTiles.pop(); };
            renderHandTiles();
            renderBoard();
        })();
    }
}

{
    const ref = document.getElementById('undo');
    ref.onclick = () => {
        if (ref.classList.contains('disable')) return;
        for (let i = 0; i < 6; i++) {
            if (handTiles[i] === undefined) {
                handTiles[i] = tiles.live.at(-1);
                break;
            }
        }
        if (placedTiles.length === 1) {
            ref.classList.add('disable');
            document.getElementById('next').classList.add('disable');
        }
        tiles.live.pop();
        placedTiles.pop();
        renderHandTiles();
        renderBoard();
    }
}


(async () => {
    for (const tile of tileAdds) {
        addLiveTile(...tile);

        renderBoard();
        // await delay(500);
    }
})();

// console.log(tiles.live);
// console.log(tiles.next);

handTiles.push({ shape: 'square', color: 'red' });
handTiles.push({ shape: 'square', color: 'orange' });
handTiles.push({ shape: 'square', color: 'yellow' });
handTiles.push({ shape: 'square', color: 'green' });
handTiles.push({ shape: 'square', color: 'blue' });
handTiles.push({ shape: 'square', color: 'purple' });

// for (let i = 0; i < 3; i++) {
//     handTiles.push(pickTileFromBag());
// }


renderHandTiles();

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    renderBoard();
    renderHandTiles();
});
