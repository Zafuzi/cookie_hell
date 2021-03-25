import { display, sleep, log, coin_flip, toInt, event_next, hit_xy, roll } from "squids.js";
import { GFont } from "gfont.js";
import { Buttons } from "buttons.js";

let T = 0;
let game_title = "Idle RPG";

const FPS = 120; 
var fps = FPS;
const canvas = {width: 800, height: 800}

let tick, draw;

var dbg = [];

var gold = 0;
var clicks = 0;
var upgrade_multiplier_cost = 10;
var multiplier = 1;
var multiplier_increase_rate = 0.5;
var auto_clicks = 0;
var auto_click_cost = 5;
var auto_click_rate = 1000; // ie 1 time per 100 ticks
var auto_click_rate_increase_cost = 100;

display( canvas.width, canvas.height );

let img_squid = image_load( "data/purple_squid.png" );
let img_title = image_load( "data/title_text.png" );
let bubbles = image_load( "data/bubbles.png" );
let bizcat = GFont.load(  "data/bizcat.png", 16, 16 );
let bizcat_white = GFont.load(  "data/bizcat_white.png", 16, 16 );
let bizcat_grey = GFont.load(  "data/bizcat_grey.png", 16, 16 );

let coin = sound_load("data/coin.wav");
let kill = sound_load("data/killed_zombie.wav");
let music = music_load("data/music.mp3");

Buttons.set_default_font( bizcat );
Buttons.set_active_font( bizcat_grey );

let monsters = [
	{ name: "Desert Slime", hp: 600, src: "data/monsters/desert/slime.png", img: undefined },
	{ name: "Desert Slug", hp: 1800, src: "data/monsters/desert/slug.png", img: undefined },
	{ name: "Forest Slime", hp: 800, src: "data/monsters/forest/slime.png", img: undefined },
	{ name: "Forest Slug", hp: 2000, src: "data/monsters/forest/slug.png", img: undefined },
	{ name: "Mountain Slime", hp: 1000, src: "data/monsters/mountain/slime.png", img: undefined },
	{ name: "Water Slime", hp: 3200, src: "data/monsters/water/slime.png", img: undefined }
];

monsters.forEach( m => {
	m.img = image_load( m.src );
})

let current_monster = 0;
let monster_img = monsters[ current_monster ].img;
let monster = sq_create( monster_img, 0, 0 );
monster.name = "Desert Slime";
monster.hp = monsters[ current_monster ].hp;
monster.w = monster_img.w * monster.sx;
monster.h = monster_img.h * monster.sy;

monster.handle_click = function() {
	let self = this;
	self.hp--;
	self.opa = 0.5; 
	clicks++;
	gold += multiplier;
	if( self.hp <= 0 ) {
		// bonus for killing the monster
		gold += (monsters[ current_monster ].hp * multiplier) / 5;
		current_monster++;
		if( current_monster > monsters.length - 1 ) { current_monster = 0; }
		monster.name = monsters[ current_monster ].name; 
		monster.img = monsters[ current_monster ].img; 
		monster.hp = monsters[ current_monster ].hp * (multiplier * auto_clicks);
		sound_play(kill, 0.5);
	}
}

hover_events.push(monster);
mouse_down_events.push(monster);
mouse_up_events.push(monster);

monster.tick = function() { 
	let self = this;
	if( ! self.alive ) { return; }

	self.x = canvas.width / 2 - (self.img.w * self.sx) / 2;
	self.y = canvas.height / 2 - (self.img.h * self.sy) / 2;
	self.w = self.img.w * self.sx;
	self.h = self.img.h * self.sy;

	if(self.click) {
		self.handle_click();
	}

	if( self.opa < 1 && T % 5 == 0) {
		self.opa += 0.1;
	}

	self.sy = self.sx;
}

