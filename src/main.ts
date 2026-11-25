import {
  LANDMARKS,
  GOVERNORATES,
  CATEGORIES,
  Landmark,
  getLocalizedLandmarkName,
  getLocalizedLandmarkLoc,
  getLocalizedLandmarkDesc,
  getLocalizedHours,
  getLocalizedCategoryName,
  getLocalizedGovName,
  getGovById,
  getGovernorateLandmarkCount,
} from './data/landmarks';
import { I18N, LANGUAGES, LanguageCode } from './data/i18n';
import { Icons } from './utils/icons';
import { SolarBoatAudioPlayer } from './utils/solarBoatAudio';
import './index.css';

const FALLBACK_LANDMARK_IMAGE =
  'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=900&q=80';

type Screen = 'splash' | 'language' | 'home' | 'detail' | 'favorites' | 'settings';

class EgyptExplorerApp {
  private currentScreen: Screen = 'splash';
  private currentLanguage: LanguageCode = 'ar';
  private activeLandmark: Landmark | null = null;
  private selectedGovernorate: string = 'all';
  private selectedCategory: string = 'all';
  private searchQuery: string = '';
  private displayLimit: number = 24;
  private favorites: Set<string> = new Set();
  private isDarkMode: boolean = false;
  private isPlayingAudio: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSolarBoatPlaying: boolean = false;
  private solarBoatProgress: number = 0;
  private solarBoatPlayer: SolarBoatAudioPlayer;
  private showDrawer: boolean = false;
  private showNotifications: boolean = false;
  private showLanguageModal: boolean = false;

  private appContainer: HTMLElement;

  constructor() {
    this.appContainer = document.getElementById('app') || document.body;
    this.solarBoatPlayer = new SolarBoatAudioPlayer(
      (playing, progress) => {
        this.isSolarBoatPlaying = playing;
        this.solarBoatProgress = progress;
        this.syncSolarBoatButtons();
      },
      (progress) => {
        this.solarBoatProgress = progress;
        this.syncSolarBoatProgress();
      }
    );
    this.loadStateFromStorage();
    this.init();
  }

  private loadStateFromStorage() {
    try {
      const savedLang = localStorage.getItem('ee_lang') as LanguageCode;
      if (savedLang && I18N[savedLang]) {
        this.currentLanguage = savedLang;
      }
      const savedTheme = localStorage.getItem('ee_theme');
      if (savedTheme === 'dark') {
        this.isDarkMode = true;
        document.documentElement.setAttribute('data-theme', 'dark');
      }
      const savedFavs = localStorage.getItem('ee_favs');
      if (savedFavs) {
        this.favorites = new Set(JSON.parse(savedFavs));
      }
    } catch (e) {
      console.warn('Storage read error', e);
    }
  }

