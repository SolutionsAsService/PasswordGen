'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  classify,
  crackTime,
  generatePassphrase,
  generatePassword,
  rating,
  WORDS,
  type Generated,
} from '@/lib/password';
import styles from './Generator.module.css';

type Mode = 'password' | 'passphrase';
type Theme = 'dark' | 'light';

const SEPARATORS: { value: string; label: string }[] = [
  { value: '-', label: 'hyphen' },
  { value: ' ', label: 'space' },
  { value: '.', label: 'dot' },
  { value: '_', label: 'underscore' },
  { value: '', label: 'none' },
];

export default function Generator() {
  const [mode, setMode] = useState<Mode>('password');

  const [length, setLength] = useState(20);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [digit, setDigit] = useState(true);
  const [symbol, setSymbol] = useState(true);
  const [noAmbiguous, setNoAmbiguous] = useState(false);
  const [noAdjacent, setNoAdjacent] = useState(false);

  const [words, setWords] = useState(6);
  const [separator, setSeparator] = useState('-');
  const [capitalize, setCapitalize] = useState(false);
  const [addNumber, setAddNumber] = useState(false);

  const [result, setResult] = useState<Generated | null>(null);
  const [error, setError] = useState('');
  const [nonce, setNonce] = useState(0);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');

  /* Generation happens after mount, never during render: a password drawn on
     the server and one drawn in the browser would not match, and React would
     report a hydration error. The visitor's first password is therefore drawn
     by their own browser from their own CSPRNG. */
  useEffect(() => {
    try {
      const next =
        mode === 'password'
          ? generatePassword({ lower, upper, digit, symbol, noAmbiguous, noAdjacent, length })
          : generatePassphrase({ words, separator, capitalize, addNumber });
      setResult(next);
      setError('');
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : 'Could not generate.');
    }
  }, [
    mode, length, lower, upper, digit, symbol, noAmbiguous, noAdjacent,
    words, separator, capitalize, addNumber, nonce,
  ]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') setTheme(saved);
      else if (window.matchMedia?.('(prefers-color-scheme: light)').matches) setTheme('light');
    } catch {
      /* private mode: keep the default */
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('theme', next);
      } catch {
        /* private mode: the choice just will not persist */
      }
      return next;
    });
  }, []);

  const copy = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setError('Your browser blocked clipboard access — select the text and copy it.');
    }
  }, [result]);

  const bits = result?.bits ?? 0;
  const level = rating(bits).toLowerCase();

  return (
    <div className={styles.card}>
      <div className={styles.modes} role="tablist" aria-label="Generator mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'password'}
          className={`${styles.mode} ${mode === 'password' ? styles.modeActive : ''}`}
          onClick={() => setMode('password')}
        >
          Password
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'passphrase'}
          className={`${styles.mode} ${mode === 'passphrase' ? styles.modeActive : ''}`}
          onClick={() => setMode('passphrase')}
        >
          Passphrase
        </button>
      </div>

      <div className={styles.output}>
        <output className={styles.outputText} aria-live="polite">
          {result ? (
            result.text.split('').map((c, i) => (
              <span key={i} className={styles[`c-${classify(c)}`]}>
                {c}
              </span>
            ))
          ) : (
            <span className={styles.placeholder}>generating&hellip;</span>
          )}
        </output>
        <div className={styles.outputActions}>
          <button type="button" className={styles.btn} onClick={copy}>
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={() => setNonce((n) => n + 1)}
            aria-label="Generate another"
          >
            &#8635;
          </button>
        </div>
      </div>

      <div className={styles.meter}>
        <div className={styles.meterHead}>
          <span className={styles.bits}>{result ? `${bits.toFixed(1)} bits` : '—'}</span>
          <span className={styles.rating} data-level={result ? level : 'none'}>
            {result ? rating(bits) : '—'}
          </span>
        </div>
        <div className={styles.meterTrack}>
          <div
            className={styles.meterFill}
            style={{ width: `${Math.min(100, (bits / 128) * 100)}%` }}
          />
        </div>
        <p className={styles.hint}>
          {result
            ? `${crackTime(bits)} at an assumed 10¹⁰ guesses/second offline${
                result.degraded ? ' · adjacency rule relaxed to fit the length' : ''
              }`
            : ''}
        </p>
      </div>

      {mode === 'password' ? (
        <div className={styles.controls}>
          <div className={styles.field}>
            <div className={styles.fieldHead}>
              <label htmlFor="length">Length</label>
              <output className={styles.val}>{length}</output>
            </div>
            <input
              id="length"
              type="range"
              min={8}
              max={64}
              step={1}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
            />
          </div>

          <div className={styles.toggles}>
            <Toggle checked={lower} onChange={setLower} label="Lowercase" hint="a–z" />
            <Toggle checked={upper} onChange={setUpper} label="Uppercase" hint="A–Z" />
            <Toggle checked={digit} onChange={setDigit} label="Digits" hint="0–9" />
            <Toggle checked={symbol} onChange={setSymbol} label="Symbols" hint="!@#$" />
            <Toggle
              checked={noAmbiguous}
              onChange={setNoAmbiguous}
              label="No look-alikes"
              hint="0 O l 1"
            />
            <Toggle
              checked={noAdjacent}
              onChange={setNoAdjacent}
              label="No adjacent repeats"
              hint="aa, 11"
            />
          </div>
        </div>
      ) : (
        <div className={styles.controls}>
          <div className={styles.field}>
            <div className={styles.fieldHead}>
              <label htmlFor="words">Words</label>
              <output className={styles.val}>{words}</output>
            </div>
            <input
              id="words"
              type="range"
              min={3}
              max={12}
              step={1}
              value={words}
              onChange={(e) => setWords(Number(e.target.value))}
            />
          </div>

          <div className={styles.field}>
            <div className={styles.fieldHead}>
              <label htmlFor="separator">Separator</label>
            </div>
            <select
              id="separator"
              className={styles.select}
              value={separator}
              onChange={(e) => setSeparator(e.target.value)}
            >
              {SEPARATORS.map((s) => (
                <option key={s.label} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.toggles}>
            <Toggle checked={capitalize} onChange={setCapitalize} label="Capitalize words" />
            <Toggle checked={addNumber} onChange={setAddNumber} label="Append a number" />
          </div>

          <p className={styles.hint}>
            Drawn from a list of {WORDS.length} words, so each word is worth{' '}
            {Math.log2(WORDS.length).toFixed(2)} bits. Capitalising every word adds none.
          </p>
        </div>
      )}

      <button
        type="button"
        className={`${styles.btn} ${styles.btnPrimary}`}
        onClick={() => setNonce((n) => n + 1)}
      >
        Generate
      </button>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <button type="button" className={styles.themeButton} onClick={toggleTheme}>
        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </button>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className={styles.toggle}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        {label} {hint ? <em>{hint}</em> : null}
      </span>
    </label>
  );
}
