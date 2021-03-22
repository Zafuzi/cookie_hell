import { hit_xy, log } from "./squids.js";
import { GFont } from "./gfont.js";

let hover_events = [];
let mouse_down_events = [];
let mouse_up_events = [];

// general function that loops through each element in the corresponding arrays
// and sets their event state when conditions are met for that event
let process_events = function() {
    mouse_up_events.forEach(element => {
        if( ! element.visible ) return;
        if( ! element.mouse_down ) element.click = false;
        let pos = { x: mx, y: my };
        let rect = { x: element.x, y: element.y, w: element.w, h: element.h };
        if( hit_xy(pos, rect) && mouse_up ) {
            element.mouse_up = true;
        } else {
            element.mouse_up = false;
        }
    })

    hover_events.forEach(element => {
        if( ! element.visible ) return;
        if( mouse_down || element.mouse_down ) return;
        let pos = { x: mx, y: my };
        let rect = { x: element.x, y: element.y, w: element.w, h: element.h };
        if( hit_xy(pos, rect) ) {
            element.hover = true;
        } else {
            element.hover = false;
        }
    })

    mouse_down_events.forEach(element => {
        if( ! element.visible ) return;
        if(element.mouse_down && element.mouse_up) {
            element.click = true; //click
        }
        element.mouse_down = false;
        let pos = { x: mx, y: my };
        let rect = { x: element.x, y: element.y, w: element.w, h: element.h };
        if( hit_xy(pos, rect) && mouse_down ) {
            element.mouse_down = true;
        } else {
            element.mouse_down = false;
        }
    })
}

let local_default_font = null;
let local_active_font = null;

let set_default_font = function(font) { local_default_font = font; }
let set_active_font = function(font) { local_active_font = font; }

let xpBlue = 0x597776FF;
let xpGreen = 0x81C070FF;
let xpBeige = 0xE9E8D6FF; 
let white = 0xFFFFFFFF;

let create = function(label="", x = 0, y = 0, w = 0, h = 0, handle_click = function() {}, font = local_default_font, activeFont = local_active_font ) {
    let o = {
        id: `btn_${seq()}`,
        label: label,
        x: x, y: y, w: w, h: h,
        hover: false, mouse_down: false, mouse_up: false,
        click: false,
        visible: true,
        font: font,
        activeFont: activeFont,
        handle_click: handle_click,
        draw() {
            let self = this;
            if( ! self.font ) { log( "you need to send me a font to display this button: ", self.id ); }
            if( ! self.activeFont ) { self.activeFont = self.font; }
            if(self.click) {
                self.handle_click();
            }
            if(self.hover) {
                if(self.mouse_down) {
                    rect_fill(xpBlue, self.x, self.y, self.w, self.h);
                    self.old_font = self.font;
                    self.font = self.activeFont;
                } else {
                    rect_fill(white, self.x, self.y, self.w, self.h);
                    rect_stroke(xpBlue, self.x, self.y, self.w, self.h);
                }
            } else {
                rect_fill(white, self.x, self.y, self.w, self.h);
            }

            GFont.draw(self.font, self.label, 
                self.x + self.w/2 - (( self.label.length * self.font.gw )/2), 
                self.y + (self.h / 2) - 16, 
                255);

            self.font = self.old_font || self.font;
        }
    }

    hover_events.push(o);
    mouse_down_events.push(o);
    mouse_up_events.push(o);
    return o;
}

let Buttons = { create, process_events, set_default_font, set_active_font };
export { Buttons as Buttons }
