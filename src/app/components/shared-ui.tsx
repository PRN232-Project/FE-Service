import React from 'react';
import { Loader2, CheckCircle2, XCircle, AlertTriangle, FileSearch } from 'lucide-react';

export const Button = ({ children, variant = 'primary', state = 'default', className = '', ...props }: any) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium flex items-center justify-center transition-all duration-200 text-sm shadow-sm hover:shadow";
  const variants: Record<string, string> = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300",
    secondary: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "border-2 border-slate-900 text-slate-900 hover:bg-slate-50"
  };
  
  const isDisabled = state === 'disabled' || state === 'loading' || props.disabled;
  
  return (
    <button 
      className={`${baseStyle} ${variants[variant] || variants.primary} ${isDisabled ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {state === 'loading' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

export const Input = ({ label, error, ...props }: any) => {
  return (
    <div className="flex flex-col space-y-1 w-full">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input 
        className={`px-3 py-2 border rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-400 ${
          error ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-slate-800 focus:ring-slate-100 hover:border-gray-300'
        }`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export const Badge = ({ status }: { status: 'success' | 'error' | 'warning' | 'neutral' | 'loading' | string }) => {
  const styles: Record<string, string> = {
    success: "bg-green-100 text-green-800 border-green-200",
    error: "bg-red-100 text-red-800 border-red-200",
    warning: "bg-orange-100 text-orange-800 border-orange-200",
    neutral: "bg-gray-100 text-gray-800 border-gray-200",
    loading: "bg-blue-50 text-blue-800 border-blue-200"
  };
  
  const mappedStatus = styles[status] ? status : 'neutral';
  
  return (
    <span className={`px-2 py-1 text-xs font-medium border rounded-full flex items-center w-max ${styles[mappedStatus]}`}>
      {status === 'loading' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
      {status === 'success' && <CheckCircle2 className="w-3 h-3 mr-1" />}
      {status === 'error' && <XCircle className="w-3 h-3 mr-1" />}
      {status === 'warning' && <AlertTriangle className="w-3 h-3 mr-1" />}
      <span className="capitalize">{status}</span>
    </span>
  );
};

export const TableEmptyState = ({ title = "No Data Available", description = "There is no data to display at the moment." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
      <FileSearch className="w-12 h-12 text-gray-400 mb-3" />
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="w-full">
      <div className="animate-pulse space-y-4">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex space-x-4 border-b border-gray-100 pb-4">
            {[...Array(columns)].map((_, j) => (
              <div key={j} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
