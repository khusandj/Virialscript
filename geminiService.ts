import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ViralPattern, CompetitorAnalysis } from "../types";

// API kalitni xavfsiz holatga keltiramiz (Environment Variable orqali olinadi)
// AI Studio muhitida process.env.GEMINI_API_KEY ishlatiladi, Vercel kabi joylarda import.meta.env
const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyCI-hFo-CR1fQbdGB4g7XGilZMeK3rIIyM";
const ai = new GoogleGenAI({ apiKey: apiKey });

export async function analyzeVideoContent(
  input: { text?: string; videoBase64?: string; mimeType?: string }
): Promise<ViralPattern> {
  const model = "gemini-2.5-flash-preview-tts"; // Using a capable model for analysis

  const prompt = `
    Ushbu Instagram videosini (yoki uning tavsifini) tahlil qiling. 
    Uning nima uchun "viral" bo'lganini aniqlang va quyidagi formatda JSON qaytaring:
    {
      "title": "Videoning qisqa nomi",
      "hook": "Dastlabki 3 soniyadagi 'ilmoq' (hook) nima?",
      "structure": "Videoning umumiy tuzilishi (masalan: muammo -> yechim -> natija)",
      "tone": "Videoning kayfiyati (quvnoq, jiddiy, hayajonli va h.k.)",
      "visualStyle": "Vizual ko'rinishi va montaj uslubi",
      "keyTakeaways": ["Asosiy o'rganishlar ro'yxati"]
    }
  `;

  const parts: any[] = [{ text: prompt }];
  
  if (input.videoBase64 && input.mimeType) {
    parts.push({
      inlineData: {
        data: input.videoBase64,
        mimeType: input.mimeType
      }
    });
  } else if (input.text) {
    parts.push({ text: `Video tavsifi: ${input.text}` });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts }],
    config: {
      responseMimeType: "application/json"
    }
  });

  const result = JSON.parse(response.text || "{}");
  return {
    id: Math.random().toString(36).substr(2, 9),
    ...result
  };
}

export async function generateViralScript(
  patterns: ViralPattern[],
  companyProfile: string,
  productInfo: string,
  productImage?: { data: string; mimeType: string }
): Promise<string> {
  const model = "gemini-3-flash-preview";

  const patternsContext = patterns.map((p, index) => 
    `Pattern #${index + 1}:\nTitle: ${p.title}\nHook: ${p.hook}\nStructure: ${p.structure}\nTone: ${p.tone}\nVisual Style: ${p.visualStyle}`
  ).join("\n\n---\n\n");

  const prompt = `
    Siz professional SMM va viral ssenarist mutaxassissiz. 
    Vazifangiz: Quyida keltirilgan BARCHA o'rganilgan viral patternlarning har biri uchun alohida, mahsulotga moslashtirilgan Instagram Reels ssenariysini yozish.
    
    MUHIM QOIDALAR:
    1. Agar sizga ${patterns.length} ta pattern berilgan bo'lsa, ${patterns.length} ta xilma-xil ssenariy varianti bo'lishi shart.
    2. Har bir variant FAQAT o'ziga tegishli patternning STRUKTURASI va LOGIKASI asosida bo'lsin.
    3. Agar o'rganilgan patternlar boshqa sohaga (masalan, qurilish) oid bo'lsa, faqat ularning STRUKTURASINI oling, terminlarini emas.
    4. Har bir variantni aniq sarlavha bilan ajrating (masalan: "Variant #1: [Pattern nomi] asosida").
    
    O'rganilgan patternlar (Struktura manbalari):
    ${patternsContext}
    
    Yangi Kompaniya: ${companyProfile}
    Yangi Mahsulot: ${productInfo}
    
    Har bir variant quyidagilarni o'z ichiga olsin:
    - Variant nomi va asoslangan patterni
    - 🪝 Hook (0-3 soniya): Tomoshabin e'tiborini qanday ushlab qolish kerak?
    - 🎬 Kadr va vizual (B-roll, kamera harakati, yorug'lik)
    - 📝 Ekranga yoziladigan matn (Text-on-screen)
    - 🗣️ Diktator matni (Voiceover)
    - 🎵 Musiqa va SFX (Sound effects)
    - 🧠 Psixologik trigger (Nima uchun bu ishlaydi?)
    - 🎯 CTA (Call to Action)
    
    Agar mahsulot rasmi berilgan bo'lsa, rasmdagi detallarni ssenariyda hisobga oling.
    Javobni chiroyli Markdown formatida qaytaring.
  `;

  const parts: any[] = [{ text: prompt }];
  
  if (productImage) {
    parts.push({
      inlineData: {
        data: productImage.data,
        mimeType: productImage.mimeType
      }
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts }]
  });

  return response.text || "Ssenariy yaratib bo'lmadi.";
}

