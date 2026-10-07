// The mark: the letter M held in four focus brackets, as if being measured.
const body = `<rect width="64" height="64" rx="15" fill="#14161c"/>
<rect x=".75" y=".75" width="62.5" height="62.5" rx="14.25" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="1.5"/>
<path d="M14 22V14H22M42 14H50V22M50 42V50H42M22 50H14V42" fill="none" stroke="#5b8cff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M21 42V23L32 36L43 23V42" fill="none" stroke="#f5f4f0" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;

export const markSvg = (size = 34) => `<svg class="mark" viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">${body}</svg>`;
export const faviconSvg = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${body}</svg>\n`;
