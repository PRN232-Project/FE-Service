import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router';
import axios from 'axios';
import { 
  Users, Server, FileSpreadsheet, FolderUp, ListChecks, ShieldAlert, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Terminal, XCircle, Code, Plus
} from 'lucide-react';
import { Button, Input, Badge } from '../components/shared-ui';
import { NotificationDropdown } from '../components/NotificationDropdown';
import { HubConnectionBuilder } from '@microsoft/signalr';

import { StudentsManager } from '../components/exam-office/StudentsManager';
import { ExamPapersManager } from '../components/exam-office/ExamPapersManager';
import { SessionsManager } from '../components/exam-office/SessionsManager';
import { BatchesManager } from '../components/exam-office/BatchesManager';
import { BatchDetailOffice } from '../components/exam-office/BatchDetailOffice';

export const ExamOfficePortal = ({ currentUser }: { currentUser: any }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to determine active tab based on route
  const getActiveTab = () => {
    if (location.pathname.includes('/students')) return 'students';
    if (location.pathname.includes('/rooms')) return 'rooms';
    if (location.pathname.includes('/papers')) return 'papers';
    if (location.pathname.includes('/sessions')) return 'sessions';
    if (location.pathname.includes('/batches')) return 'batches';
    if (location.pathname.includes('/plagiarism')) return 'plagiarism';
    return 'students';
  };

  const activeTab = getActiveTab();

  // SignalR for Plagiarism Alerts
  const [showPlagiarismAlert, setShowPlagiarismAlert] = useState(false);

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl('http://localhost:5176/gradingHub') // Notification Service Hub
      .withAutomaticReconnect()
      .build();
    
    connection.start().then(() => {
      console.log('ExamOffice connected to Notification Hub');
      connection.on('ReceiveNotification', (message) => {
        if (message && message.includes('plagiarism')) {
          setShowPlagiarismAlert(true);
        }
      });
    }).catch(err => console.error('SignalR error', err));

    return () => {
      connection.stop();
    };
  }, []);

  return (
    <div className="flex h-full bg-slate-50 font-sans relative">
      {/* Plagiarism Alert Toast */}
      {showPlagiarismAlert && (
        <div className="absolute bottom-6 right-6 bg-white border-l-4 border-red-500 shadow-xl rounded-lg p-4 max-w-sm z-50 flex items-start animate-in slide-in-from-bottom-5">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-900">Plagiarism Warning</h4>
            <p className="text-xs text-gray-600 mt-1">Similarity detected. Please review the reports.</p>
            <button 
              onClick={() => {
                setShowPlagiarismAlert(false);
                navigate('/exam-office/plagiarism');
              }}
              className="text-xs text-red-600 font-bold mt-2 hover:underline"
            >
              View Reports
            </button>
          </div>
          <button onClick={() => setShowPlagiarismAlert(false)} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <div 
        className="w-64 text-white flex flex-col shadow-xl z-20"
        style={{
          backgroundColor: '#0f172a',
          backgroundImage: 'radial-gradient(circle at 120% 30%, rgba(99,102,241,0.15) 0%, transparent 90%), radial-gradient(circle at -20% 80%, rgba(56,189,248,0.1) 0%, transparent 80%), linear-gradient(180deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,1) 100%)'
        }}
      >
        <div className="p-6 relative z-10">
          <h2 className="font-bold text-xl tracking-tight text-white/90">Exam Office</h2>
        </div>
        <nav className="flex-1 px-4 space-y-1 relative z-10">
          <button 
            onClick={() => navigate('/exam-office/students')}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'students' ? 'bg-white/10 text-white shadow-sm backdrop-blur-sm' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
          >
            <Users className="w-4 h-4 mr-3 opacity-80" /> Students
          </button>
          <button 
            onClick={() => navigate('/exam-office/rooms')}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'rooms' ? 'bg-white/10 text-white shadow-sm backdrop-blur-sm' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
          >
            <Server className="w-4 h-4 mr-3 opacity-80" /> Rooms
          </button>
          <button 
            onClick={() => navigate('/exam-office/papers')}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'papers' ? 'bg-white/10 text-white shadow-sm backdrop-blur-sm' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
          >
            <FileSpreadsheet className="w-4 h-4 mr-3 opacity-80" /> Exam Papers
          </button>
          <button 
            onClick={() => navigate('/exam-office/sessions')}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'sessions' ? 'bg-white/10 text-white shadow-sm backdrop-blur-sm' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
          >
            <FolderUp className="w-4 h-4 mr-3 opacity-80" /> Exam Sessions
          </button>
          <button 
            onClick={() => navigate('/exam-office/batches')}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'batches' ? 'bg-white/10 text-white shadow-sm backdrop-blur-sm' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
          >
            <ListChecks className="w-4 h-4 mr-3 opacity-80" /> Grading Batches
          </button>
          <button 
            onClick={() => navigate('/exam-office/plagiarism')}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'plagiarism' ? 'bg-red-500/20 text-red-100 shadow-sm backdrop-blur-sm border border-red-500/30' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
          >
            <ShieldAlert className={`w-4 h-4 mr-3 ${activeTab === 'plagiarism' ? 'text-red-300' : 'opacity-80'}`} /> Plagiarism Alerts
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 capitalize">
              {activeTab.replace('-', ' ')} Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage {activeTab.replace('-', ' ')} for the evaluation system.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationDropdown currentUser={currentUser} />
            <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                {currentUser.name ? currentUser.name.charAt(0) : 'E'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="students" element={<StudentsManager />} />
            <Route path="rooms" element={<RoomsManager />} />
            <Route path="papers" element={<ExamPapersManager />} />
            <Route path="sessions" element={<SessionsManager />} />
            <Route path="batches" element={<BatchesManager />} />
            <Route path="batches/:id" element={<BatchDetailOffice />} />
            <Route path="plagiarism" element={<PlagiarismManager />} />
            <Route path="*" element={<Navigate to="/exam-office/students" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const Placeholder = ({ title }: { title: string, api: string }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p>Not found data</p>
  </div>
);

// Copied from AdminPortal
const RoomsManager = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await axios.get('/api/rooms');
      setRooms(res.data);
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    if (!code || !name) return;
    try {
      const payload = { code, name, location: location || "" };
      if (editingId) {
        await axios.put(`/api/rooms/${editingId}`, payload);
        setEditingId(null);
      } else {
        await axios.post('/api/rooms', payload);
      }
      setCode(''); setName(''); setLocation('');
      fetchRooms();
    } catch (e: any) {
      alert(e.response?.data || 'Failed to save room');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/rooms/${id}`);
      fetchRooms();
    } catch (e) {
      alert('Failed to delete room');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md ring-1 ring-gray-100 overflow-hidden flex flex-col max-w-4xl">
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Room Code" value={code} onChange={(e) => setCode(e.target.value)} />
          <Input label="Room Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="flex gap-2 justify-end">
          {editingId && <Button variant="secondary" onClick={() => { setEditingId(null); setCode(''); setName(''); setLocation(''); }}>Cancel</Button>}
          <Button variant="primary" onClick={handleSave}><Plus className="w-4 h-4 mr-2" /> {editingId ? 'Update Room' : 'Add Room'}</Button>
        </div>
      </div>
      <div className="p-0 flex-1 overflow-auto min-h-[400px]">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(r => (
              <tr key={r.id} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-800">{r.code}</td>
                <td className="px-6 py-3">{r.name}</td>
                <td className="px-6 py-3 space-x-2">
                  <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => {
                    setEditingId(r.id);
                    setCode(r.code);
                    setName(r.name);
                    setLocation(r.location || '');
                  }}>Edit</Button>
                  <Button variant="danger" className="text-xs px-2 py-1" onClick={() => handleDelete(r.id)}>Delete</Button>
                </td>
              </tr>
            ))}
            {rooms.length === 0 && <tr><td colSpan={3} className="px-6 py-4 text-center">No rooms found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SessionsManagerStubPlaceholder = () => null; // Removed inside ExamOfficePortal since it is now imported

const PlagiarismManager = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCases = async () => {
    try {
      const res = await axios.get('/api/grading-items/plagiarism-cases');
      setCases(res.data);
    } catch (e) {
      console.error('Failed to fetch plagiarism cases', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md ring-1 ring-gray-100 overflow-hidden flex flex-col max-w-6xl">
       <div className="p-6 border-b border-gray-200 bg-red-50 flex items-center">
         <ShieldAlert className="w-6 h-6 text-red-600 mr-3" />
         <div>
           <h3 className="font-bold text-xl text-gray-900">Plagiarism Dashboard</h3>
           <p className="text-sm text-red-600">Review suspected plagiarism cases across all exam sessions</p>
         </div>
       </div>
       <div className="p-0 flex-1 overflow-auto min-h-[400px]">
         {loading ? (
           <div className="p-12 text-center text-gray-500">Loading cases...</div>
         ) : cases.length === 0 ? (
           <div className="p-12 text-center text-gray-500">
             <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
             <p>No plagiarism cases found.</p>
           </div>
         ) : (
           <table className="w-full text-sm text-left text-gray-600">
             <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-200">
               <tr>
                 <th className="px-6 py-4">Student</th>
                 <th className="px-6 py-4">Session</th>
                 <th className="px-6 py-4 text-center">Banned Keywords</th>
                 <th className="px-6 py-4 text-center">Max Similarity</th>
                 <th className="px-6 py-4 text-right">Checked At</th>
               </tr>
             </thead>
             <tbody>
               {cases.map((c: any) => (
                 <tr key={c.id} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                   <td className="px-6 py-3">
                     <div className="font-medium text-gray-900">{c.studentCode}</div>
                     <div className="text-xs text-gray-500">{c.studentName}</div>
                   </td>
                   <td className="px-6 py-3 font-medium text-gray-800">{c.sessionCode}</td>
                   <td className="px-6 py-3 text-center">
                     {c.plagiarismViolationCount > 0 ? (
                       <span className="text-red-600 font-bold">{c.plagiarismViolationCount}</span>
                     ) : (
                       <span className="text-gray-400">0</span>
                     )}
                   </td>
                   <td className="px-6 py-3 text-center">
                     {c.plagiarismMaxSimilarity > 0 ? (
                       <span className={`font-bold ${c.plagiarismMaxSimilarity >= 80 ? 'text-red-600' : 'text-orange-500'}`}>
                         {c.plagiarismMaxSimilarity.toFixed(2)}%
                       </span>
                     ) : (
                       <span className="text-gray-400">-</span>
                     )}
                   </td>
                   <td className="px-6 py-3 text-right text-gray-500">
                     {c.plagiarismCheckedAtUtc ? new Date(c.plagiarismCheckedAtUtc).toLocaleString() : '-'}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         )}
       </div>
    </div>
  );
};

// BatchesManager has been moved to its own component file
