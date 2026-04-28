export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-neutral-900 dark:text-neutral-100">
      <h1 className="text-3xl font-semibold tracking-tight">Politika privatnosti</h1>

      <div className="mt-8 space-y-7 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Uvod</h2>
          <p className="mt-2">
            Ova politika privatnosti objašnjava kako SkinIntel prikuplja i koristi podatke
            unesene tijekom analize kože. Usluga služi za edukativnu kozmetičku analizu i ne
            koristi se u medicinske svrhe.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Koje podatke prikupljamo
          </h2>
          <p className="mt-2">
            Možemo prikupljati fotografije kože, opis stanja kože, simptome koje korisnik unese
            te popis sastojaka ili proizvoda koje korisnik navede.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Kako koristimo podatke
          </h2>
          <p className="mt-2">
            Podaci se koriste isključivo za analizu kože i prikaz personaliziranih kozmetičkih
            preporuka. Slike se obrađuju za AI analizu i ne koriste se za medicinsku dijagnozu.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Pohrana podataka
          </h2>
          <p className="mt-2">
            Rezultati analize mogu se pohraniti lokalno na korisnikovom uređaju radi kasnijeg
            pregleda. SkinIntel ne tvrdi da pruža trajnu pohranu medicinskih ili zdravstvenih
            podataka.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Prava korisnika
          </h2>
          <p className="mt-2">
            Korisnik može zatražiti informacije o obradi podataka ili brisanje podataka slanjem
            zahtjeva na privacy@skinintel.ai.
          </p>
        </section>
      </div>
    </main>
  );
}
