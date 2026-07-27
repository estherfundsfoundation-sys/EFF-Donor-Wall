const supporters = [
  { name: "Kitan A.", tier: "Friend of EFF", note: "Investing in every future." },
  { name: "Eleanor Greene", tier: "Education Advocate", note: "Opening doors for students." },
];

export default function Home() {
  return (
    <main>
      <header className="nav">
        <a className="brand" href="https://www.estherfundsfoundation.org">EFF <span>DONOR WALL</span></a>
        <a className="give" href="https://givebutter.com/estherfundsfoundation">Make a Gift</a>
      </header>
      <section className="hero">
        <p className="eyebrow">ESTHER FUNDS FOUNDATION PRESENTS</p>
        <h1>Every gift writes<br/><em>a brighter future.</em></h1>
        <p className="lede">A living celebration of the individuals, families, businesses, and organizations helping students move forward.</p>
        <a className="primary" href="https://givebutter.com/estherfundsfoundation">Join the Wall</a>
      </section>
      <section className="wall" aria-labelledby="wall-title">
        <p className="eyebrow">OUR COMMUNITY OF BELIEVERS</p>
        <h2 id="wall-title">The EFF Donor Wall</h2>
        <p className="intro">We proudly recognize donors who chose public acknowledgment. Gift amounts and private contact details are never displayed.</p>
        <div className="grid">
          {supporters.map((supporter) => (
            <article className="card" key={supporter.name}>
              <span className="mark">✦</span>
              <p className="tier">{supporter.tier}</p>
              <h3>{supporter.name}</h3>
              <p>{supporter.note}</p>
            </article>
          ))}
          <article className="card invite">
            <p className="tier">YOUR NAME COULD BE HERE</p>
            <h3>Stand with students.</h3>
            <a href="https://givebutter.com/estherfundsfoundation">Give today →</a>
          </article>
        </div>
      </section>
      <section className="recognition">
        <div><p className="eyebrow">RECOGNITION WITH CONSENT</p><h2>You choose how you are thanked.</h2></div>
        <p>Donors may be listed by name, recognized as an organization, or remain anonymous. Business logos are reviewed before publication, and recognition can be updated or removed at any time.</p>
      </section>
      <footer><p>Every Future Fulfilled.</p><a href="https://www.estherfundsfoundation.org">Esther Funds Foundation</a></footer>
    </main>
  );
}
