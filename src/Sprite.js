import * as EMTI from './lib/emti.js';

const TEXTURE_WIDTH = 8;
const TEXTURE_HEIGHT = 8;

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
	}

}
