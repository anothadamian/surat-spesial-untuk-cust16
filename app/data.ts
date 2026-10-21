export const gift = {
  recipient: 'nopal',
  sender: 'putriimut',
  pin: '1234',
  videoId: 'o25_Tn8BnFM',
  music: '/music/anugerah-terindah.mp3',
  photos: [
    { label: 'Momen pertama', caption: 'Satu momen kecil yang ingin disimpan.' },
    { label: 'Tawa bersama', caption: 'Semoga selalu ada alasan untuk tertawa.' },
    { label: 'Hari spesial', caption: 'Hari ini tentang kamu.' },
    { label: 'Kenangan favorit', caption: 'Cerita baik yang terus bertambah.' },
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
