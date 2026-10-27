import Generator from '@/components/Generator';

const NOTES = [
  {
    title: 'Unbiased selection',
    body: (
      <>
        Characters are drawn with rejection sampling over{' '}
        <code>crypto.getRandomValues</code>, so no character is favoured by modulo
        bias. Shuffles use the same method.
      </>
    ),
  },
  {
    title: 'Honest entropy',
    body: (
      <>
        The bits shown are counted from the options you picked — the number of
        strings that actually satisfy them — not estimated from a rule of thumb.
      </>
    ),
  },
  {
    title: 'Nothing leaves the page',
    body: (
      <>
        Generation runs in your browser from your own CSPRNG. There is no network
        request and no analytics; the only thing saved is your theme choice.
      </>
    ),
  },
  {
    title: 'Crack-time estimate',
    body: (
      <>
        Shown as an order of magnitude at an assumed 10¹⁰ guesses/second offline.
        Real time depends on how a site hashes your password, which this page
        cannot know.
      </>
    ),
  },
];

export default function Home() {
  return (
    <>
      <section className="wrap hero">
        <h1>
          Secure passwords,
          <br />
          generated on your device
        </h1>
        <p className="lede">
          Unbiased randomness from your browser&rsquo;s CSPRNG, with an entropy
          readout you can check instead of a vague strength label.
        </p>
      </section>

      <section className="wrap" id="generator">
        <Generator />
      </section>

      <section className="wrap notes">
        <h2>How it works</h2>
        <div className="noteGrid">
          {NOTES.map((note) => (
            <div key={note.title} className="note">
              <h3>{note.title}</h3>
              <p>{note.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
