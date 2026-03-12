import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Clock, Search, BookOpen, Library, Users, Scale, ChevronLeft, ChevronRight, Moon, Sun, FileText, Calendar, Globe, Shield, Menu } from 'lucide-react';
import { METHODOLOGY_CONTENT } from './data/methodology';
import { FATWAS_CONTENT } from './data/fatwas';
import { TAHAMI_CONTENT } from './data/tahami';

import { MAHDI_CONTENT } from './data/mahdi';

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
  
  // Database states
  const [books, setBooks] = useState<any[]>([]);
  const [quranSurahs, setQuranSurahs] = useState<any[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<any>(null);
  const [ayahs, setAyahs] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [hadiths, setHadiths] = useState<any[]>([]);
  const [homeHadiths, setHomeHadiths] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Library API States
  const [libraryTab, setLibraryTab] = useState<'local' | 'api'>('local');
  const [selectedApiBook, setSelectedApiBook] = useState<any>(null);
  const [apiHadiths, setApiHadiths] = useState<any[]>([]);
  const [apiHadithsPage, setApiHadithsPage] = useState(1);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  
  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Fetch Books
    fetch('/api/books')
      .then(res => res.json())
      .then(data => setBooks(data))
      .catch(err => console.error(err));
      
    // Fetch Quran Surahs
    fetch('/api/quran')
      .then(res => res.json())
      .then(data => setQuranSurahs(data))
      .catch(err => console.error(err));

    // Fetch Hadiths for Home Carousel
    fetch('/api/hadiths')
      .then(res => res.json())
      .then(data => setHomeHadiths(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedSurah) {
      setIsLoading(true);
      fetch(`/api/quran/${selectedSurah.id}/ayahs`)
        .then(res => res.json())
        .then(data => {
          setAyahs(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [selectedSurah]);

  useEffect(() => {
    if (selectedBook) {
      setIsLoading(true);
      // We assume the book title in Arabic matches the 'source' in Hadiths
      // Or we can just fetch all hadiths and filter if we don't have a direct link
      fetch(`/api/hadiths?source=${encodeURIComponent(selectedBook.title_ar || selectedBook.title_ku)}`)
        .then(res => res.json())
        .then(data => {
          setHadiths(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [selectedBook]);

  useEffect(() => {
    if (homeHadiths.length === 0) return;
    const interval = setInterval(() => {
      setCurrentHadith((prev) => (prev + 1) % homeHadiths.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [homeHadiths.length]);

  // Language Gate Screen
  if (!language) {
    return (
      <div dir="rtl" className="min-h-screen bg-black text-white overflow-hidden flex flex-col items-center justify-center relative font-sans">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://drive.google.com/thumbnail?id=1jKO7K2mBbRx8EKs9uvDddXrCtjyKUMaA&sz=w1920"
            alt="Background"
            className="w-full h-full object-cover opacity-40 scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="z-10 flex flex-col items-center w-full max-w-sm px-6"
        >
          <div className="w-28 h-28 rounded-full bg-amber-500/10 flex items-center justify-center mb-10 border border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.15)] backdrop-blur-md">
            <Globe className="w-14 h-14 text-amber-400" />
          </div>
          
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 mb-12 text-center leading-tight">
            اختر اللغة
            <span className="block text-3xl mt-4 opacity-90">زمان هەڵبژێرە</span>
          </h1>

          <div className="flex flex-col gap-5 w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setLanguage('ar')}
              className="relative overflow-hidden group bg-white/5 border border-amber-500/30 hover:border-amber-500 p-5 rounded-2xl transition-all duration-300 backdrop-blur-sm shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="text-2xl font-bold text-amber-400 relative z-10">العربية</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setLanguage('ku')}
              className="relative overflow-hidden group bg-white/5 border border-amber-500/30 hover:border-amber-500 p-5 rounded-2xl transition-all duration-300 backdrop-blur-sm shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="text-2xl font-bold text-amber-400 relative z-10">کوردی</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-black text-slate-200 font-sans selection:bg-amber-500/30 overflow-hidden flex flex-col">
      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-black z-10" />
        <img 
          src="https://drive.google.com/thumbnail?id=1jKO7K2mBbRx8EKs9uvDddXrCtjyKUMaA&sz=w1920" 
          alt="Cinematic Background" 
          className="w-full h-full object-cover opacity-40 scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Sidebar / Side Icon */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-64 bg-black/90 border-l border-white/10 z-50 p-6 flex flex-col"
            >
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="self-end p-2 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <div className="mt-8 space-y-4">
                <button
                  onClick={() => {
                    setActiveTab('home');
                    setSelectedSection('warplan');
                    setIsSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-red-600/20 to-red-900/20 border border-red-500/30 text-white hover:bg-red-500/30 transition-colors"
                >
                  <Shield className="w-5 h-5 text-red-500" />
                  <span className="font-medium">{language === 'ar' ? 'خطة حرب في السلام' : 'پلانی جەنگ لە ئاشتیدا'}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && !selectedSection && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="p-6 max-w-md mx-auto w-full"
            >
              {/* Header / Logo Area */}
              <div className="flex justify-between items-center mb-8 pt-4 relative">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-l-xl flex items-center justify-center text-amber-500 hover:bg-amber-500/20 transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="pl-4">
                  <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
                    {language === 'ar' ? 'حركة أنصار المهدي' : 'بزووتنەوەی پشتیوانانی مەهدی'}
                  </h1>
                  <p className="text-amber-500/60 text-sm font-medium tracking-widest mt-1">
                    {language === 'ar' ? 'الإصدار التجريبي' : 'وەشانی تاقیکاری'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setLanguage(null)} 
                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 hover:bg-white/10 backdrop-blur-md shrink-0 transition-colors"
                    title={language === 'ar' ? 'تغيير اللغة' : 'گۆڕینی زمان'}
                  >
                    <Globe className="w-5 h-5 text-slate-300" />
                  </button>
                  <div className="w-10 h-10 rounded-full border border-amber-500/30 flex items-center justify-center bg-black/50 backdrop-blur-md shrink-0">
                    <Moon className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
              </div>

              {/* Dynamic Hadith Slider */}
              <div className="relative h-56 mb-10 rounded-2xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl shadow-amber-900/20">
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-amber-500 to-transparent opacity-50" />
                <AnimatePresence mode="wait">
                  {homeHadiths.length > 0 ? (
                    <motion.div
                      key={currentHadith}
                      initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 1.05, filter: "blur(4px)" }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 p-6 flex flex-col justify-center items-center text-center"
                    >
                      <p className="text-amber-400 text-xs font-bold tracking-widest mb-4 opacity-80">
                        {language === 'ar' ? 'حديث اليوم' : 'فەرموودەی ئەمڕۆ'}
                      </p>
                      <p className="text-xl font-serif text-white mb-3 leading-relaxed line-clamp-3">
                        "{language === 'ar' ? homeHadiths[currentHadith].text_ar : homeHadiths[currentHadith].text_ku}"
                      </p>
                    </motion.div>
                  ) : (
                    <div key="loading" className="absolute inset-0 flex items-center justify-center">
                      <p className="text-slate-400 text-sm">
                        {language === 'ar' ? 'جاري التحميل...' : 'لە بارکردندایە...'}
                      </p>
                    </div>
                  )}
                </AnimatePresence>
                
                {/* Slider Indicators */}
                {homeHadiths.length > 0 && (
                  <div className="absolute bottom-4 right-0 w-full flex justify-center gap-2">
                    {homeHadiths.slice(0, 10).map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`h-1 rounded-full transition-all duration-500 ${idx === currentHadith ? 'w-6 bg-amber-500' : 'w-2 bg-white/20'}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Main Sections Grid */}
              <div className="space-y-4">
                {SECTIONS.map((section, idx) => (
                  <motion.button
                    key={section.id}
                    onClick={() => setSelectedSection(section.id)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.02, x: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full relative overflow-hidden group rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-4 flex items-center gap-4 text-right"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-l ${section.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                    
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${section.color} shadow-lg shrink-0 overflow-hidden`}>
                      {section.imageUrl ? (
                        <img src={section.imageUrl} alt={section[language]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <section.icon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-white text-lg">{section[language]}</h3>
                    </div>
                    
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors shrink-0">
                      <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}



          {activeTab === 'library' && !selectedBook && !selectedApiBook && (
            <motion.div 
              key="library"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="p-6 max-w-md mx-auto w-full pb-24"
            >
              <div className="text-center mb-6 pt-4">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 mb-2">
                  {language === 'ar' ? 'المكتبة الإسلامية' : 'کتێبخانەی ئیسلامی'}
                </h2>
              </div>

              {/* Library Tabs */}
              <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl">
                <button 
                  onClick={() => setLibraryTab('local')} 
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${libraryTab === 'local' ? 'bg-amber-500 text-black' : 'text-slate-400'}`}
                >
                  {language === 'ar' ? 'كتب الحركة' : 'کتێبەکانی بزووتنەوە'}
                </button>
                <button 
                  onClick={() => setLibraryTab('api')} 
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${libraryTab === 'api' ? 'bg-amber-500 text-black' : 'text-slate-400'}`}
                >
                  {language === 'ar' ? 'مكتبة الحديث' : 'کتێبخانەی فەرموودە'}
                </button>
              </div>

              {/* Hadith Books Grid */}
              <div className="space-y-4">
                {libraryTab === 'local' ? (
                  books.length === 0 ? (
                    <div className="text-center text-slate-400 py-10">
                      {language === 'ar' ? 'جاري التحميل...' : 'لە بارکردندایە...'}
                    </div>
                  ) : (
                    books.map((book, idx) => (
                      <motion.div
                        key={book.id}
                        onClick={() => {
                          if (book.title_ar === 'القرآن الكريم' || book.title_ku === 'قورئانی پیرۆز') {
                            setActiveTab('home');
                            setSelectedSection('quran');
                          } else {
                            setSelectedBook(book);
                          }
                        }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.4 }}
                        whileHover={{ scale: 1.02, x: -4 }}
                        className="w-full relative overflow-hidden group rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-4 flex items-center gap-4 text-right cursor-pointer"
                      >
                        <div className="absolute inset-0 bg-gradient-to-l from-amber-500/20 to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                        
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-700 shadow-lg shrink-0 overflow-hidden">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium text-white text-lg">{language === 'ar' ? book.title_ar : book.title_ku}</h3>
                          <p className="text-amber-400/80 text-xs">{language === 'ar' ? book.author_ar : book.author_ku}</p>
                        </div>
                        
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors shrink-0">
                          <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                        </div>
                      </motion.div>
                    ))
                  )
                ) : (
                  HADITH_API_BOOKS.map((book, idx) => (
                    <motion.div
                      key={book.id}
                      onClick={() => {
                        setSelectedApiBook(book);
                        setIsLoadingApi(true);
                        fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${book.id}.json`)
                          .then(res => res.json())
                          .then(data => {
                            setApiHadiths(data.hadiths);
                            setApiHadithsPage(1);
                            setIsLoadingApi(false);
                          })
                          .catch(err => {
                            console.error(err);
                            setIsLoadingApi(false);
                          });
                      }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.4 }}
                      whileHover={{ scale: 1.02, x: -4 }}
                      className="w-full relative overflow-hidden group rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-4 flex items-center gap-4 text-right cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-l from-amber-500/20 to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                      
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-700 shadow-lg shrink-0 overflow-hidden">
                        <Library className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-white text-lg">{language === 'ar' ? book.title_ar : book.title_ku}</h3>
                        <p className="text-amber-400/80 text-xs">{language === 'ar' ? book.description_ar : book.description_ku}</p>
                      </div>
                      
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors shrink-0">
                        <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'library' && selectedApiBook && (
            <motion.div 
              key="api-book-details"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 max-w-md mx-auto w-full pb-24"
            >
              <button 
                onClick={() => {
                  setSelectedApiBook(null);
                  setApiHadiths([]);
                }} 
                className="flex items-center gap-2 text-amber-500 mb-6 bg-amber-500/10 px-4 py-2 rounded-full hover:bg-amber-500/20 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
                <span className="font-medium text-sm">{language === 'ar' ? 'رجوع' : 'گەڕانەوە'}</span>
              </button>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 mb-2">
                  {language === 'ar' ? selectedApiBook.title_ar : selectedApiBook.title_ku}
                </h2>
                <p className="text-slate-400 text-sm">{language === 'ar' ? selectedApiBook.description_ar : selectedApiBook.description_ku}</p>
              </div>

              {isLoadingApi ? (
                <div className="text-center text-slate-400 py-10">
                  {language === 'ar' ? 'جاري تحميل الأحاديث...' : 'لە بارکردنی فەرموودەکان...'}
                </div>
              ) : (
                <div className="space-y-6">
                  {apiHadiths.slice(0, apiHadithsPage * 20).map((hadith: any, idx: number) => (
                    <motion.div
                      key={hadith.hadithnumber || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (idx % 20) * 0.05 }}
                      className="bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-3xl" />
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                          <span className="text-amber-500 font-bold text-sm">{hadith.hadithnumber}</span>
                        </div>
                        <h4 className="text-amber-400 font-medium text-sm">
                          {language === 'ar' ? 'الحديث' : 'فەرموودە'}
                        </h4>
                      </div>
                      <p className="text-white text-lg leading-relaxed font-serif text-justify">
                        {hadith.text}
                      </p>
                      {hadith.grades && hadith.grades.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                          {hadith.grades.map((grade: any, i: number) => (
                            <span key={i} className="text-xs px-2 py-1 rounded-md bg-white/5 text-slate-400 border border-white/10">
                              {grade.grade} ({grade.name})
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  {apiHadiths.length > apiHadithsPage * 20 && (
                    <button
                      onClick={() => setApiHadithsPage(p => p + 1)}
                      className="w-full py-3 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30 font-medium hover:bg-amber-500/20 transition-colors"
                    >
                      {language === 'ar' ? 'عرض المزيد' : 'بینینی زیاتر'}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'library' && selectedBook && (
            <motion.div 
              key="book-details"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 max-w-md mx-auto w-full pb-24"
            >
              <button 
                onClick={() => setSelectedBook(null)} 
                className="flex items-center gap-2 text-amber-500 mb-6 bg-amber-500/10 px-4 py-2 rounded-full hover:bg-amber-500/20 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
                <span className="font-medium text-sm">{language === 'ar' ? 'رجوع' : 'گەڕانەوە'}</span>
              </button>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 mb-2">
                  {language === 'ar' ? selectedBook.title_ar : selectedBook.title_ku}
                </h2>
                <p className="text-slate-400 text-sm">{language === 'ar' ? selectedBook.description_ar : selectedBook.description_ku}</p>
              </div>

              {isLoading ? (
                <div className="text-center text-slate-400 py-10">
                  {language === 'ar' ? 'جاري التحميل...' : 'لە بارکردندایە...'}
                </div>
              ) : hadiths.length === 0 ? (
                <div className="text-center text-slate-400 py-10">
                  {language === 'ar' ? 'لا توجد أحاديث' : 'هیچ فەرموودەیەک نییە'}
                </div>
              ) : (
                <div className="space-y-4">
                  {hadiths.map((hadith, idx) => (
                    <div key={hadith.id || idx} className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-1 h-full bg-amber-500" />
                      <p className="text-white text-base leading-relaxed font-serif text-right mb-4">
                        {language === 'ar' ? hadith.text_ar : hadith.text_ku}
                      </p>
                      <div className="flex justify-between items-center border-t border-white/10 pt-3">
                        <span className="text-amber-500/60 text-xs">{hadith.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'home' && selectedSection === 'quran' && !selectedSurah && (
            <motion.div
              key="quran"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 max-w-md mx-auto w-full pb-24"
            >
              <button 
                onClick={() => setSelectedSection(null)} 
                className="flex items-center gap-2 text-emerald-500 mb-6 bg-emerald-500/10 px-4 py-2 rounded-full hover:bg-emerald-500/20 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
                <span className="font-medium text-sm">{language === 'ar' ? 'رجوع' : 'گەڕانەوە'}</span>
              </button>
              
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 mb-2">
                  {language === 'ar' ? 'القرآن الكريم' : 'قورئانی پیرۆز'}
                </h2>
              </div>

              <div className="space-y-3">
                {quranSurahs.length === 0 ? (
                  <div className="text-center text-slate-400 py-10">
                    {language === 'ar' ? 'جاري التحميل...' : 'لە بارکردندایە...'}
                  </div>
                ) : (
                  quranSurahs.map((surah, idx) => (
                    <motion.button
                      key={surah.id}
                      onClick={() => setSelectedSurah(surah)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                          {surah.surah_number}
                        </div>
                        <div className="text-right">
                          <h3 className="text-white font-bold text-lg">{language === 'ar' ? surah.name_ar : surah.name_ku}</h3>
                          <p className="text-slate-400 text-xs">{surah.total_verses} {language === 'ar' ? 'آيات' : 'ئایەت'}</p>
                        </div>
                      </div>
                      <ChevronLeft className="w-5 h-5 text-slate-500" />
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'home' && selectedSection === 'quran' && selectedSurah && (
            <motion.div
              key="surah-details"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 max-w-md mx-auto w-full pb-24"
            >
              <button 
                onClick={() => setSelectedSurah(null)} 
                className="flex items-center gap-2 text-emerald-500 mb-6 bg-emerald-500/10 px-4 py-2 rounded-full hover:bg-emerald-500/20 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
                <span className="font-medium text-sm">{language === 'ar' ? 'رجوع' : 'گەڕانەوە'}</span>
              </button>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-emerald-400 mb-2 font-serif">
                  {language === 'ar' ? selectedSurah.name_ar : selectedSurah.name_ku}
                </h2>
              </div>

              {isLoading ? (
                <div className="text-center text-slate-400 py-10">
                  {language === 'ar' ? 'جاري التحميل...' : 'لە بارکردندایە...'}
                </div>
              ) : ayahs.length === 0 ? (
                <div className="text-center text-slate-400 py-10">
                  {language === 'ar' ? 'لا توجد آيات' : 'هیچ ئایەتێک نییە'}
                </div>
              ) : (
                <div className="space-y-6">
                  {ayahs.map((ayah) => (
                    <div key={ayah.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                      <p className="text-emerald-100 text-xl leading-loose font-serif mb-4" dir="rtl">
                        {ayah.arabicText} <span className="text-emerald-500/50 text-sm mx-1">({ayah.numberInSurah})</span>
                      </p>
                      <div className="w-12 h-px bg-white/10 mx-auto my-4" />
                      <p className="text-slate-300 text-sm leading-relaxed" dir="rtl">
                        {ayah.kurdishText}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'home' && selectedSection === 'methodology' && (
            <motion.div
              key="methodology"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 max-w-md mx-auto w-full"
            >
              <button 
                onClick={() => setSelectedSection(null)} 
                className="flex items-center gap-2 text-amber-500 mb-6 bg-amber-500/10 px-4 py-2 rounded-full hover:bg-amber-500/20 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
                <span className="font-medium text-sm">{language === 'ar' ? 'رجوع' : 'گەڕانەوە'}</span>
              </button>
              
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 mb-2">
                  {METHODOLOGY_CONTENT.title[language]}
                </h2>
              </div>

              {/* Goals Section */}
              <div className="mb-10">
                <h3 className="text-xl font-bold text-white mb-6">{METHODOLOGY_CONTENT.goalsTitle[language]}</h3>
                
                <div className="space-y-4">
                  {METHODOLOGY_CONTENT.goals.map((goal, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-1 h-full bg-amber-500" />
                      <h5 className="text-amber-400 font-bold mb-2">{goal.title[language]}</h5>
                      <p className="text-white text-base leading-relaxed">{goal.text[language]}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Methodology Points Section */}
              <div className="mb-10">
                <h3 className="text-xl font-bold text-white mb-6">{METHODOLOGY_CONTENT.methodologyTitle[language]}</h3>
                
                <div className="space-y-4">
                  {METHODOLOGY_CONTENT.points.map((point, idx) => (
                    <div key={idx} className="flex gap-4 items-start bg-white/5 border border-white/5 rounded-2xl p-4">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-white text-base leading-relaxed">{point[language]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conclusion & Footer */}
              <div className="bg-gradient-to-br from-amber-900/20 to-black border border-amber-500/20 rounded-2xl p-6 text-center">
                <div className="space-y-4 mb-8">
                  {METHODOLOGY_CONTENT.conclusion.map((conc, idx) => (
                    <div key={idx}>
                      <p className="text-amber-200 font-medium leading-relaxed mb-1">{conc[language]}</p>
                    </div>
                  ))}
                </div>
                
                <div className="pt-6 border-t border-amber-500/20 space-y-2">
                  <p className="text-white font-bold">{METHODOLOGY_CONTENT.footer.author[language]}</p>
                  
                  <div className="text-xs text-slate-400 space-y-1 mt-4">
                    <p>{METHODOLOGY_CONTENT.footer.dateHijri[language]}</p>
                    <p>{METHODOLOGY_CONTENT.footer.dateGregorian[language]}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'home' && selectedSection === 'fatwas' && (
            <motion.div
              key="fatwas"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 max-w-md mx-auto w-full"
            >
              <button 
                onClick={() => setSelectedSection(null)} 
                className="flex items-center gap-2 text-amber-500 mb-6 bg-amber-500/10 px-4 py-2 rounded-full hover:bg-amber-500/20 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
                <span className="font-medium text-sm">{language === 'ar' ? 'رجوع' : 'گەڕانەوە'}</span>
              </button>
              
              <div className="text-center mb-8">
                <div className="w-24 h-24 rounded-2xl bg-rose-500/20 flex items-center justify-center mx-auto mb-4 border border-rose-500/30 overflow-hidden shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                  <img 
                    src="https://drive.google.com/thumbnail?id=1LzhTRRIELHGJVPgmQKHyAMOv3DU0I5Dp&sz=w1000" 
                    alt="الشيخ أبو داود الحسامي" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-200 to-rose-500 mb-2">
                  {FATWAS_CONTENT.title[language]}
                </h2>
              </div>

              <div className="space-y-6">
                {FATWAS_CONTENT.items.map((fatwa) => (
                  <div key={fatwa.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                    <div className="relative h-48 w-full">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent z-10" />
                      <img 
                        src={fatwa.imageUrl} 
                        alt="Fatwa Cover" 
                        className="w-full h-full object-cover opacity-60"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-4 right-4 left-4 z-20">
                        <h3 className="text-xl font-bold text-white mb-1 leading-tight">{fatwa.title[language]}</h3>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                        <div className="flex items-center gap-2 text-amber-500/80">
                          <Users className="w-4 h-4" />
                          <span className="text-xs font-medium">{fatwa.author[language]}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <span className="text-xs" dir="ltr">{fatwa.date}</span>
                          <Calendar className="w-4 h-4" />
                        </div>
                      </div>
                      
                      <div className="prose prose-invert prose-amber max-w-none">
                        <p className="text-slate-200 text-base leading-loose whitespace-pre-wrap font-serif">
                          {fatwa.content[language]}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'home' && selectedSection === 'tahami' && (
            <motion.div
              key="tahami"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 max-w-md mx-auto w-full pb-24"
            >
              <button 
                onClick={() => setSelectedSection(null)} 
                className="flex items-center gap-2 text-blue-500 bg-blue-500/10 px-4 py-2 rounded-full mb-8 hover:bg-blue-500/20 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
                <span className="font-medium text-sm">{language === 'ar' ? 'رجوع' : 'گەڕانەوە'}</span>
              </button>
              
              <div className="text-center mb-8">
                <div className="w-24 h-24 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4 border border-blue-500/30 overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                  <img 
                    src="https://drive.google.com/thumbnail?id=1mSBm7w9dMVxQFOnUDXe7l8kCL1Sk4E7z&sz=w1000" 
                    alt="الشيخ حسن التهامي" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-500 mb-2">
                  {TAHAMI_CONTENT.title[language]}
                </h2>
              </div>

              <div className="space-y-6">
                {TAHAMI_CONTENT.items.map((item) => (
                  <div key={item.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                    <div className="relative w-full">
                      <img 
                        src={item.imageUrl} 
                        alt="Tahami Content" 
                        className="w-full h-auto object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {item.content[language] && (
                      <div className="p-5">
                        <div className="prose prose-invert prose-blue max-w-none">
                          <p className="text-slate-200 text-base leading-loose whitespace-pre-wrap font-serif">
                            {item.content[language]}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'mahdi' && !selectedMahdiPost && (
            <motion.div
              key="mahdi-list"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 max-w-md mx-auto w-full pb-24"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 mb-2">
                  {MAHDI_CONTENT.title[language]}
                </h2>
              </div>

              <div className="space-y-6">
                {MAHDI_CONTENT.items.map((item) => (
                  <motion.div 
                    key={item.id} 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMahdiPost(item.id)}
                    className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm cursor-pointer group"
                  >
                    <div className="relative w-full h-48">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title[language]} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="text-xl font-bold text-white mb-1">{item.title[language]}</h3>
                        <p className="text-amber-400/80 text-sm">{item.author[language]}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-black/40 border-t border-white/10 flex justify-between items-center">
                      <span className="text-slate-300 text-sm">
                        {language === 'ar' ? 'اقرأ المزيد...' : 'زیاتر بخوێنەوە...'}
                      </span>
                      <ChevronRight className="w-5 h-5 text-amber-500" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'mahdi' && selectedMahdiPost && (
            <motion.div
              key="mahdi-post"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 max-w-md mx-auto w-full pb-24"
            >
              <button 
                onClick={() => setSelectedMahdiPost(null)} 
                className="flex items-center gap-2 text-amber-500 mb-6 bg-amber-500/10 px-4 py-2 rounded-full hover:bg-amber-500/20 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
                <span className="font-medium text-sm">{language === 'ar' ? 'رجوع' : 'گەڕانەوە'}</span>
              </button>

              {(() => {
                const post = MAHDI_CONTENT.items.find(item => item.id === selectedMahdiPost);
                if (!post) return null;
                return (
                  <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                    <div className="p-5 border-b border-white/10">
                      <h3 className="text-xl font-bold text-white mb-2">{post.title[language]}</h3>
                      <p className="text-amber-400/80 text-sm">{post.author[language]}</p>
                    </div>
                    <div className="relative w-full">
                      <img 
                        src={post.imageUrl} 
                        alt={post.title[language]} 
                        className="w-full h-auto object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {post.content[language] && (
                      <div className="p-5">
                        <div className="prose prose-invert prose-amber max-w-none">
                          <p className="text-slate-200 text-base leading-loose whitespace-pre-wrap font-serif">
                            {post.content[language]}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          )}

          {activeTab === 'home' && selectedSection === 'warplan' && (
            <motion.div
              key="warplan"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 max-w-md mx-auto w-full pb-24"
            >
              <button 
                onClick={() => setSelectedSection(null)} 
                className="flex items-center gap-2 text-red-500 bg-red-500/10 px-4 py-2 rounded-full mb-8 hover:bg-red-500/20 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
                <span className="font-medium text-sm">{language === 'ar' ? 'رجوع' : 'گەڕانەوە'}</span>
              </button>
              
              <div className="text-center mb-8">
                <div className="w-24 h-24 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4 border border-red-500/30 overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                  <Shield className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-2 font-serif">
                  {language === 'ar' ? 'خطة حرب في السلام' : 'پلانی جەنگ لە ئاشتیدا'}
                </h2>
              </div>

              <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl">
                <p className="text-slate-300 leading-relaxed text-lg text-justify mb-6">
                  {language === 'ar' 
                    ? 'هذا القسم مخصص لخطة الحرب في السلام، وهو قيد التطوير. سيتم إضافة المحتوى قريباً.' 
                    : 'ئەم بەشە تایبەتە بە پلانی جەنگ لە ئاشتیدا، و لە قۆناغی پەرەپێداندایە. بەم زووانە ناوەڕۆک زیاد دەکرێت.'}
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'home' && selectedSection && selectedSection !== 'quran' && selectedSection !== 'methodology' && selectedSection !== 'fatwas' && selectedSection !== 'tahami' && selectedSection !== 'warplan' && (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 max-w-md mx-auto w-full h-full flex flex-col items-center justify-center min-h-[60vh]"
            >
              <button 
                onClick={() => setSelectedSection(null)} 
                className="absolute top-6 right-6 flex items-center gap-2 text-amber-500 bg-amber-500/10 px-4 py-2 rounded-full hover:bg-amber-500/20 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
                <span className="font-medium text-sm">{language === 'ar' ? 'رجوع' : 'گەڕانەوە'}</span>
              </button>
              
              {(() => {
                const currentSection = SECTIONS.find(s => s.id === selectedSection);
                return (
                  <>
                    <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 overflow-hidden shadow-lg">
                      {currentSection?.imageUrl ? (
                        <img 
                          src={currentSection.imageUrl} 
                          alt={currentSection[language]} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : currentSection?.icon ? (
                        <currentSection.icon className="w-10 h-10 text-slate-500" />
                      ) : (
                        <BookOpen className="w-10 h-10 text-slate-500" />
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 text-center">
                      {currentSection ? currentSection[language] : (language === 'ar' ? 'قريباً' : 'بەم زووانە')}
                    </h2>
                  </>
                );
              })()}
              <p className="text-slate-400 text-center mt-2">
                {language === 'ar' ? 'هذا القسم قيد التطوير وسيتم إضافته قريباً.' : 'ئەم بەشە لە ژێر پەرەپێداندایە و بەم زووانە زیاد دەکرێت.'}
              </p>
            </motion.div>
          )}

          {activeTab === 'prayer' && (
            <motion.div 
              key="prayer"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 max-w-md mx-auto w-full h-full flex flex-col items-center justify-center min-h-[80vh]"
            >
              <div className="w-32 h-32 rounded-full border-4 border-amber-500/20 flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 rounded-full border-t-4 border-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
                <Sun className="w-12 h-12 text-amber-500" />
              </div>
              <h2 className="text-5xl font-light text-white mb-2" dir="ltr">12:45 <span className="text-2xl text-amber-500">PM</span></h2>
              <p className="text-slate-400 tracking-widest text-sm mb-12">
                {language === 'ar' ? 'التالي: الظهر' : 'داهاتوو: نیوەڕۆ'}
              </p>
              
              <div className="w-full space-y-3">
                {PRAYERS.map((prayer, i) => (
                  <div key={prayer.ar} className={`flex justify-between items-center p-4 rounded-xl border ${i === 2 ? 'border-amber-500/50 bg-amber-500/10 text-white' : 'border-white/5 bg-white/5 text-slate-400'}`}>
                    <div className="flex flex-col">
                      <span className="font-medium text-lg">{prayer[language]}</span>
                    </div>
                    <span className="font-mono text-xl" dir="ltr">--:--</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'research' && (
            <motion.div 
              key="research"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-6 max-w-md mx-auto w-full"
            >
              <h2 className="text-2xl font-bold text-white mb-6 pt-4">
                {language === 'ar' ? 'غرفة البحث والتحقيق' : 'ژووری لێکۆڵینەوە و بەدواداچوون'}
              </h2>
              <div className="relative mb-8">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={language === 'ar' ? 'ابحث في الأرشيف، الفتاوى...' : 'گەڕان لە ئەرشیڤ، فەتوایەکان...'}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-white/5 border border-white/5 p-4 flex flex-col justify-end relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                    <img 
                      src={`https://images.unsplash.com/photo-1585036156171-384164a8c675?q=80&w=400&auto=format&fit=crop&sig=${i}`} 
                      alt="Archive" 
                      className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="relative z-20">
                      <span className="text-xs text-amber-500 font-bold tracking-wider mb-1 block">
                        {language === 'ar' ? `أرشيف ${i}` : `ئەرشیڤ ${i}`}
                      </span>
                      <h3 className="text-white font-medium text-sm">
                        {language === 'ar' ? 'وثيقة تاريخية' : 'بەڵگەنامەی مێژوویی'}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 right-0 w-full z-50 p-4 pb-6 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <div className="flex justify-around items-center bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-2 shadow-2xl shadow-black">
            {[
              { id: 'home', icon: Home, ar: 'الرئيسية', ku: 'سەرەکی' },
              { id: 'library', icon: Library, ar: 'المكتبة', ku: 'کتێبخانە' },
              { id: 'prayer', icon: Clock, ar: 'الأذان', ku: 'بانگ' },
              { id: 'mahdi', icon: Globe, ar: 'الإمام المهدي', ku: 'ئیمام مەهدی' },
              { id: 'research', icon: Search, ar: 'البحث', ku: 'گەڕان' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedSection(null);
                    setSelectedMahdiPost(null);
                    setSelectedBook(null);
                    setSelectedSurah(null);
                  }}
                  className="relative flex-1 flex flex-col items-center justify-center py-2 rounded-2xl transition-colors"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white/10 rounded-2xl"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <tab.icon className={`w-6 h-6 mb-1 relative z-10 transition-colors duration-300 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span className={`text-[11px] font-medium relative z-10 transition-colors duration-300 ${isActive ? 'text-amber-400' : 'text-slate-500'}`}>
                    {tab[language]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
