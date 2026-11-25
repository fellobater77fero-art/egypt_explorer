import { LanguageCode } from './i18n';
import rawData from './landmarks1120.json';

export interface Landmark {
  id: string;
  sheetNumber: number;
  governorate: string;
  governorateAr: string;
  governorateEn: string;
  governorateFr: string;
  governorateEs: string;
  governorateDe: string;
  category: 'monuments' | 'museums' | 'places' | 'arts' | 'crafts';
  categoryAr: string;
  name: string;
  nameAr: string;
  nameFr: string;
  nameEs: string;
  nameDe: string;
  location: string;
  locationAr: string;
  locationFr: string;
  locationEs: string;
  locationDe: string;
  description: string;
  descriptionAr: string;
  descriptionFr: string;
  descriptionEs: string;
  descriptionDe: string;
  rating: number;
  reviewCount: number;
  isPopular: boolean;
  googleMapsUrl: string;
  image: string;
  gallery: string[];
  openingHours: Record<LanguageCode, string>;
  ticketPrice: {
    foreigner: string;
    local: string;
    student: string;
  };
}

export interface GovernorateInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  nameFr: string;
  nameEs: string;
  nameDe: string;
  count: number;
  region: string;
  heroImage: string;
  badge: string;
}

export interface CategoryInfo {
  id: 'all' | 'monuments' | 'museums' | 'places' | 'arts' | 'crafts';
  count: number;
  nameEn: string;
  nameAr: string;
  nameFr: string;
  nameEs: string;
  nameDe: string;
}

