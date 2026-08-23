import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';

const JobBoardPage = () => {
  const { user } = useStore();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: '',
    experience: '',
    remote: false
  });
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const jobTypes = ['', 'Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
  const experienceLevels = ['', 'Entry Level', 'Mid Level', 'Senior', 'Lead', 'Executive'];
  const locations = ['', 'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA', 'Los Angeles, CA', 'Chicago, IL', 'Denver, CO', 'Remote'];

  const mockJobs = [
    {
      id: 1,
      title: 'Senior Frontend Engineer',
      company: 'TechCorp Inc.',
      logo: 'https://via.placeholder.com/60',
      location: 'San Francisco, CA',
      type: 'Full-time',
      experience: 'Senior',
      remote: true,
      salary: '$150,000 - $200,000',
      description: 'We are looking for a Senior Frontend Engineer to join our growing team. You will be responsible for building and maintaining our customer-facing web applications using React, TypeScript, and modern CSS.',
      requirements: ['5+ years of React experience', 'Strong TypeScript skills', 'Experience with Next.js', 'CSS-in-JS (Styled Components)', 'Testing with Jest/React Testing Library'],
      benefits: ['Health insurance', '401k matching', 'Flexible PTO', 'Remote work', 'Learning budget'],
      postedDate: '2024-01-15',
      tags: ['React', 'TypeScript', 'Next.js', 'CSS-in-JS']
    },
    {
      id: 2,
      title: 'Backend Developer (Node.js)',
      company: 'DataFlow Systems',
      logo: 'https://via.placeholder.com/60',
      location: 'New York, NY',
      type: 'Full-time',
      experience: 'Mid Level',
      remote: false,
      salary: '$120,000 - $160,000',
      description: 'Join our backend team to build scalable APIs and microservices. You will work with Node.js, PostgreSQL, Redis, and AWS to power our data processing platform.',
      requirements: ['3+ years Node.js experience', 'PostgreSQL expertise', 'AWS services (Lambda, ECS, RDS)', 'Docker & Kubernetes', 'GraphQL/REST API design'],
      benefits: ['Competitive salary', 'Equity package', 'Health benefits', 'Gym membership', 'Conference budget'],
      postedDate: '2024-01-14',
      tags: ['Node.js', 'PostgreSQL', 'AWS', 'Docker', 'GraphQL']
    },
    {
      id: 3,
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      logo: 'https://via.placeholder.com/60',
      location: 'Remote',
      type: 'Full-time',
      experience: 'Mid Level',
      remote: true,
      salary: '$100,000 - $140,000',
      description: 'Early-stage startup seeking a versatile Full Stack Developer. You will own features end-to-end, from database design to UI implementation. Tech stack: React, Node.js, PostgreSQL, TypeScript.',
      requirements: ['2+ years full stack experience', 'React & Node.js proficiency', 'Database design (PostgreSQL)', 'TypeScript', 'Startup mindset'],
      benefits: ['Equity (0.1-0.5%)', 'Fully remote', 'Flexible hours', 'Home office stipend', 'Annual retreat'],
      postedDate: '2024-01-13',
      tags: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Startup']
    },
    {
      id: 4,
      title: 'DevOps Engineer',
      company: 'CloudScale Inc.',
      logo: 'https://via.placeholder.com/60',
      location: 'Seattle, WA',
      type: 'Full-time',
      experience: 'Senior',
      remote: true,
      salary: '$140,000 - $180,000',
      description: 'Lead our infrastructure and deployment pipelines. You will manage Kubernetes clusters, CI/CD systems, and cloud infrastructure on AWS/GCP.',
      requirements: ['5+ years DevOps experience', 'Kubernetes expertise', 'Terraform/CloudFormation', 'AWS/GCP', 'CI/CD (GitLab CI, Jenkins)', 'Monitoring (Prometheus, Grafana)'],
      benefits: ['Top-tier compensation', 'Remote-first', 'Certification budget', 'On-call rotation pay', 'Latest hardware'],
      postedDate: '2024-01-12',
      tags: ['Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Prometheus']
    },
    {
      id: 5,
      title: 'Machine Learning Engineer',
      company: 'AI Innovations Lab',
      logo: 'https://via.placeholder.com/60',
      location: 'Boston, MA',
      type: 'Full-time',
      experience: 'Senior',
      remote: false,
      salary: '$160,000 - $220,000',
      description: 'Build and deploy ML models at scale. Work on recommendation systems, NLP, and computer vision projects. Collaborate with research team to productionize models.',
      requirements: ['MS/PhD in CS/ML', 'Python, PyTorch/TensorFlow', 'MLOps (MLflow, Kubeflow)', 'Distributed training', 'Production ML experience'],
      benefits: ['Research budget', 'Conference travel', 'GPU cluster access', 'Publication support', 'Health & wellness'],
      postedDate: '2024-01-11',
      tags: ['Python', 'PyTorch', 'MLOps', 'Kubeflow', 'NLP']
    },
    {
      id: 6,
      title: 'Software Engineering Intern',
      company: 'TechCorp Inc.',
      logo: 'https://via.placeholder.com/60',
      location: 'San Francisco, CA',
      type: 'Internship',
      experience: 'Entry Level',
      remote: false,
      salary: '$7,000 - $9,000/month',
      description: 'Summer internship program for students. Work on real projects with mentorship from senior engineers. 12-week program with potential for return offer.',
      requirements: ['Currently pursuing CS degree', 'Programming fundamentals', 'Eagerness to learn', 'Git basics', 'Problem solving skills'],
      benefits: ['Mentorship program', 'Housing stipend', 'Social events', 'Executive speaker series', 'Return offer consideration'],
      postedDate: '2024-01-10',
      tags: ['Internship', 'Mentorship', 'Summer 2024']
    },
    {
      id: 7,
      title: 'Mobile Developer (React Native)',
      company: 'AppStudio',
      logo: 'https://via.placeholder.com/60',
      location: 'Austin, TX',
      type: 'Full-time',
      experience: 'Mid Level',
      remote: true,
      salary: '$110,000 - $150,000',
      description: 'Build cross-platform mobile applications for iOS and Android. Work on consumer-facing apps with millions of users.',
      requirements: ['3+ years React Native', 'iOS/Android native knowledge', 'TypeScript', 'Redux/MobX', 'App Store deployment'],
      benefits: ['Remote work', 'Device budget', 'Health insurance', '401k', 'Learning allowance'],
      postedDate: '2024-01-09',
      tags: ['React Native', 'TypeScript', 'iOS', 'Android', 'Redux']
    },
    {
      id: 8,
      title: 'Data Engineer',
      company: 'AnalyticsPro',
      logo: 'https://via.placeholder.com/60',
      location: 'Chicago, IL',
      type: 'Full-time',
      experience: 'Mid Level',
      remote: true,
      salary: '$120,000 - $160,000',
      description: 'Build and maintain data pipelines and warehouses. Work with petabyte-scale data using modern tools.',
      requirements: ['3+ years data engineering', 'Python/SQL expertise', 'Airflow/dbt', 'Snowflake/BigQuery', 'Spark/Kafka'],
      benefits: ['Remote flexible', 'Data conference budget', 'Health benefits', 'Stock options', 'Learning stipend'],
      postedDate: '2024-01-08',
      tags: ['Python', 'SQL', 'Airflow', 'Snowflake', 'dbt']
    },
    {
      id: 9,
      title: 'Security Engineer',
      company: 'SecureNet',
      logo: 'https://via.placeholder.com/60',
      location: 'Remote',
      type: 'Full-time',
      experience: 'Senior',
      remote: true,
      salary: '$150,000 - $200,000',
      description: 'Protect our infrastructure and applications. Lead security initiatives, conduct audits, and build security tooling.',
      requirements: ['5+ years security experience', 'Penetration testing', 'Cloud security (AWS/GCP)', 'Compliance (SOC2, ISO)', 'Security automation'],
      benefits: ['Fully remote', 'Security certifications paid', 'Bug bounty participation', 'Top-tier tools', 'Flexible PTO'],
      postedDate: '2024-01-07',
      tags: ['Security', 'Penetration Testing', 'AWS', 'Compliance', 'Automation']
    },
    {
      id: 10,
      title: 'QA Automation Engineer',
      company: 'QualityFirst',
      logo: 'https://via.placeholder.com/60',
      location: 'Denver, CO',
      type: 'Full-time',
      experience: 'Mid Level',
      remote: true,
      salary: '$100,000 - $130,000',
      description: 'Build automated testing frameworks and ensure product quality. Work with development teams to implement testing best practices.',
      requirements: ['3+ years test automation', 'Cypress/Playwright', 'API testing', 'CI/CD integration', 'TypeScript/JavaScript'],
      benefits: ['Remote work', 'Tool budget', 'Health insurance', 'Professional development', 'Flexible schedule'],
      postedDate: '2024-01-06',
      tags: ['Cypress', 'Playwright', 'TypeScript', 'CI/CD', 'API Testing']
    }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setJobs(mockJobs);
      setLoading(false);
    }, 500);
  }, []);

  const filteredJobs = jobs.filter(job => {
    const searchMatch = !filters.search || 
      job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      job.company.toLowerCase().includes(filters.search.toLowerCase()) ||
      job.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()));
    
    const locationMatch = !filters.location || job.location === filters.location;
    const typeMatch = !filters.type || job.type === filters.type;
    const experienceMatch = !filters.experience || job.experience === filters.experience;
    const remoteMatch = !filters.remote || job.remote === filters.remote;
    
    return searchMatch && locationMatch && typeMatch && experienceMatch && remoteMatch;
  });

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', location: '', type: '', experience: '', remote: false });
  };

  const toggleSaveJob = (jobId) => {
    setSavedJobs(prev => prev.includes(jobId) 
      ? prev.filter(id => id !== jobId) 
      : [...prev, jobId]
    );
  };

  const handleApply = (jobId) => {
    setAppliedJobs(prev => [...prev, jobId]);
    setShowApplyModal(false);
    alert('Application submitted successfully! The company will review your profile and contact you.');
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderJobCard = (job, showActions = true) => (
    <div key={job.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
      <div className="flex items-start space-x-4">
        <img src={job.logo} alt={job.company} className="w-14 h-14 rounded-lg object-cover" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate pr-4">{job.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{job.company}</p>
            </div>
            {showActions && (
              <button
                onClick={() => toggleSaveJob(job.id)}
                className={`p-2 rounded-full transition-colors ${savedJobs.includes(job.id) ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                aria-label={savedJobs.includes(job.id) ? 'Remove from saved' : 'Save job'}
              >
                <svg className="w-5 h-5" fill={savedJobs.includes(job.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full">{job.location}</span>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">{job.type}</span>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">{job.experience}</span>
            {job.remote && <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">🏠 Remote</span>}
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-2">{job.description}</p>
          <div className="mt-3 flex flex-wrap gap-1">
            {job.tags.slice(0, 4).map(tag => (
              <span key={tag} className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">{tag}</span>
            ))}
            {job.tags.length > 4 && <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">+{job.tags.length - 4} more</span>}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{job.salary}</span>
            {showActions && (
              <div className="flex space-x-2">
                <button
                  onClick={() => { setSelectedJob(job); setShowApplyModal(true); }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                >
                  Apply Now
                </button>
                <Link to={`/jobs/${job.id}`} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm">
                  Details
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBrowseTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 items-end mb-4">
          <div className="flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
            <div className="relative">
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Job title, company, skills..."
                className="w-full pl-10 pr-3 py-2 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
            <select name="location" value={filters.location} onChange={handleFilterChange} className="w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500">
              {locations.map(loc => <option key={loc} value={loc}>{loc || 'All Locations'}</option>)}
            </select>
          </div>
          <div className="min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Type</label>
            <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500">
              {jobTypes.map(t => <option key={t} value={t}>{t || 'All Types'}</option>)}
            </select>
          </div>
          <div className="min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Experience</label>
            <select name="experience" value={filters.experience} onChange={handleFilterChange} className="w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500">
              {experienceLevels.map(e => <option key={e} value={e}>{e || 'All Levels'}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="remote"
                checked={filters.remote}
                onChange={handleFilterChange}
                className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Remote only</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={clearFilters} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
        </h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Sort by:</span>
          <select className="rounded-md border-gray-300 px-3 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500">
            <option value="relevance">Relevance</option>
            <option value="date">Date Posted</option>
            <option value="salary">Salary</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-pulse border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="space-y-4">
          {filteredJobs.map(job => renderJobCard(job))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No jobs found</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Try adjusting your filters or search terms</p>
          <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );

  const renderSavedTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Saved Jobs ({savedJobs.length})</h2>
      {savedJobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.filter(job => savedJobs.includes(job.id)).map(job => renderJobCard(job))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No saved jobs yet</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Click the heart icon on job cards to save them for later</p>
        </div>
      )}
    </div>
  );

  const renderAppliedTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Applications ({appliedJobs.length})</h2>
      {appliedJobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.filter(job => appliedJobs.includes(job.id)).map(job => (
            <div key={job.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <img src={job.logo} alt={job.company} className="w-14 h-14 rounded-lg object-cover" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{job.company}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm">
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">Applied</span>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">{formatDate(job.postedDate)}</span>
                    </div>
                  </div>
                </div>
                <Link to={`/jobs/${job.id}`} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No applications yet</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Start applying to jobs to see them here</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-200px)] py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Job Board</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Find relevant job and internship opportunities tailored to your skills</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'browse', label: 'Browse Jobs', count: filteredJobs.length },
              { id: 'saved', label: 'Saved', count: savedJobs.length },
              { id: 'applied', label: 'Applied', count: appliedJobs.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-left text-base font-medium flex items-center justify-center space-x-2 ${activeTab === tab.id ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                <span>{tab.label}</span>
                <span className="px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          {activeTab === 'browse' && renderBrowseTab()}
          {activeTab === 'saved' && renderSavedTab()}
          {activeTab === 'applied' && renderAppliedTab()}
        </div>

        {/* Apply Modal */}
        {showApplyModal && selectedJob && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowApplyModal(false)} />
              <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Apply to {selectedJob.title}</h3>
                  <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">We'll send your SkillForge profile to {selectedJob.company}. Make sure your profile is up to date!</p>
                <div className="flex space-x-3">
                  <button onClick={() => setShowApplyModal(false)} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
                    Cancel
                  </button>
                  <button onClick={() => handleApply(selectedJob.id)} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    Submit Application
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobBoardPage;