import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf: Buffer) {
  const table: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type: string, data: Buffer) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

export function createPng(
  width: number,
  height: number,
  getPixel: (x: number, y: number, w: number, h: number) => [number, number, number, number]
): Buffer {
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdr);

  const raw = Buffer.alloc((1 + width * 4) * height);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    raw[pos++] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      raw[pos++] = r;
      raw[pos++] = g;
      raw[pos++] = b;
      raw[pos++] = a !== undefined ? a : 255;
    }
  }

  const compressed = zlib.deflateSync(raw);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

// Generate stylized avatar image with distinct colors and initials circle
function generateAvatarPng(initials: string, color1: [number, number, number], color2: [number, number, number], size = 256): Buffer {
  return createPng(size, size, (x, y, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = w * 0.44;

    const t = (x + y) / (w + h);
    const bgR = Math.round(color1[0] * (1 - t) + color2[0] * t);
    const bgG = Math.round(color1[1] * (1 - t) + color2[1] * t);
    const bgB = Math.round(color1[2] * (1 - t) + color2[2] * t);

    // Vignette / border shading
    if (dist > radius) {
      // outer corner
      return [bgR, bgG, bgB, 255];
    }
    
    // Head & shoulders silhouette or stylized avatar circle
    const headRadius = radius * 0.38;
    const headDy = dy + radius * 0.18;
    const headDist = Math.sqrt(dx * dx + headDy * headDy);

    // Body curve
    const bodyDy = dy - radius * 0.55;
    const bodyDist = Math.sqrt((dx * 0.7) * (dx * 0.7) + bodyDy * bodyDy);

    if (headDist < headRadius || (bodyDist < radius * 0.65 && dy > radius * 0.1)) {
      return [255, 255, 255, 245];
    }

    // Outer ring accent
    if (dist > radius * 0.94) {
      return [255, 255, 255, 200];
    }

    return [bgR, bgG, bgB, 255];
  });
}

// Generate banner / module cover
function generateModuleCoverPng(title: string, c1: [number, number, number], c2: [number, number, number], w = 600, h = 340): Buffer {
  return createPng(w, h, (x, y, width, height) => {
    const tx = x / width;
    const ty = y / height;
    const r = Math.round(c1[0] * (1 - tx) + c2[0] * tx);
    const g = Math.round(c1[1] * (1 - tx) + c2[1] * tx);
    const b = Math.round(c1[2] * (1 - ty) + c2[2] * ty);

    // geometric grid accent
    const gridX = x % 40 === 0 ? 30 : 0;
    const gridY = y % 40 === 0 ? 30 : 0;
    const accent = Math.max(gridX, gridY);

    // decorative diagonal stripes in corner
    const diag = Math.floor((x + y) / 24) % 2 === 0 ? 15 : 0;
    const inCorner = (x > width * 0.7 && y < height * 0.5) ? diag : 0;

    return [
      Math.min(255, r + accent + inCorner),
      Math.min(255, g + accent + inCorner),
      Math.min(255, b + accent + inCorner),
      255
    ];
  });
}

