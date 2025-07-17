'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

enum AssessmentArea {
  ProductSense = 'Product Sense',
  AnalyticalThinking = 'Analytical Thinking',
  LeadershipInfluence = 'Leadership & Influence',
  Execution = 'Execution',
  ProductStrategy = 'Product Strategy',
  BehavioralQuestions = 'Behavioral Questions'
}

const assessmentAreaDescriptions: Record<AssessmentArea, string> = {
  [AssessmentArea.ProductSense]: 'Your ability to understand user needs, define problems, and develop solutions.',
  [AssessmentArea.AnalyticalThinking]: 'Your approach to data analysis, problem-solving, and decision-making.',
  [AssessmentArea.LeadershipInfluence]: 'Your ability to lead, inspire, and influence others without formal authority.',
  [AssessmentArea.Execution]: 'Your ability to prioritize, execute, and launch products successfully.',
  [AssessmentArea.ProductStrategy]: 'Your understanding of product strategy, market analysis, and competitive landscape.',
  [AssessmentArea.BehavioralQuestions]: 'Your ability to handle conflicts, learn from failures, and work collaboratively.'
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>({});
  const [userId, setUserId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [mediaId, setMediaId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [context, setContext] = useState({
    currentRole: '',
    currentCompany: '',
    totalProductManagementExperience: '',
    totalWorkExperience: '',
    targetRole: '',
    targetCompany: '',
    jobDescription: '',
    jobDescriptionLink: ''
  });
  const [generating, setGenerating] = useState(false);
  const [selectedArea, setSelectedArea] = useState<AssessmentArea | ''>('');

  // Load user data from localStorage on component mount
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    setUserId(userData.id || '');
  }, []);

  type SessionQuestion = {
    question: string;
    reference: string;
    goal: string;
  };

  type SessionData = {
    sessionId: string;
    sessionQuestions: { questions : SessionQuestion[]};
  };

  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  const [existingDocs, setExistingDocs] = useState<{ fileName: string; mediaId: string }[]>([]);
  const [showDocsPanel, setShowDocsPanel] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);
  const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
    setMediaId('');
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('user_id', userId); // hardcoded user uuid 
    form.append('to_parse', 'true');
    const res = await fetch(`${API}/api/platform/media/upload`, {
      method: 'POST',
      body: form
    });
    const data = await res.json();
    setMediaId(data.mediaId);
    setUploading(false);
  };

interface Context {
    currentRole: string;
    currentCompany: string;
    totalProductManagementExperience: string;
    totalWorkExperience: string;
    targetRole: string;
    targetCompany: string;
    jobDescription: string;
    jobDescriptionLink: string;
}

interface ContextChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

const handleContextChange = (e: ContextChangeEvent) => {
    setContext({ ...context, [e.target.name]: e.target.value });
};

  const handleGenerate = async () => {
    setGenerating(true);
    const res = await fetch(`${API}/api/platform/context/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaId, otherContext: context, assessmentArea: selectedArea })
    });
    const data = await res.json();
    setSessionData(data);
    setGenerating(false);
  };

  // Fetch existing documents
  const fetchExistingDocs = async () => {
    setDocsLoading(true);
    setShowDocsPanel(true);
    try {
      const res = await fetch(`${API}/api/platform/media/get/${userId}`);
      const data = await res.json();
      setExistingDocs(data);
    } catch (err) {
      setExistingDocs([]);
    }
    setDocsLoading(false);
  };

  if (sessionData) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Session ID: {sessionData.sessionId}</h1>
        <ul className="space-y-4">
          {sessionData.sessionQuestions.questions.map((q, i) => (
            <li key={i} className="border p-4 rounded">
              <h2 className="font-semibold">Q{i+1}: {q.question}</h2>
              <p><span className="font-semibold">Reference:</span> {q.reference}</p>
              <p><span className="font-semibold">Goal:</span> {q.goal}</p>
            </li>
          ))}
        </ul>
        <button
          onClick={() => router.push(`/two?sessionId=${sessionData.sessionId}`)}
          className="mt-6 px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          Take Mock Interview
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-row space-x-6">
      {/* Main content */}
      <div className="flex-1 space-y-6">
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Upload PDF</h2>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="mb-2"
          />
          <button
            onClick={handleUpload}
            disabled={!file || uploading || !!mediaId}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : mediaId ? 'Uploaded' : 'Upload'}
          </button>
          {/* Remove button, only visible if mediaId is present */}
          {mediaId && (
            <button
              onClick={() => setMediaId('')}
              className="ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Remove
            </button>
          )}
          {mediaId && <p className="mt-2">Media ID: {mediaId}</p>}
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Area to Assess</h2>
          <select
            value={selectedArea}
            onChange={e => setSelectedArea(e.target.value as AssessmentArea)}
            disabled={!mediaId}
            className="border p-2 text-white rounded w-full disabled:opacity-50 mb-2"
          >
            <option className='bg-gray-600' value="">Select an area</option>
            {Object.values(AssessmentArea).map(area => (
              <option className=' bg-gray-600' key={area} value={area}>{area}</option>
            ))}
          </select>
          {selectedArea && (
            <div className="flex items-center text-sm text-gray-400 mb-2">
              <svg
                className="w-4 h-4 mr-1 text-blue-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
              </svg>
              {assessmentAreaDescriptions[selectedArea as AssessmentArea]}
            </div>
          )}
          <h2 className="font-semibold mb-2">Other Context (optional)</h2>
          <div className="grid grid-cols-1 gap-2">
            {Object.keys(context).map((key) => (
              <input
                key={key}
                name={key}
                placeholder={key}
                value={context[key as keyof typeof context]}
                onChange={handleContextChange}
                disabled={!mediaId}
                className="border p-2 rounded disabled:opacity-50"
              />
            ))}
          </div>
          <button
            onClick={handleGenerate}
            disabled={!mediaId || generating || !selectedArea}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            {generating ? (
              <span className="inline-block h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
            ) : 'Generate Interview'}
          </button>
        </div>
      </div>

      {/* Right side panel */}
      <div className="w-80 border-l pl-6">
        <button
          onClick={fetchExistingDocs}
          className="mb-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors"
        >
          Get Existing Documents
        </button>
        {showDocsPanel && (
          <div>
            {docsLoading ? (
              <div className="text-gray-400">Loading...</div>
            ) : existingDocs.length === 0 ? (
              <div className="text-gray-400">No documents found.</div>
            ) : (
              <div className="space-y-2">
                {existingDocs.map((doc) => (
                  <button
                    key={doc.mediaId}
                    className={`block w-full text-left px-3 py-2 rounded bg-gray-600 text-white hover:bg-blue-600 transition-colors`}
                    onClick={() => {
                      setMediaId(doc.mediaId);
                      setShowDocsPanel(false);
                    }}
                  >
                    {doc.fileName}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
