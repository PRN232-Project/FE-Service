import React, { useState } from 'react';
import { StudentPortal } from './pages/StudentPortal';
import { ExaminerPortal } from './pages/ExaminerPortal';
import { AdminPortal } from './pages/AdminPortal';
import { Button, Input } from './components/shared-ui';
import { LogIn, AlertCircle } from 'lucide-react';
import axios from 'axios';

// Automatically refresh token on 401 Unauthorized errors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Call the backend refresh-token API
        await axios.post('/api/auth/refresh-token');
        // Retry the original request after successful refresh
        return axios(originalRequest);
      } catch (err) {
        // Refresh failed (e.g. refresh token expired), clear session
        delete axios.defaults.headers.common['X-User-Id'];
        delete axios.defaults.headers.common['X-User-Role'];
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Lecturer' | 'Admin';
  studentCode?: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !loginId) {
      setError('Username and password are required.');
      return;
    }
    
    try {
      const res = await axios.post('/api/auth/login', {
        userName: loginId.trim(),
        password: password
      });
      
      const data = res.data;
      
      // Set default headers for all subsequent Axios requests
      axios.defaults.headers.common['X-User-Id'] = data.userId;
      axios.defaults.headers.common['X-User-Role'] = data.role;

      setCurrentUser({
        id: data.userId,
        name: data.fullName,
        email: data.email,
        role: data.role,
        studentCode: data.studentCode
      });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginId('');
    setPassword('');
    delete axios.defaults.headers.common['X-User-Id'];
    delete axios.defaults.headers.common['X-User-Role'];
  };

  if (!currentUser) {
    return (
      <div className="flex min-h-screen font-sans bg-white">
        {/* Left Side - Branding */}
        <div 
          className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative overflow-hidden shadow-2xl z-10"
          style={{
            backgroundColor: '#0f172a',
            backgroundImage: 'radial-gradient(circle at 120% 30%, rgba(99,102,241,0.2) 0%, transparent 60%), radial-gradient(circle at -20% 80%, rgba(56,189,248,0.2) 0%, transparent 50%), linear-gradient(180deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,1) 100%)'
          }}
        >
          <div className="relative z-10">
            <h1 className="text-2xl font-bold tracking-tight mb-1 text-white">FPT University</h1>
            <p className="text-slate-400 font-semibold tracking-widest uppercase text-xs">PE Evaluation System</p>
          </div>
          
          <div className="relative z-10 max-w-lg">
            <h2 className="text-5xl font-bold mb-6 leading-tight text-white">Automated Grading.<br/>Enterprise Scale.</h2>
            <p className="text-slate-300 text-lg leading-relaxed font-medium">
              Streamline the examination process with high-speed automated grading, real-time plagiarism detection, and comprehensive dashboard reporting.
            </p>
          </div>
          
          <div className="relative z-10 text-slate-500 text-sm font-medium">
            © {new Date().getFullYear()} FPT University. All rights reserved.
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white">
          <div className="w-full max-w-md">
            <div className="mb-10 text-center lg:text-left">
              <div className="w-14 h-14 bg-slate-900 text-white rounded-xl flex items-center justify-center mx-auto lg:mx-0 mb-6 shadow-lg ring-4 ring-slate-50">
                <LogIn className="w-6 h-6 ml-1" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
              <p className="text-slate-500 mt-2 font-medium">Sign in to your account to continue</p>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" /> 
                <p className="leading-relaxed font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <Input 
                label="User ID" 
                placeholder="e.g. admin, lecturer1, student1" 
                value={loginId}
                onChange={(e: any) => setLoginId(e.target.value)}
                required 
              />
              <Input 
                label="Password" 
                type="password"
                placeholder="••••••••" 
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                required 
              />
              <div className="pt-2">
                <Button type="submit" className="w-full py-2.5 text-base shadow-md font-bold">Sign In</Button>
              </div>
            </form>
            
            <div className="mt-10 pt-6 border-t border-gray-100">
              <p className="text-xs text-slate-400 font-bold mb-4 uppercase tracking-wider text-center lg:text-left">Demo Accounts (Pass: 123456)</p>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start text-xs">
                <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg"><b>admin</b> <span className="text-slate-400">Admin</span></span>
                <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg"><b>lecturer1</b> <span className="text-slate-400">Examiner</span></span>
                <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg"><b>student1</b> <span className="text-slate-400">Student</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full font-sans flex flex-col bg-white overflow-hidden text-gray-900">
      {/* Universal Header (Replaces the role switcher) */}
      <div className="bg-gray-900 text-white px-4 py-2 flex justify-between items-center text-sm z-50 shadow-md">
        <div className="font-bold tracking-wide flex items-center">
          <span className="text-blue-400 mr-2">FPT</span> PE Evaluation Tool
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-300">
            Welcome, <span className="font-semibold text-white">{currentUser.name}</span> ({currentUser.role})
          </span>
          <button 
            onClick={handleLogout}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors font-medium text-xs"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area Based on Role */}
      <div className="flex-1 overflow-hidden">
        {currentUser.role === 'Student' && <StudentPortal currentUser={currentUser} />}
        {currentUser.role === 'Lecturer' && <ExaminerPortal currentUser={currentUser} />}
        {currentUser.role === 'Admin' && <AdminPortal currentUser={currentUser} />}
      </div>
    </div>
  );
}
