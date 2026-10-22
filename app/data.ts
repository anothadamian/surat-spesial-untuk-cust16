export const gift = {
  recipient: 'nopal',
  sender: 'putriimut',
  pin: '0311',
  videoId: 'o25_Tn8BnFM',
  music: '/music/anugerah-terindah.mp3',
  photos: [
    { label: 'Pertama ketemu', src: '/img/nopal-chat-01.jpeg' },
    { label: 'momen nopal bilang temen', src: '/img/nopal-chat-02.jpeg' },
    { label: 'Menunggu princess', src: '/img/nopal-chat-03.jpeg' },
    { label: 'Momen babu nyariin princess', src: '/img/nopal-chat-04.jpeg' },
  ],
} as const;

export const flowers = ['🌼', '🌷', '🌸', '💐', '🌻', '🪻'];
export const picnicItems = [
  { label: 'Jus', icon: '🧃', category: 'Minuman' },
  { label: 'Sandwich', icon: '🥪', category: 'Makanan' },
  { label: 'Berry', icon: '🍓', category: 'Buah' },
  { label: 'Bunga', icon: '🌼', category: 'Dekorasi' },
] as const;

export const picnicCategories = ['Minuman', 'Makanan', 'Buah', 'Dekorasi'] as const;
