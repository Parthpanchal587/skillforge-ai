import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

const ResumeBuilderPage = () => {
  const { user } = useStore();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    personal: {
      fullName: user?.username || '',
      email: user?.email || '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      website: '',
      summary: ''
    },
    experience: [
      { id: 1, company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '' }
    ],
    education: [
      { id: 1, institution: '', degree: '', field: '', location: '', startDate: '', endDate: '', gpa: '' }
    ],
    skills: { technical: '', soft: '', languages: '', certifications: '' },
    projects: [
      { id: 1, name: '', description: '', technologies: '', link: '', startDate: '', endDate: '' }
    ]
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [nextId, setNextId] = useState({ experience: 2, education: 2, projects: 2 });

  const steps = [
    { title: 'Personal Info', icon: '👤' },
    { title: 'Experience', icon: '💼' },
    { title: 'Education', icon: '🎓' },
    { title: 'Skills', icon: '🛠️' },
    { title: 'Projects', icon: '🚀' },
    { title: 'Preview', icon: '👁️' }
  ];

  const handleChange = (section, field, value, index = null) => {
    if (index !== null && Array.isArray(formData[section])) {
      const newArray = [...formData[section]];
      newArray[index] = { ...newArray[index], [field]: value };
      setFormData(prev => ({ ...prev, [section]: newArray }));
    } else {
      setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    }
  };

  const addItem = (section) => {
    const newItem = { id: nextId[section], ...getEmptyItem(section) };
    setFormData(prev => ({ ...prev, [section]: [...prev[section], newItem] }));
    setNextId(prev => ({ ...prev, [section]: prev[section] + 1 }));
  };

  const removeItem = (section, id) => {
    if (formData[section].length <= 1) return;
    setFormData(prev => ({ ...prev, [section]: prev[section].filter(item => item.id !== id) }));
  };

  const getEmptyItem = (section) => {
    switch (section) {
      case 'experience':
        return { company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '' };
      case 'education':
        return { institution: '', degree: '', field: '', location: '', startDate: '', endDate: '', gpa: '' };
      case 'projects':
        return { name: '', description: '', technologies: '', link: '', startDate: '', endDate: '' };
      default:
        return {};
    }
  };

  const downloadPDF = () => {
    const element = document.getElementById('resume-preview');
    if (element) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>${formData.personal.fullName} - Resume</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; }
              .header h1 { margin: 0; font-size: 28px; color: #1f2937; }
              .header p { margin: 5px 0; color: #6b7280; }
              .section { margin-bottom: 25px; }
              .section h2 { font-size: 18px; color: #4f46e5; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px; }
              .item { margin-bottom: 15px; }
              .item h3 { margin: 0 0 5px 0; font-size: 16px; color: #1f2937; }
              .item .meta { color: #6b7280; font-size: 14px; margin-bottom: 5px; }
              .item p { margin: 5px 0; line-height: 1.6; }
              .skills-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
              .skill-category { background: #f3f4f6; padding: 10px; border-radius: 5px; }
              .skill-category h4 { margin: 0 0 5px 0; font-size: 14px; color: #4f46e5; }
              .skill-category p { margin: 0; font-size: 13px; color: #374151; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>${element.innerHTML}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
    }
  };

  const generateResumeHTML = () => {
    const { personal, experience, education, skills, projects } = formData;
    return `
      <div class="header">
        <h1>${personal.fullName || 'Your Name'}</h1>
        <p>${personal.email || ''} ${personal.phone ? '| ' + personal.phone : ''} ${personal.location ? '| ' + personal.location : ''}</p>
        <p>
          ${personal.linkedin ? `<a href="${personal.linkedin}" target="_blank">LinkedIn</a>` : ''}
          ${personal.github ? ` | <a href="${personal.github}" target="_blank">GitHub</a>` : ''}
          ${personal.website ? ` | <a href="${personal.website}" target="_blank">Website</a>` : ''}
        </p>
      </div>
      
      ${personal.summary ? `
      <div class="section">
        <h2>Professional Summary</h2>
        <p>${personal.summary}</p>
      </div>
      ` : ''}

      ${experience.some(e => e.company || e.position) ? `
      <div class="section">
        <h2>Work Experience</h2>
        ${experience.filter(e => e.company || e.position).map(exp => `
        <div class="item">
          <h3>${exp.position} at ${exp.company}</h3>
          <div class="meta">${exp.location} | ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
          <p>${exp.description}</p>
        </div>
        `).join('')}
      </div>
      ` : ''}

      ${education.some(e => e.institution || e.degree) ? `
      <div class="section">
        <h2>Education</h2>
        ${education.filter(e => e.institution || e.degree).map(edu => `
        <div class="item">
          <h3>${edu.degree} in ${edu.field}</h3>
          <div class="meta">${edu.institution}, ${edu.location} | ${edu.startDate} - ${edu.endDate} ${edu.gpa ? '| GPA: ' + edu.gpa : ''}</div>
        </div>
        `).join('')}
      </div>
      ` : ''}

      ${(skills.technical || skills.soft || skills.languages || skills.certifications) ? `
      <div class="section">
        <h2>Skills</h2>
        <div class="skills-grid">
          ${skills.technical ? `<div class="skill-category"><h4>Technical</h4><p>${skills.technical}</p></div>` : ''}
          ${skills.soft ? `<div class="skill-category"><h4>Soft Skills</h4><p>${skills.soft}</p></div>` : ''}
          ${skills.languages ? `<div class="skill-category"><h4>Languages</h4><p>${skills.languages}</p></div>` : ''}
          ${skills.certifications ? `<div class="skill-category"><h4>Certifications</h4><p>${skills.certifications}</p></div>` : ''}
        </div>
      </div>
      ` : ''}

      ${projects.some(p => p.name || p.description) ? `
      <div class="section">
        <h2>Projects</h2>
        ${projects.filter(p => p.name || p.description).map(proj => `
        <div class="item">
          <h3>${proj.name} ${proj.link ? `<a href="${proj.link}" target="_blank" style="font-size:12px; margin-left:10px;">View</a>` : ''}</h3>
          <div class="meta">${proj.technologies} | ${proj.startDate} - ${proj.endDate}</div>
          <p>${proj.description}</p>
        </div>
        `).join('')}
      </div>
      ` : ''}
    `;
  };

  const renderStep = () => {
    const { personal, experience, education, skills, projects } = formData;

    switch (activeStep) {
      case 0: // Personal Info
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Personal Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
                <input type="text" value={personal.fullName} onChange={e => handleChange('personal', 'fullName', e.target.value)} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                <input type="email" value={personal.email} onChange={e => handleChange('personal', 'email', e.target.value)} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                <input type="tel" value={personal.phone} onChange={e => handleChange('personal', 'phone', e.target.value)} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                <input type="text" value={personal.location} onChange={e => handleChange('personal', 'location', e.target.value)} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" placeholder="City, State" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">LinkedIn URL</label>
                <input type="url" value={personal.linkedin} onChange={e => handleChange('personal', 'linkedin', e.target.value)} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" placeholder="https://linkedin.com/in/yourname" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">GitHub URL</label>
                <input type="url" value={personal.github} onChange={e => handleChange('personal', 'github', e.target.value)} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" placeholder="https://github.com/yourname" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Portfolio/Website</label>
                <input type="url" value={personal.website} onChange={e => handleChange('personal', 'website', e.target.value)} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" placeholder="https://yourportfolio.com" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Professional Summary</label>
                <textarea value={personal.summary} onChange={e => handleChange('personal', 'summary', e.target.value)} rows={4} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" placeholder="A brief 2-3 sentence summary of your professional background and career goals..." />
              </div>
            </div>
          </div>
        );

      case 1: // Experience
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Work Experience</h2>
              <button onClick={() => addItem('experience')} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm">+ Add Experience</button>
            </div>
            {experience.map((exp, index) => (
              <div key={exp.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">Experience #{index + 1}</h3>
                  <button onClick={() => removeItem('experience', exp.id)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company *</label>
                    <input type="text" value={exp.company} onChange={e => handleChange('experience', 'company', e.target.value, index)} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Position *</label>
                    <input type="text" value={exp.position} onChange={e => handleChange('experience', 'position', e.target.value, index)} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                    <input type="text" value={exp.location} onChange={e => handleChange('experience', 'location', e.target.value, index)} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                    <input type="month" value={exp.startDate} onChange={e => handleChange('experience', 'startDate', e.target.value, index)} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                    <input type="month" value={exp.endDate} onChange={e => handleChange('experience', 'endDate', e.target.value, index)} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={exp.current} onChange={e => handleChange('experience', 'current', e.target.checked, index)} className="h-4 w-4 text-indigo-600 rounded" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Currently working here</span>
                    </label>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <textarea value={exp.description} onChange={e => handleChange('experience', 'description', e.target.value, index)} rows={3} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" placeholder="Describe your responsibilities and achievements..." />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 2: // Education
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Education</h2>
              <button onClick={() => addItem('education')} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm">+ Add Education</button>
            </div>
            {education.map((edu, index) => (
              <div key={edu.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">Education #{index + 1}</h3>
                  <button onClick={() => removeItem('education', edu.id)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Institution *</label>
                    <input type="text" value={edu.institution} onChange={e => handleChange('education', 'institution', e.target.value, index)} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Degree *</label>
                    <input type="text" value={edu.degree} onChange={e => handleChange('education', 'degree', e.target.value, index)} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" placeholder="Bachelor of Science, Master of Arts, etc." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Field of Study</label>
                    <input type="text" value={edu.field} onChange={e => handleChange('education', 'field', e.target.value, index)} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" placeholder="Computer Science, Business, etc." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                    <input type="text" value={edu.location} onChange={e => handleChange('education', 'location', e.target.value, index)} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                    <input type="month" value={edu.startDate} onChange={e => handleChange('education', 'startDate', e.target.value, index)} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                    <input type="month" value={edu.endDate} onChange={e => handleChange('education', 'endDate', e.target.value, index)} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">GPA</label>
                    <input type="text" value={edu.gpa} onChange={e => handleChange('education', 'gpa', e.target.value, index)} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" placeholder="3.8/4.0" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 3: // Skills
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Skills</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Technical Skills</label>
                <textarea value={skills.technical} onChange={e => handleChange('skills', 'technical', e.target.value)} rows={4} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" placeholder="JavaScript, React, Node.js, Python, SQL, AWS, Docker, Git, etc." />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Comma-separated list of technical skills</p>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Soft Skills</label>
                <textarea value={skills.soft} onChange={e => handleChange('skills', 'soft', e.target.value)} rows={3} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" placeholder="Communication, Leadership, Problem Solving, Teamwork, etc." />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Languages</label>
                <textarea value={skills.languages} onChange={e => handleChange('skills', 'languages', e.target.value)} rows={2} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" placeholder="English (Native), Spanish (Fluent), etc." />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Certifications</label>
                <textarea value={skills.certifications} onChange={e => handleChange('skills', 'certifications', e.target.value)} rows={3} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" placeholder="AWS Certified Solutions Architect, PMP, etc." />
              </div>
            </div>
          </div>
        );

      case 4: // Projects
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Projects</h2>
              <button onClick={() => addItem('projects')} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm">+ Add Project</button>
            </div>
            {projects.map((proj, index) => (
              <div key={proj.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">Project #{index + 1}</h3>
                  <button onClick={() => removeItem('projects', proj.id)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Name *</label>
                    <input type="text" value={proj.name} onChange={e => handleChange('projects', 'name', e.target.value, index)} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Link</label>
                    <input type="url" value={proj.link} onChange={e => handleChange('projects', 'link', e.target.value, index)} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" placeholder="https://github.com/... or live demo URL" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Technologies</label>
                    <input type="text" value={proj.technologies} onChange={e => handleChange('projects', 'technologies', e.target.value, index)} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" placeholder="React, Node.js, MongoDB, etc." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                    <input type="month" value={proj.startDate} onChange={e => handleChange('projects', 'startDate', e.target.value, index)} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                    <input type="month" value={proj.endDate} onChange={e => handleChange('projects', 'endDate', e.target.value, index)} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <textarea value={proj.description} onChange={e => handleChange('projects', 'description', e.target.value, index)} rows={3} className="block w-full rounded-md border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" placeholder="Describe the project, your role, and key achievements..." />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 5: // Preview
        return (
          <div id="resume-preview" className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 max-w-3xl mx-auto" style={{ fontFamily: 'Arial, sans-serif', color: '#333' }}>
            <div dangerouslySetInnerHTML={{ __html: generateResumeHTML() }} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Resume Builder</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Create your professional resume with our step-by-step builder</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.title}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    index < activeStep ? 'bg-indigo-600 text-white' :
                    index === activeStep ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500' :
                    'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {index < activeStep ? '✓' : step.icon}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${index <= activeStep ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${index < activeStep ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            {renderStep()}
          </div>
          
          {/* Navigation */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-between">
            <button
              onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
              disabled={activeStep === 0}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex space-x-3">
              {activeStep < steps.length - 1 ? (
                <button
                  onClick={() => setActiveStep(prev => Math.min(steps.length - 1, prev + 1))}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Next
                </button>
              ) : (
                <>
                  <button
                    onClick={downloadPDF}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {previewMode ? 'Edit' : 'Preview'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilderPage;