import { Suspense } from 'react';
import QuizSuiteClient from './QuizSuiteClient';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function QuizSuitePage({ params, searchParams }: PageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams
  ]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuizSuiteClient 
        params={resolvedParams} 
        searchParams={resolvedSearchParams}
      />
    </Suspense>
  );
} 