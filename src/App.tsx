import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Clock, Search, BookOpen, Library, Users, Scale, ChevronLeft, ChevronRight, Moon, Sun, FileText, Calendar, Globe, Shield, Menu } from 'lucide-react';
import { METHODOLOGY_CONTENT } from './data/methodology';
import { FATWAS_CONTENT } from './data/fatwas';
import { TAHAMI_CONTENT } from './data/tahami';
import { MAHDI_CONTENT } from './data/mahdi';

// Firebase Imports
import { db } from './firebase';
import { ref, onValue } from 'firebase/database';

type Language = 'ar' | 'ku';

const SECTIONS = [
  { id: 'quran', ar: 'القرآن الكريم', ku: "قورئانی پیرۆز", icon: BookOpen, color: 'from-emerald-500 to-teal-700' },
  { id: 'methodology', ar: 'منهج الحركة', ku: 'پەیڕەوی بزووتنەوە', icon: Scale, color: 'from-amber-500 to-orange-700' },
  { id: 'tahami', ar: 'الشيخ حسن التهامي', ku: 'شێخ حەسەن توهامی', icon: Library, imageUrl: 'https://drive.google.com/thumbnail?id=1mSBm7w9dMVxQFOnUDXe7l8kCL1Sk4E7z&sz=w1000', color: 'from-blue-500 to-indigo-700' },
  { id: 'scholars', ar: 'مشايخ الحركة', ku: 'شێخەکانی بزووتنەوە', icon: Users, color: 'from-purple-500 to-fuchsia-700' },
  { id: 'fatwas', ar: 'فتاوى أبو داود الحسامي', ku: 'فەتوایەکانی ئەبو داود حوسامی', icon: FileText, imageUrl: 'https://drive.google.com/thumbnail?id=1LzhTRRIELHGJVPgmQKHyAMOv3DU0I5Dp&sz=w1000', color: 'from-rose-500 to-red-700' },
  { id: 'warplan', ar: 'خطة حرب في السلام', ku: 'پلانی جەنگ لە ئاشتیدا', icon: Shield, color: 'from-red-600 to-red-900' },
];

const HADITH_API_BOOKS = [
  { id: 'ara-bukhari', title_ar: 'صحيح البخاري', title_ku: 'سەحیحی بوخاری', description_ar: 'أصح كتاب بعد كتاب الله', description_ku: 'ڕاستترین کتێب دوای قورئان' },
  { id: 'ara-muslim', title_ar: 'صحيح مسلم', title_ku: 'سەحیحی موسلیم', description_ar: 'ثاني أصح الكتب', description_ku: 'دووەم ڕاستترین کتێب' },
  { id: 'ara-abudawud', title_ar: 'سنن أبي داود', title_ku: 'سونەنی ئەبو داود', description_ar: 'من السنن الأربعة', description_ku: 'لە سونەنە چوارەکان' },
  { id: 'ara-tirmidhi', title_ar: 'جامع الترمذي', title_ku: 'جامعی ترمذی', description_ar: 'من السنن الأربعة', description_ku: 'لە سونەنە چوارەکان' },
  { id: 'ara-nasai', title_ar: 'سنن النسائي', title_ku: 'سونەنی نەسائی', description_ar: 'من السنن الأربعة', description_ku: 'لە سونەنە چوارەکان' },
  { id: 'ara-ibnmajah', title_ar: 'سنن ابن ماجه', title_ku: 'سونەنی ابن ماجە', description_ar: 'من السنن الأربعة', description_ku: 'لە سونەنە چوارەکان' },
];

const PRAYERS = [
  { ar: 'الفجر', ku: 'بەیانی' },
  { ar: 'الشروق', ku: 'خۆرهەڵاتن' },
  { ar: 'الظهر', ku: 'نیوەڕۆ' },
  { ar: 'العصر', ku: 'عەسر' },
  { ar: 'المغرب', ku: 'مەغریب' },
  { ar: 'العشاء', ku: 'عیشا' }
];

