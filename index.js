
const fs = require('fs');
const ImageParser = require("image-parser");
const name = process.argv[2];
const img = new ImageParser(`./img/${name}.png`);

const rgb_to_hex = c => {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

const rgb_to_rgb565 = (r, g, b) => {
    return hex_to_rgb565(parseInt('0x'+rgb_to_hex(r)), parseInt('0x'+rgb_to_hex(g)), parseInt('0x'+rgb_to_hex(b)));
}

const hex_to_rgb565 = (r,g,b) => {
    let col = (((r & 0xf8)<<8)+((g & 0xfc)<<3)+((b & 0xf8)>>3)).toString(16);
    while (col.length<4) {
        col = "0" + col;
    }
    return col = '0x' + col;
}

/**
 * Parse the PNG image data
 */
img.parse(err => {
    
    if (err) { return console.log(err); }
    
    const w = img.width();
    const h = img.height();
    const colours = [];
    const _colours = {};
    const pixels = [];

    /**
     * Iterate through each pixel in the image
     * -> If it is a new pixel colour, add it to our colour array
     * -> If it is the same colour as the previous pixel, increment a counter to try and save memory.
     */
    for ( y = 0; y<h; y++ ) {
        for ( x = 0; x<w; x++ ) {
            let px = img.getPixel(x,y);
            let c = rgb_to_rgb565(px.r, px.g, px.b);

            if (!(c in _colours)) {
                _colours[c] = colours.length;
                colours.push(c);
            }
            pixels.push(_colours[c]);
        }
    }
    
    let comp = [];
    let adj_count = 0;
    let last_col = pixels[0];
    let len = pixels.length-1;

    pixels.map( (p,i) => {
        if (p !== last_col) {
            comp.push({
                c: last_col,
                p: Number(adj_count)
            });
            adj_count = 0;
        } else {
            adj_count++;
        }

        last_col = p;

        if (i === len-1) {
            comp.push({
                c: last_col,
                p: Number(adj_count)
            });
        }
    });

    /**
     * A handy template for the out C header code we are exporting.
     */
    let buffer = `struct Image_${name} {\n`;
    buffer += `    uint16_t width = ${w};\n`;
    buffer += `    uint16_t height = ${h};\n`;
    buffer += `    uint16_t num_colours = ${colours.length};\n`;
    buffer += `    uint16_t num_pixels = ${comp.length};\n`;
    buffer += `    uint16_t colours[${colours.length}] = {${colours.map( (c,ci) => (`${c}`))}};\n`;
    buffer += `    uint16_t pixels[${comp.length}][2] = { ${comp.map( (cm, cmi) => (`{${cm.c},${cm.p}}`))}};\n\n`;
    buffer += `    uint16_t buffer_cursor = 0;\n`;
    buffer += `    uint16_t image_cursor = 0;\n`;
    buffer += `    uint16_t pixel_cursor = 0;\n\n`;
    buffer += `    void draw(uint16_t *buffer) {\n`;
    buffer += `        buffer_cursor = 0;\n`;
    buffer += `        for (image_cursor = 0; image_cursor < num_pixels; image_cursor++) {\n`;
    buffer += `            for (pixel_cursor = 0; pixel_cursor <= pixels[image_cursor][1]; pixel_cursor++) {\n`;
    buffer += `                if (pixels[image_cursor][0] > 0 ) buffer[buffer_cursor] = colours[pixels[image_cursor][0]];\n`;
    buffer += `                buffer_cursor++;\n`;
    buffer += `            }\n`;
    buffer += `        }\n`;
    buffer += `    }\n`;
    buffer += `} img_${name};\n`;

    /**
     * Save it to the ouptut directory.
     */
    fs.writeFileSync(`./output/${name}.h`, buffer);
});