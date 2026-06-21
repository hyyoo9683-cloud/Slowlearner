import { useState, useEffect } from 'react';
import { loadRecords } from '../utils/storage';
import { loadOnboarding } from './OnboardingScreen';

// 관심사별 팟캐스트
const PODCASTS = {
  nature: [
    { title: 'Ologies with Alie Ward', desc: '자연·과학 각 분야 전문가 인터뷰. 쉽고 유머러스해요.', emoji: '🌿', spotify: 'https://open.spotify.com/show/5nvRkVMH58SelKZYZAllZa', apple: 'https://podcasts.apple.com/podcast/ologies/id1278815517' },
    { title: 'Nature Podcast (by Nature)', desc: '최신 자연과학 연구를 짧고 명확하게 소개해요.', emoji: '🔬', spotify: 'https://open.spotify.com/show/3mLBBmhBfhqbI1lGtb0RwW', apple: 'https://podcasts.apple.com/podcast/nature-podcast/id81934659' },
  ],
  animal: [
    { title: 'The Wild with Chris Morgan', desc: '야생동물 전문가와 함께하는 생생한 자연 이야기.', emoji: '🐾', spotify: 'https://open.spotify.com/show/3mLBBmhBfhqbI1lGtb0RwW', apple: 'https://podcasts.apple.com/podcast/the-wild/id1437498560' },
    { title: 'Radiolab', desc: '동물·생명·과학을 감성적으로 풀어내는 팟캐스트.', emoji: '🐘', spotify: 'https://open.spotify.com/show/2hmkzUtix0qTqvUSMOxMOQ', apple: 'https://podcasts.apple.com/podcast/radiolab/id152249110' },
  ],
  food: [
    { title: 'Gastropod', desc: '음식의 역사·과학·문화를 재미있게 탐구해요.', emoji: '🍳', spotify: 'https://open.spotify.com/show/2hREkBuXEnEH6r9YXYCTZA', apple: 'https://podcasts.apple.com/podcast/gastropod/id956528997' },
    { title: 'The Sporkful', desc: '음식 덕후를 위한 진지하고 재미있는 음식 토크.', emoji: '🥄', spotify: 'https://open.spotify.com/show/3GxiMnh9GxLGmYFZ7vVkfx', apple: 'https://podcasts.apple.com/podcast/the-sporkful/id474345214' },
  ],
  travel: [
    { title: 'Zero To Travel', desc: '여행 팁과 실제 여행자 이야기. 영어 듣기 연습에 딱이에요.', emoji: '✈️', spotify: 'https://open.spotify.com/show/3GxiMnh9GxLGmYFZ7vVkfx', apple: 'https://podcasts.apple.com/podcast/zero-to-travel/id592419010' },
    { title: 'Amateur Traveler', desc: '각 나라·도시 여행 정보를 현지인처럼 소개해요.', emoji: '🗺️', spotify: 'https://open.spotify.com/show/4dePeWPRj0vAelFKhBXHRK', apple: 'https://podcasts.apple.com/podcast/amateur-traveler-travel/id73802699' },
  ],
  daily: [
    { title: 'The Daily (NYT)', desc: '매일 20분, 오늘의 주요 뉴스. 명확한 발음으로 듣기 연습 최고.', emoji: '☀️', spotify: 'https://open.spotify.com/show/3IM0lmZxpFAY7CwMuv9H4g', apple: 'https://podcasts.apple.com/podcast/the-daily/id1200361736' },
    { title: 'Stuff You Should Know', desc: '일상 주제를 깊게 파고드는 두 친구의 유쾌한 대화.', emoji: '☕', spotify: 'https://open.spotify.com/show/0ofXAdFIQQRsCYj9754UFx', apple: 'https://podcasts.apple.com/podcast/stuff-you-should-know/id278981407' },
  ],
  culture: [
    { title: 'The New Yorker Radio Hour', desc: '문화·예술·사회 이슈를 깊이 있게 다뤄요.', emoji: '🎨', spotify: 'https://open.spotify.com/show/1iohmBNlRooIVtukKeavRa', apple: 'https://podcasts.apple.com/podcast/the-new-yorker-radio-hour/id1050430296' },
    { title: 'Pop Culture Happy Hour (NPR)', desc: '영화·드라마·음악 최신 이슈를 가볍게 즐겨요.', emoji: '🎬', spotify: 'https://open.spotify.com/show/12YKtpJEVFCJFkdqrSOjXD', apple: 'https://podcasts.apple.com/podcast/pop-culture-happy-hour/id427976174' },
  ],
};

