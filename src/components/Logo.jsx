/** "RB" monogram in a rounded square. Takes its colour from `currentColor`. */
export default function Logo({ size = 36, className = '', title = 'Raghul Babu' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}
    >
      <rect
        x="1"
        y="1"
        width="38"
        height="38"
        rx="10"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1.5"
      />
      <text
        x="20"
        y="25.5"
        textAnchor="middle"
        fontFamily="'Geist Mono', ui-monospace, monospace"
        fontWeight="600"
        fontSize="14"
        letterSpacing="0.5"
        fill="currentColor"
      >
        RB
      </text>
    </svg>
  );
}
