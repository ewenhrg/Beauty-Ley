import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PriceList } from "@/components/PriceList";
import { BookingCta } from "@/components/BookingCta";
import { Reveal } from "@/components/Reveal";
import { categories } from "@/data/services";
import { getLocale, getT } from "@/i18n/server";
import { breadcrumbJsonLd, JsonLd, pageMetadata } from "@/lib/seo";
import { seoCopy } from "@/i18n/seo";
import { categoryKey } from "@/i18n/keys";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getLocale(), "prices");
}

export default async function TarifsPage() {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, "prices")} />
      <PageHeader eyebrow={seoCopy(locale).heroKicker} title={t("page.prices.title")}>
        <p>{t("page.prices.lead")}</p>
      </PageHeader>
      <div className="bg-transparent">
        <div className="mx-auto max-w-7xl space-y-20 px-5 py-16 sm:px-8 lg:py-24">
          {categories.map((category) => {
            const key = categoryKey(category.id);
            return (
              <section key={category.id} id={category.id}>
                <Reveal as="h2" className="font-display mb-8 text-3xl sm:text-4xl">
                  <span className="text-gradient">{key ? t(key) : category.title}</span>
                </Reveal>
                <PriceList groups={category.groups} />
              </section>
            );
          })}
        </div>
      </div>
      <BookingCta />
    </>
  );
}
