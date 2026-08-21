import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getSpreadsheetData } from '../lib/sheets';
import { InventoryItem } from '../types';
import { Search, Loader2, Database, AlertCircle, Package, LogOut, Plus, Settings, FileText, FileSpreadsheet, Trash2, Edit2, Radio, Cloud, CloudOff, RefreshCw, ScanLine, UserCircle, Key, Save, Sun, Moon } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { db, auth, googleProvider } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, setDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { signInWithPopup, onAuthStateChanged, signOut, sendPasswordResetEmail } from 'firebase/auth';
import BarcodeScanner from './BarcodeScanner';
import QRCode from 'react-qr-code';

interface InventoryDashboardProps {
  onLogout: () => void;
}

interface PartRequest {
  id?: string;
  sku: string;
  deskripsi: string;
  qty: string;
  alasan: string;
  date: string;
}

const SPREADSHEET_ID = '1wgiFxu3-fBXZtnax6XlQ40reQUR0C26Y6eWFWMGGWcI';

export default function InventoryDashboard({ onLogout }: InventoryDashboardProps) {
  const [data, setData] = useState<InventoryItem[]>([]);
  const [localData, setLocalData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [scanTarget, setScanTarget] = useState<'search' | 'addSku' | 'reqSku' | null>(null);
  const [activeView, setActiveView] = useState<'inventory' | 'add' | 'request' | 'owner' | 'audit' | 'settings'>('inventory');
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [settingsName, setSettingsName] = useState('Riki');
  const [settingsApp, setSettingsApp] = useState('GudangKu');
  const [settingsStatus, setSettingsStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);
  const [settingsTab, setSettingsTab] = useState<'profile' | 'owner' | 'audit'>('profile');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      try { localStorage.setItem('theme', 'dark'); } catch(e) {}
    } else {
      document.documentElement.classList.remove('dark');
      try { localStorage.setItem('theme', 'light'); } catch(e) {}
    }
  }, [isDarkMode]);


  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Sidebar Resizer states
  const containerRef = useRef<HTMLDivElement>(null);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add Part Form states
  const [newKode, setNewKode] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newDeskripsi, setNewDeskripsi] = useState('');
  const [addStatus, setAddStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [addHistory, setAddHistory] = useState<{kode: string, sku: string, time: string}[]>([]);

  // Edit Part states
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editKode, setEditKode] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editDeskripsi, setEditDeskripsi] = useState('');

  // Request Part Form states
  const [requestSku, setRequestSku] = useState('');
  const [requestDeskripsi, setRequestDeskripsi] = useState('');
  const [requestQty, setRequestQty] = useState('');
  const [requestAlasan, setRequestAlasan] = useState('');
  const [requestStatus, setRequestStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [requestHistory, setRequestHistory] = useState<PartRequest[]>([]);
  const [editingRequestIndex, setEditingRequestIndex] = useState<number | null>(null);

  // System notification state
  const [sysAlert, setSysAlert] = useState<string | null>(null);
  const [showEmailPrompt, setShowEmailPrompt] = useState(true);
  const mySessionIdRef = useRef(Math.random().toString(36).substring(2, 10));

  const registerSession = (email: string, deviceType: string) => {
    addDoc(collection(db, 'sessions'), {
      sessionId: mySessionIdRef.current,
      device: deviceType,
      email: email,
      timestamp: new Date().toISOString()
    }).then(() => {
      fetch('/api/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          device: deviceType, 
          time: new Date().toLocaleTimeString('id-ID')
        })
      }).catch(console.error);
    }).catch(console.error);
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
      alert("Gagal login dengan Google.");
    }
  };

  useEffect(() => {
    let mounted = true;
    let isInitialLoad = true;
    
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (mounted) setShowEmailPrompt(false);
        const isMobile = /Mobile|Android|iP(hone|od)/i.test(navigator.userAgent);
        registerSession(user.email || 'unknown@gmail.com', isMobile ? 'MOBILE_NODE' : 'DESKTOP_NODE');
      } else {
        if (mounted) setShowEmailPrompt(true);
      }
    });

    // Listen for new connections
    const qSessions = query(collection(db, 'sessions'), orderBy('timestamp', 'desc'), limit(5));
    const unsubSessions = onSnapshot(qSessions, (snapshot) => {
      const sessionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (mounted) setActiveSessions(sessionsData);
      
      if (isInitialLoad) {
        isInitialLoad = false;
        return;
      }
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.sessionId !== mySessionIdRef.current && mounted) {
             setSysAlert(`SYS_ALERT: ${data.device} CONNECTED | EMAIL: ${data.email || 'mohamadrizkiheriyana1@gmail.com'}`);
             setTimeout(() => {
                if (mounted) setSysAlert(null);
             }, 15000);
          }
        }
      });
    });

    // Listen to parts from Firestore
    const qParts = query(collection(db, 'parts'));
    const unsubParts = onSnapshot(qParts, (snapshot) => {
      const parts: any[] = [];
      snapshot.forEach(doc => {
        parts.push({ id: doc.id, ...doc.data() });
      });
      if (mounted) setLocalData(parts);
    });

    // Listen to requests from Firestore
    const qRequests = query(collection(db, 'requests'), orderBy('date', 'desc'));
    const unsubRequests = onSnapshot(qRequests, (snapshot) => {
      const reqs: any[] = [];
      snapshot.forEach(doc => {
        reqs.push({ id: doc.id, ...doc.data() });
      });
      if (mounted) setRequestHistory(reqs);
    });

        // Listen to settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'profile'), (docSnap) => {
      if (docSnap.exists() && mounted) {
        const data = docSnap.data();
        if (data.name) setSettingsName(data.name);
        if (data.appName) setSettingsApp(data.appName);
      }
    });

    // Listen to audit logs
    const qAudit = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(100));
    const unsubAudit = onSnapshot(qAudit, (snapshot) => {
      const logs: any[] = [];
      snapshot.forEach(doc => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      if (mounted) setAuditLogs(logs);
    });

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const rows = await getSpreadsheetData(SPREADSHEET_ID);
        
        if (!mounted) return;

        if (rows.length < 2) {
          setData([]);
          setLoading(false);
          return;
        }

        // The first row is usually headers
        const headers = rows[0].map(h => h.toLowerCase().trim());
        
        const kodeIdx = headers.findIndex(h => h.includes('kode'));
        const skuIdx = headers.findIndex(h => h.includes('sku'));
        const deskripsiIdx = headers.findIndex(h => h.includes('deskripsi') || h.includes('description'));

        const parsedData: InventoryItem[] = rows.slice(1).map(row => ({
          kode: kodeIdx >= 0 ? (row[kodeIdx] || '-') : '-',
          sku: skuIdx >= 0 ? (row[skuIdx] || '-') : '-',
          deskripsi: deskripsiIdx >= 0 ? (row[deskripsiIdx] || '-') : '-',
          rawData: row,
        })).filter(item => item.kode !== '-' || item.sku !== '-' || item.deskripsi !== '-');

        setData(parsedData);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || 'Gagal memuat data dari spreadsheet.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
      unsubAuth();
      unsubSessions();
      unsubParts();
      unsubRequests();
      unsubAudit();
      unsubSettings();
    };
  }, []);

  const combinedData = useMemo(() => {
    return [...localData, ...data];
  }, [data, localData]);

  const filteredData = useMemo(() => {
    if (!appliedQuery.trim()) return combinedData;
    const query = appliedQuery.toLowerCase();
    return combinedData.filter(
      item => 
        item.kode.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.deskripsi.toLowerCase().includes(query)
    );
  }, [combinedData, appliedQuery]);


  const handleEditClick = (item: InventoryItem) => {
    if (!item.id) return;
    setEditingItem(item.id);
    setEditKode(item.kode);
    setEditSku(item.sku);
    setEditDeskripsi(item.deskripsi);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      await updateDoc(doc(db, 'parts', editingItem), {
        kode: editKode.trim(),
        sku: editSku.trim(),
        deskripsi: editDeskripsi.trim()
      });
      await addAuditLog('EDIT', `Edited item: ${editSku.trim()}`, { id: editingItem, kode: editKode.trim(), sku: editSku.trim(), deskripsi: editDeskripsi.trim() });
      setEditingItem(null);
    } catch (err) {
      console.error(err);
      alert('Gagal mengupdate record');
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    try {
      const itemToDelete = localData.find(i => i.id === id);
      await deleteDoc(doc(db, 'parts', id));
      if (itemToDelete) {
        await addAuditLog('DELETE', `Deleted item: ${itemToDelete.sku}`, itemToDelete);
      }
    } catch (err) {
      console.error(err);
    }
  };


  const addAuditLog = async (action: 'ADD' | 'EDIT' | 'DELETE' | 'LOGIN' | 'SEARCH' | string, details: string, itemData: any) => {
    try {
      await addDoc(collection(db, 'audit_logs'), {
        action,
        details,
        itemData,
        timestamp: new Date().toISOString(),
        user: auth.currentUser?.email || 'Unknown User'
      });
    } catch (error) {
      console.error("Failed to add audit log", error);
    }
  };


  const handleScanComplete = (decodedText: string) => {
    if (scanTarget === 'search') {
      setSearchQuery(decodedText);
      setAppliedQuery(decodedText);
      setActiveView('inventory');
    } else if (scanTarget === 'addSku') {
      setNewSku(decodedText);
    } else if (scanTarget === 'reqSku') {
      setRequestSku(decodedText);
    }
    setScanTarget(null);
  };

  
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'profile'), {
        name: settingsName,
        appName: settingsApp,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      await addAuditLog('EDIT', 'Update Profil Sistem', { name: settingsName, appName: settingsApp });
      setSettingsStatus({ type: 'success', msg: 'PROFIL BERHASIL DIPERBARUI' });
      setTimeout(() => setSettingsStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setSettingsStatus({ type: 'error', msg: 'GAGAL MEMPERBARUI PROFIL' });
    }
  };

  const handleResetPassword = async () => {
    if (!auth.currentUser?.email) return;
    try {
      await sendPasswordResetEmail(auth, auth.currentUser.email);
      setSettingsStatus({ type: 'success', msg: 'LINK RESET PASSWORD TELAH DIKIRIM KE EMAIL' });
      await addAuditLog('EDIT', 'Request Password Reset', { email: auth.currentUser.email });
      setTimeout(() => setSettingsStatus(null), 5000);
    } catch (err) {
      console.error(err);
      setSettingsStatus({ type: 'error', msg: 'GAGAL MENGIRIM LINK RESET PASSWORD' });
    }
  };

  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKode.trim() || !newSku.trim() || !newDeskripsi.trim()) {
      setAddStatus({ type: 'error', message: 'Semua field wajib diisi.' });
      return;
    }

    try {
      await addDoc(collection(db, 'parts'), {
        kode: newKode.trim(),
        sku: newSku.trim(),
        deskripsi: newDeskripsi.trim(),
      });
      setAddHistory(prev => [{ kode: newKode.trim(), sku: newSku.trim(), time: new Date().toLocaleTimeString('id-ID') }, ...prev].slice(0, 5));
      setNewKode('');
      setNewSku('');
      setNewDeskripsi('');
      await addAuditLog('ADD', `Added new item: ${newSku.trim()}`, { kode: newKode.trim(), sku: newSku.trim(), deskripsi: newDeskripsi.trim() });
      setAddStatus({ type: 'success', message: 'RECORD_ADDED_SUCCESSFULLY' });
    } catch (err) {
      console.error(err);
      setAddStatus({ type: 'error', message: 'FAILED_TO_ADD_RECORD' });
    }

    setTimeout(() => {
      setAddStatus({ type: null, message: '' });
    }, 3000);
  };

  const handleRequestPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestSku.trim() || !requestDeskripsi.trim() || !requestQty.trim() || !requestAlasan.trim()) {
      setRequestStatus({ type: 'error', message: 'SEMUA_FIELD_WAJIB_DIISI' });
      return;
    }

    try {
      const dataToSave = {
        sku: requestSku.trim(),
        deskripsi: requestDeskripsi.trim(),
        qty: requestQty.trim(),
        alasan: requestAlasan.trim(),
        date: editingRequestIndex !== null ? requestHistory[editingRequestIndex].date : new Date().toISOString()
      };

      if (editingRequestIndex !== null) {
        const idToEdit = requestHistory[editingRequestIndex].id;
        if (idToEdit) {
          await updateDoc(doc(db, 'requests', idToEdit), dataToSave);
          await addAuditLog('EDIT', `Update pengajuan: ${dataToSave.sku}`, dataToSave);
        }
        setRequestStatus({ type: 'success', message: 'REQUEST_UPDATED_SUCCESSFULLY' });
      } else {
        await addDoc(collection(db, 'requests'), dataToSave);
        await addAuditLog('ADD', `Pengajuan baru: ${dataToSave.sku}`, dataToSave);
        setRequestStatus({ type: 'success', message: 'REQUEST_SUBMITTED_SUCCESSFULLY' });
      }

      // Reset form
      setRequestSku('');
      setRequestDeskripsi('');
      setRequestQty('');
      setRequestAlasan('');
      setEditingRequestIndex(null);
    } catch (err) {
      console.error(err);
      setRequestStatus({ type: 'error', message: 'ERROR_SUBMITTING_REQUEST' });
    }

    setTimeout(() => {
      setRequestStatus({ type: null, message: '' });
    }, 3000);
  };

  const handleEditRequest = (index: number, req: PartRequest) => {
    setEditingRequestIndex(index);
    setRequestSku(req.sku);
    setRequestDeskripsi(req.deskripsi);
    setRequestQty(req.qty);
    setRequestAlasan(req.alasan);
    // Switch to request view if not already there
    setActiveView('request');
  };

  const handleDeleteRequest = async (index: number) => {
    const req = requestHistory[index];
    if (!req.id) return;

    try {
      await deleteDoc(doc(db, 'requests', req.id));
      await addAuditLog('DELETE', `Hapus pengajuan: ${req.sku}`, req);
      
      // Clear form if we were editing the deleted item
      if (editingRequestIndex === index) {
        setEditingRequestIndex(null);
        setRequestSku('');
        setRequestDeskripsi('');
        setRequestQty('');
        setRequestAlasan('');
      } else if (editingRequestIndex !== null && index < editingRequestIndex) {
        // Adjust editing index if an item before it was deleted
        setEditingRequestIndex(editingRequestIndex - 1);
      }
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const handleDownloadPDF = () => {
    if (requestHistory.length === 0) {
      setRequestStatus({ type: 'error', message: 'BELUM_ADA_DATA_LAPORAN_PENGAJUAN' });
      return;
    }

    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN TOTAL PENGAJUAN PART", 14, 20);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Pengajuan: ${requestHistory.length}`, 14, 38);
    
    const tableColumn = ["Tanggal", "SKU ID", "Deskripsi", "QTY", "Alasan"];
    const tableRows = requestHistory.map(req => [
      new Date(req.date).toLocaleDateString(),
      req.sku,
      req.deskripsi,
      req.qty,
      req.alasan
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
    });
    
    doc.save(`Laporan_Pengajuan_${new Date().getTime()}.pdf`);
  };

  const handleExportInventoryCSV = () => {
    if (filteredData.length === 0) {
      alert('Tidak ada data untuk diekspor');
      return;
    }
    
    // Prepare data for export
    const csvData = filteredData.map(item => ({
      'KODE': item.kode,
      'SKU ID': item.sku,
      'DESKRIPSI': item.deskripsi
    }));
    
    const csvString = Papa.unparse(csvData);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Inventory_Export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadExcel = () => {
    if (requestHistory.length === 0) {
      setRequestStatus({ type: 'error', message: 'BELUM_ADA_DATA_LAPORAN_PENGAJUAN' });
      return;
    }

    const data = requestHistory.map(req => ({
      "Tanggal Pengajuan": new Date(req.date).toLocaleDateString(),
      "SKU ID": req.sku,
      "Deskripsi Part": req.deskripsi,
      "Quantity": req.qty,
      "Alasan Pengajuan": req.alasan
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Pengajuan");
    XLSX.writeFile(wb, `Laporan_Pengajuan_${new Date().getTime()}.xlsx`);
  };

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const stopResizing = () => setIsResizing(false);
    const resize = (e: MouseEvent) => {
      if (isResizing && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newWidth = e.clientX - containerRect.left;
        if (newWidth >= 150 && newWidth <= 600) {
          setSidebarWidth(newWidth);
        }
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  return (
    <div className="min-h-screen md:h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-['Space_Mono',monospace] flex items-center justify-center md:overflow-hidden antialiased">
      
      {sysAlert && (
        <div className="fixed top-4 right-4 md:top-8 md:right-8 bg-[var(--overlay-90)] border border-[var(--accent)] p-4 text-[var(--accent)] text-sm uppercase z-[100] flex gap-3 items-center backdrop-blur-sm shadow-[0_0_15px_rgba(0,242,255,0.2)] animate-pulse">
          <Radio className="w-4 h-4 animate-pulse" />
          <span>{sysAlert}</span>
        </div>
      )}

      {scanTarget && (
        <BarcodeScanner 
          onScan={handleScanComplete} 
          onClose={() => setScanTarget(null)} 
        />
      )}
      {showEmailPrompt && (
        <div className="fixed inset-0 bg-[var(--overlay-80)] z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[var(--bg-main)] border border-[var(--border-10)] p-8 w-full max-w-md flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-[var(--accent)] font-['Syne',sans-serif] text-xl text-center">OTORISASI AKSES GUDANGKU</h2>
              <p className="text-sm opacity-60 text-center">Silakan verifikasi identitas (Login dengan Google) Anda untuk mengakses sistem dan dicatat dalam log Active Sessions.</p>
            </div>
            
            <div className="flex flex-col items-center gap-4 bg-[var(--overlay-50)] p-4 border border-[var(--border-10)]">
              <p className="text-sm uppercase tracking-widest text-[var(--text-main)]/60">Login Cepat via HP</p>
              <div className="bg-white p-2">
                <QRCode value="https://gudangku-1.ai.studio/" size={150} />
              </div>
              <p className="text-xs uppercase tracking-widest text-[var(--accent)]/80 text-center">Scan QR untuk membuka aplikasi ini di perangkat mobile Anda</p>
            </div>

            <button 
              onClick={handleGoogleLogin}
              className="bg-[var(--accent)] text-black uppercase text-sm tracking-widest font-bold py-3 hover:bg-white transition-colors"
            >
              LOGIN DENGAN GOOGLE
            </button>
          </div>
        </div>
      )}

      <div 
        ref={containerRef}
        className="flex flex-col md:grid md:grid-rows-[80px_1fr_40px] w-full max-w-[1400px] min-h-screen md:min-h-0 md:h-screen md:max-h-[900px] md:border border-[var(--border-10)] bg-[var(--white-02)]"
        style={{ gridTemplateColumns: isMobile ? '1fr' : `${sidebarWidth}px 1fr` }}
      >
        
        {/* Header */}
        <header className="shrink-0 col-span-full flex items-center px-4 md:px-10 py-4 md:py-0 md:h-full border-b border-[var(--border-10)] justify-between">
          <div className="flex flex-col">
            <div className="font-['Syne',sans-serif] text-xl md:text-[1.8rem] tracking-[-0.04em] text-[var(--accent)]">{settingsApp.toUpperCase()}_</div>
            <div className="text-xs text-[var(--accent)] capitalize tracking-widest mt-[-2px]">Owner App {settingsName}</div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 text-xs md:text-xs uppercase px-3 py-1.5 border ${error ? 'text-red-500 border-red-500/30 bg-red-500/10' : loading ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' : 'text-[var(--accent)] border-[var(--accent)]/30 bg-[var(--accent)]/10'}`} title="Status Sinkronisasi G-Sheets (Baca-saja)">
              {error ? (
                <><CloudOff className="w-3 h-3" /> <span>ERROR</span></>
              ) : loading ? (
                <><RefreshCw className="w-3 h-3 animate-spin" /> <span className="animate-pulse">SYNCING</span></>
              ) : (
                <><Cloud className="w-3 h-3" /> <span>SYNCED</span></>
              )}
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 border border-[var(--border-20)] hover:border-[var(--accent)] text-[var(--text-main)] hover:text-[var(--accent)] transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="text-xs uppercase text-[var(--text-main)] hidden sm:block">Node_07 / Active</div>
            <button 
              className="flex items-center gap-2 cursor-pointer text-red-500 hover:text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 text-xs md:text-xs uppercase tracking-widest transition-all" 
              onClick={onLogout} 
              title="Shutdown System"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden md:inline">SHUTDOWN</span>
            </button>
          </div>
        </header>

        {/* Sidebar */}
        <aside className="border-b md:border-b-0 md:border-r border-[var(--border-10)] flex flex-row md:flex-col py-0 md:py-5 relative select-none overflow-x-auto shrink-0 hide-scrollbar sticky top-0 z-20 bg-[var(--bg-main)] md:bg-transparent md:static">
          <nav className="flex flex-row md:flex-col min-w-max md:min-w-0">
            <button 
              onClick={() => setActiveView('inventory')}
              className={`text-left px-4 py-3 md:px-10 md:py-[15px] text-sm uppercase border-b-2 md:border-b-0 md:border-l-2 cursor-pointer transition-all ${activeView === 'inventory' ? 'border-[var(--accent)] opacity-100 text-[var(--accent)]' : 'border-transparent opacity-60'}`}
            >
              01. Inventaris
            </button>
            <button 
              onClick={() => setActiveView('add')}
              className={`text-left px-4 py-3 md:px-10 md:py-[15px] text-sm uppercase border-b-2 md:border-b-0 md:border-l-2 cursor-pointer transition-all ${activeView === 'add' ? 'border-[var(--accent)] opacity-100 text-[var(--accent)]' : 'border-transparent opacity-60'}`}
            >
              02. Tambah
            </button>
            <button 
              onClick={() => setActiveView('request')}
              className={`text-left px-4 py-3 md:px-10 md:py-[15px] text-sm uppercase border-b-2 md:border-b-0 md:border-l-2 cursor-pointer transition-all ${activeView === 'request' ? 'border-[var(--accent)] opacity-100 text-[var(--accent)]' : 'border-transparent opacity-60'}`}
            >
              03. Ajuan
            </button>
                        <button 
              onClick={() => setActiveView('settings')}
              className={`text-left px-4 py-3 md:px-10 md:py-[15px] text-sm uppercase border-b-2 md:border-b-0 md:border-l-2 cursor-pointer transition-all ${activeView === 'settings' ? 'border-[var(--accent)] opacity-100 text-[var(--accent)]' : 'border-transparent opacity-60'}`}
            >
              04. Pengaturan
            </button>
          </nav>
          
          {/* Mobile QR */}
          <div className="hidden md:flex flex-col items-center mt-auto p-4 mb-4 opacity-30 hover:opacity-100 transition-opacity">
            <p className="text-xs uppercase tracking-widest text-[var(--text-main)] mb-3 font-bold">Akses Mobile</p>
            <div className="bg-white p-2 border border-[var(--border-20)]">
              <QRCode value={typeof window !== 'undefined' ? window.location.href : 'https://ai.studio'} size={90} />
            </div>
            <p className="text-xs uppercase tracking-widest text-[var(--text-main)]/50 mt-3 text-center leading-relaxed">
              Scan untuk buka <br/>di HP
            </p>
          </div>
          
          {/* Drag handle for resizing */}
          {!isMobile && (
            <div 
              onMouseDown={startResizing}
              className={`absolute top-0 -right-[3px] w-[6px] h-full cursor-col-resize z-50 transition-colors ${isResizing ? 'bg-[var(--accent)]' : 'hover:bg-[var(--accent)]/50'}`}
            />
          )}
        </aside>

        {/* Main Content */}
        <main className="p-4 md:p-10 flex flex-col gap-4 md:gap-[30px] md:overflow-hidden min-h-0 flex-1">
          {activeView === 'inventory' ? (
            <>
              <div className="font-['Syne',sans-serif] text-2xl md:text-[2.5rem] leading-none shrink-0 flex items-center justify-between">
                DATABASE OVERVIEW
              </div>

              <div className="flex flex-col sm:flex-row gap-[10px] shrink-0 justify-between">
                <div className="flex flex-col sm:flex-row gap-[10px] shrink-0 flex-1">
                  <div className="flex-1 flex relative">
                    <input
                      type="text"
                      placeholder="QUERY_ID_OR_SKU..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (e.target.value === '') setAppliedQuery('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setAppliedQuery(searchQuery);
                          if (searchQuery.trim() !== '') {
                            addAuditLog('SEARCH', `Searched inventory for: ${searchQuery}`, { query: searchQuery });
                          }
                        }
                      }}
                      className="w-full bg-[var(--overlay-30)] border border-[var(--border-10)] p-3 pr-10 text-[var(--text-main)] outline-none placeholder:text-white/30 focus:border-[var(--accent)]/50 transition-colors"
                    />
                    <button 
                      onClick={() => setScanTarget('search')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-main)]/50 hover:text-[var(--accent)] transition-colors"
                      title="Scan Barcode"
                    >
                      <ScanLine className="w-4 h-4" />
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      setAppliedQuery(searchQuery);
                      if (searchQuery.trim() !== '') {
                        addAuditLog('SEARCH', `Searched inventory for: ${searchQuery}`, { query: searchQuery });
                      }
                    }}
                    className="bg-[var(--accent)] text-[var(--text-inverse)] font-bold py-3 sm:py-0 px-5 border-none cursor-pointer uppercase text-base hover:bg-white transition-colors"
                  >
                    EXECUTE
                  </button>
                </div>
                <button
                  onClick={handleExportInventoryCSV}
                  className="flex items-center justify-center gap-2 bg-[var(--bg-main)] border border-[var(--border-20)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors text-[var(--text-main)] p-[10px_15px] text-sm uppercase tracking-widest font-bold w-full sm:w-auto"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  EXPORT_CSV
                </button>
              </div>

              <div className="flex-1 overflow-auto min-h-0 md:pr-4">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center min-h-[200px]">
                    <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin mb-4" />
                    <p className="text-[var(--text-main)]/60 text-sm uppercase tracking-widest">EXECUTING_QUERY...</p>
                  </div>
                ) : error ? (
                  <div className="h-full flex flex-col items-center justify-center text-center min-h-[200px]">
                    <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
                    <h3 className="text-red-500 font-bold mb-2 uppercase">QUERY_FAILED</h3>
                    <p className="text-[var(--text-main)]/60 text-sm mb-6">{error}</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="bg-transparent border border-red-500 text-red-500 px-6 py-2.5 text-sm uppercase hover:bg-red-500 hover:text-black transition-colors"
                    >
                      RETRY_CONNECTION
                    </button>
                  </div>
                ) : (
                  <table className="w-full border-collapse text-left min-w-[600px]">
                    <thead className="sticky top-0 bg-[var(--bg-main)] z-10">
                      <tr>
                        <th className="text-xs uppercase opacity-50 p-[10px] border-b border-[var(--border-10)] w-[20%]">KODE</th>
                        <th className="text-xs uppercase opacity-50 p-[10px] border-b border-[var(--border-10)] w-[20%]">SKU ID</th>
                        <th className="text-xs uppercase opacity-50 p-[10px] border-b border-[var(--border-10)] w-[50%]">DESKRIPSI</th>
                        <th className="text-xs uppercase opacity-50 p-[10px] border-b border-[var(--border-10)] w-[10%] text-right">AKSI</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence initial={false}>
                      {filteredData.length > 0 ? (
                        filteredData.map((item, index) => {
                          const isEditing = editingItem === item.id && item.id;
                          return (
                          <motion.tr 
                            layout
                            key={item.id || item.kode + index}
                            initial={{ opacity: 0, y: -10, backgroundColor: 'rgba(0, 242, 255, 0.2)' }}
                            animate={{ opacity: 1, y: 0, backgroundColor: 'transparent' }}
                            exit={{ opacity: 0, scale: 0.9, backgroundColor: 'rgba(255, 50, 50, 0.2)' }}
                            transition={{ duration: 0.3, layout: { duration: 0.3 } }}
                          >
                            <td className="p-[15px_10px] text-base border-b border-white/5 text-[var(--accent)]">
                              {isEditing ? (
                                <input value={editKode} onChange={e => setEditKode(e.target.value)} className="bg-[var(--overlay-50)] border border-[var(--accent)]/30 p-2 w-full text-[var(--accent)] outline-none" />
                              ) : item.kode}
                            </td>
                            <td className="p-[15px_10px] text-base border-b border-white/5 text-[var(--text-main)]">
                              {isEditing ? (
                                <input value={editSku} onChange={e => setEditSku(e.target.value)} className="bg-[var(--overlay-50)] border border-[var(--border-30)] p-2 w-full text-white outline-none" />
                              ) : item.sku}
                            </td>
                            <td className="p-[15px_10px] text-base border-b border-white/5 text-[var(--text-main)]">
                              {isEditing ? (
                                <input value={editDeskripsi} onChange={e => setEditDeskripsi(e.target.value)} className="bg-[var(--overlay-50)] border border-[var(--border-30)] p-2 w-full text-white outline-none" />
                              ) : item.deskripsi}
                            </td>
                            <td className="p-[15px_10px] text-base border-b border-white/5 text-right align-middle">
                              {isEditing ? (
                                <div className="flex justify-end gap-3 items-center h-full">
                                  <button onClick={handleSaveEdit} className="text-[var(--accent)] hover:text-white transition-colors text-xs uppercase font-bold tracking-widest">Save</button>
                                  <button onClick={handleCancelEdit} className="text-[var(--text-main)]/50 hover:text-white transition-colors text-xs uppercase font-bold tracking-widest">Cancel</button>
                                </div>
                              ) : (
                                <div className="flex justify-end gap-3 items-center h-full">
                                  {item.id ? (
                                    <>
                                      <button onClick={() => handleEditClick(item)} className="text-[var(--text-main)]/50 hover:text-[var(--accent)] transition-colors" title="Edit Data"><Edit2 className="w-4 h-4" /></button>
                                      <button onClick={() => handleDelete(item.id)} className="text-[var(--text-main)]/50 hover:text-red-500 transition-colors" title="Hapus Data"><Trash2 className="w-4 h-4" /></button>
                                    </>
                                  ) : (
                                    <span className="text-[var(--text-main)]/20 text-xs uppercase tracking-widest" title="Sinkronisasi Google Sheets (Hanya Baca)">G-Sheets</span>
                                  )}
                                </div>
                              )}
                            </td>
                          </motion.tr>
                        )})
                      ) : (
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <td colSpan={4} className="p-[30px_10px] text-center border-b border-white/5">
                            <div className="flex flex-col items-center">
                              <Package className="w-8 h-8 text-[var(--text-main)]/20 mb-3" />
                              <p className="text-[var(--text-main)]/40 text-sm uppercase tracking-widest">NO_RECORDS_FOUND</p>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                      </AnimatePresence>
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : activeView === 'add' ? (
            <div className="flex-1 md:overflow-y-auto flex justify-center items-start pt-4 md:pt-10">
              <div className="w-full max-w-xl bg-[var(--overlay-20)] border border-[var(--border-10)] p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-['Syne'] text-[var(--accent)] mb-2 uppercase tracking-[-0.02em]">ADD_NEW_RECORD</h2>
                <p className="text-[var(--text-main)]/40 text-xs uppercase tracking-[0.2em] mb-8">
                  LOCAL_STORAGE_SYNC_ONLY
                </p>

                {addStatus.type && (
                  <div className={`mb-6 p-4 border text-sm uppercase tracking-wider ${
                    addStatus.type === 'success' 
                      ? 'bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)]' 
                      : 'bg-red-500/10 border-red-500/30 text-red-500'
                  }`}>
                    {addStatus.message}
                  </div>
                )}

                <form onSubmit={handleAddPart} className="space-y-5">
                  <div>
                    <label className="block text-xs text-[var(--text-main)]/50 uppercase tracking-[0.1em] mb-2">
                      KODE
                    </label>
                    <input
                      type="text"
                      value={newKode}
                      onChange={(e) => setNewKode(e.target.value)}
                      className="w-full bg-[var(--overlay-30)] border border-[var(--border-10)] p-3 text-[var(--text-main)] outline-none focus:border-[var(--accent)] transition-colors"
                      placeholder="ENTER KODE..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-[var(--text-main)]/50 uppercase tracking-[0.1em] mb-2">
                      HASH ID / SKU
                    </label>
                    <input
                      type="text"
                      value={newSku}
                      onChange={(e) => setNewSku(e.target.value)}
                      className="w-full bg-[var(--overlay-30)] border border-[var(--border-10)] p-3 text-[var(--text-main)] outline-none focus:border-[var(--accent)] transition-colors"
                      placeholder="ENTER HASH ID..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[var(--text-main)]/50 uppercase tracking-[0.1em] mb-2">
                      MAPPING / DESKRIPSI
                    </label>
                    <textarea
                      value={newDeskripsi}
                      onChange={(e) => setNewDeskripsi(e.target.value)}
                      rows={3}
                      className="w-full bg-[var(--overlay-30)] border border-[var(--border-10)] p-3 text-[var(--text-main)] outline-none focus:border-[var(--accent)] transition-colors resize-none"
                      placeholder="ENTER DESCRIPTION..."
                      required
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 bg-[var(--accent)] text-[var(--text-inverse)] px-6 py-4 font-bold uppercase hover:bg-opacity-80 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      INSERT_RECORD
                    </button>
                  </div>
                </form>

                {addHistory.length > 0 && (
                  <div className="mt-10 border-t border-[var(--border-10)] pt-6">
                    <h3 className="text-[var(--accent)] text-sm uppercase tracking-widest mb-4">RIWAYAT_PENAMBAHAN_SESI_INI</h3>
                    <div className="flex flex-col gap-3">
                      {addHistory.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center border border-[var(--border-05)] p-3 bg-[var(--overlay-30)] text-sm">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-[var(--accent)]">{item.kode}</span>
                            <span className="opacity-50 text-xs">{item.sku}</span>
                          </div>
                          <span className="opacity-40 text-xs">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : activeView === 'request' ? (
            <div className="flex-1 md:overflow-y-auto flex flex-col md:flex-row gap-6 md:gap-10 items-start">
              <div className="w-full md:w-2/3 bg-[var(--overlay-20)] border border-[var(--border-10)] p-6 md:p-8 shrink-0">
                <h2 className="text-xl md:text-2xl font-['Syne'] text-[var(--accent)] mb-2 uppercase tracking-[-0.02em]">PENGAJUAN_PART</h2>
                <p className="text-[var(--text-main)]/40 text-xs uppercase tracking-[0.2em] mb-6 md:mb-8">
                  SUBMIT_PART_REQUEST
                </p>

                {requestStatus.type && (
                  <div className={`mb-6 p-4 border text-sm uppercase tracking-wider ${
                    requestStatus.type === 'success' 
                      ? 'bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)]' 
                      : 'bg-red-500/10 border-red-500/30 text-red-500'
                  }`}>
                    {requestStatus.message}
                  </div>
                )}

                <form onSubmit={handleRequestPart} className="space-y-5">
                  <div>
                    <label className="block text-xs text-[var(--text-main)]/50 uppercase tracking-[0.1em] mb-2">
                      HASH ID / SKU
                    </label>
                    <input
                      type="text"
                      value={requestSku}
                      onChange={(e) => setRequestSku(e.target.value)}
                      className="w-full bg-[var(--overlay-30)] border border-[var(--border-10)] p-3 text-[var(--text-main)] outline-none focus:border-[var(--accent)] transition-colors"
                      placeholder="ENTER HASH ID..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[var(--text-main)]/50 uppercase tracking-[0.1em] mb-2">
                      MAPPING / DESKRIPSI
                    </label>
                    <input
                      type="text"
                      value={requestDeskripsi}
                      onChange={(e) => setRequestDeskripsi(e.target.value)}
                      className="w-full bg-[var(--overlay-30)] border border-[var(--border-10)] p-3 text-[var(--text-main)] outline-none focus:border-[var(--accent)] transition-colors"
                      placeholder="ENTER DESCRIPTION..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[var(--text-main)]/50 uppercase tracking-[0.1em] mb-2">
                      QUANTITY (QTY)
                    </label>
                    <input
                      type="number"
                      value={requestQty}
                      onChange={(e) => setRequestQty(e.target.value)}
                      min="1"
                      className="w-full bg-[var(--overlay-30)] border border-[var(--border-10)] p-3 text-[var(--text-main)] outline-none focus:border-[var(--accent)] transition-colors"
                      placeholder="ENTER QUANTITY..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[var(--text-main)]/50 uppercase tracking-[0.1em] mb-2">
                      ALASAN PENGAJUAN
                    </label>
                    <textarea
                      value={requestAlasan}
                      onChange={(e) => setRequestAlasan(e.target.value)}
                      rows={3}
                      className="w-full bg-[var(--overlay-30)] border border-[var(--border-10)] p-3 text-[var(--text-main)] outline-none focus:border-[var(--accent)] transition-colors resize-none"
                      placeholder="ENTER REASON..."
                      required
                    />
                  </div>

                  <div className="pt-4 flex flex-col gap-3">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 bg-[var(--accent)] text-[var(--text-inverse)] px-6 py-4 font-bold uppercase hover:bg-opacity-80 transition-colors"
                    >
                      {editingRequestIndex !== null ? 'UPDATE_REQUEST' : 'SUBMIT_REQUEST'}
                    </button>
                    {editingRequestIndex !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRequestIndex(null);
                          setRequestSku('');
                          setRequestDeskripsi('');
                          setRequestQty('');
                          setRequestAlasan('');
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-transparent border border-[var(--border-10)] text-[var(--text-main)] px-6 py-4 text-sm font-bold uppercase hover:bg-white/5 transition-colors"
                      >
                        BATAL_RUBAH
                      </button>
                    )}
                  </div>
                </form>
              </div>
              
              <div className="w-full md:w-1/3 flex flex-col h-[500px] md:h-[600px] shrink-0">
                <div className="bg-[var(--overlay-20)] border border-[var(--border-10)] p-4 md:p-6 mb-4">
                  <h2 className="text-base tracking-[0.1em] mb-2 uppercase opacity-50 text-sm">TOTAL_PENGAJUAN</h2>
                  <div className="text-3xl md:text-4xl font-['Syne'] text-[var(--accent)]">{requestHistory.length}</div>
                </div>

                <div className="bg-[var(--overlay-20)] border border-[var(--border-10)] p-4 md:p-6 flex-1 flex flex-col min-h-0 mb-4">
                  <p className="text-xs uppercase tracking-[0.2em] mb-4 border-b border-[var(--border-10)] pb-2 opacity-50">RIWAYAT_PENGAJUAN</p>
                  
                  <div className="flex-1 overflow-y-auto flex flex-col pr-2 gap-2">
                    {requestHistory.length > 0 ? (
                      <AnimatePresence initial={false}>
                      {requestHistory.map((req, idx) => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                          key={req.sku + idx} 
                          className={`p-4 border-b border-white/5 flex flex-col gap-2 transition-colors ${editingRequestIndex === idx ? 'bg-[var(--accent)]/5 border-l-2 border-l-[#00f2ff]' : ''}`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-sm text-[var(--accent)]">{req.sku}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-xs opacity-40">{req.date ? new Date(req.date).toLocaleDateString() : ''}</span>
                              <div className="flex gap-3 border-l border-white/10 pl-4">
                                <button 
                                  onClick={() => handleEditRequest(idx, req)}
                                  className="opacity-50 hover:opacity-100 hover:text-[var(--accent)] transition-colors" 
                                  title="Rubah"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteRequest(idx)}
                                  className="opacity-50 hover:opacity-100 hover:text-red-500 transition-colors" 
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="text-sm">{req.deskripsi}</div>
                          <div className="text-xs opacity-40 mt-1 uppercase">QTY: {req.qty} • {req.alasan}</div>
                        </motion.div>
                      ))}
                      </AnimatePresence>
                    ) : (
                      <div className="text-center py-8 opacity-30 text-xs uppercase tracking-widest border border-dashed border-white/10">
                        BELUM_ADA_PENGAJUAN
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="w-full flex items-center justify-center gap-2 bg-transparent border border-white/10 text-[var(--text-main)] px-4 py-3 text-xs uppercase hover:bg-white/5 transition-colors"
                  >
                    <FileText className="w-3 h-3 text-red-500" />
                    UNDUH PDF
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadExcel}
                    className="w-full flex items-center justify-center gap-2 bg-transparent border border-white/10 text-[var(--text-main)] px-4 py-3 text-xs uppercase hover:bg-white/5 transition-colors"
                  >
                    <FileSpreadsheet className="w-3 h-3 text-[var(--accent)]" />
                    UNDUH EXCEL
                  </button>
                </div>
              </div>
            </div>
          ) : activeView === 'settings' ? (
            <div className="flex-1 md:overflow-y-auto flex flex-col pt-4 md:pt-10">
              <h2 className="text-xl md:text-2xl font-['Syne'] text-[var(--accent)] mb-2 uppercase tracking-[-0.02em]">PENGATURAN</h2>
              <p className="text-[var(--text-main)]/40 text-xs uppercase tracking-[0.2em] mb-4">
                SYSTEM_PREFERENCES_AND_SECURITY
              </p>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-[var(--border-10)] mb-6 md:mb-8 pb-px">
                <button 
                  onClick={() => setSettingsTab('profile')}
                  className={`text-sm uppercase tracking-widest px-4 py-2 border-b-2 transition-all ${settingsTab === 'profile' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                  Profil & Keamanan
                </button>
                <button 
                  onClick={() => setSettingsTab('owner')}
                  className={`text-sm uppercase tracking-widest px-4 py-2 border-b-2 transition-all ${settingsTab === 'owner' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                  Owner Panel
                </button>
                <button 
                  onClick={() => setSettingsTab('audit')}
                  className={`text-sm uppercase tracking-widest px-4 py-2 border-b-2 transition-all ${settingsTab === 'audit' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                  Audit Log
                </button>
              </div>

              {settingsTab === 'profile' ? (
                <>
                  {settingsStatus && (
                    <div className={`p-4 mb-6 text-sm uppercase tracking-widest border ${settingsStatus.type === 'success' ? 'bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)]' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                      {settingsStatus.msg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                    {/* Profil Pemilik */}
                    <form onSubmit={handleSaveProfile} className="bg-[var(--overlay-20)] border border-[var(--border-10)] p-6 flex flex-col gap-6">
                      <div className="flex items-center gap-3 border-b border-[var(--border-10)] pb-4">
                        <UserCircle className="w-5 h-5 text-[var(--accent)]" />
                        <h3 className="text-base tracking-widest uppercase">Profil Sistem</h3>
                      </div>
                      
                      <div className="flex flex-col gap-4">
                        <div>
                          <label className="block text-xs uppercase text-[var(--text-main)]/60 mb-2 tracking-widest">Nama Aplikasi</label>
                          <input 
                            type="text" 
                            value={settingsApp}
                            onChange={(e) => setSettingsApp(e.target.value)}
                            required
                            className="w-full bg-[var(--overlay-30)] border border-[var(--border-10)] p-3 text-[var(--text-main)] outline-none focus:border-[var(--accent)]/50 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs uppercase text-[var(--text-main)]/60 mb-2 tracking-widest">Nama Pemilik / Admin</label>
                          <input 
                            type="text" 
                            value={settingsName}
                            onChange={(e) => setSettingsName(e.target.value)}
                            required
                            className="w-full bg-[var(--overlay-30)] border border-[var(--border-10)] p-3 text-[var(--text-main)] outline-none focus:border-[var(--accent)]/50 transition-colors"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="mt-auto bg-[var(--bg-main)] hover:bg-[var(--accent)] hover:text-black text-[var(--text-main)] border border-[var(--border-20)] hover:border-[var(--accent)] px-4 py-3 text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        SIMPAN PROFIL
                      </button>
                    </form>

                    {/* Keamanan */}
                    <div className="bg-[var(--overlay-20)] border border-[var(--border-10)] p-6 flex flex-col gap-6">
                      <div className="flex items-center gap-3 border-b border-[var(--border-10)] pb-4">
                        <Key className="w-5 h-5 text-yellow-500" />
                        <h3 className="text-base tracking-widest uppercase">Keamanan Akun</h3>
                      </div>
                      
                      <div className="flex flex-col gap-4">
                        <div>
                          <label className="block text-xs uppercase text-[var(--text-main)]/60 mb-2 tracking-widest">Email Terdaftar</label>
                          <div className="w-full bg-[var(--overlay-50)] border border-[var(--border-05)] p-3 text-[var(--text-main)]/60 text-base opacity-70 cursor-not-allowed">
                            {auth.currentUser?.email || 'Tidak ada sesi aktif'}
                          </div>
                          <p className="text-xs text-[var(--text-main)]/40 mt-2 uppercase">Email terhubung dengan Google Auth.</p>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 flex flex-col gap-2 border-t border-[var(--border-10)]">
                        <p className="text-xs text-[var(--text-main)]/60 leading-relaxed">
                          Sistem akan mengirimkan tautan penyetelan ulang sandi (Password Reset) ke alamat email Anda. Ikuti instruksi di email tersebut untuk mengubah sandi.
                        </p>
                        <button 
                          onClick={handleResetPassword}
                          type="button"
                          className="bg-[var(--bg-main)] hover:bg-yellow-500 hover:text-black text-yellow-500 border border-yellow-500/30 px-4 py-3 text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-2"
                        >
                          KIRIM LINK UBAH PASSWORD
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : settingsTab === 'audit' ? (
                <>
                  <div className="w-full bg-[var(--overlay-20)] border border-[var(--border-10)] p-4 overflow-auto">
                    {auditLogs.length > 0 ? (
                      <table className="w-full border-collapse text-left min-w-[600px]">
                        <thead className="sticky top-0 bg-[var(--bg-main)] z-10">
                          <tr>
                            <th className="text-xs uppercase opacity-50 p-[10px] border-b border-[var(--border-10)]">WAKTU</th>
                            <th className="text-xs uppercase opacity-50 p-[10px] border-b border-[var(--border-10)]">USER</th>
                            <th className="text-xs uppercase opacity-50 p-[10px] border-b border-[var(--border-10)]">AKSI</th>
                            <th className="text-xs uppercase opacity-50 p-[10px] border-b border-[var(--border-10)]">DETAIL</th>
                          </tr>
                        </thead>
                        <tbody>
                          <AnimatePresence initial={false}>
                            {auditLogs.map((log) => (
                              <motion.tr 
                                key={log.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="border-b border-white/5"
                              >
                                <td className="p-[10px] text-sm text-[var(--text-main)]/60 whitespace-nowrap">
                                  {new Date(log.timestamp).toLocaleString('id-ID')}
                                </td>
                                <td className="p-[10px] text-sm text-[var(--accent)]">
                                  {log.user}
                                </td>
                                <td className="p-[10px]">
                                  <span className={`text-xs uppercase tracking-widest px-2 py-1 ${
                                    log.action === 'ADD' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                    log.action === 'EDIT' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                                    log.action === 'DELETE' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                    log.action === 'LOGIN' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                    log.action === 'LOGIN_FAILED' ? 'bg-red-500/20 text-red-500 border border-red-500/40' :
                                    log.action === 'SEARCH' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                    'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                  }`}>
                                    {log.action}
                                  </span>
                                </td>
                                <td className="p-[10px] text-sm text-[var(--text-main)]">
                                  {log.details}
                                </td>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    ) : (
                      <div className="flex flex-col items-center py-10">
                        <FileText className="w-8 h-8 text-[var(--text-main)]/20 mb-3" />
                        <p className="text-[var(--text-main)]/40 text-sm uppercase tracking-widest">NO_LOGS_FOUND</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex justify-center items-start">
                  <div className="w-full max-w-4xl bg-[var(--overlay-20)] border border-[var(--border-10)] p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-['Syne'] text-[var(--accent)] mb-2 uppercase tracking-[-0.02em]">OWNER_CONTROL_PANEL</h2>
                    <p className="text-[var(--text-main)]/40 text-xs uppercase tracking-[0.2em] mb-8 border-b border-[var(--border-10)] pb-4">
                      SYSTEM_ADMINISTRATOR_ACCESS
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border border-[var(--border-10)] p-6 bg-[var(--overlay-30)]">
                        <h3 className="text-[var(--accent)] text-sm uppercase tracking-widest mb-4">SYSTEM_STATUS</h3>
                        <div className="flex flex-col gap-3 text-sm opacity-70">
                          <div className="flex justify-between border-b border-white/5 pb-2"><span>UPTIME</span><span className="text-[var(--accent)]">99.9%</span></div>
                          <div className="flex justify-between border-b border-white/5 pb-2"><span>DATABASE</span><span className="text-[var(--accent)]">CONNECTED</span></div>
                          <div className="flex justify-between"><span>ENCRYPTION</span><span className="text-[var(--accent)]">ACTIVE</span></div>
                        </div>
                      </div>
                      <div className="border border-[var(--border-10)] p-6 bg-[var(--overlay-30)] flex flex-col">
                        <h3 className="text-[var(--accent)] text-sm uppercase tracking-widest mb-4">ACTIVE_SESSIONS</h3>
                        <div className="flex flex-col gap-3 text-xs overflow-y-auto max-h-[200px] pr-2 hide-scrollbar">
                          {activeSessions.length > 0 ? (
                            activeSessions.map((session, idx) => (
                              <div key={idx} className="flex flex-col gap-1 border-b border-white/5 pb-2">
                                <div className="flex justify-between font-bold text-[var(--accent)]">
                                  <span>{session.device}</span>
                                  <span>{session.timestamp ? new Date(session.timestamp).toLocaleTimeString('id-ID') : 'UNKNOWN_TIME'}</span>
                                </div>
                                <div className="opacity-50">{session.email || 'mohamadrizkiheriyana1@gmail.com'}</div>
                                <div className="opacity-30">ID: {session.sessionId}</div>
                              </div>
                            ))
                          ) : (
                            <div className="opacity-50">NO_ACTIVE_SESSIONS_FOUND...</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
</main>
        {/* Footer */}
        <footer className="shrink-0 col-span-full border-t border-[var(--border-10)] flex items-center justify-between px-4 md:px-10 py-3 md:py-0 text-xs opacity-50">
          <div>SYSTEM BUILD V2.4.0</div>
          <div>STATUS: OK</div>
        </footer>
      </div>
    </div>
  );
}