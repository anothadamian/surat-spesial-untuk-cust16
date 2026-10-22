'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { flowers, gift, picnicCategories, picnicItems } from './data';

type Scene = 'intro' | 'gift' | 'flowers' | 'envelope' | 'memories' | 'candle' | 'wish' | 'portrait' | 'picnic' | 'catch-again' | 'delivery' | 'word-search' | 'complete';
type YTPlayer = { destroy: () => void };
type YTState = { Player: new (id: string, options: { events: { onStateChange: (event: { data: number }) => void } }) => YTPlayer };
declare global { interface Window { YT?: YTState; onYouTubeIframeAPIReady?: () => void } }

const spider = '/img/laba-laba-imut.png';
const giftConfetti = Array.from({ length: 30 }, (_, index) => ({
  x: `${((index * 37) % 120) - 10}%`,
  delay: `${(index % 8) * 0.045}s`,
  duration: `${1.4 + (index % 5) * 0.16}s`,
  rotation: `${(index * 43) % 360}deg`,
  hue: `${(index * 41) % 360}`,
}));
const introMotifs = [
  { icon: '✦', left: '8%', top: '18%' }, { icon: '♡', left: '23%', top: '34%' },
  { icon: '✿', left: '41%', top: '13%' }, { icon: '✦', left: '58%', top: '26%' },
  { icon: '♡', left: '77%', top: '15%' }, { icon: '✿', left: '91%', top: '37%' },
  { icon: '♡', left: '12%', top: '59%' }, { icon: '✦', left: '32%', top: '73%' },
  { icon: '✿', left: '49%', top: '54%' }, { icon: '♡', left: '68%', top: '68%' },
  { icon: '✦', left: '86%', top: '78%' }, { icon: '✿', left: '5%', top: '85%' },
  { icon: '♡', left: '37%', top: '91%' }, { icon: '✦', left: '62%', top: '90%' },
  { icon: '✿', left: '96%', top: '61%' }, { icon: '♡', left: '52%', top: '42%' },
];
const transitionSpiders = Array.from({ length: 36 }, (_, index) => {
  const column = index % 6;
  const row = Math.floor(index / 6);
  const distanceFromCenter = Math.hypot(column - 2.5, row - 2.5);
  return {
    id: index,
    x: `${(column - 2.5) * 19}vw`,
    y: `${(row - 2.5) * 19}vh`,
    rotation: `${(index * 71) % 360 - 180}deg`,
    scale: `${0.84 + ((index * 17) % 40) / 100}`,
    delay: `${Math.min(0.13, distanceFromCenter * 0.018)}s`,
  };
});
const sceneOrder: Scene[] = ['intro', 'gift', 'flowers', 'envelope', 'memories', 'candle', 'wish', 'portrait', 'picnic', 'catch-again', 'delivery', 'word-search', 'complete'];

