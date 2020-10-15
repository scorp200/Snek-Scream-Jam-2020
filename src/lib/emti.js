/**
 *
 */
class Vector3 {

	/**
	 * @param {!number=} x
	 * @param {!number=} y
	 * @param {!number=} z
	 */
	constructor(x=0, y=0, z=0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	/**
	 * Clones the Vector3 and returns the new one.
	 * @return {!Vector3}
	 */
	clone() {
		return new Vector3(this.x, this.y, this.z);
	}

	/**
	 * @param {!Vector3} v
	 * @return {!Vector3}
	 */
	copy(v) {
		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
		return this;
	}

	/**
	 * @param {!Vector3} v
	 * @return {!Vector3}
	 */
	add(v) {
		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
		return this;
	}

	/**
	 * @param {!Vector3} v
	 * @return {!Vector3}
	 */
	subtract(v) {
		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
		return this;
	}

	/**
	 * @param {!Vector3} v
	 * @return {!Vector3}
	 */
	multiply(v) {
		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;
		return this;
	}

	/**
	 * @return {!Vector3}
	 */
	normalize() {
		const len = this.length();
		this.x *= len;
		this.y *= len;
		this.z *= len;
		return this;
	}

	/**
	 * @return {!number}
	 */
	dot(b) {
		 return this.x * b.x + this.y * b.y + this.z * b.z;
	}

	/**
	 *
	 */
	cross(b) {
		const {x, y, z} = this;
		const {x: bx, y: by, z: bz} = b;
		this.x = y * bz - z * by;
		this.y = z * bx - x * bz;
		this.z = x * by - y * bx;
		return this;
	}

	/**
	 *
	 */
	length() {
		const {x, y, z} = this;
		let len = x * x + y * y + z * z;
		if (len > 0) {
			len = 1 / Math.sqrt(len);
		}
		return len;
	}

	/**
	 *
	 */
	set(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	/**
	 * @return {!Array<!number>}
	 */
	values() {
		return [this.x, this.y, this.z];
	}

}

/**
 *
 */
class Matrix4 {

	/**
	 * Takes an optional 16 arguments to initialize the matrix with.
	 * If 16 arguments are not comitted then an identity matrix is returned.
	 * @param {?Array=} matrix
	 */
	constructor(matrix=null) {
		this.matrix = new Float32Array(
			(matrix)
				? matrix
				: [ 1, 0, 0, 0,
					0, 1, 0, 0,
					0, 0, 1, 0,
					0, 0, 0, 1 ]
		);
		this.states = [];
	}

	/**
	 * @return {!Matrix4}
	 */
	save() {
		this.states.push(this.clone());
		return this;
	}

	/**
	 * @return {!Matrix4}
	 */
	restore() {
		return this.copy(this.states.pop());
	}

	/**
	 * @return {!Matrix4}
	 */
	clone() {
		return new Matrix4(...this.matrix);
	}

	/**
	 * @param {!Matrix4} matrix
	 */
	copy(matrix) {
		this.matrix.set(matrix.matrix);
		return this;
	}

	/**
	 * Sets the matrix to the identity matrix.
	 * @return {!Matrix4}
	 */
	identity() {
		var m = this.matrix;
		m[0] = m[5] = m[10] = m[15] = 1;
		m[1] = m[2] = m[3] = m[4] = m[6] = m[7] = m[8] = m[9] = m[11] = m[12] = m[13] = m[14] = 0;
		return this;
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @return {!Matrix4}
	 */
	scale(x, y, z) {
		scalingMatrix[0] = x;
		scalingMatrix[5] = y;
		scalingMatrix[10] = z;
		return this.multiply(scaling);
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @return {!Matrix4}
	 */
	translate(x, y, z) {
		translationMatrix[3] = x;
		translationMatrix[7] = y;
		translationMatrix[11] = z;
		return this.multiply(translation);
	}

	/**
	 * @param {number} a Radians.
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @return {!Matrix4}
	 */
	rotate(a, x, y, z) {

		if (!a || (!x && !y && !z)) {
    		return this;
		}

		// Normalize.
		var d = Math.sqrt(x*x + y*y + z*z);
		if (x !== 0) x /= d;
		if (y !== 0) y /= d;
		if (z !== 0) z /= d;

		// Skew and scale.
		var c = Math.cos(a);
		var s = Math.sin(a);
		var t = 1 - c;

		rotationMatrix[0] = x * x * t + c;
		rotationMatrix[1] = x * y * t - z * s;
		rotationMatrix[2] = x * z * t + y * s;

		rotationMatrix[4] = y * x * t + z * s;
		rotationMatrix[5] = y * y * t + c;
		rotationMatrix[6] = y * z * t - x * s;

		rotationMatrix[8] = z * x * t - y * s;
		rotationMatrix[9] = z * y * t + x * s;
		rotationMatrix[10] = z * z * t + c;

		return this.multiply(rotation);

	}

	/**
	 *
	 */
	perspective(fov, aspect, near, far) {
		const y = Math.tan(fov * Math.PI / 360) * near;
		const x = y * aspect;
		this.frustum(-x, x, -y, y, near, far);
	};

	/**
	 * left, right, bottom, top, near, far
	 */
	frustum(l, r, b, t, n, f) {

		let mat = new Matrix4();
		var m = mat.matrix;

		m[0] = 2 * n / (r - l);
		m[1] = 0;
		m[2] = (r + l) / (r - l);
		m[3] = 0;

		m[4] = 0;
		m[5] = 2 * n / (t - b);
		m[6] = (t + b) / (t - b);
		m[7] = 0;

		m[8] = 0;
		m[9] = 0;
		m[10] = -(f + n) / (f - n);
		m[11] = -2 * f * n / (f - n);

		m[12] = 0;
		m[13] = 0;
		m[14] = -1;
		m[15] = 0;

		this.multiply(mat);
		return this;

	};

	/**
	 *
	 */
	ortho(l, r, b, t, n, f) {

		const m = this.matrix;

		m[0] = 2 / (r - l);
		m[1] = 0;
		m[2] = 0;
		m[3] = -(r + l) / (r - l);

		m[4] = 0;
		m[5] = 2 / (t - b);
		m[6] = 0;
		m[7] = -(t + b) / (t - b);

		m[8] = 0;
		m[9] = 0;
		m[10] = -2 / (f - n);
		m[11] = -(f + n) / (f - n);

		m[12] = 0;
		m[13] = 0;
		m[14] = 0;
		m[15] = 1;

		return this;
	};

	/**
	 * @param {!number} x
	 * @param {!number} y
	 * @param {!number} z
	 * @param {!number} tx
	 * @param {!number} ty
	 * @param {!number} tz
	 * @param {!number} ux
	 * @param {!number} uy
	 * @param {!number} uz
	 */
	lookAt(x, y, z, tx, ty, tz, ux, uy, uz) {

		const mat = new Matrix4();
		const m = mat.matrix;

		var e = new Vector3(x, y, z);
		var c = new Vector3(tx, ty, tz);
		var u = new Vector3(ux, uy, uz);
		var f = e.clone().subtract(c).normalize();
		var s = u.clone().cross(f).normalize();
		var t = f.clone().cross(s).normalize();

		m[0] = s.x;
		m[1] = s.y;
		m[2] = s.z;
		m[3] = -s.dot(e);

		m[4] = t.x;
		m[5] = t.y;
		m[6] = t.z;
		m[7] = -t.dot(e);

		m[8] = f.x;
		m[9] = f.y;
		m[10] = f.z;
		m[11] = -f.dot(e);

		m[12] = 0;
		m[13] = 0;
		m[14] = 0;
		m[15] = 1;

		return this.multiply(mat);
	};

	/**
	 * @param {!Matrix4} mat
	 * @return {!Matrix4}
	 */
	multiply(mat) {
		var a = this.matrix, b = mat.matrix, c = window["_ufmat"];

		c[0] = a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12];
		c[1] = a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13];
		c[2] = a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14];
		c[3] = a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15];

		c[4] = a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12];
		c[5] = a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13];
		c[6] = a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14];
		c[7] = a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15];

		c[8] = a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12];
		c[9] = a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13];
		c[10] = a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14];
		c[11] = a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15];

		c[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12];
		c[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13];
		c[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
		c[15] = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];

		[window["_ufmat"], this.matrix] = [this.matrix, window["_ufmat"]];

		return this;
	}

	/**
	 *
	 */
	inverse(matrix) {
		var m = matrix.matrix, r = this.matrix;

		r[0] = m[5]*m[10]*m[15] - m[5]*m[14]*m[11] - m[6]*m[9]*m[15] + m[6]*m[13]*m[11] + m[7]*m[9]*m[14] - m[7]*m[13]*m[10];
		r[1] = -m[1]*m[10]*m[15] + m[1]*m[14]*m[11] + m[2]*m[9]*m[15] - m[2]*m[13]*m[11] - m[3]*m[9]*m[14] + m[3]*m[13]*m[10];
		r[2] = m[1]*m[6]*m[15] - m[1]*m[14]*m[7] - m[2]*m[5]*m[15] + m[2]*m[13]*m[7] + m[3]*m[5]*m[14] - m[3]*m[13]*m[6];
		r[3] = -m[1]*m[6]*m[11] + m[1]*m[10]*m[7] + m[2]*m[5]*m[11] - m[2]*m[9]*m[7] - m[3]*m[5]*m[10] + m[3]*m[9]*m[6];

		r[4] = -m[4]*m[10]*m[15] + m[4]*m[14]*m[11] + m[6]*m[8]*m[15] - m[6]*m[12]*m[11] - m[7]*m[8]*m[14] + m[7]*m[12]*m[10];
		r[5] = m[0]*m[10]*m[15] - m[0]*m[14]*m[11] - m[2]*m[8]*m[15] + m[2]*m[12]*m[11] + m[3]*m[8]*m[14] - m[3]*m[12]*m[10];
		r[6] = -m[0]*m[6]*m[15] + m[0]*m[14]*m[7] + m[2]*m[4]*m[15] - m[2]*m[12]*m[7] - m[3]*m[4]*m[14] + m[3]*m[12]*m[6];
		r[7] = m[0]*m[6]*m[11] - m[0]*m[10]*m[7] - m[2]*m[4]*m[11] + m[2]*m[8]*m[7] + m[3]*m[4]*m[10] - m[3]*m[8]*m[6];

		r[8] = m[4]*m[9]*m[15] - m[4]*m[13]*m[11] - m[5]*m[8]*m[15] + m[5]*m[12]*m[11] + m[7]*m[8]*m[13] - m[7]*m[12]*m[9];
		r[9] = -m[0]*m[9]*m[15] + m[0]*m[13]*m[11] + m[1]*m[8]*m[15] - m[1]*m[12]*m[11] - m[3]*m[8]*m[13] + m[3]*m[12]*m[9];
		r[10] = m[0]*m[5]*m[15] - m[0]*m[13]*m[7] - m[1]*m[4]*m[15] + m[1]*m[12]*m[7] + m[3]*m[4]*m[13] - m[3]*m[12]*m[5];
		r[11] = -m[0]*m[5]*m[11] + m[0]*m[9]*m[7] + m[1]*m[4]*m[11] - m[1]*m[8]*m[7] - m[3]*m[4]*m[9] + m[3]*m[8]*m[5];

		r[12] = -m[4]*m[9]*m[14] + m[4]*m[13]*m[10] + m[5]*m[8]*m[14] - m[5]*m[12]*m[10] - m[6]*m[8]*m[13] + m[6]*m[12]*m[9];
		r[13] = m[0]*m[9]*m[14] - m[0]*m[13]*m[10] - m[1]*m[8]*m[14] + m[1]*m[12]*m[10] + m[2]*m[8]*m[13] - m[2]*m[12]*m[9];
		r[14] = -m[0]*m[5]*m[14] + m[0]*m[13]*m[6] + m[1]*m[4]*m[14] - m[1]*m[12]*m[6] - m[2]*m[4]*m[13] + m[2]*m[12]*m[5];
		r[15] = m[0]*m[5]*m[10] - m[0]*m[9]*m[6] - m[1]*m[4]*m[10] + m[1]*m[8]*m[6] + m[2]*m[4]*m[9] - m[2]*m[8]*m[5];

		var det = m[0]*r[0] + m[1]*r[4] + m[2]*r[8] + m[3]*r[12];
		for (var i = 0; i < 16; i++) r[i] /= det;
		return this;
	};

	/**
	 * @param {!CanvasRenderingContext2D} ctx
	 * @return {!Matrix4}
	 */
	setCanvasTransform(ctx) {
		var m = this.matrix;
		ctx.setTransform(m[0], m[4], m[1], m[5], m[3], m[7]);
		return this;
	}

	/**
	 *
	 */
	transpose() {
		var result = new Matrix4();
		var m = this.matrix, r = result.matrix;
		r[0] = m[0]; r[1] = m[4]; r[2] = m[8]; r[3] = m[12];
		r[4] = m[1]; r[5] = m[5]; r[6] = m[9]; r[7] = m[13];
		r[8] = m[2]; r[9] = m[6]; r[10] = m[10]; r[11] = m[14];
		r[12] = m[3]; r[13] = m[7]; r[14] = m[11]; r[15] = m[15];
		return result;
	};

	/**
	 * @return {!Array<number>}
	 */
	transformPoint(point) {

		var m = this.matrix;

		var x = point[0], y = point[1], z = point[2], w = point[3];

		var c1r1 = m[ 0], c2r1 = m[ 1], c3r1 = m[ 2], c4r1 = m[ 3],
			c1r2 = m[ 4], c2r2 = m[ 5], c3r2 = m[ 6], c4r2 = m[ 7],
			c1r3 = m[ 8], c2r3 = m[ 9], c3r3 = m[10], c4r3 = m[11],
			c1r4 = m[12], c2r4 = m[13], c3r4 = m[14], c4r4 = m[15];

		return [
			x*c1r1 + y*c1r2 + z*c1r3 + w*c1r4,
			x*c2r1 + y*c2r2 + z*c2r3 + w*c2r4,
			x*c3r1 + y*c3r2 + z*c3r3 + w*c3r4,
			x*c4r1 + y*c4r2 + z*c4r3 + w*c4r4
		];
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @param {number} w
	 * @return {!Array<number>}
	 */
	transposeTransformPoint(x, y, z, w) {
		const m = this.matrix;
		return [
			x*m[ 0] + y*m[ 1] + z*m[ 2] + w*m[ 3],
			x*m[ 4] + y*m[ 5] + z*m[ 6] + w*m[ 7],
			x*m[ 8] + y*m[ 9] + z*m[10] + w*m[11],
			x*m[12] + y*m[13] + z*m[14] + w*m[15]
		];
	}

}

