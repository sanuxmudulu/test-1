// Shared badge icon — a white ribbon/bookmark shape with a blue-to-indigo
// gradient heart, matching the icon used on the intro and final screens.
export const BADGE_ICON_SVG = `
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="heartGradient" x1="4" y1="6" x2="18" y2="16" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#4e7fe0"/>
        <stop offset="1" stop-color="#4a3fd6"/>
      </linearGradient>
    </defs>
    <path d="M8 3 L16 3 A2 2 0 0 1 18 5 L18 17 L12 13 L6 17 L6 5 A2 2 0 0 1 8 3 Z" fill="#ffffff"/>
    <path d="M12 12.3c-2.6-1.7-4-3.1-4-4.9 0-1.3.9-2.2 2.1-2.2.8 0 1.5.4 1.9 1.1.4-.7 1.1-1.1 1.9-1.1 1.2 0 2.1.9 2.1 2.2 0 1.8-1.4 3.2-4 4.9z" fill="url(#heartGradient)"/>
  </svg>
`;