export default function Home() {
  const [scene, setScene] = useState<Scene>('intro');
  const [siteLoading, setSiteLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingLeaving, setLoadingLeaving] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [wishGiftOpen, setWishGiftOpen] = useState(false);
  const [wishGiftRevealed, setWishGiftRevealed] = useState(false);
  const [envelopeOpening, setEnvelopeOpening] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [caught, setCaught] = useState<number[]>([]);
  const [candleProgress, setCandleProgress] = useState(0);
  const [wishDone, setWishDone] = useState(false);
  const [wishMessageVisible, setWishMessageVisible] = useState(false);
  const [picnicCount, setPicnicCount] = useState(0);
  const [picnicPlaced, setPicnicPlaced] = useState<number[]>([]);
  const picnicPlacedRef = useRef<number[]>([]);
  const [selectedPicnic, setSelectedPicnic] = useState<number | null>(null);
  const [picnicError, setPicnicError] = useState(false);
  const [transition, setTransition] = useState(false);
  const [activePhoto, setActivePhoto] = useState<{ src: string; alt: string; label: string } | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lightboxCloseRef = useRef<HTMLButtonElement>(null);
  const candleTimer = useRef<number | null>(null);
  const candleProgressValue = useRef(0);
  const wishMessageTimer = useRef<number | null>(null);
  const wishGiftTimer = useRef<number | null>(null);
  const youtubeRef = useRef<YTPlayer | null>(null);
  const interactionAudioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    let progress = 0;
    let finishTimer: number | undefined;
    const interval = window.setInterval(() => {
      progress = Math.min(100, progress + Math.floor(Math.random() * 6) + 6);
      setLoadingProgress(progress);
      if (progress >= 100) {
        window.clearInterval(interval);
        finishTimer = window.setTimeout(() => {
          setLoadingLeaving(true);
          finishTimer = window.setTimeout(() => setSiteLoading(false), 500);
        }, 250);
      }
    }, 90);
    return () => {
      window.clearInterval(interval);
      if (finishTimer !== undefined) window.clearTimeout(finishTimer);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = siteLoading ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [siteLoading]);

  useEffect(() => {
    if (!activePhoto) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActivePhoto(null);
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);
    lightboxCloseRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
      previousFocus?.focus();
    };
  }, [activePhoto]);

  const go = useCallback((next: Scene) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setScene(next);
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    setTransition(true);
    window.setTimeout(() => { setScene(next); window.scrollTo({ top: 0, behavior: 'auto' }); }, 620);
    window.setTimeout(() => setTransition(false), 1450);
  }, []);

  const startMusic = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try { await audio.play(); setMusicOn(true); } catch { setMusicOn(false); }
  }, []);

  useEffect(() => {
    if (scene !== 'memories') return;
    const mount = () => {
      if (!window.YT?.Player || youtubeRef.current) return;
      youtubeRef.current = new window.YT.Player('nopalpante-youtube', {
        events: { onStateChange: (event) => {
          if (event.data === 1) { audioRef.current?.pause(); setMusicOn(false); setVideoPlaying(true); }
          if (event.data === 0 || event.data === 2) setVideoPlaying(false);
        } },
      });
    };
    if (window.YT?.Player) mount();
    else {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { previous?.(); mount(); };
      if (!document.querySelector('script[data-youtube-api]')) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.dataset.youtubeApi = 'true';
        document.head.appendChild(script);
      }
    }
    return () => { youtubeRef.current?.destroy(); youtubeRef.current = null; };
  }, [scene]);

  useEffect(() => () => {
    if (candleTimer.current) window.clearInterval(candleTimer.current);
    if (wishMessageTimer.current) window.clearTimeout(wishMessageTimer.current);
    if (wishGiftTimer.current) window.clearTimeout(wishGiftTimer.current);
    void interactionAudioRef.current?.close();
  }, []);

  const unlock = () => {
    if (pin !== gift.pin) { setPinError(true); return; }
    setPinError(false); go('gift');
  };

  const openEnvelope = () => {
    if (envelopeOpening) return;
    setEnvelopeOpening(true);
    void startMusic();
    window.setTimeout(() => go('memories'), 760);
  };

  const getInteractionAudio = () => {
    try {
      const AudioContextClass = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return null;
      const context = interactionAudioRef.current ?? new AudioContextClass();
      interactionAudioRef.current = context;
      if (context.state === 'suspended') void context.resume();
      return context;
    } catch { return null; }
  };

  const playInteractionChime = () => {
    const context = getInteractionAudio();
    if (!context) return;
    [659.25, 783.99, 1046.5].forEach((frequency, index) => {
      const now = context.currentTime + index * 0.07;
      const oscillator = context.createOscillator();
      const volume = context.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.value = frequency;
      volume.gain.setValueAtTime(0.0001, now);
      volume.gain.exponentialRampToValueAtTime(0.045, now + 0.012);
      volume.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      oscillator.connect(volume);
      volume.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.28);
    });
  };

  const openFirstGift = () => {
    if (giftOpen) return;
    playInteractionChime();
    setGiftOpen(true);
  };

  const openWishGift = () => {
    if (wishGiftOpen) return;
    playInteractionChime();
    setWishGiftOpen(true);
    wishGiftTimer.current = window.setTimeout(() => setWishGiftRevealed(true), 2050);
  };
  const beginCatch = (next: 'flowers' | 'catch-again') => { setCaught([]); go(next); };

  const placePicnicItem = (category: string) => {
    if (selectedPicnic === null) return;
    if (picnicPlacedRef.current.includes(selectedPicnic)) { setSelectedPicnic(null); return; }
    if (picnicItems[selectedPicnic].category === category) {
      const nextPlaced = [...picnicPlacedRef.current, selectedPicnic];
      picnicPlacedRef.current = nextPlaced;
      setPicnicPlaced(nextPlaced);
      setPicnicCount((count) => Math.min(picnicItems.length, count + 1));
      setPicnicError(false);
      if (nextPlaced.length === picnicItems.length) window.setTimeout(() => { setCaught([]); go('catch-again'); }, 850);
    } else setPicnicError(true);
    setSelectedPicnic(null);
  };

  const catchItem = (index: number) => {
    setCaught((items) => {
      if (items.includes(index)) return items;
      return [...items, index];
    });
  };

  const stopCandle = () => {
    if (candleTimer.current) window.clearInterval(candleTimer.current);
    candleTimer.current = null;
    if (candleProgressValue.current < 100) {
      candleProgressValue.current = 0;
      setCandleProgress(0);
    }
  };

  const holdCandle = () => {
    if (wishDone || candleTimer.current) return;
    void getInteractionAudio();
    candleTimer.current = window.setInterval(() => {
      candleProgressValue.current = Math.min(100, candleProgressValue.current + 4);
      setCandleProgress(candleProgressValue.current);
      if (candleProgressValue.current >= 100) {
        if (candleTimer.current) window.clearInterval(candleTimer.current);
        candleTimer.current = null;
        setWishDone(true);
        playInteractionChime();
        wishMessageTimer.current = window.setTimeout(() => setWishMessageVisible(true), 620);
      }
    }, 60);
  };

  const reset = () => {
    audioRef.current?.pause(); setMusicOn(false); setPin(''); setPinError(false); setGiftOpen(false); setWishGiftOpen(false); setWishGiftRevealed(false); setWishMessageVisible(false); setEnvelopeOpening(false); setCaught([]); setWishDone(false); setCandleProgress(0); setPicnicCount(0); setPicnicPlaced([]); picnicPlacedRef.current = []; setSelectedPicnic(null);
    candleProgressValue.current = 0;
    if (candleTimer.current) window.clearInterval(candleTimer.current);
    candleTimer.current = null;
    if (wishMessageTimer.current) window.clearTimeout(wishMessageTimer.current);
    if (wishGiftTimer.current) window.clearTimeout(wishGiftTimer.current);
    go('intro');
  };

  const sceneIndex = sceneOrder.indexOf(scene);
  const showMusic = sceneIndex >= sceneOrder.indexOf('memories');

  return (
    <main className={`journey-root ${transition ? 'is-transitioning' : ''}`}>
      <audio ref={audioRef} src={gift.music} loop muted={muted} preload="none" />
      {siteLoading && <div className={`site-loading ${loadingLeaving ? 'leaving' : ''}`} role="status" aria-label="Memuat kejutan ulang tahun" aria-live="polite">
        <div className="loading-ambient" aria-hidden="true">{introMotifs.slice(0, 12).map((motif, index) => <span key={index} style={{ left: motif.left, top: motif.top, animationDelay: `${(index % 5) * -0.8}s` }}>{motif.icon}</span>)}</div>
        <div className="loading-content">
          <div className="loading-art"><span className="loading-halo" /><Image className="loading-bouquet" src="/img/newbuket.png" alt="" width={210} height={232} priority unoptimized /></div>
          <span className="loading-eyebrow">A LITTLE BIRTHDAY STORY</span>
          <h1>Menyiapkan kejutanmu</h1>
          <p className="loading-caption">Merangkai bunga dan momen spesial untukmu...</p>
          <div className="loading-progress-track" role="progressbar" aria-label="Memuat kejutan" aria-valuemin={0} aria-valuemax={100} aria-valuenow={loadingProgress}>
            <span style={{ width: `${loadingProgress}%` }} />
          </div>
          <span className="loading-progress-label">MEMUAT KEJUTAN <strong>{loadingProgress}%</strong></span>
        </div>
      </div>}
      {scene !== 'intro' && <><header className="topbar">
        <span className="brand"><span className="brand-mark">✦</span> a little birthday story</span>
        <button className="text-button" onClick={reset}>↺ Mulai lagi</button>
      </header>
      <div className="scene-progress" aria-label={`Bagian ${sceneIndex + 1} dari ${sceneOrder.length}`}><span style={{ width: `${((sceneIndex + 1) / sceneOrder.length) * 100}%` }} /></div></>}
      {transition && <div className="transition-spider" aria-hidden="true">{transitionSpiders.map((item) => <Image className="transition-spider-bloom" src={spider} alt="" width={400} height={400} key={item.id} style={{ '--spider-x': item.x, '--spider-y': item.y, '--spider-rotation': item.rotation, '--spider-scale': item.scale, '--spider-delay': item.delay } as React.CSSProperties} />)}</div>}

      {scene === 'intro' && <section className="scene intro-scene"><div className="intro-sparkles" aria-hidden="true">{introMotifs.map((motif, index) => <span className="ambient-motif" key={index} style={{ left: motif.left, top: motif.top, animationDelay: `${(index % 6) * -0.8}s` }}>{motif.icon}</span>)}</div><span className="intro-made">made for you ✦</span>
        <div className="intro-copy"><span className="kicker">a private little surprise for</span><h1><em>{gift.recipient}</em></h1><p>Ada kejutan kecil menunggumu. Masukkan PIN ulang tahun untuk membukanya.</p>
          <form className="pin-card" onSubmit={(event) => { event.preventDefault(); unlock(); }}>
            <strong><span className="pin-icon">✦</span><span>Birthday password<small>masukkan tanggal ulang tahunmu</small></span></strong><div className="pin-dots" aria-label={`${pin.length} dari 4 angka terisi`}>{[0, 1, 2, 3].map((index) => <span key={index} className={pin[index] ? 'filled' : ''}>{pin[index] ?? '·'}</span>)}</div>
            <div className="keypad">{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => <button type="button" key={number} aria-label={`Angka ${number}`} onClick={() => { setPin((value) => `${value}${number}`.slice(0, 4)); setPinError(false); }}>{number}</button>)}<button type="button" aria-label="Hapus angka terakhir" onClick={() => setPin((value) => value.slice(0, -1))}>⌫</button><button type="button" aria-label="Angka 0" onClick={() => setPin((value) => `${value}0`.slice(0, 4))}>0</button><button type="submit" aria-label="Buka kejutan" disabled={pin.length !== 4}>↗</button></div>
            <p className="form-message" role="alert">{pinError ? 'PIN belum tepat, coba lagi ya.' : <><span className="hint-label">hint</span>Petunjuk: Tanggal ulang tahun kamu.</>}</p>
          </form>
        </div>
        <div className="intro-art"><div className="bouquet-halo" /><Image className="intro-bouquet" src="/img/newbuket.png" alt="Buket bunga untuk Nopal" width={500} height={552} priority unoptimized /><span className="float flower-one">✿</span><span className="float flower-two">✦</span><span className="bouquet-note">picked just for you</span></div>
        <span className="intro-footnote">ONLY THE RIGHT PERSON CAN ENTER</span>
      </section>}

      {scene === 'gift' && <section className={`scene center-scene gift-scene ${giftOpen ? 'gift-opened' : ''}`}><div className="gift-ambient" aria-hidden="true">{introMotifs.map((motif, index) => <span className="ambient-motif" key={index} style={{ left: motif.left, top: motif.top, animationDelay: `${(index % 6) * -0.9}s` }}>{motif.icon}</span>)}</div><span className="kicker gift-eyebrow">{giftOpen ? `YOU DID IT, ${gift.recipient}!` : '02 · ADA SESUATU UNTUKMU'}</span><h1>{giftOpen ? <>A bouquet <em>just for you.</em></> : <>A little gift <em>for you.</em></>}</h1><div className="gift-box-scene"><div className="gift-confetti" aria-hidden="true">{giftConfetti.map((piece, index) => <span key={index} className="confetti-piece" style={{ '--confetti-x': piece.x, '--confetti-delay': piece.delay, '--confetti-duration': piece.duration, '--confetti-rotation': piece.rotation, '--confetti-hue': piece.hue } as React.CSSProperties} />)}</div><Image className="gift-bouquet" src="/img/newbuket.png" alt="Buket bunga kejutan untuk Nopal" width={440} height={486} unoptimized /><button className="gift-box" aria-label="Buka kotak hadiah" onClick={openFirstGift} disabled={giftOpen}><span className="gift-box-lid"><i /></span><span className="gift-box-body"><i /></span>{!giftOpen && <strong>BUKA HADIAH</strong>}</button></div><div className="gift-reveal-copy"><p>{giftOpen ? 'Setiap bunga membawa satu doa baik untuk ulang tahunmu.' : 'Ketuk kotaknya untuk melihat kejutanmu.'}</p>{giftOpen && <button className="primary-button" onClick={() => beginCatch('flowers')}>Ambil bunganya <span>→</span></button>}</div></section>}

      {scene === 'flowers' && <FlowerCatchScene caught={caught} onCatch={catchItem} onRetry={() => beginCatch('flowers')} onComplete={() => go('envelope')} />}
      {scene === 'catch-again' && <CatchScene key={scene} caught={caught} onCatch={catchItem} onComplete={() => go('delivery')} onSkip={() => go('delivery')} />}

      {scene === 'envelope' && <section className="scene center-scene envelope-scene"><span className="kicker">04 · ada surat untukmu</span><h1>Tekan amplopnya,<br /><em>pelan-pelan.</em></h1><button className={`envelope-button ${envelopeOpening ? 'opening' : ''}`} onClick={openEnvelope} disabled={envelopeOpening} aria-label="Buka amplop"><span className="envelope-back" /><span className="envelope-letter">♥</span><span className="envelope-flap" /><span className="envelope-front" /><Image className="spider envelope-spider" src={spider} alt="Laba-laba kecil menjaga amplop" width={80} height={80} /></button><p>Di dalamnya ada kenangan dan sebuah lagu.</p></section>}

      {scene === 'memories' && <section className="scene memories-scene"><div className="section-heading"><span className="kicker">05–06 · beberapa chat manis</span><h1>Empat chat spesial<br /><em>seperti lagu untuk elu.</em></h1><p className="photo-hint">↗ Tekan foto untuk melihat lebih jelas</p></div>
        <div className="memories-layout"><div className="photo-stack" aria-label="Empat slot chat kenangan">{gift.photos.map((photo, index) => <article className={`photo-card photo-${index + 1}`} key={photo.label}><button className="memory-photo memory-photo-trigger" type="button" aria-label={`Perbesar foto: ${photo.label}`} onClick={() => setActivePhoto({ src: photo.src, alt: `Chat kenangan: ${photo.label}`, label: photo.label })}><Image src={photo.src} alt={`Chat kenangan: ${photo.label}`} width={720} height={1233} unoptimized /></button><p>{photo.label}</p></article>)}</div>
          <div className="video-card"><div className="video-heading"><span>NOW PLAYING</span><strong>kenangan favorit</strong></div><div className="video-frame"><iframe id="nopalpante-youtube" title="Video kenangan untuk Nopal" src={`https://www.youtube.com/embed/${gift.videoId}?enablejsapi=1&playsinline=1&rel=0`} allow="autoplay; encrypted-media; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div><div className="video-note"><span className="video-dot" />{videoPlaying ? 'Musik halaman berhenti selama video diputar' : 'Lagu halaman tersedia di pemutar bawah'}</div></div></div>
        <button className="primary-button" onClick={() => go('candle')}>Lanjutkan ceritanya <span>→</span></button>
      </section>}

      {scene === 'candle' && <section className="scene center-scene candle-scene"><span className="kicker">07 · buat satu harapan</span><h1>Tutup mata sebentar,<br /><em>buat satu doa.</em></h1>{!wishMessageVisible && <div className={`cake ${wishDone ? 'blown' : ''}`}><span className="flame">✦</span><span className="wick" /><span className="cake-topper">♡</span><span className="cake-layer cake-layer-a" /><span className="cake-layer cake-layer-b" /><span className="cake-layer cake-layer-c" /><span className="cake-plate" /></div>}<div className={`candle-confetti ${wishDone ? 'celebrating' : ''}`} aria-hidden="true">{wishDone && giftConfetti.map((piece, index) => <span key={index} className="confetti-piece" style={{ '--confetti-x': piece.x, '--confetti-delay': piece.delay, '--confetti-duration': piece.duration, '--confetti-rotation': piece.rotation, '--confetti-hue': piece.hue } as React.CSSProperties} />)}</div>{!wishDone && <button className="hold-button" style={{ '--hold': `${candleProgress}%` } as React.CSSProperties} onPointerDown={holdCandle} onPointerUp={stopCandle} onPointerLeave={stopCandle} onPointerCancel={stopCandle} onKeyDown={(event) => { if (event.key === ' ' || event.key === 'Enter') holdCandle(); }} onKeyUp={(event) => { if (event.key === ' ' || event.key === 'Enter') stopCandle(); }}>Tahan untuk meniup lilin</button>}{wishMessageVisible && <><div className="wish-card candle-wish-card"><span>✓ &nbsp; HARAPAN TERKIRIM</span><small>YOUR WISH IS ON ITS WAY</small><h1>Doamu sudah<br />terbang <em>✦</em></h1><p>Semoga semesta mendengar semuanya, dan hal-hal baik selalu menemukan jalan pulang kepadamu.</p></div><button className="primary-button" onClick={() => go('wish')}>Lihat kejutan berikutnya <span>→</span></button></>}</section>}

      {scene === 'wish' && <section className={`scene center-scene gift-scene wish-scene ${wishGiftOpen ? 'gift-opened' : ''}`}>
        {!wishGiftRevealed ? <>
          <span className="kicker gift-eyebrow">{wishGiftOpen ? `YOU DID IT, ${gift.recipient}!` : '08 · SEBUAH KADO KECIL UNTUKMU'}</span>
          <h1>{wishGiftOpen ? <>A bouquet <em>just for you.</em></> : <>Satu lagi <em>untukmu.</em></>}</h1>
          <div className="gift-box-scene">
            <div className="gift-confetti" aria-hidden="true">{giftConfetti.map((piece, index) => <span key={index} className="confetti-piece" style={{ '--confetti-x': piece.x, '--confetti-delay': piece.delay, '--confetti-duration': piece.duration, '--confetti-rotation': piece.rotation, '--confetti-hue': piece.hue } as React.CSSProperties} />)}</div>
            <Image className="gift-bouquet gift-letter" src="/img/wish-letter.png" alt="Surat ulang tahun kecil dengan amplop biru" width={1024} height={1536} unoptimized />
            <button className="gift-box" aria-label="Buka kotak hadiah" onClick={openWishGift} disabled={wishGiftOpen}><span className="gift-box-lid"><i /></span><span className="gift-box-body"><i /></span>{!wishGiftOpen && <strong>BUKA HADIAH</strong>}</button>
          </div>
          <div className="gift-reveal-copy"><p>{wishGiftOpen ? 'Ada surat kecil yang ingin kusampaikan.' : 'Ketuk kotaknya untuk melihat kejutanmu.'}</p></div>
        </> : <>
          <span className="kicker">08 · dari {gift.sender}, untukmu</span>
          <div className="message-paper wish-gift-message"><span className="paper-heart">♡</span><h1>Selamat ulang tahun,<br /><em>{gift.recipient}.</em></h1><p>semoga hari hari lu dipenuhi hal baik , tawa yang riang , dan orang orang yang lu sayang selalu mendukung lu. makasi udah jadi temen gua yang bener bener temen  , sehat selalu ya bro..</p><p className="message-signoff">Salam,<br /><strong>{gift.sender}</strong></p></div>
          <button className="primary-button" onClick={() => go('portrait')}>Masih ada kejutan kecil untukmu <span>→</span></button>
        </>}
      </section>}

      {scene === 'portrait' && <section className="scene center-scene portrait-scene">
        <div className="portrait-content">
          <div className="portrait-photos"><p className="photo-hint portrait-photo-hint">↗ Tekan foto untuk melihat lebih jelas</p><div className="portrait-gallery" aria-label="Tiga foto Nopal">{[
            { src: '/img/nopal-photo-left.jpeg', alt: 'Foto Nopal sebelah kiri' },
            { src: '/img/nopal-photo-center.jpeg', alt: 'Foto Nopal di tengah' },
            { src: '/img/nopal-photo-right.jpeg', alt: 'Foto Nopal sebelah kanan' },
          ].map((photo) => <button className="portrait-frame portrait-image-trigger" type="button" key={photo.src} aria-label={`Perbesar foto Nopal ${photo.alt.replace('Foto Nopal ', '')}`} onClick={() => setActivePhoto({ src: photo.src, alt: photo.alt, label: photo.alt })}><Image className="portrait-image" src={photo.src} alt={photo.alt} width={900} height={1600} unoptimized /></button>)}</div></div>
          <article className="message-paper portrait-letter">
            <h2>Selamat ulang tahun, Nopal.</h2>
            <p>semoga sehat selalu panjang umur dimurahkan rezeki nya agar bisa teef gua terus  , intinya sehat terus aja dan jangan emosian jadi orang gabaik dan juga jaga kesehatan lu jangan sampe kambuh-kambuh , kalo ada apa-apa look at me gua selalu ada buat lu</p>
            <p className="message-signoff">Dengan hangat,<br /><strong>{gift.sender}</strong></p>
          </article>
        </div>
        <button className="primary-button" onClick={() => { setPicnicCount(0); setPicnicPlaced([]); picnicPlacedRef.current = []; setSelectedPicnic(null); go('picnic'); }}>Lanjut ke piknik <span>→</span></button>
      </section>}

      {scene === 'picnic' && <section className="scene center-scene game-scene picnic-scene"><span className="kicker">10 · piknik kecil</span><h1>Siapkan <em>piknik.</em></h1><p>Tarik kudapan ke tempat yang tepat di atas tikar.</p><div className="picnic-board"><div className="picnic-items" aria-label="Kudapan untuk piknik">{picnicItems.map((item, index) => !picnicPlaced.includes(index) && <button key={item.label} className={selectedPicnic === index ? 'selected' : ''} aria-pressed={selectedPicnic === index} onPointerDown={() => { setSelectedPicnic(index); setPicnicError(false); }} onClick={() => { setSelectedPicnic(index); setPicnicError(false); }}><span>{item.icon}</span><small>{item.label}</small></button>)}</div><div className="picnic-mat" aria-label="Tikar dan kategori piknik">{picnicCategories.map((category) => { const itemIndex = picnicPlaced.find((index) => picnicItems[index].category === category); return <button key={category} className={itemIndex !== undefined ? 'filled' : ''} onPointerUp={() => placePicnicItem(category)} onClick={() => placePicnicItem(category)} aria-label={`Tempatkan ke ${category.toLowerCase()}`}><span>{itemIndex === undefined ? category : <><b>{picnicItems[itemIndex].icon}</b><small>{category}</small></>}</span></button>; })}</div></div><p className="live-message" aria-live="polite">{picnicCount === picnicItems.length ? 'Pikniknya siap! 🕷️' : picnicError ? 'Belum cocok—coba tempat yang lain, ya.' : selectedPicnic === null ? `${picnicCount}/${picnicItems.length} kudapan tersusun` : `Lepaskan ${picnicItems[selectedPicnic].label.toLowerCase()} di tempat yang sesuai.`}</p>{picnicCount === picnicItems.length ? <p className="live-message">Berikutnya: tangkap tujuh kejutan ✦</p> : <button className="secondary-button picnic-skip" onClick={() => { setCaught([]); go('catch-again'); }}>Lewati permainan →</button>}</section>}

      {scene === 'delivery' && <MazeScene onComplete={() => go('word-search')} />}
      {scene === 'word-search' && <WordSearchScene onComplete={() => go('complete')} />}

      {scene === 'complete' && <section className="scene center-scene complete-scene"><Image className="spider ending-spider" src={spider} alt="Laba-laba kecil ikut merayakan" width={130} height={120}/><span className="kicker">cerita kecil ini selesai</span><h1>Semoga harimu<br /><em>seindah dirimu.</em></h1><p>Selamat ulang tahun, {gift.recipient}.<br />Salam, {gift.sender}.</p><button className="primary-button" onClick={reset}>Ulangi perjalanan <span>↺</span></button></section>}

      {showMusic && <aside className="music-dock" aria-label="Pemutar musik"><button className="music-play" onClick={async () => { if (!audioRef.current) return; if (musicOn) { audioRef.current.pause(); setMusicOn(false); } else await startMusic(); }} aria-label={musicOn ? 'Jeda musik' : 'Putar musik'}>{musicOn ? 'Ⅱ' : '▶'}</button><div className="music-copy"><span>{musicOn ? 'sedang diputar' : 'lagu untukmu'}</span><strong>Anugerah Terindah</strong></div><button className="mute-button" onClick={() => setMuted((value) => !value)} aria-label={muted ? 'Nyalakan suara' : 'Bisukan musik'}>{muted ? '◌' : '♪'}</button></aside>}
      {showMusic && videoPlaying && <button className="resume-music" onClick={() => void startMusic()}>Putar musik halaman</button>}
      {activePhoto && <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label={activePhoto.label} onClick={() => setActivePhoto(null)}><button className="photo-lightbox-close" type="button" aria-label="Tutup foto besar" ref={lightboxCloseRef} onClick={() => setActivePhoto(null)}>×</button><figure className="photo-lightbox-figure" onClick={(event) => event.stopPropagation()}><Image src={activePhoto.src} alt={activePhoto.alt} width={1600} height={2400} unoptimized /><figcaption>{activePhoto.label}</figcaption></figure></div>}
    </main>
  );
}

