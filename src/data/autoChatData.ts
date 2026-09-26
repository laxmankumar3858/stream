export type ProfileGender = 'girl' | 'boy';

export interface AutoChatProfile {
  id: string;
  name: string;
  age: number;
  gender: ProfileGender;
  avatar: string;
  isOnline: boolean;
  firstMessage: string;
}

const GIRL_NAMES = [
  'Aanya', 'Aarohi', 'Aisha', 'Alina', 'Anaya', 'Anika', 'Avni', 'Diya',
  'Esha', 'Ira', 'Ishita', 'Jhanvi', 'Kiara', 'Kriti', 'Mahira', 'Meera',
  'Misha', 'Myra', 'Navya', 'Naina', 'Neha', 'Nisha', 'Pari', 'Pihu',
  'Prisha', 'Rhea', 'Riya', 'Ruhi', 'Saanvi', 'Sara', 'Shanaya', 'Siya',
  'Sneha', 'Tanya', 'Trisha', 'Vanya', 'Zara', 'Sakshi', 'Kavya', 'Muskan',
  'Pooja', 'Priya', 'Divya', 'Shruti', 'Simran', 'Swati', 'Kajal', 'Shreya',
];

const BOY_NAMES = [
  'Aarav', 'Aditya', 'Aman', 'Arjun', 'Aryan', 'Dev', 'Dhruv', 'Harsh',
  'Ishaan', 'Kabir', 'Karan', 'Krish', 'Laksh', 'Manav', 'Mohit', 'Nikhil',
  'Pranav', 'Rahul', 'Raj', 'Rishabh', 'Rohan', 'Sameer', 'Shaurya', 'Siddharth',
  'Varun', 'Veer', 'Vihaan', 'Yash', 'Abhay', 'Rudra', 'Kunal', 'Vikram',
];

const INDIAN_GIRL_AVATARS = [
  'https://i.pinimg.com/736x/7c/71/7a/7c717a818b797e8ab0f65cde1a618f68.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjBYYY1lIMST0Kl1zirhFYx5Elek4nbkX0H2Fi6_oBWuUKp9UX1PhcP871&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6AewTGpykFrF3dyHLF9YNZAyYatF3n2ttHHd1_PU2ftzzkZvVbwYJDgMG&s=10',
  'https://mastdp.in/wp-content/uploads/profile-cute-girl-image.webp',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRh-cmpi90HQZW4D6rfJOBUFp31rdemKNsSqLYDSSSniqYE9SupH3AIF9U&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-NhIAZ3EuyFK7hAmJprvXS5Wjcdx-zOhuOOXYqpCmwBtMERSBsPEUVAX8&s=10',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1610088441520-4352457e7095?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1604537466158-719b1972feb8?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
];

const INDIAN_BOY_AVATARS = [
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80',
];

const buildMessagePool = (
  openers: string[],
  bodies: string[],
  endings: string[],
): string[] => {
  const messages: string[] = [];
  for (const opener of openers) {
    for (const body of bodies) {
      for (const ending of endings) {
        messages.push(`${opener} ${body}${ending}`.replace(/\s+/g, ' ').trim());
        if (messages.length === 500) {
          return messages;
        }
      }
    }
  }
  return messages;
};

export const GIRL_MESSAGES = buildMessagePool(
  ['Hellooo', 'Hii', 'Heyy', 'Achha ji', 'Suno na', 'Waise', 'Ek baat bolu', 'Oye'],
  [
    'kya kar rahe ho', 'kaha se ho', 'hum dost ban sakte hain kya',
    'aaj ka din kaisa tha', 'free ho kya', 'mujhse baat karoge',
    'tumhe music pasand hai', 'kabhi long drive par gaye ho',
    'tum itne chup kyu ho', 'apne baare mein kuch batao',
    'chai pasand hai ya coffee', 'weekend ka kya plan hai',
    'tum online the na', 'kya hua reply kyu nahi de rahe',
    'tumhari smile achhi hogi', 'koi favourite movie hai',
  ],
  [' 😊', '?', ' 😄', ' na', ' ji', ' 🙈'],
);

export const BOY_MESSAGES = buildMessagePool(
  ['Hey cutie', 'Suno jaan', 'Hello ji', 'Oye pretty', 'Baby', 'Madam ji', 'Heyy', 'Suno na'],
  [
    'kya kar rahi ho', 'thodi humse bhi baat kar lo', 'aaj bahut yaad aa rahi ho',
    'aap kaha se ho', 'hum dost ban sakte hain', 'reply kyu nahi de rahi ho',
    'aaj ka plan kya hai', 'tumhari smile bahut cute hai',
    'mujhe tumse baat karni hai', 'kabhi coffee pe chalogi',
    'love you bol du kya', 'mere paas aa kar baitho na',
    'tum online ho kya', 'apne baare mein batao',
    'kya tum music sunti ho', 'aaj free ho kya',
  ],
  [' 😊', '?', ' ❤️', ' na', ' ji', ' 🙈'],
);