// Reusable matrices.
var translation = new Matrix4(),
	rotation = new Matrix4(),
	scaling = new Matrix4(),
	translationMatrix = translation.matrix,
	rotationMatrix = rotation.matrix,
	scalingMatrix = scaling.matrix;

window["_ufmat"] = (new Matrix4()).matrix;

/**
 *
 */
class Camera {

	/**
	 *
	 */
	constructor() {
		/** @const */ this.isCamera = true;
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.xTo = 0;
		this.yTo = 0;
		this.zTo = 0;
		this.near = 1;
		this.far = 1000;
		this.fov = 70;
		this.aspect = 1;
		this.projectionMatrix = new Matrix4();
		this.resetState = new Matrix4();
	}

	/**
	 *
	 */
	move(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
		return this;
	}

	/**
	 *
	 */
	lookAt(x, y, z) {
		this.xTo = x;
		this.yTo = y;
		this.zTo = z;
		return this;
	}

	/**
	 *
	 */
	update() {
		this.projectionMatrix.identity();
		this.projectionMatrix.perspective(this.fov, this.aspect, this.near, this.far);
		this.projectionMatrix.lookAt(this.x, this.y, this.z, this.xTo, this.yTo, this.zTo, 0, 0, 1);
	}

}

/**
 *
 */
class OrthographicCamera extends Camera {

	/**
	 *
	 */
	constructor(x, y, width, height, near, far) {
		super();
		this.projectionMatrix.ortho(x, width, y, height, near, far);
	}

}

/**
 *
 */
class PerspectiveCamera extends Camera {

	/**
	 * @param {!number} aspect Aspect ratio.
	 * @param {!number} fov Field of view.
	 * @param {!number} near Distance to the near plane.
	 * @param {!number} far Distance to the far plane.
	 */
	constructor(aspect, fov, near, far) {
		super();
		this.aspect = aspect;
		this.fov = fov;
		this.near = near;
		this.far = far;
		this.projectionMatrix.perspective(fov, aspect, near, far);
	}

}

/**
 *
 */
class Color {

	/**
	 * @param {!number|number=} r
	 * @param {!number=} g
	 * @param {!number=} b
	 */
	constructor(r, g, b) {

		if (r !== undefined && g === undefined) {
			this.b = r & 0xFF;
			this.g = (r >> 8) & 0xFF;
			this.r = (r >> 16) & 0xFF;
		} else {
			this.r = r || 0;
			this.g = g || 0;
			this.b = b || 0;
		}

		this.floats = new Float32Array([this.r/255, this.g/255, this.b/255]);

	}

	/**
	 * @param {!number=} r
	 * @param {!number=} g
	 * @param {!number=} b
	 */
	set(r, g, b) {
		this.r = r === undefined ? this.r : r;
		this.g = g === undefined ? this.g : g;
		this.b = b === undefined ? this.b : b;
		this.floats.set([this.r/255, this.g/255, this.b/255]);
		return this;
	}

	/**
	 * @param {!Color} c
	 * @return {!Color} Returns self.
	 */
	max(c) {
		this.r = Math.max(this.r, c.r);
		this.g = Math.max(this.g, c.g);
		this.b = Math.max(this.b, c.b);
		this.floats.set([this.r/255, this.g/255, this.b/255]);
		return this;
	}

}

/**
 *
 */
class Light {

	/**
	 * @param {!Color|number} c
	 */
	constructor(c) {
		/** @const */ this.isLight = true;
		this.color = c instanceof Color ? c : new Color(c);
	}

}

/**
 *
 */
class AmbientLight extends Light {

	/**
	 * @param {!Color|number} c
	 */
	constructor(c) {
		super(c instanceof Color ? c : new Color(c));
		/** @const */ this.isAmbientLight = true;
	}

}

/**
 *
 */
class DirectionalLight extends Light {

	/**
	 * @param {!Color|number} c
	 * @param {!Vector3} v
	 */
	constructor(c, v) {
		super(c instanceof Color ? c : new Color(c));
		/** @const */ this.isDirectionalLight = true;
		this.vector = v;
	}

}

/**
 *
 */
class PointLight extends Light {

	/**
	 * @param {!Color|number} c
	 * @param {!Vector3} position
	 */
	constructor(c, position, attenuation) {
		super(c instanceof Color ? c : new Color(c));
		/** @const */ this.isPointLight = true;
		this.position = position;
		this.attenuation = attenuation;
	}

}

/**
 *
 */
class Grid {

	/**
	 * @param {!number} w
	 * @param {!number} h
	 * @param {!typeof Uint8Array|!typeof Float32Array} t
	 */
	constructor(w, h, t) {
		this.width = w;
		this.height = h;
		this.type = t || Float32Array;
		this.size = w * h;
		this.data = new this.type(this.size);
	}

	/**
	 * @param {!number} x
	 * @param {!number} y
	 * @param {!number} value
	 * @return {void}
	 */
	set(x, y, value) {
		x = (this.width + x) % this.width;
		y = (this.height + y) % this.height;
		const index = y * this.width + x;
		this.data[index] = value;
	}

	/**
	 * @param {!number} x
	 * @param {!number} y
	 * @return {!number}
	 */
	get(x, y) {
		x = (this.width + x) % this.width;
		y = (this.height + y) % this.height;
		const index = y * this.width + x;
		return this.data[index];
	}

}

/**
 *
 */
class Scene {

	/**
	 *
	 */
	constructor() {
		this.meshes = [];
		this.shaders = [];
		this.ambientLightColor = new Color(0x000000);
		this.ambientLights = [];
		this.directionalLights = [];
		this.pointLights = [];
	}

	/**
	 * @param {!Mesh|AmbientLight|DirectionalLight|PointLight|Array} mesh
	 * @return {void}
	 */
	add(mesh) {

		if (Array.isArray(mesh)) {
			mesh.forEach(i => this.add(i));
			return;
		}

		switch (true) {

			case mesh.isMesh:
				this.meshes.push(mesh);
				// TODO: Track how many items need a particular shader.
				if (this.shaders.indexOf(mesh.material.shader) === -1) {
					this.shaders.push(mesh.material.shader);
				}
				break;

			case mesh.isAmbientLight: this.ambientLights.push(mesh); break;
			case mesh.isDirectionalLight: this.directionalLights.push(mesh); break;
			case mesh.isPointLight: this.pointLights.push(mesh); break;
			default: console.warn("Cannot add item to Scene: ", mesh); break;

		}

	}

	/**
	 * @param {Mesh} mesh
	 */
	remove(mesh) {
		const i = this.meshes.indexOf(mesh);
		if (i >= 0) {
			this.meshes.splice(i, 1);
		}
	}

}

/**
 *
 */
class Shader {

	/**
	 * @param {!WebGLRenderingContext} gl
	 * @param {!Object} source
	 */
	constructor(gl, source) {
		this.source = source;
		this.vertex = this.compile(gl, gl.VERTEX_SHADER, source.vertex);
		this.fragment = this.compile(gl, gl.FRAGMENT_SHADER, source.fragment);
		this.compiled = null;
		const prog = gl.createProgram();
		this.program = prog;
		gl.attachShader(prog, this.vertex);
		gl.attachShader(prog, this.fragment);
		gl.linkProgram(prog);
		this.status = gl.getProgramParameter(prog, gl.LINK_STATUS);

		this.attributes = {
			position: gl.getAttribLocation(prog, "aVertex"),
			texture: gl.getAttribLocation(prog, "aTextureCoord"),
			normal: gl.getAttribLocation(prog, "aVertexNormal")
		};

		this.uniform = {
			matrix: gl.getUniformLocation(prog, "uMatrix"),
			color: gl.getUniformLocation(prog, "uColor"),
			normalMatrix: gl.getUniformLocation(prog, "uNormalMatrix"),
			modelViewMatrix: gl.getUniformLocation(prog, "uModelViewMatrix"),
			ambientLight: gl.getUniformLocation(prog, "uAmbientLight"),
			directionalLightsSize: gl.getUniformLocation(prog, "uDirectionalLightsSize"),
			directionalLights: gl.getUniformLocation(prog, "uDirectionalLights"),
			pointLightsSize: gl.getUniformLocation(prog, "uPointLightsSize"),
			pointLights: gl.getUniformLocation(prog, "uPointLights")
		};

	}

	/**
	 * @param {!WebGLRenderingContext} gl
	 * @param {!number} type
	 * @param {!string} source
	 * @return {!WebGLShader}
	 */
	compile(gl, type, source) {
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);

		const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		if (!status) {
			throw new TypeError(`couldn't compile shader:\n${gl.getShaderInfoLog(shader)}`);
		}

		return shader;
	}


}

/**
 * Returns wether the given number is a power of 2 or not.
 * @param {!number} x
 * @return {!boolean}
 */
function isPowerOf2(x) {
 	return (x & (x - 1)) === 0;
 }

/**
 * @param {*} value
 * @param {*} defaultValue
 * @return {*}
 */
function allowDefault(value, defaultValue) {
	return (typeof value !== "undefined") ? value : defaultValue;
}

/**
 * @param {...number} args
 * @return {!Array<number>}
 */
function bytesToFloats(args) {
	const output = [];
	const length = arguments.length;
	for (var n = 0; n < length; n += 1) {
		output.push((arguments[n] & 255) / 255);
	}
	return output;
}

// A "default" WebGL context. This is set when the first renderer is created.
// In most cases, there will only ever be one, so this is here.
let renderer = undefined;
let gl = undefined;

/**
 *
 */
class WebGLRenderer {

	/**
	 * @param {!Object} opt
	 */
	constructor(opt) {

		// Different defaults.
		opt = opt || {};
		opt.alpha = allowDefault(opt.alpha, false);
		opt.antialias = allowDefault(opt.antialias, false);
		opt.backfaceCulling = allowDefault(opt.backfaceCulling, true);
		this.msaa = (opt.msaa !== undefined) ? opt.msaa : 1;
		this.imageSmoothing = allowDefault(opt.imageSmoothing, false);
		opt.premultipliedalpha = allowDefault(opt.premultipliedalpha, false);
		this.onResize = opt.onResize;

		//
		this.autoResize = opt.autoResize === true;
		this.width = opt.width || window.innerWidth;
		this.height = opt.height || window.innerHeight;

		// Create canvas for the page and for post-processing.
		this.domElement = document.createElement("canvas");
		document.body.appendChild(this.domElement);
		this.domCtx = this.domElement.getContext("2d", opt);
		this.domCtx.imageSmoothingEnabled = false;

		// Create canvas for normal rendering.
		this.glCanvas = document.createElement("canvas");
		this.gl = this.glCanvas.getContext("webgl2", opt);
		this.gl.enable(this.gl.BLEND);
		if (opt.backfaceCulling) this.gl.enable(this.gl.CULL_FACE);
		this.gl.enable(this.gl.DEPTH_TEST);

		//
		this.setSize(this.width, this.height);

		// Other properties.
		/** @const */ this.isWebGLRenderer = true;
		this.animationFrameRequestId = 0;
		this.dt = 0;
		this.time = 0;
		this.fps = -1;
		this.lastFrameTime = -1;
		this.autoClear = true;
		this.autoClearColor = true;
		this.autoClearDepth = true;
		this.autoClearStencil = true;
		this.shader = null;

		this.boundTexture = null;
		this.boundVertexBuffer = null;

		//
		this.setClearColor(0, 0, 0, 255);
		//this.setViewport(0, 0, this.width, this.height);

		//
		if (!gl) {
			renderer = this;
			gl = this.gl;
		}

	}

	/**
	 * @param {boolean} color
	 * @param {boolean} depth
	 * @param {boolean} stencil
	 * @return {void}
	 */
	clear(color, depth, stencil) {
		if (color) { this.gl.clear(this.gl.COLOR_BUFFER_BIT); }
		if (depth) { this.gl.clear(this.gl.DEPTH_BUFFER_BIT); }
		if (stencil) { this.gl.clear(this.gl.STENCIL_BUFFER_BIT); }
	}

	/**
	 * @param {Scene} scene
	 * @param {Camera} camera
	 * @return {void}
	 */
	render(scene, camera) {

		const gl = this.gl;

		this.boundVertexBuffer = null;

		// Clear the screen.
		if (this.autoClear) {
			this.clear(this.autoClearColor, this.autoClearDepth, this.autoClearStencil);
		}

		// Apply projection matrix to shaders.
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		const cm = camera.projectionMatrix.transpose();
		scene.shaders.forEach(shader => {

			if (!shader.compiled) {
				shader.compiled = new Shader(gl, shader);
			}

			// Calculate ambient light color.
			const ambientLightColor = scene.ambientLightColor;
			ambientLightColor.set(0, 0, 0);
			scene.ambientLights.forEach(l => {
				ambientLightColor.max(l.color);
			});

			// Join directional lights.
			const directionalLights = scene.directionalLights;
			const directionalLightsSize = directionalLights.length;
			const directionalLightsJoined = new Float32Array(directionalLightsSize*6);
			for(let i=0; i<directionalLightsSize; i++) {
				const vector = directionalLights[i].vector.values();
				const color = directionalLights[i].color.floats;
				directionalLightsJoined.set(vector.concat(...color), i*6);
			}

			// Join point lights.
			const pointLights = scene.pointLights;
			const pointLightsSize = pointLights.length;
			const pointLightsJoined = new Float32Array(pointLightsSize*9);
			for(let i=0; i<pointLightsSize; i++) {
				const position = pointLights[i].position.values();
				const color = pointLights[i].color.floats;
				const attenuation = pointLights[i].attenuation.values();
				const arr = [...position, ...color, ...attenuation];
				pointLightsJoined.set(arr, i*9);
			}

			shader.projectionMatrix = cm;
			const uniforms = shader.compiled.uniform;
			gl.useProgram(shader.compiled.program);
			gl.uniformMatrix4fv(uniforms.matrix, false, cm.matrix);
			gl.uniform3fv(uniforms.ambientLight, ambientLightColor.floats);
			gl.uniform1i(uniforms.directionalLightsSize, directionalLightsSize*2);
			gl.uniform1i(uniforms.pointLightsSize, pointLightsSize*3);
			if (directionalLightsSize > 0)
				gl.uniform3fv(uniforms.directionalLights, directionalLightsJoined);

			if (pointLightsSize > 0)
				gl.uniform3fv(uniforms.pointLights, pointLightsJoined);

		});

		// Iterate through all meshes and draw them.
		scene.meshes.forEach(m => {
			m.draw();
		});

		// draw to DOM canvas.
		this.domCtx.drawImage(this.glCanvas, 0, 0, this.width, this.height);

	}

	/**
	 * @param {?Function} callback
	 * @return {void}
	 */
	setAnimationLoop(callback) {

		// Cancel last animation.
		if (this.animationFrameRequestId) {
			cancelAnimationFrame(this.animationFrameRequestId);
			this.animationFrameRequestId = 0;
		}

		// Set new animation, unless null.
		const renderer = this;
		if (callback !== null) {
			let last = performance.now();
			(function func(timestamp) {

				// Calculate FPS.
				renderer.dt = timestamp - last;
				renderer.fps = 1 / (renderer.dt / 1000);
				renderer.time = timestamp;
				last = timestamp;

				// Auto-resizing.
				if (renderer.autoResize
				&&  (renderer.width !== window.innerWidth
				||  renderer.height !== window.innerHeight)) {
					renderer.setSize(window.innerWidth, window.innerHeight);
					renderer.width = window.innerWidth;
					renderer.height = window.innerHeight;
					if (renderer.onResize) {
						renderer.onResize(renderer.width, renderer.height);
					}
				}

				// And do it all over again!
				callback(renderer.dt, renderer.time);
				renderer.animationFrameRequestId = requestAnimationFrame(func);

			})(performance.now());

		}

	}

	/**
	 * @param {number} r
	 * @param {number} g
	 * @param {number} b
	 * @param {number} a
	 * @return {void}
	 */
	setClearColor(r, g, b, a) {
		this.gl.clearColor(...bytesToFloats(r, g, b, a));
	}

