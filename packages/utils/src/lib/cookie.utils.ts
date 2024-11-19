export class CookieUtils {
  static getValue(cookieName: string): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === cookieName) {
        return value;
      }
    }
    return null;
  }
}
