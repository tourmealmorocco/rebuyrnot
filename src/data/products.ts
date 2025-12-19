export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'cars' | 'tech' | 'beauty' | 'fashion' | 'home';
  image: string;
  rebuyCount: number;
  notCount: number;
  recentVotes: number; // votes in last hour
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
  },
];

export const getTotalVotes = () => {
  return products.reduce((acc, p) => acc + p.rebuyCount + p.notCount, 0);
};
