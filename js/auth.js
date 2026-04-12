/* ============================================================
   AUTH — Simple password protection for local use
   ============================================================
   To change your password, update the value below.
   ============================================================ */

const SITE_PASSWORD = '0928';

const Auth = {

  SESSION_KEY: 'portfolio_auth',

  isLoggedIn() {
    return sessionStorage.getItem(this.SESSION_KEY) === 'true';
  },

  login(password) {
    if (password === SITE_PASSWORD) {
      sessionStorage.setItem(this.SESSION_KEY, 'true');
      return true;
    }
    return false;
  },

  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
    window.location.href = 'login.html';
  },

  /* Call this at the top of any protected page.
     If not logged in, redirects to login. */
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
    }
  }

};
