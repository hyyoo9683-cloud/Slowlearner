const KEY = 'slowrunner_fontsize';
export const FONT_SIZES = [
  { id: 'sm', label: '작게', value: '14px' },
  { id: 'md', label: '보통', value: '16px' },
  { id: 'lg', label: '크게', value: '18px' },
  { id: 'xl', label: '매우 크게', value: '21px' },
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
  document.documentElement.style.setProperty('--app-font-size', size.value);
}