// 27 Egyptian Governorates with exact counts summing to 1119
export const GOVERNORATES: GovernorateInfo[] = [
  { id: 'cairo', nameAr: 'القاهرة', nameEn: 'Cairo', nameFr: 'Le Caire', nameEs: 'El Cairo', nameDe: 'Kairo', count: 109, region: 'Greater Cairo', heroImage: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=600&q=80', badge: 'عاصمة التاريخ' },
  { id: 'giza', nameAr: 'الجيزة', nameEn: 'Giza', nameFr: 'Gizeh', nameEs: 'Guiza', nameDe: 'Gizeh', count: 75, region: 'Greater Cairo', heroImage: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/Pyramid_of_Khafre_and_Sphinx%2C_Giza%2C_Greater_Cairo%2C_Egypt.jpg/960px-Pyramid_of_Khafre_and_Sphinx%2C_Giza%2C_Greater_Cairo%2C_Egypt.jpg', badge: 'أهرامات الجيزة' },
  { id: 'luxor', nameAr: 'الأقصر', nameEn: 'Luxor', nameFr: 'Louxor', nameEs: 'Lúxor', nameDe: 'Luxor', count: 90, region: 'Upper Egypt', heroImage: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c8/Karnak_Khonsu_Temple_R01.jpg/960px-Karnak_Khonsu_Temple_R01.jpg', badge: 'ثلث آثار العالم' },
  { id: 'aswan', nameAr: 'أسوان', nameEn: 'Aswan', nameFr: 'Assouan', nameEs: 'Asuán', nameDe: 'Assuan', count: 65, region: 'Upper Egypt', heroImage: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/Philae_Temple_SFEC-ASWAN-2009-080.jpg/960px-Philae_Temple_SFEC-ASWAN-2009-080.jpg', badge: 'بلاد الذهب والنوبة' },
  { id: 'alexandria', nameAr: 'الإسكندرية', nameEn: 'Alexandria', nameFr: 'Alexandrie', nameEs: 'Alejandría', nameDe: 'Alexandria', count: 70, region: 'Mediterranean', heroImage: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3c/Qaitbay_Citadel%2C_Alexandria%2C_Egypt.jpg/960px-Qaitbay_Citadel%2C_Alexandria%2C_Egypt.jpg', badge: 'عروس البحر المتوسط' },
  { id: 'south_sinai', nameAr: 'جنوب سيناء', nameEn: 'South Sinai', nameFr: 'Sinaï Sud', nameEs: 'Sinaí del Sur', nameDe: 'Süd-Sinai', count: 55, region: 'Sinai', heroImage: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/58/Saint_Catherine%27s_Monastery_%28Sinai-2005%29.jpg/960px-Saint_Catherine%27s_Monastery_%28Sinai-2005%29.jpg', badge: 'شرم الشيخ ودهب' },
  { id: 'red_sea', nameAr: 'البحر الأحمر', nameEn: 'Red Sea', nameFr: 'Mer Rouge', nameEs: 'Mar Rojo', nameDe: 'Rotes Meer', count: 50, region: 'Red Sea', heroImage: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/45/Hurghada_Marina.jpg/960px-Hurghada_Marina.jpg', badge: 'الغردقة والجونة' },
  { id: 'matrouh', nameAr: 'مطروح وسيوة', nameEn: 'Matrouh & Siwa', nameFr: 'Matrouh & Siwa', nameEs: 'Matrouh y Siwa', nameDe: 'Matrouh & Siwa', count: 45, region: 'Western Desert', heroImage: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/30/Shali_Fortress02.jpg/960px-Shali_Fortress02.jpg', badge: 'واحة سيوة والعلمين' },
  { id: 'faiyum', nameAr: 'الفيوم', nameEn: 'Faiyum', nameFr: 'Fayoum', nameEs: 'Faiyum', nameDe: 'Fajjum', count: 40, region: 'Middle Egypt', heroImage: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/df/Wadi_Hitan_%28Whale_Valley%29_Panorama.jpg/960px-Wadi_Hitan_%28Whale_Valley%29_Panorama.jpg', badge: 'وادي الحيتان' },
  { id: 'minya', nameAr: 'المنيا', nameEn: 'Minya', nameFr: 'Minya', nameEs: 'Minia', nameDe: 'Minya', count: 40, region: 'Middle Egypt', heroImage: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/38/Amarna_centre11.jpg/960px-Amarna_centre11.jpg', badge: 'عروس الصعيد' },
  { id: 'sohag', nameAr: 'سوهاج', nameEn: 'Sohag', nameFr: 'Sohag', nameEs: 'Sohag', nameDe: 'Sohag', count: 40, region: 'Upper Egypt', heroImage: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/df/GD-EG-Abydos001.JPG/960px-GD-EG-Abydos001.JPG', badge: 'أبيدوس وميريت آمون' },
  { id: 'qena', nameAr: 'قنا', nameEn: 'Qena', nameFr: 'Qena', nameEs: 'Qena', nameDe: 'Qena', count: 35, region: 'Upper Egypt', heroImage: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/Dendera_Temple.jpg/960px-Dendera_Temple.jpg', badge: 'معبد دندرة' },
  { id: 'new_valley', nameAr: 'الوادي الجديد', nameEn: 'New Valley', nameFr: 'Nouvelle-Vallée', nameEs: 'Nuevo Valle', nameDe: 'Neues Tal', count: 40, region: 'Western Desert', heroImage: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/White_Desert%2C_Egypt.jpg/960px-White_Desert%2C_Egypt.jpg', badge: 'الصحراء البيضاء' },
  { id: 'port_said', nameAr: 'بورسعيد', nameEn: 'Port Said', nameFr: 'Port-Saïd', nameEs: 'Puerto Saíd', nameDe: 'Port Said', count: 30, region: 'Canal Zone', heroImage: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/Fanar_sasa.JPG/960px-Fanar_sasa.JPG', badge: 'المدينة الباسلة' },
  { id: 'damietta', nameAr: 'دمياط', nameEn: 'Damietta', nameFr: 'Damiette', nameEs: 'Damieta', nameDe: 'Damiette', count: 30, region: 'Delta Coast', heroImage: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/Ras_El_Bar.jpg/960px-Ras_El_Bar.jpg', badge: 'رأس البر وملتقى النيل' },
  { id: 'dakahlia', nameAr: 'الدقهلية', nameEn: 'Dakahlia', nameFr: 'Dakahlia', nameEs: 'Dakahleya', nameDe: 'Daqahliyya', count: 30, region: 'Nile Delta', heroImage: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/MansuraLuqmanEntrance.jpg', badge: 'المنصورة ودار ابن لقمان' },
  { id: 'sharqia', nameAr: 'الشرقية', nameEn: 'Sharqia', nameFr: 'Charqiya', nameEs: 'Sharkia', nameDe: 'Asch-Scharqiyya', count: 30, region: 'Nile Delta', heroImage: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Bubastis_001.JPG/960px-Bubastis_001.JPG', badge: 'تل بسطة وتانيس' },
  { id: 'beheira', nameAr: 'البحيرة', nameEn: 'Beheira', nameFr: 'Beheira', nameEs: 'Beheira', nameDe: 'Al-Buhaira', count: 30, region: 'Nile Delta', heroImage: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/RashidQaitBey.jpg', badge: 'رشيد وحجر رشيد' },
  { id: 'ismailia', nameAr: 'الإسماعيلية', nameEn: 'Ismailia', nameFr: 'Ismaïlia', nameEs: 'Ismailía', nameDe: 'Ismailia', count: 25, region: 'Canal Zone', heroImage: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/IsmailiaMuseumOutside.jpg', badge: 'مدينة السحر والجمال' },
  { id: 'suez', nameAr: 'السويس', nameEn: 'Suez', nameFr: 'Suez', nameEs: 'Suez', nameDe: 'Sues', count: 25, region: 'Canal Zone', heroImage: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/80/SuezNationalMuseum.jpg/960px-SuezNationalMuseum.jpg', badge: 'عيون موسى وبورتوفيق' },
  { id: 'north_sinai', nameAr: 'شمال سيناء', nameEn: 'North Sinai', nameFr: 'Sinaï Nord', nameEs: 'Sinaí del Norte', nameDe: 'Nord-Sinai', count: 25, region: 'Sinai', heroImage: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/%D8%B4%D8%A7%D8%B7%D8%A6_%D9%85%D8%AF%D9%8A%D9%86%D8%A9_%D8%A7%D9%84%D8%B9%D8%B1%D9%8A%D8%B4.jpg/960px-%D8%B4%D8%A7%D8%B7%D8%A6_%D9%85%D8%AF%D9%8A%D9%86%D8%A9_%D8%A7%D9%84%D8%B9%D8%B1%D9%8A%D8%B4.jpg', badge: 'الفيروز والعريش' },
  { id: 'kafr_el_sheikh', nameAr: 'كفر الشيخ', nameEn: 'Kafr El Sheikh', nameFr: 'Kafr el-Cheik', nameEs: 'Kafr el Sheij', nameDe: 'Kafr asch-Schaich', count: 25, region: 'Nile Delta', heroImage: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Buto1-Desouk.jpg', badge: 'بوتو والبرلس' },
  { id: 'gharbia', nameAr: 'الغربية', nameEn: 'Gharbia', nameFr: 'Gharbeya', nameEs: 'Gharbia', nameDe: 'Al-Gharbiyya', count: 25, region: 'Nile Delta', heroImage: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Mosque_of_St._Ahmed_El-Badawi.jpg/960px-Mosque_of_St._Ahmed_El-Badawi.jpg', badge: 'طنطا والسيد البدوي' },
  { id: 'monufia', nameAr: 'المنوفية', nameEn: 'Monufia', nameFr: 'Menoufia', nameEs: 'Monufia', nameDe: 'Al-Minufiyya', count: 25, region: 'Nile Delta', heroImage: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/21/A_mural_painting_of_the_Denshawai_Incident%2C_Mustafa_Kamel_Museum.jpg/960px-A_mural_painting_of_the_Denshawai_Incident%2C_Mustafa_Kamel_Museum.jpg', badge: 'دنشواي والسادات' },
  { id: 'qalyubia', nameAr: 'القليوبية', nameEn: 'Qalyubia', nameFr: 'Qalyubiya', nameEs: 'Qaliubia', nameDe: 'Al-Qalyubiyya', count: 25, region: 'Nile Delta', heroImage: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/Elqnater_elkhayria.jpg/960px-Elqnater_elkhayria.jpg', badge: 'القناطر الخيرية' },
  { id: 'beni_suef', nameAr: 'بني سويف', nameEn: 'Beni Suef', nameFr: 'Beni Souef', nameEs: 'Beni Suef', nameDe: 'Bani Suwaif', count: 20, region: 'Middle Egypt', heroImage: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f4/Meidum_Pyramide.jpg/960px-Meidum_Pyramide.jpg', badge: 'هرم ميدوم وكهف سنور' },
  { id: 'asyut', nameAr: 'أسيوط', nameEn: 'Asyut', nameFr: 'Assiout', nameEs: 'Asiut', nameDe: 'Asyut', count: 20, region: 'Middle Egypt', heroImage: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/%D8%AF%D9%8A%D8%B1_%D8%A7%D9%84%D8%B3%D9%8A%D8%AF%D8%A9_%D8%A7%D9%84%D8%B9%D8%B0%D8%B1%D8%A7%D8%A1_%D8%A8%D8%AC%D8%A8%D9%84_%D8%AF%D8%B1%D9%86%D9%83%D8%A9.JPG/960px-%D8%AF%D9%8A%D8%B1_%D8%A7%D9%84%D8%B3%D9%8A%D8%AF%D8%A9_%D8%A7%D9%84%D8%B9%D8%B0%D8%B1%D8%A7%D8%A1_%D8%A8%D8%AC%D8%A8%D9%84_%D8%AF%D8%B1%D9%86%D9%83%D8%A9.JPG', badge: 'درنكة والدير المحرق' },
];

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'all',
    count: 1119,
    nameEn: 'All Landmarks',
    nameAr: 'جميع المعالم (١١١٩)',
    nameFr: 'Tous les Sites',
    nameEs: 'Todos los Monumentos',
    nameDe: 'Alle Stätten',
  },
  {
    id: 'monuments',
    count: 480,
    nameEn: 'Ancient & Historical Monuments',
    nameAr: 'الآثار القديمة والتاريخية',
    nameFr: 'Monuments Anciens & Histoire',
    nameEs: 'Monumentos Antiguos e Historia',
    nameDe: 'Antike & Historische Denkmäler',
  },
  {
    id: 'museums',
    count: 220,
    nameEn: 'Museums & Palaces',
    nameAr: 'المتاحف والقصور الأثرية',
    nameFr: 'Musées & Palais Royaux',
    nameEs: 'Museos y Palacios Reales',
    nameDe: 'Museen & Paläste',
  },
  {
    id: 'places',
    count: 180,
    nameEn: 'Tourist & Leisure Destinations',
    nameAr: 'الأماكن السياحية والترفيهية',
    nameFr: 'Destinations Touristiques & Loisirs',
    nameEs: 'Lugares Turísticos y Ocio',
    nameDe: 'Tourismus- & Freizeitziele',
  },
  {
    id: 'arts',
    count: 120,
    nameEn: 'Arts & Cultural Centers',
    nameAr: 'مراكز الفنون والثقافة',
    nameFr: 'Centres d\'Art & Culture',
    nameEs: 'Centros de Arte y Cultura',
    nameDe: 'Kunst- & Kulturzentren',
  },
  {
    id: 'crafts',
    count: 120,
    nameEn: 'Traditional & Heritage Crafts',
    nameAr: 'مراكز الحرف التقليدية والتراثية',
    nameFr: 'Artisanat Traditionnel',
    nameEs: 'Artesanías Tradicionales',
    nameDe: 'Traditionelles Handwerk',
  },
];

export const LANDMARKS: Landmark[] = rawData as Landmark[];

// Dynamically compute exact landmark counts per governorate directly from dataset rows
export const GOVERNORATE_COUNTS: Record<string, number> = LANDMARKS.reduce(
  (acc, item) => {
    acc[item.governorate] = (acc[item.governorate] || 0) + 1;
    return acc;
  },
  {} as Record<string, number>
);

// Sync GOVERNORATES[].count dynamically with the exact row counts
GOVERNORATES.forEach((gov) => {
  if (typeof GOVERNORATE_COUNTS[gov.id] === 'number') {
    gov.count = GOVERNORATE_COUNTS[gov.id];
  }
});

// Sync CATEGORIES[].count dynamically with the exact row counts
const CATEGORY_COUNTS: Record<string, number> = LANDMARKS.reduce(
  (acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  },
  {} as Record<string, number>
);
CATEGORIES.forEach((cat) => {
  if (cat.id === 'all') {
    cat.count = LANDMARKS.length;
  } else if (typeof CATEGORY_COUNTS[cat.id] === 'number') {
    cat.count = CATEGORY_COUNTS[cat.id];
  }
});

export function getGovernorateLandmarkCount(govId: string): number {
  if (govId === 'all') return LANDMARKS.length;
  return GOVERNORATE_COUNTS[govId] ?? getGovById(govId)?.count ?? 0;
}

// Localization helper functions
export function getLocalizedLandmarkName(l: Landmark, lang: LanguageCode): string {
  if (lang === 'ar') return l.nameAr;
  if (lang === 'fr') return l.nameFr;
  if (lang === 'es') return l.nameEs;
  if (lang === 'de') return l.nameDe;
  return l.name;
}

export function getLocalizedLandmarkLoc(l: Landmark, lang: LanguageCode): string {
  if (lang === 'ar') return l.locationAr;
  if (lang === 'fr') return l.locationFr;
  if (lang === 'es') return l.locationEs;
  if (lang === 'de') return l.locationDe;
  return l.location;
}

export function getLocalizedLandmarkDesc(l: Landmark, lang: LanguageCode): string {
  if (lang === 'ar') return l.descriptionAr;
  if (lang === 'fr') return l.descriptionFr;
  if (lang === 'es') return l.descriptionEs;
  if (lang === 'de') return l.descriptionDe;
  return l.description;
}

export function getLocalizedHours(l: Landmark, lang: LanguageCode): string {
  return l.openingHours[lang] || l.openingHours.en;
}

export function getLocalizedCategoryName(catId: string, lang: LanguageCode): string {
  const c = CATEGORIES.find((item) => item.id === catId);
  if (!c) return catId;
  if (lang === 'ar') return c.nameAr;
  if (lang === 'fr') return c.nameFr;
  if (lang === 'es') return c.nameEs;
  if (lang === 'de') return c.nameDe;
  return c.nameEn;
}

export function getLocalizedGovName(gov: GovernorateInfo, lang: LanguageCode): string {
  if (lang === 'ar') return gov.nameAr;
  if (lang === 'fr') return gov.nameFr;
  if (lang === 'es') return gov.nameEs;
  if (lang === 'de') return gov.nameDe;
  return gov.nameEn;
}

export function getGovById(govId: string): GovernorateInfo | undefined {
  return GOVERNORATES.find((g) => g.id === govId);
}
