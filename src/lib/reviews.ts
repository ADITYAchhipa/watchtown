import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { WhatsAppReview } from '@/types';
import { getMongoCollection, isMongoConfigured } from './mongodb';

const DB_DIR = path.join(process.cwd(), 'data');
const REVIEWS_FILE = path.join(DB_DIR, 'reviews.json');

export const SEED_REVIEWS: WhatsAppReview[] = [
  {
    id: 1,
    phone: '+91 94*** 79360',
    avatarColor: '#5c2d91',
    avatarInitial: 'R',
    dateStr: '24 October 2025',
    watchModel: 'Audemars Piguet Royal Oak Skeleton',
    watchImage: 'https://watchtown.in/wp-content/uploads/2025/04/luxury-watches.png',
    userMessages: ['I want it ... Delivery timing ??'],
    adminMessages: ['First let this AP get delivered 👍', '4-5 days'],
    replyMessage: 'Received 🔥 Watch is insane bro! Skeleton movement is working smoothly & weight is heavy!',
    time: '12:45 pm',
    reaction: '❤️',
  },
  {
    id: 2,
    phone: '+91 78*** 21451',
    avatarColor: '#0078d4',
    avatarInitial: 'M',
    dateStr: '28 October 2025',
    watchModel: 'Rolex Daytona Cosmograph Chrono',
    watchImage: 'https://watchtown.in/wp-content/uploads/2025/04/rolex-luxury-watch.png',
    userMessages: ['Can you please send dispatch details?'],
    adminMessages: ['Shared tracking via SMS. Please drop review with photo!'],
    replyMessage: 'Absolutely love this watch! The design is sleek, the build feels premium, and it looks even better in person. 100% worth the buy!',
    time: '2:15 pm',
    reaction: '❤️',
  },
  {
    id: 3,
    phone: '+91 97*** 44314',
    avatarColor: '#0f7b0f',
    avatarInitial: 'S',
    dateStr: '2 November 2025',
    watchModel: 'Rolex Datejust 41 Mint Green Box Set',
    watchImage: 'https://watchtown.in/wp-content/uploads/2025/04/rolex-brand-watches.png',
    userMessages: ['Parcel delivered today morning.'],
    adminMessages: ['Can you please drop a review with received product picture? Appreciate your efforts ❤️'],
    replyMessage: 'Bhot vdiaa quality hai 👌 We are satisfy. Green dial color exact original matching!',
    time: '7:37 pm',
    reaction: '❤️',
  },
  {
    id: 4,
    phone: '+91 70*** 18919',
    avatarColor: '#b4009e',
    avatarInitial: 'A',
    dateStr: '15 November 2025',
    watchModel: 'Patek Philippe Nautilus Blue 5711',
    watchImage: 'https://watchtown.in/wp-content/uploads/2025/04/luxury-watches.png',
    userMessages: ['Send tracking link please.'],
    adminMessages: ['Delivered via BlueDart. Enjoy your new timepiece!'],
    replyMessage: 'Hey i recieved the parcel totally happy and satisfied thank you so much ❤️ Glass & finish 10/10!',
    time: '6:07 pm',
    reaction: '❤️',
  },
  {
    id: 5,
    phone: '+91 98*** 55102',
    avatarColor: '#d83b01',
    avatarInitial: 'V',
    dateStr: '20 November 2025',
    watchModel: 'Rolex Submariner Hulk Ceramic Bezel',
    watchImage: 'https://watchtown.in/wp-content/uploads/2025/04/rolex-brand-watches.png',
    userMessages: ['Bhai order deliver ho gaya.'],
    adminMessages: ['Awesome! How is the ceramic bezel and winding movement?'],
    replyMessage: 'Quality is top notch! Weight bilkul original jaisa heavy hai. Ceramic bezel shine is brilliant! Thanks for fast dispatch ❤️',
    time: '3:40 pm',
    reaction: '🔥',
  },
  {
    id: 6,
    phone: '+91 88*** 92430',
    avatarColor: '#008272',
    avatarInitial: 'K',
    dateStr: '29 November 2025',
    watchModel: 'Cartier Santos Two-Tone Rose Gold',
    watchImage: 'https://watchtown.in/wp-content/uploads/2025/04/luxury-women-watch.png',
    userMessages: ['Received the luxury box set today.'],
    adminMessages: ['Hope your fiancé loved the anniversary gift!'],
    replyMessage: 'Gifted this to my fiancé, she was surprised by the finishing and sapphire glass. Beautiful packaging! Will definitely buy again.',
    time: '8:20 pm',
    reaction: '❤️',
  },
  {
    id: 7,
    phone: '+91 91*** 63219',
    avatarColor: '#107c41',
    avatarInitial: 'D',
    dateStr: '5 December 2025',
    watchModel: 'Hublot Classic Fusion Titanium 42mm',
    watchImage: 'https://watchtown.in/wp-content/uploads/2025/04/automatic-luxury-watch.png',
    userMessages: ['Got it safely in Mumbai.'],
    adminMessages: ['Thank you! Let us know if you need any adjustments.'],
    replyMessage: 'Received via COD in Mumbai in 48 hours. Rubber strap quality and case polish is 10/10. Genuine seller 👏',
    time: '1:15 pm',
    reaction: '👍',
  },
  {
    id: 8,
    phone: '+91 99*** 11845',
    avatarColor: '#c239b3',
    avatarInitial: 'T',
    dateStr: '12 December 2025',
    watchModel: 'Tissot PRX Powermatic 80 Ice Blue',
    watchImage: 'https://watchtown.in/wp-content/uploads/2025/04/quartz-luxury-watches.png',
    userMessages: ['Checked the automatic rotor movement.'],
    adminMessages: ['Glad to hear! Keep enjoying the timepiece!'],
    replyMessage: 'Waffle dial texture is crisp and automatic rotor sweep is super smooth. Best price in India for 7AAA master quality.',
    time: '4:50 pm',
    reaction: '❤️',
  },
  {
    id: 9,
    phone: '+91 95*** 88372',
    avatarColor: '#004e8c',
    avatarInitial: 'H',
    dateStr: '18 December 2025',
    watchModel: 'Tag Heuer Aquaracer Chrono White Dial',
    watchImage: 'https://watchtown.in/wp-content/uploads/2025/11/Coach-Delancey-Rose-Gold-Black-Dial-36mm-1-600x600.jpg',
    userMessages: ['Package delivered with security tape intact.'],
    adminMessages: ['Tested every chronograph function before dispatch!'],
    replyMessage: 'Chronograph buttons and sub-dials are working perfectly. Security sealed box was delivered safely by BlueDart.',
    time: '5:30 pm',
    reaction: '🔥',
  },
  {
    id: 10,
    phone: '+91 80*** 76214',
    avatarColor: '#8e562e',
    avatarInitial: 'P',
    dateStr: '24 December 2025',
    watchModel: 'Omega Speedmaster Professional Moonwatch',
    watchImage: 'https://watchtown.in/wp-content/uploads/2025/04/luxury-watches-brands.png',
    userMessages: ['This is my 2nd purchase from you guys.'],
    adminMessages: ['Thank you for being a regular collector with WatchTown!'],
    replyMessage: 'Second order from WatchTown! Trusted store for first copy watches. Live video dispatch proof gives 100% confidence. Keep up the good work!',
    time: '9:10 pm',
    reaction: '❤️',
  },
];

