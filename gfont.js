
let next_font_id = 1;

let fonts = [];

/*
    Ideah for Pseudo-variable width font using simple images:

    Group ascii chars into 3 widths:

        1. wide (W, M, etc)
        2. thin (I, 1, :, etc)
        3. normal (a, $, 0, etc.)

	(assuming font image has chars in a grid of 8x16 glyphs)
    wide = image_width / 8
    normal = wide * 0.7
    thin = wide * 0.4

    assume chars centered within their 8 x 16 cell space
    when drawing, just render based on ascii code and corresponding width.
    won't work with non-7-bit ascii chars, just assume those all to be normal width i guess.

*/

let pseudo_width = function( c ) {
	let s = String.fromCharCode( c );
	if( "!',.1:;I`il|".indexOf( s ) != -1 ) 
		return 0.9
	if( "#%%@MWmw_".indexOf( s ) != -1 ) 
		return 1.3;
	return 1;
}

let load = function( path, cw, ch ) {
	let id = next_font_id;
	let img = Kraken.image_load( path );
	let gw = Math.floor( img.w / cw );	// monospace char with
	let gh = Math.floor( img.h / ch );	// glyph height
	let fnt = { id, img, cw, ch, gw, gh };
	fonts.push( fnt );
	next_font_id += 1;
	return fnt;
};

let draw = function( fnt, txt, x, y, opa, opts = {} ) {
	let img = fnt.img;
	let cw = fnt.cw;
 	let ch = fnt.ch;
	let gw = fnt.gw;
	let gh = fnt.gh;
	let srcx = 0;
	let srcy = 0;
	let dx = x;
	let dy = y;
	let c;
	let i = 0;
	while( true ) {
		if( i >= txt.length ) {
			break;	// end of string
		}
		c = txt.charCodeAt( i );
		if( c == 10 ) {	// LF
			dx = x;
			dy += gh;
			i++;
			continue;
		}
		if( c < 32 || c > 126 ) {
			i++;
			continue;		// not a renderable character
		}
		srcx = ( c % cw ) * gw;
		srcy = Math.floor( c / cw ) * gh;
		Kraken.image_draw( img.id, dx, dy, gw, gh, 1, 0, 0, 0, srcx, srcy, gw, gh );
		i++;
		dx += gw;
		//dx += gw * pseudo_width( c );
	}
    return 1;
};

let free_all = function() {
	while( fonts.length > 0 )
		delete fonts.pop();
};

let GFont = { load, draw, free_all };

export { GFont as GFont }


