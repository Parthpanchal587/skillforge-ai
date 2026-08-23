import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useStore();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, lessons, reviews
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);

        // Fetch course details
        const courseResponse = await fetch(`http://localhost:5000/api/ai/courses/${id}`);
        const courseData = await courseResponse.json();

        // Fetch lessons
        const lessonsResponse = await fetch(`http://localhost:5000/api/ai/courses/${id}/lessons`);
        const lessonsData = await lessonsResponse.json();

        if (courseData && courseData.id) {
          setCourse(courseData);
          setLessons(Array.isArray(lessonsData) ? lessonsData : []);

          // Check if user is enrolled (mock implementation)
          setEnrolled(true);
        } else {
          // Mock data if API fails
          setCourse({
            id: '1',
            title: 'Full Stack Web Development',
            description: 'Learn to build modern web applications with React, Node.js, and databases. This comprehensive course covers frontend development with React, backend development with Node.js and Express, database design with PostgreSQL, and deployment strategies.',
            category: 'Web Development',
            level: 'Intermediate',
            duration: 120,
            instructor: 'Alex Johnson',
            rating: 4.8,
            enrolledStudents: 1245,
            thumbnail: 'https://via.placeholder.com/800x400'
          });

          setLessons([
            {
              id: 'lesson-1',
              courseId: '1',
              title: 'Introduction to Web Development',
              content: 'Overview of web development concepts and course roadmap.',
              videoUrl: '',
              order: 1
            },
            {
              id: 'lesson-2',
              courseId: '1',
              title: 'HTML5 and CSS3 Fundamentals',
              content: 'Learn semantic HTML and modern CSS techniques.',
              videoUrl: '',
              order: 2
            },
            {
              id: 'lesson-3',
              courseId: '1',
              title: 'JavaScript ES6+',
              content: 'Modern JavaScript features and best practices.',
              videoUrl: '',
              order: 3
            },
            {
              id: 'lesson-4',
              courseId: '1',
              title: 'React Fundamentals',
              content: 'Building UI components with React hooks and context.',
              videoUrl: '',
              order: 4
            },
            {
              id: 'lesson-5',
              courseId: '1',
              title: 'Node.js and Express',
              content: 'Building RESTful APIs with Node.js and Express.',
              videoUrl: '',
              order: 5
            },
            {
              id: 'lesson-6',
              courseId: '1',
              title: 'Database Design with PostgreSQL',
              content: 'Relational database concepts and SQL fundamentals.',
              videoUrl: '',
              order: 6
            },
            {
              id: 'lesson-7',
              courseId: '1',
              title: 'Authentication and Authorization',
              content: 'Implementing JWT-based authentication and role-based access control.',
              videoUrl: '',
              order: 7
            },
            {
              id: 'lesson-8',
              courseId: '1',
              title: 'Deployment and DevOps',
              content: 'Deploying applications to cloud platforms and CI/CD pipelines.',
              videoUrl: '',
              order: 8
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

  const handleEnroll = async () => {
    // In a real app, this would make an API call to enroll the user
    setEnrolled(true);
    // Show success message or redirect
  };

  const handleStartLearning = () => {
    if (lessons.length > 0) {
      navigate(`/course/${id}/lesson/${lessons[0].id}`);
    }
  };

  if (loading || !course) {
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
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {course.title}
            </h1>
            <Link to="/learning" className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              â† Back to Courses
            </Link>
          </div>

          <div className="flex flex-col md:flex-row mb-6">
            <div className="w-full md:w-1/2 mb-4 md:mb-0 md:mr-6">
              <img
                src={course.thumbnail || 'https://via.placeholder.com/800x400'}
                alt={course.title}
                className="rounded-xl shadow-md w-full h-48 object-cover"
              />
            </div>
            <div className="w-full md:w-1/2 space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    by {course.instructor}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {course.enrolledStudents || 0}+ students enrolled
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-animate">
                  {[...Array(5)].map((_, index) => (
                    <svg
                      key={index}
                      className="h-4 w-4 mr-1 text-indigo-200 dark:text-gray-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.54 1.118l-3.768-2.27a1 1 0 00-1.175 0l-3.768 2.27c-.784-.57-1.838-.196-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-base font-semibold text-gray-900 dark:text-white">
                  {course.rating}/5
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-400 line-clamp-4">
                {course.description}
              </p>

              <div className="flex items-center space-x-3 mt-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)} â€¢
                  {course.duration} hours
                </span>
                {!enrolled && (
                  <button
                    onClick={handleEnroll}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Enroll Course
                  </button>
                )}
                {enrolled && (
                  <button
                    onClick={handleStartLearning}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Start Learning
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-4 py-3 text-left text-base font-medium ${activeTab === 'overview' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('lessons')}
              className={`flex-1 px-4 py-3 text-left text-base font-medium ${activeTab === 'lessons' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Lessons ({lessons.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 px-4 py-3 text-left text-base font-medium ${activeTab === 'reviews' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Reviews
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                What You'll Learn
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-indigo-500 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A4.001 4.001 0 006 8c0 2.202 1.79 4 4 4s4-1.798 4-4c0-1.105-.594-2.061-1.496-2.898a1.006 1.006 0 00-1.565-.072l-1.057 3.559a1.006 1.006 0 00-.257.839 1.006 1.006 0 00.86.257h2.965z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Modern Web Development</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Master the full stack with React, Node.js, databases, and deployment
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-indigo-500 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A4.001 4.001 0 006 8c0 2.202 1.79 4 4 4s4-1.798 4-4c0-1.105-.594-2.061-1.496-2.898a1.006 1.006 0 00-1.565-.072l-1.057 3.559a1.006 1.006 0 00-.257.839 1.006 1.006 0 00.86.257h2.965z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Hands-on Projects</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Build real-world applications to showcase in your portfolio
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-indigo-500 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A4.001 4.001 0 006 8c0 2.202 1.79 4 4 4s4-1.798 4-4c0-1.105-.594-2.061-1.496-2.898a1.006 1.006 0 00-1.565-.072l-1.057 3.559a1.006 1.006 0 00-.257.839 1.006 1.006 0 00.86.257h2.965z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Career-Ready Skills</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Gain practical skills that employers are looking for today
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lessons' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Course Curriculum
              </h2>
              {lessons.length > 0 ? (
                <div className="space-y-4">
                  {lessons.map((lesson) => (
                    <div key={lesson.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                {lesson.order}
                              </span>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {lesson.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {lesson.content.substring(0, 100)}...
                            </p>
                          </div>
                        </div>
                        <div className="text-sm">
                          {enrolled ? (
                            <button
                              onClick={() => navigate(`/course/${id}/lesson/${lesson.id}`)}
                              className="px-3 py-1 bg-indigo-600 text-white rounded-md text-xs hover:bg-indigo-700"
                            >
                              Start Lesson
                            </button>
                          ) : (
                            <span className="text-xs text-indigo-500 dark:text-indigo-400">
                              Enroll to access
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No lessons available for this course.
                </p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Student Reviews
              </h2>
              <div className="space-y-4">
                {/* Mock reviews */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 dark:text-indigo-400">JS</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            John Smith
                          </h3>
                          <div className="flex-animate">
                            {[...Array(5)].map((_, index) => (
                              <svg
                                key={index}
                                className="h-3 w-3 mr-0.5 text-indigo-200 dark:text-gray-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.54 1.118l-3.768-2.27a1 1 0 00-1.175 0l-3.768 2.27c-.784-.57-1.838-.196-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          2 weeks ago
                        </p>
                      </div>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">
                        This course was exactly what I needed to transition from frontend to full stack. The projects were challenging but rewarding, and I now feel confident building complete web applications.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 dark:text-indigo-400">SM</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            Sarah Miller
                          </h3>
                          <div className="flex-animate">
                            {[...Array(5)].map((_, index) => (
                              <svg
                                key={index}
                                className="h-3 w-3 mr-0.5 text-indigo-200 dark:text-gray-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.54 1.118l-3.768-2.27a1 1 0 00-1.175 0l-3.768 2.27c-.784-.57-1.838-.196-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          1 month ago
                        </p>
                      </div>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">
                        The instructor explains complex concepts in a simple, easy-to-understand way. I particularly enjoyed the hands-on projects that helped me apply what I learned.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {}}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Write a Review
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;