	/**
	 * @param {!number} width
	 * @param {!number} height
	 * @return {void}
	 */
	setSize(width, height) {

		this.domElement.width = width;
		this.domElement.height = height;
		this.domCtx.imageSmoothingEnabled = this.imageSmoothing;

		this.glCanvas.width = width * this.msaa;
		this.glCanvas.height = height * this.msaa;
		this.setViewport(0, 0, this.glCanvas.width, this.glCanvas.height);

	}

	/**
	 * @param {!number} x
	 * @param {!number} y
	 * @param {!number} width
	 * @param {!number} height
	 * @return {void}
	 */
	setViewport(x, y, width, height) {
		this.gl.viewport(x, y, width, height);
	}

}

/**
 *
 */
class Material {

	/**
	 * @param {?Shader} shader
	 */
	constructor(shader=null) {
		this.shader = shader;
		this.texture = null;
		this.color = null;
		this.points = false;
		this.lines = false;
		this.wireframe = false;
	}

	/**
	 * @return {Material}
	 */
	clone() {
		const material = new Material(this.shader);
		material.color = this.color;
		return material;
	}

}

/**
 * @constructor
 * @struct
 * @param {?Array|Float32Array=} points
 * @param {?Array|Float32Array=} coords
 * @param {?Array|Float32Array=} colors
 * @param {?Array|Float32Array=} normals
 * @param {?Array|Uint32Array=} faces
 */
function GeometryData(points, coords, colors, normals, faces) {
	/** @const */ this.isGeometry = true;
	this.points = points || [];
	this.coords = coords || [];
	this.colors = colors || [];
	this.normals = normals || [];
	this.faces = faces || [];
	this.vBuffer = null;
	this.cBuffer = null;
	this.nBuffer = null;
	this.elementBuffer = null;
}

/**
 *
 */
class Geometry extends GeometryData {

	/**
	 * @param {?Array|Float32Array=} points
	 * @param {?Array|Float32Array=} coords
	 * @param {?Array|Float32Array=} colors
	 * @param {?Array|Float32Array=} normals
	 * @param {?Array|Uint32Array=} faces
	 */
	constructor(points, coords, colors, normals, faces) {
		super(points, coords, colors, normals, faces);
		this.isElements = false;
		this.triangleList = new GeometryData();
		this.lineList = new GeometryData();
	}

	/**
	 * Centers the geometry around [0, 0, 0].
	 * @return {!Geometry}
	 *
	 * @example
	 * const geometry = new GAME.PlaneGeometry(2, 2);
	 * geometry.center();
	 */
	center() {
		center(this);
		center(this.triangleList);
		center(this.lineList);
		return this;
	}

	/**
	 * @return {!Geometry}
	 */
	clone() {
		const newGeometry = new Geometry(
			this.points.slice(0),
			this.coords.slice(0),
			this.colors.slice(0),
			this.normals.slice(0),
			this.faces.slice(0)
		);
		newGeometry.isElements = this.isElements;
		return newGeometry;
	}

	/**
	 * @return {!Geometry}
	 */
	clear() {
		this.points.length = 0;
		this.coords.length = 0;
		this.colors.length = 0;
		this.normals.length = 0;
		this.faces.length = 0;
		this.vBuffer = null;
		this.cBuffer = null;
		this.elementBuffer = null;
		return this;
	}

	/**
	 * @param {!Material} material
	 * @param {!number} mode
	 * @return {void}
	 */
	directDraw(material, mode) {

		const drawElements = this.isElements;
		const gl$$1 = renderer.gl;

		// Determine which data we should be using.
		let bufferSet;
		let pointsCount;
		if (mode === gl$$1.LINES) {
			bufferSet = this;
			pointsCount = bufferSet.faces.length;
		} else if (mode === gl$$1.POINTS) {
			bufferSet = this.lineList;
		} else if (drawElements) {
			bufferSet = this;
			pointsCount = bufferSet.faces.length;
		}

		// If there actually is some data.
		if (pointsCount > 0) {

			// Get attribute locations.
			const attributes = material.shader.compiled.attributes;
			const position = attributes.position;
			const texture = attributes.texture;
			const normal = attributes.normal;

			// Use vertex positions if this attribute was found.
			// This pretty much has no reason NOT to be found...
			if (position >= 0) {

				let vertex_buffer;
				if (bufferSet.vBuffer) {
					vertex_buffer = bufferSet.vBuffer;
				} else {
					vertex_buffer = gl$$1.createBuffer();
					const data = new Float32Array(bufferSet.points);
					gl$$1.bindBuffer(gl$$1.ARRAY_BUFFER, vertex_buffer);
					gl$$1.bufferData(gl$$1.ARRAY_BUFFER, data, gl$$1.STATIC_DRAW);
					bufferSet.vBuffer = vertex_buffer;
				}

				gl$$1.bindBuffer(gl$$1.ARRAY_BUFFER, vertex_buffer);
				gl$$1.enableVertexAttribArray(position);
				gl$$1.vertexAttribPointer(position, 3, gl$$1.FLOAT, false, 0, 0);

			}

			// Use UV coordinates if this attribute was found.
			if (texture >= 0) {

				let texture_buffer;
				if (bufferSet.cBuffer) {
					texture_buffer = bufferSet.cBuffer;
				} else {
					texture_buffer = gl$$1.createBuffer();
					const data = new Float32Array(bufferSet.coords);
					gl$$1.bindBuffer(gl$$1.ARRAY_BUFFER, texture_buffer);
					gl$$1.bufferData(gl$$1.ARRAY_BUFFER, data, gl$$1.STATIC_DRAW);
					bufferSet.cBuffer = texture_buffer;
				}

				gl$$1.bindBuffer(gl$$1.ARRAY_BUFFER, texture_buffer);
				gl$$1.enableVertexAttribArray(texture);
				gl$$1.vertexAttribPointer(texture, 2, gl$$1.FLOAT, false, 0, 0);

			}

			// Use normals if this attribute was found.
			if (normal >= 0) {

				let normal_buffer;
				if (bufferSet.nBuffer) {
					normal_buffer = bufferSet.nBuffer;
				} else {
					normal_buffer = gl$$1.createBuffer();
					const data = new Float32Array(bufferSet.normals);
					gl$$1.bindBuffer(gl$$1.ARRAY_BUFFER, normal_buffer);
					gl$$1.bufferData(gl$$1.ARRAY_BUFFER, data, gl$$1.STATIC_DRAW);
					bufferSet.nBuffer = normal_buffer;
				}

				gl$$1.bindBuffer(gl$$1.ARRAY_BUFFER, normal_buffer);
				gl$$1.enableVertexAttribArray(normal);
				gl$$1.vertexAttribPointer(normal, 3, gl$$1.FLOAT, false, 0, 0);

			}

			// Use elements.
			if (drawElements) {
				let elementBuffer;
				if (bufferSet.elementBuffer) {
					elementBuffer = bufferSet.elementBuffer;
				} else {
					elementBuffer = gl$$1.createBuffer();
					const data = new Uint32Array(bufferSet.faces);
					gl$$1.bindBuffer(gl$$1.ELEMENT_ARRAY_BUFFER, elementBuffer);
					gl$$1.bufferData(gl$$1.ELEMENT_ARRAY_BUFFER, data, gl$$1.STATIC_DRAW);
					bufferSet.elementBuffer = elementBuffer;
				}

				gl$$1.bindBuffer(gl$$1.ELEMENT_ARRAY_BUFFER, elementBuffer);
			}

			// Draw da ting.
			gl$$1.drawElements(mode, pointsCount, gl$$1.UNSIGNED_INT, 0);

		}

	}

	/**
	 *
	 */
	generateLineList() {

		console.time("generating line list");

		const points = this.triangleList.points;
		const coords = this.triangleList.coords;
		const normals = this.triangleList.normals;
		const newPoints = [];
		const newCoords = [];
		const newNormals = [];
		const length = points.length / 3;
		const hash = {};

		for (var n = 0; n < length; n += 3) {

			let line = points.slice(n*3, n*3+6);
			let line2 = [line.slice(3, 6), line.slice(0, 3)];
			let lm = line.join();
			let lm2 = line2.join();
			if (!(hash[lm] || hash[lm2])) {
				hash[lm] = hash[lm2] = true;
				newPoints.push(...line);
				newNormals.push(...normals.slice(n*3, n*3+6));
				newCoords.push(...coords.slice(n*2, n*2+4));
			}

			line = points.slice(n*3+3, n*3+9);
			line2 = [line.slice(3, 6), line.slice(0, 3)];
			lm = line.join();
			lm2 = line2.join();
			if (!(hash[lm] || hash[lm2])) {
				hash[lm] = hash[lm2] = true;
				newPoints.push(...line);
				newNormals.push(...normals.slice(n*3+3, n*3+9));
				newCoords.push(...coords.slice(n*2+2, n*2+6));
			}

			line = [...points.slice(n*3+6, n*3+9), ...points.slice(n*3, n*3+3)];
			line2 = [line.slice(3, 6), line.slice(0, 3)];
			lm = line.join();
			lm2 = line2.join();
			if (!(hash[lm] || hash[lm2])) {
				hash[lm] = hash[lm2] = true;
				newPoints.push(...line);
				newNormals.push(...normals.slice(n*3+6, n*3+6+3));
				newNormals.push(...normals.slice(n*3, n*3+3));
				newCoords.push(...coords.slice(n*2+4, n*2+6));
				newCoords.push(...coords.slice(n*2, n*2+2));
			}

		}

		//
		this.lineList.points = newPoints;
		this.lineList.normals = newNormals;
		this.lineList.coords = newCoords;

		console.timeEnd("generating line list");

	}

	/**
	 * Generates lists of points/normals/coords directly into a triangle list format, with no need for a face index list.
	 * @returns {void}
	 */
	generateTriangleList() {

		console.time("generating triangle list");

		const faces = this.faces;
		const points = this.points;
		const coords = this.coords;
		const normals = this.normals;
		const length = faces.length / 3;
		const newFaces = new Uint32Array(length*3);
		const newPoints = new Float32Array(length*3);
		const newCoords = new Float32Array(length*2);
		const newNormals = new Float32Array(length*3);

		for (let n=0; n<length; n++) {

			const i = (faces[n*3] - 1) * 3;
			const iC = ((faces[n*3+1] - 1) * 2) || i;
			const iN = ((faces[n*3+2] - 1) * 3) || i;

			newFaces[n] = n;
			newPoints.set(points.slice(i, i+3), n*3);
			newCoords.set(coords.slice(iC, iC+2), n*2);
			newNormals.set(normals.slice(iN, iN+3), n*3);

		}

		//
		this.faces = newFaces;
		this.points = newPoints;
		this.normals = newNormals;
		this.coords = newCoords;

		console.timeEnd("generating triangle list");

	}

