import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SecurePass — password & passphrase generator',
  description:
    'Generate cryptographically secure passwords and passphrases locally in your browser, with unbiased CSPRNG selection and an entropy readout you can check.',
  applicationName: 'SecurePass',
  authors: [{ name: 'SolutionsAsService' }],
  keywords: ['password generator', 'passphrase', 'CSPRNG', 'entropy', 'diceware'],
  robots: { index: true, follow: true },
};

/* Applied before first paint so the page never flashes the wrong theme. This is
   the one inline script on the site; it reads nothing but the visitor's own
   saved choice. */
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <a className="skip" href="#generator">
          Skip to the generator
        </a>

        <header className="masthead">
          <div className="brand">
            <span className="brandMark" aria-hidden="true">
              &#9670;
            </span>
            <span>SecurePass</span>
          </div>
        </header>

        <main>{children}</main>

        <footer className="footer">
          <div className="wrap">
            <p>SecurePass — runs locally in your browser. Nothing you generate leaves it.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