type FallingFlower = { id: number; x: number; y: number; icon: string };

function FlowerCatchScene({ caught, onCatch, onRetry, onComplete }: { caught: number[]; onCatch: (index: number) => void; onRetry: () => void; onComplete: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [lives, setLives] = useState(8);
  const [timeLeft, setTimeLeft] = useState(40);
  const [playerX, setPlayerX] = useState(50);
  const [fallingItems, setFallingItems] = useState<FallingFlower[]>([]);
  const nextId = useRef(0);
  const handledIds = useRef(new Set<number>());
  const onCatchRef = useRef(onCatch);
  const onCompleteRef = useRef(onComplete);
  const itemsRef = useRef<FallingFlower[]>([]);
  const playerXRef = useRef(playerX);
  const complete = caught.length >= 6;
  const gameOver = lives <= 0 || timeLeft <= 0;

  useEffect(() => { onCatchRef.current = onCatch; }, [onCatch]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => {
    if (!complete) return;
    const timeout = window.setTimeout(() => onCompleteRef.current(), 240);
    return () => window.clearTimeout(timeout);
  }, [complete]);
  useEffect(() => {
    if (!playing || complete || gameOver) return;
    const spawn = window.setInterval(() => {
      const flowerIndex = Math.floor(Math.random() * flowers.length);
      const item = { id: nextId.current++, x: 8 + Math.random() * 84, y: -7, icon: flowers[flowerIndex] };
      itemsRef.current = [...itemsRef.current, item];
      setFallingItems(itemsRef.current);
    }, 720);
    const fall = window.setInterval(() => {
      const kept: FallingFlower[] = [];
      let missed = 0;
      for (const item of itemsRef.current) {
        const next = { ...item, y: item.y + 1.05 };
        if (handledIds.current.has(item.id)) continue;
        if (next.y >= 83 && next.y <= 101 && Math.abs(next.x - playerXRef.current) < 14) {
          handledIds.current.add(item.id);
          onCatchRef.current(item.id);
        } else if (next.y > 106) {
          handledIds.current.add(item.id);
          missed += 1;
        } else kept.push(next);
      }
      itemsRef.current = kept;
      setFallingItems(kept);
      if (missed) setLives((value) => Math.max(0, value - missed));
    }, 50);
    const timer = window.setInterval(() => setTimeLeft((time) => Math.max(0, time - 1)), 1000);
    return () => { window.clearInterval(spawn); window.clearInterval(fall); window.clearInterval(timer); };
  }, [playing, complete, gameOver]);

  useEffect(() => {
    if (!playing || complete || gameOver) return;
    const move = (event: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a' ? -1 : 1;
      const nextX = Math.max(7, Math.min(93, playerXRef.current + direction * 7));
      playerXRef.current = nextX;
      setPlayerX(nextX);
    };
    window.addEventListener('keydown', move);
    return () => window.removeEventListener('keydown', move);
  }, [playing, complete, gameOver]);

  const reset = () => { setPlaying(false); setLives(8); setTimeLeft(40); playerXRef.current = 50; setPlayerX(50); itemsRef.current = []; setFallingItems([]); handledIds.current.clear(); nextId.current = 0; onRetry(); };
  const moveToPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const nextX = Math.max(7, Math.min(93, ((event.clientX - bounds.left) / bounds.width) * 100));
    playerXRef.current = nextX;
    setPlayerX(nextX);
  };
  const movePlayer = (delta: number) => { const nextX = Math.max(7, Math.min(93, playerXRef.current + delta)); playerXRef.current = nextX; setPlayerX(nextX); };
  return (
    <section className="scene center-scene game-scene catch-scene flower-catch-scene">
      <span className="kicker">03 · tangkap bunga</span>
      <h1>Tangkap <em>6 bunga.</em></h1>
      <p>Geser laba-laba dengan jari, mouse, atau tombol panah untuk menangkapnya.</p>
      <div className="catch-hud"><strong>{caught.length}/6 tertangkap</strong><span>♡ {lives}</span><span>{timeLeft}s</span></div>
      <div className="catch-field" aria-label="Area permainan menangkap" onPointerDown={moveToPointer} onPointerMove={(event) => { if (event.buttons) moveToPointer(event); }} tabIndex={0}>
        <span className="catch-cloud" aria-hidden="true">✦　·　✧</span>
        {fallingItems.map((item) => <span key={item.id} className="falling-item" style={{ left: `${item.x}%`, top: `${item.y}%` }} aria-hidden="true">{item.icon}</span>)}
        <Image className="spider catcher-spider" src={spider} alt="Laba-laba penangkap" width={110} height={100} style={{ left: `${playerX}%` }} />
        {!playing && <div className="game-overlay"><div className="game-start-card"><span>SIAP-SIAP</span><strong>Tangkap bunganya!</strong><p>Geser laba-laba untuk menangkap 6 bunga. Kamu punya 8 nyawa.</p><button className="primary-button" onClick={() => setPlaying(true)}>Mulai main</button></div></div>}
        {gameOver && !complete && <div className="game-overlay"><div className="game-result" role="status"><strong>{lives <= 0 ? 'Ups, bunganya lolos!' : 'Waktunya habis!'}</strong><p>Yuk, coba lagi. Kamu pasti bisa.</p><button className="primary-button" onClick={reset}>Main lagi ↻</button></div></div>}
        {complete && <div className="game-overlay"><div className="game-result" role="status"><strong>Berhasil! ✦</strong><p>Semua bunganya tertangkap.</p></div></div>}
      </div>
      <div className="catch-move-controls"><button aria-label="Gerak ke kiri" onClick={() => movePlayer(-12)}>←</button><span>GESER LABA-LABA</span><button aria-label="Gerak ke kanan" onClick={() => movePlayer(12)}>→</button></div>
      <div className="catch-controls" aria-live="polite">{complete ? 'Laba-labanya ikut senang! 🕷️' : 'Sentuh layar untuk menggerakkan laba-laba'}</div>
    </section>
  );
}

