import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Unlock, Upload, Eye, EyeOff, RefreshCw, ShieldCheck, AlertTriangle, X, Camera, ShieldAlert, LogOut, Home } from 'lucide-react';
import { encryptFile, decryptFile, calculatePasswordStrength } from '../services/cryptoService';
import DatabaseWithRestApi from './ui/database-with-rest-api';
import { uploadRecord, fetchRecords, clearVault, hydrateRecordFromIPFS } from '../services/storageService';
import { VaultRecord, VaultState, DecryptedImage } from '../types';
import { useAuth } from '../context/AuthContext';

export const Vault: React.FC = () => {
  const { logout } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Camera State
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Global status only for Upload workflow
  const [uploadStatus, setUploadStatus] = useState<VaultState>(VaultState.IDLE);

  // Localized status for decryption
  const [decryptingId, setDecryptingId] = useState<string | null>(null);
  const [decryptionErrors, setDecryptionErrors] = useState<Record<string, string>>({});

  const [records, setRecords] = useState<VaultRecord[]>([]);
  const [decryptedImages, setDecryptedImages] = useState<DecryptedImage[]>([]);
  const [mainErrorMsg, setMainErrorMsg] = useState('');

  // Password Strength State
  const [pwStrength, setPwStrength] = useState({ score: 0, label: '', color: '' });

  // Initial Load
  useEffect(() => {
    loadRecords();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      // Router will auto-redirect to login
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  useEffect(() => {
    setPwStrength(calculatePasswordStrength(password));
  }, [password]);

  // Handle File Preview
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  // Camera Logic
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      setShowCamera(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  useEffect(() => {
    if (showCamera && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [showCamera, cameraStream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], `capture_${Date.now()}.png`, { type: 'image/png' });
            setFile(capturedFile);
            stopCamera();
          }
        }, 'image/png');
      }
    }
  };

  const loadRecords = async () => {
    const data = await fetchRecords();
    setRecords(data);
  };

  const handleEncryptAndUpload = async () => {
    if (!file || !password) return;

    if (pwStrength.score < 30) {
      if (!confirm("Your password is very weak. A strong password is required for this security vault. Continue anyway?")) {
        return;
      }
    }

    try {
      setUploadStatus(VaultState.ENCRYPTING);

      // 1. Client Side Encryption
      const { encryptedData, metadata, hash } = await encryptFile(file, password);

      setUploadStatus(VaultState.UPLOADING);

      // 2. Upload to "IPFS" and "Blockchain"
      await uploadRecord(encryptedData, metadata, hash);

      setUploadStatus(VaultState.SUCCESS);
      setFile(null);
      await loadRecords();

      setTimeout(() => setUploadStatus(VaultState.IDLE), 2000);
    } catch (err: any) {
      console.error(err);
      setUploadStatus(VaultState.ERROR);
      setMainErrorMsg(err.message || "Encryption or Upload failed.");
    }
  };

  const handleDecryptView = async (record: VaultRecord) => {
    if (!password) {
      setDecryptionErrors(prev => ({ ...prev, [record.id]: "Password required" }));
      return;
    }

    try {
      if (decryptedImages.find(d => d.id === record.id)) return;

      setDecryptingId(record.id);
      setDecryptionErrors(prev => ({ ...prev, [record.id]: "" }));

      await new Promise(r => setTimeout(r, 50));

      let { encryptedData, metadata } = record;

      // Hydrate from IPFS if missing (Fresh Browser Scenario)
      if (!encryptedData || !metadata.iv) {
        try {
          console.log("Fetching content from IPFS...", record.ipfsCid);
          const cloudData = await hydrateRecordFromIPFS(record.ipfsCid);
          encryptedData = cloudData.encryptedData;
          metadata = cloudData.metadata;
        } catch (ipfsErr) {
          console.error("IPFS Fetch Failed", ipfsErr);
          setDecryptionErrors(prev => ({ ...prev, [record.id]: "IPFS Network Error" }));
          setDecryptingId(null);
          return;
        }
      }

      const url = await decryptFile(encryptedData, metadata, password);

      setDecryptedImages(prev => [...prev, { id: record.id, dataUrl: url }]);
    } catch (err) {
      console.error(err);
      setDecryptionErrors(prev => ({ ...prev, [record.id]: "Incorrect password" }));
    } finally {
      setDecryptingId(null);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setFile(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">

      {/* Header */}
      <div className="text-center space-y-4 pt-8 relative">
        <div className="absolute top-4 right-4">
          <Link
            to="/"
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-blue-500/10 hover:text-blue-400 text-slate-400 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-blue-500/20"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>

        <div className="flex justify-center mb-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-4 bg-slate-900 rounded-full border border-slate-700 ring-1 ring-white/10">
              <ShieldCheck className="w-12 h-12 text-blue-400" />
            </div>
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Privacy-Preserving Vault</h1>
          <p className="text-slate-400 mt-2 max-w-xl mx-auto text-sm">
            End-to-End Encrypted Storage. Zero-Knowledge Architecture.
          </p>
        </div>
      </div>

      {/* Main Control Panel */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
        <div className="grid md:grid-cols-2">

          {/* Left: Input & Key Gen */}
          <div className="p-8 space-y-8 border-b md:border-b-0 md:border-r border-slate-700">

            {/* Password Section */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-sm font-medium text-slate-300">Master Password</label>
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${pwStrength.color} text-black font-bold opacity-80`}>
                  {pwStrength.label || 'REQUIRED'}
                </span>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter strong passphrase..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 pl-10 pr-12 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="h-1.5 w-full bg-slate-700 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${pwStrength.color}`}
                  style={{ width: `${pwStrength.score}%` }}
                />
              </div>

              <div className="mt-3 flex items-start space-x-2 p-3 bg-blue-900/10 border border-blue-900/30 rounded-lg">
                <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-300/80 leading-relaxed">
                  <strong>Zero-Knowledge Warning:</strong> We do not store your password.
                  If you lose it, your data is mathematically impossible to recover.
                </p>
              </div>
            </div>

            {/* File Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Secure Upload</label>
              <div className="flex gap-4">
                <label className={`relative flex-1 cursor-pointer bg-slate-900 border-2 border-dashed rounded-lg h-40 transition-all group overflow-hidden
                    ${file ? 'border-blue-500 bg-slate-900' : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800'}`}>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />

                  {file && previewUrl ? (
                    <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-900">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">Change Image</span>
                      </div>
                      <button
                        onClick={clearFile}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 z-10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full space-y-3">
                      <div className="p-3 bg-slate-800 rounded-full group-hover:bg-slate-700 transition-colors">
                        <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-400" />
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-medium text-slate-400 group-hover:text-slate-300 block">
                          Drop or Select
                        </span>
                      </div>
                    </div>
                  )}
                </label>

                {/* Camera Button */}
                <button
                  onClick={startCamera}
                  className="w-24 bg-slate-800 border-2 border-slate-700 border-dashed rounded-lg hover:border-blue-500 hover:bg-slate-700 transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="p-2 bg-slate-700 rounded-full group-hover:bg-slate-600 transition-colors">
                    <Camera className="w-5 h-5 text-slate-400 group-hover:text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200">Camera</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleEncryptAndUpload}
              disabled={!file || !password || uploadStatus !== VaultState.IDLE}
              className={`w-full py-4 rounded-lg font-bold shadow-xl flex items-center justify-center space-x-2 transition-all transform active:scale-95
                ${!file || !password
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20'}`}
            >
              {uploadStatus === VaultState.ENCRYPTING ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /><span>Deriving Key & Encrypting...</span></>
              ) : uploadStatus === VaultState.UPLOADING ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /><span>Minting to Polygon Blockchain...</span></>
              ) : (
                <><Lock className="w-5 h-5" /><span>Encrypt & Mint</span></>
              )}
            </button>

            {uploadStatus === VaultState.SUCCESS && (
              <div className="p-3 bg-green-900/30 border border-green-800 rounded text-green-400 text-sm text-center">
                Encryption Successful. IPFS CID generated.
              </div>
            )}
            {uploadStatus === VaultState.ERROR && (
              <div className="p-3 bg-red-900/30 border border-red-800 rounded text-red-400 text-sm text-center flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {mainErrorMsg}
              </div>
            )}
          </div>

          {/* Right: Security Diagram / Info */}
          {/* Right: Security Diagram / Info */}
          <div className="bg-slate-950 p-4 md:p-8 flex flex-col justify-center border-l border-slate-800">
            <div className="flex justify-center transform scale-90 md:scale-100">
              <DatabaseWithRestApi
                className=""
                lightColor="#a855f7"
                title="ACTIVE SESSION"
                buttonTexts={{ first: "Validating", second: "Encrypted" }}
                circleText="SECURE"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Gallery Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white">Your Encrypted Vault</h2>
            <button
              onClick={loadRecords}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-blue-400 transition-colors"
              title="Sync from Blockchain"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => {
              if (confirm("Are you sure? This will remove all items from this view.\n\n(Data remains on Blockchain, click Sync to restore lists)")) {
                clearVault();
                setDecryptedImages([]);
                setRecords([]);
              }
            }}
            className="text-xs text-red-500 hover:text-red-400 underline underline-offset-4 flex items-center transition-colors"
          >
            <RefreshCw className="w-3 h-3 mr-1" /> Delete Local Storage
          </button>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
            <ShieldCheck className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Vault is empty.</p>
            <p className="text-slate-600 text-sm mt-1">Upload an image to start securing your data.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {records.map(record => {
              const isDecrypted = decryptedImages.find(d => d.id === record.id);
              const isDecrypting = decryptingId === record.id;
              const error = decryptionErrors[record.id];
              const isCloudOnly = !record.encryptedData;

              return (
                <div key={record.id} className={`group bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-900/10 flex flex-col ${isCloudOnly ? 'opacity-60 grayscale' : ''}`}>
                  {/* Visual Representation */}
                  <div className="h-56 bg-slate-900 flex items-center justify-center relative overflow-hidden shrink-0">
                    {isDecrypted ? (
                      <img src={isDecrypted.dataUrl} className="w-full h-full object-contain bg-slate-950" alt="Decrypted" />
                    ) : (
                      <>
                        {/* Matrix-like animation background */}
                        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80')] bg-cover"></div>
                        <div className="flex flex-col items-center text-slate-600 z-10">
                          {isDecrypting ? (
                            <div className="flex flex-col items-center">
                              <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                              <span className="text-xs text-blue-400 font-mono">Decrypting...</span>
                            </div>
                          ) : (
                            <>
                              <div className="p-3 bg-slate-800 rounded-full mb-3 border border-slate-700 shadow-xl">
                                <Lock className="w-8 h-8 text-blue-500" />
                              </div>
                              <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-slate-400">Encrypted</span>
                            </>
                          )}
                        </div>
                      </>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[10px] text-slate-300 font-mono">
                      {record.timestamp ? new Date(record.timestamp).toLocaleDateString() : 'Unknown Date'}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="space-y-3 mb-5 flex-1">
                      <div>
                        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Blockchain Ref (IPFS CID)</p>
                        <p className="text-xs font-mono text-slate-300 truncate opacity-80 mt-1" title={record.ipfsCid}>{record.ipfsCid}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Integrity Hash (SHA-256)</p>
                        <p className="text-[10px] font-mono text-blue-400 truncate opacity-80 mt-1 bg-blue-900/20 p-1 rounded border border-blue-900/30" title={record.hash}>{record.hash}</p>
                      </div>

                      {/* Storage Status Indicator */}
                      <div className="flex items-center space-x-2 mt-2">
                        {!record.encryptedData ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-purple-900/30 text-purple-400 border border-purple-800">
                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
                            Cloud Only (IPFS)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-800">
                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>
                            On Device
                          </span>
                        )}
                      </div>

                      {error && (
                        <div className="p-2 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-xs flex items-center animate-pulse">
                          <AlertTriangle className="w-3 h-3 mr-2" />
                          {error}
                        </div>
                      )}
                    </div>

                    {!isDecrypted && (
                      <button
                        onClick={() => handleDecryptView(record)}
                        disabled={isDecrypting}
                        className={`w-full py-2.5 text-sm font-medium rounded transition-all flex items-center justify-center space-x-2 
                                            ${isDecrypting
                            ? 'bg-slate-800 text-slate-500 cursor-wait'
                            : 'bg-slate-700 hover:bg-blue-600 text-white hover:shadow-lg hover:shadow-blue-500/20'}`}
                      >
                        {isDecrypting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                        <span>{isDecrypting ? 'Verifying Key...' : 'Decrypt Content'}</span>
                      </button>
                    )}
                    {isDecrypted && (
                      <div className="w-full py-2.5 bg-green-900/20 border border-green-900/50 text-green-400 text-sm font-medium rounded flex items-center justify-center space-x-2">
                        <Eye className="w-4 h-4" />
                        <span>Visible</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-white font-semibold flex items-center">
                <Camera className="w-5 h-5 mr-2 text-blue-500" /> Take Photo
              </h3>
              <button onClick={stopCamera} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="p-4 flex justify-center bg-slate-800/50">
              <button
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center bg-red-600 hover:bg-red-500 transition-all active:scale-95 shadow-lg"
              >
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};