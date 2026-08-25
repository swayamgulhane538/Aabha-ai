import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle } from 'lucide-react';

const AlertsView = () => {
    const { t } = useTranslation();

    const alerts = [
        { id: '1', patientId: '1', patientName: 'John Smith', type: 'Missed Medication', message: 'John has not marked his morning medication as taken.', time: '2 hours ago', severity: 'high', read: false },
        { id: '2', patientId: '2', patientName: 'Mary Johnson', type: 'Inactivity', message: 'Mary has not logged in for 2 days.', time: '1 day ago', severity: 'medium', read: false },
        { id: '3', patientId: '1', patientName: 'John Smith', type: 'Game Completed', message: 'John completed a memory game session with 85% accuracy.', time: '2 days ago', severity: 'low', read: true },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Bell className="w-8 h-8 text-blue-600" />
                        {t('Alerts & Notifications')}
                    </h1>
                    <p className="text-gray-600 mt-1">{t('Stay updated on your patients\' activities and needs')}</p>
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="divide-y divide-gray-100">
                        {alerts.map(alert => (
                            <div key={alert.id} className={`p-6 flex flex-col sm:flex-row gap-4 sm:items-center transition-colors hover:bg-gray-50 ${!alert.read ? 'bg-blue-50/30' : ''}`}>
                                <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-2 sm:mt-0 ${
                                    alert.severity === 'high' ? 'bg-red-500' : 
                                    alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                                }`}></div>
                                
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-baseline gap-2 mb-1">
                                        <span className="font-bold text-gray-900">{alert.patientName}</span>
                                        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{t(alert.type)}</span>
                                        <span className="text-sm text-gray-400 ml-auto">{alert.time}</span>
                                    </div>
                                    <p className="text-gray-700">{t(alert.message)}</p>
                                </div>

                                <div className="flex items-center gap-3 mt-4 sm:mt-0">
                                    <Link to={`/caregiver/patients/${alert.patientId}`} className="text-sm font-medium text-blue-600 hover:underline">
                                        {t('View Patient')}
                                    </Link>
                                    {!alert.read && (
                                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title={t('Mark as read')}>
                                            <CheckCircle className="w-6 h-6" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlertsView;
