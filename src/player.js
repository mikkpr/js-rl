export const setupPlayer = async () => {
  return new Promise((resolve) => {
    const player = {
      x: 10,
      y: 10,
      char: '@',
      fg: '#a56',
      bg: '#000',
      render(display) {
        display.draw(this.x, this.y, this.char, this.fg, this.bg);
      },
      move(dx, dy) {
        this.x += dx;
        this.y += dy;
      },
    };
    resolve(player);
  });
};
