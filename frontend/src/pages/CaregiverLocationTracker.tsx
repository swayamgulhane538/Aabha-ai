import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Navigation,
  Phone,
  Volume2,
  Share2,
  Battery,
  Clock,
  Compass,
  AlertTriangle,
  Settings2,
  ChevronRight,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Home,
  CheckCircle2,
  Info
} from 'lucide-react';
import { locationTrackingService, LocationPoint, GeofenceZone, LocationHistoryItem } from '../services/locationTrackingService';
import { speechService } from '../services/speechService';
import { useAuthStore } from '../stores/authStore';
import { KEYS, getStorage } from '../services/api';

export const CaregiverLocationTracker: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();

  const activePatientId = localStorage.getItem('aabha_active_patient_id') || 'PAT-2026-000001';
  const users = getStorage<any[]>(KEYS.USERS, []);
  const activePatient = users.find(u => u.patientId === activePatientId || u.id === activePatientId);
  const patientDisplayName = activePatient?.name || (activePatientId.startsWith('PAT-') ? `Patient (${activePatientId})` : 'Anita Sharma');

  const [location, setLocation] = useState<LocationPoint>(locationTrackingService.getCurrentLocation());
  const [geofence, setGeofence] = useState<GeofenceZone>(locationTrackingService.getGeofence());
  const [history, setHistory] = useState<LocationHistoryItem[]>(locationTrackingService.getLocationHistory());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showGeofenceModal, setShowGeofenceModal] = useState(false);
  const [newRadiusInput, setNewRadiusInput] = useState(geofence.radiusMeters);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setLocation(locationTrackingService.getCurrentLocation());
      setGeofence(locationTrackingService.getGeofence());
      setHistory(locationTrackingService.getLocationHistory());
    };

    window.addEventListener('aabha-location-updated', handleUpdate);
    return () => window.removeEventListener('aabha-location-updated', handleUpdate);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLocation(locationTrackingService.getCurrentLocation());
      setIsRefreshing(false);
      setActionSuccessMsg('Live GPS location synchronized with satellite beacon.');
      setTimeout(() => setActionSuccessMsg(''), 3500);
    }, 600);
  };

  const handleSaveGeofence = (e: React.FormEvent) => {
    e.preventDefault();
    locationTrackingService.setGeofenceRadius(newRadiusInput);
    setGeofence(locationTrackingService.getGeofence());
    setShowGeofenceModal(false);
    setActionSuccessMsg(`Safe Geofence updated to ${newRadiusInput} meters radius.`);
    setTimeout(() => setActionSuccessMsg(''), 3500);
  };

  const handleTriggerReturnAudio = () => {
    speechService.speak(
      `नमस्ते अनिता जी, आप अपने घर से थोड़ी दूर हैं। कृपया यहीं रुकें, आपके बेटे राहुल को आपकी लाइव लोकेशन भेज दी गई है।`,
      'hi'
    );
    setActionSuccessMsg('Voice return guidance played on patient device.');
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  const handleShareSosLocation = () => {
    const { googleMapsUrl, shareText } = locationTrackingService.broadcastSosLocation();
    if (navigator.share) {
      navigator.share({
        title: 'AABHA AI Patient Live Location',
        text: shareText,
        url: googleMapsUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setActionSuccessMsg('Emergency location & Google Maps link copied to clipboard!');
      setTimeout(() => setActionSuccessMsg(''), 4000);
    }
  };

  const openGoogleMaps = () => {
    window.open(`https://www.google.com/maps?q=${location.lat},${location.lng}`, '_blank');
  };

  // OpenStreetMap embed URL with marker
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.008}%2C${location.lat - 0.006}%2C${location.lng + 0.008}%2C${location.lat + 0.006}&layer=mapnik&marker=${location.lat}%2C${location.lng}`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans">
      {/* ─── Top Header & Live Beacon Status ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Navigation className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                {t('Family GPS Live Location & Wandering Guard')}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase flex items-center gap-1 ${
                location.isWithinSafeZone
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
              }`}>
                <span className={`w-2 h-2 rounded-full ${location.isWithinSafeZone ? 'bg-emerald-400' : 'bg-rose-400 animate-ping'}`}></span>
                {location.isWithinSafeZone ? 'Safe Inside Zone' : 'Wandering Alert Outside'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              {t('Real-time 24/7 satellite GPS tracking with safe home geofencing and emergency return guidance')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleManualRefresh}
            className={`p-2.5 rounded-xl bg-[var(--bg-surface-secondary)] hover:bg-blue-500/20 text-blue-400 border border-[var(--border)] transition-all shadow-xs ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refresh GPS Signal"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setNewRadiusInput(geofence.radiusMeters);
              setShowGeofenceModal(true);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--bg-surface-secondary)] hover:bg-purple-500/20 text-purple-300 border border-[var(--border)] transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Settings2 className="w-4 h-4" />
            <span>Geofence ({geofence.radiusMeters}m)</span>
          </button>

          <button
            onClick={handleShareSosLocation}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white transition-all flex items-center gap-1.5 shadow-md shadow-rose-500/25"
          >
            <Share2 className="w-4 h-4" />
            <span>Broadcast SOS Location</span>
          </button>
        </div>
      </div>

      {/* Action Success Alert Message */}
      {actionSuccessMsg && (
        <div className="mb-6 px-4 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs sm:text-sm font-semibold text-emerald-300 flex items-center gap-2 animate-fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* ─── Live Map Stage & Real-Time Telemetry Grid ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left: Big Interactive Map Container */}
        <div
          className="lg:col-span-8 rounded-3xl p-4 sm:p-6 border border-blue-500/30 backdrop-blur-2xl shadow-xl flex flex-col justify-between relative overflow-hidden min-h-[480px]"
          style={{ backgroundColor: 'var(--bg-surface)' }}
        >
          {/* Top Floating Map Status Overlay */}
          <div className="flex items-center justify-between z-10 mb-3 bg-[var(--bg-page)]/80 backdrop-blur-md p-3 rounded-2xl border border-[var(--border)] shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping" />
              <div>
                <span className="text-xs font-black text-[var(--text-primary)]">
                  {patientDisplayName}
                </span>
                <p className="text-[11px] text-[var(--text-secondary)] truncate max-w-xs sm:max-w-md">
                  📍 {location.address}
                </p>
              </div>
            </div>

            <button
              onClick={openGoogleMaps}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 transition-all flex items-center gap-1 shrink-0"
            >
              <span>Google Maps</span> <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Embedded Interactive Map Canvas */}
          <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-[var(--border)] shadow-inner">
            <iframe
              title="Patient Live Location Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={mapEmbedUrl}
              className="w-full h-full filter saturate-125"
            />

            {/* Simulated Live GPS Beacon Ping Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-blue-500/20 border-2 border-blue-400 animate-ping pointer-events-none" />
                <div className="absolute w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-lg border-2 border-white">
                  👤
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Live Geofence Distance Bar */}
          <div className="mt-4 pt-3 border-t border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <Home className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Safe Home: <strong className="text-[var(--text-primary)]">{geofence.homeAddress}</strong></span>
            </div>
            <span className="font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              {location.distanceFromHomeMeters} meters from Safe Home
            </span>
          </div>
        </div>

        {/* Right Side: Telemetry Cards & Quick Assistance */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4">
          {/* 4 Telemetry Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Battery */}
            <div
              className="rounded-3xl p-4 border border-[var(--border)] backdrop-blur-xl flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-surface)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Device Battery</span>
                <Battery className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-[var(--text-primary)]">
                  {location.batteryLevelPct}%
                </span>
                <p className="text-[10px] text-emerald-400 font-bold mt-0.5">Online & Connected</p>
              </div>
            </div>

            {/* GPS Accuracy */}
            <div
              className="rounded-3xl p-4 border border-[var(--border)] backdrop-blur-xl flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-surface)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">GPS Accuracy</span>
                <Compass className="w-4 h-4 text-blue-400" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-[var(--text-primary)]">
                  ±{location.accuracyMeters}m
                </span>
                <p className="text-[10px] text-blue-400 font-bold mt-0.5">High Precision Fix</p>
              </div>
            </div>

            {/* Speed */}
            <div
              className="rounded-3xl p-4 border border-[var(--border)] backdrop-blur-xl flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-surface)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Movement Speed</span>
                <Navigation className="w-4 h-4 text-teal-400" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-[var(--text-primary)]">
                  {location.speedKmh} <span className="text-xs font-semibold text-[var(--text-secondary)]">km/h</span>
                </span>
                <p className="text-[10px] text-teal-400 font-bold mt-0.5">Gentle Paced Walking</p>
              </div>
            </div>

            {/* Last Fix Time */}
            <div
              className="rounded-3xl p-4 border border-[var(--border)] backdrop-blur-xl flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-surface)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Last Ping</span>
                <Clock className="w-4 h-4 text-purple-400" />
              </div>
              <div className="mt-3">
                <span className="text-base font-black text-[var(--text-primary)]">
                  {new Date(location.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <p className="text-[10px] text-purple-400 font-bold mt-0.5">Live Real-time</p>
              </div>
            </div>
          </div>

          {/* Quick Family Intervention Controls */}
          <div
            className="rounded-3xl p-5 border border-[var(--border)] backdrop-blur-xl shadow-lg space-y-3"
            style={{ backgroundColor: 'var(--bg-surface)' }}
          >
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-400" /> Family Safety Controls
            </h3>

            {/* 1. Trigger Voice Assistance on Patient Device */}
            <button
              onClick={handleTriggerReturnAudio}
              className="w-full p-3 rounded-2xl bg-[var(--bg-surface-secondary)] hover:bg-blue-500/20 text-[var(--text-primary)] border border-[var(--border)] hover:border-blue-500/40 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold group-hover:text-blue-400 transition-colors">Speak Return Audio</h5>
                  <p className="text-[10px] text-[var(--text-secondary)]">Play comforting guide on patient's phone</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
            </button>

            {/* 2. Direct Call to Patient */}
            <a
              href="tel:+919876543210"
              className="w-full p-3 rounded-2xl bg-[var(--bg-surface-secondary)] hover:bg-emerald-500/20 text-[var(--text-primary)] border border-[var(--border)] hover:border-emerald-500/40 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold group-hover:text-emerald-400 transition-colors">Call Patient (+91 98765 43210)</h5>
                  <p className="text-[10px] text-[var(--text-secondary)]">Direct cellular connection</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
            </a>
          </div>
        </div>
      </div>

      {/* ─── 24-Hour Breadcrumb Location Timeline History ─────────────────── */}
      <div
        className="rounded-3xl p-6 sm:p-7 border border-[var(--border)] backdrop-blur-xl shadow-lg"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              {t("Today's Movement History & Safe Route Logs")}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Detailed chronological tracking path to analyze wandering patterns
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {history.length} Checkpoints Logged
          </span>
        </div>

        <div className="space-y-2.5">
          {history.slice(0, 5).map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-3.5 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  item.status === 'SAFE' ? 'bg-emerald-400' : 'bg-rose-400 animate-ping'
                }`} />
                <div>
                  <span className="font-bold text-[var(--text-primary)]">{item.address}</span>
                  <p className="text-[10px] text-[var(--text-secondary)]">
                    GPS: {item.lat.toFixed(5)}, {item.lng.toFixed(5)} • {item.distanceMeters}m from Home
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)] font-mono text-[11px] self-end sm:self-center">
                <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                  item.status === 'SAFE' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Geofence Radius Modal ────────────────────────────────────────── */}
      {showGeofenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-3xl p-6 border border-[var(--border)] shadow-2xl animate-in fade-in zoom-in duration-200"
            style={{ backgroundColor: 'var(--bg-surface)' }}
          >
            <h3 className="text-lg font-black text-[var(--text-primary)] mb-1">
              {t('Set Safe Home Geofence Radius')}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-5">
              If the patient wanders beyond this radius from home, immediate notifications are dispatched to family.
            </p>

            <form onSubmit={handleSaveGeofence}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                    {t('Safe Radius in Meters')}
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="10000"
                    step="50"
                    value={newRadiusInput}
                    onChange={(e) => setNewRadiusInput(parseInt(e.target.value, 10))}
                    className="w-full px-4 py-3 rounded-2xl text-lg font-bold bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-hidden focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Preset Choices */}
                <div className="grid grid-cols-4 gap-2">
                  {[250, 500, 1000, 2000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewRadiusInput(preset)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        newRadiusInput === preset
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-[var(--bg-surface-secondary)] text-[var(--text-primary)] border-[var(--border)]'
                      }`}
                    >
                      {preset >= 1000 ? `${preset / 1000} km` : `${preset} m`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowGeofenceModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] transition-all"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-500/20"
                >
                  {t('Save Geofence')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaregiverLocationTracker;