type Surprise = { id: number; x: number; y: number; icon: string; word: string };

function CatchScene({ caught, onCatch, onComplete, onSkip }: { caught: number[]; onCatch: (index: number) => void; onComplete: () => void; onSkip: () => void }) {
  const [playerX, setPlayerX] = useState(50);
  const [items, setItems] = useState<Surprise[]>([]);
  const itemRef = useRef<Surprise[]>([]);
  const playerRef = useRef(50);
  const nextId = useRef(0);
  const handled = useRef(new Set<number>());
  const onCatchRef = useRef(onCatch);
  const onCompleteRef = useRef(onComplete);
  const finished = caught.length >= 7;

  useEffect(() => { onCatchRef.current = onCatch; onCompleteRef.current = onComplete; }, [onCatch, onComplete]);
  useEffect(() => {
    if (!finished) return;
    const timer = window.setTimeout(() => onCompleteRef.current(), 850);
    return () => window.clearTimeout(timer);
  }, [finished]);
  useEffect(() => {
    if (finished) return;
    const icons = ['💝', '⭐', '🍬', '🧁', '💌', '💖', '✨'];
    const words = ['manis', 'cerah', 'hangat', 'baik', 'seru'];
    const spawn = window.setInterval(() => {
      const item = { id: nextId.current++, x: 8 + Math.random() * 84, y: -8, icon: icons[Math.floor(Math.random() * icons.length)], word: words[Math.floor(Math.random() * words.length)] };
      itemRef.current = [...itemRef.current, item];
      setItems(itemRef.current);
    }, 620);
    const fall = window.setInterval(() => {
      const kept: Surprise[] = [];
      for (const item of itemRef.current) {
        const next = { ...item, y: item.y + 1.1 };
        if (handled.current.has(item.id)) continue;
        if (next.y >= 78 && next.y <= 100 && Math.abs(next.x - playerRef.current) < 13) {
          handled.current.add(item.id);
          onCatchRef.current(item.id);
        } else if (next.y <= 108) kept.push(next);
      }
      itemRef.current = kept;
      setItems(kept);
    }, 45);
    return () => { window.clearInterval(spawn); window.clearInterval(fall); };
  }, [finished]);

  const setPlayer = (x: number) => { const value = Math.max(7, Math.min(93, x)); playerRef.current = value; setPlayerX(value); };
  const movePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setPlayer(((event.clientX - bounds.left) / bounds.width) * 100);
  };
  useEffect(() => {
    const move = (event: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D'].includes(event.key)) return;
      event.preventDefault();
      setPlayer(playerRef.current + (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a' ? -7 : 7));
    };
    window.addEventListener('keydown', move);
    return () => window.removeEventListener('keydown', move);
  }, []);

  return <section className="scene center-scene game-scene catch-scene surprise-catch-scene">
    <span className="kicker">11 · tangkap 7 kejutan</span>
    <h1>Tangkap <em>7 kejutan.</em></h1>
    <p>Geser laba-laba dengan jari, mouse, atau tombol panah untuk menangkapnya.</p>
    <div className="catch-hud"><strong>{Math.min(caught.length, 7)}/7 tertangkap</strong><span>♡ ✦</span><span>kejutan kecil</span></div>
    <div className="catch-field surprise-catch-field" aria-label="Area permainan menangkap kejutan" onPointerMove={movePointer} tabIndex={0}>
      <span className="catch-cloud" aria-hidden="true">✦　·　✧</span>
      {items.map((item) => <span key={item.id} className="surprise-falling-item" style={{ left: `${item.x}%`, top: `${item.y}%` }} aria-hidden="true"><b>{item.icon}</b><small>{item.word}</small></span>)}
      <Image className="spider catcher-spider" src={spider} alt="Laba-laba penangkap kejutan" width={100} height={92} style={{ left: `${playerX}%` }} />
      {finished && <div className="game-overlay"><div className="game-result" role="status"><strong>Berhasil! ✦</strong><p>Semua kejutan tertangkap.</p><p>Sebentar lagi ada labirin kecil untukmu…</p></div></div>}
    </div>
    <div className="catch-move-controls"><button aria-label="Gerak ke kiri" onClick={() => setPlayer(playerRef.current - 12)}>←</button><span>GESER LABA-LABA</span><button aria-label="Gerak ke kanan" onClick={() => setPlayer(playerRef.current + 12)}>→</button></div>
    <div className="catch-controls" aria-live="polite">{finished ? 'Laba-labanya ikut senang! 🕷️' : 'Tangkap tujuh kejutan yang berjatuhan.'}</div>
    <button className="secondary-button catch-skip" onClick={onSkip}>Lewati permainan →</button>
  </section>;
}

const mazePath = ['6-0', '6-1', '6-2', '5-2', '4-2', '4-3', '4-4', '4-5', '3-5', '2-5', '2-4', '2-3', '2-2', '2-1', '1-1', '0-1', '0-2', '0-3', '0-4', '0-5', '0-6'];
const mazeOpenCells = new Set(mazePath);

function MazeScene({ onComplete }: { onComplete: () => void }) {
  const [position, setPosition] = useState({ row: 6, col: 0 });
  const [completed, setCompleted] = useState(false);
  const positionRef = useRef(position);
  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (completed) return;
    const delta = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] }[direction];
    const next = { row: positionRef.current.row + delta[0], col: positionRef.current.col + delta[1] };
    if (!mazeOpenCells.has(`${next.row}-${next.col}`)) return;
    positionRef.current = next;
    setPosition(next);
    if (next.row === 0 && next.col === 6) setCompleted(true);
  }, [completed]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const direction = ({ ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' } as Record<string, 'up' | 'down' | 'left' | 'right'>)[event.key];
      if (!direction) return;
      event.preventDefault();
      move(direction);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [move]);
  return <section className="scene center-scene game-scene maze-scene">
    <span className="kicker">12 · labirin kecil</span>
    <h1>Bantu laba-laba kecil<br /><em>menemukan hadiahnya.</em></h1>
    <p>Ikuti jalan biru sampai ke hadiah. Dinding akan menahan langkahmu.</p>
    <div className={`maze-shell ${completed ? 'is-complete' : ''}`}>
      <div className="tiny-maze" role="grid" aria-label="Labirin 7 kali 7">
        {Array.from({ length: 49 }, (_, index) => {
          const row = Math.floor(index / 7); const col = index % 7; const key = `${row}-${col}`;
          const isOpen = mazeOpenCells.has(key); const isPlayer = position.row === row && position.col === col; const isGoal = row === 0 && col === 6;
          return <div key={key} className={`maze-cell ${isOpen ? 'open' : 'wall'} ${isGoal ? 'goal' : ''} ${isPlayer ? 'has-player' : ''}`} role="gridcell" aria-label={isPlayer ? 'Laba-laba' : isGoal ? 'Hadiah' : isOpen ? 'Jalan' : 'Dinding'}>{isPlayer ? <Image className="maze-player" data-position={key} src={spider} alt="Laba-laba kecil" width={42} height={38} /> : isGoal ? '🎁' : ''}</div>;
        })}
      </div>
      <div className="maze-controls" aria-label="Kontrol labirin"><button aria-label="Atas" onClick={() => move('up')}>↑</button><button aria-label="Kiri" onClick={() => move('left')}>←</button><button aria-label="Bawah" onClick={() => move('down')}>↓</button><button aria-label="Kanan" onClick={() => move('right')}>→</button></div>
    </div>
    {completed && <div className="maze-success" role="status"><strong>Hadiah berhasil ditemukan! ✦</strong><p>Laba-laba kecil berhasil sampai tujuan.</p><button className="primary-button" onClick={onComplete}>Selesai <span>♥</span></button></div>}
  </section>;
}