const YOUTUBE = {
  nature: [
    { title: 'National Geographic', desc: '압도적인 자연 영상 + 명확한 영어 내레이션', emoji: '🌍', url: 'https://www.youtube.com/@NatGeo' },
    { title: 'BBC Earth', desc: '데이비드 애튼버러 목소리로 듣는 자연 다큐', emoji: '🐋', url: 'https://www.youtube.com/@BBCEarth' },
  ],
  animal: [
    { title: 'Dodo', desc: '동물 구조·힐링 스토리. 짧고 감동적인 영상이에요.', emoji: '🐾', url: 'https://www.youtube.com/@TheDodoSite' },
    { title: 'AnimalWised', desc: '반려동물 관리 팁을 쉬운 영어로 알려줘요.', emoji: '🐕', url: 'https://www.youtube.com/@AnimalWised' },
  ],
  food: [
    { title: 'Joshua Weissman', desc: '레시피 설명 영어가 쉽고 유머러스해요.', emoji: '🍕', url: 'https://www.youtube.com/@JoshuaWeissman' },
    { title: 'Ethan Chlebowski', desc: '요리 과학을 명확한 영어로 설명해줘요.', emoji: '🥗', url: 'https://www.youtube.com/@EthanChlebowski' },
  ],
  travel: [
    { title: 'Mark Wiens', desc: '세계 거리 음식·여행. 자연스러운 영어 표현이 많아요.', emoji: '🌮', url: 'https://www.youtube.com/@MarkWiens' },
    { title: 'Lost LeBlancs', desc: '부부 여행 브이로그. 일상 영어 표현 연습에 좋아요.', emoji: '🏝️', url: 'https://www.youtube.com/@LostLeBlancs' },
  ],
  daily: [
    { title: 'Nathaniel Drew', desc: '일상·자기계발을 감성적으로 담은 채널.', emoji: '📓', url: 'https://www.youtube.com/@nathanieldrew' },
    { title: 'Matt D\'Avella', desc: '미니멀 라이프·습관 관련 감성 영상.', emoji: '🪴', url: 'https://www.youtube.com/@mattdavella' },
  ],
  culture: [
    { title: 'TED', desc: '18분 이하 강연. 자막 있고 발음 명확해서 듣기 최적.', emoji: '💡', url: 'https://www.youtube.com/@TED' },
    { title: 'Vox', desc: '사회·문화 이슈를 시각적으로 설명해줘요.', emoji: '🎞️', url: 'https://www.youtube.com/@Vox' },
  ],
};

const BOOKS_SMALL = {
  nature: { title: 'Braiding Sweetgrass', author: 'Robin Wall Kimmerer', tip: '자연을 감각적으로 묘사하는 영어 표현의 교과서 같은 책이에요.' },
  animal: { title: 'The Travelling Cat Chronicles', author: 'Hiro Arikawa', tip: '고양이와 함께하는 여행 이야기. 감성 영어 표현이 가득해요.' },
  food: { title: 'Salt, Fat, Acid, Heat', author: 'Samin Nosrat', tip: '맛·향·질감을 표현하는 영어를 자연스럽게 익힐 수 있어요.' },
  travel: { title: 'The Alchemist', author: 'Paulo Coelho', tip: '짧고 명확한 문장. 영어 초급자도 부담 없이 읽을 수 있어요.' },
  daily: { title: 'The Year of Magical Thinking', author: 'Joan Didion', tip: '일상의 감정을 세밀하게 표현하는 법을 배울 수 있어요.' },
  culture: { title: 'The Goldfinch', author: 'Donna Tartt', tip: '예술·문화 관련 풍부한 어휘를 만날 수 있어요.' },
};

