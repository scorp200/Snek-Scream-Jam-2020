import * as EMTI from './lib/emti.js';

const WIDTH = 240;
const HEIGHT = 135;

const scene = new EMTI.Scene();
const camera = new EMTI.OrthographicCamera(-WIDTH/2, -HEIGHT/2, WIDTH/2, HEIGHT/2, -50, 50);
const renderer = new EMTI.WebGLRenderer({ width: WIDTH, height: HEIGHT });

const box = new EMTI.PlaneGeometry(8, 8);//.center();
const texture = new EMTI.Texture("img/spritesheet.png", { noMipmaps: true });
const material = new EMTI.TextureMaterial(texture);
const mesh = new EMTI.Mesh(box, material);
scene.add(mesh);

renderer.setAnimationLoop(() => {
	//camera.update();
	mesh.position.x += 0.1;
	renderer.render(scene, camera);
});