const svgIcons: Record<string, string> = {
  'logoLandingPage.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="url(#kawira_grad)"/>
    <path d="M14 12V36M14 24L26 12M19 21L34 36" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="34" cy="14" r="3.5" fill="#C4F51B"/>
    <defs>
      <linearGradient id="kawira_grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stop-color="#704CF5"/>
        <stop offset="1" stop-color="#5937DD"/>
      </linearGradient>
    </defs>
  </svg>`,

  'logoLogin.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="url(#kawira_login_grad)"/>
    <path d="M14 12V36M14 24L26 12M19 21L34 36" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="34" cy="14" r="3.5" fill="#C4F51B"/>
    <defs>
      <linearGradient id="kawira_login_grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stop-color="#704CF5"/>
        <stop offset="1" stop-color="#FF4388"/>
      </linearGradient>
    </defs>
  </svg>`,

  'BellIcon.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>`,

  'BookIcon.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>`,

  'IconBook.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>`,

  'CalcIcon.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2"></rect>
    <line x1="8" y1="6" x2="16" y2="6"></line>
    <line x1="16" y1="14" x2="16" y2="18"></line>
    <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01"></path>
  </svg>`,

  'DownloadIcon.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>`,

  'GridIcon.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>`,

  'Icon (1).svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>`,

  'Icon.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>`,

  'IconArrowRight.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>`,

  'IconChat.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>`,

  'IconCheck.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>`,

  'IconClock.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>`,

  'IconDiscord.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>`,

  'IconLayers.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>`,

  'LayersIcon.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>`,

  'IconSearch.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>`,

  'IconStar.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#FFB800" stroke="#FFB800" stroke-width="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>`,

  'IconVideo.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"></polygon>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
  </svg>`,

  'IconWhatsApp.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
    <path d="M12.031 0C5.396 0 0 5.397 0 12.031c0 2.115.549 4.181 1.594 5.992L0 24l6.143-1.613a11.986 11.986 0 0 0 5.888 1.524h.005c6.634 0 12.031-5.398 12.031-12.032C24.067 5.397 18.665 0 12.031 0zm0 22.04c-1.815 0-3.593-.487-5.148-1.408l-.369-.219-3.824 1.003 1.02-3.728-.241-.383a9.988 9.988 0 0 1-1.534-5.274C1.935 6.467 6.466 1.935 12.031 1.935c2.695 0 5.23 1.05 7.137 2.956a10.038 10.038 0 0 1 2.955 7.139c0 5.565-4.531 10.01-10.092 10.01zm5.533-7.555c-.304-.152-1.8-.887-2.078-.988-.278-.102-.482-.152-.685.152-.203.304-.787.988-.964 1.191-.177.203-.355.228-.659.076-1.826-.913-3.023-1.624-4.227-3.693-.317-.546.318-.507.91-1.693.102-.203.051-.38-.025-.533-.076-.152-.685-1.65-.939-2.259-.247-.593-.498-.513-.685-.522-.177-.009-.38-.01-.584-.01-.203 0-.533.076-.812.38-.279.305-1.066 1.042-1.066 2.54 0 1.498 1.091 2.946 1.243 3.149.152.203 2.148 3.28 5.203 4.6 1.996.862 2.775.922 3.774.773.606-.09 1.8-.735 2.054-1.445.253-.71.253-1.318.177-1.445-.076-.127-.279-.203-.583-.355z"/>
  </svg>`,

  'SettingsIcon.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>`,

  'SheetsIcon.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="8" y1="13" x2="16" y2="13"></line>
    <line x1="8" y1="17" x2="16" y2="17"></line>
    <line x1="10" y1="9" x2="8" y2="9"></line>
  </svg>`,

  'TrendDownIcon.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF4388" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
    <polyline points="17 18 23 18 23 12"></polyline>
  </svg>`,

  'TrendUpIcon.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>`,

  'UsersIcon.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>`,

  'WalletIcon.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 7h-7a2 2 0 0 1-2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"></path>
    <path d="M16 14h.01"></path>
  </svg>`
};

function ensureDirs(dirs: string[]) {
  dirs.forEach(d => {
    if (!fs.existsSync(d)) {
      fs.mkdirSync(d, { recursive: true });
    }
  });
}

const targetDirs = [
  path.resolve(process.cwd(), 'public/assets'),
  path.resolve(process.cwd(), 'assets')
];

ensureDirs(targetDirs);

// Write SVG icons
for (const [filename, content] of Object.entries(svgIcons)) {
  for (const dir of targetDirs) {
    fs.writeFileSync(path.join(dir, filename), content.trim(), 'utf8');
  }
}

// Generate team members and user avatars
const avatars: Record<string, { initials: string; c1: [number, number, number]; c2: [number, number, number] }> = {
  'Nasywa.png': { initials: 'NS', c1: [112, 76, 245], c2: [89, 55, 221] },
  'Ayunda.png': { initials: 'AP', c1: [255, 67, 136], c2: [112, 76, 245] },
  'Faza.jpg': { initials: 'FF', c1: [79, 70, 229], c2: [67, 56, 202] },
  'Novy.jpeg': { initials: 'NR', c1: [236, 72, 153], c2: [168, 85, 247] },
  'Nadya.png': { initials: 'NA', c1: [112, 76, 245], c2: [255, 67, 136] },
  'fotoProfil.jpg': { initials: 'KW', c1: [112, 76, 245], c2: [59, 130, 246] },

  // Mentors
  'Image (Aditya Ramadhan).png': { initials: 'AR', c1: [16, 185, 129], c2: [5, 150, 105] },
  'Image%20(Aditya%20Ramadhan).png': { initials: 'AR', c1: [16, 185, 129], c2: [5, 150, 105] },
  'Image (Budi Santoso).png': { initials: 'BS', c1: [14, 165, 233], c2: [2, 132, 199] },
  'Image%20(Budi%20Santoso).png': { initials: 'BS', c1: [14, 165, 233], c2: [2, 132, 199] },
  'Image (Kawira Anindya).png': { initials: 'KA', c1: [249, 115, 22], c2: [234, 88, 12] },
  'Image%20(Kawira%20Anindya).png': { initials: 'KA', c1: [249, 115, 22], c2: [234, 88, 12] },
  'Image (Sari Indah Pertiwi).png': { initials: 'SP', c1: [168, 85, 247], c2: [147, 51, 234] },
  'Image%20(Sari%20Indah%20Pertiwi).png': { initials: 'SP', c1: [168, 85, 247], c2: [147, 51, 234] },
  'Image (Speaker).png': { initials: 'GS', c1: [234, 179, 8], c2: [202, 138, 4] },
  'Image%20(Speaker).png': { initials: 'GS', c1: [234, 179, 8], c2: [202, 138, 4] }
};

for (const [filename, info] of Object.entries(avatars)) {
  const buf = generateAvatarPng(info.initials, info.c1, info.c2);
  for (const dir of targetDirs) {
    fs.writeFileSync(path.join(dir, filename), buf);
  }
}

// Generate Module covers
const modules: Record<string, { title: string; c1: [number, number, number]; c2: [number, number, number] }> = {
  'modul1.png': { title: 'Riset Pasar', c1: [112, 76, 245], c2: [89, 55, 221] },
  'modul2.png': { title: 'Business Model Canvas', c1: [255, 67, 136], c2: [112, 76, 245] },
  'modul3.png': { title: 'Digital Marketing', c1: [14, 165, 233], c2: [112, 76, 245] },
  'modul4.png': { title: 'Pembukuan Praktis', c1: [16, 185, 129], c2: [14, 165, 233] },
  'modul5.png': { title: 'Pitching & Funding', c1: [249, 115, 22], c2: [255, 67, 136] }
};

for (const [filename, info] of Object.entries(modules)) {
  const buf = generateModuleCoverPng(info.title, info.c1, info.c2);
  for (const dir of targetDirs) {
    fs.writeFileSync(path.join(dir, filename), buf);
  }
}

console.log('All assets generated successfully in assets/ and public/assets/');
