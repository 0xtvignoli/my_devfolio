import { cn } from '@/lib/utils';
import type { CaseStudy } from '@/lib/types';

/**
 * The post-mortem view of a case study: a facts strip, then the story as a
 * dated timeline. Filled squares are events, empty ones are decisions.
 */
export function CaseStudySummary({ caseStudy, timelineLabel }: { caseStudy: CaseStudy; timelineLabel: string }) {
  return (
    <>
      <dl className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,140px),1fr))] gap-x-6 gap-y-4 border-b border-t border-b-border border-t-foreground py-5">
        {caseStudy.facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-[13px] text-muted-foreground">{fact.label}</dt>
            <dd className={cn('mt-1 text-[15px] leading-snug', fact.mono && 'font-mono')}>{fact.value}</dd>
          </div>
        ))}
      </dl>

      <section aria-label={timelineLabel} className="mt-10">
        <ol>
          {caseStudy.timeline.map((step, i) => (
            <li key={`${step.when}-${i}`} className="grid grid-cols-[72px_20px_minmax(0,1fr)] gap-x-4 sm:grid-cols-[96px_24px_minmax(0,1fr)]">
              <p className="pt-0.5 text-right font-mono text-[13px] text-muted-foreground">{step.when}</p>
              <div aria-hidden className="flex flex-col items-center">
                <span
                  className={cn(
                    'mt-[7px] h-[11px] w-[11px] shrink-0 border border-foreground',
                    step.kind === 'event' ? 'bg-foreground' : 'bg-background',
                  )}
                />
                {i < caseStudy.timeline.length - 1 && <span className="w-px flex-1 bg-border" />}
              </div>
              <div className="pb-7">
                <h3 className="font-sans text-[17px] font-semibold">{step.title}</h3>
                <p className="mt-1 font-serif text-lg leading-[1.55]">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