function ensureDbDirectory() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

let localCache: WhatsAppReview[] | null = null;
let lastCacheMtime = 0;

function readReviewsFromFile(): WhatsAppReview[] {
  ensureDbDirectory();
  if (!fs.existsSync(REVIEWS_FILE)) {
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(SEED_REVIEWS, null, 2), 'utf8');
    localCache = [...SEED_REVIEWS];
    try {
      lastCacheMtime = fs.statSync(REVIEWS_FILE).mtimeMs;
    } catch {
      lastCacheMtime = Date.now();
    }
    return localCache;
  }

  try {
    const stat = fs.statSync(REVIEWS_FILE);
    if (localCache && localCache.length > 0 && stat.mtimeMs === lastCacheMtime) {
      return localCache;
    }

    const raw = fs.readFileSync(REVIEWS_FILE, 'utf8');
    const parsed = JSON.parse(raw) as WhatsAppReview[];
    if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
      fs.writeFileSync(REVIEWS_FILE, JSON.stringify(SEED_REVIEWS, null, 2), 'utf8');
      localCache = [...SEED_REVIEWS];
      lastCacheMtime = fs.statSync(REVIEWS_FILE).mtimeMs;
      return localCache;
    }
    localCache = parsed;
    lastCacheMtime = stat.mtimeMs;
    return localCache;
  } catch (err) {
    console.error('Failed to read reviews DB:', err);
    if (localCache && localCache.length > 0) return localCache;
    localCache = [...SEED_REVIEWS];
    return localCache;
  }
}

