import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Lang = 'fr' | 'en' | 'ar'

interface CardText { title: string; desc: string; badge?: string }

interface Translations {
  nav: { home:string; news:string; radio:string; projects:string; gallery:string; about:string; contact:string; agenda:string; frequences:string }
  hero: { badge:string; title:string; subtitle:string; cta1:string; cta2:string }
  live: { label:string; on:string; off:string; loading:string }
  sections: { latestNews:string; programs:string; mission:string; location:string; partners:string; podcasts:string; schedule:string; gallery:string; team:string; agenda:string }
  footer: { rights:string; description:string; col1Title:string; col2Title:string; col3Title:string; col4Title:string; madeBy:string; address:string; schedule:string }
  ticker: { label:string }
  forms: { name:string; phone:string; email:string; message:string; subject:string; send:string; success:string; error:string; subscribe:string; contactTitle:string; namePlaceholder:string; phonePlaceholder:string; emailPlaceholder:string; messagePlaceholder:string }
  pages: { news:string; radio:string; projects:string; gallery:string; about:string; contact:string; agenda:string }
  misc: { seeAll:string; loading:string; noData:string; views:string; listens:string; share:string; duration:string; download:string; listen:string; search:string }
  home: {
    statLabels: [string, string, string, string]
    exploreTitle: string
    exploreSubtitle: string
    missionTitle: string
    missionText: string
    locationTitle: string
    valeurs: { title: string; desc: string }[]
  }
  cards: { news: CardText; radio: CardText; projects: CardText; gallery: CardText; about: CardText; contact: CardText }
  legal: { mentions: string; rights: string; madeBy: string; privacy: string }
}

