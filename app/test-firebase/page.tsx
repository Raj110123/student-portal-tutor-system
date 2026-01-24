'use client';

import { useEffect, useState } from 'react';
import { firebaseAuth } from '@/lib/firebaseClient';

export default function TestFirebasePage() {
  const [firebaseStatus, setFirebaseStatus] = useState<string>('Initializing...');
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    try {
      // Check if firebaseAuth is properly initialized
      if (firebaseAuth) {
        setFirebaseStatus('Firebase Auth initialized successfully!');
        // Log the config to see what's being used
        const app = firebaseAuth.app;
        if (app && app.options) {
          setConfig({
            apiKey: app.options.apiKey ? '***' + app.options.apiKey.slice(-5) : 'MISSING',
            authDomain: app.options.authDomain,
            projectId: app.options.projectId,
          });
        }
      } else {
        setFirebaseStatus('Firebase Auth is undefined');
      }
    } catch (error) {
      setFirebaseStatus(`Firebase initialization error: ${error}`);
      console.error('Firebase error:', error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Firebase Configuration Test</h1>
      <div className="bg-gray-800 p-6 rounded-lg">
        <p className="mb-4"><strong>Status:</strong> {firebaseStatus}</p>
        {config && (
          <div>
            <p className="mb-2"><strong>Firebase Config:</strong></p>
            <pre className="bg-gray-700 p-4 rounded overflow-auto">
              {JSON.stringify(config, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}