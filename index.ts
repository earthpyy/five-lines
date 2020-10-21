
const TILE_SIZE = 30;
const FPS = 30;
const SLEEP = 1000 / FPS;

enum Tile {
  AIR,
  FLUX,
  UNBREAKABLE,
  PLAYER,
  STONE,
  BOX,
  KEY1, LOCK1,
  KEY2, LOCK2
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

const TILE_COLOR = {
  [Tile.AIR]: '#fff',
  [Tile.FLUX]: '#ccffcc',
  [Tile.UNBREAKABLE]: '#999',
  [Tile.PLAYER]: '#ff0000',
  [Tile.STONE]: '#0000cc',
  [Tile.BOX]: '#8b4513',
  [Tile.KEY1]: '#ffcc00',
  [Tile.LOCK1]: '#ffcc00',
  [Tile.KEY2]: '#00ccff',
  [Tile.LOCK2]: '#00ccff',
}

const FALLABLE: Tile[] = [
  Tile.BOX,
  Tile.STONE,
]

let playerx = 1;
let playery = 1;
let map: Tile[][] = [
  [2, 2, 2, 2, 2, 2, 2, 2],
  [2, 3, 0, 1, 1, 2, 0, 2],
  [2, 4, 2, 5, 1, 2, 0, 2],
  [2, 6, 4, 1, 1, 2, 0, 2],
  [2, 4, 1, 1, 1, 7, 0, 2],
  [2, 2, 2, 2, 2, 2, 2, 2],
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
  if (map[y][x] === Tile.FLUX
    || map[y][x] === Tile.AIR) {
    moveToTile(x, y);
  } else if (map[y][x] === Tile.KEY1) {
    remove(Tile.LOCK1);
    moveToTile(x, y);
  } else if (map[y][x] === Tile.KEY2) {
    remove(Tile.LOCK2);
    moveToTile(x, y);
  }
}

function moveHorizontal(dx: number) {
  move(playerx + dx, playery);

  if ((map[playery][playerx + dx] === Tile.STONE
    || map[playery][playerx + dx] === Tile.BOX)
    && map[playery][playerx + dx + dx] === Tile.AIR
    && map[playery + 1][playerx + dx] !== Tile.AIR) {
    map[playery][playerx + dx + dx] = map[playery][playerx + dx];
    moveToTile(playerx + dx, playery);
  }
}

function moveVertical(dy: number) {
  move(playerx, playery + dy);
}

function update() {
  while (inputs.length > 0) {
    let current = inputs.pop();
    if (current === Input.LEFT)
      moveHorizontal(-1);
    else if (current === Input.RIGHT)
      moveHorizontal(1);
    else if (current === Input.UP)
      moveVertical(-1);
    else if (current === Input.DOWN)
      moveVertical(1);
  }

  // check for fallable
  for (let y = map.length - 1; y >= 0; y--) {
    for (let x = 0; x < map[y].length; x++) {
      if (FALLABLE.indexOf(map[y][x]) !== -1 && map[y + 1][x] === Tile.AIR) {
        map[y + 1][x] = map[y][x];
        map[y][x] = Tile.AIR;
      }
    }
  }
}

function draw() {
  let canvas = document.getElementById('GameCanvas') as HTMLCanvasElement;
  let g = canvas.getContext('2d');

  g.clearRect(0, 0, canvas.width, canvas.height);

  // Draw map
  map.forEach((col, y) => {
    col.forEach((row, x) => {
      const color = TILE_COLOR[row];
      g.fillStyle = color;
      g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    });
  });
}

function gameLoop() {
  let before = Date.now();
  update();
  draw();
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
