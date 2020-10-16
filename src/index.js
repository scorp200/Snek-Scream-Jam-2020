import * as EMTI from './lib/emti.js';
import { scene, camera, renderer } from './setup.js';
import { Sprite } from './Sprite.js';

const map = [
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	[1,0,0,0,1,1,0,1,1,0,1,0,1,1,1],
	[1,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
	[1,0,0,0,1,1,0,1,0,1,1,1,0,1,1],
	[1,1,1,1,1,0,0,1,1,0,0,0,1,1,1],
	[1,0,0,0,1,1,0,1,1,1,1,1,1,1,1],
	[1,0,1,0,0,0,0,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
].reverse();

function clamp(v, a, b) {
	return Math.max(Math.min(v, b), a);
}

function mapGet(x, y) {
	return map[clamp(y, 0, 7)][clamp(x, 0, 14)];
}

const tileFloor = new Sprite(0, 8, 8, 8);
const tileTop = new Sprite(8, 8, 8, 8);
const tileWall = new Sprite(16, 8, 8, 8);

const sprSnakeHead = new Sprite(0, 0, 8, 8);
const sprSnakeBody = new Sprite(8, 0, 8, 8);
const sprSnakeTurn = new Sprite(16, 0, 8, 8);
const sprSnakeTail = new Sprite(24, 0, 8, 8);

for (let y = 0; y < 8; y++)
for (let x = 0; x < 15; x++) {
	switch (mapGet(x, y)) {
		case 0:
			scene.add(tileFloor.instantiate(x * 8, y * 8));
			break;
		case 1:
			mapGet(x, y-1)
				? scene.add(tileTop.instantiate(x * 8, y * 8))
				: scene.add(tileWall.instantiate(x * 8, y * 8));
			break;
	}
}

sprSnakeHead.position.set(16, 8*5, 1);
scene.add(sprSnakeHead);
sprSnakeHead.changeTo(sprSnakeTail);

renderer.setAnimationLoop(() => {
	camera.update();
	sprSnakeHead.position.x += 0.1;
	renderer.render(scene, camera);
});
