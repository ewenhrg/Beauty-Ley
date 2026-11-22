import { salon } from "@/data/salon";
import { intlLocale } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { seoCopy } from "@/i18n/seo";
import { faqJsonLd, JsonLd } from "@/lib/seo";
import { Reveal } from "./Reveal";

/** Monday-first week, as most of our visitors read it. */
const WEEK = [1, 2, 3, 4, 5, 6, 0];

function weekdayName(intl: string, day: number) {
  // 2024-01-07 is a Sunday: add `day` to land on the wanted weekday.
  return new Intl.DateTimeFormat(intl, { weekday: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(2024, 0, 7 + day)),
  );
}

/**
 * Plain, local, crawlable text: who we are, where, when, and the questions people
 * ask before booking. This is what lets Google match the site to searches like
 * "beauty salon Hurghada" in each language.
 */
export async function LocalSeo() {
  const locale = await getLocale();
  const copy = seoCopy(locale);
  const intl = intlLocale(locale);

  return (
    <section className="relative bg-blush/20">
      <JsonLd data={faqJsonLd(locale)} />
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:py-28">
        <div>
          <Reveal className="text-gradient text-[11px] font-semibold tracking-[0.28em] uppercase">
            {copy.intro.eyebrow}
          </Reveal>
          <Reveal as="h2" delay={80} className="font-display mt-4 text-4xl text-ink sm:text-5xl">
            {copy.intro.title}
          </Reveal>
          <Reveal delay={140} className="gold-rule mt-6" />
          <div className="mt-8 max-w-2xl space-y-5 text-base leading-8 text-ink-soft">
            {copy.intro.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <h2 className="font-display mt-16 text-3xl text-ink sm:text-4xl">{copy.faqTitle}</h2>
          <div className="mt-6 divide-y divide-line border-y border-line">
            {copy.faq.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-ink marker:hidden">
                  <h3 className="text-base font-medium">{item.q}</h3>
                  <span
                    aria-hidden="true"
                    className="text-xl text-terracotta transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-soft">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-[2rem] bg-cream p-8 shadow-soft ring-1 ring-line lg:sticky lg:top-28">
          <dl className="space-y-8">
            <div>
              <dt className="text-[11px] tracking-[0.2em] text-rose uppercase">{copy.info.address}</dt>
              <dd className="mt-2">
                <address className="not-italic leading-7 text-ink">
                  {salon.name}
                  <br />
                  {salon.address.street}
                  <br />
                  {salon.address.locality}, {salon.address.region} {salon.address.postalCode}
                </address>
                <a
                  href={salon.location.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex min-h-11 items-center gap-2 text-[11px] tracking-[0.18em] text-terracotta uppercase hover:text-rose"
                >
                  {copy.info.directions} <span aria-hidden="true">→</span>
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-[0.2em] text-rose uppercase">{copy.info.hours}</dt>
              <dd className="mt-3">
                <table className="w-full text-sm">
                  <tbody>
                    {WEEK.map((day) => {
                      const slot = salon.openingHours.find((entry) => entry.day === day);
                      return (
                        <tr key={day} className="border-b border-line/60 last:border-0">
                          <th scope="row" className="py-2 pr-4 text-left font-normal capitalize text-ink-soft">
                            {weekdayName(intl, day)}
                          </th>
                          <td className="py-2 text-right tabular-nums text-ink">
                            {slot ? `${slot.opens} – ${slot.closes}` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-[0.2em] text-rose uppercase">{copy.info.phone}</dt>
              <dd className="mt-2">
                <a href={`tel:${salon.phone}`} className="text-lg text-ink hover:text-terracotta">
                  {salon.phoneDisplay}
                </a>
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
