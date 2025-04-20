'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@quizlet-web/ui-components';

interface QuizSuite {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  title: string;
  description: string;
  created_by_id: number;
}

interface Quiz {
  id: number;
  question: string;
  quiz_type: string;
  quiz_suite_id: number;
  created_at: string;
  updated_at: string;
}

export default function QuizSuiteDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [quizSuite, setQuizSuite] = useState<QuizSuite | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQuiz, setNewQuiz] = useState({ 
    question: '', 
    quiz_type: 'single_choice' 
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchQuizSuite = async () => {
      if (!mounted) return;

      try {
        const response = await fetch(`/api/quiz-suites/${params.id}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch quiz suite');
        }

        const data = await response.json();
        setQuizSuite(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizSuite();
  }, [mounted, params.id]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!mounted) return;

      try {
        const response = await fetch(`/api/quiz-suites/${params.id}/quizzes`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch quizzes');
        }

        const data = await response.json();
        setQuizzes(data.quizzes || []);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        // Don't set error state here to avoid blocking the page
      }
    };

    fetchQuizzes();
  }, [mounted, params.id]);

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...newQuiz,
          quiz_suite_id: parseInt(params.id)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create quiz');
      }

      const data = await response.json();
      setQuizzes([...quizzes, data]);
      setIsModalOpen(false);
      setNewQuiz({ question: '', quiz_type: 'single_choice' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quiz');
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!quizSuite) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Quiz suite not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Quiz Suite Details</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setIsModalOpen(true)}>Create Quiz</Button>
              <Button onClick={handleBack}>Back to Dashboard</Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{quizSuite.title}</h2>
            <p className="text-gray-600 mb-4">{quizSuite.description}</p>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-2">Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p>{new Date(quizSuite.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p>{new Date(quizSuite.updated_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ID</p>
                  <p>{quizSuite.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created By</p>
                  <p>User ID: {quizSuite.created_by_id}</p>
                </div>
              </div>
            </div>
            
            {/* Quiz Items Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-2">Quiz Items</h3>
              {quizzes.length > 0 ? (
                <div className="grid gap-4">
                  {quizzes.map((quiz) => (
                    <div key={quiz.id} className="border rounded-lg p-4">
                      <h4 className="text-lg font-medium">{quiz.question}</h4>
                      <p className="text-sm text-gray-500 mt-1">Type: {quiz.quiz_type}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No quiz items yet. Click &quot;Create Quiz&quot; to add one.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Create Quiz Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Create New Quiz</h3>
            <form onSubmit={handleCreateQuiz}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                <Input
                  type="text"
                  value={newQuiz.question}
                  onChange={(e) => setNewQuiz({ ...newQuiz, question: e.target.value })}
                  required
                  className="w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Type</label>
                <select
                  value={newQuiz.quiz_type}
                  onChange={(e) => setNewQuiz({ ...newQuiz, quiz_type: e.target.value })}
                  className="w-full border rounded-md p-2"
                >
                  <option value="single_choice">Single Choice</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="short_answer">Short Answer</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 