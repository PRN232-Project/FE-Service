import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Settings, Users, FileCode, CheckCircle, BarChart3, Database, ShieldAlert, LogOut, Plus, Search, HelpCircle, User, Bell,
  Terminal, XCircle, Download, Upload, ChevronLeft, ChevronRight, FileSpreadsheet, Lock, CheckCircle2, FileUp, ListChecks, FolderUp, Server, RefreshCw
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
  const [allRubrics, setAllRubrics] = useState<any[]>([]);
  const [selectedRubricCode, setSelectedRubricCode] = useState('PRN232_DEFAULT');
  const [isSavingRubric, setIsSavingRubric] = useState(false);
  const [rubricMessage, setRubricMessage] = useState('');

  // Fetch all rubrics when entering tab
  useEffect(() => {
    if (activeTab === 'rubrics') {
      const fetchAllRubrics = async () => {
        try {
          const res = await axios.get('/api/Grading/rubrics');
          setAllRubrics(res.data);
        } catch (e) {
          console.error('Error fetching all rubrics', e);
        }
      };
      fetchAllRubrics();
    }
  }, [activeTab]);

  // Fetch specific rubric when selection changes
  useEffect(() => {
    if (activeTab === 'rubrics') {
      const fetchRubric = async () => {
        try {
          const res = await axios.get(`/api/Grading/rubrics/${selectedRubricCode}`);
          if (res.data) {
             setRubric({
                examCode: res.data.examCode || selectedRubricCode,
               maxScore: res.data.maxScore || 10.0,
               solutionPattern: res.data.solutionPattern || '',
               forbidHardcodedConnectionString: res.data.forbidHardcodedConnectionString,
               deductionPointsPerNamingError: res.data.deductionPointsPerNamingError || 1.0,
               requiredProjects: res.data.requiredProjects || [],
               requiredFiles: res.data.requiredFiles || []
            });
          }
        } catch (error: any) {
          if (error.response?.status === 404) {
            console.info(`Rubric ${selectedRubricCode} not found. Loading empty template.`);
            setRubricMessage(`New template for ${selectedRubricCode} loaded.`);
            setTimeout(() => setRubricMessage(''), 3000);
          } else {
            console.error("Error fetching rubric:", error);
          }
          // If not found, reset to a new empty template for the selected code
          setRubric({
             examCode: selectedRubricCode,
             maxScore: 10.0,
             solutionPattern: '',
             forbidHardcodedConnectionString: true,
             deductionPointsPerNamingError: 1.0,
             requiredProjects: [],
             requiredFiles: []
          });
        }
      };
      
      fetchRubric();
    }
  }, [activeTab, selectedRubricCode]);

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
              {activeTab === 'rubrics' && `Configure test cases and weights for ${selectedRubricCode}`}
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
            <div className="max-w-4xl space-y-6">
              {/* Rubric Selector */}
              <div className="bg-white rounded-xl shadow-md ring-1 ring-gray-100 p-6 flex items-end space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Select Rubric</label>
                  <select 
                    value={selectedRubricCode}
                    onChange={(e) => setSelectedRubricCode(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                  >
                    {allRubrics.map((r, i) => (
                      <option key={i} value={r.examCode}>{r.examCode}</option>
                    ))}
                  </select>
                </div>
                <Button 
                  onClick={() => {
                    const newCode = prompt("Enter new Exam Code for Rubric (e.g. SWP391_DEFAULT):");
                    if (newCode && newCode.trim() !== '') {
                      const trimmed = newCode.trim();
                      if (!allRubrics.find(r => r.examCode === trimmed)) {
                        // Temporarily add it to the dropdown list so it displays correctly
                        setAllRubrics(prev => [...prev, { examCode: trimmed }]);
                      }
                      setSelectedRubricCode(trimmed);
                    }
                  }}
                  variant="primary"
                >
                  <FolderUp className="w-4 h-4 mr-2" /> New Rubric
                </Button>
              </div>

              {/* Rubric Form */}
              <div className="bg-white rounded-xl shadow-md ring-1 ring-gray-100 p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-100">
                   <Input 
                     label="Exam Code (Locked to Selected)" 
                     value={rubric.examCode} 
                     disabled={true}
                     onChange={() => {}} 
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

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800">Required Files</h3>
                  <Button variant="secondary" className="text-sm" onClick={() => setRubric({...rubric, requiredFiles: [...rubric.requiredFiles, { pattern: '', mustExist: true }]})}>
                    <Plus className="w-4 h-4 mr-1" /> Add File
                  </Button>
                </div>
                <div className="space-y-4">
                  {rubric.requiredFiles.map((file, idx) => (
                    <div key={idx} className="flex gap-4 items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <Input 
                          label="File Pattern" 
                          value={file.pattern} 
                          onChange={(e) => {
                            const newFiles = [...rubric.requiredFiles];
                            newFiles[idx].pattern = e.target.value;
                            setRubric({...rubric, requiredFiles: newFiles});
                          }} 
                        />
                      </div>
                      <label className="flex items-center mt-6 text-sm">
                        <input 
                          type="checkbox" 
                          checked={file.mustExist}
                          onChange={(e) => {
                            const newFiles = [...rubric.requiredFiles];
                            newFiles[idx].mustExist = e.target.checked;
                            setRubric({...rubric, requiredFiles: newFiles});
                          }} 
                          className="mr-2 rounded border-gray-300 text-blue-900 focus:ring-blue-900"
                        />
                        Must Exist
                      </label>
                      <button 
                        onClick={() => {
                          const newFiles = rubric.requiredFiles.filter((_, i) => i !== idx);
                          setRubric({...rubric, requiredFiles: newFiles});
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 mt-6"
                      ><XCircle className="w-5 h-5" /></button>
                    </div>
                  ))}
                  {rubric.requiredFiles.length === 0 && (
                     <p className="text-sm text-gray-500 italic">No required files specified.</p>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end items-center space-x-3">
                {rubricMessage && <span className={`text-sm font-medium mr-4 ${rubricMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>{rubricMessage}</span>}
                <Button variant="secondary" onClick={() => {
                  // Trigger fetch
                  const fetchAll = async () => {
                    const res = await axios.get('/api/Grading/rubrics');
                    setAllRubrics(res.data);
                  };
                  fetchAll();
                  setSelectedRubricCode(selectedRubricCode);
                  setRubricMessage('Discarded changes');
                  setTimeout(() => setRubricMessage(''), 2000);
                }}>Discard Changes</Button>
                <Button variant="primary" onClick={handleSaveRubric} disabled={isSavingRubric}>
                  {isSavingRubric ? 'Saving...' : 'Save Configuration'}
                </Button>
              </div>
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
const UsersManager = () => {
  const [users, setUsers] = useState<any[]>([]);
  // State for Add User form
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Student');
  const [isActive, setIsActive] = useState(true);
  
  // State for Detail/Edit View
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [detailUser, setDetailUser] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState<any>({});

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
    if (!userName || !fullName || !password) {
        alert('Please fill required fields (User Name, Full Name, Password).');
        return;
    }
    try {
      const roleMap: Record<string, number> = {
        'Student': 1,
        'Lecturer': 2,
        'Admin': 3
      };
      
      const payload = { 
        userName, 
        password, 
        studentCode, 
        fullName, 
        email, 
        role: roleMap[role] ?? 0, 
        isActive 
      };

      await axios.post('/api/users', payload);
      setUserName('');
      setPassword('');
      setStudentCode('');
      setFullName('');
      setEmail('');
      setRole('Student');
      setIsActive(true);
      fetchUsers();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data || 'Failed to add user');
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

  const handleSaveProfile = async () => {
    try {
      const roleMap: Record<string, number> = { 'Student': 1, 'Lecturer': 2, 'Admin': 3 };
      const payload = {
        userName: profileFormData.userName,
        password: profileFormData.password,
        studentCode: profileFormData.studentCode,
        fullName: profileFormData.fullName,
        email: profileFormData.email,
        role: roleMap[profileFormData.role] ?? 0,
        isActive: profileFormData.isActive
      };
      await axios.put(`/api/users/${detailUserId}`, payload);
      const res = await axios.get(`/api/users/${detailUserId}`);
      setDetailUser(res.data);
      setIsEditingProfile(false);
      fetchUsers();
    } catch (e) {
      console.error(e);
      alert('Failed to update user');
    }
  };

  if (detailUserId && detailUser) {
    return (
      <div className="bg-white rounded-xl shadow-md ring-1 ring-gray-100 p-8 max-w-4xl mx-auto flex flex-col font-sans">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
             <h2 className="text-2xl font-bold text-gray-900">{isEditingProfile ? 'Edit User Profile' : 'User Profile'}</h2>
             <p className="text-sm text-gray-500 mt-1">Loaded via GET /api/users/{detailUserId}</p>
          </div>
          <div className="space-x-2">
            {!isEditingProfile && <Button variant="primary" onClick={() => setIsEditingProfile(true)}><Settings className="w-4 h-4 mr-2" /> Edit Profile</Button>}
            {isEditingProfile && <Button variant="primary" onClick={handleSaveProfile}><CheckCircle2 className="w-4 h-4 mr-2" /> Save Changes</Button>}
            <Button variant="secondary" onClick={() => {
              if (isEditingProfile) setIsEditingProfile(false);
              else setDetailUserId(null);
            }}>{isEditingProfile ? 'Cancel Edit' : 'Back to List'}</Button>
          </div>
        </div>
        
        {isEditingProfile ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
             <Input label="User Name" value={profileFormData.userName} onChange={(e) => setProfileFormData({...profileFormData, userName: e.target.value})} />
             <Input label="Password (leave blank to keep)" type="password" value={profileFormData.password} onChange={(e) => setProfileFormData({...profileFormData, password: e.target.value})} />
             <Input label="Full Name" value={profileFormData.fullName} onChange={(e) => setProfileFormData({...profileFormData, fullName: e.target.value})} />
             <Input label="Email" value={profileFormData.email} onChange={(e) => setProfileFormData({...profileFormData, email: e.target.value})} />
             <Input label="Identity Code" value={profileFormData.studentCode} onChange={(e) => setProfileFormData({...profileFormData, studentCode: e.target.value})} />
             
             <div className="flex gap-4">
               <div className="flex flex-col space-y-1 flex-1">
                 <label className="text-sm font-medium text-gray-700">Role</label>
                 <select value={profileFormData.role} onChange={(e) => setProfileFormData({...profileFormData, role: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:border-blue-900 focus:ring-blue-100 bg-white">
                   <option value="Student">Student</option>
                   <option value="Lecturer">Lecturer</option>
                   <option value="Admin">Admin</option>
                 </select>
               </div>
               <label className="flex items-center mt-6 text-sm">
                 <input type="checkbox" checked={profileFormData.isActive} onChange={(e) => setProfileFormData({...profileFormData, isActive: e.target.checked})} className="mr-2 rounded border-gray-300 text-blue-900 focus:ring-blue-900" /> Active
               </label>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
             <div><span className="font-semibold text-gray-500 block mb-1">ID:</span> <span className="text-gray-900 font-mono">{detailUser.id}</span></div>
             <div><span className="font-semibold text-gray-500 block mb-1">Username:</span> <span className="text-gray-900 text-lg">{detailUser.userName}</span></div>
             <div><span className="font-semibold text-gray-500 block mb-1">Full Name:</span> <span className="text-gray-900 text-lg">{detailUser.fullName}</span></div>
             <div><span className="font-semibold text-gray-500 block mb-1">Email:</span> <span className="text-gray-900">{detailUser.email}</span></div>
             <div><span className="font-semibold text-gray-500 block mb-1">Role:</span> <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">{detailUser.role}</span></div>
             <div><span className="font-semibold text-gray-500 block mb-1">Identity Code:</span> <span className="text-gray-900">{detailUser.studentCode || 'N/A'}</span></div>
             <div><span className="font-semibold text-gray-500 block mb-1">System Status:</span> <Badge status={detailUser.isActive ? 'success' : 'neutral'} /></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md ring-1 ring-gray-100 overflow-hidden flex flex-col max-w-6xl">
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="User Name" value={userName} onChange={(e) => setUserName(e.target.value)} />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Input label="Student/Lecturer Code" value={studentCode} onChange={(e) => setStudentCode(e.target.value)} />
          <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="flex gap-4">
            <div className="flex flex-col space-y-1 flex-1">
              <label className="text-sm font-medium text-gray-700">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:border-blue-900 focus:ring-blue-100 bg-white">
                <option value="Student">Student</option>
                <option value="Lecturer">Lecturer</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <label className="flex items-center mt-6 text-sm">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="mr-2 rounded border-gray-300 text-blue-900 focus:ring-blue-900" /> Active
            </label>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="primary" onClick={handleSave}><Plus className="w-4 h-4 mr-2" /> Add User</Button>
        </div>
      </div>
      <div className="p-0 flex-1 overflow-auto min-h-[400px]">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-200 sticky top-0">
            <tr>
              <th className="px-6 py-4">User Name</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-800">{u.userName}</td>
                <td className="px-6 py-3 font-medium text-gray-800">{u.fullName}</td>
                <td className="px-6 py-3 text-gray-500">{u.email}</td>
                <td className="px-6 py-3">
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">{u.role}</span>
                </td>
                <td className="px-6 py-3 text-center">
                  <Badge status={u.isActive ? 'success' : 'neutral'} />
                </td>
                <td className="px-6 py-3 space-x-2">
                    <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => {
                       setDetailUserId(u.id);
                       // Fetch real-time detail using GET by ID API
                       axios.get(`/api/users/${u.id}`).then(res => {
                         setDetailUser(res.data);
                         setProfileFormData({
                            userName: res.data.userName || '',
                            fullName: res.data.fullName || '',
                            email: res.data.email || '',
                            studentCode: res.data.studentCode || '',
                            role: res.data.role || 'Student',
                            isActive: res.data.isActive ?? true,
                            password: ''
                         });
                         setIsEditingProfile(false);
                       });
                    }}>View / Edit</Button>
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
  
  const [roomId, setRoomId] = useState('');
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [maxScore, setMaxScore] = useState(10);
  const [solutionPattern, setSolutionPattern] = useState('');
  const [requireAppSettings, setRequireAppSettings] = useState(true);
  const [forbidHardcodedConnectionString, setForbidHardcodedConnectionString] = useState(true);
  const [timeoutSeconds, setTimeoutSeconds] = useState(15);
  const [plagiarismKeywords, setPlagiarismKeywords] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);

  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    fetchExams();
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await axios.get('/api/rooms');
      setRooms(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchExams = async () => {
    try {
      const res = await axios.get('/api/exams');
      setExams(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!roomId || !code || !title) return;
    try {
      const payload = {
        roomId, code, title, maxScore, solutionPattern, requireAppSettings,
        forbidHardcodedConnectionString, timeoutSeconds,
        plagiarismKeywords: plagiarismKeywords.split(',').map(k => k.trim()).filter(k => k)
      };
      if (editingId) {
        await axios.put(`/api/exams/${editingId}`, payload);
        setEditingId(null);
      } else {
        await axios.post('/api/exams', payload);
      }
      setRoomId(''); setCode(''); setTitle(''); setMaxScore(10); setSolutionPattern(''); setRequireAppSettings(true);
      setForbidHardcodedConnectionString(true); setTimeoutSeconds(15); setPlagiarismKeywords('');
      fetchExams();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data || 'Failed to save exam');
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
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">Room</label>
            <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:border-blue-900 focus:ring-blue-100 bg-white">
              <option value="">-- Select Room --</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
              ))}
            </select>
          </div>
          <Input label="Exam Code" value={code} onChange={(e) => setCode(e.target.value)} />
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input label="Max Score" type="number" value={maxScore} onChange={(e) => setMaxScore(parseFloat(e.target.value))} />
          <Input label="Solution Pattern" placeholder="e.g. *.sln" value={solutionPattern} onChange={(e) => setSolutionPattern(e.target.value)} />
          <Input label="Timeout (s)" type="number" value={timeoutSeconds} onChange={(e) => setTimeoutSeconds(parseInt(e.target.value))} />
          <Input label="Plagiarism Keywords (comma separated)" value={plagiarismKeywords} onChange={(e) => setPlagiarismKeywords(e.target.value)} />
          
          <div className="flex flex-col gap-2 mt-4 md:col-span-2">
            <label className="flex items-center text-sm">
              <input type="checkbox" checked={requireAppSettings} onChange={(e) => setRequireAppSettings(e.target.checked)} className="mr-2 rounded border-gray-300 text-blue-900 focus:ring-blue-900" />
              Require AppSettings
            </label>
            <label className="flex items-center text-sm">
              <input type="checkbox" checked={forbidHardcodedConnectionString} onChange={(e) => setForbidHardcodedConnectionString(e.target.checked)} className="mr-2 rounded border-gray-300 text-blue-900 focus:ring-blue-900" />
              Forbid Hardcoded Connection String
            </label>
          </div>
        </div>
        
        <div className="flex gap-2 justify-end">
          {editingId && <Button variant="secondary" onClick={() => { setEditingId(null); setRoomId(''); setCode(''); setTitle(''); setMaxScore(10); setSolutionPattern(''); setRequireAppSettings(true); setForbidHardcodedConnectionString(true); setTimeoutSeconds(15); setPlagiarismKeywords(''); }}>Cancel</Button>}
          <Button variant="primary" onClick={handleSave}><Plus className="w-4 h-4 mr-2" /> {editingId ? 'Update Exam' : 'Add Exam'}</Button>
        </div>
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
                    setRoomId(e.roomId || '');
                    setCode(e.code);
                    setTitle(e.title);
                    setMaxScore(e.maxScore);
                    setSolutionPattern(e.solutionPattern || '');
                    setRequireAppSettings(e.requireAppSettings ?? true);
                    setForbidHardcodedConnectionString(e.forbidHardcodedConnectionString ?? true);
                    setTimeoutSeconds(e.timeoutSeconds || 15);
                    setPlagiarismKeywords((e.plagiarismKeywords || []).join(', '));
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
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [lecturerId, setLecturerId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [lecturers, setLecturers] = useState<any[]>([]);

  useEffect(() => {
    fetchRooms();
    fetchLecturers();
  }, []);

  const fetchLecturers = async () => {
    try {
      const res = await axios.get('/api/users?role=Lecturer');
      setLecturers(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchRooms = async () => {
    try {
      const res = await axios.get('/api/rooms');
      setRooms(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!code || !name || !lecturerId) return;
    try {
      const payload = { code, name, lecturerId };
      if (editingId) {
        await axios.put(`/api/rooms/${editingId}`, payload);
        setEditingId(null);
      } else {
        await axios.post('/api/rooms', payload);
      }
      setCode('');
      setName('');
      setLecturerId('');
      fetchRooms();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data || 'Failed to save room');
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
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex gap-4 items-end flex-wrap">
        <Input label="Room Code" value={code} onChange={(e) => setCode(e.target.value)} />
        <Input label="Room Name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex flex-col space-y-1 w-64">
          <label className="text-sm font-medium text-gray-700">Lecturer</label>
          <select value={lecturerId} onChange={(e) => setLecturerId(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:border-blue-900 focus:ring-blue-100 bg-white">
            <option value="">-- Select Lecturer --</option>
            {lecturers.map(l => (
              <option key={l.id} value={l.id}>{l.fullName} ({l.userName})</option>
            ))}
          </select>
        </div>
        <Button variant="primary" onClick={handleSave}><Plus className="w-4 h-4 mr-2" /> {editingId ? 'Update' : 'Add Room'}</Button>
        {editingId && <Button variant="secondary" onClick={() => { setEditingId(null); setCode(''); setName(''); setLecturerId(''); }}>Cancel</Button>}
      </div>
      <div className="p-0 flex-1 overflow-auto min-h-[400px]">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-200 sticky top-0">
            <tr>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Lecturer</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(r => (
              <tr key={r.id} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-800">{r.code}</td>
                <td className="px-6 py-3 text-gray-500">{r.name}</td>
                <td className="px-6 py-3">{r.lecturerName}</td>
                <td className="px-6 py-3 space-x-2">
                  <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => {
                    setEditingId(r.id);
                    setCode(r.code);
                    setName(r.name);
                    setLecturerId(r.lecturerId);
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
        setSelectedExamId(res.data[0].examId);
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
              <option key={e.examId} value={e.examId}>{e.code} - {e.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-6 border-b border-gray-200 bg-gray-50 flex gap-4 items-end flex-wrap">
        <Input label="Section Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Test Filter" value={testFilter} onChange={(e) => setTestFilter(e.target.value)} />
        <Input label="Weight" type="number" value={weight} onChange={(e) => setWeight(parseFloat(e.target.value) || 0)} />
        
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

