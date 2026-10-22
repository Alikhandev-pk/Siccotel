import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="bg-stone">
      <div className="container-site py-24 lg:py-32">
        <p className="eyebrow mb-5">Page not found</p>
        <h1 className="max-w-2xl text-[2.5rem] leading-[1.05] font-semibold sm:text-5xl">
          We couldn’t find that page.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">It may have moved, or the link may be out of date.</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Contact us
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
