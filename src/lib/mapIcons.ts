import L from 'leaflet';

/**
 * Lucide icon SVG path data registry.
 * Each entry is the `d` attribute from a 24x24 viewBox Lucide icon.
 */
const iconPaths: Record<string, string> = {
  // Store / shopping
  'store': 'M2 7l1.4-3.5A2 2 0 0 1 5.2 2h13.6a2 2 0 0 1 1.8 1.5L22 7 M2 7h20 M2 7v2a3 3 0 0 0 6 0 M8 9a3 3 0 0 0 6 0 M14 9a3 3 0 0 0 6 0 M22 7v2a3 3 0 0 1-6 0 M2 11v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-9',
  'shopping-bag': 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0',

  // Food & drink
  'coffee': 'M17 8h1a4 4 0 1 1 0 8h-1 M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z M6 2v2 M10 2v2 M14 2v2',
  'utensils': 'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2 M7 2v20 M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7',
  'wine': 'M8 22h8 M12 11v11 M7.5 2h9L12 11z',

  // Health & wellness
  'heart': 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
  'cross': 'M11 2a2 2 0 0 0-2 2v6H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h5v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-6h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z',
  'activity': 'M22 12h-4l-3 9L9 3l-3 9H2',

  // Entertainment
  'music': 'M9 18V5l12-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  'palette': 'M2 12c.6.5 1.2 1 2.5 1C7 13 7 11 9.5 11c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 M12 2a10 10 0 1 0 10 10 M12 2v4 M2 12h4',

  // Calendar / events
  'calendar': 'M16 2v4 M8 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  'calendar-days': 'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2z M8 14h.01 M12 14h.01 M16 14h.01 M8 18h.01 M12 18h.01 M16 18h.01',
  'party-popper': 'M5.8 11.3L2 22l10.7-3.79 M4 3h.01 M22 8h.01 M15 2h.01 M22 20h.01 M22 2l-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10 M22 13l-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.11.7-.72 1.22-1.43 1.22H17 M11 2l.33.82c.34.86-.2 1.82-1.11 1.98v0C9.52 4.9 9 5.52 9 6.23V7',
  'ticket': 'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z M13 5v2 M13 17v2 M13 11v2',

  // Location
  'map-pin': 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  'navigation': 'M3 11l19-9-9 19-2-8-8-2z',

  // Nature / cannabis
  'leaf': 'M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 20 .5 20 .5s-1 5-4 8c-2 2-4 3.5-5.5 4.5 M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12',
  'sprout': 'M7 20h10 M10 20c5.5-2.5.8-6.4 3-10 M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z',

  // General
  'star': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  'zap': 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  'flame': 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14 0-5.5 3-7.5a14 14 0 0 0 1 7c1.33 2.56 2 5.02 2 8a6 6 0 0 1-12 0c0-1.57.36-2.85 1-4 .24-.43.7-.7 1.2-.7h.3c.8 0 1.5.65 1.5 1.45 0 .5-.2.95-.5 1.25z',
  'building': 'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2 M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2 M10 6h4 M10 10h4 M10 14h4 M10 18h4',
  'users': 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  'cannabis': 'M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 20 .5 20 .5s-1 5-4 8c-2 2-4 3.5-5.5 4.5 M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12',
};

// Fallback icon (simple circle dot)
const FALLBACK_PATH = 'M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0';

function getIconPath(name: string): string {
  // Try exact match, then common aliases
  if (iconPaths[name]) return iconPaths[name];
  // Try lowercase/kebab normalization
  const normalized = name.toLowerCase().replace(/\s+/g, '-');
  if (iconPaths[normalized]) return iconPaths[normalized];
  return FALLBACK_PATH;
}

/**
 * Creates a Leaflet icon with a colored circular background and a Lucide icon inside.
 */
export function createIconMarker(
  iconName: string,
  bgColor: string,
  options?: { glow?: boolean; size?: number }
): L.Icon {
  const size = options?.size || 40;
  const glow = options?.glow || false;
  const glowSize = size + 8;
  const viewBox = glow ? `0 0 ${glowSize} ${glowSize}` : `0 0 ${size} ${size}`;
  const cx = glow ? glowSize / 2 : size / 2;
  const cy = cx;
  const r = (size / 2) - 3;
  const path = getIconPath(iconName);

  // Scale icon to fit inside circle (24→~18px mapped to marker size)
  const iconScale = (size * 0.45) / 24;
  const iconOffset = cx - (12 * iconScale);

  const glowCircle = glow
    ? `<circle cx="${cx}" cy="${cy}" r="${r + 4}" fill="none" stroke="${bgColor}" stroke-width="2" opacity="0.4">
         <animate attributeName="r" values="${r + 2};${r + 6};${r + 2}" dur="2s" repeatCount="indefinite"/>
         <animate attributeName="opacity" values="0.4;0.15;0.4" dur="2s" repeatCount="indefinite"/>
       </circle>`
    : '';

  const svg = `<svg width="${glow ? glowSize : size}" height="${glow ? glowSize : size}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
    ${glowCircle}
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${bgColor}" stroke="white" stroke-width="3"/>
    <g transform="translate(${iconOffset}, ${iconOffset}) scale(${iconScale})" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="${path}"/>
    </g>
  </svg>`;

  const finalSize = glow ? glowSize : size;

  return new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(svg),
    iconSize: [finalSize, finalSize],
    iconAnchor: [finalSize / 2, finalSize],
    popupAnchor: [0, -finalSize],
  });
}

/**
 * Creates a partner store marker with status-based gradient + store icon.
 */
export function createPartnerMarker(status: 'exclusive' | 'featured' | 'verified'): L.Icon {
  const colors: Record<string, { primary: string; secondary: string }> = {
    exclusive: { primary: '#c4a052', secondary: '#8b7355' },
    featured: { primary: '#7a9a7a', secondary: '#5a7a5a' },
    verified: { primary: '#6b7280', secondary: '#4b5563' },
  };
  const { primary, secondary } = colors[status] || colors.verified;
  const path = getIconPath('store');
  const size = 40;
  const cx = size / 2;
  const r = (size / 2) - 3;
  const iconScale = (size * 0.45) / 24;
  const iconOffset = cx - (12 * iconScale);

  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pg-${status}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${primary}"/>
        <stop offset="100%" style="stop-color:${secondary}"/>
      </linearGradient>
    </defs>
    <circle cx="${cx}" cy="${cx}" r="${r}" fill="url(#pg-${status})" stroke="white" stroke-width="3"/>
    <g transform="translate(${iconOffset}, ${iconOffset}) scale(${iconScale})" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="${path}"/>
    </g>
  </svg>`;

  return new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(svg),
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}