export async function analyzeInstagramProfile(
  profileLink: string
): Promise<ViralPattern[]> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Siz dunyodagi eng kuchli SMM tahlilchi va ssenaristisiz.
    Mijoz quyidagi Instagram profilini tahlil qilishni so'radi: ${profileLink}

    Vazifangiz:
    1. Google Search orqali ushbu profildagi eng ko'p ko'rilgan, layk bosilgan, saqlangan va ulashilgan (viral) videolarni (reels) qidiring. Maslahat: Qidiruvda "site:instagram.com/{username}/reel" kabi so'rovlardan foydalaning.
    2. Ushbu profildagi eng zo'r 6 ta turli xil videoni toping va ularning har biridan bittadan (jami 6 ta) har xil Ssenariy Strukturalarini (Patternlarni) ajratib oling.
    3. DIQQAT: Har bir video mutlaqo har xil strukturaga ega bo'lishi kerak. Iltimos, 6 ta alohida va bir-biriga o'xshamaydigan pattern yarating.
    4. Har bir pattern uchun quyidagi ma'lumotlarni aniq yozing:
       - title: Struktura nomi (masalan: Muammo + Shok yechim)
       - hook: Videoni boshlash usuli (0-3 soniya)
       - structure: Videoning umumiy tuzilishi (masalan: muammo -> yechim -> natija)
       - format: Videoning formati (masalan: POV, Talking head, Vlog, Text-on-screen, Mini-kino)
       - audioStrategy: Ovoz va musiqa strategiyasi (masalan: Trenddagi musiqa, Original ovoz, ASMR, Emotsional fon)
       - cta: Videodagi "Call to Action" (masalan: Obuna bo'ling, Komment yozing, Saqlab qo'ying)
       - tone: Videoning kayfiyati (quvnoq, jiddiy, hayajonli va h.k.)
       - visualStyle: Vizual ko'rinishi va montaj uslubi
       - keyTakeaways: Asosiy o'rganishlar ro'yxati (array of strings)
       - metrics: Ushbu video uchun statistikalar (views, likes, comments, shares, saves). DIQQAT: Statistikani O'ZINGIZDAN TO'QIMANG! Agar videoni aniq topib, ma'lumotni ko'ra olmasangiz 'Noma'lum' deb yozing.
       - whyItWorked: Videoga qanday yondashilgani va nega aynan shu video TOP ga chiqqani haqida batafsil tahlil.
       - videoUrl: Bu QAT'IY ravishda aniq bitta videoning (Reel) linki bo'lishi shart (masalan: https://www.instagram.com/reel/XYZ123 yoki https://www.instagram.com/p/XYZ123). Profilning umumiy linkini (masalan: https://instagram.com/username) HECH QACHON bermang! Agar aniq videoning linkini topa olmasangiz, bu maydonni bo'sh qoldiring ("").
    
    Natijani QAT'IY ravishda quyidagi JSON formatida (array ichida aniq 6 ta obyekt) qaytaring. Boshqa hech qanday so'z, izoh yoki markdown (masalan, \`\`\`json) qo'shmang. Faqat toza JSON qaytaring:
    [
      {
        "id": "tasodifiy-id-1",
        "title": "Struktura nomi",
        "hook": "Hook matni",
        "structure": "Body matni",
        "format": "POV",
        "audioStrategy": "Original ovoz + Trend musiqa",
        "cta": "Izohlarda fikringizni yozing",
        "tone": "Kayfiyat",
        "visualStyle": "Vizual uslub",
        "keyTakeaways": ["O'rganish 1", "O'rganish 2"],
        "metrics": {
          "views": "1.2M",
          "likes": "50K",
          "comments": "1200",
          "shares": "5000",
          "saves": "10K"
        },
        "whyItWorked": "Bu video topga chiqishining asosiy sababi...",
        "videoUrl": "https://www.instagram.com/reel/..."
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "[]";
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const patterns: ViralPattern[] = JSON.parse(cleanedText);
    
    // Ensure all patterns have unique IDs if they don't
    return patterns.map(p => ({
      ...p,
      id: p.id || Math.random().toString(36).substring(2, 9)
    }));
  } catch (e: any) {
    console.error("Error analyzing profile:", e);
    if (e?.status === 429 || e?.status === 'RESOURCE_EXHAUSTED' || e?.message?.includes('quota') || e?.message?.includes('429')) {
      throw new Error("Siz kiritgan API kalitning bepul limiti tugadi (Quota exceeded). Iltimos, biroz kuting yoki Google AI Studio'da to'lovni (billing) yoqing.");
    }
    throw new Error(`Xatolik yuz berdi: ${e?.message || JSON.stringify(e)}`);
  }
}

export async function analyzeCompetitors(
  competitorNames: string,
  myProductInfo: string,
  previousAnalyses?: CompetitorAnalysis[],
  instagramLink?: string
): Promise<string> {
  const model = "gemini-3-flash-preview";

  const historyContext = previousAnalyses && previousAnalyses.length > 0 
    ? `Oldingi tahlillar (Sizning bilimingiz): \n${previousAnalyses.map(a => `Sana: ${a.date}\nRaqobatchilar: ${a.competitorNames}\nInstagram: ${a.instagramLink || 'Kiritilmagan'}\nTahlil: ${a.analysis}`).join("\n\n---\n\n")}`
    : "";

  const linkContext = instagramLink ? `Raqobatchining Instagram havolasi: ${instagramLink}` : "";

  const prompt = `
    Siz professional biznes tahlilchi va SMM strategisiz. 
    Quyidagi raqobatchilarni tahlil qiling: ${competitorNames}
    ${linkContext}
    Mening mahsulotim: ${myProductInfo}
    
    ${historyContext}
    
    Vazifangiz:
    1. Raqobatchilarning Instagram va ijtimoiy tarmoqlardagi kuchli va kuchsiz tomonlarini aniqlang.
    2. Ularning kontent strategiyasini tahlil qiling (qanday videolar, qanday hooklar ishlatishadi).
    3. Mening mahsulotim ulardan qanday qilib ajralib turishi (USP - Unique Selling Proposition) bo'yicha aniq strategiya bering.
    4. Ularda yo'q, lekin menda bo'lishi kerak bo'lgan 3 ta kreativ g'oya taklif qiling.
    
    Javobni chiroyli Markdown formatida, jadval va ro'yxatlar bilan qaytaring.
    Google Search orqali ushbu raqobatchilar haqida eng so'nggi ma'lumotlarni qidirib ko'ring.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  return response.text || "Tahlil qilib bo'lmadi.";
}

export async function getRealTimeTrends(
  category: string
): Promise<string> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Hozirgi vaqtda (2026-yil mart oyi) Instagram, TikTok va Reels ijtimoiy tarmoqlarida ${category} sohasida qanday trendlar mavjudligini aniqlang.
    
    Vazifangiz:
    1. Eng ommabop 5 ta trendni (audio, vizual uslub yoki mavzu) toping.
    2. Har bir trend nima uchun viral bo'layotganini tushuntiring.
    3. Ushbu trendlarni qanday qilib brendlar o'z mahsulotlari uchun ishlata olishi bo'yicha qisqa maslahat bering.
    
    Javobni chiroyli Markdown formatida, trendlar ro'yxati bilan qaytaring.
    Google Search orqali eng so'nggi ma'lumotlarni qidirib ko'ring.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  return response.text || "Trendlarni topib bo'lmadi.";
}

