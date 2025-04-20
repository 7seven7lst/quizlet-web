'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input } from '@quizlet-web/ui-components';

interface User {
  id: string;
  email: string;
  username: string;
}

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
  quiz_suite_id: number | null;
  created_at: string;
  updated_at: string;
}

interface QuizSuitesResponse {
  quiz_suites: QuizSuite[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [quizSuites, setQuizSuites] = useState<QuizSuite[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isQuizSuiteModalOpen, setIsQuizSuiteModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [newQuizSuite, setNewQuizSuite] = useState({ title: '', description: '' });
  const [newQuiz, setNewQuiz] = useState({ 
    question: '', 
    quiz_type: 'single_choice',
    quiz_suite_id: null as number | null
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!mounted) return;

      try {
        const response = await fetch('/api/users/me', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [mounted]);

  useEffect(() => {
    const fetchQuizSuites = async () => {
      if (!mounted) return;

      try {
        const response = await fetch('/api/quiz-suites', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch quiz suites');
        }

        const data: QuizSuitesResponse = await response.json();
        setQuizSuites(data.quiz_suites);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    fetchQuizSuites();
  }, [mounted]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  };

  const handleCreateQuizSuite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/quiz-suites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newQuizSuite),
      });

      if (!response.ok) {
        throw new Error('Failed to create quiz suite');
      }

      const data: QuizSuite = await response.json();
      setQuizSuites([...quizSuites, data]);
      setIsQuizSuiteModalOpen(false);
      setNewQuizSuite({ title: '', description: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quiz suite');
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        question: newQuiz.question,
        quiz_type: newQuiz.quiz_type,
        ...(newQuiz.quiz_suite_id !== null && { quiz_suite_id: newQuiz.quiz_suite_id })
      };

      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create quiz');
      }

      const data = await response.json();
      setQuizzes([...quizzes, data]);
      setIsQuizModalOpen(false);
      setNewQuiz({ question: '', quiz_type: 'single_choice', quiz_suite_id: null });
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

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setIsQuizSuiteModalOpen(true)}>Create Quiz Suite</Button>
              <Button onClick={() => setIsQuizModalOpen(true)}>Create Quiz</Button>
              <Button onClick={handleLogout}>Logout</Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Welcome, {user?.username || 'User'}!</h2>
            <p className="mb-6">Your email: {user?.email}</p>

            <h3 className="text-xl font-semibold mb-4">Your Quiz Suites</h3>
            <div className="grid gap-4">
              {quizSuites.map((suite) => (
                <Link 
                  href={`/quiz-suites/${suite.id}`} 
                  key={suite.id} 
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h4 className="text-lg font-medium">{suite.title}</h4>
                  <p className="text-gray-600">{suite.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Created: {new Date(suite.created_at).toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Create Quiz Suite Modal */}
      {isQuizSuiteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Create New Quiz Suite</h3>
            <form onSubmit={handleCreateQuizSuite}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Input
                  type="text"
                  value={newQuizSuite.title}
                  onChange={(e) => setNewQuizSuite({ ...newQuizSuite, title: e.target.value })}
                  required
                  className="w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newQuizSuite.description}
                  onChange={(e) => setNewQuizSuite({ ...newQuizSuite, description: e.target.value })}
                  required
                  className="w-full border rounded-md p-2"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={() => setIsQuizSuiteModalOpen(false)}
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

      {/* Create Quiz Modal */}
      {isQuizModalOpen && (
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
                  <option value="multi_choice">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="short_answer">Short Answer</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Suite (Optional)</label>
                <select
                  value={newQuiz.quiz_suite_id || ''}
                  onChange={(e) => setNewQuiz({ 
                    ...newQuiz, 
                    quiz_suite_id: e.target.value ? parseInt(e.target.value) : null 
                  })}
                  className="w-full border rounded-md p-2"
                >
                  <option value="">None</option>
                  {quizSuites.map((suite) => (
                    <option key={suite.id} value={suite.id}>{suite.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={() => setIsQuizModalOpen(false)}
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