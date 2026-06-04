import { unsafeCSS } from '@spectrum-web-components/base';
import swcStyles from '@swc-uxp-internal/thumbnail/src/thumbnail.css.js';
import uxpStyles from './uxp-thumbnail.css.js';
const styles = unsafeCSS(swcStyles.toString() + '\n' + uxpStyles.toString());
export default styles;
