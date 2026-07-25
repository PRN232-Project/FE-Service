import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { Button, Input } from '../shared-ui';

export const StudentsManager = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [className, setClassName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/students');
      setStudents(Array.isArray(res.data) ? res.data : (res.data?.items || []));
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    if (!code || !name) return;
    try {
      const payload = { studentCode: code, fullName: name, email: email || "", className: className || "", isActive: true };
      if (editingId) {
        await axios.put(`/api/students/${editingId}`, payload);
        setEditingId(null);
      } else {
        await axios.post('/api/students', payload);
      }
      setCode(''); setName(''); setEmail(''); setClassName('');
      fetchStudents();
    } catch (e: any) {
      alert(e.response?.data || 'Failed to save student');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md ring-1 ring-gray-100 overflow-hidden flex flex-col max-w-6xl">
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input label="Student Code" value={code} onChange={(e) => setCode(e.target.value)} />
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Class" value={className} onChange={(e) => setClassName(e.target.value)} />
        </div>
        <div className="flex gap-2 justify-end">
          {editingId && <Button variant="secondary" onClick={() => { setEditingId(null); setCode(''); setName(''); setEmail(''); setClassName(''); }}>Cancel</Button>}
          <Button variant="primary" onClick={handleSave}><Plus className="w-4 h-4 mr-2" /> {editingId ? 'Update Student' : 'Add Student'}</Button>
        </div>
      </div>
      <div className="p-0 flex-1 overflow-auto min-h-[400px]">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Student Code</th>
              <th className="px-6 py-4">Full Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Class</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(students) && students.map(s => (
              <tr key={s.id} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-800">{s.studentCode}</td>
                <td className="px-6 py-3">{s.fullName}</td>
                <td className="px-6 py-3">{s.email}</td>
                <td className="px-6 py-3">{s.className}</td>
                <td className="px-6 py-3 space-x-2">
                  <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => {
                    setEditingId(s.id);
                    setCode(s.studentCode);
                    setName(s.fullName);
                    setEmail(s.email || '');
                    setClassName(s.className || '');
                  }}>Edit</Button>
                </td>
              </tr>
            ))}
            {(!Array.isArray(students) || students.length === 0) && <tr><td colSpan={5} className="px-6 py-4 text-center">No students found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
