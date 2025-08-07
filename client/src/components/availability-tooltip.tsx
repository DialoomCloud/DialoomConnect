import { useTranslation } from "react-i18next";

interface AvailabilityTooltipProps {
  status: 'Alta' | 'Media' | 'Baja';
  className?: string;
}

export function AvailabilityTooltip({ status, className = "" }: AvailabilityTooltipProps) {
  const { t } = useTranslation();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Alta': return 'bg-green-100 text-green-800';
      case 'Media': return 'bg-yellow-100 text-yellow-800';
      case 'Baja': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIndicatorColor = (status: string) => {
    switch (status) {
      case 'Alta': return 'bg-green-500';
      case 'Media': return 'bg-yellow-500';
      case 'Baja': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm cursor-help group relative ${getStatusColor(status)} ${className}`}>
      <div className={`w-2 h-2 rounded-full mr-2 ${getIndicatorColor(status)}`}></div>
      <span className="font-medium">{t('availability.label')}:</span>
      <span className="ml-1 font-bold">{status}</span>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        <div className="text-center">
          <div className="font-semibold mb-1">{t('availability.statusInfo')}:</div>
          <div>• <span className="text-green-400">{t('availability.high')}</span>: {t('availability.highDesc')}</div>
          <div>• <span className="text-yellow-400">{t('availability.medium')}</span>: {t('availability.mediumDesc')}</div>
          <div>• <span className="text-red-400">{t('availability.low')}</span>: {t('availability.lowDesc')}</div>
        </div>
        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
      </div>
    </div>
  );
}