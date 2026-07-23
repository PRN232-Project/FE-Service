import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Settings, Users, FileCode, CheckCircle, BarChart3, Database, ShieldAlert, LogOut, Plus, Search, HelpCircle, User, Bell,
  Terminal, XCircle, Download, Upload, ChevronLeft, ChevronRight, FileSpreadsheet, Lock, CheckCircle2, FileUp, ListChecks, FolderUp, Server, RefreshCw
} from 'lucide-react';
import { Button, Input, TableSkeleton, TableEmptyState, Badge } from '../components/shared-ui';
import { NotificationDropdown } from '../components/NotificationDropdown';

export const AdminPortal = ({ currentUser }: { currentUser: any }) => {
  const [activeTab, setActiveTab] = useState<'users'>('users');

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
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-white/10 text-white shadow-sm backdrop-blur-sm' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
          >
            <Users className="w-4 h-4 mr-3 opacity-80" /> User Management
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
          
          {/* --- TAB: USERS --- */}
          {activeTab === 'users' && <UsersManager />}
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
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ExamOfficer');
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
        'Admin': 1,
        'ExamOfficer': 2,
        'Lecturer': 3
      };
      
      const payload = { 
        userName, 
        password, 
        fullName, 
        email, 
        role: roleMap[role] ?? 0, 
        isActive 
      };

      await axios.post('/api/users', payload);
      setUserName('');
      setPassword('');
      setFullName('');
      setEmail('');
      setRole('ExamOfficer');
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
      const roleMap: Record<string, number> = { 'Admin': 1, 'ExamOfficer': 2, 'Lecturer': 3 };
      const payload = {
        userName: profileFormData.userName,
        password: profileFormData.password,
        fullName: profileFormData.fullName,
        email: profileFormData.email,
        role: roleMap[profileFormData.role] ?? 0,
        isActive: profileFormData.isActive
      };
      await axios.put(`/api/users/${detailUserId}`, payload);
      // Instead of getting by ID, just refetch all users and find this one
      fetchUsers();
      setIsEditingProfile(false);
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
             
             <div className="flex gap-4">
               <div className="flex flex-col space-y-1 flex-1">
                 <label className="text-sm font-medium text-gray-700">Role</label>
                 <select value={profileFormData.role} onChange={(e) => setProfileFormData({...profileFormData, role: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:border-blue-900 focus:ring-blue-100 bg-white">
                   <option value="ExamOfficer">Exam Office</option>
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
             <div><span className="font-semibold text-gray-500 block mb-1">Username:</span> <span className="text-gray-900 text-lg">{detailUser.userName}</span></div>
             <div><span className="font-semibold text-gray-500 block mb-1">Full Name:</span> <span className="text-gray-900 text-lg">{detailUser.fullName}</span></div>
             <div><span className="font-semibold text-gray-500 block mb-1">Email:</span> <span className="text-gray-900">{detailUser.email}</span></div>
             <div><span className="font-semibold text-gray-500 block mb-1">Role:</span> <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">{detailUser.role}</span></div>
             <div>
               <span className="font-semibold text-gray-500 block mb-1">System Status:</span> 
               {detailUser.isActive ? (
                 <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold flex items-center w-max"><CheckCircle2 className="w-3 h-3 mr-1" /> Active</span>
               ) : (
                 <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-semibold flex items-center w-max">Locked</span>
               )}
             </div>
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
          <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="flex gap-4">
            <div className="flex flex-col space-y-1 flex-1">
              <label className="text-sm font-medium text-gray-700">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:border-blue-900 focus:ring-blue-100 bg-white">
                <option value="ExamOfficer">Exam Office</option>
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
                  {u.isActive ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold inline-flex items-center">Active</span>
                  ) : (
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-semibold inline-flex items-center">Locked</span>
                  )}
                </td>
                <td className="px-6 py-3 space-x-2">
                     <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => {
                       setDetailUserId(u.id);
                       setDetailUser(u);
                       setProfileFormData({
                          userName: u.userName || '',
                          fullName: u.fullName || '',
                          email: u.email || '',
                          role: u.role || 'ExamOfficer',
                          isActive: u.isActive ?? true,
                          password: ''
                       });
                       setIsEditingProfile(false);
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

