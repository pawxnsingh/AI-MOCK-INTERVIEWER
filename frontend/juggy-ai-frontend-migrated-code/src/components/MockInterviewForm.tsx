"use client"
import axios from 'axios';
import router from 'next/router';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface MockInterviewFormProps {
  onStartInterview: (prompt: string, type: string, additionalData: any) => void;
}

interface Document {
  fileName: string;
  mediaId: string;
}

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

enum AssessmentArea {
  ProductSense = 'Product Sense',
  AIProductManagement = 'AI Product Management',
  AnalyticalThinking = 'Analytical Thinking',
  LeadershipInfluence = 'Leadership & Influence',
  Execution = 'Execution',
  ProductStrategy = 'Product Strategy',
  BehavioralQuestions = 'Behavioral Questions'
}

export const MockInterviewForm: React.FC<MockInterviewFormProps> = ({
  onStartInterview,
}) => {
  const [formData, setFormData] = useState({
    currentRole: '',
    currentCompany: '',
    totalProductManagementExperience: '',
    totalWorkExperience: '',
    targetRole: '',
    targetCompany: '',
    jobDescription: '',
    jobDescriptionLink: '',
    selected_area: ''
  });
  const [jobLink, setJobLink] = useState('');
  const [useJobLink, setUseJobLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [mediaId, setMediaId] = useState('');
  const [sessionData, setSessionData] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadAttempted, setUploadAttempted] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);
  const [showDocsPanel, setShowDocsPanel] = useState(false);
  const [existingDocs, setExistingDocs] = useState<Document[]>([]);
  const [token, setToken] = useState<string>('');
  const [user, setUser] = useState<any>({});
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setToken(storedToken || '');
      setUser(storedUser);
      setUserId(storedUser.id || '');
    }
  }, []);

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleJobLinkScrape = async () => {
    if (!jobLink) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API}/api/scrape-job`, {
        job_link: jobLink,
        current_role: formData.currentRole,
        current_company: formData.currentCompany,
        pm_experience: parseInt(formData.totalProductManagementExperience),
        total_experience: parseInt(formData.totalWorkExperience)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFormData({
        ...formData,
        targetRole: response.data.target_role,
        targetCompany: response.data.target_company,
        jobDescription: response.data.job_description
      });
    } catch (error) {
      toast.error('Failed to scrape job details. Please fill manually.');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requestData = {
        mediaId: mediaId || '',
        assessmentArea: formData.selected_area,
        otherContext: {
          ...formData,
          pm_experience: parseInt(formData.totalProductManagementExperience),
          total_experience: parseInt(formData.totalWorkExperience)
        }
      };

      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(`${API}/api/platform/context/upload`, requestData, { headers });
      // const response = await axios.post(`${API}/api/platform/context/upload/v2`, requestData, { headers });
      setSessionData(response.data);
      onStartInterview(response?.data?.sessionId, 'mock_interview', response?.data)
    } catch (error) {
      console.error('Failed to create session for interview:', error);
      toast.error('Failed to create session for interview');
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setMediaId('');
      setUploadAttempted(false);
      handleUpload(selectedFile);
    } else {
      setFile(null);
      setMediaId('');
      setUploadAttempted(false);
    }
  };

  const handleUpload = async (fileToUpload?: File) => {
    const fileToUse = fileToUpload || file;
    if (!fileToUse) return;
    setUploading(true);
    setUploadAttempted(true);

    try {
      const form = new FormData();
      form.append('file', fileToUse);
      form.append('user_id', userId);
      form.append('to_parse', 'true');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${API}/api/platform/media/upload`, {
      // const res = await fetch(`${API}/api/platform/media/upload/v2`, {
        method: 'POST',
        headers,
        body: form
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status: ${res.status}`);
      }

      const data = await res.json();
      setMediaId(data.mediaId);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file. Please try again.');
      setMediaId('');
    } finally {
      setUploading(false);
    }
  };

  const fetchExistingDocs = async () => {
    setDocsLoading(true);
    setShowDocsPanel(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${API}/api/platform/media/get/${userId}`, { headers });

      if (!res.ok) {
        throw new Error(`Failed to fetch documents: ${res.status}`);
      }

      const data = await res.json();
      setExistingDocs(data);
    } catch (err) {
      console.error('Error fetching documents:', err);
      toast.error('Failed to fetch existing documents');
      setExistingDocs([]);
    }
    setDocsLoading(false);
  };

  const selectExistingDoc = (doc: Document) => {
    setMediaId(doc.mediaId);
    setFile(null);
    setUploadAttempted(false);
  };

  const handleBack = () => {
    if (history.length > 1) {
      history.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex mb-6">
            <button onClick={handleBack} className="mr-4 cursor-pointer text-gray-600 hover:text-gray-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex flex-col">
              <h2 className="text-3xl font-bold text-gray-900">Mock Interview Setup</h2>
              <p className="text-gray-600 text-sm mt-2">Enter the below optional details to see the real magic of the mock interviewer. You can start without these details as well. Just click on 'Start Mock Interview'.</p>
            </div>
          </div>

          <div className="pb-6 rounded">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload PDF <span className="text-gray-400">(optional)</span></label>
            <div className="relative">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:ring-blue-500 focus:border-blue-500 mb-3 cursor-pointer bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <span className="text-gray-500">
                  {file ? file.name : "Choose File"}
                </span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </label>
            </div>

            <div className="mb-4">
              <button
                type="button"
                onClick={fetchExistingDocs}
                disabled={docsLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {docsLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Existing Documents
                  </>
                )}
              </button>
            </div>

            {/* Existing Documents List */}
            {showDocsPanel && !docsLoading && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Your Uploaded Documents</h3>
                {existingDocs.length === 0 ? (
                  <p className="text-sm text-gray-500">No documents found. Upload a new document above.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {existingDocs.map((doc) => (
                      <div
                        key={doc.mediaId}
                        onClick={() => selectExistingDoc(doc)}
                        className={`p-3 rounded-md border cursor-pointer transition-colors ${mediaId === doc.mediaId
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate">{doc.fileName}</p>
                              <p className="text-xs text-gray-500">Click to select this document</p>
                            </div>
                          </div>
                          {mediaId === doc.mediaId && (
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Status and Actions Section */}
            <div className="space-y-3">
              {/* Upload Status */}
              {uploading && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-medium">Uploading...</p>
                </div>
              )}

              {!uploading && mediaId && (
                <div className="flex items-center gap-2 text-green-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium">
                    {uploadAttempted ?
                      'Uploaded Successfully!'
                      : 'Document Selected!'
                    }</p>
                </div>
              )}

              {!uploading && !mediaId && uploadAttempted && (
                <div className="flex items-center gap-2 text-red-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium">Upload failed. Please try again.</p>
                </div>
              )}

              {/* Remove Button */}
              {mediaId && !uploading && (
                <button
                  onClick={() => {
                    setMediaId('');
                    setUploadAttempted(false);
                    setFile(null);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove File
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 border-t pt-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Area to Assess <span className="text-gray-400">(optional)</span></label>
              <select
                name="selected_area"
                value={formData.selected_area}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              >
                <option value="">Select an area</option>
                {Object.values(AssessmentArea).map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Role <span className="text-gray-400">(optional)</span></label>
                <input
                  type="text"
                  name="currentRole"
                  value={formData.currentRole}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Company <span className="text-gray-400">(optional)</span></label>
                <input
                  type="text"
                  name="currentCompany"
                  value={formData.currentCompany}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Product management experience (yrs) <span className="text-gray-400">(optional)</span></label>
                <input
                  type="number"
                  name="totalProductManagementExperience"
                  value={formData.totalProductManagementExperience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total work experience (yrs) <span className="text-gray-400">(optional)</span></label>
                <input
                  type="number"
                  name="totalWorkExperience"
                  value={formData.totalWorkExperience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="useJobLink"
                  checked={useJobLink}
                  onChange={(e) => setUseJobLink(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="useJobLink" className="text-sm font-medium text-gray-700">
                  I have a job posting URL to auto-fill details
                </label>
              </div>

              {useJobLink && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Posting URL <span className="text-gray-400">(optional)</span></label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={jobLink}
                      onChange={(e) => setJobLink(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleJobLinkScrape}
                      disabled={loading || !jobLink}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                    >
                      {loading ? 'Scraping...' : 'Auto-fill'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Role <span className="text-gray-400">(optional)</span></label>
                <input
                  type="text"
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Company <span className="text-gray-400">(optional)</span></label>
                <input
                  type="text"
                  name="targetCompany"
                  value={formData.targetCompany}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Description <span className="text-gray-400">(optional)</span></label>
              <textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Paste the job description here..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 cursor-pointer text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Setting up interview...' : 'Start Mock Interview'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}; 