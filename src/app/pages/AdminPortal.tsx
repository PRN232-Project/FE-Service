import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Settings, Users, FileCode, CheckCircle, BarChart3, Database, ShieldAlert, LogOut, Plus, Search, HelpCircle, User, Bell,
  Terminal, XCircle, Download, Upload, ChevronLeft, ChevronRight, FileSpreadsheet, Lock, CheckCircle2, FileUp, ListChecks, FolderUp, Server
} from 'lucide-react';
import { Button, Input, TableSkeleton, TableEmptyState, Badge } from '../components/shared-ui';
import { NotificationDropdown } from '../components/NotificationDropdown';

export const AdminPortal = ({ currentUser }: { currentUser: any }) => {
  const [activeTab, setActiveTab] = useState<'rubrics' | 'users' | 'exams' | 'rooms' | 'sections'>('rubrics');

  // Rubric State (mapped to GradingEngine.Api RubricDto)
  const [rubric, setRubric] = useState({
    examCode: 'PRN232_DEFAULT',
    maxScore: 10.0,
    solutionPattern: '',
    forbidHardcodedConnectionString: true,
    deductionPointsPerNamingError: 1.0,
    requiredProjects: [] as { pattern: string; mustExist: boolean }[],
    requiredFiles: [] as { pattern: string; mustExist: boolean }[]
  });
  const [isSavingRubric, setIsSavingRubric] = useState(false);
  const [rubricMessage, setRubricMessage] = useState('');

  // Fetch rubric on load
  useEffect(() => {
    if (activeTab === 'rubrics') {
      const fetchRubric = async () => {
        try {
          const res = await axios.get(`/api/Grading/rubrics/PRN232_DEFAULT`);
          if (res.data) {
             setRubric({
                examCode: res.data.examCode || 'PRN232_DEFAULT',
               maxScore: res.data.maxScore || 10.0,
               solutionPattern: res.data.solutionPattern || '',
               forbidHardcodedConnectionString: res.data.forbidHardcodedConnectionString,
               deductionPointsPerNamingError: res.data.deductionPointsPerNamingError || 1.0,
               requiredProjects: res.data.requiredProjects || [],
               requiredFiles: res.data.requiredFiles || []
            });
          }
        } catch (error) {
          console.error("Error fetching rubric:", error);
        }
      };
      fetchRubric();
    }
  }, [activeTab]);

  const handleSaveRubric = async () => {
    setIsSavingRubric(true);
    setRubricMessage('');
    try {
      await axios.post(`/api/Grading/rubrics`, rubric);
      setRubricMessage('Saved successfully!');
      setTimeout(() => setRubricMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setRubricMessage('Error saving rubric');
    } finally {
      setIsSavingRubric(false);
    }
  };

  return (
    <div className="flex h-full bg-slate-50 font-sans">
      {/* Sidebar */}
      <div 
        className="w-64 text-white flex flex-col shadow-xl z-20"
        style={{
          backgroundColor: '#0f172a',
          backgroundImage: 'radial-gradient(circle at 120% 30%, rgba(99,102,241,0.15) 0%, transparent 90%), radial-gradient(circle at -20% 80%, rgba(56,189,248,0.1) 0%, transparent 80%), linear-gradient(180deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,1) 100%)'
        }}
      >
        
        <div className="p-6 relative z-10">
          <h2 className="font-bold text-xl tracking-tight text-white/90">Admin Panel</h2>
        </div>
        <nav className="flex-1 px-4 space-y-1 relative z-10">
          <button 
            onClick={() => setActiveTab('rubrics')}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'rubrics' ? 'bg-white/10 text-white shadow-sm backdrop-blur-sm' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
          >
            <Settings className="w-4 h-4 mr-3 opacity-80" /> Dynamic Rubrics
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-white/10 text-white shadow-sm backdrop-blur-sm' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
          >
            <Users className="w-4 h-4 mr-3 opacity-80" /> User Management
          </button>
          <button 
            onClick={() => setActiveTab('exams')}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'exams' ? 'bg-white/10 text-white shadow-sm backdrop-blur-sm' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
          >
            <FileSpreadsheet className="w-4 h-4 mr-3 opacity-80" /> Exams
          </button>
          <button 
            onClick={() => setActiveTab('rooms')}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'rooms' ? 'bg-white/10 text-white shadow-sm backdrop-blur-sm' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
          >
            <Server className="w-4 h-4 mr-3 opacity-80" /> Rooms
          </button>
          <button 
            onClick={() => setActiveTab('sections')}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'sections' ? 'bg-white/10 text-white shadow-sm backdrop-blur-sm' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
          >
            <FolderUp className="w-4 h-4 mr-3 opacity-80" /> Exam Sections
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === 'rubrics' && 'Rubric Configuration'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'exams' && 'Exam Management'}
              {activeTab === 'rooms' && 'Room Management'}
              {activeTab === 'sections' && 'Exam Sections Management'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {activeTab === 'rubrics' && 'Configure test cases and weights for PRN232_DEFAULT'}
              {activeTab === 'users' && 'Manage student and examiner accounts for the system'}
              {activeTab === 'exams' && 'Create and manage exams'}
              {activeTab === 'rooms' && 'Create and manage rooms'}
              {activeTab === 'sections' && 'Create and manage sections for exams'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationDropdown currentUser={currentUser} />
            <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                {currentUser.fullName ? currentUser.fullName.charAt(0) : 'A'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          
          {/* --- TAB: RUBRICS --- */}
          {activeTab === 'rubrics' && (
            <div className="max-w-4xl bg-white rounded-xl shadow-md ring-1 ring-gray-100 p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-100">
                 <Input 
                   label="Exam Code" 
                   value={rubric.examCode} 
                   onChange={(e) => setRubric({...rubric, examCode: e.target.value})} 
                 />
                 <Input 
                   label="Max Score" 
                   type="number" 
                   value={rubric.maxScore} 
                   onChange={(e) => setRubric({...rubric, maxScore: parseFloat(e.target.value)})} 
                 />
              </div>

              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-100">
                 <Input 
                   label="Solution Pattern" 
                   placeholder="e.g. *.sln"
                   value={rubric.solutionPattern} 
                   onChange={(e) => setRubric({...rubric, solutionPattern: e.target.value})} 
                 />
                 <Input 
                   label="Deduction Pts / Naming Error" 
                   type="number" 
                   value={rubric.deductionPointsPerNamingError} 
                   onChange={(e) => setRubric({...rubric, deductionPointsPerNamingError: parseFloat(e.target.value)})} 
                 />
              </div>

              <div className="pb-6 border-b border-gray-100">
                <label className="flex items-center space-x-2 text-sm text-gray-700">
                  <input 
                    type="checkbox" 
                    checked={rubric.forbidHardcodedConnectionString} 
                    onChange={(e) => setRubric({...rubric, forbidHardcodedConnectionString: e.target.checked})} 
                    className="rounded border-gray-300 text-blue-900 focus:ring-blue-900"
                  />
                  <span>Forbid Hardcoded Connection String</span>
                </label>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800">Required Projects</h3>
                  <Button variant="secondary" className="text-sm" onClick={() => setRubric({...rubric, requiredProjects: [...rubric.requiredProjects, { pattern: '', mustExist: true }]})}>
                    <Plus className="w-4 h-4 mr-1" /> Add Project
                  </Button>
                </div>
                <div className="space-y-4">
                  {rubric.requiredProjects.map((proj, idx) => (
                    <div key={idx} className="flex gap-4 items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <Input 
                          label="Project Pattern" 
                          value={proj.pattern} 
                          onChange={(e) => {
                            const newProjs = [...rubric.requiredProjects];
                            newProjs[idx].pattern = e.target.value;
                            setRubric({...rubric, requiredProjects: newProjs});
                          }} 
                        />
                      </div>
                      <label className="flex items-center mt-6 text-sm">
                        <input 
                          type="checkbox" 
                          checked={proj.mustExist}
                          onChange={(e) => {
                            const newProjs = [...rubric.requiredProjects];
                            newProjs[idx].mustExist = e.target.checked;
                            setRubric({...rubric, requiredProjects: newProjs});
                          }} 
                          className="mr-2 rounded border-gray-300 text-blue-900 focus:ring-blue-900"
                        />
                        Must Exist
                      </label>
                      <button 
                        onClick={() => {
                          const newProjs = rubric.requiredProjects.filter((_, i) => i !== idx);
                          setRubric({...rubric, requiredProjects: newProjs});
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 mt-6"
                      ><XCircle className="w-5 h-5" /></button>
                    </div>
                  ))}
                  {rubric.requiredProjects.length === 0 && (
                     <p className="text-sm text-gray-500 italic">No required projects specified.</p>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end items-center space-x-3">
                {rubricMessage && <span className={`text-sm font-medium mr-4 ${rubricMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>{rubricMessage}</span>}
                <Button variant="secondary" onClick={() => {
                   const fetchRubric = async () => {
                     try {
                       const res = await axios.get(`/api/Grading/rubrics/PRN232_DEFAULT`);
                       if (res.data) {
                         setRubric({
                           examCode: res.data.examCode || 'PRN232_DEFAULT',
                           maxScore: res.data.maxScore || 10.0,
                           solutionPattern: res.data.solutionPattern || '',
                           forbidHardcodedConnectionString: res.data.forbidHardcodedConnectionString || false,
                           deductionPointsPerNamingError: res.data.deductionPointsPerNamingError || 1.0,
                           requiredProjects: res.data.requiredProjects || [],
                           requiredFiles: res.data.requiredFiles || []
                         });
                       }
                     } catch(e) {}
                   };
                   fetchRubric();
                }}>Discard Changes</Button>
                <Button variant="primary" onClick={handleSaveRubric} disabled={isSavingRubric}>
                  {isSavingRubric ? 'Saving...' : 'Save Configuration'}
                </Button>
              </div>
            </div>
          )}


          {/* --- TAB: USERS --- */}
          {activeTab === 'users' && <UsersManager />}

          {/* --- TAB: EXAMS --- */}
          {activeTab === 'exams' && <ExamsManager />}

          {/* --- TAB: ROOMS --- */}
          {activeTab === 'rooms' && <RoomsManager />}

          {/* --- TAB: SECTIONS --- */}
          {activeTab === 'sections' && <ExamSectionsManager />}
        </div>
      </div>
    </div>
  );
};

// --- CRUD Components ---

const UsersManager = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Student');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!userName || !email) return;
    try {
      if (editingId) {
        await axios.put(`/api/users/${editingId}`, { userName, fullName: userName, email, role, isActive: true, studentCode: userName });
        setEditingId(null);
      } else {
        await axios.post('/api/users', { userName, fullName: userName, email, role, isActive: true, studentCode: userName });
      }
      setUserName('');
      setEmail('');
      setRole('Student');
      fetchUsers();
    } catch (e) {
      console.error(e);
      alert('Failed to save user');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/users/${id}`);
      fetchUsers();
    } catch (e) {
      console.error(e);
      alert('Failed to delete user');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md ring-1 ring-gray-100 overflow-hidden flex flex-col max-w-6xl">
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex gap-4 items-end">
        <Input label="Name" value={userName} onChange={(e) => setUserName(e.target.value)} />
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-700">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:border-blue-900 focus:ring-blue-100 bg-white">
            <option value="Student">Student</option>
            <option value="Lecturer">Lecturer</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <Button variant="primary" onClick={handleSave}><Plus className="w-4 h-4 mr-2" /> {editingId ? 'Update User' : 'Add User'}</Button>
        {editingId && <Button variant="secondary" onClick={() => { setEditingId(null); setUserName(''); setEmail(''); setRole('Student'); }}>Cancel</Button>}
      </div>
      <div className="p-0 flex-1 overflow-auto min-h-[400px]">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-200 sticky top-0">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-800">{u.fullName}</td>
                <td className="px-6 py-3 text-gray-500">{u.email}</td>
                <td className="px-6 py-3">{u.role}</td>
                <td className="px-6 py-3 space-x-2">
                  <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => {
                    setEditingId(u.id);
                    setUserName(u.fullName);
                    setEmail(u.email);
                    setRole(u.role);
                  }}>Edit</Button>
                  <Button variant="danger" className="text-xs px-2 py-1" onClick={() => handleDelete(u.id)}>Delete</Button>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={4} className="px-6 py-4 text-center">No users found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ExamsManager = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [maxScore, setMaxScore] = useState(10);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await axios.get('/api/exams');
      setExams(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!code || !title) return;
    try {
      if (editingId) {
        await axios.put(`/api/exams/${editingId}`, { code, title, maxScore });
        setEditingId(null);
      } else {
        await axios.post('/api/exams', { code, title, maxScore });
      }
      setCode('');
      setTitle('');
      fetchExams();
    } catch (e) {
      console.error(e);
      alert('Failed to save exam');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/exams/${id}`);
      fetchExams();
    } catch (e) {
      console.error(e);
      alert('Failed to delete exam');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md ring-1 ring-gray-100 overflow-hidden flex flex-col max-w-6xl">
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex gap-4 items-end">
        <Input label="Exam Code" value={code} onChange={(e) => setCode(e.target.value)} />
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input label="Max Score" type="number" value={maxScore} onChange={(e) => setMaxScore(parseFloat(e.target.value))} />
        <Button variant="primary" onClick={handleSave}><Plus className="w-4 h-4 mr-2" /> {editingId ? 'Update' : 'Add Exam'}</Button>
        {editingId && <Button variant="secondary" onClick={() => { setEditingId(null); setCode(''); setTitle(''); }}>Cancel</Button>}
      </div>
      <div className="p-0 flex-1 overflow-auto min-h-[400px]">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-200 sticky top-0">
            <tr>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Max Score</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map(e => (
              <tr key={e.examId} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-800">{e.code}</td>
                <td className="px-6 py-3 text-gray-500">{e.title}</td>
                <td className="px-6 py-3">{e.maxScore}</td>
                <td className="px-6 py-3 space-x-2">
                  <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => {
                    setEditingId(e.examId || e.id);
                    setCode(e.code);
                    setTitle(e.title);
                    setMaxScore(e.maxScore);
                  }}>Edit</Button>
                  <Button variant="danger" className="text-xs px-2 py-1" onClick={() => handleDelete(e.examId || e.id)}>Delete</Button>
                </td>
              </tr>
            ))}
            {exams.length === 0 && <tr><td colSpan={4} className="px-6 py-4 text-center">No exams found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RoomsManager = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(30);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await axios.get('/api/rooms');
      setRooms(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!name) return;
    try {
      if (editingId) {
        await axios.put(`/api/rooms/${editingId}`, { name, capacity, status: 'Active' });
        setEditingId(null);
      } else {
        await axios.post('/api/rooms', { name, capacity, status: 'Active' });
      }
      setName('');
      fetchRooms();
    } catch (e) {
      console.error(e);
      alert('Failed to save room');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/rooms/${id}`);
      fetchRooms();
    } catch (e) {
      console.error(e);
      alert('Failed to delete room');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md ring-1 ring-gray-100 overflow-hidden flex flex-col max-w-6xl">
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex gap-4 items-end">
        <Input label="Room Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Capacity" type="number" value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value))} />
        <Button variant="primary" onClick={handleSave}><Plus className="w-4 h-4 mr-2" /> {editingId ? 'Update' : 'Add Room'}</Button>
        {editingId && <Button variant="secondary" onClick={() => { setEditingId(null); setName(''); }}>Cancel</Button>}
      </div>
      <div className="p-0 flex-1 overflow-auto min-h-[400px]">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-200 sticky top-0">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Capacity</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(r => (
              <tr key={r.id} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-800">{r.name}</td>
                <td className="px-6 py-3 text-gray-500">{r.capacity}</td>
                <td className="px-6 py-3">
                  <Badge status={r.status === 'Active' ? 'success' : 'neutral'} />
                </td>
                <td className="px-6 py-3 space-x-2">
                  <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => {
                    setEditingId(r.id);
                    setName(r.name);
                    setCapacity(r.capacity);
                  }}>Edit</Button>
                  <Button variant="danger" className="text-xs px-2 py-1" onClick={() => handleDelete(r.id)}>Delete</Button>
                </td>
              </tr>
            ))}
            {rooms.length === 0 && <tr><td colSpan={4} className="px-6 py-4 text-center">No rooms found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ExamSectionsManager = () => {
  const [sections, setSections] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  
  const [name, setName] = useState('');
  const [weight, setWeight] = useState(1);
  const [testFilter, setTestFilter] = useState('*.dll');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetchSections(selectedExamId);
    } else {
      setSections([]);
    }
  }, [selectedExamId]);

  const fetchExams = async () => {
    try {
      const res = await axios.get('/api/exams');
      setExams(res.data);
      if (res.data.length > 0) {
        setSelectedExamId(res.data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSections = async (id: string) => {
    try {
      const res = await axios.get(`/api/exam-sections?examId=${id}`);
      if (Array.isArray(res.data)) {
        setSections(res.data);
      } else {
        setSections([]);
      }
    } catch (e) {
      console.error(e);
      setSections([]);
    }
  };

  const handleSave = async () => {
    if (!name || !selectedExamId) return;
    try {
      if (editingId) {
        await axios.put(`/api/exam-sections/${editingId}`, { name, examId: selectedExamId, weight, testFilter });
        setEditingId(null);
      } else {
        await axios.post('/api/exam-sections', { name, examId: selectedExamId, weight, testFilter });
      }
      setName('');
      fetchSections(selectedExamId);
    } catch (e) {
      console.error(e);
      alert('Failed to save exam section');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/exam-sections/${id}`);
      fetchSections(selectedExamId);
    } catch (e) {
      console.error(e);
      alert('Failed to delete section');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md ring-1 ring-gray-100 overflow-hidden flex flex-col max-w-6xl">
      {/* Top Filter */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex flex-col space-y-1 w-72">
          <label className="text-sm font-medium text-gray-700">Select Exam</label>
          <select 
            value={selectedExamId} 
            onChange={(e) => setSelectedExamId(e.target.value)} 
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:border-blue-900 focus:ring-blue-100 bg-white"
          >
            <option value="">-- Select Exam --</option>
            {exams.map(e => (
              <option key={e.id} value={e.id}>{e.code} - {e.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-6 border-b border-gray-200 bg-gray-50 flex gap-4 items-end flex-wrap">
        <Input label="Section Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Test Filter" value={testFilter} onChange={(e) => setTestFilter(e.target.value)} />
        <Input label="Weight" type="number" value={weight} onChange={(e) => setWeight(parseFloat(e.target.value))} />
        
        <Button variant="primary" onClick={handleSave} disabled={!selectedExamId}><Plus className="w-4 h-4 mr-2" /> {editingId ? 'Update' : 'Add Section'}</Button>
        {editingId && <Button variant="secondary" onClick={() => { setEditingId(null); setName(''); }}>Cancel</Button>}
      </div>
      <div className="p-0 flex-1 overflow-auto min-h-[400px]">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-200 sticky top-0">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Test Filter</th>
              <th className="px-6 py-4">Weight</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sections.map(s => (
              <tr key={s.id} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-800">{s.name}</td>
                <td className="px-6 py-3 text-gray-500">{s.testFilter}</td>
                <td className="px-6 py-3 text-gray-500">{s.weight}</td>
                <td className="px-6 py-3 space-x-2">
                  <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => {
                    setEditingId(s.id);
                    setName(s.name);
                    setTestFilter(s.testFilter);
                    setWeight(s.weight);
                  }}>Edit</Button>
                  <Button variant="danger" className="text-xs px-2 py-1" onClick={() => handleDelete(s.id)}>Delete</Button>
                </td>
              </tr>
            ))}
            {sections.length === 0 && <tr><td colSpan={4} className="px-6 py-4 text-center">No sections found for selected exam</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

