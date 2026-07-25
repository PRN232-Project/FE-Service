import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, CheckCircle, Users } from 'lucide-react';
import { Button, Input } from '../shared-ui';

export const SessionsManager = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [papers, setPapers] = useState<any[]>([]);
  
  const [creating, setCreating] = useState(false);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [roomId, setRoomId] = useState('');
  const [paperId, setPaperId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  const [managingCandidatesFor, setManagingCandidatesFor] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  useEffect(() => {
    fetchSessions();
    fetchRoomsAndPapers();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await axios.get('/api/exam-sessions');
      setSessions(Array.isArray(res.data) ? res.data : (res.data?.items || []));
    } catch (e) { console.error(e); }
  };

  const fetchRoomsAndPapers = async () => {
    try {
      const r = await axios.get('/api/rooms');
      const p = await axios.get('/api/exam-papers');
      const s = await axios.get('/api/students');
      
      const rData = Array.isArray(r.data) ? r.data : [];
      const pData = Array.isArray(p.data) ? p.data : [];
      const sData = Array.isArray(s.data) ? s.data : [];
      
      setRooms(rData); setPapers(pData); setAllStudents(sData);
      if (rData.length > 0) setRoomId(rData[0].id);
      if (pData.length > 0) setPaperId(pData[0].id);
    } catch(e) {}
  };

  const handleCreate = async () => {
    if (!code || !title || !roomId || !paperId || !scheduledAt) return;
    try {
      await axios.post('/api/exam-sessions', {
        code, title, roomId, examPaperId: paperId, scheduledAtUtc: new Date(scheduledAt).toISOString()
      });
      setCreating(false);
      fetchSessions();
    } catch(e: any) {
      alert(e.response?.data || 'Failed to create session');
    }
  };

  const handleOpenCandidates = async (s: any) => {
    setManagingCandidatesFor(s);
    try {
      const res = await axios.get(`/api/exam-sessions/${s.id}/candidates`);
      setCandidates(Array.isArray(res.data) ? res.data : []);
      setSelectedStudentIds([]);
    } catch (e) { console.error(e); }
  };

  const handleAddCandidates = async () => {
    if (selectedStudentIds.length === 0) return;
    try {
      await axios.post(`/api/exam-sessions/${managingCandidatesFor.id}/candidates`, {
        studentIds: selectedStudentIds
      });
      handleOpenCandidates(managingCandidatesFor);
      fetchSessions();
    } catch(e: any) {
      alert(e.response?.data || 'Failed to add candidates');
    }
  };

  const handleMarkReady = async (id: string) => {
    try {
      await axios.post(`/api/exam-sessions/${id}/ready`);
      fetchSessions();
    } catch(e: any) {
      alert(e.response?.data || 'Failed to mark ready');
    }
  };

  if (managingCandidatesFor) {
    const availableStudents = allStudents.filter(s => !candidates.find(c => c.studentId === s.id));
    return (
      <div className="bg-white rounded-xl shadow-md ring-1 ring-gray-100 overflow-hidden flex flex-col max-w-4xl">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Candidates for: {managingCandidatesFor.code}</h3>
          <Button variant="secondary" onClick={() => setManagingCandidatesFor(null)}>Back to Sessions</Button>
        </div>
        <div className="p-6 flex gap-6">
          <div className="flex-1">
            <h4 className="font-semibold mb-2">Available Students</h4>
            <div className="max-h-[300px] overflow-auto border rounded p-2">
              {availableStudents.map(s => (
                <label key={s.id} className="flex items-center space-x-2 p-1 hover:bg-gray-50">
                  <input type="checkbox" checked={selectedStudentIds.includes(s.id)} onChange={e => {
                    if (e.target.checked) setSelectedStudentIds([...selectedStudentIds, s.id]);
                    else setSelectedStudentIds(selectedStudentIds.filter(id => id !== s.id));
                  }} />
                  <span className="text-sm">{s.studentCode} - {s.fullName}</span>
                </label>
              ))}
            </div>
            <Button variant="primary" className="mt-2 w-full" onClick={handleAddCandidates} disabled={managingCandidatesFor.status !== 'Draft'}>
              Add Selected ({selectedStudentIds.length})
            </Button>
          </div>
          <div className="flex-1">
             <h4 className="font-semibold mb-2">Current Candidates ({candidates.length})</h4>
             <div className="max-h-[300px] overflow-auto border rounded p-2">
                {candidates.map(c => (
                  <div key={c.id} className="text-sm p-1 border-b text-gray-700">{c.studentCode} - {c.studentName}</div>
                ))}
                {candidates.length === 0 && <div className="text-sm text-gray-400">No candidates yet.</div>}
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md ring-1 ring-gray-100 overflow-hidden flex flex-col max-w-6xl">
      {creating ? (
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col gap-4">
          <h3 className="font-bold">Create Exam Session</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input label="Code" value={code} onChange={(e) => setCode(e.target.value)} />
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Room</label>
              <select className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800" value={roomId} onChange={e => setRoomId(e.target.value)}>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.code}</option>)}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Exam Paper</label>
              <select className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800" value={paperId} onChange={e => setPaperId(e.target.value)}>
                {papers.map(p => <option key={p.id} value={p.id}>{p.code}</option>)}
              </select>
            </div>
            <Input label="Scheduled At" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setCreating(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate}>Save Session</Button>
          </div>
        </div>
      ) : (
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Exam Sessions</h3>
          <Button variant="primary" onClick={() => {
            setCreating(true);
            setCode(''); setTitle(''); setScheduledAt('');
          }}><Plus className="w-4 h-4 mr-2" /> Add Session</Button>
        </div>
      )}
      <div className="p-0 flex-1 overflow-auto min-h-[400px]">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Room</th>
              <th className="px-6 py-4">Paper</th>
              <th className="px-6 py-4">Time</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(sessions) && sessions.map(s => (
              <tr key={s.id} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-800">{s.code}</td>
                <td className="px-6 py-3">{s.title}</td>
                <td className="px-6 py-3">{s.roomCode}</td>
                <td className="px-6 py-3">{s.examPaperCode}</td>
                <td className="px-6 py-3">{new Date(s.scheduledAtUtc).toLocaleString()}</td>
                <td className="px-6 py-3 font-bold">{s.status}</td>
                <td className="px-6 py-3 space-x-2">
                  <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => handleOpenCandidates(s)}><Users className="w-3 h-3 mr-1" /> Candidates ({s.candidateCount})</Button>
                  {s.status === 'Draft' && s.candidateCount > 0 && (
                    <Button variant="primary" className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleMarkReady(s.id)}>
                      <CheckCircle className="w-3 h-3 mr-1" /> Ready
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {(!Array.isArray(sessions) || sessions.length === 0) && <tr><td colSpan={7} className="px-6 py-4 text-center">No exam sessions found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
