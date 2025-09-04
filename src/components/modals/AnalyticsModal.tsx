import React from 'react';
import { BaseModal } from './BaseModal';
import { BarChart, TrendingUp, Eye } from 'lucide-react';

interface AnalyticsModalProps {
  data: any;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ data, onClose }) => {
  return (
    <BaseModal title="Analytics Dashboard" onClose={onClose} size="lg">
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-800 rounded-lg text-center">
            <Eye className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h3 className="text-white font-semibold">Views</h3>
            <p className="text-2xl text-blue-400 font-bold">1,234</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg text-center">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h3 className="text-white font-semibold">Engagement</h3>
            <p className="text-2xl text-green-400 font-bold">89%</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg text-center">
            <BarChart className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <h3 className="text-white font-semibold">Revenue</h3>
            <p className="text-2xl text-purple-400 font-bold">€12.5k</p>
          </div>
        </div>
        <div className="text-center text-gray-400">
          <p>Detailed analytics coming soon...</p>
        </div>
      </div>
    </BaseModal>
  );
};
