import React from 'react';
import Badge from './ui/badge/Badge';
import { useFeatures } from '../hooks/useFeatures';

export default function TrialBanner() {
  const { trialActive, trialDaysLeft, trialEnds } = useFeatures();
  if (trialActive === undefined) return null;
  return (
    <div className="w-full flex items-center justify-center bg-yellow-50 border-b border-yellow-300 py-2 z-50">
      {trialActive ? (
        <>
          <Badge className="bg-yellow-400 text-yellow-900 mr-2">Trial</Badge>
          <span>Your free trial ends in <b>{trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''}</b> ({trialEnds && new Date(trialEnds).toLocaleDateString()})</span>
          <button className="ml-4 px-3 py-1 rounded bg-purple-600 text-white font-bold hover:bg-purple-700 transition" onClick={() => {/* open upgrade modal */}}>Upgrade</button>
        </>
      ) : (
        <>
          <Badge className="bg-red-400 text-white mr-2">Trial Expired</Badge>
          <span>Your trial has ended. Unlock all features with Modulyn One+.</span>
          <button className="ml-4 px-3 py-1 rounded bg-purple-600 text-white font-bold hover:bg-purple-700 transition" onClick={() => {/* open upgrade modal */}}>Upgrade</button>
        </>
      )}
    </div>
  );
} 