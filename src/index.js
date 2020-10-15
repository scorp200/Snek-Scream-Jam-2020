import * as EMTI from './lib/emti.js';
import { scene, camera, renderer } from './setup.js';
import { Sprite } from './Sprite.js';

const sprSnakeHead = new Sprite(0, 0, 8, 8);
scene.add(sprSnakeHead);

renderer.setAnimationLoop(() => {
	camera.update();
	sprSnakeHead.position.x += 0.1;
	renderer.render(scene, camera);
});