export default function App() {
  const [language, setLanguage] = useState<Language | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedMahdiPost, setSelectedMahdiPost] = useState<string | null>(null);
  const [currentHadith, setCurrentHadith] = useState(0);

  const [books, setBooks] = useState<any[]>([]);
  const [quranSurahs, setQuranSurahs] = useState<any[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<any>(null);
  const [ayahs, setAyahs] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [hadiths, setHadiths] = useState<any[]>([]);
  const [homeHadiths, setHomeHadiths] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [libraryTab, setLibraryTab] = useState<'local' | 'api'>('local');
  const [selectedApiBook, setSelectedApiBook] = useState<any>(null);
  const [apiHadiths, setApiHadiths] = useState<any[]>([]);
  const [apiHadithsPage, setApiHadithsPage] = useState(1);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Firebase Data Loading
  useEffect(() => {
    // 1. Fetch Quran
    const quranRef = ref(db, 'quran');
    onValue(quranRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setQuranSurahs(Object.values(data));
    });

    // 2. Fetch Books
    const booksRef = ref(db, 'books');
    onValue(booksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setBooks(Object.values(data));
    });

    // 3. Fetch Home Hadiths
    const hadithRef = ref(db, 'homeHadiths');
    onValue(hadithRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setHomeHadiths(Object.values(data));
    });
  }, []);

  useEffect(() => {
    if (selectedSurah) {
      setIsLoading(true);
      // Fetching ayahs from local property or Firebase sub-node
      // For now, assuming ayahs are part of the surah object or fetched separately
      const ayahsRef = ref(db, `ayahs/${selectedSurah.id}`);
      onValue(ayahsRef, (snapshot) => {
        const data = snapshot.val();
        setAyahs(data ? Object.values(data) : []);
        setIsLoading(false);
      });
    }
  }, [selectedSurah]);

  useEffect(() => {
    if (homeHadiths.length === 0) return;
    const interval = setInterval(() => {
      setCurrentHadith((prev) => (prev + 1) % homeHadiths.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [homeHadiths.length]);

  if (!language) {
    return (
      <div dir="rtl" className="min-h-screen bg-black text-white overflow-hidden flex flex-col items-center justify-center relative font-sans">
        <div className="absolute inset-0 z-0">
          <img src="https://drive.google.com/thumbnail?id=1jKO7K2mBbRx8EKs9uvDddXrCtjyKUMaA&sz=w1920" alt="Background" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black" />
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="z-10 flex flex-col items-center w-full max-w-sm px-6">
          <div className="w-28 h-28 rounded-full bg-amber-500/10 flex items-center justify-center mb-10 border border-amber-500/30 backdrop-blur-md">
            <Globe className="w-14 h-14 text-amber-400" />
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 mb-12 text-center">
            اختر اللغة <span className="block text-3xl mt-4 opacity-90">زمان هەڵبژێرە</span>
          </h1>
          <div className="flex flex-col gap-5 w-full">
            <button onClick={() => setLanguage('ar')} className="bg-white/5 border border-amber-500/30 p-5 rounded-2xl text-2xl font-bold text-amber-400">العربية</button>
            <button onClick={() => setLanguage('ku')} className="bg-white/5 border border-amber-500/30 p-5 rounded-2xl text-2xl font-bold text-amber-400">کوردی</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-black text-slate-200 font-sans overflow-hidden flex flex-col">
      <div className="fixed inset-0 z-0 opacity-40">
        <img src="https://drive.google.com/thumbnail?id=1jKO7K2mBbRx8EKs9uvDddXrCtjyKUMaA&sz=w1920" alt="BG" className="w-full h-full object-cover" />
      </div>

      <main className="flex-1 relative z-10 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && !selectedSection && (
            <motion.div key="home" className="p-6 max-w-md mx-auto w-full">
              <div className="flex justify-between items-center mb-8 pt-4">
                <h1 className="text-2xl font-bold text-amber-500">{language === 'ar' ? 'حركة أنصار المهدي' : 'بزووتنەوەی پشتیوانانی مەهدی'}</h1>
                <button onClick={() => setLanguage(null)} className="p-2 bg-white/5 rounded-full"><Globe className="w-5 h-5" /></button>
              </div>

              <div className="h-56 mb-10 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-center p-6 text-center">
                {homeHadiths.length > 0 ? (
                   <p className="text-xl text-white font-serif">"{language === 'ar' ? homeHadiths[currentHadith].text_ar : homeHadiths[currentHadith].text_ku}"</p>
                ) : <p>...</p>}
              </div>

              <div className="space-y-4">
                {SECTIONS.map((section) => (
                  <button key={section.id} onClick={() => setSelectedSection(section.id)} className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center`}>
                      <section.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-lg font-medium">{section[language]}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {selectedSection === 'quran' && (
            <motion.div key="quran-list" className="p-6 max-w-md mx-auto w-full">
              <button onClick={() => setSelectedSection(null)} className="text-emerald-500 mb-6 flex items-center gap-2"><ChevronRight /> {language === 'ar' ? 'رجوع' : 'گەڕانەوە'}</button>
              <div className="space-y-3">
                {quranSurahs.map((surah) => (
                  <button key={surah.id} onClick={() => setSelectedSurah(surah)} className="w-full bg-white/5 p-4 rounded-xl flex justify-between">
                    <span>{language === 'ar' ? surah.name_ar : surah.name_ku}</span>
                    <span className="text-emerald-500">{surah.surah_number}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="fixed bottom-4 left-0 right-0 z-50 px-4">
         <div className="max-w-md mx-auto bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-2 flex justify-around">
            <button onClick={() => setActiveTab('home')} className={`p-3 ${activeTab === 'home' ? 'text-amber-500' : 'text-slate-500'}`}><Home /></button>
            <button onClick={() => setActiveTab('library')} className={`p-3 ${activeTab === 'library' ? 'text-amber-500' : 'text-slate-500'}`}><Library /></button>
            <button onClick={() => setActiveTab('prayer')} className={`p-3 ${activeTab === 'prayer' ? 'text-amber-500' : 'text-slate-500'}`}><Clock /></button>
         </div>
      </div>
    </div>
  );
}