  private saveFavorites() {
    try {
      localStorage.setItem('ee_favs', JSON.stringify(Array.from(this.favorites)));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }

  private t(key: string, params?: Record<string, string | number>): string {
    const langDict = I18N[this.currentLanguage] || I18N.ar;
    let text = langDict[key] || I18N.ar[key] || I18N.en[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return text;
  }

  private init() {
    this.applyDirection();
    this.render();

    // Auto-advance splash screen to home or language selection
    setTimeout(() => {
      if (this.currentScreen === 'splash') {
        const hasSavedLang = localStorage.getItem('ee_lang');
        if (!hasSavedLang) {
          this.setScreen('language');
        } else {
          this.setScreen('home');
        }
      }
    }, 2400);
  }

  private applyDirection() {
    const isRtl = this.currentLanguage === 'ar';
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', this.currentLanguage);
  }

  public setScreen(screen: Screen, landmarkId?: string) {
    if (this.isPlayingAudio) {
      this.stopAudio();
    }
    if (screen === 'detail' && landmarkId) {
      const found = LANDMARKS.find((l) => l.id === landmarkId);
      if (found) {
        this.activeLandmark = found;
      }
    }
    this.currentScreen = screen;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.render();
  }

  public setLanguage(code: LanguageCode) {
    this.currentLanguage = code;
    try {
      localStorage.setItem('ee_lang', code);
    } catch (e) {
      console.warn(e);
    }
    this.applyDirection();
    this.render();
  }

  public toggleFavorite(id: string) {
    if (this.favorites.has(id)) {
      this.favorites.delete(id);
    } else {
      this.favorites.add(id);
    }
    this.saveFavorites();
    this.render();
  }

  public toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('ee_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('ee_theme', 'light');
    }
    this.render();
  }

  // --- AUDIO GUIDE (WEB SPEECH API) ---
  public toggleAudioGuide(landmark: Landmark) {
    if (this.isPlayingAudio) {
      this.stopAudio();
      return;
    }

    if (!('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const name = getLocalizedLandmarkName(landmark, this.currentLanguage);
    const desc = getLocalizedLandmarkDesc(landmark, this.currentLanguage);
    const loc = getLocalizedLandmarkLoc(landmark, this.currentLanguage);
    const hours = getLocalizedHours(landmark, this.currentLanguage);
    const govInfo = getGovById(landmark.governorate);
    const govName = govInfo ? getLocalizedGovName(govInfo, this.currentLanguage) : landmark.governorate;

    const isAr = this.currentLanguage === 'ar';
    const textToSpeak = isAr
      ? `${name}. محافظة ${govName}. الموقع: ${loc}. ${desc}. مواعيد الزيارة: ${hours}.`
      : `${name}. Governorate: ${govName}. Location: ${loc}. ${desc}. Opening hours: ${hours}.`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (this.currentLanguage === 'ar') {
      const arVoice = voices.find((v) => v.lang.startsWith('ar'));
      if (arVoice) utterance.voice = arVoice;
      utterance.lang = 'ar-EG';
    } else if (this.currentLanguage === 'fr') {
      const frVoice = voices.find((v) => v.lang.startsWith('fr'));
      if (frVoice) utterance.voice = frVoice;
      utterance.lang = 'fr-FR';
    } else if (this.currentLanguage === 'es') {
      const esVoice = voices.find((v) => v.lang.startsWith('es'));
      if (esVoice) utterance.voice = esVoice;
      utterance.lang = 'es-ES';
    } else if (this.currentLanguage === 'de') {
      const deVoice = voices.find((v) => v.lang.startsWith('de'));
      if (deVoice) utterance.voice = deVoice;
      utterance.lang = 'de-DE';
    } else {
      const enVoice = voices.find((v) => v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;
      utterance.lang = 'en-US';
    }

    utterance.onend = () => {
      this.isPlayingAudio = false;
      this.currentUtterance = null;
      this.render();
    };

    utterance.onerror = () => {
      this.isPlayingAudio = false;
      this.currentUtterance = null;
      this.render();
    };

    this.currentUtterance = utterance;
    this.isPlayingAudio = true;
    window.speechSynthesis.speak(utterance);
    this.render();
  }

  private stopAudio() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isPlayingAudio = false;
    this.currentUtterance = null;
    this.render();
  }

  private getSolarBoatButtonInnerHtml(): string {
    const isPlaying = this.isSolarBoatPlaying;
    const progress = this.solarBoatProgress.toFixed(1);
    return `
      <span class="solar-boat-icon flex items-center justify-center gap-1 relative z-10">
        ${isPlaying ? Icons.audioPause(14, '#f3cf65') : Icons.audioPlay(14, '#f3cf65')}
        ${isPlaying ? Icons.musicEqualizer(15, '#f3cf65') : Icons.musicNote(15, '#f3cf65')}
      </span>
      <span class="hidden sm:inline text-[11px] font-bold tracking-tight relative z-10 ${isPlaying ? 'text-[#f3cf65]' : 'text-blue-100'}">
        ${this.t('solarBoatShort')}
      </span>
      ${isPlaying ? '<span class="w-1.5 h-1.5 rounded-full bg-[#f3cf65] animate-ping relative z-10"></span>' : ''}
      <span
        class="solar-boat-progress-bar absolute bottom-0 left-0 rtl:left-auto rtl:right-0 h-[2.5px] bg-gradient-to-r from-[#d4af37] via-[#f3cf65] to-[#fbbf24] transition-all duration-200"
        style="width: ${progress}%"
      ></span>
    `;
  }

  private renderSolarBoatNavButton(): string {
    const isPlaying = this.isSolarBoatPlaying;
    const label = isPlaying ? this.t('solarBoatPause') : this.t('solarBoatPlay');
    return `
      <button
        type="button"
        class="btn-solar-boat-toggle relative overflow-hidden px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
          isPlaying
            ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#f3cf65] solar-boat-active'
            : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
        }"
        title="${this.escapeHtml(label)}"
        aria-label="${this.escapeHtml(label)}"
        aria-pressed="${isPlaying ? 'true' : 'false'}"
      >
        ${this.getSolarBoatButtonInnerHtml()}
      </button>
    `;
  }

  private syncSolarBoatButtons() {
    const isPlaying = this.isSolarBoatPlaying;
    const label = isPlaying ? this.t('solarBoatPause') : this.t('solarBoatPlay');
    document.querySelectorAll('.btn-solar-boat-toggle').forEach((btn) => {
      const el = btn as HTMLButtonElement;
      el.setAttribute('title', label);
      el.setAttribute('aria-label', label);
      el.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
      if (isPlaying) {
        el.className =
          'btn-solar-boat-toggle relative overflow-hidden px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 bg-[#d4af37]/20 border-[#d4af37] text-[#f3cf65] solar-boat-active';
      } else {
        el.className =
          'btn-solar-boat-toggle relative overflow-hidden px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 bg-white/10 hover:bg-white/20 border-white/20 text-white';
      }
      el.innerHTML = this.getSolarBoatButtonInnerHtml();
    });
  }

  private syncSolarBoatProgress() {
    const width = `${this.solarBoatProgress.toFixed(1)}%`;
    document.querySelectorAll('.solar-boat-progress-bar').forEach((bar) => {
      (bar as HTMLElement).style.width = width;
    });
  }

  private normalizeSearchText(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Strip Latin combining diacritics
      .replace(/[\u064B-\u065F\u0670]/g, '') // Strip Arabic tashkeel
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private getFilteredLandmarks(): Landmark[] {
    let filteredLandmarks = LANDMARKS;

    if (this.selectedGovernorate !== 'all') {
      filteredLandmarks = filteredLandmarks.filter((l) => l.governorate === this.selectedGovernorate);
    }

    if (this.selectedCategory !== 'all') {
      filteredLandmarks = filteredLandmarks.filter((l) => l.category === this.selectedCategory);
    }

    const normalizedQuery = this.normalizeSearchText(this.searchQuery);
    if (normalizedQuery) {
      const tokens = normalizedQuery.split(' ').filter(Boolean);
      const cleanRawQuery = normalizedQuery.replace(/^#/, '');

      filteredLandmarks = filteredLandmarks.filter((l) => {
        const sheetNumStr = String(l.sheetNumber);
        if (sheetNumStr === cleanRawQuery) {
          return true;
        }

        const govInfo = getGovById(l.governorate);
        const searchableText = this.normalizeSearchText(
          [
            getLocalizedLandmarkName(l, this.currentLanguage),
            getLocalizedLandmarkDesc(l, this.currentLanguage),
            getLocalizedLandmarkLoc(l, this.currentLanguage),
            getLocalizedCategoryName(l.category, this.currentLanguage),
            govInfo ? getLocalizedGovName(govInfo, this.currentLanguage) : '',
            l.name,
            l.nameAr,
            l.nameFr,
            l.nameEs,
            l.nameDe,
            l.governorateAr,
            l.governorateEn,
            l.governorateFr,
            l.governorateEs,
            l.governorateDe,
            l.location,
            l.locationAr,
            l.description,
            l.descriptionAr,
            sheetNumStr,
          ].join(' ')
        );

        return tokens.every((token) => searchableText.includes(token));
      });
    }

    return filteredLandmarks;
  }

  // --- RENDERING ---
  private render() {
    let contentHtml = '';

    switch (this.currentScreen) {
      case 'splash':
        contentHtml = this.renderSplashScreen();
        break;
      case 'language':
        contentHtml = this.renderLanguageScreen();
        break;
      case 'home':
        contentHtml = this.renderHomeScreen();
        break;
      case 'detail':
        contentHtml = this.renderDetailScreen();
        break;
      case 'favorites':
        contentHtml = this.renderFavoritesScreen();
        break;
      case 'settings':
        contentHtml = this.renderSettingsScreen();
        break;
    }

    const modalsHtml = `
      ${this.showLanguageModal ? this.renderLanguageModal() : ''}
      ${this.showNotifications ? this.renderNotificationsModal() : ''}
      ${this.showDrawer ? this.renderDrawerMenu() : ''}
    `;

    this.appContainer.innerHTML = `
      <div class="min-h-screen flex flex-col justify-between max-w-md mx-auto sm:max-w-xl md:max-w-3xl lg:max-w-5xl bg-[var(--sand-bg)] shadow-2xl relative text-[var(--text-main)] transition-colors duration-300">
        ${contentHtml}
        ${this.renderBottomNavigation()}
        ${modalsHtml}
      </div>
    `;

    this.attachEventListeners();
  }

  // ==========================================
  // SCREEN 1: SPLASH SCREEN / WELCOME
  // ==========================================
  private renderSplashScreen(): string {
    return `
      <div class="fixed inset-0 z-50 flex flex-col items-center justify-between p-8 bg-gradient-to-b from-[#0b2545] via-[#07192f] to-[#040e1a] text-white animate-fade-in select-none">
        <div class="w-full flex justify-between items-center opacity-40 pt-4 text-xs tracking-widest uppercase font-mono text-[#d4af37]">
          <span>★ 27 GOVERNORATES • 1119 SITES ★</span>
          <span>★ 3100 BC — 2026 AD ★</span>
        </div>

        <div class="flex flex-col items-center text-center my-auto">
          <div class="w-32 h-32 rounded-3xl bg-gradient-to-tr from-[#133b6b] to-[#07192f] p-4 flex items-center justify-center border-2 border-[#d4af37] shadow-[0_0_35px_rgba(212,175,55,0.4)] mb-6 gold-glow">
            ${Icons.logo(88, '#f59e0b')}
          </div>

          <!-- Title: مستكشف مصر (Egypt Explorer) -->
          <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-[#fef3c7] to-[#d4af37] bg-clip-text text-transparent font-serif leading-tight">
            ${this.t('appName')}
          </h1>

          <!-- Subtitle / Slogan directly below: مصر حكاية لا تنتهي -->
          <p class="text-base sm:text-lg text-[#f3cf65] font-bold tracking-wide mt-3 drop-shadow">
            ${this.t('appSlogan')}
          </p>

          <div class="mt-4 px-3.5 py-1 rounded-full bg-white/10 border border-[#d4af37]/40 text-xs text-[#f3cf65] font-mono">
            ${this.t('subHeader')}
          </div>
        </div>

        <div class="w-full max-w-xs flex flex-col items-center pb-8">
          <div class="w-full h-1.5 bg-blue-950/80 rounded-full overflow-hidden border border-blue-800/40 mb-3 shadow-inner">
            <div class="h-full bg-gradient-to-r from-[#d4af37] via-[#f59e0b] to-[#fbbf24] animate-loading-bar rounded-full"></div>
          </div>

          <span class="text-xs text-blue-200/70 tracking-wider mb-6 animate-pulse">
            ${this.t('journeyBegins')}
          </span>

          <button id="btn-splash-skip" class="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e5a93c] text-[#07192f] font-bold text-sm tracking-wide shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2">
            <span>${this.t('startExploring')}</span>
            ${Icons.arrowForward(16, '#07192f')}
          </button>
        </div>
      </div>
    `;
  }

  // ==========================================
  // SCREEN 2: LANGUAGE SELECTION
  // ==========================================
  private renderLanguageScreen(): string {
    return `
      <div class="min-h-screen flex flex-col justify-between p-6 bg-gradient-to-b from-[#0b2545] to-[#07192f] text-white animate-fade-in">
        <div class="pt-6 text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center border border-[#d4af37]/40 shadow-md">
            ${Icons.logo(36, '#d4af37')}
          </div>
          <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif">
            ${this.t('selectLanguage')}
          </h2>
          <p class="text-xs sm:text-sm text-blue-200/80 mt-2 max-w-sm mx-auto">
            ${this.t('choosePreferred')}
          </p>
        </div>

        <div class="my-auto py-6 space-y-3 max-w-sm mx-auto w-full">
          ${LANGUAGES.map((lang) => {
            const isSelected = this.currentLanguage === lang.code;
            return `
              <button 
                data-lang="${lang.code}" 
                class="lang-option-btn w-full p-4 rounded-2xl flex items-center justify-between border-2 transition-all ${
                  isSelected
                    ? 'bg-blue-900/60 border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.25)]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }"
              >
                <div class="flex items-center gap-4">
                  <span class="text-3xl filter drop-shadow-sm">${lang.flag}</span>
                  <div class="text-left rtl:text-right">
                    <p class="font-bold text-base text-white">${lang.name}</p>
                    <p class="text-xs text-blue-200/70">${lang.nativeName}</p>
                  </div>
                </div>
                <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-[#d4af37] bg-[#d4af37]' : 'border-white/30'
                }">
                  ${isSelected ? '<div class="w-2.5 h-2.5 bg-[#0b2545] rounded-full"></div>' : ''}
                </div>
              </button>
            `;
          }).join('')}
        </div>

        <div class="pb-6 max-w-sm mx-auto w-full">
          <button 
            id="btn-language-continue" 
            class="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#0284c7] via-[#0369a1] to-[#0b2545] text-white font-bold text-base shadow-xl border border-sky-400/40 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <span>${this.t('continueBtn')}</span>
            ${Icons.arrowForward(20, '#ffffff')}
          </button>
        </div>
      </div>
    `;
  }

  // ==========================================
  // SCREEN 3: HOME DASHBOARD (27 GOVERNORATES & 1120 LANDMARKS)
  // ==========================================
  private renderActiveFiltersBar(activeGovInfo?: ReturnType<typeof getGovById>): string {
    if (!this.searchQuery && this.selectedGovernorate === 'all' && this.selectedCategory === 'all') {
      return '';
    }
    return `
      <div class="px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div class="flex flex-wrap items-center gap-1.5 text-[var(--text-muted)] font-medium">
          <span>${this.t('activeFilter')}</span>
          ${
            this.searchQuery
              ? `<span class="px-2 py-0.5 rounded-md bg-[#d4af37]/20 text-[#07192f] dark:text-[#f3cf65] font-bold border border-[#d4af37]/40 flex items-center gap-1">"${this.escapeHtml(this.searchQuery)}" <button id="btn-remove-search-tag" class="hover:text-red-600 cursor-pointer">×</button></span>`
              : ''
          }
          ${
            this.selectedGovernorate !== 'all' && activeGovInfo
              ? `<span class="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 font-bold border border-blue-300 dark:border-blue-800 flex items-center gap-1">${getLocalizedGovName(activeGovInfo, this.currentLanguage)} (${getGovernorateLandmarkCount(activeGovInfo.id)}) <button id="btn-remove-gov-tag" class="hover:text-red-600 cursor-pointer">×</button></span>`
              : ''
          }
          ${
            this.selectedCategory !== 'all'
              ? `<span class="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 font-bold border border-purple-300 dark:border-purple-800 flex items-center gap-1">${getLocalizedCategoryName(this.selectedCategory, this.currentLanguage)} <button id="btn-remove-cat-tag" class="hover:text-red-600 cursor-pointer">×</button></span>`
              : ''
          }
        </div>
        <button id="btn-clear-all-filters-bar" class="text-xs font-bold text-[#d4af37] hover:underline cursor-pointer">
          ${this.t('resetAllFilters')}
        </button>
      </div>
    `;
  }

  private renderGrandEgyptianMuseumSection(): string {
    return `
      <section aria-labelledby="gem-spotlight-title" class="px-4 py-3">
        <div class="rounded-3xl overflow-hidden bg-gradient-to-br from-[#0b2545] via-[#07192f] to-[#040e1a] text-white border border-[#d4af37]/45 shadow-2xl p-4 sm:p-6">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div class="md:col-span-5 space-y-2.5">
              <span class="inline-block px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/50 text-[#f3cf65] text-[10px] font-extrabold uppercase tracking-widest">
                ${this.t('gemSectionBadge')}
              </span>
              <h3 id="gem-spotlight-title" class="text-xl sm:text-2xl font-black font-serif text-white leading-snug">
                ${this.t('gemSectionTitle')}
              </h3>
              <p class="text-xs sm:text-sm text-blue-100/85 leading-relaxed">
                ${this.t('gemSectionDesc')}
              </p>
            </div>
            <div class="md:col-span-7">
              <div class="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-[#d4af37]/60 shadow-[0_12px_32px_rgba(0,0,0,0.5)] bg-black">
                <iframe
                  class="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/jfxznm5cTPA?si=x3V-2MFyiwnd2cpM"
                  title="${this.escapeHtml(this.t('gemSectionTitle'))}"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerpolicy="strict-origin-when-cross-origin"
                  allowfullscreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  private renderFeaturedCarouselSection(popularLandmarks: Landmark[]): string {
    if (this.selectedGovernorate !== 'all' || this.selectedCategory !== 'all' || this.searchQuery.trim() !== '') {
      return '';
    }
    return `
      ${this.renderGrandEgyptianMuseumSection()}
      <div class="px-4 py-2">
        <div class="flex items-center justify-between mb-2.5">
          <h3 class="font-bold text-base font-serif text-[var(--text-main)]">
            ${this.t('popularDestinations')}
          </h3>
          <span class="text-xs text-[var(--text-muted)]">${this.t('topRated')}</span>
        </div>

        <div class="flex gap-3.5 overflow-x-auto no-scrollbar pb-2 pt-1">
          ${popularLandmarks.slice(0, 10).map((landmark) => this.renderCarouselCard(landmark)).join('')}
        </div>
      </div>
    `;
  }

  private renderLandmarksGridContent(filteredLandmarks: Landmark[]): string {
    const totalFilteredCount = filteredLandmarks.length;
    const displayedLandmarks = filteredLandmarks.slice(0, this.displayLimit);
    const hasMore = totalFilteredCount > this.displayLimit;
    const trimmedQuery = this.searchQuery.trim();

    return `
      ${
        trimmedQuery && totalFilteredCount > 0
          ? `
        <div class="mb-3 px-3.5 py-2 rounded-xl bg-[#0b2545]/5 dark:bg-white/5 border border-[#d4af37]/30 flex items-center justify-between gap-2 text-xs">
          <span class="font-bold text-[var(--text-main)]">
            ${this.t('searchResultsFor', { query: this.escapeHtml(trimmedQuery), count: totalFilteredCount })}
          </span>
          <button id="btn-inline-clear-search" class="text-[11px] font-bold text-[#d4af37] hover:underline cursor-pointer flex-shrink-0">
            ${this.t('clearAllFavs')}
          </button>
        </div>
      `
          : ''
      }
      ${
        displayedLandmarks.length === 0
          ? `
        <div class="p-8 text-center bg-[var(--card-bg)] rounded-2xl border border-[var(--border-light)] my-4 shadow-sm">
          <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center">
            ${Icons.search(24)}
          </div>
          <h4 class="font-bold text-base mb-1">
            ${trimmedQuery ? this.t('noResultsFor', { query: this.escapeHtml(trimmedQuery) }) : this.t('noLandmarksFound')}
          </h4>
          <p class="text-xs text-[var(--text-muted)] mb-4 max-w-md mx-auto">${this.t('noLandmarksHint')}</p>
          <div class="flex flex-wrap items-center justify-center gap-2">
            ${
              trimmedQuery && (this.selectedGovernorate !== 'all' || this.selectedCategory !== 'all')
                ? `<button id="btn-search-all-govs" class="px-4 py-2 rounded-xl bg-[#d4af37] text-[#07192f] text-xs font-bold shadow hover:brightness-105 transition cursor-pointer">${this.t('searchAllGovs')}</button>`
                : ''
            }
            <button id="btn-clear-all-filters" class="px-4 py-2 rounded-xl bg-[#0b2545] text-white text-xs font-bold shadow hover:bg-[#133b6b] transition cursor-pointer">
              ${this.t('resetAllFilters')}
            </button>
          </div>
        </div>
      `
          : `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          ${displayedLandmarks.map((landmark) => this.renderLandmarkCard(landmark)).join('')}
        </div>
      `
      }

      <!-- Load More Button -->
      ${
        hasMore
          ? `
        <div class="mt-5 text-center">
          <button 
            id="btn-load-more" 
            class="py-3 px-8 rounded-2xl bg-[#0b2545] text-[#f3cf65] font-bold text-xs border border-[#d4af37]/40 shadow-lg hover:bg-[#133b6b] active:scale-95 transition cursor-pointer"
          >
            ${this.t('moreRemaining', { count: totalFilteredCount - this.displayLimit })}
          </button>
        </div>
      `
          : ''
      }
    `;
  }

  private renderHomeScreen(): string {
    const filteredLandmarks = this.getFilteredLandmarks();
    const popularLandmarks = LANDMARKS.filter((l) => l.isPopular);
    const activeGovInfo = getGovById(this.selectedGovernorate);

    // Quick Search suggestion chips
    const searchChips = [
      { key: 'chipPyramids', query: this.t('chipPyramids') },
      { key: 'chipMuseums', query: this.t('chipMuseums') },
      { key: 'chipLuxor', query: this.t('chipLuxor') },
      { key: 'chipAswan', query: this.t('chipAswan') },
      { key: 'chipAlexandria', query: this.t('chipAlexandria') },
      { key: 'chipRedSea', query: this.t('chipRedSea') },
      { key: 'chipSinai', query: this.t('chipSinai') },
      { key: 'chipSiwa', query: this.t('chipSiwa') },
      { key: 'chipCrafts', query: this.t('chipCrafts') },
    ];

    return `
      <div class="flex-1 pb-24 animate-fade-in">
        <!-- Top App Bar with Title: مستكشف مصر, Slogan: مصر حكاية لا تنتهي, and Solar Boat Audio Player -->
        <header class="sticky top-0 z-30 bg-[#0b2545] text-white px-4 py-2.5 shadow-lg border-b border-[#d4af37]/30 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5 min-w-0">
            <button id="btn-toggle-drawer" class="p-2 rounded-xl hover:bg-white/10 active:scale-95 transition flex-shrink-0" aria-label="Open menu">
              ${Icons.menu(24, '#ffffff')}
            </button>
            <div class="flex items-center gap-2.5 cursor-pointer min-w-0" id="header-brand-click">
              ${Icons.logo(32, '#d4af37')}
              <div class="min-w-0">
                <!-- Title: مستكشف مصر -->
                <h1 class="text-base sm:text-lg font-extrabold tracking-tight leading-tight font-serif text-[#f3cf65] truncate">
                  ${this.t('appName')}
                </h1>
                <!-- Subtitle / Slogan directly below: مصر حكاية لا تنتهي -->
                <p class="text-[11px] font-bold text-blue-100 tracking-wide leading-none truncate">
                  ${this.t('appSlogan')}
                </p>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1.5 flex-shrink-0">
            <!-- Solar Boat Music Toggle Button -->
            ${this.renderSolarBoatNavButton()}

            <!-- Language Quick Switcher -->
            <button id="btn-quick-lang" class="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1 border border-white/20 transition cursor-pointer">
              <span>${LANGUAGES.find((l) => l.code === this.currentLanguage)?.flag || '🇪🇬'}</span>
              <span class="uppercase tracking-wider">${this.currentLanguage}</span>
            </button>

            <!-- Notification Bell with badge -->
            <button id="btn-notifications" class="p-2 rounded-xl hover:bg-white/10 relative transition cursor-pointer" aria-label="Notifications">
              ${Icons.bell(22, '#ffffff')}
              <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
            </button>
          </div>
        </header>

        <!-- PROMINENT & INTERACTIVE SEARCH BOX -->
        <div class="px-4 pt-3 pb-1 bg-gradient-to-b from-[#0b2545]/15 via-transparent to-transparent">
          <div class="bg-[var(--card-bg)] rounded-2xl p-3 shadow-lg border-2 border-[#d4af37]/60 focus-within:border-[#d4af37] transition-all">
            <form id="home-search-form" role="search" class="relative flex items-center gap-2">
              <button
                type="submit"
                id="btn-search-submit"
                class="p-2 rounded-xl bg-[#d4af37]/15 hover:bg-[#d4af37] text-[#d4af37] hover:text-[#07192f] transition active:scale-95 flex items-center justify-center flex-shrink-0 cursor-pointer"
                aria-label="${this.t('searchBtn')}"
                title="${this.t('searchBtn')}"
              >
                ${Icons.search(20)}
              </button>
              <input 
                type="search" 
                id="home-search-input"
                value="${this.escapeHtml(this.searchQuery)}"
                placeholder="${this.t('searchPlaceholder')}"
                class="w-full py-2.5 text-sm sm:text-base bg-transparent text-[var(--text-main)] placeholder-gray-400 font-medium focus:outline-none"
                autocomplete="off"
                enterkeyhint="search"
              />
              <span id="home-search-clear-slot" class="flex items-center flex-shrink-0">
                ${
                  this.searchQuery
                    ? `
                  <button type="button" id="btn-clear-search" class="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer" title="${this.t('close')}">
                    ${Icons.close(18)}
                  </button>
                `
                    : ''
                }
              </span>
              <button
                type="submit"
                class="hidden sm:inline-flex px-3.5 py-2 rounded-xl bg-[#0b2545] text-[#f3cf65] text-xs font-bold hover:bg-[#133b6b] active:scale-95 transition cursor-pointer flex-shrink-0"
              >
                ${this.t('searchBtn')}
              </button>
            </form>

            <!-- Quick Search Suggestion Chips -->
            <div class="mt-2.5 pt-2 border-t border-[var(--border-light)] flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
              <span class="text-[10px] uppercase font-bold text-[var(--text-muted)] flex-shrink-0 tracking-wider">
                ${this.t('quickSearch')}:
              </span>
              ${searchChips.map((chip) => `
                <button 
                  type="button"
                  data-search-chip="${chip.query}" 
                  class="search-suggestion-chip flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-[#0b2545] dark:text-sky-300 border border-blue-200/60 dark:border-blue-800/40 hover:bg-[#d4af37] hover:text-[#07192f] hover:border-[#d4af37] transition active:scale-95 cursor-pointer"
                >
                  ${chip.query}
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- GOVERNORATES QUICK NAVIGATION BAR (Requirement 2) -->
        <div class="sticky top-[57px] z-20 bg-[var(--sand-bg)]/95 backdrop-blur-md px-4 py-2 border-y border-[var(--border-light)] shadow-xs">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[11px] font-bold text-[var(--text-main)] flex items-center gap-1.5">
              <span>🧭</span>
              <span>${this.t('quickNavTitle')}</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-[#d4af37]/20 text-[#07192f] dark:text-[#f3cf65] font-mono">27</span>
            </span>
            <div class="flex items-center gap-1">
              <button id="btn-scroll-govs-left" class="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-xs text-gray-500" title="Scroll left">
                ◀
              </button>
              <button id="btn-scroll-govs-right" class="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-xs text-gray-500" title="Scroll right">
                ▶
              </button>
            </div>
          </div>

          <!-- Smooth Interactive Quick-Scroll Bar -->
          <div id="quick-nav-bar" class="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1">
            <button 
              data-quick-gov="all"
              class="quick-gov-btn flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                this.selectedGovernorate === 'all'
                  ? 'bg-[#0b2545] text-white border-[#d4af37] shadow-md ring-2 ring-[#d4af37]/50'
                  : 'bg-[var(--card-bg)] text-[var(--text-main)] border-[var(--border-light)] hover:border-[#d4af37]'
              }"
            >
              <span>🇪🇬</span>
              <span>${this.t('allGovernorates')}</span>
              <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                this.selectedGovernorate === 'all' ? 'bg-[#d4af37] text-[#07192f]' : 'bg-gray-100 dark:bg-gray-800'
              }">${LANDMARKS.length}</span>
            </button>

            ${GOVERNORATES.map((gov) => {
              const isSelected = this.selectedGovernorate === gov.id;
              const localizedName = getLocalizedGovName(gov, this.currentLanguage);
              const govCount = getGovernorateLandmarkCount(gov.id);
              return `
                <button 
                  data-quick-gov="${gov.id}"
                  id="quick-gov-btn-${gov.id}"
                  class="quick-gov-btn flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#0b2545] text-[#f3cf65] font-bold border-[#d4af37] shadow-md ring-2 ring-[#d4af37]/50'
                      : 'bg-[var(--card-bg)] text-[var(--text-main)] border-[var(--border-light)] hover:border-[#d4af37]'
                  }"
                >
                  <span>${localizedName}</span>
                  <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected ? 'bg-[#d4af37] text-[#07192f] font-bold' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }">
                    ${govCount}
                  </span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Active Filter Indicator Bar -->
        <div id="home-active-filters-slot">
          ${this.renderActiveFiltersBar(activeGovInfo)}
        </div>

        <!-- Hero Banner: Title مستكشف مصر and Slogan مصر حكاية لا تنتهي -->
        <div class="px-4 py-2">
          <div class="relative rounded-2xl overflow-hidden shadow-xl border border-[#d4af37]/40 min-h-[185px] sm:min-h-[210px] flex flex-col justify-end p-5 text-white bg-cover bg-center" style="background-image: linear-gradient(to top, rgba(7, 25, 47, 0.95) 0%, rgba(7, 25, 47, 0.5) 50%, rgba(7, 25, 47, 0.25) 100%), url('https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80');">
            <div class="relative z-10 max-w-md">
              <span class="inline-block px-2.5 py-0.5 rounded-full bg-[#d4af37]/90 text-[#07192f] text-[10px] font-extrabold uppercase tracking-widest mb-1.5 shadow">
                ${this.t('heroBadge')}
              </span>
              <h2 class="text-2xl sm:text-3xl font-black font-serif text-white leading-tight drop-shadow-md">
                ${this.t('appName')}
              </h2>
              <p class="text-sm sm:text-base text-[#f3cf65] font-bold drop-shadow mt-1">
                ${this.t('appSlogan')}
              </p>
              <p class="text-xs text-blue-100 font-medium drop-shadow mb-3 mt-1 line-clamp-2">
                ${this.t('heroSubtitle')}
              </p>
              <button id="btn-hero-explore" class="py-2 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e5a93c] text-[#07192f] text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition flex items-center gap-1.5 w-fit">
                <span>${this.t('exploreNow')}</span>
                ${Icons.arrowForward(14, '#07192f')}
              </button>
            </div>
          </div>
        </div>

        <!-- 27 Governorates Cards Grid/Carousel -->
        <div class="px-4 py-2.5" id="governorates-section">
          <div class="flex items-center justify-between mb-2">
            <div>
              <h3 class="font-bold text-base font-serif text-[var(--text-main)] flex items-center gap-2">
                <span>🏛️</span>
                <span>${this.t('governoratesTitle')}</span>
              </h3>
              <p class="text-xs text-[var(--text-muted)]">
                ${this.t('governoratesSubtitle')}
              </p>
            </div>
            ${
              this.selectedGovernorate !== 'all'
                ? `<button id="btn-reset-gov" class="text-xs px-2.5 py-1 rounded-lg bg-[var(--card-bg)] border border-[#d4af37] text-[#d4af37] font-semibold hover:bg-[#d4af37]/10 transition">${this.t('allGovernorates')}</button>`
                : ''
            }
          </div>

          <div class="flex gap-2.5 overflow-x-auto no-scrollbar py-2">
            <button 
              data-gov="all" 
              class="gov-filter-card flex-shrink-0 w-32 p-2.5 rounded-2xl border text-center transition-all ${
                this.selectedGovernorate === 'all'
                  ? 'bg-[#0b2545] text-white border-[#d4af37] shadow-lg ring-2 ring-[#d4af37]/60'
                  : 'bg-[var(--card-bg)] text-[var(--text-main)] border-[var(--border-light)] hover:border-[#d4af37]'
              }"
            >
              <div class="w-10 h-10 mx-auto rounded-xl bg-[#d4af37]/20 flex items-center justify-center text-lg mb-1.5">
                🇪🇬
              </div>
              <h4 class="font-bold text-xs line-clamp-1">${this.t('allGovernorates')}</h4>
              <span class="inline-block px-2 py-0.2 mt-1 rounded-full text-[10px] font-mono ${
                this.selectedGovernorate === 'all' ? 'bg-[#d4af37] text-[#07192f] font-bold' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
              }">
                ${LANDMARKS.length}
              </span>
            </button>

            ${GOVERNORATES.map((gov) => {
              const isSelected = this.selectedGovernorate === gov.id;
              const localizedName = getLocalizedGovName(gov, this.currentLanguage);
              const govCount = getGovernorateLandmarkCount(gov.id);
              return `
                <button 
                  data-gov="${gov.id}" 
                  class="gov-filter-card flex-shrink-0 w-40 rounded-2xl border overflow-hidden transition-all text-left rtl:text-right flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#0b2545] text-white border-[#d4af37] shadow-lg ring-2 ring-[#d4af37]/60'
                      : 'bg-[var(--card-bg)] text-[var(--text-main)] border-[var(--border-light)] hover:border-[#d4af37]'
                  }"
                >
                  <div class="relative h-16 w-full overflow-hidden">
                    <img src="${gov.heroImage}" alt="${this.escapeHtml(localizedName)}" class="w-full h-full object-cover transition-transform duration-300 hover:scale-110" loading="lazy" referrerpolicy="no-referrer" onerror="if(this.src!=='${FALLBACK_LANDMARK_IMAGE}'){this.src='${FALLBACK_LANDMARK_IMAGE}';}" />
                    <span class="absolute top-1 right-1 rtl:right-auto rtl:left-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                      isSelected ? 'bg-[#d4af37] text-[#07192f]' : 'bg-[#0b2545]/85 text-[#f3cf65]'
                    }">
                      ${govCount}
                    </span>
                  </div>
                  <div class="p-2">
                    <h4 class="font-bold text-xs line-clamp-1 leading-snug flex items-center justify-between gap-1">
                      <span class="truncate">${localizedName}</span>
                      <span class="text-[10px] font-mono flex-shrink-0 ${isSelected ? 'text-[#f3cf65]' : 'text-[#0284c7] dark:text-[#f3cf65]'}">(${govCount})</span>
                    </h4>
                    <p class="text-[10px] opacity-70 line-clamp-1 mt-0.5">${gov.badge}</p>
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Categories Filter (5 Heritage Categories) -->
        <div class="px-4 py-2">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-bold text-sm font-serif text-[var(--text-main)]">
              ${this.t('categories')}
            </h3>
            ${
              this.selectedCategory !== 'all'
                ? `<button id="btn-reset-category" class="text-xs text-[#d4af37] font-semibold hover:underline">${this.t('seeAll')}</button>`
                : ''
            }
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
            ${this.renderCategoryButton('monuments', this.t('catMonuments'), Icons.catMonuments(20), 'cat-monuments')}
            ${this.renderCategoryButton('museums', this.t('catMuseums'), Icons.catMuseums(20), 'cat-museums')}
            ${this.renderCategoryButton('places', this.t('catPlaces'), Icons.catPlaces(20), 'cat-places')}
            ${this.renderCategoryButton('arts', this.t('catArts'), Icons.catArts(20), 'cat-arts')}
            ${this.renderCategoryButton('crafts', this.t('catCrafts'), Icons.catCrafts(20), 'cat-crafts')}
          </div>
        </div>

        <!-- Featured Highlights Carousel -->
        <div id="home-featured-carousel-slot">
          ${this.renderFeaturedCarouselSection(popularLandmarks)}
        </div>

        <!-- Landmarks Grid Cards (Ticket prices completely removed per Requirement 3) -->
        <div class="px-4 py-2 scroll-mt-28" id="landmarks-grid-container">
          ${this.renderLandmarksGridContent(filteredLandmarks)}
        </div>
      </div>
    `;
  }

  private renderCategoryButton(catId: Landmark['category'], label: string, iconHtml: string, cssClass: string): string {
    const isSelected = this.selectedCategory === catId;
    return `
      <button 
        data-cat="${catId}" 
        class="cat-filter-btn flex flex-col items-center p-2 rounded-2xl border transition-all ${
          isSelected
            ? 'bg-[#0b2545] text-white border-[#d4af37] shadow-md ring-2 ring-[#d4af37]/50'
            : 'bg-[var(--card-bg)] text-[var(--text-main)] border-[var(--border-light)] hover:shadow-sm hover:border-[#d4af37]/40'
        }"
      >
        <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-1 shadow-sm ${
          isSelected ? 'bg-[#d4af37] text-[#07192f]' : cssClass
        }">
          ${iconHtml}
        </div>
        <span class="text-[10px] font-semibold leading-tight line-clamp-1">
          ${label}
        </span>
      </button>
    `;
  }

  private renderCarouselCard(landmark: Landmark): string {
    const name = getLocalizedLandmarkName(landmark, this.currentLanguage);
    const desc = getLocalizedLandmarkDesc(landmark, this.currentLanguage);
    const govInfo = getGovById(landmark.governorate);
    const govName = govInfo ? getLocalizedGovName(govInfo, this.currentLanguage) : landmark.governorate;
    const isFav = this.favorites.has(landmark.id);

    return `
      <div 
        data-landmark-id="${landmark.id}" 
        class="landmark-card flex-shrink-0 w-64 bg-[var(--card-bg)] rounded-2xl overflow-hidden shadow-md border border-[var(--border-light)] hover-lift cursor-pointer flex flex-col justify-between"
      >
        <div class="relative h-36 overflow-hidden">
          <img 
            src="${landmark.image}" 
            alt="${this.escapeHtml(name)}" 
            loading="lazy"
            referrerpolicy="no-referrer"
            onerror="if(this.src!=='${FALLBACK_LANDMARK_IMAGE}'){this.src='${FALLBACK_LANDMARK_IMAGE}';}"
            class="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <button 
            data-fav-id="${landmark.id}" 
            class="btn-toggle-favorite absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 w-8 h-8 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center text-red-500 shadow-md active:scale-90 transition hover:bg-white"
            aria-label="Favorite"
          >
            ${Icons.heart(16, '#ef4444', isFav)}
          </button>
          <span class="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 px-2 py-0.5 rounded-md bg-[#0b2545]/85 backdrop-blur-sm text-[#f3cf65] text-[10px] font-mono font-bold">
            #${landmark.sheetNumber}
          </span>
          <span class="absolute bottom-2.5 left-2.5 rtl:left-auto rtl:right-2.5 px-2 py-0.5 rounded-md bg-[#0b2545]/85 backdrop-blur-sm text-white text-[10px] font-bold line-clamp-1 max-w-[180px]">
            ${govName}
          </span>
        </div>
        <div class="p-3">
          <div class="flex items-center gap-1 text-xs text-amber-500 mb-1">
            ${Icons.star(13, '#f59e0b', true)}
            <span class="font-bold text-[var(--text-main)]">${landmark.rating}</span>
            <span class="text-[10px] text-[var(--text-muted)]">(${landmark.reviewCount.toLocaleString()})</span>
          </div>
          <h4 class="font-bold text-sm text-[var(--text-main)] line-clamp-1 leading-snug">
            ${name}
          </h4>
          <p class="text-[11px] text-[var(--text-muted)] line-clamp-2 mt-1">
            ${desc}
          </p>
        </div>
      </div>
    `;
  }

  // Landmark Card: Any ticket price or ticketing fee information is completely removed (Requirement 3)
  private renderLandmarkCard(landmark: Landmark): string {
    const name = getLocalizedLandmarkName(landmark, this.currentLanguage);
    const desc = getLocalizedLandmarkDesc(landmark, this.currentLanguage);
    const hours = getLocalizedHours(landmark, this.currentLanguage);
    const isFav = this.favorites.has(landmark.id);
    const catName = getLocalizedCategoryName(landmark.category, this.currentLanguage);
    const govInfo = getGovById(landmark.governorate);
    const govName = govInfo ? getLocalizedGovName(govInfo, this.currentLanguage) : landmark.governorate;

    return `
      <div 
        data-landmark-id="${landmark.id}" 
        class="landmark-card bg-[var(--card-bg)] rounded-2xl overflow-hidden shadow-sm border border-[var(--border-light)] hover-lift cursor-pointer flex flex-col justify-between"
      >
        <div class="relative h-44 overflow-hidden">
          <img 
            src="${landmark.image}" 
            alt="${this.escapeHtml(name)}" 
            loading="lazy"
            referrerpolicy="no-referrer"
            onerror="if(this.src!=='${FALLBACK_LANDMARK_IMAGE}'){this.src='${FALLBACK_LANDMARK_IMAGE}';}"
            class="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <button 
            data-fav-id="${landmark.id}" 
            class="btn-toggle-favorite absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 w-8 h-8 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center text-red-500 shadow-md active:scale-90 transition hover:bg-white"
            aria-label="Favorite"
          >
            ${Icons.heart(16, '#ef4444', isFav)}
          </button>
          <span class="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 px-2 py-0.5 rounded-md bg-[#0b2545]/90 backdrop-blur-sm text-[#f3cf65] text-[10px] font-mono font-bold border border-[#d4af37]/40">
            #${landmark.sheetNumber}
          </span>
          <div class="absolute bottom-2.5 left-2.5 rtl:left-auto rtl:right-2.5 flex flex-wrap gap-1 max-w-[85%]">
            <span class="px-2 py-0.5 rounded-md bg-[#0b2545]/85 backdrop-blur-sm text-[#f3cf65] text-[10px] font-bold">
              ${govName}
            </span>
            <span class="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-semibold">
              ${catName}
            </span>
          </div>
        </div>

        <div class="p-3.5 flex flex-col flex-1 justify-between">
          <div>
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-1 text-xs text-amber-500">
                ${Icons.star(13, '#f59e0b', true)}
                <span class="font-bold text-[var(--text-main)]">${landmark.rating}</span>
                <span class="text-[10px] text-[var(--text-muted)]">(${landmark.reviewCount.toLocaleString()})</span>
              </div>
            </div>

            <h4 class="font-bold text-sm text-[var(--text-main)] leading-snug line-clamp-1">
              ${name}
            </h4>
            <p class="text-xs text-[var(--text-muted)] line-clamp-2 mt-1 leading-relaxed">
              ${desc}
            </p>
          </div>

          <div class="mt-3 pt-2.5 border-t border-[var(--border-light)] flex items-center justify-between text-xs">
            <span class="text-[var(--text-muted)] flex items-center gap-1">
              ${Icons.clock(12)}
              <span class="line-clamp-1 text-[11px]">${hours.split('(')[0]}</span>
            </span>
            <div class="flex items-center gap-2">
              <!-- Direct Clickable Google Maps Button -->
              <a 
                href="${landmark.googleMapsUrl}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="btn-card-map px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-[#0284c7] hover:bg-blue-100 dark:hover:bg-blue-900 transition flex items-center gap-1 text-[11px] font-bold"
                onclick="event.stopPropagation()"
                title="${this.t('viewOnMap')}"
              >
                <span>📍</span>
                <span class="hidden sm:inline">${this.t('viewOnMap')}</span>
              </a>
              <span class="text-[#0284c7] font-bold flex items-center gap-0.5">
                <span>${this.t('details')}</span>
                ${Icons.arrowForward(12, '#0284c7')}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // SCREEN 4: ATTRACTION / MUSEUM DETAIL SCREEN
  // (Ticket prices completely removed per Requirement 3)
  // ==========================================
  private renderDetailScreen(): string {
    const landmark = this.activeLandmark || LANDMARKS[0];
    const isAr = this.currentLanguage === 'ar';
    const isFav = this.favorites.has(landmark.id);
    const name = getLocalizedLandmarkName(landmark, this.currentLanguage);
    const desc = getLocalizedLandmarkDesc(landmark, this.currentLanguage);
    const loc = getLocalizedLandmarkLoc(landmark, this.currentLanguage);
    const hours = getLocalizedHours(landmark, this.currentLanguage);
    const catName = getLocalizedCategoryName(landmark.category, this.currentLanguage);
    const govInfo = getGovById(landmark.governorate);
    const govName = govInfo ? getLocalizedGovName(govInfo, this.currentLanguage) : landmark.governorate;

    const relatedSites = LANDMARKS.filter(
      (l) => l.governorate === landmark.governorate && l.id !== landmark.id
    ).slice(0, 3);

    const galleryPhotos = Array.from(
      new Set([landmark.image, ...(landmark.gallery || [])].filter(Boolean))
    );

    return `
      <div class="flex-1 pb-28 animate-fade-in">
        <!-- Top Navigation Bar with Back Button -->
        <header class="sticky top-0 z-30 bg-[#0b2545] text-white px-4 py-3 shadow-md flex items-center justify-between border-b border-[#d4af37]/30">
          <div class="flex items-center gap-3">
            <button id="btn-back-detail" class="p-2 rounded-xl hover:bg-white/10 active:scale-95 transition" aria-label="${this.t('back')}">
              ${isAr ? Icons.arrowForward(22, '#ffffff') : Icons.arrowBack(22, '#ffffff')}
            </button>
            <h2 class="text-base font-bold font-serif text-[#f3cf65] line-clamp-1 max-w-[200px] sm:max-w-md">
              ${name}
            </h2>
          </div>

          <div class="flex items-center gap-1.5">
            <!-- Solar Boat Music Toggle Button -->
            ${this.renderSolarBoatNavButton()}

            <!-- Audio Guide Button -->
            <button 
              id="btn-detail-audio" 
              class="px-2.5 py-1.5 rounded-xl ${
                this.isPlayingAudio
                  ? 'bg-amber-500 text-[#07192f] animate-pulse font-bold'
                  : 'bg-white/10 text-white hover:bg-white/20'
              } text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="${this.t('audioGuide')}"
            >
              ${this.isPlayingAudio ? Icons.audioPause(16, '#07192f') : Icons.audioPlay(16, '#ffffff')}
              <span class="hidden sm:inline">${this.isPlayingAudio ? this.t('playingAudio') : this.t('audioGuide')}</span>
            </button>

            <!-- Favorite toggle -->
            <button 
              data-fav-id="${landmark.id}" 
              class="btn-toggle-favorite p-2 rounded-xl bg-white/10 hover:bg-white/20 text-red-400 active:scale-90 transition cursor-pointer"
              aria-label="Save to favorites"
            >
              ${Icons.heart(20, '#ef4444', isFav)}
            </button>
          </div>
        </header>

        <!-- Main Hero Attraction Image -->
        <div class="relative w-full h-72 sm:h-96 overflow-hidden bg-gray-900 shadow-md">
          <img 
            id="detail-main-image"
            src="${galleryPhotos[0] || FALLBACK_LANDMARK_IMAGE}" 
            alt="${this.escapeHtml(name)}" 
            referrerpolicy="no-referrer"
            onerror="if(this.src!=='${FALLBACK_LANDMARK_IMAGE}'){this.src='${FALLBACK_LANDMARK_IMAGE}';}"
            class="w-full h-full object-cover transition-opacity duration-300"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none"></div>

          <div class="absolute top-4 left-4 right-4 flex items-start justify-between gap-2 pointer-events-none">
            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1 rounded-full bg-[#0b2545]/90 backdrop-blur-sm text-[#f3cf65] text-xs font-mono font-bold border border-[#d4af37]/40">
                #${landmark.sheetNumber} • ${this.t('sheetRecordNumber', { number: landmark.sheetNumber })}
              </span>
              <span class="px-3 py-1 rounded-full bg-[#0b2545]/90 backdrop-blur-sm text-sky-200 text-xs font-semibold">
                ${govName}
              </span>
              <span class="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold">
                ${catName}
              </span>
            </div>
            ${
              galleryPhotos.length > 1
                ? `<span id="detail-gallery-counter" class="px-2.5 py-1 rounded-full bg-[#07192f]/85 backdrop-blur-sm text-[#f3cf65] text-xs font-mono font-bold border border-[#d4af37]/40 flex-shrink-0">1 / ${galleryPhotos.length}</span>`
                : ''
            }
          </div>

          <div class="absolute bottom-4 left-4 right-4 text-white">
            <h1 class="text-xl sm:text-2xl font-black font-serif leading-tight drop-shadow-md">
              ${name}
            </h1>
            <div class="flex items-center gap-2 text-xs mt-1 drop-shadow">
              <span class="flex items-center gap-1 text-amber-400 font-bold">
                ${Icons.star(14, '#f59e0b', true)}
                <span>${landmark.rating} / 5.0</span>
              </span>
              <span class="text-gray-300">•</span>
              <span class="text-gray-200">${landmark.reviewCount.toLocaleString()} ${this.t('reviews')}</span>
              <span class="text-gray-300">•</span>
              <span class="text-[#f3cf65] font-semibold">${loc}</span>
            </div>
          </div>
        </div>

        <!-- Thumbnail Image Gallery -->
        <div class="px-4 py-3 bg-[var(--card-bg)] border-b border-[var(--border-light)]">
          <p class="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
            ${this.t('gallery')}
          </p>
          <div class="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
            ${galleryPhotos.map((thumbUrl, idx) => `
              <button 
                type="button"
                data-thumb-src="${thumbUrl}" 
                data-thumb-index="${idx + 1}"
                data-thumb-total="${galleryPhotos.length}"
                class="gallery-thumb-btn flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all hover:opacity-95 cursor-pointer ${
                  idx === 0 ? 'border-[#d4af37] ring-2 ring-[#d4af37]/40' : 'border-transparent opacity-80 hover:opacity-100'
                }"
              >
                <img src="${thumbUrl}" alt="${this.escapeHtml(name)} - ${idx + 1}" class="w-full h-full object-cover" loading="lazy" referrerpolicy="no-referrer" onerror="if(this.src!=='${FALLBACK_LANDMARK_IMAGE}'){this.src='${FALLBACK_LANDMARK_IMAGE}';}" />
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Information Sections (Ticket info completely removed) -->
        <div class="p-4 space-y-4">
          <!-- Exact Detailed Historical Description -->
          <div class="bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--border-light)] shadow-sm">
            <h3 class="text-sm font-bold font-serif text-[var(--text-main)] mb-2 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#d4af37]"></span>
              <span>${this.t('historicalDetails')}</span>
            </h3>
            <p class="text-sm text-[var(--text-main)] leading-relaxed">
              ${desc}
            </p>
          </div>

          <!-- Opening Hours & Location -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div class="bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--border-light)] shadow-sm">
              <div class="flex items-center gap-2 text-[#0b2545] dark:text-[#f3cf65] font-bold text-sm mb-2">
                ${Icons.clock(18)}
                <h4>${this.t('openingHours')}</h4>
              </div>
              <p class="text-sm font-medium text-[var(--text-main)]">
                ${hours}
              </p>
            </div>

            <!-- Governorate & Location Details -->
            <div class="bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--border-light)] shadow-sm">
              <div class="flex items-center gap-2 text-[#0b2545] dark:text-[#f3cf65] font-bold text-sm mb-2">
                ${Icons.mapPin(18)}
                <h4>${this.t('address')}</h4>
              </div>
              <p class="text-sm font-medium text-[var(--text-main)]">
                ${govName} — ${loc}
              </p>
            </div>
          </div>

          <!-- Related Sites in Same Governorate -->
          ${
            relatedSites.length > 0
              ? `
            <div class="pt-2">
              <h4 class="font-bold text-sm font-serif mb-2.5 flex items-center gap-2">
                <span>${govName}</span>
                <span class="px-2 py-0.5 rounded-full bg-[#0b2545]/10 dark:bg-white/10 text-[#0b2545] dark:text-[#f3cf65] text-xs font-mono">(${getGovernorateLandmarkCount(landmark.governorate)})</span>
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                ${relatedSites.map((rel) => `
                  <div 
                    data-landmark-id="${rel.id}" 
                    class="landmark-card p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-light)] flex items-center gap-2.5 cursor-pointer hover:border-[#d4af37] transition"
                  >
                    <img src="${rel.image}" alt="${this.escapeHtml(getLocalizedLandmarkName(rel, this.currentLanguage))}" class="w-12 h-12 rounded-lg object-cover flex-shrink-0" loading="lazy" referrerpolicy="no-referrer" onerror="if(this.src!=='${FALLBACK_LANDMARK_IMAGE}'){this.src='${FALLBACK_LANDMARK_IMAGE}';}" />
                    <div class="min-w-0 flex-1">
                      <p class="font-bold text-xs line-clamp-1">${getLocalizedLandmarkName(rel, this.currentLanguage)}</p>
                      <span class="text-[10px] text-amber-500 font-bold">⭐ ${rel.rating}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `
              : ''
          }
        </div>

        <!-- STICKY PROMINENT BLUE GOOGLE MAPS ACTION BUTTON -->
        <div class="fixed bottom-16 left-0 right-0 max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto px-4 py-2.5 bg-[var(--sand-bg)]/90 backdrop-blur-md border-t border-[var(--border-light)] z-20">
          <a 
            id="btn-google-maps-action"
            href="${landmark.googleMapsUrl}" 
            target="_blank" 
            rel="noopener noreferrer"
            class="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#0284c7] via-[#0b2545] to-[#07192f] text-white font-bold text-sm tracking-wide shadow-xl border-2 border-sky-400/50 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2.5 group"
          >
            <span class="text-lg">📍</span>
            <span class="text-base">${this.t('viewOnMap')}</span>
            <span class="text-xs text-sky-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
              (${this.t('openGoogleMaps')})
            </span>
          </a>
        </div>
      </div>
    `;
  }

  // ==========================================
  // SCREEN: FAVORITES SCREEN
  // ==========================================
  private renderFavoritesScreen(): string {
    const favLandmarks = LANDMARKS.filter((l) => this.favorites.has(l.id));

    return `
      <div class="flex-1 pb-24 animate-fade-in flex flex-col">
        <header class="sticky top-0 z-30 bg-[#0b2545] text-white px-4 py-3 shadow-md flex items-center justify-between border-b border-[#d4af37]/30">
          <div>
            <h2 class="text-base font-bold font-serif text-[#f3cf65]">
              ${this.t('navFavorites')}
            </h2>
            <p class="text-[10px] text-blue-200/70">
              ${favLandmarks.length} ${this.t('favoritesSubtitle')}
            </p>
          </div>
          <div class="flex items-center gap-2">
            ${this.renderSolarBoatNavButton()}
            ${
              favLandmarks.length > 0
                ? `<button id="btn-clear-all-favs" class="text-xs text-red-300 hover:text-red-100 font-semibold cursor-pointer">${this.t('clearAllFavs')}</button>`
                : ''
            }
          </div>
        </header>

        <div class="p-4 flex-1">
          ${
            favLandmarks.length === 0
              ? `
            <div class="text-center py-16 px-4 bg-[var(--card-bg)] rounded-3xl border border-[var(--border-light)] shadow-sm">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 text-red-400 flex items-center justify-center shadow-inner">
                ${Icons.heart(32, '#ef4444', false)}
              </div>
              <h3 class="font-bold text-base mb-1">${this.t('noFavoritesYet')}</h3>
              <p class="text-xs text-[var(--text-muted)] max-w-xs mx-auto mb-6">
                ${this.t('favoritesSubtitle')}
              </p>
              <button id="btn-fav-go-home" class="py-2.5 px-6 rounded-xl bg-[#0b2545] text-[#f3cf65] font-bold text-xs shadow hover:bg-[#133b6b] transition">
                ${this.t('exploreEgyptNow')}
              </button>
            </div>
          `
              : `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              ${favLandmarks.map((landmark) => this.renderLandmarkCard(landmark)).join('')}
            </div>
          `
          }
        </div>
      </div>
    `;
  }

  // ==========================================
  // SCREEN: SETTINGS SCREEN
  // ==========================================
  private renderSettingsScreen(): string {
    const activeLangInfo = LANGUAGES.find((l) => l.code === this.currentLanguage);
    return `
      <div class="flex-1 pb-24 animate-fade-in flex flex-col">
        <header class="sticky top-0 z-30 bg-[#0b2545] text-white px-4 py-3 shadow-md border-b border-[#d4af37]/30 flex items-center justify-between">
          <h2 class="text-base font-bold font-serif text-[#f3cf65]">
            ${this.t('settingsTitle')}
          </h2>
          ${this.renderSolarBoatNavButton()}
        </header>

        <div class="p-4 space-y-4 max-w-2xl mx-auto w-full">
          <!-- Language Selector Row -->
          <div class="bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--border-light)] shadow-sm flex items-center justify-between">
            <div>
              <h4 class="font-bold text-sm text-[var(--text-main)]">${this.t('appLanguage')}</h4>
              <p class="text-xs text-[var(--text-muted)]">
                ${this.t('currentLanguageLabel', { name: activeLangInfo?.name || '', code: this.currentLanguage.toUpperCase() })}
              </p>
            </div>
            <button id="btn-open-lang-modal" class="py-2 px-4 rounded-xl bg-[#0b2545] text-[#f3cf65] text-xs font-bold shadow hover:bg-[#133b6b] transition">
              ${this.t('changeBtn')}
            </button>
          </div>

          <!-- Dark/Light Mode Row -->
          <div class="bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--border-light)] shadow-sm flex items-center justify-between">
            <div>
              <h4 class="font-bold text-sm text-[var(--text-main)]">${this.t('appearance')}</h4>
              <p class="text-xs text-[var(--text-muted)]">${this.isDarkMode ? this.t('darkTheme') : this.t('lightTheme')}</p>
            </div>
            <button id="btn-toggle-theme" class="py-2 px-4 rounded-xl bg-[var(--sand-bg)] border border-[var(--border-light)] text-xs font-bold text-[var(--text-main)] shadow-sm hover:border-[#d4af37] transition">
              ${this.isDarkMode ? `☀️ ${this.t('lightTheme')}` : `🌙 ${this.t('darkTheme')}`}
            </button>
          </div>

          <!-- 27 Governorates Directory Breakdown Card -->
          <div class="bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--border-light)] shadow-sm">
            <h4 class="font-bold text-sm text-[var(--text-main)] mb-1 flex items-center gap-1.5">
              <span>📋</span>
              <span>${this.t('sourceSheetLabel')}</span>
            </h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed mb-3">
              ${this.t('appName')} — ${this.t('appSlogan')}
            </p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs max-h-60 overflow-y-auto no-scrollbar">
              ${GOVERNORATES.map((gov) => {
                const govCount = getGovernorateLandmarkCount(gov.id);
                return `
                  <div class="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 flex flex-col justify-between">
                    <span class="block font-bold text-[#0b2545] dark:text-sky-300 text-xs">${getLocalizedGovName(gov, this.currentLanguage)} (${govCount})</span>
                    <span class="text-[11px] text-[#d4af37] font-mono font-bold mt-1">${govCount} ${this.t('landmarksUnit')}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Emergency Numbers in Egypt -->
          <div class="bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--border-light)] shadow-sm">
            <h4 class="font-bold text-sm text-[var(--text-main)] mb-2">
              🚨 ${this.t('emergencyContacts')}
            </h4>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <a href="tel:126" class="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-300 font-bold flex items-center justify-between">
                <span>${this.t('touristPolice')}</span>
                <span>📞</span>
              </a>
              <a href="tel:123" class="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-300 font-bold flex items-center justify-between">
                <span>${this.t('ambulance')}</span>
                <span>🚑</span>
              </a>
              <a href="tel:180" class="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-[var(--border-light)] text-[var(--text-main)] font-semibold flex items-center justify-between">
                <span>${this.t('fireDept')}</span>
                <span>🚒</span>
              </a>
              <a href="tel:128" class="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-[var(--border-light)] text-[var(--text-main)] font-semibold flex items-center justify-between">
                <span>${this.t('trafficPolice')}</span>
                <span>🚓</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // BOTTOM NAVIGATION BAR (4 TABS: Home, Search, Favorites, Settings)
  // (AI Assistant & Map View completely removed)
  // ==========================================
  private renderBottomNavigation(): string {
    if (this.currentScreen === 'splash' || this.currentScreen === 'language') {
      return '';
    }

    const items: Array<{ id: Screen; label: string; icon: string }> = [
      { id: 'home', label: this.t('navHome'), icon: Icons.navHome(20, this.currentScreen === 'home') },
      { id: 'home', label: this.t('navSearch'), icon: Icons.navSearch(20, false) },
      { id: 'favorites', label: this.t('navFavorites'), icon: Icons.navFavorites(20, this.currentScreen === 'favorites') },
      { id: 'settings', label: this.t('navSettings'), icon: Icons.navSettings(20, this.currentScreen === 'settings') },
    ];

    return `
      <nav class="fixed bottom-0 left-0 right-0 max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto bg-[#0b2545] text-white border-t border-[#d4af37]/30 shadow-2xl z-40 px-3 py-1.5 flex justify-around items-center">
        ${items.map((item, index) => {
          const isSearchBtn = index === 1;
          const isActive = !isSearchBtn && this.currentScreen === item.id;
          return `
            <button 
              ${isSearchBtn ? 'id="nav-search-btn"' : `data-nav-screen="${item.id}"`}
              class="nav-tab-btn flex-1 flex flex-col items-center py-1 px-1 rounded-xl transition-all ${
                isActive ? 'text-[#f3cf65] font-bold scale-105' : 'text-blue-200/70 hover:text-white'
              }"
            >
              <div class="relative">
                ${item.icon}
                ${
                  item.id === 'favorites' && this.favorites.size > 0
                    ? `<span class="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-red-500 text-white text-[9px] font-bold">${this.favorites.size}</span>`
                    : ''
                }
              </div>
              <span class="text-[10px] mt-0.5 tracking-tight font-medium">
                ${item.label}
              </span>
            </button>
          `;
        }).join('')}
      </nav>
    `;
  }

  // ==========================================
  // MODALS & DRAWER
  // ==========================================
  private renderLanguageModal(): string {
    return `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
        <div class="bg-[#0b2545] text-white rounded-3xl max-w-sm w-full p-6 border-2 border-[#d4af37] shadow-2xl relative">
          <button id="btn-close-lang-modal" class="absolute top-4 right-4 text-gray-400 hover:text-white" aria-label="Close">
            ${Icons.close(20)}
          </button>
          <h3 class="text-lg font-bold font-serif text-[#f3cf65] text-center mb-1">
            ${this.t('selectLanguage')}
          </h3>
          <p class="text-xs text-blue-200/80 text-center mb-4">
            ${this.t('choosePreferred')}
          </p>

          <div class="space-y-2.5">
            ${LANGUAGES.map((lang) => `
              <button 
                data-lang="${lang.code}" 
                class="lang-modal-option-btn w-full p-3 rounded-xl flex items-center justify-between border transition ${
                  this.currentLanguage === lang.code
                    ? 'bg-blue-900 border-[#d4af37] font-bold text-[#f3cf65]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                }"
              >
                <div class="flex items-center gap-3">
                  <span class="text-2xl">${lang.flag}</span>
                  <span class="text-sm">${lang.name} (${lang.nativeName})</span>
                </div>
                ${this.currentLanguage === lang.code ? Icons.check(18, '#d4af37') : ''}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  private renderNotificationsModal(): string {
    return `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
        <div class="bg-[var(--card-bg)] text-[var(--text-main)] rounded-3xl max-w-sm w-full p-6 border border-[var(--border-light)] shadow-2xl relative">
          <button id="btn-close-notif-modal" class="absolute top-4 right-4 text-gray-400 hover:text-gray-700" aria-label="Close">
            ${Icons.close(20)}
          </button>
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xl">🔔</span>
            <h3 class="text-base font-bold font-serif text-[var(--text-main)]">
              ${this.t('notificationsTitle')}
            </h3>
          </div>

          <div class="space-y-3 text-xs">
            <div class="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
              <h5 class="font-bold text-[#0b2545] dark:text-sky-300 mb-0.5">
                ${this.t('notif1Title')}
              </h5>
              <p class="text-[var(--text-muted)] leading-relaxed">
                ${this.t('notif1Body')}
              </p>
            </div>
            <div class="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
              <h5 class="font-bold text-amber-800 dark:text-amber-300 mb-0.5">
                ${this.t('notif2Title')}
              </h5>
              <p class="text-[var(--text-muted)] leading-relaxed">
                ${this.t('notif2Body')}
              </p>
            </div>
          </div>

          <button id="btn-dismiss-notif" class="w-full mt-4 py-2.5 rounded-xl bg-[#0b2545] text-white text-xs font-bold hover:bg-[#133b6b] transition">
            ${this.t('close')}
          </button>
        </div>
      </div>
    `;
  }

  private renderDrawerMenu(): string {
    return `
      <div class="fixed inset-0 z-50 flex animate-fade-in">
        <div id="drawer-backdrop" class="fixed inset-0 bg-black/60 backdrop-blur-xs"></div>

        <div class="relative w-80 max-w-[85%] bg-[#0b2545] text-white h-full p-5 shadow-2xl flex flex-col justify-between border-r border-[#d4af37]/30 z-10 overflow-y-auto">
          <div>
            <div class="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div class="flex items-center gap-2">
                ${Icons.logo(30, '#d4af37')}
                <div>
                  <h3 class="font-bold text-sm font-serif text-[#f3cf65] leading-tight">${this.t('appName')}</h3>
                  <p class="text-[10px] text-blue-200/70 font-semibold">${this.t('appSlogan')}</p>
                </div>
              </div>
              <button id="btn-close-drawer" class="text-white/70 hover:text-white p-1" aria-label="Close">
                ${Icons.close(20)}
              </button>
            </div>

            <div class="space-y-1 mb-4">
              <button data-drawer-nav="home" class="w-full text-left rtl:text-right p-2.5 rounded-xl text-xs font-bold text-white hover:bg-white/10 flex items-center gap-3">
                ${Icons.navHome(18, true)}
                <span>${this.t('navHome')}</span>
              </button>
              <button id="drawer-search-btn" class="w-full text-left rtl:text-right p-2.5 rounded-xl text-xs font-bold text-white hover:bg-white/10 flex items-center gap-3">
                ${Icons.navSearch(18, true)}
                <span>${this.t('navSearch')}</span>
              </button>
              <button data-drawer-nav="favorites" class="w-full text-left rtl:text-right p-2.5 rounded-xl text-xs font-bold text-white hover:bg-white/10 flex items-center gap-3">
                ${Icons.navFavorites(18, true)}
                <span>${this.t('navFavorites')}</span>
              </button>
              <button data-drawer-nav="settings" class="w-full text-left rtl:text-right p-2.5 rounded-xl text-xs font-bold text-white hover:bg-white/10 flex items-center gap-3">
                ${Icons.navSettings(18, true)}
                <span>${this.t('navSettings')}</span>
              </button>
            </div>

            <!-- All 27 Governorates in Drawer -->
            <div class="mt-4 pt-3 border-t border-white/10">
              <p class="text-[10px] uppercase font-bold text-[#f3cf65] tracking-wider mb-2 flex items-center justify-between">
                <span>${this.t('governoratesTitle')}</span>
                <span class="text-[9px] font-mono text-blue-200">27</span>
              </p>
              <div class="space-y-1 max-h-56 overflow-y-auto no-scrollbar">
                <button 
                  data-drawer-gov="all" 
                  class="w-full text-left rtl:text-right p-1.5 rounded-lg text-xs font-bold text-white hover:bg-white/10 transition flex items-center justify-between ${
                    this.selectedGovernorate === 'all' ? 'bg-white/15 text-[#f3cf65]' : ''
                  }"
                >
                  <span>${this.t('allGovernorates')}</span>
                  <span class="text-[10px] font-mono text-[#f3cf65]">(${LANDMARKS.length})</span>
                </button>
                ${GOVERNORATES.map((gov) => {
                  const govCount = getGovernorateLandmarkCount(gov.id);
                  return `
                    <button 
                      data-drawer-gov="${gov.id}" 
                      class="w-full text-left rtl:text-right p-1.5 rounded-lg text-[11px] text-blue-100 hover:bg-white/10 transition flex items-center justify-between ${
                        this.selectedGovernorate === gov.id ? 'bg-white/15 text-[#f3cf65] font-bold' : ''
                      }"
                    >
                      <span>${getLocalizedGovName(gov, this.currentLanguage)}</span>
                      <span class="px-1.5 py-0.2 rounded bg-white/10 text-[9px] text-blue-200 font-mono">(${govCount})</span>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-white/10 mt-4">
            <button id="btn-drawer-lang" class="w-full py-2 px-3 rounded-xl bg-white/10 text-xs text-[#f3cf65] font-bold flex items-center justify-between mb-2">
              <span>${this.t('appLanguage')}: ${LANGUAGES.find((l) => l.code === this.currentLanguage)?.name}</span>
              <span>${LANGUAGES.find((l) => l.code === this.currentLanguage)?.flag}</span>
            </button>
            <p class="text-[10px] text-blue-300 text-center">
              ${this.t('touristPolice')}
            </p>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // EVENT LISTENERS & DOM HOOKS
  // ==========================================
  private attachEventListeners() {
    // Splash screen continue
    const skipSplashBtn = document.getElementById('btn-splash-skip');
    if (skipSplashBtn) {
      skipSplashBtn.addEventListener('click', () => {
        const hasSavedLang = localStorage.getItem('ee_lang');
        if (!hasSavedLang) {
          this.setScreen('language');
        } else {
          this.setScreen('home');
        }
      });
    }

    // Language screen options
    document.querySelectorAll('.lang-option-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const langCode = (e.currentTarget as HTMLElement).getAttribute('data-lang') as LanguageCode;
        if (langCode) {
          this.setLanguage(langCode);
        }
      });
    });

    // Language screen continue button
    const langContinueBtn = document.getElementById('btn-language-continue');
    if (langContinueBtn) {
      langContinueBtn.addEventListener('click', () => {
        this.setScreen('home');
      });
    }

    // Navigation tab buttons
    document.querySelectorAll('[data-nav-screen]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const targetScreen = (e.currentTarget as HTMLElement).getAttribute('data-nav-screen') as Screen;
        if (targetScreen) {
          this.setScreen(targetScreen);
        }
      });
    });

    // Bottom nav search button - focuses search input
    const navSearchBtn = document.getElementById('nav-search-btn');
    if (navSearchBtn) {
      navSearchBtn.addEventListener('click', () => {
        if (this.currentScreen !== 'home') {
          this.setScreen('home');
        }
        setTimeout(() => {
          const input = document.getElementById('home-search-input') as HTMLInputElement;
          if (input) {
            input.focus();
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      });
    }

    const drawerSearchBtn = document.getElementById('drawer-search-btn');
    if (drawerSearchBtn) {
      drawerSearchBtn.addEventListener('click', () => {
        this.showDrawer = false;
        if (this.currentScreen !== 'home') {
          this.setScreen('home');
        }
        setTimeout(() => {
          const input = document.getElementById('home-search-input') as HTMLInputElement;
          if (input) {
            input.focus();
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      });
    }

    // Solar Boat Music Toggle Buttons in Navbar
    document.querySelectorAll('.btn-solar-boat-toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        void this.solarBoatPlayer.toggle();
      });
    });

    // Header buttons
    const toggleDrawerBtn = document.getElementById('btn-toggle-drawer');
    if (toggleDrawerBtn) {
      toggleDrawerBtn.addEventListener('click', () => {
        this.showDrawer = true;
        this.render();
      });
    }

    const quickLangBtn = document.getElementById('btn-quick-lang');
    if (quickLangBtn) {
      quickLangBtn.addEventListener('click', () => {
        this.showLanguageModal = true;
        this.render();
      });
    }

    const notifBtn = document.getElementById('btn-notifications');
    if (notifBtn) {
      notifBtn.addEventListener('click', () => {
        this.showNotifications = true;
        this.render();
      });
    }

    const brandHeader = document.getElementById('header-brand-click');
    if (brandHeader) {
      brandHeader.addEventListener('click', () => {
        this.selectedGovernorate = 'all';
        this.selectedCategory = 'all';
        this.searchQuery = '';
        this.displayLimit = 24;
        this.setScreen('home');
      });
    }

    // Hero Explore Now Button
    const heroExploreBtn = document.getElementById('btn-hero-explore');
    if (heroExploreBtn) {
      heroExploreBtn.addEventListener('click', () => {
        const sec = document.getElementById('quick-nav-bar') || document.getElementById('landmarks-grid-container');
        if (sec) {
          sec.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // PROMINENT SEARCH FORM & INPUT (Live surgical filtering + Enter/icon submit)
    const searchForm = document.getElementById('home-search-form');
    const searchInput = document.getElementById('home-search-input') as HTMLInputElement | null;

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = (e.target as HTMLInputElement).value;
        this.displayLimit = 24;
        this.updateHomeSearchResultsOnly();
      });
    }

    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (searchInput) {
          this.searchQuery = searchInput.value;
        }
        this.displayLimit = 24;
        this.updateHomeSearchResultsOnly();
        const landmarksSec = document.getElementById('landmarks-grid-container');
        if (landmarksSec) {
          landmarksSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // Quick Governorates Navigation Buttons (Requirement 2: Smooth Interactive Quick Jump)
    document.querySelectorAll('.quick-gov-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const govId = (e.currentTarget as HTMLElement).getAttribute('data-quick-gov') || 'all';
        this.selectedGovernorate = govId;
        this.displayLimit = 36;
        this.render();

        // Smoothly scroll to the landmarks section
        setTimeout(() => {
          const landmarksSec = document.getElementById('landmarks-grid-container');
          if (landmarksSec) {
            landmarksSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          // Center the active pill in the quick nav bar
          const activePill = document.querySelector(`[data-quick-gov="${govId}"]`);
          if (activePill) {
            activePill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
        }, 80);
      });
    });

    // Horizontal scroll arrow buttons for Governorates Quick Bar
    const scrollGovsLeft = document.getElementById('btn-scroll-govs-left');
    const scrollGovsRight = document.getElementById('btn-scroll-govs-right');
    const quickNavBar = document.getElementById('quick-nav-bar');
    if (scrollGovsLeft && quickNavBar) {
      scrollGovsLeft.addEventListener('click', () => {
        quickNavBar.scrollBy({ left: -180, behavior: 'smooth' });
      });
    }
    if (scrollGovsRight && quickNavBar) {
      scrollGovsRight.addEventListener('click', () => {
        quickNavBar.scrollBy({ left: 180, behavior: 'smooth' });
      });
    }

    // Search suggestion chips
    document.querySelectorAll('.search-suggestion-chip').forEach((chip) => {
      chip.addEventListener('click', (e) => {
        const query = (e.currentTarget as HTMLElement).getAttribute('data-search-chip');
        if (query) {
          this.searchQuery = query;
          this.displayLimit = 24;
          if (searchInput) {
            searchInput.value = query;
          }
          this.updateHomeSearchResultsOnly();
          const landmarksSec = document.getElementById('landmarks-grid-container');
          if (landmarksSec) {
            landmarksSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });

    // Category Buttons
    document.querySelectorAll('.cat-filter-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const cat = (e.currentTarget as HTMLElement).getAttribute('data-cat') || 'all';
        this.selectedCategory = this.selectedCategory === cat ? 'all' : cat;
        this.displayLimit = 24;
        this.render();
      });
    });

    const resetCategoryBtn = document.getElementById('btn-reset-category');
    if (resetCategoryBtn) {
      resetCategoryBtn.addEventListener('click', () => {
        this.selectedCategory = 'all';
        this.displayLimit = 24;
        this.render();
      });
    }

    // Governorate filter card clicks
    document.querySelectorAll('.gov-filter-card').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const gov = (e.currentTarget as HTMLElement).getAttribute('data-gov') || 'all';
        this.selectedGovernorate = gov;
        this.displayLimit = 36;
        this.render();

        setTimeout(() => {
          const landmarksSec = document.getElementById('landmarks-grid-container');
          if (landmarksSec) {
            landmarksSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 80);
      });
    });

    const resetGovBtn = document.getElementById('btn-reset-gov');
    if (resetGovBtn) {
      resetGovBtn.addEventListener('click', () => {
        this.selectedGovernorate = 'all';
        this.displayLimit = 24;
        this.render();
      });
    }

    this.attachDynamicHomeListeners();

    // Detail Screen: Back button
    const backDetailBtn = document.getElementById('btn-back-detail');
    if (backDetailBtn) {
      backDetailBtn.addEventListener('click', () => {
        this.setScreen('home');
      });
    }

    // Detail Screen: Audio Guide toggle
    const detailAudioBtn = document.getElementById('btn-detail-audio');
    if (detailAudioBtn && this.activeLandmark) {
      detailAudioBtn.addEventListener('click', () => {
        if (this.activeLandmark) {
          this.toggleAudioGuide(this.activeLandmark);
        }
      });
    }

    // Detail Screen: Thumbnail gallery switch
    document.querySelectorAll('.gallery-thumb-btn').forEach((thumb) => {
      thumb.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const newSrc = target.getAttribute('data-thumb-src');
        const idx = target.getAttribute('data-thumb-index');
        const total = target.getAttribute('data-thumb-total');
        const mainImg = document.getElementById('detail-main-image') as HTMLImageElement;
        const counterEl = document.getElementById('detail-gallery-counter');

        if (mainImg && newSrc) {
          mainImg.style.opacity = '0.4';
          setTimeout(() => {
            mainImg.src = newSrc;
            mainImg.style.opacity = '1';
          }, 150);
        }
        if (counterEl && idx && total) {
          counterEl.textContent = `${idx} / ${total}`;
        }
        document.querySelectorAll('.gallery-thumb-btn').forEach((btn) => {
          btn.classList.remove('border-[#d4af37]', 'ring-2', 'ring-[#d4af37]/40');
          btn.classList.add('border-transparent', 'opacity-80');
        });
        target.classList.remove('border-transparent', 'opacity-80');
        target.classList.add('border-[#d4af37]', 'ring-2', 'ring-[#d4af37]/40');
      });
    });

    // Favorites Screen buttons
    const clearFavsBtn = document.getElementById('btn-clear-all-favs');
    if (clearFavsBtn) {
      clearFavsBtn.addEventListener('click', () => {
        this.favorites.clear();
        this.saveFavorites();
        this.render();
      });
    }

    const favGoHomeBtn = document.getElementById('btn-fav-go-home');
    if (favGoHomeBtn) {
      favGoHomeBtn.addEventListener('click', () => {
        this.setScreen('home');
      });
    }

    // Settings Screen actions
    const openLangModalBtn = document.getElementById('btn-open-lang-modal');
    if (openLangModalBtn) {
      openLangModalBtn.addEventListener('click', () => {
        this.showLanguageModal = true;
        this.render();
      });
    }

    const toggleThemeBtn = document.getElementById('btn-toggle-theme');
    if (toggleThemeBtn) {
      toggleThemeBtn.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    // Modal close events
    const closeLangModalBtn = document.getElementById('btn-close-lang-modal');
    if (closeLangModalBtn) {
      closeLangModalBtn.addEventListener('click', () => {
        this.showLanguageModal = false;
        this.render();
      });
    }

    document.querySelectorAll('.lang-modal-option-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const code = (e.currentTarget as HTMLElement).getAttribute('data-lang') as LanguageCode;
        if (code) {
          this.setLanguage(code);
          this.showLanguageModal = false;
          this.render();
        }
      });
    });

    const closeNotifBtn = document.getElementById('btn-close-notif-modal');
    const dismissNotifBtn = document.getElementById('btn-dismiss-notif');
    const dismissAction = () => {
      this.showNotifications = false;
      this.render();
    };
    if (closeNotifBtn) closeNotifBtn.addEventListener('click', dismissAction);
    if (dismissNotifBtn) dismissNotifBtn.addEventListener('click', dismissAction);

    // Drawer events
    const closeDrawerBtn = document.getElementById('btn-close-drawer');
    const drawerBackdrop = document.getElementById('drawer-backdrop');
    const closeDrawerAction = () => {
      this.showDrawer = false;
      this.render();
    };
    if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawerAction);
    if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawerAction);

    document.querySelectorAll('[data-drawer-nav]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const sc = (e.currentTarget as HTMLElement).getAttribute('data-drawer-nav') as Screen;
        this.showDrawer = false;
        if (sc) this.setScreen(sc);
      });
    });

    document.querySelectorAll('[data-drawer-gov]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const gov = (e.currentTarget as HTMLElement).getAttribute('data-drawer-gov');
        this.showDrawer = false;
        if (gov) {
          this.selectedGovernorate = gov;
          this.displayLimit = 36;
          this.setScreen('home');
          setTimeout(() => {
            const landmarksSec = document.getElementById('landmarks-grid-container');
            if (landmarksSec) {
              landmarksSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 80);
        }
      });
    });

    const drawerLangBtn = document.getElementById('btn-drawer-lang');
    if (drawerLangBtn) {
      drawerLangBtn.addEventListener('click', () => {
        this.showDrawer = false;
        this.showLanguageModal = true;
        this.render();
      });
    }
  }

  private updateHomeSearchResultsOnly() {
    const filteredLandmarks = this.getFilteredLandmarks();
    const popularLandmarks = LANDMARKS.filter((l) => l.isPopular);
    const activeGovInfo = getGovById(this.selectedGovernorate);

    const clearSlot = document.getElementById('home-search-clear-slot');
    if (clearSlot) {
      clearSlot.innerHTML = this.searchQuery
        ? `
        <button type="button" id="btn-clear-search" class="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer" title="${this.t('close')}">
          ${Icons.close(18)}
        </button>
      `
        : '';
    }

    const activeFiltersSlot = document.getElementById('home-active-filters-slot');
    if (activeFiltersSlot) {
      activeFiltersSlot.innerHTML = this.renderActiveFiltersBar(activeGovInfo);
    }

    const featuredSlot = document.getElementById('home-featured-carousel-slot');
    if (featuredSlot) {
      featuredSlot.innerHTML = this.renderFeaturedCarouselSection(popularLandmarks);
    }

    const gridContainer = document.getElementById('landmarks-grid-container');
    if (gridContainer) {
      gridContainer.innerHTML = this.renderLandmarksGridContent(filteredLandmarks);
    }

    this.attachDynamicHomeListeners();
  }

  private attachDynamicHomeListeners() {
    const clearSearch = () => {
      this.searchQuery = '';
      this.displayLimit = 24;
      const searchInput = document.getElementById('home-search-input') as HTMLInputElement | null;
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      this.updateHomeSearchResultsOnly();
    };

    const clearSearchBtn = document.getElementById('btn-clear-search');
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', clearSearch);
    }

    const inlineClearSearchBtn = document.getElementById('btn-inline-clear-search');
    if (inlineClearSearchBtn) {
      inlineClearSearchBtn.addEventListener('click', clearSearch);
    }

    const removeSearchTag = document.getElementById('btn-remove-search-tag');
    if (removeSearchTag) {
      removeSearchTag.addEventListener('click', clearSearch);
    }

    const removeCatTag = document.getElementById('btn-remove-cat-tag');
    if (removeCatTag) {
      removeCatTag.addEventListener('click', () => {
        this.selectedCategory = 'all';
        this.render();
      });
    }

    const removeGovTag = document.getElementById('btn-remove-gov-tag');
    if (removeGovTag) {
      removeGovTag.addEventListener('click', () => {
        this.selectedGovernorate = 'all';
        this.render();
      });
    }

    const searchAllGovsBtn = document.getElementById('btn-search-all-govs');
    if (searchAllGovsBtn) {
      searchAllGovsBtn.addEventListener('click', () => {
        this.selectedGovernorate = 'all';
        this.selectedCategory = 'all';
        this.displayLimit = 24;
        this.render();
      });
    }

    const clearAllFiltersBar = document.getElementById('btn-clear-all-filters-bar');
    if (clearAllFiltersBar) {
      clearAllFiltersBar.addEventListener('click', () => {
        this.selectedGovernorate = 'all';
        this.selectedCategory = 'all';
        this.searchQuery = '';
        this.displayLimit = 24;
        this.render();
      });
    }

    const clearAllFiltersBtn = document.getElementById('btn-clear-all-filters');
    if (clearAllFiltersBtn) {
      clearAllFiltersBtn.addEventListener('click', () => {
        this.selectedGovernorate = 'all';
        this.selectedCategory = 'all';
        this.searchQuery = '';
        this.displayLimit = 24;
        this.render();
      });
    }

    // Load More Button
    const loadMoreBtn = document.getElementById('btn-load-more');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        this.displayLimit += 24;
        const gridContainer = document.getElementById('landmarks-grid-container');
        if (gridContainer) {
          gridContainer.innerHTML = this.renderLandmarksGridContent(this.getFilteredLandmarks());
          this.attachDynamicHomeListeners();
        } else {
          this.render();
        }
      });
    }

    // Landmark Card Clicks -> Detail Screen
    document.querySelectorAll('.landmark-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('.btn-toggle-favorite') || (e.target as HTMLElement).closest('.btn-card-map')) {
          return;
        }
        const landmarkId = (e.currentTarget as HTMLElement).getAttribute('data-landmark-id');
        if (landmarkId) {
          this.setScreen('detail', landmarkId);
        }
      });
    });

    // Favorite toggle button clicks
    document.querySelectorAll('.btn-toggle-favorite').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const favId = (e.currentTarget as HTMLElement).getAttribute('data-fav-id');
        if (favId) {
          this.toggleFavorite(favId);
        }
      });
    });
  }

  private escapeHtml(str: string): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Instantiate App once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new EgyptExplorerApp());
} else {
  new EgyptExplorerApp();
}