function writeReviewsToFile(reviews: WhatsAppReview[]): void {
  ensureDbDirectory();
  const tmpFile = `${REVIEWS_FILE}.tmp.${process.pid}.${crypto.randomBytes(6).toString('hex')}`;
  try {
    fs.writeFileSync(tmpFile, JSON.stringify(reviews, null, 2), 'utf8');
    fs.renameSync(tmpFile, REVIEWS_FILE);
    localCache = reviews;
    try {
      lastCacheMtime = fs.statSync(REVIEWS_FILE).mtimeMs;
    } catch {
      lastCacheMtime = Date.now();
    }
  } catch (err) {
    try { fs.unlinkSync(tmpFile); } catch { }
    throw err;
  }
}

async function getReviewsCollection() {
  const collection = await getMongoCollection<WhatsAppReview>('reviews');
  if (!collection) return null;
  return collection;
}

const LUXURY_AVATAR_COLORS = [
  '#5c2d91', '#0078d4', '#0f7b0f', '#b4009e', '#d83b01',
  '#008272', '#107c41', '#c239b3', '#004e8c', '#8e562e',
];

export async function getReviews(): Promise<WhatsAppReview[]> {
  try {
    if (isMongoConfigured()) {
      const col = await getReviewsCollection();
      if (col) {
        const docs = await col.find({}).toArray();
        if (docs.length > 0) {
          return docs.map(d => ({
            id: d.id,
            phone: d.phone,
            avatarColor: d.avatarColor,
            avatarInitial: d.avatarInitial,
            dateStr: d.dateStr,
            watchModel: d.watchModel,
            watchImage: d.watchImage,
            userMessages: d.userMessages || [],
            adminMessages: d.adminMessages || [],
            replyMessage: d.replyMessage,
            time: d.time,
            reaction: d.reaction,
          }));
        }
      }
    }
  } catch (err) {
    console.error('MongoDB getReviews error, falling back to local file:', err);
  }

  return readReviewsFromFile();
}

export async function addReview(data: Partial<WhatsAppReview>): Promise<WhatsAppReview> {
  const currentReviews = await getReviews();
  const nextId = Date.now();
  const randomColor = LUXURY_AVATAR_COLORS[Math.floor(Math.random() * LUXURY_AVATAR_COLORS.length)];
  const randomInitial = data.watchModel ? data.watchModel.trim()[0].toUpperCase() : 'W';
  
  const today = new Date();
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const formattedDate = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
  
  const randomPrefix = ['98', '97', '99', '94', '70', '88', '91', '78'][Math.floor(Math.random() * 8)];
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);

  const newReview: WhatsAppReview = {
    id: nextId,
    phone: data.phone || `+91 ${randomPrefix}*** ${randomSuffix}`,
    avatarColor: data.avatarColor || randomColor,
    avatarInitial: data.avatarInitial || randomInitial,
    dateStr: data.dateStr || formattedDate,
    watchModel: data.watchModel || 'Luxury Timepiece Master Collection',
    watchImage: data.watchImage || '',
    userMessages: data.userMessages && data.userMessages.length > 0
      ? data.userMessages
      : ['Parcel delivered today morning.'],
    adminMessages: data.adminMessages && data.adminMessages.length > 0
      ? data.adminMessages
      : ['Delivered via BlueDart. Enjoy your new timepiece! ❤️'],
    replyMessage: data.replyMessage || 'Received parcel! Quality is awesome, packaging was 100% secure. Really impressed with the weight & finish!',
    time: data.time || '1:45 pm',
    reaction: data.reaction || '❤️',
  };

  // Prepend to show as the very first card in the slider
  const updated = [newReview, ...currentReviews];

  try {
    if (isMongoConfigured()) {
      const col = await getReviewsCollection();
      if (col) {
        await col.insertOne(newReview as any);
      }
    }
  } catch (err) {
    console.error('MongoDB addReview error:', err);
  }

  writeReviewsToFile(updated);
  return newReview;
}

export async function deleteReview(id: number): Promise<boolean> {
  const currentReviews = await getReviews();
  const updated = currentReviews.filter((r) => r.id !== id);

  try {
    if (isMongoConfigured()) {
      const col = await getReviewsCollection();
      if (col) {
        await col.deleteOne({ id } as any);
      }
    }
  } catch (err) {
    console.error('MongoDB deleteReview error:', err);
  }

  writeReviewsToFile(updated);
  return true;
}

export async function updateReviews(reviews: WhatsAppReview[]): Promise<WhatsAppReview[]> {
  try {
    if (isMongoConfigured()) {
      const col = await getReviewsCollection();
      if (col) {
        await col.deleteMany({});
        if (reviews.length > 0) {
          await col.insertMany(reviews as any);
        }
      }
    }
  } catch (err) {
    console.error('MongoDB updateReviews error:', err);
  }

  writeReviewsToFile(reviews);
  return reviews;
}