type WordCell = { row: number; col: number };
const wordGridSize = 10;
const wordSearchWords = [
  { word: 'BINTANG', start: { row: 2, col: 1 }, step: { row: 0, col: 1 } },
  { word: 'LANGIT', start: { row: 0, col: 9 }, step: { row: 1, col: 0 } },
  { word: 'GALAXY', start: { row: 8, col: 1 }, step: { row: -1, col: 1 } },
];
const wordSearchGrid = Array.from({ length: wordGridSize }, (_, row) => Array.from({ length: wordGridSize }, (_, col) => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[(row * 17 + col * 13 + row * col * 7 + 11) % 26]));
wordSearchWords.forEach(({ word, start, step }) => [...word].forEach((letter, index) => { wordSearchGrid[start.row + step.row * index][start.col + step.col * index] = letter; }));

function straightCells(start: WordCell, end: WordCell): WordCell[] {
  const rowDelta = end.row - start.row;
  const colDelta = end.col - start.col;
  if (rowDelta !== 0 && colDelta !== 0 && Math.abs(rowDelta) !== Math.abs(colDelta)) return [];
  const length = Math.max(Math.abs(rowDelta), Math.abs(colDelta));
  const rowStep = Math.sign(rowDelta);
  const colStep = Math.sign(colDelta);
  return Array.from({ length: length + 1 }, (_, index) => ({ row: start.row + rowStep * index, col: start.col + colStep * index }));
}

