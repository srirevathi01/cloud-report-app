import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertCircle, CheckCircle, Expand } from '../icons';
import ExpandableChartModal from './ExpandableChartModal';

interface HealthEvent {
  service: string;
  region: string;
  status: 'operational' | 'degraded' | 'outage';
  message: string;
  lastUpdated: string;
  affectedResources?: number;
}

interface GlobalHealthDashboardProps {
  loading?: boolean;
}

const GlobalHealthDashboard: React.FC<GlobalHealthDashboardProps> = ({ loading }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([]);

  useEffect(() => {
    // Fetch AWS Health Dashboard data
    // For now, using mock data - in production, this would call AWS Health API
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    // Mock data - Replace with actual AWS Health API call
    const mockEvents: HealthEvent[] = [
      {
        service: 'Amazon EC2',
        region: 'us-east-1',
        status: 'operational',
        message: 'Service is operating normally',
        lastUpdated: new Date().toISOString(),
        affectedResources: 0
      },
      {
        service: 'Amazon RDS',
        region: 'us-west-2',
        status: 'operational',
        message: 'Service is operating normally',
        lastUpdated: new Date().toISOString(),
        affectedResources: 0
      },
      {
        service: 'Amazon S3',
        region: 'global',
        status: 'operational',
        message: 'Service is operating normally',
        lastUpdated: new Date().toISOString(),
        affectedResources: 0
      },
      {
        service: 'AWS Lambda',
        region: 'ap-south-1',
        status: 'operational',
        message: 'Service is operating normally',
        lastUpdated: new Date().toISOString(),
        affectedResources: 0
      }
    ];
    setHealthEvents(mockEvents);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-500 bg-green-50';
      case 'degraded':
        return 'text-yellow-500 bg-yellow-50';
      case 'outage':
        return 'text-red-400 bg-red-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'outage':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Activity className="w-5 h-5 text-slate-500" />;
    }
  };

  const operationalCount = healthEvents.filter(e => e.status === 'operational').length;
  const degradedCount = healthEvents.filter(e => e.status === 'degraded').length;
  const outageCount = healthEvents.filter(e => e.status === 'outage').length;

  const HealthContent = ({ size = 'normal' }: { size?: 'normal' | 'expanded' }) => {
    const displayEvents = size === 'expanded' ? healthEvents : healthEvents.slice(0, 4);

    return (
      <div className="space-y-3">
        {displayEvents.map((event, index) => (
          <div
            key={index}
            className="p-4 border border-slate-200/50 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all bg-white/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getStatusIcon(event.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-slate-700">{event.service}</h4>
                    <span className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
                      {event.region}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{event.message}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Last updated: {new Date(event.lastUpdated).toLocaleString()}
                  </p>
                </div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${getStatusColor(event.status)}`}>
                {event.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-lg bg-white/90 rounded-2xl shadow-xl border border-white/20 p-6"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gradient-to-r from-blue-600 to-green-600"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        whileHover={{ y: -4 }}
        className="group backdrop-blur-lg bg-white/90 rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 relative"
      >
        {/* Gradient Background Accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-green-50/30 to-teal-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-green-500 rounded-xl shadow-md">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-medium text-slate-700">AWS Health Dashboard</h3>
                <p className="text-xs text-slate-500 font-medium">Global service status</p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(true)}
              className="p-2 hover:bg-gradient-to-br hover:from-blue-50/60 hover:to-green-50/60 rounded-xl transition-all duration-200 group/btn"
              title="Expand view"
            >
              <Expand className="w-5 h-5 text-slate-500 group-hover/btn:text-blue-500 transition-colors" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 p-6 pb-4">
            <div className="text-center p-4 bg-gradient-to-br from-green-50/60 to-emerald-50/80 rounded-xl border border-green-200/50 hover:shadow-sm transition-shadow">
              <div className="text-2xl font-medium text-green-500">{operationalCount}</div>
              <div className="text-xs text-green-600 font-medium mt-1">Operational</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50/60 to-amber-50/80 rounded-xl border border-yellow-200/50 hover:shadow-sm transition-shadow">
              <div className="text-2xl font-medium text-yellow-500">{degradedCount}</div>
              <div className="text-xs text-yellow-600 font-medium mt-1">Degraded</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-red-50/60 to-rose-50/80 rounded-xl border border-red-200/50 hover:shadow-sm transition-shadow">
              <div className="text-2xl font-medium text-red-400">{outageCount}</div>
              <div className="text-xs text-red-500 font-medium mt-1">Outages</div>
            </div>
          </div>

          {/* Health Events */}
          <div className="px-6 pb-6">
            <HealthContent />
          </div>
        </div>
      </motion.div>

      {/* Expanded Modal */}
      <ExpandableChartModal
        isOpen={isExpanded}
        onClose={() => setIsExpanded(false)}
        title="AWS Health Dashboard - Detailed View"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <div className="text-4xl font-medium text-green-500 mb-2">{operationalCount}</div>
              <div className="text-sm text-green-600">Operational Services</div>
            </div>
            <div className="text-center p-6 bg-yellow-50 rounded-xl">
              <div className="text-4xl font-medium text-yellow-500 mb-2">{degradedCount}</div>
              <div className="text-sm text-yellow-600">Degraded Services</div>
            </div>
            <div className="text-center p-6 bg-red-50 rounded-xl">
              <div className="text-4xl font-medium text-red-400 mb-2">{outageCount}</div>
              <div className="text-sm text-red-500">Service Outages</div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-slate-700 mb-4">All Services Status</h4>
            <HealthContent size="expanded" />
          </div>
        </div>
      </ExpandableChartModal>
    </>
  );
};

export default GlobalHealthDashboard;
