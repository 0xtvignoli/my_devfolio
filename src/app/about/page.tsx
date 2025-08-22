import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { person } from '@/lib/data';
import { Briefcase, Download, Mail, MapPin, Award } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight">About Me</h1>
        <Button asChild>
          <Link href={person.resumeUrl} target="_blank">
            <Download className="mr-2 h-4 w-4" />
            Download Resume
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <Avatar className="h-40 w-40 border-4 border-primary">
                  <AvatarImage
                    src="https://placehold.co/200x200.png"
                    alt={person.name}
                    data-ai-hint="professional portrait"
                  />
                  <AvatarFallback className="text-6xl">{person.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h2 className="font-headline text-3xl font-bold">{person.name}</h2>
                  <p className="text-lg text-primary">{person.roleTitle}</p>
                </div>
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{person.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${person.email}`} className="hover:text-primary">
                      {person.email}
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                <Award className="mr-2 h-5 w-5" /> Certifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {person.education.map((edu, index) => (
                <div key={index}>
                  <h3 className="font-semibold">{edu.degree}</h3>
                  <p className="text-muted-foreground">{edu.institution}</p>
                  <p className="text-sm text-muted-foreground">{edu.period}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl">My Philosophy</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-invert max-w-none text-muted-foreground space-y-4"
                dangerouslySetInnerHTML={{ __html: person.about }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Briefcase className="mr-2 h-5 w-5" /> Work Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {person.experience.map((exp, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-primary mt-1" />
                    <div className="flex-1 w-px bg-border -mb-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{exp.role}</h3>
                    <p className="text-muted-foreground">{exp.company}</p>
                    <p className="text-sm text-muted-foreground mb-2">{exp.period}</p>
                    <p className="text-sm">{exp.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
