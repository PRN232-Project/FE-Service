import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Input } from '../shared-ui';

export const ExamPapersManager = () => {
  const [papers, setPapers] = useState<any[]>([]);
  const [editingPaper, setEditingPaper] = useState<any>(null);

  // Form State
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [rubricVersion, setRubricVersion] = useState('1.0');
  const [maxScore, setMaxScore] = useState(10);
  const [solutionPattern, setSolutionPattern] = useState('.*');
  const [requireAppsettings, setRequireAppsettings] = useState(false);
  const [forbidHardcoded, setForbidHardcoded] = useState(true);
  const [timeoutSeconds, setTimeoutSeconds] = useState(300);
  const [plagiarismKeywords, setPlagiarismKeywords] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const res = await axios.get('/api/exam-papers');
      setPapers(Array.isArray(res.data) ? res.data : (res.data?.items || []));
    } catch (e) { console.error(e); }
  };

  const handleEdit = (p: any) => {
    setEditingPaper(p.id);
    setCode(p.code);
    setTitle(p.title);
    setRubricVersion(p.rubricVersion);
    setMaxScore(p.maxScore);
    setSolutionPattern(p.solutionPattern);
    setRequireAppsettings(p.requireAppSettings);
    setForbidHardcoded(p.forbidHardcodedConnectionString);
    setTimeoutSeconds(p.timeoutSeconds);
    setPlagiarismKeywords(p.plagiarismKeywords?.join(', ') || '');
    setIsActive(p.isActive ?? true);
    setSections(p.sections || []);
  };

  const handleCancel = () => {
    setEditingPaper(null);
    setCode(''); setTitle(''); setSections([]);
    setRubricVersion('1.0'); setMaxScore(10); setSolutionPattern('.*');
    setRequireAppsettings(false); setForbidHardcoded(true); setTimeoutSeconds(300);
    setPlagiarismKeywords(''); setIsActive(true);
  };

  const handleSave = async () => {
    if (!code || !title) return;
    try {
      const payload = {
        code, title, rubricVersion, maxScore, solutionPattern,
        requireAppSettings: requireAppsettings,
        forbidHardcodedConnectionString: forbidHardcoded,
        timeoutSeconds,
        plagiarismKeywords: plagiarismKeywords.split(',').map(s => s.trim()).filter(s => s),
        sections: sections.map(s => ({
          name: s.name, weight: s.weight, testFilter: s.testFilter, 
          testCasesJson: s.testCasesJson || "[]", apiProjectPath: s.apiProjectPath
        })),
        isActive: isActive
      };
      if (editingPaper === 'NEW') {
        await axios.post('/api/exam-papers', payload);
      } else {
        await axios.put(`/api/exam-papers/${editingPaper}`, payload);
      }
      handleCancel();
      fetchPapers();
    } catch (e: any) {
      alert(e.response?.data || 'Failed to save exam paper');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md ring-1 ring-gray-100 overflow-hidden flex flex-col max-w-6xl">
      {editingPaper ? (
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col gap-6">
          <h3 className="text-lg font-bold">{editingPaper === 'NEW' ? 'Create Exam Paper' : 'Edit Exam Paper'}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input label="Code" value={code} onChange={(e) => setCode(e.target.value)} />
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input label="Rubric Version" value={rubricVersion} onChange={(e) => setRubricVersion(e.target.value)} />
            <Input label="Max Score" type="number" value={maxScore.toString()} onChange={(e) => setMaxScore(Number(e.target.value))} />
            <Input label="Solution Pattern (Regex)" value={solutionPattern} onChange={(e) => setSolutionPattern(e.target.value)} />
            <Input label="Timeout (Seconds)" type="number" value={timeoutSeconds.toString()} onChange={(e) => setTimeoutSeconds(Number(e.target.value))} />
            <Input label="Plagiarism Keywords (comma separated)" value={plagiarismKeywords} onChange={(e) => setPlagiarismKeywords(e.target.value)} />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center space-x-2 text-sm text-gray-700">
              <input type="checkbox" checked={requireAppsettings} onChange={e => setRequireAppsettings(e.target.checked)} />
              <span>Require appsettings.json</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-gray-700">
              <input type="checkbox" checked={forbidHardcoded} onChange={e => setForbidHardcoded(e.target.checked)} />
              <span>Forbid Hardcoded Connection String</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-gray-700">
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
              <span>Active</span>
            </label>
          </div>

          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-gray-800">Test Sections</h4>
              <Button variant="secondary" className="text-xs" onClick={() => setSections([...sections, { name: '', weight: 0, testFilter: '', testCasesJson: '[]' }])}>+ Add Section</Button>
            </div>
            {sections.map((s, idx) => (
              <div key={idx} className="flex gap-2 items-end mb-2 p-3 bg-white border border-gray-200 rounded">
                <div className="flex-1 grid grid-cols-5 gap-2">
                  <Input label="Name" value={s.name} onChange={e => { const newS = [...sections]; newS[idx].name = e.target.value; setSections(newS); }} />
                  <Input label="Weight" type="number" value={s.weight} onChange={e => { const newS = [...sections]; newS[idx].weight = Number(e.target.value); setSections(newS); }} />
                  <Input label="Test Filter" value={s.testFilter} onChange={e => { const newS = [...sections]; newS[idx].testFilter = e.target.value; setSections(newS); }} />
                  <Input label="API Path (optional)" value={s.apiProjectPath || ''} onChange={e => { const newS = [...sections]; newS[idx].apiProjectPath = e.target.value; setSections(newS); }} />
                  <Input label="Test Cases (JSON)" value={s.testCasesJson || '[]'} onChange={e => { const newS = [...sections]; newS[idx].testCasesJson = e.target.value; setSections(newS); }} />
                </div>
                <button className="text-red-500 hover:text-red-700 p-2" onClick={() => { const newS = [...sections]; newS.splice(idx, 1); setSections(newS); }}><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>Save Paper</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Exam Papers</h3>
            <Button variant="primary" onClick={() => {
               setEditingPaper('NEW');
               setCode(''); setTitle(''); setMaxScore(10); setSections([]);
               setSolutionPattern('.*'); setRequireAppsettings(false); setForbidHardcoded(true);
               setRubricVersion('1.0'); setTimeoutSeconds(300); setPlagiarismKeywords(''); setIsActive(true);
            }}><Plus className="w-4 h-4 mr-2" /> Add Paper</Button>
          </div>
          <div className="p-0 flex-1 overflow-auto min-h-[400px]">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Max Score</th>
                  <th className="px-6 py-4">Sections</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(papers) && papers.map(p => (
                  <tr key={p.id} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-800">{p.code}</td>
                    <td className="px-6 py-3">{p.title}</td>
                    <td className="px-6 py-3">{p.maxScore}</td>
                    <td className="px-6 py-3">{p.sections?.length || 0}</td>
                    <td className="px-6 py-3 space-x-2">
                      <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => handleEdit(p)}>Edit</Button>
                    </td>
                  </tr>
                ))}
                {(!Array.isArray(papers) || papers.length === 0) && <tr><td colSpan={5} className="px-6 py-4 text-center">No exam papers found</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
