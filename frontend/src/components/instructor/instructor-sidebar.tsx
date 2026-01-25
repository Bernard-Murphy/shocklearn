'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Home, 
  Sparkles, 
  BarChart3, 
  Settings, 
  FileCheck,
  Plus
} from 'lucide-react';
import BouncyClick from '@/components/ui/bouncy-click';
import { cn } from '@/lib/utils';

export function InstructorSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      title: 'My Courses',
      href: '/instructor/courses',
      icon: BookOpen,
    },
    {
      title: 'New Course',
      href: '/instructor/courses/new',
      icon: Plus,
    }
  ];

  return (
    <aside className="w-64 border-r bg-card p-6 flex flex-col h-full">
      <div className="flex items-center space-x-2 mb-6">
        <BookOpen className="h-6 w-6" />
        <span className="font-bold text-lg">Teaching Hub</span>
      </div>

      <Separator className="mb-6" />

      <nav className="space-y-2 flex-1">
        {navItems.map((item) => (
          <BouncyClick key={item.href}>
            <Link href={item.href}>
              <Button 
                variant={pathname === item.href ? "secondary" : "ghost"} 
                className={cn(
                  "w-full justify-start",
                  pathname === item.href && "bg-secondary font-medium"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          </BouncyClick>
        ))}

        <Separator className="my-4" />
        
        <BouncyClick>
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <Sparkles className="mr-2 h-4 w-4" />
              Learning Dashboard
            </Button>
          </Link>
        </BouncyClick>
      </nav>
    </aside>
  );
}