	/**
	 *
	 */
	loadOBJ(filepath, opt={}) {

		// Load file.
		fetch(filepath)
			.then(response => response.text())
			.then(data => {

				console.time("loading OBJ data for " + filepath);

				// Split data into lines.
				data = data.split(/\r?\n|\r/g);

				//
				const points = this.points;
				const coords = this.coords;
				const normals = this.normals;
				const faces = this.faces;
				const length = data.length;
				for (let n=0; n<length; n++) {
					let words = data[n].split(" ").filter(w => w !== "");
					let type = words.shift();
					switch (type) {
						case ("g"): /*console.log("group", words);*/ break;
						case ("v"): spreadNumber(points, words, 3); break;
						case ("vt"): spreadNumber(coords, words, 2); break;
						case ("vn"): spreadNumber(normals, words, 3); break;
						case ("f"): faces.push(...readFaces(words)); break;
					}
				}

				if (opt.normalize) { this.normalize(); }
				if (opt.scale) { this.scale(opt.scale, opt.scale, opt.scale); }
				if (opt.center) { this.center(); }
				if (opt.invertCoords) { this.invertCoords(); }

				console.timeEnd("loading OBJ data for " + filepath);
				//console.log(this);
				this.isElements = true;

				// NEED TO RESOLVE FACES

				this.generateTriangleList();

			});

	}

	/**
	 * Inverts the V component of a UV coordinate. Some times, depending on the model or the texture, these can be inverted to what is expected. This is for those occasions.
	 * @return {!Geometry}
	 */
	invertCoords() {
		const length = this.coords.length;
		for (let n=1; n<length; n+=2) {
			this.coords[n] = 1-this.coords[n];
		}
		return this;
	}

