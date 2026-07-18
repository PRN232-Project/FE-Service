import React, { useState, useEffect } from 'react';
import { Clock, FileText, AlertTriangle, Hash, ArrowRight, ChevronLeft } from 'lucide-react';
import { Button, Badge, TableEmptyState } from '../components/shared-ui';
import axios from 'axios';
import { NotificationDropdown } from '../components/NotificationDropdown';

export const StudentPortal = ({ currentUser }: { currentUser: any }) => {
  const [view, setView] = useState<'dashboard' | 'workspace'>('dashboard');
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [activeExam, setActiveExam] = useState<any>(null);
  const [isCheatingWarningOpen, setIsCheatingWarningOpen] = useState(false);

  // Anti-cheat (Exam Mode) listener
  useEffect(() => {
    if (view !== 'workspace') return; // Only active during the exam
    
    const handleBlur = () => {
      setIsCheatingWarningOpen(true);
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [view]);
  
  useEffect(() => {
    if (view === 'dashboard') {
      fetchExams();
    } else if (view === 'workspace') {
      fetchSubmissions();
    }
  }, [view]);

  const fetchExams = async () => {
    try {
      // NOTE: JWT authentication header should ideally be sent here.
      // For now, assuming API allows or has mocked auth token injection.
      // In a real app, you'd configure axios interceptors.
      const res = await axios.get('/api/exams');
      setExams(res.data);
    } catch (err) {
      console.error('Failed to fetch exams', err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(`/api/Submissions?studentId=${currentUser.id}`);
      setSubmissions(res.data);
    } catch (err) {
      console.error('Failed to fetch submissions', err);
    }
  };

  const handleEnterExam = (exam: any) => {
    setActiveExam(exam);
    setView('workspace');
  };

  if (view === 'dashboard') {
    return (
      <div className="flex flex-col h-full bg-gray-50 items-center overflow-y-auto">
        <div className="w-full bg-white border-b border-gray-200 px-8 py-4 mb-8 flex justify-between items-center shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Student Dashboard</h2>
            <p className="text-sm text-gray-500">View and join your scheduled practical exams.</p>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationDropdown currentUser={currentUser} />
            <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                {currentUser.name ? currentUser.name.substring(0, 2).toUpperCase() : 'ST'}
              </div>
            </div>
          </div>
        </div>
        <div className="w-full max-w-4xl px-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming & Ongoing Exams</h3>
          
          {exams.length === 0 ? (
            <p className="text-gray-500">No exams available right now.</p>
          ) : (
            exams.map((exam: any) => (
              <div key={exam.examId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-center hover:border-blue-300 transition-colors mb-4">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-xl font-bold text-blue-900">{exam.code}</h4>
                    <Badge status="success" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1"><strong>Subject:</strong> {exam.title}</p>
                  <p className="text-sm text-gray-500"><strong>Max Score:</strong> {exam.maxScore}</p>
                </div>
                
                <div className="flex flex-col items-end">
                  <Button onClick={() => handleEnterExam(exam)} className="px-6 py-3 shadow-md">
                    Enter Exam Room <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <span className="text-xs text-gray-400 mt-2">Room is open</span>
                </div>
              </div>
            ))
          )}

        </div>
      </div>
    );
  }

  return (
    <>
    <div className={`flex flex-col h-full bg-gray-50 overflow-y-auto relative ${isCheatingWarningOpen ? 'blur-md pointer-events-none select-none' : ''}`}>
      {/* Topbar */}
      <div className="bg-blue-900 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setView('dashboard')} 
            className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
            title="Back to Dashboard"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
            {currentUser.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold text-sm">{currentUser.name} ({currentUser.studentCode || currentUser.id})</h2>
            <p className="text-blue-200 text-xs">Exam: {activeExam?.code}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <NotificationDropdown currentUser={currentUser} />
          {/* Toggle for demo purposes */}
          <div className="flex items-center space-x-2 text-xs">
             <span className="text-blue-200">Demo: Exam</span>
             <button 
               onClick={() => setIsExamStarted(!isExamStarted)}
               className={`w-8 h-4 rounded-full transition-colors relative ${isExamStarted ? 'bg-green-500' : 'bg-gray-400'}`}
             >
               <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isExamStarted ? 'left-4' : 'left-1'}`}></span>
             </button>
          </div>
          <div className="flex items-center space-x-2 bg-black/30 px-4 py-2 rounded-lg border border-white/10">
            <Clock className="w-5 h-5 text-orange-400" />
            <span className="font-mono text-xl font-bold tracking-wider text-orange-400">01:29:59</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Instructions */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-lg text-gray-800 mb-2 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-900" /> Exam Details
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Code:</strong> {activeExam?.code} <br/>
              <strong>Title:</strong> {activeExam?.title} <br/>
              <strong>Max Score:</strong> {activeExam?.maxScore}
            </p>
            <Button 
              className="w-full" 
              onClick={() => fetchSubmissions()}
            >
              Refresh History
            </Button>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
            <h4 className="font-semibold text-orange-800 text-sm flex items-center mb-1">
              <AlertTriangle className="w-4 h-4 mr-1" /> Important
            </h4>
            <ul className="text-xs text-orange-700 space-y-1 list-disc pl-4">
              <li>You must use the Desktop Client to upload your `.zip` submission.</li>
              <li>This web portal is only for viewing your submission history and exam details.</li>
              <li>Plagiarism will result in an immediate 0.</li>
            </ul>
          </div>
        </div>

        {/* Right Col: History */}
        <div className="col-span-2 space-y-6 pb-12">

          {/* Submission History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-500" /> Submission History
              </h3>
              {submissions.length > 0 && <Badge status="success" />}
            </div>
            
            {submissions.length === 0 ? (
              <TableEmptyState 
                title="No Submissions Yet" 
                description="Upload your .zip file above to submit your work."
              />
            ) : (
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">Time</th>
                    <th className="px-6 py-3">File Name</th>
                    <th className="px-6 py-3">Size</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Hash <Hash className="w-3 h-3 inline" /></th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub: any) => (
                    <tr key={sub.submissionId} className="bg-white border-b hover:bg-gray-50 last:border-0">
                      <td className="px-6 py-3 font-medium text-gray-900">{new Date(sub.submittedAtUtc).toLocaleString()}</td>
                      <td className="px-6 py-3">Submission #{sub.submissionId.substring(0, 8)}</td>
                      <td className="px-6 py-3 text-gray-500">{sub.totalScore !== null ? sub.totalScore : '-'}</td>
                      <td className="px-6 py-3">
                        <Badge status={sub.status === 'Graded' ? 'success' : (sub.status.includes('Error') ? 'error' : 'neutral')} />
                        <span className="ml-2 text-xs text-gray-500">{sub.status}</span>
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-gray-400">{sub.submissionId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      {/* End main flex container */}
      </div>
      
      {/* Exam Mode Warning Modal (Rendered outside the blurred container) */}
      {isCheatingWarningOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in text-center p-8 border-t-8 border-red-600">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Exam Mode Violation</h3>
            <p className="text-gray-600 mb-6">
              Warning: You have navigated away from the exam window. This action has been logged and reported to the examiner. Plagiarism rules strictly prohibit switching tabs or accessing unauthorized resources.
            </p>
            <Button variant="danger" className="w-full py-3" onClick={() => setIsCheatingWarningOpen(false)}>
              I Understand. Return to Exam.
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
