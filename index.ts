
const TILE_SIZE = 30;
const FPS = 30;
const SLEEP = 1000 / FPS;

enum Tile {
  AIR,
  FLUX,
  UNBREAK,
  PLAYER,
  STONE,
  BOX,
  KEY,
  LOCK,
}

enum Input {
  LEFT = 'ArrowLeft',
  DOWN = 'ArrowDown',
  RIGHT = 'ArrowRight',
  UP = 'ArrowUp',

  A = 'a',
  S = 's',
  D = 'd',
  W = 'w',
}

const INPUT_FUNC = {
  [Input.LEFT]: () => moveHorizontal(-1),
  [Input.DOWN]: () => moveVertical(1),
  [Input.RIGHT]: () => moveHorizontal(1),
  [Input.UP]: () => moveVertical(-1),
};

const TILE_COLOR = {
  [Tile.AIR]: '#fff',
  [Tile.FLUX]: '#ccffcc',
  [Tile.UNBREAK]: '#999',
  [Tile.PLAYER]: '#ff0000',
  [Tile.STONE]: '#0000cc',
  [Tile.BOX]: '#8b4513',
  [Tile.KEY]: '#ffcc00',
  [Tile.LOCK]: '#ffcc00',
};

const FALLABLE: Tile[] = [
  Tile.BOX,
  Tile.STONE,
];

const WALKABLE: Tile[] = [
  Tile.FLUX,
  Tile.AIR,
];

let playerx = 1;
let playery = 1;
let map: Tile[][] = [
  [Tile.UNBREAK, Tile.UNBREAK, Tile.UNBREAK, Tile.UNBREAK, Tile.UNBREAK, Tile.UNBREAK, Tile.UNBREAK, Tile.UNBREAK],
  [Tile.UNBREAK, Tile.PLAYER, Tile.AIR, Tile.FLUX, Tile.FLUX, Tile.UNBREAK, Tile.AIR, Tile.UNBREAK],
  [Tile.UNBREAK, Tile.STONE, Tile.UNBREAK, Tile.BOX, Tile.FLUX, Tile.UNBREAK, Tile.AIR, Tile.UNBREAK],
  [Tile.UNBREAK, Tile.KEY, Tile.STONE, Tile.FLUX, Tile.FLUX, Tile.UNBREAK, Tile.AIR, Tile.UNBREAK],
  [Tile.UNBREAK, Tile.STONE, Tile.FLUX, Tile.FLUX, Tile.FLUX, Tile.LOCK, Tile.AIR, Tile.UNBREAK],
  [Tile.UNBREAK, Tile.UNBREAK, Tile.UNBREAK, Tile.UNBREAK, Tile.UNBREAK, Tile.UNBREAK, Tile.UNBREAK, Tile.UNBREAK],
];

let inputs: Input[] = [];

function remove(tile: Tile) {
  map.forEach(column => {
    column.forEach((row, index) => {
      if (row === tile) {
        column[index] = Tile.AIR;
      }
    });
  });
}

function moveToTile(newx: number, newy: number) {
  map[playery][playerx] = Tile.AIR;
  map[newy][newx] = Tile.PLAYER;
  playerx = newx;
  playery = newy;
}

function move(x: number, y: number) {
  if (WALKABLE.indexOf(map[y][x]) !== -1) {
    moveToTile(x, y);
  } else if (map[y][x] === Tile.KEY) {
    remove(Tile.LOCK);
    moveToTile(x, y);
  }
}

function moveHorizontal(dx: number) {
  move(playerx + dx, playery);

  if (FALLABLE.indexOf(map[playery][playerx + dx]) !== -1
    && map[playery][playerx + dx + dx] === Tile.AIR
    && map[playery + 1][playerx + dx] !== Tile.AIR) {
    map[playery][playerx + dx + dx] = map[playery][playerx + dx];
    moveToTile(playerx + dx, playery);
  }
}

function moveVertical(dy: number) {
  move(playerx, playery + dy);
}

function checkFallable() {
  for (let y = map.length - 1; y >= 0; y--) {
    for (let x = 0; x < map[y].length; x++) {
      if (FALLABLE.indexOf(map[y][x]) !== -1 && map[y + 1][x] === Tile.AIR) {
        map[y + 1][x] = map[y][x];
        map[y][x] = Tile.AIR;
      }
    }
  }
}

function update() {
  while (inputs.length > 0) {
    const current = inputs.pop();
    const func = INPUT_FUNC[current];
    func();
  }
}

function drawMap(g: CanvasRenderingContext2D) {
  map.forEach((col, y) => {
    col.forEach((row, x) => {
      g.fillStyle = TILE_COLOR[row];
      g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    });
  });
}

function clearMap(canvas: HTMLCanvasElement, g: CanvasRenderingContext2D) {
  g.clearRect(0, 0, canvas.width, canvas.height);
}

function draw() {
  let canvas = document.getElementById('GameCanvas') as HTMLCanvasElement;
  let g = canvas.getContext('2d');

  clearMap(canvas, g);
  drawMap(g);
}

function updateGame() {
  update();
  checkFallable();
  draw();
}

function gameLoop() {
  let before = Date.now();
  updateGame();
  let after = Date.now();
  setTimeout(gameLoop, SLEEP - (after - before));
}

window.onload = () => {
  gameLoop();
}

window.addEventListener('keydown', e => {
  if (e.key === Input.LEFT || e.key === Input.A) inputs.push(Input.LEFT);
  else if (e.key === Input.UP || e.key === Input.W) inputs.push(Input.UP);
  else if (e.key === Input.RIGHT || e.key === Input.D) inputs.push(Input.RIGHT);
  else if (e.key === Input.DOWN || e.key === Input.S) inputs.push(Input.DOWN);
});
