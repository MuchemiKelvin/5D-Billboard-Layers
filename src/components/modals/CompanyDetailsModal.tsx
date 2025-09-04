import React from 'react';
import { BaseModal } from './BaseModal';
import { Building, Globe, Calendar } from 'lucide-react';

interface CompanyDetailsModalProps {
  data: any;
  onClose: () => void;
}

export const CompanyDetailsModal: React.FC<CompanyDetailsModalProps> = ({ data, onClose }) => {
  return (
    <BaseModal title="Company Details" onClose={onClose} size="md">
      <div className="p-6 space-y-6">
        <div className="text-center">
          <Building className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white">Company Profile</h3>
          <p className="text-gray-400">Detailed information coming soon...</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <Globe className="w-6 h-6 text-green-400 mb-2" />
            <h4 className="text-white font-semibold">Industry</h4>
            <p className="text-gray-400 text-sm">Technology</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <Calendar className="w-6 h-6 text-purple-400 mb-2" />
            <h4 className="text-white font-semibold">Founded</h4>
            <p className="text-gray-400 text-sm">2020</p>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};
