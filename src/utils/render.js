const chromaticAberration = (ctx, intensity, phase, width, height) => {
  const canvas = ctx.canvas;
  /* Use canvas to draw the original image, and load pixel data by calling getImageData
     The ImageData.data is an one-dimentional Uint8Array with all the color elements flattened. The array contains data in the sequence of [r,g,b,a,r,g,b,a...]
     Because of the cross-origin issue, remember to run the demo in a localhost server or the getImageData call will throw error
  */
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  for (let i = phase % 4; i < data.length; i += 4) {
    // Setting the start of the loop to a different integer will change the aberration color, but a start integer of 4n-1 will not work
    data[i] = data[i + 4 * intensity];
  }
  ctx.putImageData(imageData, 0, 0);
};

export const applyChromaticAberration = (display, intensity = 1, phase = 5) => {
  const canvas = display.getContainer();
  const context = canvas.getContext('2d');

  chromaticAberration(context, intensity, phase);
};

export const pulseAberration = (display, intensity, phase, callback = () => {}) => {
  let pulsing = true;
  const timeout = setTimeout(() => {
    pulsing = false;
    requestAnimationFrame(callback);
  }, 16);

  function pulse() {
    applyChromaticAberration(display, intensity, phase);

    if (pulsing) {
      requestAnimationFrame(pulse);
    }
  }

  requestAnimationFrame(pulse);

  return timeout;
};