monster.draw = function() {
	let self = this;
	if( ! self.alive ) { return; }
	image_draw( self.img, self.x, self.y, self.sx, self.opa, self.rot );
	//rect_stroke( 0xFF3333FF, self.x, self.y, self.img.w * self.sx, self.img.h * self.sy );
	let label = `${self.name} - HP: ${parseFloat(self.hp).toFixed(2)}`;
	GFont.draw( bizcat_white, label, self.x + (self.img.w*self.sx/2) - (label.length * bizcat_white.gw) / 2, self.y + self.img.h*self.sy );
}

let play_button = Buttons.create( "play", 10, canvas.height - 54 - 54, 250, 44, () => { paused = false; tick = game_tick; draw = game_draw; });
let quit_button = Buttons.create( "quit", 10, canvas.height - 54, 250, 44, () => { quit = true; });
let pause_button = Buttons.create( "menu", 10, canvas.height - 54, 150, 44, () => { paused = true; tick = menu_tick; draw = menu_draw; });

let multiplier_increase_button = Buttons.create( `Increase Multiplier - ${toInt(upgrade_multiplier_cost)} gold`, 170, canvas.height - 54, 500, 44, () => { 
	if( gold >= upgrade_multiplier_cost ) {
		multiplier += multiplier_increase_rate; gold -= upgrade_multiplier_cost
		upgrade_multiplier_cost += (multiplier * 10);
		let label = `Increase Multiplier - ${toInt(upgrade_multiplier_cost)} gold`;
		multiplier_increase_button.label = label;
		multiplier_increase_button.w = label.length * multiplier_increase_button.font.gw + 20;
	}
});

let label = `Auto Click - ${toInt(auto_click_cost)} gold`;
let auto_click_button = Buttons.create( label, multiplier_increase_button.w + pause_button.w + 30, canvas.height - 54, label.length * bizcat.gw + 20, 44, () => { 
	if( gold >= auto_click_cost ) {
		auto_clicks += 1; gold -= auto_click_cost;
		auto_click_cost += (multiplier * 30);
		let label = `Auto Click - ${toInt(auto_click_cost)} gold`;
		auto_click_button.label = label;
		auto_click_button.w = label.length * auto_click_button.font.gw + 20;
	}
});

label = `Auto Click Rate - ${toInt(auto_click_rate_increase_cost)} gold`;
let auto_click_rate_increase_cost_button = Buttons.create( label, multiplier_increase_button.w + pause_button.w + auto_click_button.w + 30, canvas.height - 54, label.length * bizcat.gw + 20, 44, () => { 
	if( gold >= auto_click_rate_increase_cost ) {
		if( auto_click_rate == 1 ) {
			auto_click_rate = 1; // max ms
			auto_click_rate_increase_cost_button.alive = false;
			auto_click_rate_increase_cost_button.visible = false;
			return;
		}
		auto_click_rate -= 1; 
		gold -= auto_click_rate_increase_cost;
		auto_click_rate_increase_cost += (multiplier * 40);
		let label = `Auto Click Rate - ${toInt(auto_click_rate_increase_cost)} gold`;
		auto_click_rate_increase_cost_button.label = label;
		auto_click_rate_increase_cost_button.w = label.length * auto_click_rate_increase_cost_button.font.gw + 20;
	}
});

function tick_splash() { }

let o = 0;
let odir = 1;
let y = 0;

let grvty = 1;
let vel_y = 0;
let acc_y = 0;

function draw_splash() {
	dbg.push(T);
	if( T > 100 ) {

		if( o >= 1 ) {
			odir *= -1;
		}

		o += odir / 200;

		if( o <= 0 ) {
			o = 0;
			tick = menu_tick;
			draw = menu_draw;
		}
	} 

	// draw the squid
	let scl = 0.4;
	let dw = img_squid.w * scl;
	let dh = img_squid.h * scl;
	let dx = ( canvas.width * 0.5 ) - dw / 2;
	let dy = ( canvas.height * 0.3 ) - dh / 2;
	dy += ( acc_y * 0.010 );
	acc_y += vel_y;
	vel_y += grvty
	if( vel_y >= 55 || vel_y <= -55)
		grvty = -grvty;
	image_draw( img_squid, dx, dy, scl, o, 0 );

	// draw bubbles
	dy = ( canvas.height * 0.3 );
	y -= (1/2);
	image_draw( bubbles, dx, dy + y, 1, o, 0);

	// draw title text
	dx = canvas.width / 2 - img_title.w/2;
	dy = canvas.height * 0.6 - img_title.h/2;

	image_draw( img_title, dx, dy, 1, o, 0 );

	//dbg_draw();
}

