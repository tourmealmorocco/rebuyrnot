import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'fr' | 'ar';

interface Translations {
  rebuy: string;
  not: string;
  theScore: string;
  search: string;
  totalScores: string;
  share: string;
  shareText: string;
  trending: string;
  categories: {
    all: string;
    cars: string;
    tech: string;
    beauty: string;
    fashion: string;
    home: string;
  };
  voted: string;
  votes: string;
  // New translations
  idRebuy: string;
  notAgain: string;
  finalScore: string;
  topReasonsRebuy: string;
  topReasonsNot: string;
  writeReview: string;
  reviewPlaceholder: string;
  submit: string;
  cancel: string;
  backToProducts: string;
  owners: string;
  thankYou: string;
  alreadyVoted: string;
  // Hero section
  heroTitle: string;
  heroSubtitle: string;
  or: string;
  searchPlaceholder: string;
  // Auth translations
  signInToVote: string;
  whySignIn: string;
  continueWithGoogle: string;
  enterYourName: string;
  namePlaceholder: string;
  nameExplanation: string;
  nameRequired: string;
  nameTooShort: string;
  profileUpdated: string;
  continue: string;
  // Product submission
  submitProduct: string;
  submitProductDesc: string;
  productName: string;
  brandName: string;
  category: string;
  selectCategory: string;
  description: string;
  productDescPlaceholder: string;
  imageUrl: string;
  suggestProduct: string;
  suggest: string;
  thankYouSubmission: string;
}

