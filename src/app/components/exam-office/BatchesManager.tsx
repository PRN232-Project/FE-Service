import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, CheckSquare, Square } from 'lucide-react';
import { Button, Input } from '../shared-ui';

export const BatchesManager = () => {
  const [batches, setBatches] = useState<any[]>([]);
  
  // Create Form State
  const [creating, setCreating] = useState(false);
  const [code, setCode] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [lecturerId, setLecturerId] = useState('');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

  // Reference Data
  const [sessions, setSessions] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);

  useEffect(() => {
    fetchBatches();
    fetchReferenceData();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await axios.get('/api/grading-batches');
      setBatches(Array.isArray(res.data) ? res.data : (res.data?.items || []));
    } catch (e) { console.error(e); }
  };

  const fetchReferenceData = async () => {
    try {
      const s = await axios.get('/api/exam-sessions');
      const l = await axios.get('/api/directory/lecturers');
      const sessionsData = (Array.isArray(s.data) ? s.data : []).filter((x: any) => x.status === 'Ready');
      setSessions(sessionsData);
      setLecturers(Array.isArray(l.data) ? l.data : []);
      if (sessionsData.length > 0) setSessionId(sessionsData[0].id);
    } catch(e) {}
  };

  useEffect(() => {
    if (sessionId) {
      // Fetch candidates when session changes
      axios.get(`/api/exam-sessions/${sessionId}/candidates`)
        .then(res => {
          const cands = Array.isArray(res.data) ? res.data : [];
          setCandidates(cands);
          setSelectedCandidateIds(cands.map((c: any) => c.id)); // Default select all
        }).catch(e => setCandidates([]));
    } else {
      setCandidates([]);
      setSelectedCandidateIds([]);
    }
  }, [sessionId]);

  const handleCreate = async () => {
    if (!code || !sessionId || !lecturerId) {
       alert("Please fill all required fields");
       return;
    }
    try {
      await axios.post('/api/grading-batches', {
        code,
        examSessionId: sessionId,
        lecturerId: lecturerId,
        examCandidateIds: selectedCandidateIds
      });
      setCreating(false);
      fetchBatches();
    } catch(e: any) {
      alert(e.response?.data || 'Failed to create batch');
    }
  };

  const handleExportExcel = async (id: string) => {
    try {
      const res = await axios.get(`/api/grading-batches/${id}/export-excel`, { responseType: 'blob' });
      const disposition = res.headers['content-disposition'];
      let filename = 'GradingResult.xlsx';
      if (disposition && disposition.indexOf('filename=') !== -1) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
        if (matches != null && matches[1]) { 
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert('Failed to export excel');
    }
  };

  const toggleCandidate = (id: string) => {
    if (selectedCandidateIds.includes(id)) {
      setSelectedCandidateIds(selectedCandidateIds.filter(x => x !== id));
    } else {
      setSelectedCandidateIds([...selectedCandidateIds, id]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md ring-1 ring-gray-100 overflow-hidden flex flex-col max-w-6xl">
      {creating ? (
         <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col gap-4">
           <h3 className="font-bold text-gray-800">Create New Grading Batch</h3>
           <p className="text-xs text-gray-500 mb-2">Note: Grading Batches cannot be edited or deleted once created to ensure grading data integrity.</p>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <Input label="Batch Code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. BATCH-002" />
             <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Exam Session (Ready)</label>
                <select className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800" value={sessionId} onChange={e => setSessionId(e.target.value)}>
                  <option value="">-- Select Session --</option>
                  {sessions.map(s => <option key={s.id} value={s.id}>{s.code} - {s.title}</option>)}
                </select>
             </div>
             <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Assign Lecturer</label>
                <select className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800" value={lecturerId} onChange={e => setLecturerId(e.target.value)}>
                  <option value="">-- Select Lecturer --</option>
                  {lecturers.map(l => <option key={l.id} value={l.id}>{l.fullName} ({l.email})</option>)}
                </select>
             </div>
           </div>
           
           {candidates.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-bold text-gray-700 mb-2">Select Candidates for this batch</h4>
                <div className="max-h-[200px] overflow-auto border border-gray-200 rounded p-2 bg-white grid grid-cols-2 gap-2">
                   {candidates.map(c => (
                     <label key={c.id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 cursor-pointer">
                        {selectedCandidateIds.includes(c.id) ? <CheckSquare className="w-4 h-4 text-blue-600"/> : <Square className="w-4 h-4 text-gray-400"/>}
                        <input type="checkbox" className="hidden" checked={selectedCandidateIds.includes(c.id)} onChange={() => toggleCandidate(c.id)} />
                        <span className="text-sm">{c.studentCode} - {c.studentName}</span>
                     </label>
                   ))}
                </div>
                <div className="text-xs text-gray-500 mt-1">Selected: {selectedCandidateIds.length} / {candidates.length}</div>
              </div>
           )}

           <div className="flex gap-2 justify-end mt-2">
             <Button variant="secondary" onClick={() => setCreating(false)}>Cancel</Button>
             <Button variant="primary" onClick={handleCreate}>Save Batch</Button>
           </div>
         </div>
      ) : (
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-xl text-gray-900">Grading Batches</h3>
          <Button variant="primary" onClick={() => {
             setCreating(true);
             setCode('');
             setLecturerId('');
          }}><Plus className="w-4 h-4 mr-2" /> Assign Batch</Button>
        </div>
      )}
      
      <div className="p-0 flex-1 overflow-auto min-h-[400px]">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Batch Code</th>
              <th className="px-6 py-4">Session</th>
              <th className="px-6 py-4">Lecturer</th>
              <th className="px-6 py-4">Progress</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(batches) && batches.map(b => (
              <tr key={b.id} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-800">{b.code || b.id}</td>
                <td className="px-6 py-3">{b.examSessionCode}</td>
                <td className="px-6 py-3">{b.lecturerName}</td>
                <td className="px-6 py-3">{b.completedItemCount}/{b.itemCount}</td>
                <td className="px-6 py-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">{b.status}</span>
                </td>
                <td className="px-6 py-3 space-x-2">
                  <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => handleExportExcel(b.id)}>Export Excel</Button>
                </td>
              </tr>
            ))}
            {(!Array.isArray(batches) || batches.length === 0) && <tr><td colSpan={6} className="px-6 py-4 text-center">No batches found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
