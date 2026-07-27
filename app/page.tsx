import { getPublicSupporters, recognitionLevels } from "@/lib/givebutter";

const GIVE_URL = "https://givebutter.com/estherfundsfoundation";

export default async function Home() {
  const supporters = await getPublicSupporters();

  return (
    <main>
      <header className="nav">
        <a className="brand" href="https://www.estherfundsfoundation.org">
          EFF <span>DONOR WALL</span>
        </a>
        <a className="give" href={GIVE_URL}>
          Make a Gift
        </a>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">ESTHER FUNDS FOUNDATION PRESENTS</p>
          <h1>
            Every gift writes
            <br />
            <em>a brighter future.</em>
          </h1>
          <p className="lede">
            A living celebration of the individuals, families, businesses, and
            organizations helping students move forward.
          </p>
          <a className="primary" href={GIVE_URL}>
            Give &amp; join the wall
          </a>
        </div>
        <div className="hero-badge" aria-hidden="true">
          <span>EVERY FUTURE</span>
          <strong>FULFILLED</strong>
          <span>ESTHER FUNDS FOUNDATION</span>
        </div>
      </section>

      <section className="wall" aria-labelledby="wall-title">
        <p className="eyebrow">OUR COMMUNITY OF BELIEVERS</p>
        <h2 id="wall-title">The EFF Donor Wall</h2>
        <p className="intro">
          This wall updates from Givebutter and recognizes only donors who
          choose public acknowledgment. Gift amounts and private contact
          details are never displayed.
        </p>

        <div className="grid" aria-live="polite">
          {supporters.map((supporter) => (
            <article className="card" key={supporter.id}>
              <span className="mark" aria-hidden="true">
                ✦
              </span>
              <p className="tier">{supporter.tier}</p>
              <h3>{supporter.name}</h3>
              <p>{supporter.recognitionType}</p>
            </article>
          ))}

          {supporters.length === 0 && (
            <article className="card empty">
              <span className="mark" aria-hidden="true">
                ✦
              </span>
              <p className="tier">THE WALL IS GROWING</p>
              <h3>Be among the first recognized.</h3>
              <p>
                Choose “Yes” to public recognition when you complete your gift.
              </p>
            </article>
          )}

          <article className="card invite">
            <p className="tier">YOUR NAME COULD BE HERE</p>
            <h3>Stand with students.</h3>
            <a href={GIVE_URL}>Give today →</a>
          </article>
        </div>
      </section>

      <section className="levels" aria-labelledby="levels-title">
        <p className="eyebrow">RECOGNITION LEVELS</p>
        <h2 id="levels-title">Every gift has a place of honor.</h2>
        <p className="intro">
          Your giving level is based on your total eligible support. The wall
          shows the level name—not your donation amount.
        </p>
        <div className="level-grid">
          {recognitionLevels.map((level) => (
            <article className="level" key={level.name}>
              <p>{level.range}</p>
              <h3>{level.name}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="recognition">
        <div>
          <p className="eyebrow">RECOGNITION WITH CONSENT</p>
          <h2>You choose how you are thanked.</h2>
        </div>
        <div>
          <p>
            During checkout, select <strong>“Yes”</strong> for “Let EFF add me
            to the donor wall.” You may use your name, a family name, business,
            or organization—or remain anonymous.
          </p>
          <p>
            Recognition can be updated or removed at any time. Business logos
            are added only after a separate review and approval.
          </p>
        </div>
      </section>

      <footer>
        <p>Every Future Fulfilled.</p>
        <a href="https://www.estherfundsfoundation.org">
          Esther Funds Foundation
        </a>
      </footer>
    </main>
  );
}
