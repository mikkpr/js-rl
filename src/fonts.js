import ibm_vga8_eot from './assets/ibm_vga8.eot';
import ibm_vga8_ttf from './assets/ibm_vga8.ttf';
import ibm_vga8_woff from './assets/ibm_vga8.woff';
import ibm_vga8_woff2 from './assets/ibm_vga8.woff2';

const fontCSS = `
@font-face {
  font-family: 'IBMVGA8';
  src: url(.${ibm_vga8_eot});
  src: url(.${ibm_vga8_eot}?#iefix) format('embedded-opentype'),
      url(.${ibm_vga8_woff2}) format('woff2'),
      url(.${ibm_vga8_woff}) format('woff'),
      url(.${ibm_vga8_ttf}) format('truetype');
  font-weight: normal;
  font-style: normal;
}
`;

const fontStyles = document.createElement('style');
fontStyles.innerHTML = fontCSS;
document.body.appendChild(fontStyles);