import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';

const LearningLibraryPage = () => {
  const { user } = useStore();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    search: ''
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.level) queryParams.append('level', filters.level);
        if (filters.search) queryParams.append('search', filters.search);

        const response = await fetch(`http://localhost:5000/api/ai/courses?${queryParams.toString()}`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setCourses(data);
        } else {
          // Mock data if API fails
          setCourses([
            {
              id: '1',
              title: 'Full Stack Web Development',
              description: 'Learn to build modern web applications with React, Node.js, and databases',
              category: 'Web Development',
              level: 'Intermediate',
              duration: 120,
              instructor: 'Alex Johnson',
              rating: 4.8
            },
            {
              id: '2',
              title: 'Data Structures and Algorithms',
              description: 'Master essential algorithms and data structures for coding interviews',
              category: 'Computer Science',
              level: 'Intermediate',
              duration: 100,
              instructor: 'Sarah Chen',
              rating: 4.9
            },
            {
              id: '3',
              title: 'Machine Learning Fundamentals',
              description: 'Introduction to ML concepts and practical applications',
              category: 'Data Science',
              level: 'Beginner',
              duration: 80,
              instructor: 'Dr. Mike Rodriguez',
              rating: 4.6
            },
            {
              id: '4',
              title: 'DevOps and Cloud Computing',
              description: 'Master AWS, Docker, Kubernetes and CI/CD pipelines',
              category: 'DevOps',
              level: 'Advanced',
              duration: 150,
              instructor: 'Lisa Wang',
              rating: 4.7
            },
            {
              id: '5',
              title: 'Mobile App Development with React Native',
              description: 'Build cross-platform mobile apps for iOS and Android',
              category: 'Mobile Development',
              level: 'Intermediate',
              duration: 90,
              instructor: 'David Kim',
              rating: 4.5
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        // Fallback to mock data
        setCourses([
          {
            id: '1',
            title: 'Full Stack Web Development',
            description: 'Learn to build modern web applications with React, Node.js, and databases',
            category: 'Web Development',
            level: 'Intermediate',
            duration: 120,
            instructor: 'Alex Johnson',
            rating: 4.8
          },
          {
            id: '2',
            title: 'Data Structures and Algorithms',
            description: 'Master essential algorithms and data structures for coding interviews',
            category: 'Computer Science',
            level: 'Intermediate',
            duration: 100,
            instructor: 'Sarah Chen',
            rating: 4.9
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({
      ...prev,
      search: e.target.value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Learning Library
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Browse our collection of engineering courses and skill tracks
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end sm:items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              >
                <option value="">All Categories</option>
                <option value="Web Development">Web Development</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Data Science">Data Science</option>
                <option value="DevOps">DevOps</option>
                <option value="Mobile Development">Mobile Development</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Level
              </label>
              <select
                name="level"
                value={filters.level}
                onChange={handleFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search courses
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for courses..."
                  value={filters.search}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                />
                <svg className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1 lg:col-span-1 flex justify-end sm:justify-start lg:justify-end">
              <button
                onClick={() => setFilters({ category: '', level: '', search: '' })}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <Link to={`/course/${course.id}`} className="block">
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                          <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                          {course.description}
                        </p>
                        <div className="flex items-center flex-wrap text-sm">
                          <span className="mr-4">
                            <svg className="h-4 w-4 mr-1 text-indigo-500 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8.707 7.293a1 1 0 00-1.414 1.414l2.121 2.121a1 1 0 001.414 0l2.121-2.121a1 1 0 00-1.414-1.414l-2.121-2.121z" />
                            </svg>
                            {course.duration} min
                          </span>
                          <span className="mr-4">
                            <svg className="h-4 w-4 mr-1 text-yellow-400 dark:text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 .293l1.414 1.414L18.586 9H21l-1.293 2.707L12 15.707l-2.293-2.707L3 9h2.414l1.414-1.414L12 .293z" />
                            </svg>
                            {course.rating}/5
                          </span>
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                            {course.level}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">No courses found matching your filters.</p>
            </div>
          )}
        </div>

        {/* Pagination placeholder */}
        {courses.length > 0 && (
          <div className="mt-8">
            <p className="text-center text-gray-500 dark:text-gray-400">
              Showing {courses.length} courses
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningLibraryPage;