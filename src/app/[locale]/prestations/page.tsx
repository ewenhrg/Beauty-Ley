import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PriceList } from "@/components/PriceList";
import { BookingButton } from "@/components/BookingButton";
import { categories } from "@/data/services";
import { BookingCta } from "@/components/BookingCta";
import { Reveal } from "@/components/Reveal";
import { getLocale, getT } from "@/i18n/server";
import { breadcrumbJsonLd, JsonLd, pageMetadata } from "@/lib/seo";
import { seoCopy } from "@/i18n/seo";
import { Photo } from "@/components/Photo";
import { categoryKey } from "@/i18n/keys";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getLocale(), "services");
}

export default async function PrestationsPage() {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, "services")} />
      <PageHeader eyebrow={seoCopy(locale).heroKicker} title={t("page.services.title")}>
        <p>{t("page.services.lead")}</p>
      </PageHeader>
      {categories.map((category, index) => {
        const key = categoryKey(category.id);
        return (
          <section
            key={category.id}
            id={category.id}
            className={index % 2 === 0 ? "bg-blush/20" : "bg-transparent"}
          >
            <div className="mx-auto grid max-w-7xl items-start gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:py-20">
              <Reveal as="div" className="lg:sticky lg:top-28">
                <Photo
                  src={category.image}
                  alt={category.imageAlt}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="hover-lift aspect-4/5 w-full rounded-[2rem] object-cover"
                />
                <h2 className="font-display mt-6 text-3xl">
                  <span className="text-gradient">{key ? t(key) : category.title}</span>
                </h2>
                <div className="mt-6">
                  <BookingButton />
                </div>
              </Reveal>
              <PriceList groups={category.groups} />
            </div>
          </section>
        );
      })}
      <BookingCta />
    </>
  );
}