const translations: Record<Language, Translations> = {
  en: {
    rebuy: 'Rebuy',
    not: 'Not',
    theScore: 'The Score',
    search: 'Search products...',
    totalScores: 'Total Scores Cast',
    share: 'Share',
    shareText: 'Check out this product score on RebuyRnot!',
    trending: 'Trending',
    categories: {
      all: 'All',
      cars: 'Cars',
      tech: 'Tech',
      beauty: 'Beauty',
      fashion: 'Fashion',
      home: 'Home',
    },
    voted: 'You voted',
    votes: 'votes',
    idRebuy: "I'd Rebuy",
    notAgain: "Not Again",
    finalScore: "The score from",
    topReasonsRebuy: "Top 3 Reasons to Rebuy",
    topReasonsNot: "Top 3 Reasons Not Again",
    writeReview: "Write Your Review",
    reviewPlaceholder: "Share your experience with this product...",
    submit: "Submit",
    cancel: "Cancel",
    backToProducts: "Back to Products",
    owners: "owners",
    thankYou: "Thanks for your vote!",
    alreadyVoted: "You already voted on this product",
    heroTitle: "Should you really buy it?",
    heroSubtitle: "Would you buy it again?",
    or: "or",
    searchPlaceholder: "Search products, brands...",
    signInToVote: "Sign in to vote",
    whySignIn: "Sign in with your Google account to share your experience and vote on products.",
    continueWithGoogle: "Continue with Google",
    enterYourName: "What's your name?",
    namePlaceholder: "Your display name",
    nameExplanation: "This name will be shown with your reviews.",
    nameRequired: "Please enter your name",
    nameTooShort: "Name must be at least 2 characters",
    profileUpdated: "Profile updated!",
    continue: "Continue",
    submitProduct: "Suggest a Product",
    submitProductDesc: "Submit a product you want others to vote on",
    productName: "Product Name",
    brandName: "Brand",
    category: "Category",
    selectCategory: "Select category",
    description: "Description",
    productDescPlaceholder: "Brief description of the product...",
    imageUrl: "Image URL",
    suggestProduct: "Suggest Product",
    suggest: "Suggest",
    thankYouSubmission: "Thank you for your suggestion!",
  },
  fr: {
    rebuy: 'Racheter',
    not: 'Pas question',
    theScore: 'Le Score',
    search: 'Rechercher des produits...',
    totalScores: 'Scores totaux',
    share: 'Partager',
    shareText: 'Découvrez ce score produit sur RebuyRnot !',
    trending: 'Tendance',
    categories: {
      all: 'Tout',
      cars: 'Voitures',
      tech: 'Tech',
      beauty: 'Beauté',
      fashion: 'Mode',
      home: 'Maison',
    },
    voted: 'Vous avez voté',
    votes: 'votes',
    idRebuy: "Je rachèterais",
    notAgain: "Plus jamais",
    finalScore: "Le score de",
    topReasonsRebuy: "Top 3 Raisons de Racheter",
    topReasonsNot: "Top 3 Raisons de Ne Pas",
    writeReview: "Écrire Votre Avis",
    reviewPlaceholder: "Partagez votre expérience avec ce produit...",
    submit: "Soumettre",
    cancel: "Annuler",
    backToProducts: "Retour aux Produits",
    owners: "propriétaires",
    thankYou: "Merci pour votre vote!",
    alreadyVoted: "Vous avez déjà voté pour ce produit",
    heroTitle: "Devriez-vous vraiment l'acheter ?",
    heroSubtitle: "Le rachèteriez-vous?",
    or: "ou",
    searchPlaceholder: "Rechercher produits, marques...",
    signInToVote: "Connectez-vous pour voter",
    whySignIn: "Connectez-vous avec votre compte Google pour partager votre expérience et voter.",
    continueWithGoogle: "Continuer avec Google",
    enterYourName: "Quel est votre nom?",
    namePlaceholder: "Votre nom d'affichage",
    nameExplanation: "Ce nom sera affiché avec vos avis.",
    nameRequired: "Veuillez entrer votre nom",
    nameTooShort: "Le nom doit contenir au moins 2 caractères",
    profileUpdated: "Profil mis à jour!",
    continue: "Continuer",
    submitProduct: "Suggérer un produit",
    submitProductDesc: "Soumettez un produit sur lequel vous voulez que les autres votent",
    productName: "Nom du produit",
    brandName: "Marque",
    category: "Catégorie",
    selectCategory: "Sélectionner une catégorie",
    description: "Description",
    productDescPlaceholder: "Brève description du produit...",
    imageUrl: "URL de l'image",
    suggestProduct: "Suggérer un produit",
    suggest: "Suggérer",
    thankYouSubmission: "Merci pour votre suggestion!",
  },
  ar: {
    rebuy: 'نعاود نشريه',
    not: 'ندمت عليه',
    theScore: 'النتيجة',
    search: 'ابحث عن المنتجات...',
    totalScores: 'مجموع الأصوات',
    share: 'مشاركة',
    shareText: 'شوف هاد النتيجة فـ RebuyRnot!',
    trending: 'رائج',
    categories: {
      all: 'الكل',
      cars: 'سيارات',
      tech: 'تكنولوجيا',
      beauty: 'جمال',
      fashion: 'أزياء',
      home: 'منزل',
    },
    voted: 'صوتت',
    votes: 'أصوات',
    idRebuy: "غادي نعاود نشريه",
    notAgain: "ماغاديش",
    finalScore: "النتيجة من",
    topReasonsRebuy: "أهم 3 أسباب للشراء",
    topReasonsNot: "أهم 3 أسباب للندم",
    writeReview: "اكتب رأيك",
    reviewPlaceholder: "شارك تجربتك مع هذا المنتج...",
    submit: "إرسال",
    cancel: "إلغاء",
    backToProducts: "رجوع للمنتجات",
    owners: "مالك",
    thankYou: "شكراً على تصويتك!",
    alreadyVoted: "سبق لك التصويت على هذا المنتج",
    heroTitle: "واش بصّح تستاهل تشريها؟",
    heroSubtitle: "واش غادي تعاود تشريه؟",
    or: "ولا",
    searchPlaceholder: "ابحث عن منتجات، ماركات...",
    signInToVote: "سجل الدخول للتصويت",
    whySignIn: "سجل الدخول بحسابك على Google لمشاركة تجربتك والتصويت.",
    continueWithGoogle: "تواصل مع Google",
    enterYourName: "شنو سميتك؟",
    namePlaceholder: "الاسم ديالك",
    nameExplanation: "هاد الاسم غادي يبان مع الآراء ديالك.",
    nameRequired: "من فضلك دخل سميتك",
    nameTooShort: "الاسم خاصو يكون على الأقل 2 حروف",
    profileUpdated: "تم تحديث الملف الشخصي!",
    continue: "متابعة",
    submitProduct: "اقترح منتج",
    submitProductDesc: "اقترح منتج باش الناس يصوتو عليه",
    productName: "اسم المنتج",
    brandName: "الماركة",
    category: "الفئة",
    selectCategory: "اختار الفئة",
    description: "الوصف",
    productDescPlaceholder: "وصف قصير ديال المنتج...",
    imageUrl: "رابط الصورة",
    suggestProduct: "اقترح منتج",
    suggest: "اقترح",
    thankYouSubmission: "شكراً على اقتراحك!",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('rebuyrnot-language');
    return (saved as Language) || 'ar';
  });

  const isRTL = language === 'ar';

  useEffect(() => {
    localStorage.setItem('rebuyrnot-language', language);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language], isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