export async function findCompetitors(
  myInstagramLink: string,
  productInfo: string
): Promise<string> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Siz professional biznes tahlilchisi va SMM mutaxassisisiz.
    Mening biznesim/mahsulotim haqida ma'lumot: ${productInfo}
    Mening Instagram profilim (yoki username): ${myInstagramLink}

    Vazifangiz:
    1. O'zbekiston hududidagi eng asosiy 3-5 ta kuchli raqobatchi Instagram profillarini toping.
    2. Chet eldagi (global) eng muvaffaqiyatli 3-5 ta raqobatchi Instagram profillarini toping.
    3. Har bir raqobatchi uchun quyidagilarni ko'rsating:
       - Instagram profili nomi va silkasi (yoki username)
       - Nima uchun ular kuchli raqobatchi hisoblanadi?
       - Ularning kontent strategiyasidagi eng yaxshi va o'rganishga arziydigan jihatlari nimalardan iborat?
    
    Javobingizni chiroyli Markdown formatida, o'zbek tilida, aniq va tushunarli qilib taqdim eting.
    Google Search orqali eng so'nggi va aniq ma'lumotlarni qidirib toping.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  return response.text || "Raqobatchilarni topishda xatolik yuz berdi.";
}

export async function generateContentPlan(
  productInfo: string,
  days: number = 7
): Promise<string> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Siz professional SMM menejeri va kontent prodyuserisiz.
    Mening mahsulotim/xizmatim: ${productInfo}

    Vazifangiz: Menga Instagram Reels va TikTok uchun ${days} kunlik aniq, strategik va xilma-xil kontent reja tuzib bering.
    
    Har bir kun uchun quyidagilarni ko'rsating:
    - **Kun ${days === 7 ? "1-7" : "1-15"}**: (Masalan: Kun 1)
    - **Mavzu / G'oya**: Videoning qisqacha mazmuni.
    - **Format**: (Masalan: Trend audio, POV, Ekspert maslahati, Hazil, Unboxing, Mijoz sharhi, Muammo-yechim).
    - **Hook (Ilgak)**: Videoni boshlash uchun eng kuchli 1 ta gap.
    - **Maqsad**: Bu video orqali nimaga erishamiz? (Masalan: Ishonch uyg'otish, Sotuv, Obunachi yig'ish, Saqlab qolish).
    
    Javobingizni chiroyli Markdown formatida, jadval emas, balki ro'yxat ko'rinishida, o'qishga qulay qilib taqdim eting.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }]
  });

  return response.text || "Kontent reja tuzishda xatolik yuz berdi.";
}

