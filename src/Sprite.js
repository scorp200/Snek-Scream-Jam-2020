import * as EMTI from './lib/emti.js';

const template = new EMTI.PlaneGeometry(8, 8);
const texture = new EMTI.Texture("img/spritesheet.png", { noMipmaps: true });
const material = new EMTI.TextureMaterial(texture);

export class Sprite extends EMTI.Mesh {

	constructor(x, y) {
		const plane = template.clone().shiftCoords(x, y);
		super(plane, material);
	}

}