function inferMainInterest(records, interests) {
  if (!records || records.length < 2) return interests?.[0] || 'daily';
  const kw = {
    nature: ['산책','숲','나무','꽃','공원','바람','walk','forest','tree','nature','moss'],
    animal: ['고양이','강아지','동물','새','cat','dog','animal','bird','pet'],
    food: ['음식','요리','카페','커피','밥','맛','food','cook','coffee','eat','taste'],
    travel: ['여행','방문','도시','거리','travel','visit','city','trip','street'],
    culture: ['전시','영화','음악','미술','공연','art','movie','music','museum'],
    daily: ['일상','오늘','아침','저녁','집','daily','morning','home','today'],
  };
  const allText = records.map(r => `${r.koreanText||''} ${r.englishText||''}`).join(' ').toLowerCase();
  const scores = Object.entries(kw).map(([t, ws]) => [t, ws.filter(w => allText.includes(w)).length]);
  scores.sort((a, b) => b[1] - a[1]);
  return scores[0][1] > 0 ? scores[0][0] : (interests?.[0] || 'daily');
}

export default function BooksScreen({ onNavigate }) {
  const records = loadRecords();
  const profile = loadOnboarding();
  const interest = inferMainInterest(records, profile?.interests);

  const podcasts = PODCASTS[interest] || PODCASTS.daily;
  const videos = YOUTUBE[interest] || YOUTUBE.daily;
  const book = BOOKS_SMALL[interest] || BOOKS_SMALL.daily;

  const [article, setArticle] = useState(null);
  const [articleLoading, setArticleLoading] = useState(true);
  const [speakingArticle, setSpeakingArticle] = useState(false);
  const audioRef = useState(null);

  const interestLabel = {
    nature:'🌿 자연·산책', animal:'🐾 동물', food:'🍳 음식·요리',
    travel:'✈️ 여행', daily:'☕ 일상', culture:'🎨 문화·예술',
  }[interest] || '☕ 일상';

  useEffect(() => {
    fetchArticle();
  }, []);

  const fetchArticle = async () => {
    setArticleLoading(true);
    try {
      const resp = await fetch(`/api/news?interests=${interest}`);
      const data = await resp.json();
      const a = data.articles?.[0];
      if (a) setArticle({ title: a.title?.replace(/ - .*$/, ''), body: a.description, url: a.url, source: a.source });
    } catch {}
    setArticleLoading(false);
  };

  const speakArticle = async () => {
    if (speakingArticle) {
      audioRef[0]?.pause();
      setSpeakingArticle(false);
      return;
    }
    if (!article) return;
    setSpeakingArticle(true);
    try {
      const text = `${article.title}. ${article.body || ''}`.slice(0, 500);
      const resp = await fetch('/api/tts', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef[0] = audio;
      audio.onended = () => { setSpeakingArticle(false); URL.revokeObjectURL(url); };
      audio.onerror = () => setSpeakingArticle(false);
      await audio.play();
    } catch { setSpeakingArticle(false); }
  };

  return (
    <div className="tab-content px-4 pt-4 pb-24 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">미디어</h2>
        <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: '#edf5e4', color: '#4a8a20' }}>
          {interestLabel} 기반
        </span>
      </div>

      {/* 오늘의 짧은 글 */}
      <section>
        <p className="text-white text-sm font-bold mb-2">📰 오늘의 짧은 글</p>
        <div className="p-4 rounded-2xl space-y-3" style={{ background: '#faf8f3', border: '1px solid #ede9e2', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          {articleLoading ? (
            <div className="space-y-2">
              <div className="h-4 rounded-full animate-pulse" style={{ background: '#f0ece4', width: '80%' }} />
              <div className="h-3 rounded-full animate-pulse" style={{ background: '#f0ece4', width: '100%' }} />
              <div className="h-3 rounded-full animate-pulse" style={{ background: '#f0ece4', width: '90%' }} />
            </div>
          ) : article ? (
            <>
              <p className="text-white text-sm font-semibold leading-tight">{article.title}</p>
              <p className="text-[#7a7268] text-xs leading-relaxed">{article.body?.slice(0, 200)}{article.body?.length > 200 ? '...' : ''}</p>
              <div className="flex items-center gap-2 pt-1">
                <button onClick={speakArticle}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold transition-all active:scale-95"
                  style={{ background: speakingArticle ? '#edf5e4' : '#f0f7e8', color: '#4a8a20', border: '1.5px solid #c8e8a0' }}>
                  {speakingArticle ? '⏹ 멈추기' : '▶ 원어민 발음 듣기'}
                </button>
                {article.url && (
                  <a href={article.url} target="_blank" rel="noopener noreferrer"
                    className="px-3 py-2 rounded-2xl text-xs font-semibold"
                    style={{ background: '#f0ece4', color: '#7a7268', border: '1px solid #e0dbd2' }}>
                    원문 →
                  </a>
                )}
              </div>
            </>
          ) : (
            <p className="text-[#b0a898] text-xs">글을 불러오지 못했어요.</p>
          )}
        </div>
      </section>

      {/* 팟캐스트 추천 */}
      <section>
        <p className="text-white text-sm font-bold mb-2">🎧 팟캐스트 추천</p>
        <div className="space-y-2">
          {podcasts.map((p, i) => (
            <div key={i} className="p-3 rounded-2xl flex items-center gap-3" style={{ background: '#faf8f3', border: '1px solid #ede9e2' }}>
              <span className="text-2xl flex-shrink-0">{p.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{p.title}</p>
                <p className="text-[#9a9088] text-xs leading-snug mt-0.5">{p.desc}</p>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <a href={p.spotify} target="_blank" rel="noopener noreferrer"
                  className="px-2 py-1 rounded-lg text-[10px] font-bold text-center"
                  style={{ background: '#1DB954', color: 'white' }}>Spotify</a>
                <a href={p.apple} target="_blank" rel="noopener noreferrer"
                  className="px-2 py-1 rounded-lg text-[10px] font-bold text-center"
                  style={{ background: '#fc3c44', color: 'white' }}>Apple</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 유튜브 추천 */}
      <section>
        <p className="text-white text-sm font-bold mb-2">📺 유튜브 추천</p>
        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {videos.map((v, i) => (
            <a key={i} href={v.url} target="_blank" rel="noopener noreferrer"
              className="flex-shrink-0 w-40 p-3 rounded-2xl space-y-1.5 active:scale-95 transition-all"
              style={{ background: '#faf8f3', border: '1px solid #ede9e2', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div className="w-full h-20 rounded-xl flex items-center justify-center text-4xl"
                style={{ background: '#f0ece4' }}>
                {v.emoji}
              </div>
              <p className="text-white text-xs font-bold leading-tight">{v.title}</p>
              <p className="text-[#9a9088] text-[10px] leading-snug">{v.desc}</p>
              <p className="text-[#ff4444] text-[10px] font-semibold">▶ YouTube →</p>
            </a>
          ))}
        </div>
      </section>

      {/* 책 한 줄 */}
      <section>
        <p className="text-white text-sm font-bold mb-2">📚 이런 책은 어때요?</p>
        <div className="p-3 rounded-2xl flex items-center gap-3" style={{ background: '#faf8f3', border: '1px solid #ede9e2' }}>
          <span className="text-3xl">📖</span>
          <div>
            <p className="text-white text-sm font-semibold">{book.title}</p>
            <p className="text-[#9a9088] text-[11px]">{book.author}</p>
            <p className="text-[#7a7268] text-xs mt-1 leading-snug">{book.tip}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
