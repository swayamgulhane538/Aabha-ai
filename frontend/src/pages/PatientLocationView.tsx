import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Navigation,
  MapPin,
  Home,
  Phone,
  Volume2,
  Share2,
  ArrowLeft,
  ShieldCheck,
  Compass,
  Battery,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { locationTrackingService, LocationPoint, GeofenceZone } from '../services/locationTrackingService';
import { speechService } from '../services/speechService';
import { useAuthStore } from '../stores/authStore';

export const PatientLocationView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();

  const lang = (i18n.language || 'hi').startsWith('mr') ? 'mr' : (i18n.language || 'hi').startsWith('hi') ? 'hi' : 'en';

  const [location, setLocation] = useState<LocationPoint>(locationTrackingService.getCurrentLocation());
  const [geofence, setGeofence] = useState<GeofenceZone>(locationTrackingService.getGeofence());
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setLocation(locationTrackingService.getCurrentLocation());
      setGeofence(locationTrackingService.getGeofence());
    };

    window.addEventListener('aabha-location-updated', handleUpdate);
    return () => window.removeEventListener('aabha-location-updated', handleUpdate);
  }, []);

  const handleSpeakWhereAmI = () => {
    const name = user?.name || 'अनिता जी';
    let speechText = '';
    if (lang === 'hi') {
      speechText = `नमस्ते ${name}, आप इस समय ${location.address} के पास हैं। आपका घर यहाँ से सिर्फ ${location.distanceFromHomeMeters} मीटर की दूरी पर है। आपके परिवार को आपकी लोकेशन मालूम है। घबराएं नहीं।`;
    } else if (lang === 'mr') {
      speechText = `नमस्ते ${name}, तुम्ही सध्या ${location.address} जवळ आहात. तुमचे घर येथून फक्त ${location.distanceFromHomeMeters} मीटर अंतरावर आहे. घाबरू नका.`;
    } else {
      speechText = `Hello ${name}, you are currently near ${location.address}. Your home is just ${location.distanceFromHomeMeters} meters away. Your family has your live location. Please stay calm.`;
    }

    speechService.speak(speechText, lang as any);
    setStatusMsg('Voice location assistance spoken.');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleShareWithFamily = () => {
    const { googleMapsUrl, shareText } = locationTrackingService.broadcastSosLocation();
    if (navigator.share) {
      navigator.share({
        title: 'AABHA AI - My Live Location',
        text: shareText,
        url: googleMapsUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setStatusMsg('Location link copied to share with family!');
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.006}%2C${location.lat - 0.005}%2C${location.lng + 0.006}%2C${location.lat + 0.005}&layer=mapnik&marker=${location.lat}%2C${location.lng}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3.5">
          <Link
            to="/patient"
            className="p-2.5 rounded-2xl bg-[var(--bg-surface-secondary)] hover:bg-blue-500/20 text-[var(--text-secondary)] hover:text-blue-400 border border-[var(--border)] transition-all shadow-xs"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-2">
              <Navigation className="w-7 h-7 text-blue-500 animate-pulse" />
              {t('Where Am I? (Safe Location & Home Guide)')}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              {t('Gentle GPS guide to help you feel safe and easily return home')}
            </p>
          </div>
        </div>

        <button
          onClick={handleSpeakWhereAmI}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white transition-all flex items-center gap-2 shadow-md shadow-blue-500/20"
        >
          <Volume2 className="w-4 h-4" />
          <span>{t('Tell Me Where I Am')}</span>
        </button>
      </div>

      {statusMsg && (
        <div className="mb-6 px-4 py-3 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-xs sm:text-sm font-semibold text-blue-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-400" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Main Big Safe Location Card */}
      <div
        className="rounded-3xl p-6 sm:p-8 border-2 border-blue-500/30 backdrop-blur-2xl shadow-xl space-y-6 mb-6"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        {/* Current Location Badge */}
        <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-2xl shrink-0 shadow-md">
            📍
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-blue-400">
              {t('You are currently at')}:
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-0.5">
              {location.address}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {location.distanceFromHomeMeters} meters away from your home ({geofence.homeAddress}).
            </p>
          </div>
        </div>

        {/* Live Map Frame */}
        <div className="relative w-full h-72 rounded-2xl overflow-hidden border border-[var(--border)] shadow-inner">
          <iframe
            title="Patient Map"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            src={mapEmbedUrl}
            className="w-full h-full filter saturate-125"
          />
          <div className="absolute top-3 right-3 z-10">
            <a
              href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/90 text-slate-950 border border-slate-300 shadow-md flex items-center gap-1.5"
            >
              <span>Open Directions</span> <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* 3 Big 1-Tap Emergency Assistance Buttons for Seniors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          {/* 1. Voice Guidance */}
          <button
            onClick={handleSpeakWhereAmI}
            className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white flex flex-col items-center justify-center gap-2 text-center shadow-lg shadow-blue-500/25 transition"
          >
            <Volume2 className="w-6 h-6" />
            <div>
              <span className="text-sm font-black block">आभा आवाज़ में बताएं</span>
              <span className="text-[10px] opacity-90">Spoken location help</span>
            </div>
          </button>

          {/* 2. Direct Call Rahul */}
          <a
            href="tel:+919876543210"
            className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white flex flex-col items-center justify-center gap-2 text-center shadow-lg shadow-emerald-500/25 transition"
          >
            <Phone className="w-6 h-6" />
            <div>
              <span className="text-sm font-black block">कॉल करें (राहुल - बेटा)</span>
              <span className="text-[10px] opacity-90">1-Tap Family Phone Call</span>
            </div>
          </a>

          {/* 3. Share Location */}
          <button
            onClick={handleShareWithFamily}
            className="p-4 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white flex flex-col items-center justify-center gap-2 text-center shadow-lg shadow-rose-500/25 transition"
          >
            <Share2 className="w-6 h-6" />
            <div>
              <span className="text-sm font-black block">लोकेशन शेयर करें</span>
              <span className="text-[10px] opacity-90">Send GPS to Family</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientLocationView;
