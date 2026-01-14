-- Create site_content table for managing all platform texts and translations
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_key TEXT NOT NULL UNIQUE,
  content_en TEXT NOT NULL,
  content_fr TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text',
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can read site content"
ON public.site_content
FOR SELECT
USING (true);

-- Admin only insert
CREATE POLICY "Only admins can insert site content"
ON public.site_content
FOR INSERT
WITH CHECK (is_admin());

-- Admin only update
CREATE POLICY "Only admins can update site content"
ON public.site_content
FOR UPDATE
USING (is_admin());

-- Admin only delete
CREATE POLICY "Only admins can delete site content"
ON public.site_content
FOR DELETE
USING (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_content;

-- Seed with all existing translations
INSERT INTO public.site_content (content_key, content_en, content_fr, content_ar, content_type, category, description) VALUES
-- Hero Section
('heroTitle', 'What did you buy? Would you buy it again?', 'Qu''avez-vous acheté? Le rachèteriez-vous?', 'شنو شريتي؟ واش غادي تعاود تشريه؟', 'title', 'hero', 'Main hero section title'),
('heroSubtitle', 'Share your honest opinion and help others make better purchasing decisions', 'Partagez votre avis honnête et aidez les autres à prendre de meilleures décisions d''achat', 'شارك رأيك الصادق وساعد الآخرين ياخذو قرارات أحسن', 'text', 'hero', 'Hero section subtitle'),
('searchPlaceholder', 'Search products...', 'Rechercher des produits...', 'ابحث عن المنتجات...', 'placeholder', 'hero', 'Search bar placeholder text'),
('or', 'or', 'ou', 'أو', 'text', 'hero', 'Connector word between options'),

-- Score/Voting
('rebuy', 'Rebuy', 'Racheter', 'نعاود نشريه', 'button', 'voting', 'Positive vote button text'),
('not', 'Not', 'Pas question', 'ندمت عليه', 'button', 'voting', 'Negative vote button text'),
('theScore', 'The Score', 'Le Score', 'النتيجة', 'title', 'voting', 'Score section header'),
('idRebuy', 'I''d Rebuy', 'Je rachèterais', 'غادي نعاود نشريه', 'text', 'voting', 'Positive vote label'),
('notAgain', 'Not Again', 'Plus jamais', 'ما نعاودش', 'text', 'voting', 'Negative vote label'),
('finalScore', 'Final Score', 'Score Final', 'النتيجة النهائية', 'title', 'voting', 'Final score label'),
('voted', 'voted', 'ont voté', 'صوتو', 'text', 'voting', 'Vote count suffix'),
('votes', 'votes', 'votes', 'أصوات', 'text', 'voting', 'Votes plural'),

-- Product Page
('topReasonsRebuy', 'Top Reasons to Rebuy', 'Principales raisons de racheter', 'أهم الأسباب باش تعاود تشري', 'title', 'product', 'Section title for positive reasons'),
('topReasonsNot', 'Top Reasons Not to Rebuy', 'Principales raisons de ne pas racheter', 'أهم الأسباب باش ما تعاودش تشري', 'title', 'product', 'Section title for negative reasons'),
('writeReview', 'Write your review...', 'Écrivez votre avis...', 'اكتب رأيك...', 'placeholder', 'product', 'Review textarea placeholder'),
('backToProducts', 'Back to Products', 'Retour aux produits', 'رجوع للمنتجات', 'button', 'product', 'Back navigation button'),
('owners', 'owners', 'propriétaires', 'مالكين', 'text', 'product', 'Owners count label'),

-- Actions
('submit', 'Submit', 'Soumettre', 'أرسل', 'button', 'actions', 'Submit button text'),
('cancel', 'Cancel', 'Annuler', 'إلغاء', 'button', 'actions', 'Cancel button text'),
('share', 'Share', 'Partager', 'شارك', 'button', 'actions', 'Share button text'),
('shareText', 'Check out this product on RebuyOrNot!', 'Découvrez ce produit sur RebuyOrNot!', 'شوف هاد المنتج على RebuyOrNot!', 'text', 'actions', 'Default share message'),

-- Feedback
('thankYou', 'Thank you for your vote!', 'Merci pour votre vote!', 'شكرا على صوتك!', 'text', 'feedback', 'Thank you message after voting'),
('alreadyVoted', 'You have already voted for this product', 'Vous avez déjà voté pour ce produit', 'أنت صوتي من قبل على هاد المنتج', 'text', 'feedback', 'Already voted warning'),

-- Categories
('all', 'All', 'Tous', 'الكل', 'button', 'categories', 'All categories filter'),

-- Misc
('trending', 'Trending', 'Tendances', 'الرائج', 'title', 'misc', 'Trending section title'),
('totalScores', 'Total Scores', 'Scores Totaux', 'مجموع النقاط', 'text', 'misc', 'Total scores label'),
('noProducts', 'No products found matching your criteria', 'Aucun produit trouvé correspondant à vos critères', 'ما لقينا حتى منتج كيطابق البحث ديالك', 'text', 'misc', 'No products found message');