export async function generateHooks(
  productInfo: string
): Promise<string> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Siz dunyodagi eng zo'r kopirayter va TikTok/Reels ssenaristisiz.
    Mening mahsulotim/xizmatim: ${productInfo}

    Vazifangiz: Videoning birinchi 3 soniyasida tomoshabinni "skrol" qilishdan to'xtatib qoladigan, viral bo'lish ehtimoli 99% bo'lgan 10 ta turli xil "Hook" (ilgak) yozib bering.
    
    Ilgaklarni quyidagi toifalarga bo'ling:
    1. ❓ **Savol (Qiziqish uyg'otuvchi)** - 2 ta
    2. 🤯 **Shok fakt / Kutilmagan bayonot** - 2 ta
    3. 🛑 **Xatoni ko'rsatish (Negativ hook)** - 2 ta
    4. 💡 **Muammo va Yechim** - 2 ta
    5. 🤫 **Sir / Insaider ma'lumot** - 2 ta
    
    Har bir ilgak uchun:
    - Ekranda nima yozilishi kerak (Text-on-screen).
    - Orqa fonda qanday kadr bo'lishi kerak (B-roll g'oyasi).
    
    Javobingizni chiroyli Markdown formatida taqdim eting.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }]
  });

  return response.text || "Ilgaklar yaratishda xatolik yuz berdi.";
}

export async function generateAudiencePersona(
  productInfo: string
): Promise<string> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Siz dunyodagi eng kuchli SMM strateg va marketing psixologisz.
    Mening mahsulotim/xizmatim: ${productInfo}

    Vazifangiz: Menga ushbu mahsulotni sotib olish ehtimoli eng yuqori bo'lgan 3 ta aniq 'Buyer Persona' (Xaridor portreti) tuzib bering.
    
    Har bir persona uchun quyidagilarni batafsil yozing:
    1. 👤 **Kim u?** (Yoshi, kasbi, daromadi, qiziqishlari)
    2. 🤕 **Og'riqli nuqtalari (Pain points)**: U qanday muammodan qiynalyapti?
    3. 🌟 **Yashirin istaklari**: U aslida nimani xohlaydi? (Masalan, odamlar drel sotib olmaydi, devordagi teshikni sotib oladi).
    4. 🛑 **E'tirozlari (Objections)**: Uni sotib olishdan nima to'xtatib turibdi? (Qimmatmi, ishonmaydimi, vaqti yo'qmi?)
    5. 📱 **Qanday kontent yoqadi?**: Unga qanday formatdagi videolar ta'sir qiladi? (Hazil, fakt, emotsional, ekspert).
    
    Javobingizni chiroyli Markdown formatida taqdim eting.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }]
  });

  return response.text || "Auditoriya tahlilida xatolik yuz berdi.";
}

