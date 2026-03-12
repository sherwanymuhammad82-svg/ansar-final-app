import { useState, useEffect } from 'react';
import { BookOpen, Library, Globe, Home, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from './firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

export default function App() {
  const [language, setLanguage] = useState<null | 'ar' | 'ku'>(null);
  const [quranSurahs, setQuranSurahs] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  useEffect(() => {
    // هێنانی هەموو داتاکان لە Firestore
    const q = query(collection(db, 'quran'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuranSurahs(data);
    });
    return () => unsubscribe();
  }, []);

  if (!language) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
        <h1 className="text-3xl font-bold mb-8 text-amber-500">ROSHNAY</h1>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button onClick={() => setLanguage('ku')} className="p-4 bg-white/10 border border-amber-500/50 rounded-2xl text-xl font-bold">کوردی</button>
          <button onClick={() => setLanguage('ar')} className="p-4 bg-white/10 border border-amber-500/50 rounded-2xl text-xl font-bold">العربية</button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-white pb-24">
      <div className="p-6">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black text-amber-500 tracking-tighter">ROSHNAY</h1>
          <button onClick={() => setLanguage(null)} className="p-2 bg-white/5 rounded-full"><Globe className="w-6 h-6" /></button>
        </header>

        {selectedSection === 'quran' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button onClick={() => setSelectedSection(null)} className="mb-6 text-amber-500 flex items-center gap-2 font-bold">
              <ChevronRight /> گەڕانەوە
            </button>
            <div className="grid gap-3">
              {quranSurahs.length > 0 ? (
                quranSurahs.map((surah) => (
                  <div key={surah.id} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center hover:bg-white/10 transition-all">
                    <div className="flex flex-col">
                      <span className="text-xl font-bold">
                        {language === 'ku' ? (surah.name_ku || surah.name) : (surah.name_ar || surah.name)}
                      </span>
                      <span className="text-xs text-slate-500 italic">ID: {surah.id}</span>
                    </div>
                    <div className="w-12 h-12 flex items-center justify-center bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20 font-black">
                      {surah.surah_number || "#"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-10 text-slate-500 italic">هیچ داتایەک نەدۆزرایەوە لە Firestore...</div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="grid gap-4 mt-10">
             <button onClick={() => setSelectedSection('quran')} className="p-8 bg-gradient-to-br from-emerald-600 to-teal-900 rounded-[2.5rem] flex items-center gap-6 shadow-2xl active:scale-95 transition-all">
                <div className="bg-white/20 p-4 rounded-3xl">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
                <span className="text-2xl font-black">{language === 'ku' ? 'قورئانی پیرۆز' : 'القرآن الكريم'}</span>
             </button>
          </div>
        )}
      </div>

      <nav className="fixed bottom-6 left-6 right-6 h-20 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] flex justify-around items-center">
        <Home className="text-amber-500 w-7 h-7" />
        <Library className="text-slate-500 w-7 h-7" />
        <Clock className="text-slate-500 w-7 h-7" />
      </nav>
    </div>
  );
}
