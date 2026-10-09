import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

interface LegalSection {
  title: string;
  paragraphs?: string[];
  points?: string[];
}

export function LegalPage({ title, introduction, sections }: {
  title: string;
  introduction: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-slate-bg">
        <header className="bg-forest-950 px-4 pb-12 pt-32 text-white md:px-6 md:pb-16">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs font-bold uppercase tracking-widest text-harvest-gold">Palia Property Hub · Legal</p>
            <h1 className="mt-3 text-3xl font-black md:text-4xl">{title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/70">{introduction}</p>
          </div>
        </header>
        <article className="mx-auto max-w-5xl space-y-9 px-4 py-10 md:px-6 md:py-14">
          {sections.map(section => (
            <section key={section.title}>
              <h2 className="text-lg font-extrabold text-slate-900">{section.title}</h2>
              {section.paragraphs?.map(paragraph => (
                <p key={paragraph} className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">{paragraph}</p>
              ))}
              {section.points && (
                <ul className="mt-3 max-w-4xl list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600 marker:text-agri-green">
                  {section.points.map(point => <li key={point}>{point}</li>)}
                </ul>
              )}
            </section>
          ))}
          <p className="border-t border-slate-200 pt-6 text-sm text-slate-500">
            Questions about these pages? Contact <a className="font-semibold text-agri-green hover:underline" href="mailto:info@paliaproperty.in">info@paliaproperty.in</a>.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}