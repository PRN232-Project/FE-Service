import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, CheckCircle2, CornerDownLeft, AlertTriangle } from 'lucide-react';
import { Button, Input } from '../../components/shared-ui';

export const BatchDetailOffice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<any>(null);
  
  // Return Item State
  const [returningItemId, setReturningItemId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState('');

  useEffect(() => {
    fetchBatchDetail();
  }, [id]);

  const fetchBatchDetail = async () => {
    try {
      const res = await axios.get(`/api/grading-batches/${id}`);
      setBatch(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcceptBatch = async () => {
    try {
      await axios.post(`/api/grading-batches/${id}/accept`);
      alert("Batch accepted successfully!");
      fetchBatchDetail();
    } catch (e: any) {
      alert(e.response?.data || "Failed to accept batch");
    }
  };

  const handleReturnItem = async () => {
    if (!returnReason) {
      alert("Please provide a reason for returning the item.");
      return;
    }
    try {
      await axios.post(`/api/grading-items/${returningItemId}/return`, { reason: returnReason });
      setReturningItemId(null);
      setReturnReason('');
      fetchBatchDetail();
      alert("Item returned successfully.");
    } catch (e: any) {
      alert(e.response?.data || "Failed to return item");
    }
  };

  const handleExportExcel = async () => {
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

  if (!batch) return <div className="p-8">Loading batch details...</div>;

  return (
    <div className="bg-white rounded-xl shadow-md ring-1 ring-gray-100 overflow-hidden flex flex-col max-w-6xl font-sans">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={() => navigate('/exam-office/batches')} className="mr-3 p-1 hover:bg-gray-200 rounded-md text-gray-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-xl text-gray-900">{batch.code || 'Batch'}</h1>
            <p className="text-sm text-gray-500">Status: {batch.status}</p>
          </div>
        </div>
        <div className="flex space-x-2">
           {batch.status === 'SubmittedForReview' && (
              <Button variant="primary" onClick={handleAcceptBatch}>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Accept Batch
              </Button>
           )}
           <Button variant="secondary" onClick={handleExportExcel}>
             Export Excel
           </Button>
        </div>
      </div>
      
      <div className="p-0 flex-1 overflow-auto min-h-[400px]">
        {returningItemId && (
           <div className="p-4 bg-yellow-50 border-b border-yellow-200 flex flex-col gap-2">
              <h4 className="font-bold text-yellow-800 text-sm">Return Item for Correction</h4>
              <Input label="Reason for Return" value={returnReason} onChange={(e: any) => setReturnReason(e.target.value)} placeholder="e.g. Test case results missing..." />
              <div className="flex gap-2 justify-end mt-2">
                 <Button variant="secondary" onClick={() => setReturningItemId(null)}>Cancel</Button>
                 <Button variant="danger" onClick={handleReturnItem}>Confirm Return</Button>
              </div>
           </div>
        )}
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Student Code</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Score</th>
              <th className="px-6 py-4">Plagiarism</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {batch.items?.map((item: any) => (
              <tr key={item.id} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-800">{item.studentCode}</td>
                <td className="px-6 py-3">
                   <span className={`px-2 py-1 rounded text-xs font-bold ${
                     item.status === 'Graded' || item.status === 'Accepted' || item.status === 'Submitted' ? 'bg-green-100 text-green-800' :
                     item.status.includes('Error') || item.status === 'ReturnedForCorrection' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                   }`}>{item.status}</span>
                </td>
                <td className="px-6 py-3 font-bold">{item.latestScore != null ? item.latestScore : '-'}</td>
                <td className="px-6 py-3">
                   {item.plagiarismStatus && item.plagiarismStatus !== 'Clean' && item.plagiarismStatus !== 'Pending' ? (
                     <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold inline-flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" /> {item.plagiarismMaxSimilarity || 0}%
                     </span>
                   ) : (
                     <span className="text-gray-400">Clean</span>
                   )}
                </td>
                <td className="px-6 py-3 space-x-2">
                   {batch.status === 'SubmittedForReview' && item.status !== 'ReturnedForCorrection' && (
                     <Button variant="danger" className="text-xs px-2 py-1" onClick={() => setReturningItemId(item.id)}>
                        <CornerDownLeft className="w-3 h-3 mr-1" /> Return
                     </Button>
                   )}
                </td>
              </tr>
            ))}
            {(!batch.items || batch.items.length === 0) && (
              <tr><td colSpan={5} className="px-6 py-4 text-center">No items found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
