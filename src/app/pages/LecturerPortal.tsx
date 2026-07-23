import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Clock, ChevronLeft, CheckCircle2, XCircle, Terminal,
  LayoutDashboard, Users, RefreshCw
} from 'lucide-react';
import { Button, Badge } from '../components/shared-ui';
import { NotificationDropdown } from '../components/NotificationDropdown';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router';

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
                    <h4 className="font-bold text-lg text-gray-900 group-hover:text-blue-700">{batch.code}</h4>
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

const BatchDetail = ({ currentUser, navigate }: { currentUser: any, navigate: any }) => {
  const { id } = useParams();
  const [batch, setBatch] = useState<any>(null);

  const fetchBatchDetail = async () => {
    try {
      const res = await axios.get(`/api/grading-batches/${id}`);
      setBatch(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBatchDetail();
  }, [id]);

  const handleStartGrading = async () => {
    try {
      await axios.post(`/api/grading-batches/${id}/start`);
      fetchBatchDetail();
    } catch(e: any) {
      alert(e.response?.data || 'Failed to start batch');
    }
  };

  const handleSubmitBatch = async () => {
    try {
      await axios.post(`/api/grading-batches/${id}/submit`);
      fetchBatchDetail();
    } catch(e: any) {
      alert(e.response?.data || 'Failed to submit batch');
    }
  };

  if (!batch) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <div className="bg-slate-900 p-4 shadow-md flex justify-between items-center z-10 text-white">
        <div className="flex items-center">
          <button onClick={() => navigate('/lecturer/batches')} className="mr-3 p-1 hover:bg-slate-800 rounded-md text-slate-300">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-xl text-white">{batch.code}</h1>
            <p className="text-sm text-slate-400">Batch Status: {batch.status}</p>
          </div>
        </div>
        <div className="flex space-x-3 items-center">
          <NotificationDropdown currentUser={currentUser} />
          {(batch.status === 'Assigned' || batch.status === 'NeedsCorrection') && (
            <Button variant="primary" onClick={handleStartGrading}>
              {batch.status === 'NeedsCorrection' ? 'Resume Grading' : 'Start Grading'}
            </Button>
          )}
          {batch.status === 'InProgress' && (
            <Button variant="primary" onClick={handleSubmitBatch}>Submit Batch</Button>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {batch.items && batch.items.length > 0 ? (
            batch.items.map((item: any) => (
              <div key={item.id} className="bg-white rounded-xl shadow-md ring-1 ring-gray-100 flex flex-col overflow-hidden">
                <div className="bg-slate-900 p-4 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white">Candidate ID</h3>
                    <p className="text-xs text-slate-300 font-mono mt-0.5">{item.examCandidateId}</p>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1 bg-white">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Status</span>
                     <span className={`text-xs px-2 py-1 rounded font-bold ${
                        item.status === 'Graded' || item.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                        item.status.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                     }`}>{item.status}</span>
                  </div>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Latest Score</span>
                    <span className="font-bold text-xl text-slate-900">{item.latestScore != null ? `${item.latestScore}/10` : '-/10'}</span>
                  </div>
                  {item.lastErrorMessage && (
                     <div className="mt-2 text-xs text-red-600 border border-red-200 bg-red-50 p-2 rounded truncate" title={item.lastErrorMessage}>
                        {item.lastErrorCode}: {item.lastErrorMessage}
                     </div>
                  )}
                  {batch.status === 'InProgress' && item.status !== 'Graded' && (
                    <button 
                      onClick={async () => {
                         try {
                           // Mock Attempt
                           await axios.post(`/api/grading-items/${item.id}/attempts`, {
                             clientRequestId: `mock-req-${item.id}-${Date.now()}`,
                             totalScore: Math.floor(Math.random() * 5 + 5), // Random score 5-10
                             rawJsonReport: "{}",
                             hasTechnicalError: false,
                             rubricVersion: batch.rubricVersion,
                             completedAtUtc: new Date().toISOString()
                           });
                           fetchBatchDetail();
                         } catch (e: any) {
                           alert(e.response?.data || 'Failed to mock grade');
                         }
                      }}
                      className="mt-4 w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold py-2 rounded border border-indigo-200 transition-colors"
                    >
                      🧪 DEV: Mock Grade
                    </button>
                  )}
                </div>
              </div>
            ))
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
