import { motion, useReducedMotion } from 'motion/react';
import { EASE } from '../hooks.js';

const HEXES = [
  '280,404 306,389 306,359 280,344 254,359 254,389',
  '228,374 254,359 254,329 228,314 202,329 202,359',
  '332,374 358,359 358,329 332,314 306,329 306,359',
];
const NODES = [
  [280, 404], [306, 389], [254, 389], [306, 359], [254, 359], [202, 329], [228, 314],
  [202, 359], [332, 314], [358, 329], [358, 359], [228, 374], [332, 374],
];

/**
 * RB monogram. Colour comes from `currentColor`.
 * `draw` animates the rings and hexagons on when it scrolls into view.
 */
export default function Logo({ size = 40, tagline = true, draw = false, className = '', title = 'Raghul Babu monogram' }) {
  const reduce = useReducedMotion();
  const animate = draw && !reduce;
  const stroke = (delay, duration = 1.6) =>
    animate
      ? { initial: { pathLength: 0, opacity: 0 }, whileInView: { pathLength: 1, opacity: 1 }, viewport: { once: true, amount: 0.4 }, transition: { pathLength: { delay, duration, ease: EASE }, opacity: { delay, duration: 0.2 } } }
      : {};
  const fade = (delay, extra = {}) =>
    animate
      ? { initial: { opacity: 0, ...extra.from }, whileInView: { opacity: 1, ...extra.to }, viewport: { once: true, amount: 0.4 }, transition: { delay, duration: 0.8, ease: EASE } }
      : {};

  return (
    <svg width={size} height={size} viewBox="0 0 560 560" className={className}
      {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}>
      <motion.circle cx="280" cy="280" r="248" fill="none" stroke="currentColor" strokeWidth="5" {...stroke(0, 1.8)} />
      <motion.circle cx="280" cy="280" r="232" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" {...stroke(0.25, 1.8)} />
      <motion.text x="280" y="322" textAnchor="middle" fontFamily="Cinzel, Georgia, serif" fontWeight="700" fontSize="150" letterSpacing="6" fill="currentColor"
        {...fade(0.6, { from: { y: 20 }, to: { y: 0 } })}>
        RB
      </motion.text>
      <g fill="none" stroke="currentColor" strokeWidth="1.8" opacity="0.9">
        {HEXES.map((pts, i) => <motion.polygon key={pts} points={pts} {...stroke(0.9 + i * 0.15, 1.1)} />)}
      </g>
      <g fill="currentColor">
        {NODES.map(([cx, cy], i) => (
          <motion.circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4"
            {...(animate ? { initial: { scale: 0 }, whileInView: { scale: 1 }, viewport: { once: true, amount: 0.4 }, transition: { delay: 1.4 + i * 0.04, type: 'spring', stiffness: 400, damping: 14 } } : {})}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
        ))}
      </g>
      {tagline && (
        <motion.text x="280" y="196" textAnchor="middle" fontFamily="'Cormorant Garamond', Georgia, serif" fontStyle="italic" fontSize="26" letterSpacing="3" fill="#B9AE95"
          {...fade(1.9)}>
          Developer &amp; Rider
        </motion.text>
      )}
    </svg>
  );
}
