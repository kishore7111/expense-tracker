
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { DollarSign, BarChart, BrainCircuit, ShieldCheck, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const features = [
  {
    icon: <DollarSign />,
    title: 'Effortless Expense Tracking',
    description: 'Log your expenses in seconds. Just enter a title and amount, and let our AI handle the rest.',
  },
  {
    icon: <BrainCircuit />,
    title: 'AI-Powered Categorization',
    description: 'Forget manual sorting. SpendWise automatically categorizes your expenses, saving you time and effort.',
  },
  {
    icon: <BarChart />,
    title: 'Visual Insights',
    description: 'Understand your spending at a glance with beautiful charts and a clear, concise dashboard.',
  },
  {
    icon: <ShieldCheck />,
    title: 'Secure & Private',
    description: 'Your financial data is yours alone. We use Firebase to ensure your information is always secure.',
  },
];

export default function LandingPage() {
    const heroImage = PlaceHolderImages.find(p => p.id === 'hero');
    const featureImage1 = PlaceHolderImages.find(p => p.id === 'feature1');
    const featureImage2 = PlaceHolderImages.find(p => p.id === 'feature2');
    
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary md:text-2xl">
            <Wallet className="h-7 w-7" />
            <span className="font-headline">SpendWise</span>
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
                <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Take Control of Your Finances with{' '}
                    <span className="text-primary">SpendWise</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    The smart, simple, and secure way to track your expenses. Let our AI-powered app do the heavy lifting so you can focus on what matters.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/signup">Get Started for Free</Link>
                  </Button>
                </div>
              </div>
              {heroImage && (
                <Image
                    src={heroImage.imageUrl}
                    width="600"
                    height="400"
                    alt="Hero"
                    data-ai-hint={heroImage.imageHint}
                    className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full"
                />
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need to Manage Your Money</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  SpendWise is packed with features designed to make financial management easy and intuitive.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-4 mt-12">
              {features.map((feature) => (
                <Card key={feature.title} className="h-full border-transparent shadow-md hover:shadow-lg transition-shadow bg-card">
                    <CardHeader className="flex flex-col items-center text-center">
                        <div className="bg-primary/10 p-3 rounded-full text-primary mb-4">
                            {feature.icon}
                        </div>
                        <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-sm text-muted-foreground">
                        {feature.description}
                    </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Alternating Feature Sections */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
            <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
                <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                    Visualize Your Spending, Make Smarter Decisions
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Our interactive dashboard gives you a clear overview of your financial health. See where your money goes and identify opportunities to save.
                </p>
                </div>
                {featureImage1 && (
                    <Image
                        src={featureImage1.imageUrl}
                        alt="Feature 1"
                        width={600}
                        height={400}
                        data-ai-hint={featureImage1.imageHint}
                        className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full shadow-lg"
                    />
                )}
            </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
            <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
                <div className="space-y-2 lg:order-last">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                        AI-Powered Simplicity
                    </h2>
                    <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Can't remember if that $5 purchase was for coffee or a snack? Just type "latte" and our AI will categorize it as 'Food' for you. It's that simple.
                    </p>
                </div>
                {featureImage2 && (
                    <Image
                        src={featureImage2.imageUrl}
                        alt="Feature 2"
                        width={600}
                        height={400}
                        data-ai-hint={featureImage2.imageHint}
                        className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full shadow-lg"
                    />
                )}
            </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simple, Transparent Pricing</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                  Start for free, forever. No hidden fees, no credit card required.
                </p>
              </div>
              <Card className="mt-8 pt-6 w-full max-w-sm border-primary shadow-xl">
                <CardHeader>
                    <CardTitle className="text-4xl font-bold text-center">Free</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ul className="grid gap-2 text-muted-foreground text-sm">
                        <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />Unlimited Expense Tracking</li>
                        <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />AI Categorization</li>
                        <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />Dashboard & Insights</li>
                        <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />Secure Cloud Sync</li>
                    </ul>
                    <Button className="w-full" asChild>
                        <Link href="/signup">Sign Up Now</Link>
                    </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-muted p-6 md:py-8 w-full">
        <div className="container flex items-center justify-between text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SpendWise. All rights reserved.</p>
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary">
            <Wallet className="h-6 w-6" />
            <span className="font-headline">SpendWise</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
