import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { 
  Clock, Download, ChevronLeft, CheckCircle2, XCircle, Terminal,
  AlertTriangle, Search, Filter, Users, LayoutDashboard, FileEdit, Unlock, ArrowRight, RefreshCw, Code, ShieldAlert
} from 'lucide-react';
import { Button, Badge, Input } from '../components/shared-ui';
import { NotificationDropdown } from '../components/NotificationDropdown';

export const ExaminerPortal = ({ currentUser }: { currentUser: any }) => {
  const [view, setView] = useState<'dashboard' | 'monitoring' | 'detail'>('dashboard');
  const [showPlagiarismAlert, setShowPlagiarismAlert] = useState(false);
  const [showPlagiarismModal, setShowPlagiarismModal] = useState(false);
  const [examData, setExamData] = useState<any>(null);
  const [plagiarismData, setPlagiarismData] = useState<any[]>([]);
  const [expandedPlagRow, setExpandedPlagRow] = useState<number | null>(null);
  const [plagViolations, setPlagViolations] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [samples, setSamples] = useState<any[]>([]);
  const [selectedSample, setSelectedSample] = useState<any>(null);
  const [activeExams, setActiveExams] = useState<any[]>([]);
  const [candidateDetail, setCandidateDetail] = useState<any>(null);

  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const res = await axios.get('/api/Grading/samples');
        if (res.data) setSamples(res.data);
      } catch (e) {
        console.error('Error fetching samples', e);
      }
    };
    fetchSamples();
  }, []);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get('/api/exams');
        setActiveExams(res.data);
      } catch (e) {
        console.error('Error fetching exams', e);
      }
    };
    fetchExams();
  }, []);

  const fetchDashboard = async () => {
    if (!activeSessionId) return;
    try {
      const res = await axios.get(`/api/exams/${activeSessionId}/dashboard`);
      setExamData(res.data);
    } catch (e) {
      console.error('Error fetching dashboard', e);
    }
  };

  useEffect(() => {
    if (view === 'monitoring' && activeSessionId) {
      fetchDashboard();
    }
  }, [view, activeSessionId]);

  useEffect(() => {
    if (view === 'detail' && selectedSubmissionId && activeSessionId && !selectedSample) {
      const fetchDetail = async () => {
        try {
          const res = await axios.get(`/api/exams/${activeSessionId}/submissions/${selectedSubmissionId}`);
          setCandidateDetail(res.data);
        } catch (e) {
          console.error(e);
        }
      };
      fetchDetail();
    }
  }, [view, selectedSubmissionId, activeSessionId, selectedSample]);

  useEffect(() => {
    let connection: any;
    if (activeSessionId && view === 'monitoring') {
       connection = new HubConnectionBuilder()
         .withUrl('http://localhost:5176/gradingHub')
         .withAutomaticReconnect()
         .build();
       
       connection.start().then(() => {
         console.log('Connected to SignalR hub');
         connection.on('UpdateProgress', () => {
            fetchDashboard();
         });
         connection.on('PlagiarismAlert', () => {
            setShowPlagiarismAlert(true);
         });
       }).catch((err: any) => console.error('SignalR error', err));
    }
    return () => {
      if (connection) connection.stop();
    }
  }, [activeSessionId, view]);

  const handleSessionClick = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setView('monitoring');
  };

  const handleRegrade = async () => {
    if (!selectedSubmissionId) return;
    try {
      await axios.post(`/api/Submissions/${selectedSubmissionId}/regrade`);
      alert('Regrade requested successfully');
    } catch(e) {
      console.error(e);
      alert('Failed to request regrade');
    }
  };

  const handleRunPlagiarism = async () => {
    if (!activeSessionId) return;
    try {
      await axios.post('/api/Plagiarism/check', { examId: activeSessionId });
      alert('Plagiarism scan triggered successfully');
    } catch(e) {
      alert('Failed to trigger scan');
    }
  };

  const fetchPlagiarismReport = async () => {
    if (!activeSessionId) return;
    try {
      const res = await axios.get(`/api/Plagiarism/exams/${activeSessionId}/comparisons`);
      setPlagiarismData(res.data);
      setShowPlagiarismModal(true);
      setExpandedPlagRow(null);
    } catch (e) {
      console.error(e);
      alert('Failed to fetch plagiarism report');
    }
  };

  const handleReviewCode = async (submissionId: string, idx: number) => {
    if (expandedPlagRow === idx) {
      setExpandedPlagRow(null);
      return;
    }
    try {
      const res = await axios.get(`/api/Plagiarism/submissions/${submissionId}`);
      if (res.data && res.data.violations) {
        setPlagViolations(res.data.violations);
      } else {
        setPlagViolations([]);
      }
      setExpandedPlagRow(idx);
    } catch (e) {
      console.error(e);
      alert('Failed to load violations');
    }
  };

  // --- 1. Dashboard View ---
  if (view === 'dashboard') {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white border-b border-gray-200 p-6 shadow-sm flex justify-between items-center">
          <div>
            <h1 className="font-bold text-2xl text-blue-900 flex items-center">
              <LayoutDashboard className="w-6 h-6 mr-3" /> Examiner Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">Overview of your ongoing and upcoming exam sessions.</p>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationDropdown currentUser={currentUser} />
            <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                {currentUser.fullName ? currentUser.fullName.charAt(0) : 'E'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
          <h3 className="font-semibold text-gray-800 mb-4">Active Sessions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeExams.map((exam) => (
              <div key={exam.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => handleSessionClick(exam.id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 group-hover:text-blue-700">{exam.code}</h4>
                    <p className="text-sm text-gray-500 mt-1">{exam.title}</p>
                  </div>
                  <Badge status="success" />
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Users className="w-4 h-4 mr-2" /> Active Exam Room
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" /> Max Score: {exam.maxScore}
                </div>
              </div>
            ))}
            {activeExams.length === 0 && <p className="text-sm text-gray-500">No active exams assigned to you.</p>}
          </div>

          <h3 className="font-semibold text-gray-800 mb-4 mt-8">Test Engine (Sample Submissions)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {samples.map((sample, idx) => (
                <div key={'sample-' + idx}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                     setSelectedSample(sample);
                     setView('detail');
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-full">
                      <h4 className="font-bold text-lg text-gray-900 truncate">{sample.displayName}</h4>
                      <p className="text-xs text-gray-500 mt-1 font-mono truncate" title={sample.workspacePath}>{sample.workspacePath}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-blue-600 font-medium mt-2">
                     <Terminal className="w-4 h-4 mr-2" /> Run Grading Test
                  </div>
                </div>
             ))}
             {samples.length === 0 && <p className="text-sm text-gray-500">No samples found.</p>}
          </div>
        </div>
      </div>
    );
  }

  // --- 2. Detail View ---
  if (view === 'detail') {
    if (selectedSample) {
       return <SampleTestEngineView sample={selectedSample} onBack={() => { setSelectedSample(null); setView('dashboard'); }} />;
    }
    const parsedReport = candidateDetail?.rawJsonReport ? JSON.parse(candidateDetail.rawJsonReport) : null;
    const isError = candidateDetail?.hasErrors;

    return (
      <div className="flex flex-col h-full bg-slate-50 relative font-sans">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-4">
            <button onClick={() => setView('monitoring')} className="p-1 hover:bg-slate-800 rounded-md text-slate-300">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-bold text-lg text-white">{candidateDetail?.studentName || candidateDetail?.studentCode || 'Unknown Student'}</h2>
              <p className="text-xs text-slate-400">Submitted at {candidateDetail?.completedAtUtc ? new Date(candidateDetail.completedAtUtc).toLocaleTimeString() : 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right mr-4">
              <div className="text-2xl font-bold text-white">{candidateDetail?.totalScore != null ? candidateDetail.totalScore : '-'} <span className="text-sm text-slate-400">/ 10</span></div>
              <div className="text-xs text-green-600 font-medium">{candidateDetail?.status || 'Grading'}</div>
            </div>
            <a href={`vscode://file/\\\\grading-server\\submissions\\${selectedSubmissionId || 'submission-id'}`} className="inline-flex items-center justify-center px-4 py-2 border border-blue-200 text-blue-700 hover:bg-blue-50 bg-white rounded-md text-sm font-medium transition-colors">
              <Code className="w-4 h-4 mr-2" /> Mở VS Code
            </a>
            <Button variant="secondary" className="border-orange-200 text-orange-700 hover:bg-orange-50" onClick={handleRegrade}>
              <RefreshCw className="w-4 h-4 mr-2" /> Re-grade
            </Button>
          </div>
        </div>

        <div className="flex-1 p-6 grid grid-cols-3 gap-6 h-[calc(100vh-140px)]">
          {/* Left: Test Cases */}
          <div className="col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-gray-800">Section Results</h3>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {!parsedReport?.sectionResults ? (
                <div className="p-4 text-sm text-gray-500">No detailed section results available.</div>
              ) : (
                parsedReport.sectionResults.map((sec: any, idx: number) => (
                  <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${sec.status === 'Passed' ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                    <div className={`flex items-center text-sm font-medium ${sec.status === 'Passed' ? 'text-green-700' : 'text-red-700'}`}>
                      {sec.status === 'Passed' ? <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" /> : <XCircle className="w-4 h-4 text-red-500 mr-2" />}
                      {sec.name}
                    </div>
                    <span className={`text-xs ${sec.status === 'Passed' ? 'text-green-600' : 'text-red-500'}`}>{sec.score}/{sec.maxScore} pt</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Terminal Log */}
          <div className="col-span-2 bg-gray-900 rounded-xl shadow-sm overflow-hidden flex flex-col font-mono text-sm">
            <div className="bg-gray-800 p-3 border-b border-gray-700 flex items-center">
              <Terminal className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-300 text-xs">Build & Execution Console</span>
            </div>
            <div className="p-4 text-gray-300 overflow-y-auto flex-1 space-y-2">
              {isError ? (
                <>
                  <div className="text-red-400">[ERROR] Grading process failed or container error.</div>
                  <div className="text-red-300 pl-4">{candidateDetail?.errorMessage}</div>
                </>
              ) : (
                <>
                  <div className="text-blue-400">$ Processing submission...</div>
                  <div className="text-green-400">Grading completed successfully.</div>
                  {parsedReport?.sectionResults && parsedReport.sectionResults.map((sec: any, idx: number) => (
                    <div key={idx} className="mt-2">
                      <div>Running test section: {sec.name}... <span className={sec.status === 'Passed' ? 'text-green-400' : 'text-red-400'}>{sec.status}</span></div>
                      {sec.feedback && <div className="text-gray-400 pl-4">Feedback: {sec.feedback}</div>}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 3. Live Monitoring View ---
  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* Plagiarism Alert Toast */}
      {showPlagiarismAlert && !showPlagiarismModal && (
        <div className="absolute bottom-6 right-6 bg-white border-l-4 border-red-500 shadow-xl rounded-lg p-4 max-w-sm z-50 flex items-start animate-in slide-in-from-bottom-5">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-900">Plagiarism Warning</h4>
            <p className="text-xs text-gray-600 mt-1">Similarity detected between submissions. Check report for details.</p>
            <button 
              onClick={fetchPlagiarismReport}
              className="text-xs text-red-600 font-bold mt-2 hover:underline flex items-center"
            >
              View Report <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>
          <button onClick={() => setShowPlagiarismAlert(false)} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Plagiarism Report Modal */}
      {showPlagiarismModal && (
        <div className="absolute inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-red-50">
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                <div>
                  <h3 className="font-bold text-xl text-gray-900">Plagiarism Detection Report</h3>
                  <p className="text-sm text-red-600">Automated scan results for PRN232_Slot1_Lab1</p>
                </div>
              </div>
              <button onClick={() => setShowPlagiarismModal(false)} className="p-2 text-gray-500 hover:bg-red-100 rounded-md">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              <h4 className="font-semibold text-gray-800 mb-4">Flagged Submissions</h4>
              <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <thead className="bg-gray-100 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Student A</th>
                    <th className="px-4 py-3 font-semibold">Student B</th>
                    <th className="px-4 py-3 font-semibold text-center">Similarity</th>
                    <th className="px-4 py-3 font-semibold">Detected Issue</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {plagiarismData.length > 0 ? plagiarismData.map((comp: any, idx: number) => (
                    <React.Fragment key={idx}>
                      <tr className="hover:bg-red-50/50">
                        <td className="px-4 py-3">{comp.studentIdA || comp.student1Id}</td>
                        <td className="px-4 py-3">{comp.studentIdB || comp.student2Id}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block px-2 py-1 bg-red-100 text-red-800 font-bold rounded-md">{(comp.similarityScore * 100).toFixed(1)}%</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">Guid Match: {comp.guidMatched ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-3">
                          <Button variant="danger" className="text-xs py-1.5 px-3" onClick={() => handleReviewCode(comp.submissionIdA || comp.submission1Id, idx)}>
                            {expandedPlagRow === idx ? 'Hide Code' : 'Review Code'}
                          </Button>
                        </td>
                      </tr>
                      {expandedPlagRow === idx && (
                        <tr>
                          <td colSpan={5} className="p-0 border-b-2 border-red-200">
                            <div className="bg-slate-900 text-gray-300 p-4 font-mono text-sm shadow-inner max-h-64 overflow-y-auto">
                              <h5 className="text-white font-bold mb-2 flex items-center"><Code className="w-4 h-4 mr-2"/> Violated Keywords Detail (Student A)</h5>
                              {plagViolations.length > 0 ? (
                                <ul className="space-y-2">
                                  {plagViolations.map((v, vidx) => (
                                    <li key={vidx} className="bg-slate-800 p-2 rounded">
                                      <div className="text-orange-400 font-bold">{v.bannedKeyword} <span className="text-gray-400 font-normal text-xs ml-2">in {v.fileName} (Line {v.lineNumber})</span></div>
                                      <div className="mt-1 text-gray-400 pl-2 border-l-2 border-slate-600 whitespace-pre-wrap">{v.codeSnippet}</div>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="text-gray-500">No specific keyword violations found for this submission.</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )) : (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No plagiarism detected.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-white flex justify-end">
              <Button variant="secondary" onClick={() => setShowPlagiarismModal(false)}>Close Report</Button>
            </div>
          </div>
        </div>
      )}

      {/* Topbar */}
      <div className="bg-slate-900 p-4 shadow-md flex justify-between items-center z-10 text-white">
        <div className="flex items-center">
          <button onClick={() => setView('dashboard')} className="mr-3 p-1 hover:bg-slate-800 rounded-md text-slate-300">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-xl text-white">PRN232_Slot1_Lab1</h1>
            <p className="text-sm text-slate-400">Live Monitoring • 25/30 Students Connected</p>
          </div>
        </div>
        <div className="flex space-x-3 items-center">
          <NotificationDropdown currentUser={currentUser} />
          <Button variant="secondary" onClick={handleRunPlagiarism} className="text-orange-600 border-orange-200 hover:bg-orange-50"><ShieldAlert className="w-4 h-4 mr-2" /> Run Plagiarism Check</Button>
          <div className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium border border-slate-700 flex items-center shadow-inner">
            <Clock className="w-4 h-4 mr-2" /> Live
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* Filters */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2 w-1/3">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search student..." 
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-900 outline-none"
              />
            </div>
            <Button variant="secondary" className="px-3"><Filter className="w-4 h-4" /></Button>
          </div>
          
          <div className="flex space-x-4 text-sm">
            <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> Graded (15)</div>
            <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span> Grading (3)</div>
            <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-gray-300 mr-2"></span> Working (12)</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {examData && examData.candidates && examData.candidates.length > 0 ? (
            examData.candidates.map((candidate: any) => (
              <div key={candidate.submissionId} className="bg-white rounded-xl shadow-md ring-1 ring-gray-100 hover:ring-slate-400 hover:shadow-lg transition-all cursor-pointer overflow-hidden flex flex-col" onClick={() => { setSelectedSubmissionId(candidate.submissionId); setView('detail'); }}>
                <div className="bg-slate-900 p-4 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white">{candidate.studentName || 'Unknown Student'}</h3>
                    <p className="text-xs text-slate-300 font-mono mt-0.5">{candidate.studentCode || 'N/A'}</p>
                  </div>
                  <Badge status={candidate.status === 'Graded' ? 'success' : candidate.status === 'RegradingRequested' ? 'warning' : 'loading'} />
                </div>
                <div className="p-4 flex justify-between items-center bg-white">
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Score</span>
                  <span className="font-bold text-xl text-slate-900">{candidate.totalScore != null ? `${candidate.totalScore}/10` : '-/10'}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No candidates yet</h3>
              <p className="text-sm text-gray-500 text-center max-w-md">
                There are no students connected or assigned to this exam room currently. Waiting for students to join...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SampleTestEngineView = ({ sample, onBack }: { sample: any, onBack: () => void }) => {
  const [logs, setLogs] = useState<React.ReactNode[]>([<div key="init" className="text-gray-400">System Ready. Click "Run Grading Engine" to start.</div>]);
  const [isRunning, setIsRunning] = useState(false);

  const addLog = (node: React.ReactNode) => setLogs(prev => [...prev, node]);

  const runGrading = async () => {
    setIsRunning(true);
    setLogs([<div key="start" className="text-blue-400 font-bold">--- Starting Grading Engine ---</div>]);
    let stepCount = 0;
    try {
       // Band 0
       stepCount++;
       addLog(<div key={`b0-${stepCount}`} className="text-yellow-300 mt-2">$ check-band0: Verifying static structure...</div>);
       const res0 = await axios.post('/api/Grading/check-band0', {
           submissionId: sample.submissionId || '00000000-0000-0000-0000-000000000000',
           workspacePath: sample.workspacePath,
           studentId: sample.studentId,
           examId: sample.examId || '00000000-0000-0000-0000-000000000000'
       });
       const b0 = res0.data;
       const actualSubmissionId = b0.submissionId || sample.submissionId || '00000000-0000-0000-0000-000000000000';

       if (b0.band0Passed) {
           addLog(<div key={`b0s-${stepCount}`} className="text-green-400"> [SUCCESS] Project structure and naming conventions passed.</div>);
       } else {
           addLog(<div key={`b0e-${stepCount}`} className="text-red-400"> [ERROR] Band 0 Failed.</div>);
       }
       if (b0.namingViolations && b0.namingViolations.length > 0) {
           addLog(<div key={`b0v-${stepCount}`} className="text-orange-400"> [WARNING] Naming Violations ({b0.scoreDeducted} pts deducted):</div>);
           b0.namingViolations.forEach((v: string, i: number) => addLog(<div key={`b0v-${stepCount}-${i}`} className="text-orange-300 pl-4">- {v}</div>));
       }
       
       if (!b0.band0Passed && b0.buildErrors && b0.buildErrors.length > 0) {
           addLog(<div key={`b0be-${stepCount}`} className="text-red-400 pl-4">Critical errors found:</div>);
           b0.buildErrors.forEach((e: string, i: number) => addLog(<div key={`b0be-${stepCount}-${i}`} className="text-red-300 pl-6">{e}</div>));
           throw new Error("Static structure checks failed critically.");
       }
       
       // Band 1
       stepCount++;
       addLog(<div key={`b1-${stepCount}`} className="text-yellow-300 mt-4">$ check-band1: Building solution...</div>);
       const res1 = await axios.post('/api/Grading/check-band1', {
           submissionId: actualSubmissionId,
           workspacePath: sample.workspacePath
       });
       const b1 = res1.data;
       if (b1.band1Passed) {
           addLog(<div key={`b1s-${stepCount}`} className="text-green-400"> [SUCCESS] Build completed with 0 syntax errors.</div>);
       } else {
           addLog(<div key={`b1e-${stepCount}`} className="text-red-400"> [ERROR] Build failed.</div>);
           if (b1.buildErrors && b1.buildErrors.length > 0) {
              b1.buildErrors.forEach((e: string, i: number) => addLog(<div key={`b1e-${stepCount}-${i}`} className="text-red-300 pl-4">{e}</div>));
           }
           throw new Error("Build failed.");
       }

       // Band 2
       stepCount++;
       addLog(<div key={`b2-${stepCount}`} className="text-yellow-300 mt-4">$ check-band2: Running test sections...</div>);
       const res2 = await axios.post('/api/Grading/check-band2', {
           submissionId: actualSubmissionId,
           workspacePath: sample.workspacePath,
           sectionName: "Band2",
           maxScore: 10,
           testCases: []
       });
       const b2 = res2.data;
       
       if (b2.testSectionResults && b2.testSectionResults.length > 0) {
          b2.testSectionResults.forEach((sec: any, secIdx: number) => {
             addLog(<div key={`b2sec-${secIdx}`} className="text-blue-300 mt-2 font-bold">» Section: {sec.sectionName} (Score: {sec.score}/{sec.maxScore})</div>);
             if (sec.testCases) {
                sec.testCases.forEach((tc: any, tcIdx: number) => {
                   if (tc.passed) {
                      addLog(<div key={`tc-${secIdx}-${tcIdx}`} className="text-green-400 pl-4">✔️ {tc.name} [PASS]</div>);
                   } else {
                      addLog(<div key={`tc-${secIdx}-${tcIdx}`} className="text-red-400 pl-4">❌ {tc.name} [FAIL]</div>);
                      if (tc.errorMessage) {
                         addLog(<div key={`tcerr-${secIdx}-${tcIdx}`} className="text-red-300 pl-8 text-xs">{tc.errorMessage}</div>);
                      }
                   }
                });
             }
          });
       }
       
       addLog(<div key="b2-final" className="mt-4"><span className="text-white bg-blue-900 px-3 py-1 rounded-md inline-block font-bold text-lg border border-blue-400">🏆 FINAL SCORE: {b2.finalScore}/10</span></div>);

       addLog(<div key="end" className="text-blue-400 font-bold mt-4">--- Grading Completed ---</div>);
    } catch(e: any) {
       addLog(<div key="err" className="text-red-500 font-bold mt-4">FATAL ERROR: {e.message}</div>);
    } finally {
       setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative font-sans">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-1 hover:bg-slate-800 rounded-md text-slate-300">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="overflow-hidden max-w-xl">
              <h2 className="font-bold text-lg text-white truncate">Test Engine: {sample.displayName}</h2>
              <p className="text-xs text-slate-400 font-mono truncate">{sample.workspacePath}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
             <Button variant="primary" onClick={runGrading} disabled={isRunning} className="bg-blue-600 hover:bg-blue-700 text-white border-0">
                <Terminal className="w-4 h-4 mr-2" /> {isRunning ? 'Running...' : 'Run Grading Engine'}
             </Button>
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col h-[calc(100vh-80px)]">
           <div className="flex-1 bg-gray-900 rounded-xl shadow-sm overflow-hidden flex flex-col font-mono text-sm">
             <div className="bg-gray-800 p-3 border-b border-gray-700 flex items-center">
               <Terminal className="w-4 h-4 text-gray-400 mr-2" />
               <span className="text-gray-300 text-xs">Live Output Console</span>
             </div>
             <div className="p-4 overflow-y-auto flex-1">
               {logs}
             </div>
           </div>
        </div>
    </div>
  );
}
