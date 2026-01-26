'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, X, Eye, FileText, Sparkles, User } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';
import Spinner from '@/components/ui/spinner';
import BouncyClick from '@/components/ui/bouncy-click';

export default function ContentReviewPage({ params }: { params: { id: string } }) {
  const courseId = params.id;
  const router = useRouter();

  const [pendingVersions, setPendingVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPendingVersions();
  }, [courseId]);

  async function loadPendingVersions() {
    try {
      setLoading(true);
      const data = await apiClient.getPendingVersionsByCourse(courseId);
      setPendingVersions(data);
      if (data.length > 0) {
        setSelectedVersion(data[0]);
      }
    } catch (error) {
      console.error('Failed to load pending versions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(versionId: string) {
    try {
      setProcessing(true);
      await apiClient.approveVersion(versionId);
      const remaining = pendingVersions.filter(v => v.id !== versionId);
      setPendingVersions(remaining);
      setSelectedVersion(remaining.length > 0 ? remaining[0] : null);
    } catch (error: any) {
      alert(error.message || 'Failed to approve version');
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject(versionId: string) {
    try {
      setProcessing(true);
      await apiClient.rejectVersion(versionId);
      const remaining = pendingVersions.filter(v => v.id !== versionId);
      setPendingVersions(remaining);
      setSelectedVersion(remaining.length > 0 ? remaining[0] : null);
    } catch (error: any) {
      alert(error.message || 'Failed to reject version');
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-[600px] col-span-1" />
          <Skeleton className="h-[600px] col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 h-[calc(100vh-2rem)] flex flex-col space-y-6">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <BouncyClick>
            <Link href={`/instructor/courses/${courseId}/edit`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          </BouncyClick>
          <div>
            <h1 className="text-2xl font-bold">Content Review</h1>
            <p className="text-muted-foreground">Review and approve AI-generated or contributor content</p>
          </div>
        </div>
      </div>

      {pendingVersions.length === 0 ? (
        <Card className="flex-1 flex items-center justify-center">
          <CardContent className="text-center space-y-4">
            <Check className="h-12 w-12 mx-auto text-green-500" />
            <div>
              <h3 className="font-semibold text-lg">All caught up!</h3>
              <p className="text-muted-foreground">No pending content versions to review.</p>
            </div>
            <BouncyClick>
              <Link href={`/instructor/courses/${courseId}/edit`}>
                <Button variant="outline">Back to Course</Button>
              </Link>
            </BouncyClick>
          </CardContent>
        </Card>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          {/* Version List */}
          <Card className="lg:col-span-1 flex flex-col min-h-0">
            <CardHeader className="shrink-0">
              <CardTitle className="text-lg">Pending Versions ({pendingVersions.length})</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-2">
                  {pendingVersions.map((version) => (
                    <BouncyClick key={version.id}>
                      <button
                        key={version.id}
                        onClick={() => setSelectedVersion(version)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${selectedVersion?.id === version.id
                          ? 'bg-primary/5 border-primary ring-1 ring-primary'
                          : 'hover:bg-muted border-transparent'
                          }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm line-clamp-1">{version.lesson?.title}</span>
                          <Badge variant="outline" className="text-[10px] h-4">v{version.versionNumber}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <User className="h-3 w-3" />
                          <span>{version.author?.firstName} {version.author?.lastName}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 italic">
                          "{version.changeDescription}"
                        </p>
                      </button>
                    </BouncyClick>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Version Preview */}
          <Card className="lg:col-span-2 flex flex-col min-h-0">
            {selectedVersion ? (
              <>
                <CardHeader className="shrink-0 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge>v{selectedVersion.versionNumber}</Badge>
                        <h3 className="font-bold">{selectedVersion.lesson?.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground italic">
                        Change: {selectedVersion.changeDescription}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <BouncyClick disabled={processing}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleReject(selectedVersion.id)}
                          disabled={processing}
                        >
                          {processing ? <>
                            <Spinner size="sm" color="white" className="mr-2" />
                            Rejecting
                          </> : <>
                            <X className="mr-2 h-4 w-4" />
                            Reject
                          </>}
                        </Button>
                      </BouncyClick>

                      <BouncyClick disabled={processing}>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(selectedVersion.id)}
                          disabled={processing}
                        >
                          {processing ? <>
                            <Spinner size="sm" color="white" className="mr-2" />
                            Approving
                          </> : <>
                            <Check className="mr-2 h-4 w-4" />
                            Approve
                          </>}
                        </Button>
                      </BouncyClick>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-full">
                    <div className="p-8 prose prose-slate max-w-none dark:prose-invert">
                      <ReactMarkdown>{selectedVersion.content}</ReactMarkdown>
                    </div>
                  </ScrollArea>
                </CardContent>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a version to preview
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

