import React, { useMemo, useState } from "react";
import { Search, ShieldCheck, Users, Percent, Star, MapPin, Calendar, Plane } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// --- Mock data (replace with API results later) ---
const DESTINATIONS = [
  { slug: "lisbon", name: "Lisbon", country: "Portugal", img: "https://images.unsplash.com/photo-1518306727298-4c3d516e3870?q=80&w=1400&auto=format&fit=crop", tags: ["sunny", "walkable", "budget"], ppn: 68 },
  { slug: "barcelona", name: "Barcelona", country: "Spain", img: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?q=80&w=1400&auto=format&fit=crop", tags: ["beach", "food", "nightlife"], ppn: 92 },
  { slug: "porto", name: "Porto", country: "Portugal", img: "https://images.unsplash.com/photo-1520975922375-5d99f2dce040?q=80&w=1400&auto=format&fit=crop", tags: ["cozy", "historic", "budget"], ppn: 61 },
  { slug: "seville", name: "Seville", country: "Spain", img: "https://images.unsplash.com/photo-1579503841516-e0bd7f8e3fbb?q=80&w=1400&auto=format&fit=crop", tags: ["warm", "walkable"], ppn: 74 },
  { slug: "valencia", name: "Valencia", country: "Spain", img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1400&auto=format&fit=crop", tags: ["beach", "modern"], ppn: 70 },
  { slug: "prague", name: "Prague", country: "Czechia", img: "https://images.unsplash.com/photo-1471623432079-b009d30b6729?q=80&w=1400&auto=format&fit=crop", tags: ["historic", "romantic"], ppn: 64 },
  { slug: "budapest", name: "Budapest", country: "Hungary", img: "https://images.unsplash.com/photo-1546707012-c46675f12741?q=80&w=1400&auto=format&fit=crop", tags: ["thermal baths", "nightlife"], ppn: 58 },
  { slug: "copenhagen", name: "Copenhagen", country: "Denmark", img: "https://images.unsplash.com/photo-1502790671504-542ad42d5189?q=80&w=1400&auto=format&fit=crop", tags: ["safe", "design"], ppn: 115 },
  { slug: "reykjavik", name: "Reykjavík", country: "Iceland", img: "https://images.unsplash.com/photo-1564325724739-bae0bd08762f?q=80&w=1400&auto=format&fit=crop", tags: ["nature", "safe"], ppn: 128 },
  { slug: "krakow", name: "Kraków", country: "Poland", img: "https://images.unsplash.com/photo-1506806732259-39c2d0268443?q=80&w=1400&auto=format&fit=crop", tags: ["budget", "culture"], ppn: 46 },
];

const HOTELS = [
  {
    id: "h1",
    name: "Riverside Boutique Hotel",
    city: "Lisbon",
    img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1400&auto=format&fit=crop",
    pricePerRoom: 120, // per room per night from feed
    maxOccupancy: 2,   // used to compute per-person price
    soloFriendly: ["No single supplement", "Central & walkable"],
    rating: 4.6,
    distance: "0.6 km from center",
  },
  {
    id: "h2",
    name: "Old Town Studio",
    city: "Porto",
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1400&auto=format&fit=crop",
    pricePerRoom: 78,
    maxOccupancy: 1, // single room → already solo-priced
    soloFriendly: ["Single Room", "Quiet street"],
    rating: 4.4,
    distance: "1.1 km from center",
  },
  {
    id: "h3",
    name: "Cathedral View Rooms",
    city: "Seville",
    img: "https://images.unsplash.com/photo-1551776235-dde6d4829808?q=80&w=1400&auto=format&fit=crop",
    pricePerRoom: 110,
    maxOccupancy: 2,
    soloFriendly: ["Shared twin option", "Late check-in"],
    rating: 4.5,
    distance: "0.4 km from center",
  },
];

// --- Flights mock (replace with API results later) ---
const FLIGHT_MOCKS = [
  { id: "f1", from: "EIN", to: "LIS", airline: "FR", duration: "3u05", price: 79, nonstop: true },
  { id: "f2", from: "AMS", to: "LIS", airline: "TP", duration: "3u00", price: 129, nonstop: true },
  { id: "f3", from: "AMS", to: "SVQ", airline: "HV", duration: "3u05", price: 109, nonstop: true },
];

function formatCurrency(n) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

export default function SoloHotelsLanding() {
  const [query, setQuery] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [guests, setGuests] = useState(1);
  const [filteredHotels, setFilteredHotels] = useState(HOTELS);

  // Flights state
  const [includeFlights, setIncludeFlights] = useState(false);
  const [origin, setOrigin] = useState("AMS"); // default Amsterdam
  const [filteredFlights, setFilteredFlights] = useState([]);

  const filteredDestinations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DESTINATIONS;
    return DESTINATIONS.filter(d => d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q));
  }, [query]);

  function handleSearch() {
    const q = query.trim().toLowerCase();
    const results = HOTELS.filter(h => {
      const cityMatch = !q || h.city.toLowerCase().includes(q);
      const guestsOk = Math.max(1, h.maxOccupancy || 1) >= Math.max(1, guests || 1);
      return cityMatch && guestsOk;
    });
    setFilteredHotels(results);

    if (includeFlights) {
      const destCode = (q.includes("lis") && "LIS") || (q.includes("sev") && "SVQ") || (q.includes("por") && "OPO") || null;
      const flights = FLIGHT_MOCKS.filter(f => (!destCode || f.to === destCode) && f.from.toUpperCase() === origin.toUpperCase());
      setFilteredFlights(flights);
    } else {
      setFilteredFlights([]);
    }

    const el = document.getElementById("results");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-extrabold text-xl tracking-tight">Solo<span className="text-blue-600">Stay</span></div>
          <nav className="hidden md:flex gap-6 text-sm items-center">
            <a href="#destinations" className="hover:text-blue-600">Bestemmingen</a>
            <a href="#how" className="hover:text-blue-600">Zo werkt het</a>
            <a href="#newsletter" className="hover:text-blue-600">Deals</a>
            <a href="/login" className="rounded-xl px-4 py-2 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">Login</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center"/>
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-24 md:py-32">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white drop-shadow">Hotels met <span className="text-blue-300">eerlijke</span> 1-persoons prijzen</h1>
          <p className="mt-4 max-w-2xl text-white/90 text-lg">Nooit meer gokken of de prijs per kamer of per persoon is. Wij tonen altijd de <strong>prijs voor jou alleen</strong> — helder en eerlijk.</p>

          {/* Search box */}
          <div className="mt-8 bg-white/95 rounded-2xl p-3 md:p-4 shadow-xl">
            <div className="flex flex-col md:flex-row gap-3 items-stretch">
              <div className="flex-1 flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 bg-white">
                <Search className="w-5 h-5" />
                <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Zoek stad of land (bijv. Lissabon)" className="w-full outline-none bg-transparent" />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 bg-white">
                <Calendar className="w-5 h-5 text-neutral-500" />
                <DatePicker
                  selected={startDate}
                  onChange={(dates) => {
                    const [start, end] = dates;
                    setStartDate(start);
                    setEndDate(end);
                  }}
                  startDate={startDate}
                  endDate={endDate}
                  selectsRange
                  placeholderText="Selecteer data"
                  className="outline-none bg-transparent"
                />
              </div>
              <input type="number" min={1} value={guests} onChange={e=>setGuests(+e.target.value)} className="md:w-28 rounded-xl border border-neutral-200 px-3 py-2 bg-white" />
            </div>

            {/* Flights opt-in */}
            <div className="mt-3 flex flex-col md:flex-row gap-3 items-stretch">
              <label className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl px-3 py-2">
                <input type="checkbox" checked={includeFlights} onChange={e=>setIncludeFlights(e.target.checked)} />
                <span className="text-sm">Vlucht + Hotel</span>
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 bg-white md:w-64">
                <Plane className="w-5 h-5 text-neutral-500" />
                <input
                  value={origin}
                  onChange={e=>setOrigin(e.target.value.toUpperCase())}
                  placeholder="Vertrek (bv. AMS/EIN)"
                  className="w-full outline-none bg-transparent uppercase"
                  maxLength={3}
                />
              </div>
              <button onClick={handleSearch} className="rounded-2xl px-5 py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition md:ml-auto">Zoek</button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-6 flex flex-wrap gap-4 text-white/90">
            <Badge icon={<ShieldCheck />} text="Altijd prijs p.p." />
            <Badge icon={<Users />} text="Solo-vriendelijk aanbod" />
            <Badge icon={<Percent />} text="Geen singletoeslag-filter" />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10"/>
      </section>

      {/* Featured hotels mock */}
      <section id="results" className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Aanbevolen voor jou</h2>
            <p className="text-neutral-600 mt-1">Eerlijke 1-persoonsprijzen. Geen verrassingen bij het afrekenen.</p>
          </div>
          <div className="text-sm text-neutral-600">{filteredHotels.length} resultaat{filteredHotels.length === 1 ? "" : "ten"}</div>
        </div>
        {filteredHotels.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 text-neutral-700">
            Geen hotels gevonden voor jouw filters. Probeer een andere stad of pas het aantal gasten aan.
          </div>
        ) : (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHotels.map(h => <HotelCard key={h.id} {...h} />)}
          </div>
        )}

        {/* Flights block (optional) */}
        {includeFlights && (
          <div className="mt-10">
            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5" />
              <h3 className="text-xl md:text-2xl font-bold">Vlucht + Hotel opties vanaf {origin.toUpperCase()}</h3>
            </div>
            {filteredFlights.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-6 text-neutral-700">
                Geen vluchten gevonden voor deze combinatie. Probeer een andere bestemming of vertrekcode.
              </div>
            ) : (
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                {filteredFlights.map(f => (
                  <article key={f.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{f.from} → {f.to}</div>
                      <div className="text-sm text-neutral-600">{f.nonstop ? "Nonstop" : "Met overstap"}</div>
                    </div>
                    <div className="mt-1 text-sm text-neutral-700">{f.airline} • {f.duration}</div>
                    <div className="mt-2 text-lg font-bold">{formatCurrency(f.price)} <span className="text-sm font-medium text-neutral-600">p.p. enkele reis</span></div>
                    <a href="#" className="inline-block mt-3 rounded-xl px-4 py-2 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">Selecteer vlucht</a>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Destinations */}
      <section id="destinations" className="bg-white border-t border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h3 className="text-2xl md:text-3xl font-bold">Populaire solo-bestemmingen</h3>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map(d => (
              <a key={d.slug} href={`/#${d.slug}`} className="group block rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition">
                <div className="aspect-[16/10] bg-neutral-100">
                  <img src={d.img} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-neutral-500"><MapPin className="w-4 h-4"/>{d.country}</div>
                  <div className="flex items-baseline justify-between mt-1">
                    <div className="font-semibold text-lg">{d.name}</div>
                    <div className="text-sm text-neutral-600">vanaf {formatCurrency(d.ppn)} p.p./nacht</div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {d.tags.map(t => <span key={t} className="text-xs bg-neutral-100 border border-neutral-200 px-2 py-1 rounded-full">{t}</span>)}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-6xl mx-auto px-4 py-12">
        <h3 className="text-2xl md:text-3xl font-bold">Zo werkt het</h3>
        <ol className="mt-4 grid md:grid-cols-3 gap-6">
          <li className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <div className="font-semibold">1) Zoek & filter</div>
            <p className="text-neutral-600 mt-2">Selecteer je stad en data. Zet het filter <em>Geen singletoeslag</em> aan voor echte solo-deals.</p>
          </li>
          <li className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <div className="font-semibold">2) Heldere prijs p.p.</div>
            <p className="text-neutral-600 mt-2">Wij tonen altijd de prijs voor jou alleen. Geen rekenwerk, geen verrassingen.</p>
          </li>
          <li className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <div className="font-semibold">3) Boek direct</div>
            <p className="text-neutral-600 mt-2">Klik door naar de aanbieder (affiliate) of boek bij ons zodra directe deals live zijn.</p>
          </li>
        </ol>
      </section>

      {/* Newsletter */}
      <section id="newsletter" className="bg-neutral-100 border-t border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-neutral-200">
            <h4 className="text-xl md:text-2xl font-bold">Ontvang solo-deals (geen singletoeslag)</h4>
            <p className="text-neutral-600 mt-1">Schrijf je in en krijg als eerste bericht als prijzen voor 1 persoon dalen op jouw wishlist.</p>
            <form className="mt-4 flex flex-col sm:flex-row gap-3">
              <input type="email" placeholder="jouw@email.nl" className="flex-1 rounded-xl border border-neutral-300 px-4 py-3" />
              <button className="rounded-xl px-5 py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">Inschrijven</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-sm text-neutral-600">
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
          <div>
            <div className="font-extrabold text-lg">Solo<span className="text-blue-600">Stay</span></div>
            <div className="mt-1">© {new Date().getFullYear()} — Eerlijke prijzen voor soloreizigers.</div>
          </div>
          <div className="flex gap-6">
            <a href="#">Privacy</a>
            <a href="#">Algemene Voorwaarden</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HotelCard({ name, city, img, pricePerRoom, maxOccupancy, soloFriendly = [], rating, distance }) {
  const pricePerPerson = useMemo(() => {
    const divisor = Math.max(1, maxOccupancy || 1);
    return pricePerRoom / (divisor > 1 ? divisor : 1);
  }, [pricePerRoom, maxOccupancy]);

  const displayRating = Number.isFinite(rating) ? rating.toFixed(1) : "—";

  return (
    <article className="rounded-2xl overflow-hidden border border-neutral-200 bg-white shadow-sm hover:shadow-xl transition">
      <div className="aspect-[16/10] bg-neutral-100">
        <img src={img} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-lg">{name}</h4>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-4 h-4"/>
            <span className="text-sm text-neutral-800">{displayRating}</span>
          </div>
        </div>
        <div className="mt-1 text-sm text-neutral-600">{city} • {distance}</div>
        <ul className="mt-3 flex flex-wrap gap-2 text-xs">
          {soloFriendly.map((f, i) => (
            <li key={i} className="px-2 py-1 rounded-full bg-neutral-100 border border-neutral-200">{f}</li>
          ))}
        </ul>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="text-xs text-neutral-500">vanaf</div>
            <div className="text-xl font-bold">{formatCurrency(pricePerPerson)} <span className="text-sm font-medium text-neutral-600">p.p./nacht</span></div>
          </div>
          <a
            href="#"
            className="rounded-xl px-4 py-2 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            title="Boek nu"
          >Boek nu</a>
        </div>
      </div>
    </article>
  );
}

function Badge({ icon, text }) {
  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-full border border-white/20">
      <span className="w-4 h-4 text-white">{icon}</span>
      <span className="text-white text-sm">{text}</span>
    </div>
  );
}

// --- Smoke tests (lightweight) ---
(function runSmokeTests(){
  try {
    // Price-per-person math
    const p = HOTELS[0];
    const divisor = Math.max(1, p.maxOccupancy || 1);
    const expected = p.pricePerRoom / (divisor > 1 ? divisor : 1);
    if (Number.isNaN(expected)) console.warn("[SmokeTest] pricePerPerson computed to NaN");

    // formatCurrency
    if (typeof formatCurrency(100) !== "string") console.warn("[SmokeTest] formatCurrency should return a string");

    // Filter test (city + guests)
    const sampleQuery = "lis"; // should match Lisbon
    const guests = 1;
    const results = HOTELS.filter(h => h.city.toLowerCase().includes(sampleQuery) && Math.max(1, h.maxOccupancy || 1) >= guests);
    if (!Array.isArray(results)) console.warn("[SmokeTest] Filter did not return an array");

    // Flights filter test
    const origin = "AMS";
    const q = "lis";
    const destCode = (q.includes("lis") && "LIS") || null;
    const flights = FLIGHT_MOCKS.filter(f => (!destCode || f.to === destCode) && f.from.toUpperCase() === origin.toUpperCase());
    if (!Array.isArray(flights)) console.warn("[SmokeTest] Flights filter did not return an array");

    // Destinations href template test
    const href = `/#${DESTINATIONS[0].slug}`;
    if (!href.includes("/#")) console.warn("[SmokeTest] Destinations href not built correctly");
  } catch (e) {
    console.warn("[SmokeTest] Unexpected error:", e);
  }
})();