function WordSearchScene({ onComplete }: { onComplete: () => void }) {
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCells, setFoundCells] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<WordCell[]>([]);
  const [hintWord, setHintWord] = useState<string | null>(null);
  const [hintLineStyle, setHintLineStyle] = useState<React.CSSProperties | null>(null);
  const [message, setMessage] = useState('Geser dari huruf pertama ke huruf terakhir untuk menemukan kata.');
  const visibleHintWord = hintWord && !foundWords.includes(hintWord) ? hintWord : null;
  const gridRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<WordCell | null>(null);
  const selectedCellsRef = useRef<WordCell[]>([]);

  useEffect(() => {
    if (foundWords.length === wordSearchWords.length) return;
    const timer = window.setTimeout(() => setHintWord(wordSearchWords.find(({ word }) => !foundWords.includes(word))?.word ?? null), 15000);
    return () => window.clearTimeout(timer);
  }, [foundWords]);

  useEffect(() => {
    if (foundWords.length !== wordSearchWords.length) return;
    const timer = window.setTimeout(onComplete, 850);
    return () => window.clearTimeout(timer);
  }, [foundWords, onComplete]);

  useEffect(() => {
    if (!hintWord || foundWords.includes(hintWord)) return;
    const placement = wordSearchWords.find(({ word }) => word === hintWord);
    if (!placement || !gridRef.current) return;
    const drawLine = () => {
      const end = { row: placement.start.row + placement.step.row * (placement.word.length - 1), col: placement.start.col + placement.step.col * (placement.word.length - 1) };
      const selector = ({ row, col }: WordCell) => `.word-search-cell[data-row="${row}"][data-col="${col}"]`;
      const startCell = gridRef.current?.querySelector(selector(placement.start));
      const endCell = gridRef.current?.querySelector(selector(end));
      if (!startCell || !endCell || !gridRef.current) return;
      const gridBounds = gridRef.current.getBoundingClientRect();
      const startBounds = startCell.getBoundingClientRect();
      const endBounds = endCell.getBoundingClientRect();
      const x1 = startBounds.left + startBounds.width / 2 - gridBounds.left;
      const y1 = startBounds.top + startBounds.height / 2 - gridBounds.top;
      const x2 = endBounds.left + endBounds.width / 2 - gridBounds.left;
      const y2 = endBounds.top + endBounds.height / 2 - gridBounds.top;
      setHintLineStyle({ left: x1, top: y1, width: Math.hypot(x2 - x1, y2 - y1), transform: `translateY(-50%) rotate(${Math.atan2(y2 - y1, x2 - x1)}rad)` });
    };
    drawLine();
    window.addEventListener('resize', drawLine);
    return () => window.removeEventListener('resize', drawLine);
  }, [hintWord, foundWords]);

  const paintSelection = (cells: WordCell[]) => {
    selectedCellsRef.current = cells;
    setSelectedCells(cells);
  };

  const moveSelection = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    if (!start) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('.word-search-cell');
    if (!target || !gridRef.current?.contains(target)) return;
    paintSelection(straightCells(start, { row: Number(target.dataset.row), col: Number(target.dataset.col) }));
  };

  const finishSelection = () => {
    const start = dragStartRef.current;
    if (!start) return;
    const cells = selectedCellsRef.current;
    const picked = cells.map(({ row, col }) => wordSearchGrid[row][col]).join('');
    const match = wordSearchWords.find(({ word }) => word === picked || word === [...picked].reverse().join(''));
    if (match && !foundWords.includes(match.word)) {
      const nextFoundWords = [...foundWords, match.word];
      setFoundWords(nextFoundWords);
      setFoundCells((current) => [...new Set([...current, ...cells.map(({ row, col }) => `${row}-${col}`)])]);
      setMessage(nextFoundWords.length === wordSearchWords.length ? 'Semua kata ditemukan! Laba-laba kecil ikut merayakan ✦' : `${match.word} ditemukan! ✦`);
    } else if (cells.length > 1) {
      setMessage(match ? 'Kata itu sudah ditemukan—cari yang lain.' : 'Belum ketemu, coba tarik garis lurus di huruf-hurufnya.');
    }
    dragStartRef.current = null;
    paintSelection([]);
  };

  return <section className="scene center-scene game-scene word-search-scene">
    <div className="word-search-layout">
      <div className="word-search-note">
        <span className="kicker">13 · tiga kata untukmu</span>
        <h1>Tiga kata<br /><em>bersembunyi di sini.</em></h1>
        <p>Tarik garis lurus di atas huruf untuk menemukan:</p>
        <div className="word-search-targets">{wordSearchWords.map(({ word }) => <strong key={word}>{word}</strong>)}</div>
        <div className="word-search-found" aria-live="polite">{foundWords.map((word) => <span className="found-word" key={word}>✦ {word}</span>)}</div>
      </div>
      <div className="word-search-board-wrap">
        <div className="word-search-grid" ref={gridRef} role="grid" aria-label="Pencarian kata 10 kali 10" onPointerDown={(event) => {
          const target = (event.target as HTMLElement).closest<HTMLElement>('.word-search-cell');
          if (!target) return;
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          const start = { row: Number(target.dataset.row), col: Number(target.dataset.col) };
          dragStartRef.current = start;
          paintSelection([start]);
        }} onPointerMove={moveSelection} onPointerUp={finishSelection} onPointerCancel={finishSelection}>
          {wordSearchGrid.flatMap((line, row) => line.map((letter, col) => {
            const key = `${row}-${col}`;
            const classes = ['word-search-cell', selectedCells.some((cell) => cell.row === row && cell.col === col) ? 'is-selecting' : '', foundCells.includes(key) ? 'is-found' : ''].filter(Boolean).join(' ');
            return <span key={key} className={classes} data-row={row} data-col={col} role="gridcell" aria-label={`Baris ${row + 1}, kolom ${col + 1}, huruf ${letter}`}>{letter}</span>;
          }))}
          {hintLineStyle && <span className={`word-search-clue-line ${visibleHintWord ? 'is-visible' : ''}`} style={hintLineStyle} aria-hidden="true" />}
        </div>
        <div className="word-search-status"><strong className="word-search-count">{foundWords.length} dari {wordSearchWords.length} ditemukan</strong><p className="word-search-message" aria-live="polite">{message}</p></div>
        {visibleHintWord && <p className="word-search-hint" role="status">Petunjuk kecil: ikuti garis biru yang berkedip ✦</p>}
      </div>
    </div>
  </section>;
}
