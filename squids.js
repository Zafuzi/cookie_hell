// - GLOBALS -
globalThis.seqNum = 0;
globalThis.seq = function() { seqNum = seqNum + 1; return seqNum; }
globalThis.mx = 0; globalThis.my = 0;
// convert and return json as object or null if error
globalThis.j2o = function(j) { try { return JSON.parse(j) } catch(e) { return null } }
// convert and return object as JSON or null if exception
globalThis.o2j = function(o) { try { return JSON.stringify(o) } catch(e) { return null } }
globalThis.draw_start = function( color ) { Kraken.draw_start( color ); }
globalThis.draw_end = function() { Kraken.draw_end(); }

globalThis.is_full_screen = 0;
globalThis.toggle_full_screen = function() {
	globalThis.is_full_screen = (globalThis.is_full_screen + 1) % 2;
	Kraken.full_screen( globalThis.is_full_screen );
}

globalThis.image_load = function( path ) {
	return Kraken.image_load( path );
}

// TODO: (jh) nuke this shit
globalThis.deprecated_image_draw = function( img, x, y, sx, sy, rotation = 0, opacity = 255 ) {
	return image_draw_advanced( img, 0, 0, img.w, img.h, x, y, img.w * sx, img.h * sy, (img.w * sx)/2, (img.h * sy)/2, rotation, opacity);
}

globalThis.image_draw= function( img, x, y, scl, opa = 1, rot = 0 ) {
	// center image on x,y given
	x -= (img.w * scl) / 2;
	y -= (img.h * scl) / 2;
	Kraken.image_draw( img.id, x, y, img.w * scl, img.h * scl, opa, rot );
}

globalThis.music_load = function( path ) { return Kraken.music_load( path ); }
globalThis.music_play = function( music, volume ) { return Kraken.music_play( music.id, volume ); }
globalThis.music_volume = function( volume ) { return Kraken.music_volume( volume ); }
globalThis.music_pause = function( ) { return Kraken.music_pause( ); }
globalThis.music_resume = function( ) { return Kraken.music_resume( ); }
globalThis.sound_load = function( path ) { return Kraken.sound_load( path ); }
globalThis.sound_play = function( sound, volume, loops = 0 ) { return Kraken.sound_play( sound.id, volume, loops ); }
globalThis.sound_volume = function( sound, volume ) { return Kraken.sound_volume( sound.id, volume ); }
globalThis.sound_pause = function( ) { return Kraken.sound_pause( ); }
globalThis.sound_resume = function( ) { return Kraken.sound_resume( ); }
globalThis.rect_fill = function( color, x, y, w, h ) { return Kraken.rect_fill( color, x, y, w, h ); }
globalThis.rect_stroke = function( color, x, y, w, h ) { return Kraken.rect_stroke( color, x, y, w, h ); }

// The heart and soul of default squid
globalThis.sq_create = function(img = {w:0, h:0}, x = 0, y = 0) {
	let o = {
		id: `sq_${seq}`,
		img: img,
		x: x, y: y,
		sx: 1, sy: 1,
		r: 0, opa: 1,
		vx: 0, vy: 0, vf: 1,
		alive: true,
		tick() {
			let self = this;
			if( ! self.alive ) return;
			return;
		},
		draw() {
			let self = this;
			if( ! self.alive ) return;
			if( ! self.img.id ) return;
			image_draw(self.img, self.x, self.y, self.sx, self.opa, self.rot);
		}
	}
	return o;
}

// return a number between 0 and n -1 inclusive 
export function roll(n) { return Math.floor( Math.random() * n ); }
// return true or false randomly
export function coin_flip() { return roll(2) == 0; }

export function display( w, h ) {
	return Kraken.display( w, h );
}

export function log( s ) {
	//squids( "log", s );
	return Kraken.log( s );
}
export function sleep( ms ) {
	return Kraken.sleep( ms );
}

export function event_next() {
	let result = Kraken.event_next();
	if( ! result.type ) { result.type = ""; }
	return result;
}

export function event_wait() {
	return Kraken.event_wait();
}

// TODO: (jh) nuke this shit
export function image_draw_advanced( img, srcx, srcy, srcw, srch, destx, desty, destw, desth, pivot_x, pivot_y, rotation, opacity ) { 
	return Kraken.image_draw( img.id, destx, desty, destw, desth, opacity, rotation, pivot_x, pivot_y, srcx, srcy, srcw, srch );
}
export function toInt(n) { return n | 0; }
// determine if position 1 is inside the bounds of rectangle
export function hit_xy(pos = {x: 0, y: 0}, rect = {x:0, y:0,w:0, h:0}) {
	if( pos.x < rect.x ) return false; 				// left
	if( pos.x > rect.x + rect.w ) return false;		// right
	if( pos.y < rect.y ) return false;				// above
	if( pos.y > rect.y + rect.h ) return false;		// below
	return true;
}

globalThis.mouse_down = false;
globalThis.mouse_up = true;
globalThis.quit = false;
globalThis.paused = true;
