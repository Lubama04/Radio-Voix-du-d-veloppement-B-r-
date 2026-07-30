import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Lang = 'fr' | 'en' | 'ar'

interface Translations {
  nav: { home:string; news:string; radio:string; projects:string; gallery:string; about:string; contact:string }
  hero: { badge:string; title:string; subtitle:string; cta1:string; cta2:string }
  live: { label:string; on:string; off:string; loading:string }
  sections: { latestNews:string; programs:string; mission:string; location:string; partners:string; podcasts:string; schedule:string; gallery:string; team:string; agenda:string }
  footer: { rights:string; description:string }
  forms: { name:string; phone:string; email:string; message:string; subject:string; send:string; success:string; error:string; subscribe:string }
  pages: { news:string; radio:string; projects:string; gallery:string; about:string; contact:string; agenda:string }
  misc: { seeAll:string; loading:string; noData:string; views:string; listens:string; share:string; duration:string; download:string; listen:string; search:string }
}

const T: Record<Lang, Translations> = {
  fr: {
    nav: { home:'Accueil', news:'Actualités', radio:'Radio', projects:'Projets', gallery:'Galerie', about:'À Propos', contact:'Contact' },
    hero: { badge:'Antenne en direct', title:'La voix qui porte le développement', subtitle:'Radio communautaire 96.7 FM · Béré, Province de la Tandjilé, Tchad', cta1:'Écouter en direct', cta2:'Découvrir la radio' },
    live: { label:'En Direct', on:'En cours d\'antenne', off:'Hors antenne', loading:'Connexion...' },
    sections: { latestNews:'Dernières actualités', programs:'Programmes du jour', mission:'Notre mission', location:'Nous trouver', partners:'Partenaires', podcasts:'Podcasts récents', schedule:'Grille des programmes', gallery:'Galerie photos', team:'Notre équipe', agenda:'Agenda Béré' },
    footer: { rights:'Tous droits réservés', description:'Radio communautaire au service du développement local de Béré et de la province de la Tandjilé, au Tchad.' },
    forms: { name:'Nom complet', phone:'Téléphone', email:'Email', message:'Message', subject:'Objet', send:'Envoyer', success:'Message envoyé avec succès !', error:'Erreur lors de l\'envoi. Réessayez.', subscribe:'S\'abonner' },
    pages: { news:'Actualités', radio:'Radio & Émissions', projects:'Projets & Partenariats', gallery:'Galerie Photos', about:'À Propos', contact:'Nous Contacter', agenda:'Agenda' },
    misc: { seeAll:'Voir tout', loading:'Chargement...', noData:'Aucune donnée disponible', views:'vues', listens:'écoutes', share:'Partager', duration:'Durée', download:'Télécharger', listen:'Écouter', search:'Rechercher...' },
  },
  en: {
    nav: { home:'Home', news:'News', radio:'Radio', projects:'Projects', gallery:'Gallery', about:'About', contact:'Contact' },
    hero: { badge:'Live on air', title:'The voice that carries development', subtitle:'Community radio 96.7 FM · Béré, Province of Tandjilé, Chad', cta1:'Listen live', cta2:'Discover the radio' },
    live: { label:'Live', on:'On air', off:'Off air', loading:'Connecting...' },
    sections: { latestNews:'Latest news', programs:'Today\'s programs', mission:'Our mission', location:'Find us', partners:'Partners', podcasts:'Recent podcasts', schedule:'Program schedule', gallery:'Photo gallery', team:'Our team', agenda:'Béré agenda' },
    footer: { rights:'All rights reserved', description:'Community radio serving local development in Béré and the province of Tandjilé, Chad.' },
    forms: { name:'Full name', phone:'Phone', email:'Email', message:'Message', subject:'Subject', send:'Send', success:'Message sent successfully!', error:'Error sending. Please try again.', subscribe:'Subscribe' },
    pages: { news:'News', radio:'Radio & Shows', projects:'Projects & Partnerships', gallery:'Photo Gallery', about:'About Us', contact:'Contact Us', agenda:'Agenda' },
    misc: { seeAll:'See all', loading:'Loading...', noData:'No data available', views:'views', listens:'listens', share:'Share', duration:'Duration', download:'Download', listen:'Listen', search:'Search...' },
  },
  ar: {
    nav: { home:'الرئيسية', news:'الأخبار', radio:'الراديو', projects:'المشاريع', gallery:'المعرض', about:'من نحن', contact:'اتصل بنا' },
    hero: { badge:'البث المباشر', title:'الصوت الذي يحمل التنمية', subtitle:'راديو مجتمعي 96.7 FM · بيري، مقاطعة تانجيلي، تشاد', cta1:'استمع مباشرة', cta2:'اكتشف الراديو' },
    live: { label:'مباشر', on:'على الهواء', off:'خارج الهواء', loading:'جارٍ الاتصال...' },
    sections: { latestNews:'آخر الأخبار', programs:'برامج اليوم', mission:'مهمتنا', location:'أين نحن', partners:'الشركاء', podcasts:'البودكاست الأخيرة', schedule:'جدول البرامج', gallery:'معرض الصور', team:'فريقنا', agenda:'أجندة بيري' },
    footer: { rights:'جميع الحقوق محفوظة', description:'راديو مجتمعي في خدمة التنمية المحلية في بيري ومقاطعة تانجيلي بتشاد.' },
    forms: { name:'الاسم الكامل', phone:'الهاتف', email:'البريد الإلكتروني', message:'الرسالة', subject:'الموضوع', send:'إرسال', success:'تم إرسال الرسالة بنجاح!', error:'خطأ في الإرسال. حاول مرة أخرى.', subscribe:'اشتراك' },
    pages: { news:'الأخبار', radio:'الراديو والبرامج', projects:'المشاريع والشراكات', gallery:'معرض الصور', about:'من نحن', contact:'اتصل بنا', agenda:'الأجندة' },
    misc: { seeAll:'عرض الكل', loading:'جارٍ التحميل...', noData:'لا توجد بيانات متاحة', views:'مشاهدات', listens:'استماعات', share:'مشاركة', duration:'المدة', download:'تحميل', listen:'استمع', search:'بحث...' },
  },
}

interface LangCtx { lang: Lang; t: Translations; setLang: (l: Lang) => void; isRtl: boolean }
const LanguageContext = createContext<LangCtx | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('vdb-lang') as Lang
    return saved && ['fr','en','ar'].includes(saved) ? saved : 'fr'
  })

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('vdb-lang', l)
  }

  useEffect(() => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.setAttribute('dir', dir)
    document.documentElement.setAttribute('lang', lang)
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, t: T[lang], setLang, isRtl: lang === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang doit être utilisé dans LanguageProvider')
  return ctx
}