function menu_tick() {
	play_button.x = (canvas.width * 0.5) - play_button.w/2;
	play_button.y = (canvas.height * 0.5) - 54;
	quit_button.x = (canvas.width * 0.5) - quit_button.w/2;
	quit_button.y = (canvas.height * 0.5);
}
function menu_draw() {
	GFont.draw( bizcat_white, game_title, canvas.width * 0.5 - (game_title.length * bizcat_white.gw) / 2, canvas.height * 0.5 - 54 - 54);
	play_button.draw();
	quit_button.draw();
	//dbg_draw();
}

function game_tick() {
	pause_button.y = canvas.height - 54;
	multiplier_increase_button.y = canvas.height - 54;
	auto_click_button.x = multiplier_increase_button.w + pause_button.w + 30
	auto_click_button.y = canvas.height - 54;
	auto_click_rate_increase_cost_button.x = multiplier_increase_button.w + pause_button.w + auto_click_button.w + 40;
	auto_click_rate_increase_cost_button.y = canvas.height - 54;

	if( T % auto_click_rate == 0 ) {
		for( let i = 0; i < auto_clicks; i++) {
			monster.handle_click();
		}
	}
	if( mouse_down && monster.hover ) {
		if( T % 20 == 0 ) {
			monster.handle_click();
		}
	}
	monster.tick();
}
function game_draw() {

	pause_button.draw();
	multiplier_increase_button.draw();
	auto_click_button.draw();
	if( auto_click_rate_increase_cost_button.alive ) {
		auto_click_rate_increase_cost_button.draw();
	}
	monster.draw();

	let text = "Click to do damage";
	if( clicks < 25 ) {
		GFont.draw( bizcat_white, text, canvas.width / 2 - (text.length * bizcat_white.gw) / 2, canvas.height/2 + 200 );
	}

	dbg[1] = `Gold: ${toInt(gold)}`;
	dbg[2] = `Clicks: ${clicks}`;
	dbg[3] = `Multiplier: x${parseFloat(multiplier).toFixed(1)}`;
	dbg[4] = `Auto Clicks ${auto_clicks}`;
	dbg[5] = `Auto Click Rate ${1000 - toInt(auto_click_rate)}`;
	dbg_draw();
}

function dbg_draw() {
	let dy = 10;
	dbg.forEach(m => {
		GFont.draw( bizcat_white, (""+m), 10, dy, 1);
		dy+=42;
	})
}

function loop() {
	T++;
	//dbg[0] = T;
	tick();
	draw_start(0x122435FF);
	draw();
	draw_end();
}

let skip_splash = false;
function FPS_LOCK() {
    Kraken.full_screen( 0 );
	while( true ) {
		if( quit ) break;
		while(true) {
			let event = event_next();
			let a = event.type;
			if( a == "" ) { break; }
			if( a == "Q" ) { return; }
			if( a == "M" ) { 
				mx = event.x;
				my = event.y;
			}
			if( a == "B" ) { 
				mouse_down = true;
				mouse_up = false;
			}
			if( a == "b" ) { 
				mouse_down = false;
				mouse_up = true;
			}
			if( a == "R" ) // window event
			{
				if(toInt(event.d1) > 0) {
					canvas.height = event.d1;
				}
				if(toInt(event.d2) > 0) {
					canvas.width = event.d2;
				}
			}
			//log( o2j(event) );
		}

		Buttons.process_events();
		loop();
		dbg = [];
		sleep( 1000 / FPS );
	}
}

tick = skip_splash ? menu_tick : tick_splash;
draw = skip_splash ? menu_draw : draw_splash;

//music_play(music, 0.01);
FPS_LOCK();
log( "I welcome thee, oh merciful oblivion." )

