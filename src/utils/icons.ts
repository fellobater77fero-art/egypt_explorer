export const Icons = {
  logo: (size = 32, color = '#d4af37') => `
    <svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Pyramids -->
      <polygon points="14,34 26,10 38,34" fill="${color}" fill-opacity="0.9" />
      <polygon points="26,10 38,34 33,34 26,16" fill="#aa851d" />
      <polygon points="6,34 16,16 26,34" fill="${color}" fill-opacity="0.75" />
      <!-- Nile River waves -->
      <path d="M4 40C12 37 20 43 28 40C36 37 44 43 46 40" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" />
      <path d="M6 44C14 41 22 47 30 44C38 41 42 45 44 44" stroke="#0284c7" stroke-width="2" stroke-linecap="round" />
      <!-- Felucca Sail -->
      <path d="M34 38L34 24L44 32Z" fill="#ffffff" />
      <path d="M34 24L34 38" stroke="#aa851d" stroke-width="1.5" />
      <path d="M32 38L45 38C44 40 42 41 34 41C31 41 32 39 32 38Z" fill="#78350f" />
      <!-- Radiant Sun -->
      <circle cx="38" cy="10" r="4.5" fill="#f59e0b" />
      <circle cx="38" cy="10" r="7" stroke="#f59e0b" stroke-width="1" stroke-dasharray="2 2" />
    </svg>
  `,

  menu: (size = 24, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  `,

  bell: (size = 24, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
  `,

  close: (size = 24, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `,

  arrowBack: (size = 24, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  `,

  arrowForward: (size = 24, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  `,

  search: (size = 20, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  `,

  star: (size = 18, color = '#f59e0b', filled = true) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${filled ? color : 'none'}" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  `,

  heart: (size = 22, color = '#ef4444', filled = false) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${filled ? color : 'none'}" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  `,

  mapPin: (size = 20, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  `,

  clock: (size = 18, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  `,

  musicNote: (size = 18, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 18V5l12-2v13"></path>
      <circle cx="6" cy="18" r="3"></circle>
      <circle cx="18" cy="16" r="3"></circle>
    </svg>
  `,

  musicEqualizer: (size = 18, color = '#f3cf65') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
      <rect class="eq-bar-1" x="3" y="6" width="3.5" height="14" rx="1.5" />
      <rect class="eq-bar-2" x="10.25" y="3" width="3.5" height="17" rx="1.5" />
      <rect class="eq-bar-3" x="17.5" y="8" width="3.5" height="12" rx="1.5" />
    </svg>
  `,

  audioPlay: (size = 20, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" fill="${color}" fill-opacity="0.3"></polygon>
    </svg>
  `,

  audioPause: (size = 20, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6" y="4" width="4" height="16"></rect>
      <rect x="14" y="4" width="4" height="16"></rect>
    </svg>
  `,

  check: (size = 18, color = '#10b981') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  `,

  externalLink: (size = 18, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  `,

  // 5 CATEGORIES (Travel Guide removed as requested)
  catMonuments: (size = 24) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="12 2 2 22 22 22 12 2" fill="currentColor" fill-opacity="0.25"></polygon>
      <line x1="12" y1="2" x2="12" y2="22"></line>
    </svg>
  `,

  catMuseums: (size = 24) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 22h16"></path>
      <path d="M2 10h20"></path>
      <path d="M12 2L2 7h20L12 2z"></path>
      <path d="M6 10v9"></path>
      <path d="M10 10v9"></path>
      <path d="M14 10v9"></path>
      <path d="M18 10v9"></path>
    </svg>
  `,

  catPlaces: (size = 24) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  `,

  catArts: (size = 24) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>
    </svg>
  `,

  catCrafts: (size = 24) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 3h6"></path>
      <path d="M10 3v3c0 2-4 3-4 7 0 4 3 7 6 7s6-3 6-7c0-4-4-5-4-7V3"></path>
      <path d="M8 20h8"></path>
      <path d="M6 9a3 3 0 0 0-3 3c0 2 2 3 3 3"></path>
      <path d="M18 9a3 3 0 0 1 3 3c0 2-2 3-3 3"></path>
    </svg>
  `,

  // 4 BOTTOM NAVIGATION BAR ICONS (Home, Search, Favorites, Settings)
  navHome: (size = 22, active = false) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${active ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  `,

  navSearch: (size = 22, active = false) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${active ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  `,

  navFavorites: (size = 22, active = false) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${active ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  `,

  navSettings: (size = 22, active = false) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  `,
};
