import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Clock, ChevronLeft, CheckCircle2, XCircle, Terminal,
  LayoutDashboard, Users, RefreshCw, AlertTriangle, ShieldAlert, X
} from 'lucide-react';
import { Button, Badge, Input } from '../components/shared-ui';
import { NotificationDropdown } from '../components/NotificationDropdown';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router';
import { useSignalRStore } from '../store/useSignalRStore';

export const LecturerPortal = ({ currentUser }: { currentUser: any }) => {
  const navigate = useNavigate();
  return (
    <Routes>
      <Route path="batches" element={<Dashboard currentUser={currentUser} navigate={navigate} />} />
      <Route path="batches/:id" element={<BatchDetail currentUser={currentUser} navigate={navigate} />} />
      <Route path="*" element={<Navigate to="/lecturer/batches" replace />} />
    </Routes>
  );
};

const Dashboard = ({ currentUser, navigate }: { currentUser: any, navigate: any }) => {
  const [batches, setBatches] = useState<any[]>([]);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await axios.get('/api/grading-batches/mine');
        if (Array.isArray(res.data)) {
          setBatches(res.data);
        } else {
          console.error("Expected array from /api/grading-batches/mine but got:", typeof res.data);
        }
      } catch (e) {
        console.error('Error fetching batches', e);
      }
    };
    fetchBatches();
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-6 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="font-bold text-2xl text-blue-900 flex items-center">
            <LayoutDashboard className="w-6 h-6 mr-3" /> Lecturer Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your assigned grading batches.</p>
        </div>
        <div className="flex items-center space-x-4">
          <NotificationDropdown currentUser={currentUser} />
          <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {currentUser.name ? currentUser.name.charAt(0) : 'L'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <h3 className="font-semibold text-gray-800 mb-4">Assigned Batches</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <div key={batch.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              onClick={() => navigate(`/lecturer/batches/${batch.id}`)}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 group-hover:text-blue-700">{batch.code || batch.id}</h4>
                    <p className="text-sm text-gray-500 mt-1">Assigned: {new Date(batch.assignedAtUtc).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Users className="w-4 h-4 mr-2" /> Items: {batch.items?.length || 0}
                </div>
              </div>
              <div className="mt-4">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">{batch.status}</span>
              </div>
            </div>
          ))}
          {batches.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-500">
              <p>No grading batches assigned to you yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- DIFF MODAL COMPONENT ---// DiffModal component
const DiffModal = ({ data, onClose }: { data: any, onClose: () => void }) => {
  if (!data) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <h2 className="font-bold flex items-center"><AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" /> Plagiarism Match Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-auto p-0 flex flex-col md:flex-row bg-slate-50">
          <div className="flex-1 border-r border-slate-200">
            <div className="bg-slate-200 px-3 py-2 text-xs font-bold text-slate-700 uppercase">This Submission</div>
            <pre className="p-4 text-xs font-mono whitespace-pre-wrap text-slate-800">{data.studentCode}</pre>
          </div>
          <div className="flex-1">
            <div className="bg-red-100 px-3 py-2 text-xs font-bold text-red-800 uppercase border-b border-red-200">Matched Source</div>
            <pre className="p-4 text-xs font-mono whitespace-pre-wrap text-red-900 bg-red-50/50 min-h-full">{data.matchedSource}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

// ConsoleModal component
const ConsoleModal = ({ item, reportData, onClose }: { item: any, reportData: any, onClose: () => void }) => {
  if (!reportData) return null;
  let parsedReport = null;
  try {
    parsedReport = JSON.parse(reportData.rawJsonReport || '{}');
  } catch(e) {}
  
  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden font-mono text-sm text-green-400">
        <div className="p-3 bg-slate-800 text-slate-300 flex justify-between items-center shrink-0 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-2 text-xs font-bold">Grading Console - {item.studentCode}</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-4">
           {!parsedReport ? (
             <div className="text-red-400">No detailed execution log available. Basic report: {JSON.stringify(reportData)}</div>
           ) : (
             <>
                <div className="text-blue-400">{"==> Starting Grading Process for "}{parsedReport.studentCode}...</div>
                
                <div className="text-slate-300">{'>> Checking Static Structure (Band 0)'}</div>
                {parsedReport.namingViolations?.length > 0 && (
                  <div className="text-red-400 ml-4">
                    [FAIL] Naming Violations Found:
                    <ul className="list-disc ml-8 mt-1">
                      {parsedReport.namingViolations.map((v: string, i: number) => <li key={i}>{v}</li>)}
                    </ul>
                  </div>
                )}
                <div className={parsedReport.band0Passed ? "text-green-400 ml-4" : "text-red-400 ml-4"}>
                  [RESULT] Band 0 {parsedReport.band0Passed ? 'Passed' : 'Failed'}
                </div>

                {parsedReport.band0Passed && (
                  <>
                    <div className="text-slate-300 mt-4">{'>> Compiling Solution (Band 1)'}</div>
                    {parsedReport.buildErrors && (
                      <div className="text-red-400 ml-4 whitespace-pre-wrap">
                        [ERROR] Build Log:
                        {"\n" + parsedReport.buildErrors}
                      </div>
                    )}
                    <div className={parsedReport.band1Passed ? "text-green-400 ml-4" : "text-red-400 ml-4"}>
                      [RESULT] Band 1 {parsedReport.band1Passed ? 'Passed' : 'Failed'}
                    </div>
                  </>
                )}

                {parsedReport.band1Passed && parsedReport.sectionResults?.length > 0 && (
                  <>
                     <div className="text-slate-300 mt-4">{'>> Running Test Sections'}</div>
                     {parsedReport.sectionResults.map((sec: any, idx: number) => (
                        <div key={idx} className="ml-4 mt-2 border-l border-slate-700 pl-4">
                           <div className="text-yellow-300">-- Section: {sec.name} ({sec.score}/{sec.maxScore}) --</div>
                           {sec.feedback && <div className="text-slate-400 whitespace-pre-wrap mt-1 text-xs">{sec.feedback}</div>}
                           {sec.failedTests?.length > 0 && (
                             <div className="text-red-400 mt-1">
                               Failed Tests:
                               <ul className="list-disc ml-6 mt-1 text-xs">
                                 {sec.failedTests.map((ft: string, i: number) => <li key={i}>{ft}</li>)}
                               </ul>
                             </div>
                           )}
                           <div className={sec.status === 'Passed' ? "text-green-400 mt-1" : "text-red-400 mt-1"}>
                             [RESULT] Section {sec.status}
                           </div>
                        </div>
                     ))}
                  </>
                )}
                
                <div className="text-blue-400 mt-4">
                  {"==> Final Score: "}{parsedReport.totalScore} 
                  {parsedReport.scoreDeducted > 0 ? ` (Deducted: ${parsedReport.scoreDeducted})` : ''}
                  {" | Status: " + parsedReport.status}
                </div>
             </>
           )}
        </div>
      </div>
    </div>
  );
};

const BatchDetail = ({ currentUser, navigate }: { currentUser: any, navigate: any }) => {
  const { id } = useParams();
  const [batch, setBatch] = useState<any>(null);
  const [localRootPath, setLocalRootPath] = useState(localStorage.getItem('localRootPath') || 'D:\\Kỳ_8\\PRN232\\PRN_ASM\\System-Repo-master\\All Engine\\Engine_Service\\sample-student-submission');
  const { connect, joinExamGroup, leaveExamGroup, progressUpdates, plagiarismAlerts } = useSignalRStore();
  const [diffData, setDiffData] = useState<any>(null);

  const [consoleData, setConsoleData] = useState<{item: any, reportData: any} | null>(null);

  const fetchBatchDetail = async () => {
    try {
      const res = await axios.get(`/api/grading-batches/${id}`);
      setBatch(res.data);
    } catch(e) {
      console.error(e);
    }
  };

  const handleShowReport = async (item: any) => {
    try {
      const res = await axios.get(`/api/grading-items/${item.id}/report`);
      setConsoleData({ item, reportData: res.data });
    } catch(e: any) {
      // Fallback if no report is found or error occurs
      let report = `Status: ${item.status}\n`;
      if (item.lastErrorCode) report += `Error Code: ${item.lastErrorCode}\n`;
      if (item.lastErrorMessage) report += `Error Message: ${item.lastErrorMessage}\n`;
      if (item.plagiarismReportJson) report += `Plagiarism: ${item.plagiarismReportJson}\n`;
      if (item.activeReviewReason) report += `Review Reason: ${item.activeReviewReason}\n`;
      alert(report);
    }
  };

  useEffect(() => {
    fetchBatchDetail();
    connect();
  }, [id]);

  useEffect(() => {
    if (batch?.examSessionId) {
      joinExamGroup(batch.examSessionId);
    }
    return () => {
      if (batch?.examSessionId) leaveExamGroup(batch.examSessionId);
    }
  }, [batch?.examSessionId]);

  const handleStartGrading = async () => {
    if (!localRootPath) {
      alert('Local Root Path is required to start grading.');
      return;
    }
    try {
      if (batch.status === 'Assigned' || batch.status === 'NeedsCorrection') {
        await axios.post(`/api/grading-batches/${id}/start`);
      }
      const pkgRes = await axios.post(`/api/grading-batches/${id}/execution-package`);
      
      // POST to Engine local
      await axios.post('http://localhost:5174/api/local-grading/run-batch', {
        localRootPath,
        executionPackage: pkgRes.data
      });
      alert('Local grading started successfully.');
      fetchBatchDetail();
    } catch(e: any) {
      alert(typeof e.response?.data === 'object' ? JSON.stringify(e.response.data) : (e.response?.data || 'Failed to start grading'));
    }
  };

  const handleSubmitBatch = async () => {
    try {
      await axios.post(`/api/grading-batches/${id}/submit`);
      fetchBatchDetail();
    } catch(e: any) {
      alert(typeof e.response?.data === 'object' ? JSON.stringify(e.response.data) : (e.response?.data || 'Failed to submit batch'));
    }
  };
  
  const handleRetryItem = async (itemId: string) => {
    if (!localRootPath) {
      alert("Local Root Path is required to retry.");
      return;
    }
    try {
      const pkgRes = await axios.post(`/api/grading-batches/${id}/execution-package`);
      await axios.post('http://localhost:5174/api/local-grading/run-batch', {
        localRootPath,
        executionPackage: pkgRes.data // In reality, we might filter to run only this item, but Engine handles retry
      });
      alert('Retried item on Local Engine.');
    } catch(e: any) {
      alert(typeof e.response?.data === 'object' ? JSON.stringify(e.response.data) : (e.response?.data || 'Failed to retry'));
    }
  };

  const isRetryable = (errorCode: string) => {
    const retryable = ['408', '504', '429', '503'];
    const nonRetryable = ['400', '413', '422'];
    if (retryable.includes(String(errorCode))) return true;
    if (nonRetryable.includes(String(errorCode))) return false;
    return true; // Default to true for TechnicalError etc.
  };

  if (!batch) return <div className="p-8">Loading...</div>;

  const displayItems = batch.items?.map((item: any) => {
    const rtu = progressUpdates[item.id];
    return rtu ? { ...item, status: rtu.Status || item.status, lastErrorCode: rtu.ErrorCode || item.lastErrorCode, lastErrorMessage: rtu.ErrorMessage || item.lastErrorMessage } : item;
  }) || [];

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <DiffModal data={diffData} onClose={() => setDiffData(null)} />
      {consoleData && <ConsoleModal item={consoleData.item} reportData={consoleData.reportData} onClose={() => setConsoleData(null)} />}

      <div className="bg-slate-900 p-4 shadow-md flex justify-between items-center z-10 text-white">
        <div className="flex items-center">
          <button onClick={() => navigate('/lecturer/batches')} className="mr-3 p-1 hover:bg-slate-800 rounded-md text-slate-300">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-xl text-white">{batch.code || 'Batch'}</h1>
            <p className="text-sm text-slate-400">Status: {batch.status}</p>
          </div>
        </div>
        <div className="flex space-x-3 items-center">
          <NotificationDropdown currentUser={currentUser} />
          {(batch.status === 'Assigned' || batch.status === 'NeedsCorrection' || batch.status === 'InProgress') && (
            <div className="flex items-center space-x-2">
               <input 
                 type="text" 
                 placeholder="C:\Submissions" 
                 className="px-2 py-1.5 rounded text-sm text-black"
                 value={localRootPath}
                 onChange={(e) => {
                   setLocalRootPath(e.target.value);
                   localStorage.setItem('localRootPath', e.target.value);
                 }}
               />
               <Button variant="primary" onClick={handleStartGrading}>
                 {batch.status === 'Assigned' ? 'Start Grading' : 'Resume Grading'}
               </Button>
            </div>
          )}
          {batch.status === 'InProgress' && (
            <Button variant="primary" onClick={handleSubmitBatch}>Submit Batch</Button>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayItems.length > 0 ? (
            displayItems.map((item: any) => {
              // Plagiarism logic
              const pAlert = plagiarismAlerts.find(a => a.SubmissionId === item.id || a.StudentId === item.studentCode);
              const showPlagiarismBadge = pAlert || (item.plagiarismStatus && item.plagiarismStatus !== 'Clean' && item.plagiarismStatus !== 'Pending');
              
              return (
              <div key={item.id} className="bg-white rounded-xl shadow-md ring-1 ring-gray-100 flex flex-col overflow-hidden">
                <div className="bg-slate-900 p-4 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white">Student Code</h3>
                    <div className="flex items-center mt-1">
                      <p className="text-xs text-slate-300 font-mono">{item.studentCode}</p>
                      {showPlagiarismBadge && (
                        <span 
                          onClick={() => {
                            let violations = pAlert?.Violations || pAlert?.violations || [];
                            if (violations.length === 0 && item.plagiarismReportJson) {
                              try {
                                const reportObj = JSON.parse(item.plagiarismReportJson);
                                violations = reportObj.violations || reportObj.Violations || [];
                              } catch(e) {}
                            }
                            const studentCodeStr = violations.length > 0 
                                ? violations.map((v: any) => `File: ${v.FileName || v.fileName}\nLine: ${v.LineNumber || v.lineNumber}\n${v.CodeSnippet || v.codeSnippet}`).join('\n\n---\n\n') 
                                : '';
                            const matchedSourceStr = violations.length > 0 
                                ? violations.map((v: any) => `Banned keyword: ${v.BannedKeyword || v.bannedKeyword}`).join('\n\n---\n\n') 
                                : '';
                            setDiffData({ studentCode: studentCodeStr, matchedSource: matchedSourceStr });
                          }}
                          className="ml-2 cursor-pointer inline-flex items-center bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200 hover:bg-red-200 transition-colors"
                        >
                          <AlertTriangle className="w-3 h-3 mr-1" /> Match {item.plagiarismMaxSimilarity || pAlert?.MaxSimilarity || 0}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1 bg-white">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Status</span>
                     <span className={`text-xs px-2 py-1 rounded font-bold ${
                        item.status === 'Graded' || item.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                        item.status.includes('Error') || item.status === 'ReturnedForCorrection' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                     }`}>{item.status}</span>
                  </div>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Latest Score</span>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleShowReport(item)} className="text-[10px] bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded">
                        Report
                      </button>
                      <span className="font-bold text-xl text-slate-900">{item.latestScore != null ? `${item.latestScore}/10` : '-/10'}</span>
                    </div>
                  </div>
                  
                  {item.lastErrorMessage && (
                     <div className="mt-3">
                       <div className="text-xs text-red-700 bg-red-50 p-2 rounded-t border border-red-200 border-b-0 break-words">
                          <span className="font-bold">{item.lastErrorCode}:</span> {item.lastErrorMessage}
                       </div>
                       {(item.status.includes('Error') || item.status === 'ReturnedForCorrection') && isRetryable(item.lastErrorCode) ? (
                         <button 
                           onClick={() => handleRetryItem(item.id)}
                           className="w-full bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold py-1.5 rounded-b border border-red-200 transition-colors"
                         >
                           Retry Processing
                         </button>
                       ) : (
                         <div className="w-full bg-red-50 text-red-400 text-[10px] uppercase font-bold py-1 px-2 rounded-b border border-red-200 border-t-0 text-center">
                           Non-retryable Error
                         </div>
                       )}
                     </div>
                  )}
                </div>
              </div>
            )})
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <Users className="w-8 h-8 text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">No items in this batch</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
