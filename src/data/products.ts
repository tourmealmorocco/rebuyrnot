export interface Comment {
  id: string;
  vote: 'rebuy' | 'not';
  text: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'cars' | 'tech' | 'beauty' | 'fashion' | 'home';
  image: string;
  rebuyCount: number;
  notCount: number;
  recentVotes: number;
  description: string;
  topRebuyReasons: string[];
  topNotReasons: string[];
  comments: Comment[];
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Model 3',
    brand: 'Tesla',
    category: 'cars',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop',
    rebuyCount: 847,
    notCount: 234,
    recentVotes: 32,
    description: 'Electric sedan with cutting-edge technology, autopilot features, and impressive range. A game-changer in the EV market.',
    topRebuyReasons: [
      'Amazing autopilot and tech features',
      'Low maintenance costs over time',
      'Incredible acceleration and performance'
    ],
    topNotReasons: [
      'Build quality inconsistencies',
      'Limited service center availability',
      'Expensive repairs when needed'
    ],
    comments: []
  },
  {
    id: '2',
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    category: 'tech',
    image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&auto=format&fit=crop',
    rebuyCount: 1523,
    notCount: 412,
    recentVotes: 45,
    description: 'Flagship smartphone featuring titanium design, A17 Pro chip, and advanced camera system with 5x optical zoom.',
    topRebuyReasons: [
      'Best-in-class camera quality',
      'Smooth iOS experience and updates',
      'Premium titanium build quality'
    ],
    topNotReasons: [
      'High price point',
      'Limited customization options',
      'Battery could be better'
    ],
    comments: []
  },
  {
    id: '3',
    name: 'Dyson Airwrap',
    brand: 'Dyson',
    category: 'beauty',
    image: 'https://images.unsplash.com/photo-1522338242042-2d1c2e1f5851?w=800&auto=format&fit=crop',
    rebuyCount: 623,
    notCount: 189,
    recentVotes: 18,
    description: 'Revolutionary hair styling tool using air to curl, wave, smooth and dry hair without extreme heat damage.',
    topRebuyReasons: [
      'Protects hair from heat damage',
      'Multiple styling attachments included',
      'Professional results at home'
    ],
    topNotReasons: [
      'Very expensive for a hair tool',
      'Learning curve to use properly',
      'Heavy and bulky to handle'
    ],
    comments: []
  },
  {
    id: '4',
    name: 'Air Jordan 1',
    brand: 'Nike',
    category: 'fashion',
    image: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&auto=format&fit=crop',
    rebuyCount: 2341,
    notCount: 321,
    recentVotes: 67,
    description: 'Iconic basketball sneaker that transcended sports to become a cultural phenomenon and fashion staple.',
    topRebuyReasons: [
      'Timeless design never goes out of style',
      'Great resale value',
      'Comfortable for daily wear'
    ],
    topNotReasons: [
      'Hard to get popular colorways',
      'Prices inflated by resellers',
      'Not the most comfortable for sports'
    ],
    comments: []
  },
  {
    id: '5',
    name: 'MacBook Pro M3',
    brand: 'Apple',
    category: 'tech',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop',
    rebuyCount: 1892,
    notCount: 287,
    recentVotes: 52,
    description: 'Professional laptop with Apple Silicon M3 chip, stunning Liquid Retina XDR display, and all-day battery life.',
    topRebuyReasons: [
      'Incredible M3 chip performance',
      'Best laptop display on the market',
      'Silent operation and amazing battery'
    ],
    topNotReasons: [
      'Very expensive starting price',
      'Limited port selection',
      'Not compatible with all software'
    ],
    comments: []
  },
  {
    id: '6',
    name: 'G-Class',
    brand: 'Mercedes',
    category: 'cars',
    image: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?w=800&auto=format&fit=crop',
    rebuyCount: 567,
    notCount: 423,
    recentVotes: 15,
    description: 'Luxury SUV with military heritage, combining rugged capability with premium comfort and iconic boxy design.',
    topRebuyReasons: [
      'Iconic design that stands out',
      'Incredible off-road capability',
      'Luxurious interior quality'
    ],
    topNotReasons: [
      'Extremely high fuel consumption',
      'Very expensive to maintain',
      'Poor handling on highways'
    ],
    comments: []
  },
  {
    id: '7',
    name: 'MALM Bed Frame',
    brand: 'IKEA',
    category: 'home',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop',
    rebuyCount: 1234,
    notCount: 567,
    recentVotes: 23,
    description: 'Clean-lined bed frame with storage options, available in multiple sizes and finishes for modern bedrooms.',
    topRebuyReasons: [
      'Great value for the price',
      'Useful storage drawers option',
      'Clean minimalist design'
    ],
    topNotReasons: [
      'Complicated assembly process',
      'Particleboard durability concerns',
      'Can be squeaky over time'
    ],
    comments: []
  },
  {
    id: '8',
    name: 'PlayStation 5',
    brand: 'Sony',
    category: 'tech',
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&auto=format&fit=crop',
    rebuyCount: 2156,
    notCount: 389,
    recentVotes: 41,
    description: 'Next-gen gaming console with lightning-fast SSD, stunning 4K graphics, and innovative DualSense controller.',
    topRebuyReasons: [
      'Amazing exclusive game library',
      'DualSense controller is revolutionary',
      'Super fast loading times'
    ],
    topNotReasons: [
      'Large and bulky design',
      'Limited SSD storage space',
      'Few next-gen exclusives so far'
    ],
    comments: []
  },
  {
    id: '9',
    name: 'The Ordinary Set',
    brand: 'DECIEM',
    category: 'beauty',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop',
    rebuyCount: 892,
    notCount: 156,
    recentVotes: 28,
    description: 'Science-backed skincare with clinical formulations at affordable prices. Transparent ingredients and proven results.',
    topRebuyReasons: [
      'Incredible value for quality',
      'Transparent ingredient lists',
      'Visible results on skin'
    ],
    topNotReasons: [
      'Can be confusing to choose products',
      'Some products cause purging',
      'Basic packaging and experience'
    ],
    comments: []
  },
];

export const getTotalVotes = () => {
  return products.reduce((acc, p) => acc + p.rebuyCount + p.notCount, 0);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id);
};
