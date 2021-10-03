# PNG-to-framebuffer

A handy tool for converting PNG images into RGB565 encoded uint16_t image buffers for use on embedded electronics (such as ST7789 / ILI9341 displays). It ouputs header files containing compressed RGB565 buffer data that can be drawn to a framebuffer (which is a fairly well supported practice for most displays). Out of the box this script is configured for displays with a resolution of 240x240.

#### Example

Place your image(s) into the `img` directory run the script with the filename (without the extension) as the first parameter. It will then export the header file into the `output` directory.

```bash
node index example
```

>  `/img/example.png` ➜ `/output/example.h`

#### Using it with arduino

Simply import the header file into your project, include it at the top of your sketch and use the `draw` function it exposes to write the data to your frame buffer. Here is a example without any of the actual screen initialisation stuff:

```c
#include "output/example.h"

// Create a buffer, e.g.
uint16_t buffer[240*240];

void setup() {
  // Call the draw function from our header, e.g.
	img_example.draw(buffer);
}
```

#### Roadmap

- I am working on a version where you can specify clipping rects for when you only need to draw part of your image to part of the buffer / screen.
- Transparency and alpha blending
- Some unit tests etc.
