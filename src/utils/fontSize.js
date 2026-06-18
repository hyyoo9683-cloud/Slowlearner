const KEY = 'slowrunner_fontsize';
export const FONT_SIZES = [
  { id: 'sm', label: '작게', value: '13px' },
  { id: 'md', label: '보통', value: '16px' },
  { id: 'lg', label: '크게', value: '19px' },
  { id: 'xl', label: '매우 크게', value: '22px' },
];

export function getFontSize() {
  return localStorage.getItem(KEY) || 'md';
}

export function setFontSize(id) {
  localStorage.setItem(KEY, id);
  applyFontSize(id);
}

export function applyFontSize(id) {
  const size = FONT_SIZES.find(f => f.id === id) || FONT_SIZES[1];
  // html의 font-size를 바꿔야 Tailwind rem 단위가 같이 커져요
  document.documentElement.style.fontSize = size.value;
}