	/**
	 * @return {!Geometry}
	 */
	shiftCoords(x, y, range) {
		const arr = this.coords;
		const s = range ? range[0] : 0;
		const e = range ? range[1] : arr.length;
		for (let n=s; n<e; n+=2) {
			arr[n] += x;
			arr[n+1] += y;
		}
		return this;
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @return {!Geometry}
	 */
	scaleCoords(x, y, range) {
		const arr = this.coords;
		const s = range ? range[0] : 0;
		const e = range ? range[1] : arr.length;
		for (let n=s; n<e; n+=2) {
			arr[n] *= x;
			arr[n+1] *= y;
		}
		return this;
	}

	/**
	 * @return {!Geometry}
	 */
	flipFaces() {
		const faces = this.faces;
		const length = faces.length;
		for (let n=0; n<length; n+=3) {
			[faces[n], faces[n+1], faces[n+2]] = [faces[n+2], faces[n+1], faces[n]];
		}
		return this;
	}

	/**
	 * @param {!Geometry} geometry
	 * @param {!number=} x
	 * @param {!number=} y
	 * @param {!number=} z
	 * @return {!Geometry}
	 */
	merge(geometry, x=0, y=0, z=0, sx=1, sy=1, sz=1) {
		//console.time("merging geometries");

		// Merge faces. Index data need to be adjusted.
		const faces = geometry.faces;
		const fLength = faces.length;
		const opLength = this.points.length / 3;
		for (let n=0; n<fLength; n++) {
			this.faces.push(faces[n] + opLength);
		}

		// Merge points with the given offets.
		const points = geometry.points;
		const pLength = points.length;
		for (let n=0; n<pLength; n+=3) {
			this.points.push(
				sx * points[n] + x,
				sy * points[n+1] + y,
				sz * points[n+2] + z,
			);
		}

		// Merge other data, this doesn't need to be translated.
		this.coords.push(...geometry.coords);
		this.normals.push(...geometry.normals);

		//
		if (geometry.isElements) {
			this.isElements = true;
		}

		//
		this.nBuffer = null;
		this.cBuffer = null;
		this.vBuffer = null;
		this.elementBuffer = null;

		return this;
	}

	/**
	 * TODO Change this to only modify existing points not add new ones. That functionality could then be acheived with a clone + mirror + merge.
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @return {!Geometry}
	 */
	mirror(x, y, z) {
		const length = this.points.length / 3;
		for (let n=0; n<length; n++) {
			this.points.push(
				x + (x - this.points[n * 3 + 0]),
				y + (y - this.points[n * 3 + 1]),
				z + (z - this.points[n * 3 + 2])
			);
		}
		return this;
	}

	/**
	 * @return {!Geometry}
	 */
	normalize() {

		// Get bounding box.
		let minx = Number.MAX_SAFE_INTEGER;
		let miny = Number.MAX_SAFE_INTEGER;
		let minz = Number.MAX_SAFE_INTEGER;
		let maxx = Number.MIN_SAFE_INTEGER;
		let maxy = Number.MIN_SAFE_INTEGER;
		let maxz = Number.MIN_SAFE_INTEGER;
		const points = this.points;
		const length = points.length;
		for (let n=0; n<length; n+=3) {
			minx = Math.min(minx, points[n]);
			maxx = Math.max(maxx, points[n]);
			miny = Math.min(miny, points[n+1]);
			maxy = Math.max(maxy, points[n+1]);
			minz = Math.min(minz, points[n+2]);
			maxz = Math.max(maxz, points[n+2]);
		}

		// Calculate scale.
		const width = maxx - minx;
		const height = maxy - miny;
		const depth = maxz - minz;
		const scale = Math.min(
			1 / width,
			1 / height,
			1 / depth
		);

		// Apply to points.
		for (let n=0; n<length; n++) {
			points[n] *= scale;
		}

		return this;

	}

	/**
	 * @return {!Geometry}
	 */
	unit() {
		const points = this.points;
		const length = points.length;
		for (let n=0; n<length; n+=3) {
			const x = points[n+0];
			const y = points[n+1];
			const z = points[n+2];
			const length = Math.sqrt(x*x+y*y+z*z);
			points[n+0] /= length;
			points[n+1] /= length;
			points[n+2] /= length;
		}
		return this;
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @return {!Geometry}
	 */
	scale(x, y, z) {
		scale(this, x, y, z);
		scale(this.triangleList, x, y, z);
		scale(this.lineList, x, y, z);
		return this;
	}

	/**
	 * @param {!number} x Amount to shift the points along the x axis.
	 * @param {!number} y Amount to shift the points along the y axis.
	 * @param {!number} z Amount to shift the points along the z axis.
	 * @return {!Geometry}
	 */
	translate(x, y, z) {
		const points = this.points;
		const length = points.length;
		for (let n=0; n<length; n+=3) {
			points[n + 0] += x;
			points[n + 1] += y;
			points[n + 2] += z;
		}
		return this;
	}

	/**
	 * @return {!Geometry}
	 */
	rotate(a, x, y, z) {
		const matrix = new Matrix4();
		const m2 = matrix.rotate(a, x, y, z).transpose();
		const points = this.points;
		const normals = this.normals;
		const length = points.length;
		for (let n=0; n<length; n+=3) {

			const tPoint = m2.transformPoint([...points.slice(n, n+3), 1]);
			points[n + 0] = tPoint[0];
			points[n + 1] = tPoint[1];
			points[n + 2] = tPoint[2];

			const normal = m2.transformPoint([...normals.slice(n, n+3), 1]);
			normals[n + 0] = normal[0];
			normals[n + 1] = normal[1];
			normals[n + 2] = normal[2];

		}
		return this;
	}

}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @return {void}
 */
function scale(geo, x, y, z) {
	const points = geo.points;
	const length = points.length;
	for (let n=0; n<length; n+=3) {
		points[n] *= x;
		points[n+1] *= y;
		points[n+2] *= z;
	}
}

/**
 * Centers the geometry around [0, 0, 0]. This method iterates all the points in the geometry, getting the min and max for each axis. These values are then used to shift all the points. For example; a plane going from [0, 0, 0] to [2, 2, 2] wil now go from [-1, -1, -1] to [1, 1, 1].
 * @param {!GeometryData} geo
 * @return {void}
 *
 * @example
 * const geometry = new GAME.PlaneGeometry(2, 2);
 * geometry.center();
 */
function center(geo) {

	// Get bounding box.
	let minx = Number.MAX_SAFE_INTEGER;
	let miny = Number.MAX_SAFE_INTEGER;
	let minz = Number.MAX_SAFE_INTEGER;
	let maxx = Number.MIN_SAFE_INTEGER;
	let maxy = Number.MIN_SAFE_INTEGER;
	let maxz = Number.MIN_SAFE_INTEGER;
	const points = geo.points;
	const length = points.length;
	for (let n=0; n<length; n+=3) {
		minx = Math.min(minx, points[n]);
		maxx = Math.max(maxx, points[n]);
		miny = Math.min(miny, points[n+1]);
		maxy = Math.max(maxy, points[n+1]);
		minz = Math.min(minz, points[n+2]);
		maxz = Math.max(maxz, points[n+2]);
	}

	// Calculate shift.
	const shiftx = -(minx + (maxx - minx) / 2);
	const shifty = -(miny + (maxy - miny) / 2);
	const shiftz = -(minz + (maxz - minz) / 2);

	// Apply to points.
	for (let n=0; n<length; n+=3) {
		points[n] += shiftx;
		points[n+1] += shifty;
		points[n+2] += shiftz;
	}

}

/**
 * @param {!Array} words
 * @return {!Array<number>}
 */
function readFaces(words) {

	const newFace = [];
	let face = [];
	let first = null;
	let last = null;
	let i = 0;
	//words.shift();
	words.forEach(w => {

		// If first triangle is complete, form a new face using the first point
		// and the last point in "fan" fashion.
		if (i++ >= 3) {
			newFace.push(...face);
			face = [...first, ...last];
		}

		//
		const w2 = w.split(" ");
		w2.forEach(k => {
			const count = (k.match(/\//g) || []).length;
			for (var n = count; n < 2; n += 1) {
				k += "/";
			}
			last = k.split("/").map(w => Number(w));
			face.push(...last);
		});

		// Cache the first point of this face.
		if (!first) first = last;

	});
	newFace.push(...face);
	return newFace;

}

/**
 * @param {!Iterable} arr
 * @param {!Array<string>} words
 * @param {!number=} limit The limit of entries to actually push.
 * @return {void}
 */
function spreadNumber(arr, words, limit=3) {
	const len = arr.length;
	for (let n=0; n<limit; n++) {
		arr[len+n] = Number(words[n]);
	}
}

const blankPixel = new Uint8Array([0, 0, 255, 255]);

/**
 *
 */
class Texture {

	/**
	 * @param {!string} url
	 * @param {?Object} options
	 */
	constructor(url, options={}) {

		//
		options.noMipmaps = allowDefault(options.noMipmaps, false);

		// Create texture.
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// Single pixel texture, available immedietly.
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, blankPixel);

		// Image load callback.
		const image = new Image();
		image.onload = () => {

			console.log("texture loaded: " + url);

			// Set image as texture.
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

			// Possible to use mip-mapping?
			if (!options.noMipmaps && isPowerOf2(image.width) && isPowerOf2(image.height)) {
				//console.log("generating mip-maps: " + url);
				gl.generateMipmap(gl.TEXTURE_2D);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
			} else {
				//console.log("FAILED to generate mip-maps: " + url);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			}

			// Update props.
			this.ready = true;
			this.width = image.width;
			this.height = image.height;

			// Make sure the renderer is able to use updated texture.
			renderer.boundTexture = null;

			if (options.getPixelData) {
				console.time("get pixel data");
				this.getPixel(0, 0);
				console.timeEnd("get pixel data");
			}

			if (this.onload){
				this.onload();
			}

			console.log("texture end: " + url);

		};

		image.src = url;


		// Export props.
		this.uvs = [0, 0, 1, 1];
		this.ready = false;
		this.texture = texture;
		this.width = 1;
		this.height = 1;
		this.onload = () => {};
		this.image = image;
		this.imageData = null;
		this.pixels = null;

	}

	/**
	 * @param {!number} x
	 * @param {!number} y
	 * @return {?Array}
	 */
	getPixel(x, y) {

		// Get imageData if it has not been retrieved yet.
		if (!this.imageData) {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			canvas.width = this.width;
			canvas.height = this.height;
			ctx.drawImage(this.image, 0, 0);
			this.imageData = ctx.getImageData(0, 0, this.width, this.height);
			this.pixels = this.imageData.data;
		}

		// Return pixel data.
		const index = (x * this.height + y) * 4;
		return this.pixels.subarray(index, index+3);

	}

}

/**
 *
 */
class Mesh {

	/**
	 * @param {!Geometry} geometry
	 * @param {!Material} material
	 */
	constructor(geometry, material) {

		/** @const */ this.isMesh = true;
		this.geometry = geometry;
		this.material = material;
		this.position = new Vector3();
		this.rotation = new Vector3();
		this.scale = new Vector3(1, 1, 1);
		this.matrix = new Matrix4();

	}

	/**
	 * @return {Mesh}
	 */
	clone() {
		return new Mesh(this.geometry, this.material);
	}

	/**
	 *
	 */
	draw() {

		// Early exit.
		if (!this.geometry) { return; }

		const gl$$1 = renderer.gl;
		const m = this;

		// Set texture.
		gl$$1.useProgram(m.material.shader.compiled.program);
		if (m.material.texture && m.material.texture.texture !== renderer.boundTexture) {
			const texture = m.material.texture.texture;
			const uSampler = gl$$1.getUniformLocation(m.material.shader.compiled.program, 'uSampler');
			gl$$1.activeTexture(gl$$1.TEXTURE0);
			gl$$1.bindTexture(gl$$1.TEXTURE_2D, texture);
			gl$$1.uniform1i(uSampler, 0);
			renderer.boundTexture = texture;
			//console.log("bind texture!");
		}

		// Translate and draw.
		m.matrix.identity();
		m.matrix.translate(m.position.x, m.position.y, m.position.z);
		m.matrix.rotate(m.rotation.x, 1, 0, 0);
		m.matrix.rotate(m.rotation.y, 0, 1, 0);
		m.matrix.rotate(m.rotation.z, 0, 0, 1);
		m.matrix.scale(m.scale.x, m.scale.y, m.scale.z);
		var mm = m.matrix.transpose();
		gl$$1.uniformMatrix4fv(m.material.shader.compiled.uniform.modelViewMatrix, false, mm.matrix);

		// Normal matrix.
		const normalMatrix = new Matrix4(m.matrix.matrix);
		normalMatrix.inverse(m.matrix);
		gl$$1.uniformMatrix4fv(m.material.shader.compiled.uniform.normalMatrix, false, normalMatrix.matrix);

		if (m.material.color) {
			gl$$1.uniform3fv(m.material.shader.compiled.uniform.color, m.material.color.floats);
		}

		const mode =
			m.material.wireframe ? gl$$1.LINES :
			m.material.points ? gl$$1.POINTS :
			gl$$1.TRIANGLES;
		m.geometry.directDraw(this.material, mode);

	}

}

/**
 * @extends Geometry
 */
class PlaneGeometry extends Geometry {

	/**
	 * Creates a Plane geometry, from [0, 0, 0] to [w, h, 0].
	 * @param {!number=} w Width of the plane.
	 * @param {!number=} h Height of the plane.
	 * @param {!number=} wSegments Number of segments along the width of the plane.
	 * @param {!number=} hSegments Number of segments along the height of the plane.
	 * @param {!Object=} options
	 */
	constructor(w=1, h=1, wSegments=1, hSegments=1, options={}) {

		//console.time("creating PlaneGeometry");

		const coords = options.coords || [0, 0, 1, 1];
		const invertCoords = options.invertCoords || 0;

		const wd = wSegments + 1;
		const hd = hSegments + 1;
		const vs = new Float32Array(wd*hd*3);				// Positions.
		const ns = new Float32Array(wd*hd*3);				// Normals.
		const cs = new Float32Array(wd*hd*2);				// Coords.
		const fs = new Uint32Array(wSegments*hSegments*6);	// Faces.

		// Generate vertex data.
		const incX = 1 / wSegments;
		const incY = 1 / hSegments;
		for (let n=0, y=0; y<=hSegments; y+=1)
		for (let x=0; x<=wSegments; x+=1, n++) {

			// Points.
			vs[n*3] = x * incX * w;
			vs[n*3+1] = y * incY * h;

			// Normals.
			ns[n*3+0] = 0;
			ns[n*3+1] = 0;
			ns[n*3+2] = 1;

			// Coords.
			cs[n*2] = coords[0] + (x * incX) * (coords[2]-coords[0]);
			cs[n*2+1] = invertCoords ? 1-(y*incY) : (y*incY);
			cs[n*2+1] = coords[1] + cs[n*2+1] * (coords[3]-coords[1]);

		}

		// Generate face indexes.
		for (let n=0, y=0; y<hSegments; y++)
		for (let x=0; x<wSegments; x++, n+=6) {
			fs[n] = y*wd+x;
			fs[n+1] = y*wd+x+1;
			fs[n+2] = y*wd+x+wd;
			fs[n+3] = y*wd+x+wd;
			fs[n+4] = y*wd+x+1;
			fs[n+5] = y*wd+x+1+wd;
		}

		super(vs, cs, null, ns, fs);

		this.width = w;
		this.height = h;
		this.widthSegments = wSegments;
		this.heightSegments = hSegments;
		this.isElements = true;

		//console.timeEnd("creating PlaneGeometry");

	}

	/**
	 *
	 */
	generateLineList() {

		console.time("generating line list (PlaneGeometry)");

		const points = this.points;
		const coords = this.coords;
		const normals = this.normals;
		const newPoints = [];
		const newCoords = [];
		const newNormals = [];
		const length = points.length;

		const w = this.widthSegments + 1;
		const h = this.heightSegments + 1;

		for (let y = 0; y < h; y += 1) {
			let n = y * w * 3;
			let last = points.slice(n, n+3);
			n += 3;
			for (let x = 1; x < w; x += 1) {
				let now = points.slice(n, n+3);
				newPoints.push(...last, ...now);
				let now2 = points.slice(n+w*3-3, n+w*3);
				newPoints.push(...last, ...now2);
				last = now;
				let now3 = points.slice(n+w*3-3, n+w*3);
				newPoints.push(...last, ...now3);
				n += 3;
			}
			let now2 = points.slice(n+w*3-3, n+w*3);
			newPoints.push(...last, ...now2);
		}

		//
		this.lineList = {
			points: newPoints,
			normals: newNormals,
			coords: newCoords
		};

		console.timeEnd("generating line list (PlaneGeometry)");

	}

}

/**
 *
 */
const textureShader = {};

textureShader.name = "textureShader";

textureShader.vertex =

`attribute vec3 aVertex;
attribute vec2 aTextureCoord;

uniform mat4 uMatrix;
uniform mat4 uModelViewMatrix;

varying vec2 vTextureCoord;

void main() {
	gl_Position = uMatrix * uModelViewMatrix * vec4(aVertex, 1);
	vTextureCoord = aTextureCoord;
}`;

//
textureShader.fragment =

`precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;

void main() {
	gl_FragColor = texture2D(uSampler, vTextureCoord);
	if (gl_FragColor.a != 1.0) {
		discard;
	}
}`;

/**
 *
 */
class TextureMaterial extends Material {

	/**
	 */
	constructor(texture) {
		super();
		this.shader = textureShader;
		this.texture = texture;
	}

}

/**
 *
 */
const spriteOptions = {
	invertCoords: true
};

/**
 *
 */
class SpriteHelper {

	/**
	 * The origin determines a translation on the mesh. So to get the origin in the middle of a sprite you actually provide it with -w/2, -h/2.
	 * @param {!string} url
	 * @param {!number} w Width of the sprite. Defaults to image width.
	 * @param {!number} h Height of the sprite. Defaults to image height.
	 * @param {!number=} [oX=0] The x origin of the sprite.
	 * @param {!number=} [oY=0] The Y origin of the sprite.
	 * @return {!Mesh}
	 */
	createSprite(url, w, h, oX=0, oY=0) {
		const geometry = new PlaneGeometry(1, 1, 1, 1, spriteOptions);
		const texture = new Texture(url);
		const material = new TextureMaterial(texture);
		texture.onload = () => {
			geometry.scale(w || texture.width, h || texture.height, 1);
			geometry.translate(oX||0, oY||0, 0);
			geometry.generateTriangleList();
		};
		return new Mesh(geometry, material);
	}

	/**
	 * @param {!Mesh} sprite The sprite (really a Mesh) to draw.
	 * @param {?number} x X position to draw. Defaults to 0.
	 * @param {?number} y Y position to draw. Defaults to 0.
	 * @param {?number} xScale
	 * @param {?number} yScale
	 * @param {?number} rotation Rotation around the sprite's origin.
	 */
	drawSprite(sprite, x=0, y=0, xScale=1, yScale=1, rotation=0) {
		sprite.position.x = x;
		sprite.position.y = y;
		sprite.scale.x = xScale;
		sprite.scale.y = yScale;
		sprite.rotation.z = rotation;
		sprite.draw();
	}

}

/**
 *
 */
const PI = Math.PI;

/**
 *
 */
const PI2 = PI / 2;

/**
 *
 */
const TAU = PI * 2;

/**
 *
 */
const DEG_TO_RAD = 1 / 180 * PI;

/**
 *
 */
class CircleGeometry extends Geometry {

	/**
	 * @param {!number} radius
	 * @param {!number} segments
	 */
	constructor(radius, segments) {

		const points = [];
		const delta = TAU / segments;
		let theta = 0;
		let x1 = radius * Math.cos(theta);
		let y1 = radius * Math.sin(theta);
		let x2, y2;
		for (let n = 1; n <= segments; n++) {
			theta += delta;
			x2 = radius * Math.cos(theta);
			y2 = radius * Math.sin(theta);
			points.push(
				0, 0, 0,
				x1, y1, 0,
				x2, y2, 0
			);
			x1 = x2;
			y1 = y2;
		}

		super(points);

	}

}

/**
 *
 */
class BoxGeometry extends Geometry {

	/**
	 * @param {!number} w
	 * @param {!number} h
	 * @param {!number} d
	 * @param {!number=} ws Number of segments along width.
	 * @param {!number=} hs Number of segments along height.
	 * @param {!number=} ds Number of segments along depth.
	 */
	constructor(w, h, d, ws=1, hs=1, ds=1) {

		super();

		// Top.
		this.merge(
			(new PlaneGeometry(w, h, ws, hs))
				.invertCoords(),
			0, 0, d);

		// Bottom.
		this.merge(
			(new PlaneGeometry(w, h, ws, hs))
				.invertCoords()
				.rotate(PI, 1, 0, 0),
			0, h, 0);

		// North.
		this.merge(
			(new PlaneGeometry(w, d, ws, ds))
				.invertCoords()
				.rotate(PI2, 1, 0, 0),
			0, 0, 0);

		// East.
		this.merge(
			(new PlaneGeometry(d, h, ds, hs))
				.invertCoords()
				.rotate(-PI2, 0, 1, 0)
				.rotate(PI2, 1, 0, 0),
			0, h, 0);

		// South.
		this.merge(
			(new PlaneGeometry(w, d, ws, ds))
				.rotate(-PI2, 0, 1, 0)
				.rotate(-PI2, 1, 0, 0)
				.rotate(PI2, 0, 0, 1)
				.flipFaces(),
			w, h, d);

		// West.
		this.merge(
			(new PlaneGeometry(d, h, ds, hs))
				.rotate(-PI2, 1, 0, 0)
				.rotate(PI2, 0, 0, 1)
				.flipFaces(),
			w, 0, d);

	}

}

/**
 *
 */
class SphereGeometry extends Geometry {

	/**
	 * @param {!number} r Radius
	 * @param {!number} sides
	 * @param {!number} segments
	 */
	constructor(r, sides, segments) {

		console.time("creating SphereGeometry");

		const points = [];
		const coords = [];
		const normals = [];
		const faces = [];
		const dphi = 360 / sides;
		const dtheta = 180 / segments;
		const sides1 = sides + 1;

		for (let segment=0; segment<=segments; ++segment) {
			const theta = segment * dtheta;
			const segment1 = segment + 1;
			const tsin = Math.sin(theta * DEG_TO_RAD);
			const tcos = Math.cos(theta * DEG_TO_RAD);
			for (let side=0; side<=sides; ++side) {
				const phi = side * dphi;
				const x = tsin * Math.sin(phi * DEG_TO_RAD);
				const z = tsin * Math.cos(phi * DEG_TO_RAD);

				points.push(r*x, r*tcos, r*z);
				normals.push(x, tcos, z);
				coords.push(phi/360.0, theta/180.0);

				if (segment === segments || side === sides)
					continue;

				if (segment !== segments - 1) {
					faces.push(
						segment  * sides1 + side,
						segment1 * sides1 + side,
						segment1 * sides1 + side + 1
					);
				}

				if (segment !== 0) {
					faces.push(
						segment  * sides1 + side,
						segment1 * sides1 + side + 1,
						segment  * sides1 + side + 1
					);
				}

			}
		}

		super(points, coords, null, normals, faces);
		this.isElements = true;
		this.rotate(PI2, 1, 0, 0);

		console.timeEnd("creating SphereGeometry");

	}

}

/**
 *
 */
const defaultShader = {};

defaultShader.name = "defaultShader";

//*
defaultShader.vertex =

`attribute vec3 aVertex;

uniform mat4 uMatrix;
uniform vec3 uColor;
uniform mat4 uModelViewMatrix;

varying vec4 vColor;

void main() {

	vColor = vec4(uColor, 1.0);
	gl_Position = uMatrix * uModelViewMatrix * vec4(aVertex, 1);

}`;

//
defaultShader.fragment =

`precision mediump float;

varying vec4 vColor;

void main() {
	gl_FragColor = vColor;
}`;
//*/

/*
defaultShader.vertex =

`attribute vec2 aVertex;
attribute vec2 aCoord;
attribute vec4 aColor;

uniform mat4 uMatrix;

varying vec2 vCoord;
varying vec4 vColor;

void main() {
	gl_Position = vec4((uMatrix * vec4(aVertex, 1, 1)).xy, 0, 1);
	vCoord = aCoord;
	vColor = aColor;
}`;

//
defaultShader.fragment =

`precision mediump float;

uniform sampler2D uTexture;

varying vec2 vCoord;
varying vec4 vColor;

void main() {
	gl_FragColor = vColor * texture2D(uTexture, vCoord);
}`;
//*/

/**
 *
 */
class ColorMaterial extends Material {

	/**
	 * @param {!Color|number=} color
	 */
	constructor(color) {
		super();
		this.shader = defaultShader;
		this.color = (typeof color === "undefined")
			? new Color()
			: color instanceof Color
				? color
				: new Color(color);
	}

}

/**
 *
 */
const normalShader = {};

normalShader.name = "normalShader";

//*
normalShader.vertex =

`attribute vec3 aVertex;
attribute vec3 aVertexNormal;

uniform mat4 uMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;

varying vec3 vLighting;

void main() {

	gl_Position = uMatrix * uModelViewMatrix * vec4(aVertex, 1.0);

	// Lighting.
	vec3 ambientLight = vec3(0.3, 0.3, 0.3);
	vec3 directionalLightColor = vec3(1.0, 1.0, 1.0);
    vec3 directionalVector = normalize(vec3(0.75, -0.85, 0.8));

	vec4 transformedNormal = uModelViewMatrix * vec4(aVertexNormal, 0.0);

	float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    vLighting = ambientLight + (directionalLightColor * directional);

}`;

//
normalShader.fragment =

`precision mediump float;

varying vec3 vLighting;

void main() {
	vec3 color = vec3(1.0, 1.0, 1.0);
	gl_FragColor = vec4(color.rgb * vLighting, 1.0);
}`;

/**
 *
 */
class NormalMaterial extends Material {

	/**
	 */
	constructor() {
		super();
		this.shader = normalShader;
	}

}

/**
 *
 */
const spriteShader = {

	name: "defaultShader",

	vertex:

`attribute vec3 aVertex;

uniform mat4 uMatrix;
uniform vec4 uColor;
uniform mat4 uModelViewMatrix;

varying vec4 vColor;

void main() {

	vColor = uColor;
	gl_Position = uMatrix * uModelViewMatrix * vec4(aVertex, 1);

}`,

	fragment:

`precision mediump float;

varying vec4 vColor;

void main() {
	gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);//vColor;
}`

};

/**
 *
 */
class SpriteMaterial extends Material {

	/**
	 */
	constructor() {
		super();
		this.shader = spriteShader;
	}

}

/**
 *
 */
const normalTextureShader = {};

normalTextureShader.name = "normalTextureShader";

//*
normalTextureShader.vertex =

`
const int MAX_DIRECTIONAL_LIGHTS_SIZE = 8;
const int MAX_POINT_LIGHTS_SIZE = 12;

attribute vec3 aVertex;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uNormalMatrix;
uniform mat4 uMatrix;
uniform mat4 uModelViewMatrix;
uniform vec3 uAmbientLight;
uniform int uDirectionalLightsSize;
uniform vec3 uDirectionalLights[MAX_DIRECTIONAL_LIGHTS_SIZE];
uniform int uPointLightsSize;
uniform vec3 uPointLights[MAX_POINT_LIGHTS_SIZE];

varying vec3 vLighting;
varying vec2 vTextureCoord;

void main() {

	vec4 vertexPosition = uModelViewMatrix * vec4(aVertex, 1.0);
	gl_Position = uMatrix * vertexPosition;

	// Ambient lighting.
	vLighting = uAmbientLight;

	// Directional lighting.
	for (int i=0; i<MAX_DIRECTIONAL_LIGHTS_SIZE; i+=2) {
		if (i == uDirectionalLightsSize) {break;}
		vec3 directionalLightColor = uDirectionalLights[i+1];
	    vec3 directionalVector = normalize(uDirectionalLights[i]);
		vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
		float directional = max(dot(normalize(transformedNormal.xyz), directionalVector), 0.0);
		vLighting += directionalLightColor * directional;
	}

	// Point lighting.
	for (int i=0; i<MAX_POINT_LIGHTS_SIZE; i+=3) {
		if (i == uPointLightsSize) {break;}
		vec3 position = uPointLights[i];
		vec3 pointLightColor = uPointLights[i+1];
		vec3 att = uPointLights[i+2];
		float d = length(position - vertexPosition.xyz);
		float attenuation = 1.0 / (att[0] + att[1]*d + att[2]*d*att[2]*d);
		pointLightColor = attenuation * pointLightColor;
		vec3 directionalVector = normalize(position - vertexPosition.xyz);
		vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
		float directional = max(dot(normalize(transformedNormal.xyz), directionalVector), 0.0);
		vLighting += pointLightColor * directional;
	}

	vTextureCoord = aTextureCoord;

}`;

//
normalTextureShader.fragment =

`precision mediump float;

varying vec3 vLighting;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;

void main() {
	vec3 color = vec3(1.0, 1.0, 1.0);
	gl_FragColor = vec4(texture2D(uSampler, vTextureCoord).rgb * vLighting, 1.0);
	if (texture2D(uSampler, vTextureCoord).a != 1.0) {
		discard;
	}
}`;

/**
 *
 */
class NormalTextureMaterial extends Material {

	/**
	 */
	constructor(texture) {
		super();
		this.shader = normalTextureShader;
		this.texture = texture;
	}

}

/**
 *
 */
class WireframeMaterial extends Material {

	/**
	 * @param {?Color} color
	 */
	constructor(color) {
		super();
		this.color = (typeof color === "undefined") ? new Color() : color;
		this.wireframe = true;
		this.shader = defaultShader;
	}

}

/**
 *
 */
const pointShader = {};

//*
pointShader.vertex =

`attribute vec3 aVertex;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;

varying vec3 vLighting;
varying vec2 vTextureCoord;

void main() {

	gl_Position = uMatrix * uModelViewMatrix * vec4(aVertex, 1.0);

	// Lighting.
	vec3 ambientLight = vec3(0.3, 0.3, 0.3);
	vec3 directionalLightColor = vec3(1.0, 1.0, 1.0);
    vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

	vec4 transformedNormal = uModelViewMatrix * vec4(aVertexNormal, 0.0);

	float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    vLighting = ambientLight + (directionalLightColor * directional);

	vTextureCoord = aTextureCoord;
	gl_PointSize = 4.0;

}`;

//
pointShader.fragment =

`precision mediump float;

varying vec3 vLighting;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;

void main() {
	float dist = distance( gl_PointCoord, vec2(0.5) );
	if (dist > 0.5)
		discard;
	vec3 color = vec3(1.0, 1.0, 1.0);
	gl_FragColor = vec4(texture2D(uSampler, vTextureCoord+(gl_PointCoord/(2048.0/4.0))).rgb * vLighting, 1.0);
}`;

/**
 *
 */
class PointMaterial extends Material {

	/**
	 *
	 */
	constructor(texture) {
		super();
		this.texture = texture;
		this.points = true;
		this.shader = pointShader;
	}

}

const HEIGHTMAP_OPTIONS = { noMipmaps: true, getPixelData: true };

/**
 *
 */
class Terrain extends Mesh {

	/**
	 * @param {!string} hm Heightmap image URL.
	 * @param {!string} df Diffuse texture URL.
	 * @param {!Object=} opt Options.
	 */
	constructor(hm, df, opt={}) {
		const material = new TextureMaterial(new Texture(df));
		const geo = new PlaneGeometry(1, 1, 1, 1);
		super(geo, material);
		/** @const */ this.isTerrain = true;
		this.generate(hm, df, opt);
	}

	/**
	 * @param {!string} hm Heightmap image URL.
	 * @param {!string} df Diffuse texture URL.
	 * @param {!Object=} opt Options.
	 * @return {void}
	 */
	generate(hm, df, opt={}) {
		const heightmap = new Texture(hm, HEIGHTMAP_OPTIONS);
		const heights = new Grid(1, 1, Uint8Array);
		heightmap.onload = () => {

			const width = heightmap.width;
			const height = heightmap.height;

			// Create heights and geometry.
			const heights = new Grid(width, height, Uint8Array);
			const geometry = new PlaneGeometry(1, 1, width-1, height-1);
			const data = heights.data;
			const points = geometry.points;
			const pixels = heightmap.pixels;
			const length = points.length / 3;
			for (let n=0; n<length; n++) {
				data[n] = points[n*3+2] = pixels[n*4+2];
			}

			// Calculate new normals.
			if (opt.calculateNormals) {
				const normals = geometry.normals;
				for (let n=0, y=0; y<height; y++)
				for (let x=0; x<width; n++, x++) {
					const vec = new Vector3(
						heights.get(x-1, y) - heights.get(x+1, y),
						heights.get(x, y+1) - heights.get(x, y-1),
						0.01);
					vec.normalize();
					normals.set(vec.values(), n*3);
				}
			}

			this.geometry = geometry;
		};

	}

}

const snippets = {

	vertex: {
		attributes:
			'attribute vec3 aVertex;',
		uniforms:
			`uniform mat4 uMatrix;
			uniform mat4 uModelViewMatrix;`,
		vertex:
			`vec4 vertexPosition = uModelViewMatrix * vec4(aVertex, 1.0);
			gl_Position = uMatrix * vertexPosition;`
	},

	normals: {
		attributes:
			'attribute vec3 aVertexNormal;',
		uniforms:
			'uniform mat4 uNormalMatrix;'
	},

	lighting: {
		varyings:
			`varying vec3 vLighting;`,
		fragment:
			'gl_FragColor.rgb *= vLighting;'
	},

	ambientLight: {
		uniforms:
			`uniform vec3 uAmbientLight;`,
		vertex:
			`vLighting = uAmbientLight;`,
	},

	directionalLights: {
		constants:
			`const int MAX_DIRECTIONAL_LIGHTS_SIZE = 8;`,
		uniforms:
			`uniform int uDirectionalLightsSize;
			uniform vec3 uDirectionalLights[MAX_DIRECTIONAL_LIGHTS_SIZE];`,
		vertex:
			`for (int i=0; i<MAX_DIRECTIONAL_LIGHTS_SIZE; i+=2) {
				if (i == uDirectionalLightsSize) {break;}
				vec3 directionalLightColor = uDirectionalLights[i+1];
			    vec3 directionalVector = normalize(uDirectionalLights[i]);
				vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
				float directional = max(dot(normalize(transformedNormal.xyz), directionalVector), 0.0);
				vLighting += directionalLightColor * directional;
			}`
	},

	pointLights: {
		constants:
			`const int MAX_POINT_LIGHTS_SIZE = 12;`,
		uniforms:
			`uniform int uPointLightsSize;
			uniform vec3 uPointLights[MAX_POINT_LIGHTS_SIZE];`,
		vertex:
			`for (int i=0; i<MAX_POINT_LIGHTS_SIZE; i+=3) {
				if (i == uPointLightsSize) {break;}
				vec3 position = uPointLights[i];
				vec3 pointLightColor = uPointLights[i+1];
				vec3 att = uPointLights[i+2];
				float d = length(position - vertexPosition.xyz);
				float attenuation = 1.0 / (att[0] + att[1]*d + att[2]*d*att[2]*d);
				pointLightColor = attenuation * pointLightColor;
				vec3 directionalVector = normalize(position - vertexPosition.xyz);
				vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
				float directional = max(dot(normalize(transformedNormal.xyz), directionalVector), 0.0);
				vLighting += pointLightColor * directional;
			}`
	}

};

/**
 *
 */
class CustomShader {

	/**
	 *
	 */
	constructor(options) {

		this.name = 'customShader';
		this.vertex = '';
		this.fragment = '';

		this.constants = [];
		this.attributes = [];
		this.uniforms = [];
		this.varyings = [];
		this.sVertex = [];
		this.sFragment = [];

		this.useVertex = options.useVertex || true;
		this.useNormals = options.useNormals || false;
		this.useLighting = options.useLighting || false;
		this.useAmbientLight = options.useAmbientLight || false;
		this.useDirectionalLights = options.useDirectionalLights || false;
		this.usePointLights = options.usePointLights || false;

		this.make();

	}

	/**
	 *
	 */
	make() {

		//
		if (this.useVertex) this.use(snippets.vertex);
		if (this.useNormals) this.use(snippets.normals);
		if (this.useLighting) this.use(snippets.lighting);
		if (this.useAmbientLight) this.use(snippets.ambientLight);
		if (this.useDirectionalLights) this.use(snippets.directionalLights);
		if (this.usePointLights) this.use(snippets.pointLights);

		//
		const v = [
			...this.constants,
			...this.attributes,
			...this.uniforms,
			...this.varyings,
			'void main() {',
			...this.sVertex,
			'}'
		];

		//
		const f = [
			'precision mediump float;',
			...this.varyings,
			'void main() {',
			'gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);',
			...this.sFragment,
			'}'
		];

		//
		this.vertex = v.join("\n");
		this.fragment = f.join("\n");
		//console.log(this.vertex);
		//console.log(this.fragment);

	}

	/**
	 *constants
	 */
	use(snip) {

		if (snip.constants) this.constants.push(snip.constants);
		if (snip.attributes) this.attributes.push(snip.attributes);
		if (snip.uniforms) this.uniforms.push(snip.uniforms);
		if (snip.varyings) this.varyings.push(snip.varyings);
		if (snip.vertex) this.sVertex.push(snip.vertex);
		if (snip.fragment) this.sFragment.push(snip.fragment);

	}

}

// Cameras

// Constants.
const PI$1 = Math.PI;
const PI2$1 = PI$1 / 2;
const TAU$1 = PI$1 * 2;

export { PI$1 as PI, PI2$1 as PI2, TAU$1 as TAU, Camera, OrthographicCamera, PerspectiveCamera, AmbientLight, DirectionalLight, PointLight, Grid, Color, Matrix4, Mesh, Scene, WebGLRenderer, Texture, SpriteHelper, Vector3, Geometry, PlaneGeometry, CircleGeometry, BoxGeometry, SphereGeometry, Material, ColorMaterial, NormalMaterial, SpriteMaterial, TextureMaterial, NormalTextureMaterial, WireframeMaterial, PointMaterial, Terrain, CustomShader };
