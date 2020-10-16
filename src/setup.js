import * as EMTI from './lib/emti.js';

export const WIDTH = 120;
export const HEIGHT = 64;

export const scene = new EMTI.Scene();
export const camera = new EMTI.OrthographicCamera(0, 0, WIDTH, HEIGHT, -50, 50);
export const renderer = new EMTI.WebGLRenderer({ width: WIDTH, height: HEIGHT });
