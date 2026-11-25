/** サイト共通リンク・文言 */

export const APP_NAME = "空家サバイバル";

export const CONTACT_FORM_JA = "https://forms.gle/vBsaTrXa6ZQGHrfT8";
/** 日本語以外のときの問い合わせ先 */
export const CONTACT_FORM_EN = "https://harunakajima.com/";

export const OTHER_WORKS_URL = "https://harunakajima.com/";

/** GitHub Pages 公開版プライバシーポリシー */
export const PRIVACY_POLICY_URL =
  "https://harunaka726-coder.github.io/akiya-survival-privacy/";

export const PRIVACY_PATH = "/privacy";
export const HOW_TO_PLAY_PATH = "/how-to-play";
export const SETTINGS_PATH = "/settings";

export const COPYRIGHT = "© 2026 Haru Nakajima";

/** 日本語が候補に含まれる、またはページ言語が ja なら日本語フォーム */
export function contactUrlForLocale(locale?: string): string {
  const candidates: string[] = [];
  if (locale) candidates.push(locale);
  if (typeof document !== "undefined" && document.documentElement.lang) {
    candidates.push(document.documentElement.lang);
  }
  if (typeof navigator !== "undefined") {
    candidates.push(navigator.language, ...(navigator.languages ?? []));
  }
  if (candidates.length === 0) return CONTACT_FORM_JA;
  if (candidates.some((l) => l.toLowerCase().startsWith("ja"))) {
    return CONTACT_FORM_JA;
  }
  return CONTACT_FORM_EN;
}
