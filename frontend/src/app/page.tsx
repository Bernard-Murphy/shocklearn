import Link from 'next/link';
import { Button } from '@/components/ui/button';
import BouncyClick from '@/components/ui/bouncy-click';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full text-center space-y-8">
        <h1 className="text-6xl font-bold tracking-tight">
          ShockLearn LMS
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Production-quality Learning Management System with AI-powered curriculum generation,
          quiz creation, and personalized recommendations
        </p>

        <div className="flex gap-4 justify-center pt-8">
          <BouncyClick>
            <Link href="/login">
              <Button size="lg">Get Started</Button>
            </Link>
          </BouncyClick>
          <BouncyClick>
            <Link href="/register">
              <Button size="lg" variant="outline">Sign Up</Button>
            </Link>
          </BouncyClick>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
          <div className="border rounded-lg p-6 space-y-2">
            <h3 className="font-semibold text-lg">Mini LMS</h3>
            <p className="text-sm text-muted-foreground">
              Complete course management with progress tracking and enrollments
            </p>
          </div>
          <div className="border rounded-lg p-6 space-y-2">
            <h3 className="font-semibold text-lg">AI Curriculum Tools</h3>
            <p className="text-sm text-muted-foreground">
              Generate structured lessons, quizzes, and content with AI assistance
            </p>
          </div>
          <div className="border rounded-lg p-6 space-y-2">
            <h3 className="font-semibold text-lg">Smart Recommendations</h3>
            <p className="text-sm text-muted-foreground">
              Personalized learning paths based on progress and behavior
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

