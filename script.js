/* SecurePass — SolutionsAsService
   Runs entirely in this document: no request, no storage but the theme choice,
   no analytics.

   Two things this file is careful about.

   1. Unbiased selection. `random % n` favours the low end of the range whenever
      n does not divide 2^32, which it never does. Every draw here uses rejection
      sampling over crypto.getRandomValues instead.

   2. Honest entropy. The bits shown are not `length * log2(pool)` guessed from a
      rule of thumb. They are log2 of the number of strings that actually satisfy
      the options you picked, counted by inclusion-exclusion (character-class
      constraints) and by exact dynamic programming (adjacent-repeat constraint).
      A constrained generator produces fewer strings than an unconstrained one,
      so the unconstrained figure would overstate the strength. */

(function () {
  'use strict';

  /* ------------------------------------------------------------ word list */

  /* Curated, not generated: short, common, unambiguous when spoken. The size is
     read at runtime and printed, so the entropy figure can never claim more than
     this list actually holds. */
  var WORD_SOURCE = 'apple orange lemon grape berry melon peach plum cherry mango banana olive onion carrot potato tomato pepper celery radish pumpkin walnut almond peanut coconut coffee sugar honey bread butter cheese muffin waffle pancake noodle rice lentil salmon tuna shrimp crab clam oyster lobster chicken turkey bacon ham steak roast stew curry basil thyme sage mint rosemary cinnamon vanilla cocoa caramel river ocean lagoon harbor canal stream brook creek delta bayou glacier canyon mesa plateau valley ridge cliff summit peak volcano island beach dune shore tide wave foam current drift fleet anchor sail mast deck cabin beacon compass forest grove meadow prairie tundra savanna jungle marsh swamp bog moss fern vine root trunk branch leaf bud seed cone acorn bark timber tiger lion bear wolf fox deer elk moose bison horse zebra camel otter beaver raccoon squirrel rabbit mouse mole hedgehog badger weasel ferret lynx puma jaguar leopard cheetah hyena eagle hawk falcon owl crow raven swan goose duck heron crane stork pelican gull tern puffin finch sparrow robin wren thrush lark dove pigeon parrot copper silver golden iron steel bronze marble granite quartz crystal amber ivory pearl ruby emerald topaz opal jasper slate basalt flint obsidian candle lantern torch mirror window curtain carpet pillow blanket quilt towel basket bucket bottle jug glass cup plate bowl spoon fork knife kettle hammer wrench pliers chisel drill screw nail bolt hinge latch knob lock key chain wire rope cable string thread needle button zipper pocket engine motor rotor piston valve gear belt pulley spring lever pedal crank shaft axle brake clutch throttle turbine planet star comet meteor orbit eclipse galaxy nebula atom proton neutron electron photon magnet winter summer autumn season frost snow sleet hail rain drizzle mist fog cloud storm thunder lightning breeze gale meadow garden orchard vineyard greenhouse attic cellar porch garage studio office market school library museum theater bridge tower tunnel road trail path lane square park bench fountain statue plaza motel hostel cabin villa cottage castle temple shrine abbey';

  var WORDS = (function () {
    var seen = {};
    var out = [];
    WORD_SOURCE.split(/\s+/).forEach(function (w) {
      if (w && !seen[w]) { seen[w] = 1; out.push(w); }
    });
    return out;
  })();

  /* --------------------------------------------------------- character sets */

  var SETS = {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    digit: '0123456789',
    symbol: '!@#$%^&*()-_=+[]{};:,.<>?/',
  };

  /* Characters readers confuse with each other. */
  var AMBIGUOUS = '0O1lI|';

  /* ------------------------------------------------------------ randomness */

  var buf = new Uint32Array(1);
  var UINT32 = 4294967296; // 2^32

  /* An integer in [0, n), uniform. Values at or above the largest multiple of n
     are discarded, so every survivor maps to exactly the same number of inputs. */
  function randomIntBelow(n) {
    if (!(n > 0)) throw new Error('randomIntBelow needs a positive bound');
    if (n === 1) return 0;
    var limit = UINT32 - (UINT32 % n);
    var v;
    do {
      crypto.getRandomValues(buf);
      v = buf[0];
    } while (v >= limit);
    return v % n;
  }

  function pick(list) {
    return list[randomIntBelow(list.length)];
  }

  /* Fisher-Yates, drawing j from the same unbiased source. */
  function shuffle(list) {
    for (var i = list.length - 1; i > 0; i--) {
      var j = randomIntBelow(i + 1);
      var t = list[i];
      list[i] = list[j];
      list[j] = t;
    }
    return list;
  }

  /* --------------------------------------------------------------- entropy */

  /* Number of length-L strings over an alphabet of size m, with or without the
     adjacent-repeat constraint. Plain count is m^L; with no two adjacent equal
     the first character is free and each later one has m-1 choices. */
  function sequences(m, L, noAdjacent) {
    if (m <= 0 || L <= 0) return 0;
    if (noAdjacent) {
      if (L === 1) return m;
      if (m < 2) return 0;
      return m * Math.pow(m - 1, L - 1);
    }
    return Math.pow(m, L);
  }

  /* Strings of length L over the pool that contain at least one character from
     every required class. Inclusion-exclusion over the required classes: start
     from every string, subtract those missing a class, add back those missing
     two, and so on. `sizes` are the class sizes, all disjoint subsets of pool. */
  function constrainedCount(poolSize, sizes, L, noAdjacent) {
    var total = 0;
    var k = sizes.length;
    for (var mask = 0; mask < (1 << k); mask++) {
      var removed = 0;
      var bits = 0;
      for (var i = 0; i < k; i++) {
        if (mask & (1 << i)) { removed += sizes[i]; bits++; }
      }
      var m = poolSize - removed;
      var term = sequences(m, L, noAdjacent);
      total += (bits % 2 === 0 ? 1 : -1) * term;
    }
    return total;
  }

  /* ------------------------------------------------------- password builder */

  function buildPool(opts) {
    var classes = [];
    ['lower', 'upper', 'digit', 'symbol'].forEach(function (name) {
      if (!opts[name]) return;
      var chars = SETS[name];
      if (opts.noAmbiguous) {
        chars = chars.split('').filter(function (c) {
          return AMBIGUOUS.indexOf(c) === -1;
        }).join('');
      }
      if (chars.length) classes.push({ name: name, chars: chars });
    });
    return classes;
  }

  function okString(chars, classes, noAdjacent) {
    var present = {};
    var prev = null;
    for (var i = 0; i < chars.length; i++) {
      var c = chars[i];
      if (noAdjacent && c === prev) return false;
      prev = c;
      for (var j = 0; j < classes.length; j++) {
        if (classes[j].chars.indexOf(c) !== -1) present[classes[j].name] = true;
      }
    }
    for (var n = 0; n < classes.length; n++) {
      if (!present[classes[n].name]) return false;
    }
    return true;
  }

  function draw(chars, L) {
    var out = [];
    for (var i = 0; i < L; i++) out.push(pick(chars));
    return out;
  }

  /* Uniform draw, then reject until the options hold. Rejection keeps every
     accepted string equally likely, which "pick one of each, then shuffle" does
     not: that construction over-weights strings heavy in the forced classes. */
  function generatePassword(opts) {
    var classes = buildPool(opts);
    if (!classes.length) throw new Error('Choose at least one character set.');

    var pool = classes.map(function (c) { return c.chars; }).join('').split('');
    var L = Math.max(opts.length, classes.length);
    if (opts.noAdjacent && pool.length < 2 && L > 1) {
      throw new Error('No adjacent repeats needs at least two characters to choose from.');
    }

    var sizes = classes.map(function (c) { return c.chars.length; });
    var attempts = 0;
    var chars = null;
    while (attempts < 500) {
      attempts++;
      var candidate = draw(pool, L);
      if (okString(candidate, classes, opts.noAdjacent)) { chars = candidate; break; }
    }

    /* The constraints can be unsatisfiable at small lengths; rather than return
       nothing, drop the adjacency rule and satisfy the character classes. */
    var degraded = false;
    if (!chars) {
      degraded = true;
      while (attempts < 1500) {
        attempts++;
        var c2 = draw(pool, L);
        if (okString(c2, classes, false)) { chars = c2; break; }
      }
    }
    if (!chars) {
      // Length equals the number of required classes: one from each is the only
      // shape that fits, and shuffling it is uniform over those arrangements.
      chars = classes.map(function (c) { return pick(c.chars.split('')); });
      shuffle(chars);
      degraded = true;
    }

    var noAdjacentEffective = opts.noAdjacent && !degraded;
    var count = constrainedCount(pool.length, sizes, chars.length, noAdjacentEffective);

    return {
      text: chars.join(''),
      bits: count > 0 ? Math.log2(count) : 0,
      poolSize: pool.length,
      degraded: degraded,
    };
  }

  /* ------------------------------------------------------ passphrase builder */

  function generatePassphrase(opts) {
    var chosen = [];
    for (var i = 0; i < opts.words; i++) chosen.push(pick(WORDS));

    var parts = chosen.map(function (w) {
      return opts.capitalize ? w.charAt(0).toUpperCase() + w.slice(1) : w;
    });
    var text = parts.join(opts.separator);
    if (opts.addNumber) text += String(randomIntBelow(10));

    /* Capitalising every word is a fixed transform and adds no uncertainty, so
       it is deliberately absent from this sum. */
    var bits = chosen.length * Math.log2(WORDS.length);
    if (opts.addNumber) bits += Math.log2(10);

    return {
      text: text,
      bits: bits,
      poolSize: WORDS.length,
      degraded: false,
    };
  }

  /* ------------------------------------------------------------ crack time */

  /* An order of magnitude, at an assumed 1e10 guesses/second offline. Worked in
     log space because 2^400 overflows a float. The real figure depends on how
     the site hashes your password, which this page cannot know. */
  function crackTime(bits) {
    var log10 = (bits - 1) * 0.3010299956639812 - 10;
    if (log10 < 0) return 'under a second';
    var units = [
      ['years', 7.4991],
      ['days', 4.9365],
      ['hours', 3.5563],
      ['minutes', 1.7782],
      ['seconds', 0],
    ];
    for (var i = 0; i < units.length; i++) {
      if (log10 >= units[i][1]) {
        var value = Math.pow(10, log10 - units[i][1]);
        var shown = value >= 100 ? value.toPrecision(2) : value.toFixed(value >= 10 ? 0 : 1);
        return 'about ' + shown + ' ' + units[i][0];
      }
    }
    return 'under a second';
  }

  function rating(bits) {
    if (bits < 45) return 'Weak';
    if (bits < 65) return 'Fair';
    if (bits < 80) return 'Strong';
    return 'Excellent';
  }

  /* ------------------------------------------------------------------- ui */

  var mode = 'password';
  var els = {};

  function $(id) { return document.getElementById(id); }

  function setMode(next) {
    mode = next;
    var isPassword = mode === 'password';
    els.modePassword.classList.toggle('is-active', isPassword);
    els.modePassphrase.classList.toggle('is-active', !isPassword);
    els.modePassword.setAttribute('aria-selected', isPassword ? 'true' : 'false');
    els.modePassphrase.setAttribute('aria-selected', isPassword ? 'false' : 'true');
    els.passwordControls.hidden = !isPassword;
    els.passphraseControls.hidden = isPassword;
    generate();
  }

  function showError(message) {
    if (!message) {
      els.error.hidden = true;
      els.error.textContent = '';
      return;
    }
    els.error.hidden = false;
    els.error.textContent = message;
  }

  /* Colour by class: a password is read once and typed once, and the eye finds
     a digit faster among letters when the digit is not the same colour. */
  function paintOutput(text) {
    els.output.textContent = '';
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      var cls = 'c-lower';
      if (SETS.digit.indexOf(c) !== -1) cls = 'c-digit';
      else if (SETS.symbol.indexOf(c) !== -1) cls = 'c-symbol';
      else if (SETS.upper.indexOf(c) !== -1) cls = 'c-upper';
      els.output.appendChild(Object.assign(document.createElement('span'), {
        className: cls,
        textContent: c,
      }));
    }
  }

  function generate() {
    showError('');
    try {
      var result;
      if (mode === 'password') {
        var length = parseInt(els.length.value, 10);
        result = generatePassword({
          lower: els.optLower.checked,
          upper: els.optUpper.checked,
          digit: els.optDigit.checked,
          symbol: els.optSymbol.checked,
          noAmbiguous: els.optNoAmbiguous.checked,
          noAdjacent: els.optNoRepeat.checked,
          length: length,
        });
      } else {
        result = generatePassphrase({
          words: parseInt(els.words.value, 10),
          separator: els.separator.value,
          capitalize: els.optCapitalize.checked,
          addNumber: els.optAddNumber.checked,
        });
      }

      paintOutput(result.text);
      els.output.dataset.value = result.text;

      var bits = result.bits;
      els.entropyBits.textContent = bits.toFixed(1) + ' bits';
      els.entropyLabel.textContent = rating(bits);
      els.entropyLabel.dataset.level = rating(bits).toLowerCase();
      els.entropyFill.style.width = Math.min(100, (bits / 128) * 100) + '%';
      els.crackTime.textContent = crackTime(bits) +
        ' at an assumed 10¹⁰ guesses/second offline' +
        (result.degraded ? ' · adjacency rule relaxed to fit the length' : '');
    } catch (err) {
      els.entropyBits.textContent = '—';
      els.entropyLabel.textContent = '—';
      els.crackTime.textContent = '';
      showError(err.message);
    }
  }

  function copy() {
    var text = els.output.dataset.value || '';
    if (!text) return;
    var done = function () {
      els.copyBtn.textContent = 'Copied';
      setTimeout(function () { els.copyBtn.textContent = 'Copy'; }, 1200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { /* no clipboard */ }
      document.body.removeChild(ta);
    }
  }

  function currentTheme() {
    var set = document.documentElement.getAttribute('data-theme');
    if (set === 'light' || set === 'dark') return set;
    var dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return dark ? 'dark' : 'light';
  }

  function initTheme() {
    function paint() {
      var theme = currentTheme();
      els.themeToggle.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
    }
    els.themeToggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
      paint();
    });
    paint();
  }

  function init() {
    ['output', 'copyBtn', 'regenBtn', 'generateBtn', 'entropyBits', 'entropyLabel',
     'entropyFill', 'crackTime', 'length', 'lengthOut', 'words', 'wordsOut',
     'separator', 'optLower', 'optUpper', 'optDigit', 'optSymbol',
     'optNoAmbiguous', 'optNoRepeat', 'optCapitalize', 'optAddNumber',
     'modePassword', 'modePassphrase', 'passwordControls', 'passphraseControls',
     'error', 'themeToggle'].forEach(function (id) {
      els[id] = $(id);
    });

    initTheme();

    els.generateBtn.addEventListener('click', generate);
    els.regenBtn.addEventListener('click', generate);
    els.copyBtn.addEventListener('click', copy);
    els.modePassword.addEventListener('click', function () { setMode('password'); });
    els.modePassphrase.addEventListener('click', function () { setMode('passphrase'); });

    els.length.addEventListener('input', function () {
      els.lengthOut.textContent = els.length.value;
      generate();
    });
    els.words.addEventListener('input', function () {
      els.wordsOut.textContent = els.words.value;
      generate();
    });
    els.separator.addEventListener('change', generate);

    ['optLower', 'optUpper', 'optDigit', 'optSymbol', 'optNoAmbiguous',
     'optNoRepeat', 'optCapitalize', 'optAddNumber'].forEach(function (id) {
      els[id].addEventListener('change', generate);
    });

    setMode('password');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
