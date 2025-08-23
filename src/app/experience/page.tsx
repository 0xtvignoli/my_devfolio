'use client';

import { ExperienceTimeline } from "@/components/experience-timeline";
import { useLocale } from "@/hooks/use-locale";

export default function ExperiencePage() {
    const { t } = useLocale();

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-16">
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
                    {t.experience.title}
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                    My professional journey and evolution in the world of DevOps and Cloud.
                </p>
            </div>
            <ExperienceTimeline />
        </div>
    );
}
