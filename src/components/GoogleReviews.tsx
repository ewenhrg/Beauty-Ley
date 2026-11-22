import { salon } from "@/data/salon";
import { googleRating, googleReviews, type GoogleReview } from "@/data/reviews";
import { getLocale } from "@/i18n/server";
import { seoCopy } from "@/i18n/seo";
import { Reveal } from "./Reveal";

export function GoogleLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.5z"
      />
    </svg>
  );
}

function Stars({ value, className = "h-4 w-4" }: { value: number; className?: string }) {
  return (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((index) => {
        const fill = Math.max(0, Math.min(1, value - (index - 1)));
        return (
          <svg key={index} viewBox="0 0 20 20" className={className}>
            <defs>
              <linearGradient id={`star-${index}-${fill}`}>
                <stop offset={`${fill * 100}%`} stopColor="#FBBC04" />
                <stop offset={`${fill * 100}%`} stopColor="#E3D9D0" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#star-${index}-${fill})`}
              d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.8l-5.2 2.8 1-5.8L1.5 7.7l5.9-.8z"
            />
          </svg>
        );
      })}
    </span>
  );
}

function ReviewCard({ review }: { review: GoogleReview }) {
  return (
    <figure className="flex w-[19rem] shrink-0 flex-col rounded-[1.6rem] bg-cream p-6 shadow-soft ring-1 ring-line sm:w-[22rem]">
      <div className="flex items-center justify-between">
        <Stars value={review.rating} />
        <GoogleLogo className="h-5 w-5" />
      </div>
      <blockquote className="mt-4 line-clamp-6 flex-1 text-sm leading-7 text-ink-soft">“{review.text}”</blockquote>
      <figcaption className="mt-5 text-[11px] tracking-[0.2em] text-ink uppercase">{review.author}</figcaption>
    </figure>
  );
}

/** Google rating badge + auto-scrolling client reviews (pauses on hover, static if reduced motion). */
export async function GoogleReviews() {
  const locale = await getLocale();
  const copy = seoCopy(locale).reviews;
  const formatted = googleRating.rating.toLocaleString(locale === "en" ? "en-GB" : locale, {
    minimumFractionDigits: 1,
  });

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <Reveal className="text-gradient text-[11px] font-semibold tracking-[0.28em] uppercase">
              {copy.eyebrow}
            </Reveal>
            <Reveal as="h2" delay={80} className="font-display mt-4 text-4xl text-ink sm:text-5xl">
              {copy.title}
            </Reveal>
          </div>
          <a
            href={salon.location.placeUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 rounded-[1.6rem] bg-cream px-6 py-4 shadow-soft ring-1 ring-line transition-transform duration-300 hover:-translate-y-0.5"
          >
            <GoogleLogo className="h-10 w-10" />
            <span className="flex flex-col">
              <span className="flex items-center gap-3">
                <span className="font-display text-4xl leading-none text-ink">{formatted}</span>
                <Stars value={googleRating.rating} className="h-5 w-5" />
              </span>
              <span className="mt-1.5 text-[11px] tracking-[0.16em] text-ink-soft uppercase">
                {googleRating.count
                  ? copy.basedOn.replace("{count}", String(googleRating.count))
                  : copy.cta}
              </span>
            </span>
          </a>
        </div>
      </div>

      {googleReviews.length > 0 ? (
        <>
          <div className="review-marquee -mt-8 lg:-mt-12">
            <div className="review-track flex w-max gap-5 px-5">
              {[...googleReviews, ...googleReviews].map((review, index) => (
                <div key={index} aria-hidden={index >= googleReviews.length ? "true" : undefined}>
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center pt-10 pb-20 lg:pb-28">
            <a
              href={salon.location.placeUrl}
              target="_blank"
              rel="noreferrer"
              className="nav-link inline-flex min-h-11 items-center gap-2 text-[11px] tracking-[0.22em] text-rose uppercase hover:text-ink"
            >
              <GoogleLogo className="h-4 w-4" />
              {copy.cta}
            </a>
          </div>
        </>
      ) : null}
    </section>
  );
}
