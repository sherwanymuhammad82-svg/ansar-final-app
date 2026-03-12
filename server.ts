import express from "express";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";
import cors from "cors";
import path from "path";
import fs from "fs";

// Initialize Firebase Admin SDK
try {
  const serviceAccountPath = path.resolve(process.cwd(), 'firebase-service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } else {
    console.warn("firebase-service-account.json not found. Firebase Admin SDK not initialized.");
  }
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/quran", async (req, res) => {
    try {
      const db = admin.firestore();
      const snapshot = await db.collection('Quran').orderBy('surah_number').get();
      const surahs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(surahs);
    } catch (error) {
      console.error("Error fetching Quran:", error);
      res.status(500).json({ error: "Failed to fetch Quran" });
    }
  });

  app.get("/api/quran/:surahId/ayahs", async (req, res) => {
    try {
      const db = admin.firestore();
      const snapshot = await db.collection('Quran').doc(req.params.surahId).collection('Ayahs').orderBy('numberInSurah').get();
      const ayahs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(ayahs);
    } catch (error) {
      console.error("Error fetching Ayahs:", error);
      res.status(500).json({ error: "Failed to fetch Ayahs" });
    }
  });

  app.get("/api/books", async (req, res) => {
    try {
      const db = admin.firestore();
      const snapshot = await db.collection('Books').get();
      const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(books);
    } catch (error) {
      console.error("Error fetching Books:", error);
      res.status(500).json({ error: "Failed to fetch Books" });
    }
  });

  app.get("/api/hadiths", async (req, res) => {
    try {
      const db = admin.firestore();
      const sourceQuery = req.query.source as string;
      let query: admin.firestore.Query = db.collection('Hadiths');
      
      if (sourceQuery) {
        // Map Arabic/Kurdish book titles to the English 'source' field in Hadiths collection
        let mappedSource = sourceQuery;
        if (sourceQuery.includes('البخاري') || sourceQuery.includes('بوخاری')) mappedSource = 'Bukhari';
        else if (sourceQuery.includes('مسلم') || sourceQuery.includes('موسلیم')) mappedSource = 'Muslim';
        else if (sourceQuery.includes('الترمذي') || sourceQuery.includes('ترمذی')) mappedSource = 'Tirmidhi';
        else if (sourceQuery.includes('ابن ماجه') || sourceQuery.includes('ئیبن ماجە')) mappedSource = 'Ibn Majah';
        else if (sourceQuery.includes('أبي داود') || sourceQuery.includes('ئەبو داود')) mappedSource = 'Abu Dawud';
        else if (sourceQuery.includes('النسائي') || sourceQuery.includes('نەسائی')) mappedSource = 'Nasai';
        else if (sourceQuery.includes('أحمد') || sourceQuery.includes('ئەحمەد')) mappedSource = 'Ahmad';

        // Some hadiths have source "Bukhari & Muslim", so we might need to fetch all and filter in memory if we want partial matches
        // For simplicity, we'll fetch up to 500 hadiths and filter them in memory to allow partial matches like "Bukhari" matching "Bukhari & Muslim"
        const snapshot = await db.collection('Hadiths').limit(500).get();
        const allHadiths = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const filteredHadiths = allHadiths.filter(h => {
          const s = (h as any).source || '';
          return s.toLowerCase().includes(mappedSource.toLowerCase());
        });
        
        return res.json(filteredHadiths);
      }
      
      const snapshot = await query.limit(100).get();
      const hadiths = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(hadiths);
    } catch (error) {
      console.error("Error fetching Hadiths:", error);
      res.status(500).json({ error: "Failed to fetch Hadiths" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