const T: Record<Lang, Translations> = {
  fr: {
    nav: { home:'Accueil', news:'Actualités', radio:'Radio', projects:'Projets', gallery:'Galerie', about:'À propos', contact:'Contact', agenda:'Agenda', frequences:'Fréquences' },
    hero: { badge:'Antenne en direct 96.7 FM', title:'La voix qui porte le développement', subtitle:'Radio privée associative 96.7 FM · Béré, province de la Tandjilé, Tchad', cta1:'Écouter en direct', cta2:'Découvrir la radio' },
    live: { label:'En direct', on:'En cours d\'antenne', off:'Hors antenne', loading:'Connexion...' },
    sections: { latestNews:'Dernières actualités', programs:'Programmes du jour', mission:'Notre mission', location:'Nous trouver', partners:'Nos partenaires', podcasts:'Podcasts récents', schedule:'Grille des programmes', gallery:'Galerie photos', team:'Notre équipe', agenda:'Agenda Béré' },
    footer: { rights:'Tous droits réservés', description:'Radio privée associative au service du développement local de Béré et de la province de la Tandjilé, au Tchad.', col1Title:'La radio', col2Title:'Navigation', col3Title:'Émissions', col4Title:'Contact', madeBy:'Réalisé par', address:'Béré, Tandjilé Centre, province de la Tandjilé, Tchad', schedule:'Antenne 24h sur 24, 7 jours sur 7' },
    ticker: { label:'Fil info' },
    forms: { name:'Nom complet', phone:'Téléphone', email:'Email', message:'Message', subject:'Objet', send:'Envoyer', success:'Message envoyé avec succès !', error:'Erreur lors de l\'envoi. Réessayez.', subscribe:'S\'abonner', contactTitle:'Nous contacter', namePlaceholder:'Votre nom', phonePlaceholder:'+235...', emailPlaceholder:'votre@email.com', messagePlaceholder:'Votre message...' },
    pages: { news:'Actualités', radio:'Radio et émissions', projects:'Projets et partenariats', gallery:'Galerie photos', about:'À propos', contact:'Nous contacter', agenda:'Agenda' },
    misc: { seeAll:'Voir tout', loading:'Chargement...', noData:'Aucune donnée disponible', views:'vues', listens:'écoutes', share:'Partager', duration:'Durée', download:'Télécharger', listen:'Écouter', search:'Rechercher...' },
    home: {
      statLabels: ['Fréquence officielle', 'Province de la Tandjilé', 'En continu', 'Fondée'],
      exploreTitle: 'Explorez notre radio',
      exploreSubtitle: 'Tout ce que vous pouvez faire sur notre site',
      missionTitle: 'Notre mission',
      missionText: 'Radio privée associative implantée à Béré depuis 2023, la Radio Voix du Développement de Béré est au service des populations de la Tandjilé. Nous informons, nous éduquons et nous connectons les communautés rurales avec le monde.',
      locationTitle: 'Nous trouver',
      valeurs: [
        { title: 'Information', desc: 'Informer et éduquer les communautés de la Tandjilé avec une information locale fiable.' },
        { title: 'Développement', desc: 'Contribuer au développement local durable de Béré et de ses environs.' },
        { title: 'Communauté', desc: 'Être la voix des citoyens, des agriculteurs, des femmes et des jeunes de la province.' },
      ],
    },
    cards: {
      news: { title: 'Actualités', desc: 'Nouvelles de Béré, de la Tandjilé et du Tchad', badge: 'Mis à jour' },
      radio: { title: 'Radio et émissions', desc: 'Grille des programmes, podcasts, journaux et écoute en direct', badge: '96.7 FM' },
      projects: { title: 'Projets et partenariats', desc: 'Nos projets de développement local et nos partenaires' },
      gallery: { title: 'Galerie photos', desc: 'Studio, terrain, événements et équipe en images' },
      about: { title: 'À propos', desc: 'Notre histoire, notre mission et notre équipe depuis Béré' },
      contact: { title: 'Nous contacter', desc: 'Téléphone, WhatsApp, email et formulaire de contact', badge: 'Répondons vite' },
    },
    legal: { mentions: 'Mentions légales', rights: 'Tous droits réservés', madeBy: 'Développé par', privacy: 'Confidentialité' },
  },
  en: {
    nav: { home:'Home', news:'News', radio:'Radio', projects:'Projects', gallery:'Gallery', about:'About', contact:'Contact', agenda:'Agenda', frequences:'Frequencies' },
    hero: { badge:'Live on air', title:'The voice that carries development', subtitle:'Private associative radio 96.7 FM · Béré, Province of Tandjilé, Chad', cta1:'Listen live', cta2:'Discover the radio' },
    live: { label:'Live', on:'On air', off:'Off air', loading:'Connecting...' },
    sections: { latestNews:'Latest news', programs:'Today\'s programs', mission:'Our mission', location:'Find us', partners:'Our partners', podcasts:'Recent podcasts', schedule:'Program schedule', gallery:'Photo gallery', team:'Our team', agenda:'Béré agenda' },
    footer: { rights:'All rights reserved', description:'Private associative radio serving local development in Béré and the province of Tandjilé, Chad.', col1Title:'The radio', col2Title:'Navigation', col3Title:'Shows', col4Title:'Contact', madeBy:'Made by', address:'Béré, Tandjilé Centre, province of Tandjilé, Chad', schedule:'On air 24 hours a day, 7 days a week' },
    ticker: { label:'News feed' },
    forms: { name:'Full name', phone:'Phone', email:'Email', message:'Message', subject:'Subject', send:'Send', success:'Message sent successfully!', error:'Error sending. Please try again.', subscribe:'Subscribe', contactTitle:'Contact us', namePlaceholder:'Your name', phonePlaceholder:'+235...', emailPlaceholder:'your@email.com', messagePlaceholder:'Your message...' },
    pages: { news:'News', radio:'Radio & Shows', projects:'Projects & Partnerships', gallery:'Photo Gallery', about:'About Us', contact:'Contact Us', agenda:'Agenda' },
    misc: { seeAll:'See all', loading:'Loading...', noData:'No data available', views:'views', listens:'listens', share:'Share', duration:'Duration', download:'Download', listen:'Listen', search:'Search...' },
    home: {
      statLabels: ['Official frequency', 'Province of Tandjilé', 'Continuous broadcast', 'Founded'],
      exploreTitle: 'Explore our radio',
      exploreSubtitle: 'Everything you can do on our website',
      missionTitle: 'Our mission',
      missionText: 'Private associative radio established in Béré since 2023, Radio Voice of Development serves the people of Tandjilé. We inform, educate and connect rural communities with the world.',
      locationTitle: 'Find us',
      valeurs: [
        { title: 'Information', desc: 'Inform and educate Tandjilé communities with reliable local information.' },
        { title: 'Development', desc: 'Contribute to the sustainable local development of Béré and surrounding areas.' },
        { title: 'Community', desc: 'Be the voice of citizens, farmers, women and young people of the province.' },
      ],
    },
    cards: {
      news: { title: 'News', desc: 'News from Béré, Tandjilé and Chad', badge: 'Updated' },
      radio: { title: 'Radio and shows', desc: 'Program schedule, podcasts, news bulletins and live listening', badge: '96.7 FM' },
      projects: { title: 'Projects and partnerships', desc: 'Our local development projects and our partners' },
      gallery: { title: 'Photo gallery', desc: 'Studio, field, events and team in pictures' },
      about: { title: 'About us', desc: 'Our history, our mission and our team from Béré' },
      contact: { title: 'Contact us', desc: 'Phone, WhatsApp, email and contact form', badge: 'Quick reply' },
    },
    legal: { mentions: 'Legal notice', rights: 'All rights reserved', madeBy: 'Developed by', privacy: 'Privacy' },
  },
  ar: {
    nav: { home:'الرئيسية', news:'الأخبار', radio:'الراديو', projects:'المشاريع', gallery:'المعرض', about:'من نحن', contact:'اتصل بنا', agenda:'الأجندة', frequences:'الترددات' },
    hero: { badge:'البث المباشر', title:'الصوت الذي يحمل التنمية', subtitle:'راديو خاص جمعوي 96.7 FM · بيري، مقاطعة تانجيلي، تشاد', cta1:'استمع مباشرة', cta2:'اكتشف الراديو' },
    live: { label:'مباشر', on:'على الهواء', off:'خارج الهواء', loading:'جارٍ الاتصال...' },
    sections: { latestNews:'آخر الأخبار', programs:'برامج اليوم', mission:'مهمتنا', location:'أين نحن', partners:'شركاؤنا', podcasts:'البودكاست الأخيرة', schedule:'جدول البرامج', gallery:'معرض الصور', team:'فريقنا', agenda:'أجندة بيري' },
    footer: { rights:'جميع الحقوق محفوظة', description:'راديو خاص جمعوي في خدمة التنمية المحلية في بيري ومقاطعة تانجيلي بتشاد.', col1Title:'الراديو', col2Title:'التنقل', col3Title:'البرامج', col4Title:'الاتصال', madeBy:'من إنجاز', address:'بيري، تانجيلي سنتر، مقاطعة تانجيلي، تشاد', schedule:'على الهواء 24 ساعة يومياً، 7 أيام في الأسبوع' },
    ticker: { label:'نشرة الأخبار' },
    forms: { name:'الاسم الكامل', phone:'الهاتف', email:'البريد الإلكتروني', message:'الرسالة', subject:'الموضوع', send:'إرسال', success:'تم إرسال الرسالة بنجاح!', error:'خطأ في الإرسال. حاول مرة أخرى.', subscribe:'اشتراك', contactTitle:'اتصل بنا', namePlaceholder:'اسمك', phonePlaceholder:'235+...', emailPlaceholder:'بريدك@example.com', messagePlaceholder:'رسالتك...' },
    pages: { news:'الأخبار', radio:'الراديو والبرامج', projects:'المشاريع والشراكات', gallery:'معرض الصور', about:'من نحن', contact:'اتصل بنا', agenda:'الأجندة' },
    misc: { seeAll:'عرض الكل', loading:'جارٍ التحميل...', noData:'لا توجد بيانات متاحة', views:'مشاهدات', listens:'استماعات', share:'مشاركة', duration:'المدة', download:'تحميل', listen:'استمع', search:'بحث...' },
    home: {
      statLabels: ['التردد الرسمي', 'مقاطعة تانجيلي', 'بث مستمر', 'تأسست'],
      exploreTitle: 'استكشف راديونا',
      exploreSubtitle: 'كل ما يمكنك فعله على موقعنا',
      missionTitle: 'مهمتنا',
      missionText: 'راديو خاص جمعوي في بيري منذ 2023، يخدم سكان تانجيلي. نخبر ونعلم ونربط المجتمعات الريفية بالعالم.',
      locationTitle: 'أين نحن',
      valeurs: [
        { title: 'المعلومات', desc: 'إعلام وتعليم مجتمعات تانجيلي بمعلومات محلية موثوقة.' },
        { title: 'التنمية', desc: 'المساهمة في التنمية المحلية المستدامة لبيري ومحيطها.' },
        { title: 'المجتمع', desc: 'أن نكون صوت المواطنين والمزارعين والنساء والشباب في المقاطعة.' },
      ],
    },
    cards: {
      news: { title: 'الأخبار', desc: 'أخبار بيري وتانجيلي وتشاد', badge: 'محدّث' },
      radio: { title: 'الراديو والبرامج', desc: 'جدول البرامج، البودكاست، النشرات الإخبارية والاستماع المباشر', badge: '96.7 FM' },
      projects: { title: 'المشاريع والشراكات', desc: 'مشاريع التنمية المحلية وشركاؤنا' },
      gallery: { title: 'معرض الصور', desc: 'الاستوديو، الميدان، الفعاليات والفريق في صور' },
      about: { title: 'من نحن', desc: 'تاريخنا ومهمتنا وفريقنا من بيري' },
      contact: { title: 'اتصل بنا', desc: 'هاتف، واتساب، بريد إلكتروني ونموذج اتصال', badge: 'نرد بسرعة' },
    },
    legal: { mentions: 'الإشعارات القانونية', rights: 'جميع الحقوق محفوظة', madeBy: 'طوّره', privacy: 'الخصوصية' },
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