export async function generateContentFunnel(
  productInfo: string
): Promise<string> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Siz sotuv voronkasi (Sales Funnel) bo'yicha uztozsiz.
    Mening mahsulotim/xizmatim: ${productInfo}

    Vazifangiz: Mijozni "Tanimayman" degan bosqichdan "Sotib olaman" degan bosqichgacha olib boruvchi 3 bosqichli kontent voronkasini (Content Funnel) tuzib bering.
    
    Har bir bosqich uchun 3 tadan aniq video g'oyasi va CTA (Call to Action) bering:
    
    1. 🧊 **TOFU (Top of Funnel - Sovuq auditoriya uchun)**:
       - Maqsad: Brendni tanitish, e'tibor tortish, viral bo'lish.
       - G'oyalar (3 ta)
       - CTA: (Masalan: "Obuna bo'ling", "Fikr bildiring")
       
    2. ☕ **MOFU (Middle of Funnel - Iliq auditoriya uchun)**:
       - Maqsad: Ishonch uyg'otish, ekspertizani ko'rsatish, muammoga yechim berish.
       - G'oyalar (3 ta)
       - CTA: (Masalan: "Saqlab qo'ying", "Directga yozing")
       
    3. 🔥 **BOFU (Bottom of Funnel - Issiq auditoriya uchun)**:
       - Maqsad: Sotish, e'tirozlarni yopish, ijtimoiy isbot (social proof) ko'rsatish.
       - G'oyalar (3 ta)
       - CTA: (Masalan: "Hozir xarid qiling", "Link orqali o'ting")
    
    Javobingizni chiroyli Markdown formatida taqdim eting.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }]
  });

  return response.text || "Sotuv voronkasini tuzishda xatolik yuz berdi.";
}

export async function generatePostCaption(
  productInfo: string,
  topic: string
): Promise<string> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Siz dunyodagi eng kuchli SMM kopirayterisiz. 
    Mening mahsulotim/xizmatim: ${productInfo}
    Post mavzusi: ${topic}

    Vazifangiz: Instagram yoki Telegram uchun juda kuchli, sotuvchi va jalb qiluvchi post matnini (caption) yozib berish.
    
    Qoidalar:
    1. Matnni qiziqarli HOOK (ilgak) bilan boshlang.
    2. O'quvchini zeriktirmaslik uchun emojilardan me'yorida foydalaning.
    3. Matnni o'qishga qulay qilib, xatboshilarga ajrating.
    4. Oxirida aniq CTA (Call to Action - Harakatga chorlov) bo'lsin.
    5. Post mavzusiga mos 10-15 ta trenddagi xeshteglarni (#) qo'shing.
    
    Javobni chiroyli Markdown formatida qaytaring.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }]
  });

  return response.text || "Post matnini yaratishda xatolik yuz berdi.";
}

export async function generateStoriesStrategy(
  productInfo: string
): Promise<string> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Siz professional Storymeyker va SMM menejerisiz.
    Mening mahsulotim/xizmatim: ${productInfo}

    Vazifangiz: Instagram Stories uchun 5 kunlik, obunachilarni jalb qiluvchi (engagement) va sotuvga olib boruvchi strategiya tuzib berish.
    
    Har bir kun uchun:
    - Ertalab: Qanday stori qo'yilishi kerak? (Masalan: Kunlik reja, motivatsiya, savol)
    - Tushlik: Qanday stori? (Masalan: Ish jarayoni, mahsulot detali, mijoz sharhi)
    - Kechqurun: Qanday stori? (Masalan: Natija, interaktiv o'yin, CTA)
    
    Qoidalar:
    1. Har bir stori uchun qanday interaktiv stiker (Savol, So'rovnoma, Slayder, Test) ishlatish kerakligini aniq ko'rsating.
    2. Storilar bir-biriga bog'liq bo'lsin (Storytelling).
    3. Javobni chiroyli Markdown formatida, kunlarga ajratilgan holda qaytaring.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }]
  });

  return response.text || "Stories strategiyasini yaratishda xatolik yuz berdi.";
}

export async function generateAdCampaign(
  productInfo: string
): Promise<string> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Siz professional Targetolog va Performance Marketersiz.
    Mening mahsulotim/xizmatim: ${productInfo}

    Vazifangiz: Facebook va Instagram Ads uchun to'liq reklama kampaniyasi strategiyasini tuzib berish.
    
    Quyidagilarni batafsil yozib bering:
    1. 🎯 **Maqsadli Auditoriya (Targeting)**: Yosh, jins, hudud, qiziqishlar (Interests) va xatti-harakatlar (Behaviors).
    2. 📝 **Reklama Matnlari (Ad Copies)**: 3 xil variantda reklama matni yozing (Qisqa, O'rtacha, Uzun/Hikoya).
    3. 🖼️ **Kreativ G'oyalari**: Reklama uchun qanday rasm yoki video ishlatish kerak? (3 ta kreativ g'oya).
    4. 💰 **Byudjet va Strategiya**: Reklamani qanday test qilish va byudjetni qanday taqsimlash bo'yicha maslahat.
    
    Javobni chiroyli Markdown formatida qaytaring.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }]
  });

  return response.text || "Reklama strategiyasini yaratishda xatolik yuz berdi.";
}
