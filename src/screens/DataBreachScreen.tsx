import { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, Lock } from 'lucide-react';
import CyberHeader from '../components/CyberHeader';
import { Screen } from '../App';

interface DataBreachScreenProps {
  onNavigate: (screen: Screen) => void;
}

interface Breach {
  source: string;
  date: string;
  description: string;
  compromised_data: string[];
}

export default function DataBreachScreen({ onNavigate }: DataBreachScreenProps) {
  const [email, setEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isBreached, setIsBreached] = useState(false);
  const [breaches, setBreaches] = useState<Breach[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    
    setIsSearching(true);
    setHasSearched(false);
    
    const apiUrl = import.meta.env.VITE_API_URL || "https://gaurdshield-2.onrender.com";
    const xApiKey = import.meta.env.VITE_XPOSEDORNOT_API_KEY || "";

    // Attempt backend first
    fetch(`${apiUrl}/api/breach`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    })
      .then(res => res.json())
      .then(data => {
        setIsSearching(false);
        setHasSearched(true);
        setIsBreached(data.breached);
        setBreaches(data.breaches || []);
      })
      .catch(async err => {
        console.warn("Backend breach check failed, trying XposedOrNot public API", err);
        try {
          // Fallback to public XposedOrNot API if backend is down
          const headers: any = {};
          if (xApiKey) headers['x-api-key'] = xApiKey;

          const response = await fetch(`https://xposedornot.com/api/v1/checkback/${email}`, {
            headers
          });
          if (response.status === 200) {
            const xdata = await response.json();
            setIsBreached(true);
            setBreaches(xdata.breaches[0].map((b: any) => ({
              source: b,
              date: "Unknown",
              description: "Found in XposedOrNot database.",
              compromised_data: ["Email", "Unknown"]
            })));
          } else {
            setIsBreached(false);
          }
        } catch (xerr) {
          console.error("XposedOrNot fallback failed", xerr);
          setIsBreached(false);
        }
        setIsSearching(false);
        setHasSearched(true);
      });
  };

  return (
    <div className="flex flex-col p-4 md:p-6 h-screen overflow-y-auto pb-24">
      <CyberHeader 
        title="Data Breach Monitor" 
        subtitle="DARK WEB LEAK INSPECTOR" 
        onBack={() => onNavigate('dashboard')}
      />

      <div className="mt-6 bg-cyber-darkCard rounded-3xl p-6 border border-gray-800 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="text-cyber-cyanAccent" size={24} />
          <h3 className="text-white font-bold text-lg">Check Email Exposure</h3>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          Enter your email address to query across leaked records from known data breaches and dark web dumps. (Try test@example.com for a demo)
        </p>

        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address..."
              className="w-full bg-cyber-navy border border-gray-700 text-white rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:border-cyber-bluePrimary transition-colors"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={isSearching}
            className="flex items-center justify-center gap-2 bg-cyber-bluePrimary hover:bg-blue-600 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-lg transition-colors"
          >
            {isSearching ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search size={20} />
            )}
            <span>Scan</span>
          </button>
        </form>
      </div>

      {hasSearched && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white uppercase tracking-wide mb-4">Audit Results</h2>
          
          {isBreached ? (
            <div className="bg-cyber-darkCard border border-cyber-red rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-cyber-red">
                <AlertTriangle size={120} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="text-cyber-red" size={28} />
                  <h3 className="text-white font-bold text-xl">Breach Detected!</h3>
                </div>
                <p className="text-gray-300 text-sm mb-6">
                  The email <span className="text-cyber-yellow font-bold">{email}</span> was found in {breaches.length} known data breaches.
                </p>

                <div className="space-y-4">
                  {breaches.map((breach, idx) => (
                    <div key={idx} className="bg-cyber-navy p-4 rounded-xl border border-gray-800">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-bold">{breach.source}</h4>
                        <span className="text-xs text-gray-500">{breach.date}</span>
                      </div>
                      <p className="text-gray-400 text-xs mb-2">
                        {breach.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {breach.compromised_data.map((item, i) => (
                          <span key={i} className="bg-cyber-red/20 text-cyber-red text-[10px] px-2 py-1 rounded font-mono">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-cyber-yellow/10 border border-cyber-yellow/50 rounded-lg">
                  <h5 className="text-cyber-yellow font-bold text-sm mb-1">Recommended Action</h5>
                  <p className="text-gray-300 text-xs">
                    Change your passwords immediately for the affected services and any other site where you reused the same password. Enable Two-Factor Authentication (2FA).
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-cyber-green/10 border border-cyber-green rounded-2xl p-6 flex flex-col items-center text-center">
              <CheckCircle className="text-cyber-green mb-4" size={48} />
              <h3 className="text-white font-bold text-xl mb-2">No Breaches Found</h3>
              <p className="text-gray-300 text-sm">
                Good news! The email <span className="font-bold text-white">{email}</span> does not appear in any known public data breaches in our current database.
              </p>
              <p className="text-gray-500 text-xs mt-4">
                Continue to practice good security hygiene by using unique passwords for every service.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