const girlFirstMessages = [
  'Hellooo 😊 kya kar rahe ho?',
  'Hii, kya hum dost ban sakte hain?',
  'Heyy, kaha se ho?',
  'Achha ji, online ho aur hello bhi nahi bologe? 😄',
];

const boyFirstMessages = [
  'Hey cutie 😊 kya kar rahi ho?',
  'Hello ji, thodi humse bhi baat kar lo na',
  'Suno, hum dost ban sakte hain kya?',
  'Heyy, aaj ka din kaisa ja raha hai?',
];

export const GIRL_PROFILES: AutoChatProfile[] = Array.from(
  {length: 100},
  (_, index) => ({
    id: `girl-${index + 1}`,
    name: `${GIRL_NAMES[index % GIRL_NAMES.length]}${
      index >= GIRL_NAMES.length ? ` ${String.fromCharCode(65 + (index % 26))}` : ''
    }`,
    age: 18 + ((index * 7) % 20),
    gender: 'girl',
    avatar: INDIAN_GIRL_AVATARS[index % INDIAN_GIRL_AVATARS.length],
    isOnline: index % 4 !== 0,
    firstMessage: girlFirstMessages[index % girlFirstMessages.length],
  }),
);

export const BOY_PROFILES: AutoChatProfile[] = Array.from(
  {length: 30},
  (_, index) => ({
    id: `boy-${index + 1}`,
    name: BOY_NAMES[index % BOY_NAMES.length],
    age: 18 + ((index * 5) % 20),
    gender: 'boy',
    avatar: INDIAN_BOY_AVATARS[index % INDIAN_BOY_AVATARS.length],
    isOnline: index % 3 !== 0,
    firstMessage: boyFirstMessages[index % boyFirstMessages.length],
  }),
);

export const AUTO_CHAT_PROFILES = [...GIRL_PROFILES, ...BOY_PROFILES];

export const INACTIVITY_NUDGES = [
  'Kya huaa? 😊',
  'Reply kyu nahi de rahe?',
  'Busy ho kya?',
  'Hello ji, kaha chale gaye? 😄',
  'Thodi si baat kar lo na',
  'Main wait kar rahi hu 👀',
  'Online ho?',
  'Achha ji, ignore kar rahe ho kya? 🙈',
];

const hashText = (value: string) =>
  [...value].reduce((total, character) => total + character.charCodeAt(0), 0);

export const createContextReply = (
  profile: AutoChatProfile,
  userMessage: string,
): string => {
  const text = userMessage.toLowerCase();
  const options = (() => {
    if (/\b(hi|hii|hello|hey|helo)\b/.test(text)) {
      return ['Hellooo 😊 kaise ho?', 'Hii ji, finally reply aa gaya 😄', 'Heyy, nice to meet you!'];
    }
    if (/kaha|where|city|place/.test(text)) {
      return ['Main Delhi side se hu, tum kaha se ho?', 'India se hu 😊 tum apna city batao', 'Main Mumbai se hu, pehle tum batao kaha se ho?'];
    }
    if (/dost|friend/.test(text)) {
      return ['Haan bilkul, aaj se dost 😊', 'Of course, good friends ban sakte hain', 'Pakka wali friendship? 😄'];
    }
    if (/love|jaan|baby|cute|beautiful|pretty/.test(text)) {
      return ['Awww, itni sweet baatein 🙈', 'Achha ji, bade romantic ho 😄', 'Tum bhi kaafi cute ho ❤️'];
    }
    if (/kya kar|doing|busy/.test(text)) {
      return ['Bas tumse baat kar rahi hu 😊', 'Kuch khaas nahi, tum batao?', 'Thoda free time enjoy kar rahi hu'];
    }
    if (/call|video/.test(text)) {
      return ['Pehle thodi chat karte hain 😊', 'Thoda aur jaan lete hain phir dekhenge', 'Abhi chat hi karte hain na'];
    }
    if (/kaise|how are|haal/.test(text)) {
      return ['Main badhiya hu, tum kaise ho?', 'Bilkul mast 😊 tum sunao', 'Ab tumhara message aa gaya to achhi hu 😄'];
    }
    return profile.gender === 'girl' ? GIRL_MESSAGES : BOY_MESSAGES;
  })();

  return options[hashText(`${profile.id}:${userMessage}:${Date.now() >> 14}`) % options.length];
};
