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

export const normalizeChatMessage = (text: string): string => {
  return (text || '')
    .toLowerCase()
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/[.,?!:;'"~`_#@$%^&*()+=\-[\]{}|\\/<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const VARIATION_GROUPS_GIRL: Record<string, string[]> = {
  location: [
    'kaha se ho',
    'tum kaha se ho',
    'aap kaha se ho?',
    'kaha se belong karte ho?',
    'kis city se ho aap?',
    'kaunse shehar se ho?',
    'kaha rehte ho waise?',
    'apna city to batao pehle',
    'tumhara hometown kaha hai?',
    'waise kaha se ho aap?',
    'kaha se ho ji?',
    'Heyy, kaha se ho?',
    'kis shehar se ho aap waise?',
  ],
  friendship: [
    'kya hum dost ban sakte hain?',
    'hum dost ban sakte hain kya?',
    'dosti karoge mujhse?',
    'kya main tumhari friend ban sakti hu?',
    'friends banenge?',
    'aaj se hum dost hain kya?',
    'ek achhe dost ban sakte hain hum?',
    'dost banoge mere?',
    'kya hum ache dost ban sakte hain?',
    'Hii, kya hum dost ban sakte hain?',
    'chalo aaj se dosti pakki?',
  ],
  activity: [
    'kya kar rahe ho?',
    'ab kya kar rahe ho?',
    'kya chal raha hai?',
    'kya kar rahe the abhi?',
    'waise abhi kya chal raha hai?',
    'free ho ya kuch kar rahe the?',
    'aaj kal kya chal raha hai?',
    'kuch khas kar rahe ho kya?',
    'busy ho ya thoda time hai?',
    'Hellooo 😊 kya kar rahe ho?',
    'aaj ka din kaisa chal raha hai?',
  ],
  online: [
    'online the to socha baat kar lu 😊',
    'Achha ji, online ho aur hello bhi nahi bologe? 😄',
    'online dekh ke message kiya',
    'kaafi der se online ho, humse bhi baat kar lo',
    'itna online reh kar kisse baatein ho rahi hain? 🙈',
    'online ho phir bhi itna late reply? 😄',
    'online the to hello bolne aa gayi',
    'Hii, finally aap online mile',
  ],
};

export const VARIATION_GROUPS_BOY: Record<string, string[]> = {
  location: [
    'kaha se ho',
    'tum kaha se ho',
    'aap kaha se ho?',
    'kaha se belong karti ho?',
    'kis city se ho aap?',
    'kaunse shehar se ho?',
    'kaha rehti ho waise?',
    'apna city to batao madam',
    'tumhara hometown kaha hai?',
    'waise kaha se ho aap?',
    'kaha se ho ji?',
  ],
  friendship: [
    'hum dost ban sakte hain kya?',
    'kya hum dost ban sakte hain?',
    'dosti karogi mujhse?',
    'kya main aapka friend ban sakta hu?',
    'friends banogi meri?',
    'aaj se dosti shuru karein?',
    'ek achhe dost ban sakte hain hum?',
    'dost banogi meri?',
    'Suno, hum dost ban sakte hain kya?',
  ],
  activity: [
    'kya kar rahi ho?',
    'ab kya kar rahi ho?',
    'kya chal raha hai madam?',
    'kya kar rahi thi abhi?',
    'waise abhi kya chal raha hai?',
    'free ho ya busy ho?',
    'aaj kal kya chal raha hai?',
    'kuch khas kar rahi ho kya?',
    'Hey cutie 😊 kya kar rahi ho?',
  ],
  compliments: [
    'Tumhari smile sach me bahut pyari hai',
    'Hello ji, thodi humse bhi baat kar lo na',
    'Heyy, aaj ka din kaisa ja raha hai?',
    'Suno jaan, itni khamosh kyu ho?',
    'Hello ji, ek coffee date ho jaye?',
    'Hey, profile dekhi aapki, ignore nahi kar paya',
    'Achha ji, reply karne ka kya charge logi? 😄',
    'Suno, itna cute hona allowed hai kya?',
    'Madam ji, thoda sa waqt milega hume?',
  ],
};

export const girlFirstMessages: string[] = [
  'kaha se ho',
  'Hellooo 😊 kya kar rahe ho?',
  'Hii, kya hum dost ban sakte hain?',
  'Achha ji, online ho aur hello bhi nahi bologe? 😄',
  'Heyy, tum kaha se ho?',
  'dosti karoge mujhse?',
  'aap kaha se ho?',
  'kya chal raha hai?',
  'Hello ji, kaisa raha aaj ka din?',
  'Suno na, free ho kya?',
  'kaha se belong karte ho?',
  'Ek baat puchhu aapse?',
  'Hii there, pehchana mujhe?',
  'kis city se ho aap?',
  'Heyy, kaafi der se online dekh rahi thi',
  'Suno ji, free ho to thodi baat karein?',
  'kaunse shehar se ho?',
  'Hii! Boring day me thodi chat kar lete hain?',
  'Hello! Kuch interesting batao apne baare me',
  'kaha rehte ho waise?',
  'Waise aap kaafi sweet lagte ho 😊',
  'Heyy, aaj ka mood kaisa hai?',
  'apna city to batao pehle',
  'Suno, bore ho rahi thi to aapko text kiya',
  'Hii ji! Ek pyari si smile to banti hai 😄',
  'tumhara hometown kaha hai?',
  'Aapki profile dekhi, kaafi achhi lagi',
  'Hello, kisse itni baatein ho rahi hain? 🙈',
  'waise kaha se ho aap?',
  'Heyy, kya hum baat kar sakte hain?',
  'Hii! Chai pi li ya coffee chal rahi hai?',
  'kaha se ho ji?',
  'Suno na, ek cute sa reply to de do',
  'Hello ji, online ho to hazir ho jao 😄',
  'hum dost ban sakte hain kya?',
  'Hey, silent mode me kyu ho?',
  'Hii, tumhare baare me kuch jaan sakti hu?',
  'kya main tumhari friend ban sakti hu?',
  'Hello dost, din kaisa ja raha hai?',
  'Achha suno, free ho abhi?',
  'friends banenge?',
  'Heyy! Achanak tumhari profile dikhi to message kiya',
  'Hii, mood kaisa hai aaj?',
  'aaj se hum dost hain kya?',
  'Suno, thoda sa time milega mujhse baat karne ka?',
  'Hello! Ek sawal ka sach-sach jawab doge?',
  'ek achhe dost ban sakte hain hum?',
  'Heyy, muskurana mat bhoolna aaj 😊',
  'Hii ji, aapse baat karke achha lagega',
  'dost banoge mere?',
  'Suno na, itne chup kyu rehte ho?',
  'Hellooo, notification check kiya ya ignore kar rahe ho? 🙈',
  'ab kya kar rahe ho?',
  'Hey! Kuch funny share karu kya?',
  'Hii, weekend ka kya plan hai waise?',
  'kya kar rahe the abhi?',
  'Suno ji, aapse dosti karke kaisa lagega?',
  'Hello handsome, kya chal raha hai? 😄',
  'waise abhi kya chal raha hai?',
  'Heyy, mujhe thoda bore lag raha tha',
  'Hii, ek mast si baat batao',
  'free ho ya kuch kar rahe the?',
  'Suno na, dinner ho gaya kya?',
  'Hello ji, aapse dosti ki request bhej sakti hu?',
  'aaj kal kya chal raha hai?',
  'Heyy! Online dekh kar text karne ka man kiya',
  'Hii there, aaj ki kya taaza khabar hai?',
  'kuch khas kar rahe ho kya?',
  'Suno, itna serious kyu rehte ho? Smile karo 😊',
  'Hello! Kuch achha sa gaana suggest karo na',
  'busy ho ya thoda time hai?',
  'Heyy, aapse connect karke achha laga',
  'Hii ji, abhi free ho baat karne ke liye?',
  'aaj ka din kaisa chal raha hai?',
  'Suno na, ek secret batao apna',
  'Hello! Thoda waqt bacha hai to chat kar lein?',
  'online the to socha baat kar lu 😊',
  'Hii, aapki profile bahut genuine lagi',
  'Heyy, itna busy rehna achhi baat nahi 😄',
  'online dekh ke message kiya',
  'Suno ji, kya main aapse kuch puch sakti hu?',
  'Hellooo, itni der se kiska wait kar rahe ho?',
  'kaafi der se online ho, humse bhi baat kar lo',
  'Hii, thodi gupshup karein?',
  'Heyy! Aaj ka din thoda special lag raha hai',
  'itna online reh kar kisse baatein ho rahi hain? 🙈',
  'Suno na, kya tum friendly ho?',
  'Hello ji, ek pyara sa hello to bol hi sakte ho',
  'online ho phir bhi itna late reply? 😄',
  'Hii, lagta hai aap kaafi funny ho 😄',
  'Heyy, socha aaj aapse thodi baat shuru karu',
  'online the to hello bolne aa gayi',
  'Suno ji, kahan busy rehte ho din bhar?',
  'Hellooo! Ek achha sa joke sunao na',
  'Hii, finally aap online mile',
  'Hii, aapse baat karne ka mera kafi time se man tha',
  'Heyy, kya aap late night chat pasand karte ho?',
  'Suno na, offline mat hona abhi',
  'Hello ji, ek friendly text aapke liye 😊',
  'Hii! Ummeed hai aapka din achha guzar raha hoga',
];

export const boyFirstMessages: string[] = [
  'kaha se ho',
  'Hey cutie 😊 kya kar rahi ho?',
  'tum kaha se ho',
  'Hello ji, thodi humse bhi baat kar lo na',
  'aap kaha se ho?',
  'Suno, hum dost ban sakte hain kya?',
  'kaha se belong karti ho?',
  'Heyy, aaj ka din kaisa ja raha hai?',
  'kis city se ho aap?',
  'Tumhari smile sach me bahut pyari hai',
  'kaunse shehar se ho?',
  'Suno jaan, itni khamosh kyu ho?',
  'kaha rehti ho waise?',
  'Hello ji, ek coffee date ho jaye?',
  'apna city to batao madam',
  'Hey, profile dekhi aapki, ignore nahi kar paya',
  'tumhara hometown kaha hai?',
  'Achha ji, reply karne ka kya charge logi? 😄',
  'waise kaha se ho aap?',
  'Suno, itna cute hona allowed hai kya?',
  'kaha se ho ji?',
  'Madam ji, thoda sa waqt milega hume?',
  'dosti karogi mujhse?',
  'kya chal raha hai madam?',
  'kya main aapka friend ban sakta hu?',
  'free ho ya busy ho?',
  'friends banogi meri?',
  'kuch khas kar rahi ho kya?',
  'aaj se dosti shuru karein?',
  'ab kya kar rahi ho?',
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
  'Chup kyu ho gaye?',
  'Kuch bolte kyu nahi?',
  'Itna time kyu le rahe ho?',
  'Ek chhota sa reply to de do na 😊',
];

export const findVariationForMessage = (
  originalMsg: string,
  gender: ProfileGender,
  usedNormalizedSet: Set<string>,
): string => {
  const normOriginal = normalizeChatMessage(originalMsg);
  const groups = gender === 'boy' ? VARIATION_GROUPS_BOY : VARIATION_GROUPS_GIRL;

  // 1. Try finding which variation group this message belongs to
  let matchedGroupKey: string | null = null;
  for (const [key, variants] of Object.entries(groups)) {
    if (variants.some(v => normalizeChatMessage(v) === normOriginal)) {
      matchedGroupKey = key;
      break;
    }
  }

  // If no direct group match, check keyword matches
  if (!matchedGroupKey) {
    if (/kaha|city|shehar|rehte|rehti|hometown/.test(normOriginal)) {
      matchedGroupKey = 'location';
    } else if (/dost|friend/.test(normOriginal)) {
      matchedGroupKey = 'friendship';
    } else if (/kya kar|chal raha|busy|free/.test(normOriginal)) {
      matchedGroupKey = 'activity';
    } else if (/online|hello|hii|heyy/.test(normOriginal)) {
      matchedGroupKey = 'online';
    }
  }

  // 2. Try unused variants from the matched group first (e.g. 'tum kaha se ho' for 'kaha se ho')
  if (matchedGroupKey && groups[matchedGroupKey]) {
    for (const variant of groups[matchedGroupKey]) {
      if (!usedNormalizedSet.has(normalizeChatMessage(variant))) {
        return variant;
      }
    }
  }

  // 3. Try unused variants from any group
  for (const variants of Object.values(groups)) {
    for (const variant of variants) {
      if (!usedNormalizedSet.has(normalizeChatMessage(variant))) {
        return variant;
      }
    }
  }

  // 4. Try master list for that gender
  const masterList = gender === 'boy' ? boyFirstMessages : girlFirstMessages;
  for (const candidate of masterList) {
    if (!usedNormalizedSet.has(normalizeChatMessage(candidate))) {
      return candidate;
    }
  }

  // 5. Dynamic variation prefix fallback to guarantee 100% uniqueness
  const prefixes = [
    'Waise, ',
    'Suno, ',
    'Acha ek baat, ',
    'Sach me, ',
    'Sach bolu to, ',
    'Waise ek sawal, ',
  ];
  for (const prefix of prefixes) {
    const candidate = `${prefix}${originalMsg.replace(/^[A-Z][a-z]+,\s*/, '')}`;
    if (!usedNormalizedSet.has(normalizeChatMessage(candidate))) {
      return candidate;
    }
  }

  return `${originalMsg} 😊`;
};

export const getUniqueOpenerForProfile = (
  profile: AutoChatProfile,
  usedMessages: string[],
): string => {
  const usedNormalizedSet = new Set(
    usedMessages.map(m => normalizeChatMessage(m)).filter(Boolean),
  );

  const profileFirst = profile.firstMessage || 'Hellooo 😊';
  const normFirst = normalizeChatMessage(profileFirst);

  if (!usedNormalizedSet.has(normFirst)) {
    return profileFirst;
  }

  return findVariationForMessage(profileFirst, profile.gender, usedNormalizedSet);
};

export const getUniqueInactivityNudge = (usedMessages: string[]): string => {
  const usedNormalizedSet = new Set(
    usedMessages.map(m => normalizeChatMessage(m)).filter(Boolean),
  );

  const unused = INACTIVITY_NUDGES.filter(
    n => !usedNormalizedSet.has(normalizeChatMessage(n)),
  );

  if (unused.length > 0) {
    return unused[Math.floor(Math.random() * unused.length)];
  }

  const base = INACTIVITY_NUDGES[Math.floor(Math.random() * INACTIVITY_NUDGES.length)];
  return `Suno na, ${base.toLowerCase()}`;
};

const hashText = (value: string) =>
  [...value].reduce((total, character) => total + character.charCodeAt(0), 0);

export const createContextReply = (
  profile: AutoChatProfile,
  userMessage: string,
  usedMessages: string[] = [],
): string => {
  const text = userMessage.toLowerCase();
  const options = (() => {
    if (/\b(hi|hii|hello|hey|helo)\b/.test(text)) {
      return [
        'Hellooo 😊 kaise ho?',
        'Hii ji, finally reply aa gaya 😄',
        'Heyy, nice to meet you!',
        'Hello! Kaisa raha aaj ka din?',
      ];
    }
    if (/kaha|where|city|place/.test(text)) {
      return [
        'Main Delhi side se hu, tum kaha se ho?',
        'India se hu 😊 tum apna city batao',
        'Main Mumbai se hu, pehle tum batao kaha se ho?',
        'Main Bangalore se hu, aap batao?',
      ];
    }
    if (/dost|friend/.test(text)) {
      return [
        'Haan bilkul, aaj se dost 😊',
        'Of course, good friends ban sakte hain',
        'Pakka wali friendship? 😄',
        'Bilkul, achhe dost banenge hum',
      ];
    }
    if (/love|jaan|baby|cute|beautiful|pretty/.test(text)) {
      return [
        'Awww, itni sweet baatein 🙈',
        'Achha ji, bade romantic ho 😄',
        'Tum bhi kaafi cute ho ❤️',
        'Itna compliment doge to sharma jaungi 😊',
      ];
    }
    if (/kya kar|doing|busy/.test(text)) {
      return [
        'Bas tumse baat kar rahi hu 😊',
        'Kuch khaas nahi, tum batao?',
        'Thoda free time enjoy kar rahi hu',
        'Bas phone chala rahi thi',
      ];
    }
    if (/call|video/.test(text)) {
      return [
        'Pehle thodi chat karte hain 😊',
        'Thoda aur jaan lete hain phir dekhenge',
        'Abhi chat hi karte hain na',
        'Pehle achhe se jaan lein ek dusre ko',
      ];
    }
    if (/kaise|how are|haal/.test(text)) {
      return [
        'Main badhiya hu, tum kaise ho?',
        'Bilkul mast 😊 tum sunao',
        'Ab tumhara message aa gaya to achhi hu 😄',
        'Sab theek thak, aap sunao?',
      ];
    }
    return profile.gender === 'girl' ? GIRL_MESSAGES : BOY_MESSAGES;
  })();

  const usedNormalizedSet = new Set(
    usedMessages.map(m => normalizeChatMessage(m)).filter(Boolean),
  );

  const unusedOptions = options.filter(
    opt => !usedNormalizedSet.has(normalizeChatMessage(opt)),
  );

  const pool = unusedOptions.length > 0 ? unusedOptions : options;
  return pool[hashText(`${profile.id}:${userMessage}:${Date.now() >> 14}`) % pool.length];
};
