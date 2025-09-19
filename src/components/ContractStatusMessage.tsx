import React from 'react';
import { AlertTriangle, Mail } from 'lucide-react';

interface ContractStatusMessageProps {
  reason: 'no_contract' | 'inactive' | 'expired';
}

const ContractStatusMessage: React.FC<ContractStatusMessageProps> = ({ reason }) => {
  const getStatusMessage = () => {
    switch (reason) {
      case 'no_contract':
        return 'You do not have a contract';
      case 'inactive':
        return 'Your contract is not active';
      case 'expired':
        return 'Your contract has expired';
      default:
        return 'Contract status issue';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <AlertTriangle size={64} className="text-orange-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">
          Access Restricted
        </h1>
        
        <p className="text-gray-300 mb-6">
          {getStatusMessage()}. Please contact the administrator to resolve this issue.
        </p>
        
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <Mail size={20} className="text-orange-400 mr-2" />
            <span className="text-orange-400 font-medium">Contact Admin</span>
          </div>
          <a 
            href="mailto:vuhieu8aa1@gmail.com"
            className="text-blue-400 hover:text-blue-300 transition-colors underline"
          >
            vuhieu8aa1@gmail.com
          </a>
        </div>
        
        <button
          onClick={() => window.location.href = '/home'}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default ContractStatusMessage;
