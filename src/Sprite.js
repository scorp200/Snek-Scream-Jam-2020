import * as EMTI from './lib/emti.js';

const TEXTURE_WIDTH = 256;
const TEXTURE_HEIGHT = 256;

const template = new EMTI.PlaneGeometry(1, 1);
const texture = new EMTI.Texture("img/spritesheet.png", { noMipmaps: true });
const material = new EMTI.TextureMaterial(texture);

export class Sprite extends EMTI.Mesh {

	constructor(x, y, width, height) {
		const plane = template.
			clone()
			.scale(width, height, 1)
			.scaleCoords(width / TEXTURE_WIDTH, height / TEXTURE_HEIGHT)
			.shiftCoords(x / TEXTURE_WIDTH, y / TEXTURE_HEIGHT);
		super(plane, material);
		this.args = arguments;
	}

	instantiate(x, y) {
		const mesh = new Sprite(...this.args);
		mesh.position.set(x, y, 0);
		return mesh;
	}

	changeTo(sprite) {
		this.geometry = sprite.geometry;
	}

}
