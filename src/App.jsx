import React, { useState, useEffect } from 'react';
import FileUploader from './components/FileUploader';
import DataTable from './components/DataTable';
import SMSPanel from './components/SMSPanel';
import Dashboard from './components/Dashboard';
import SessionManager from './components/SessionManager';
import { QrCode, Trash2, Database, LayoutDashboard, Send, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveToSheet } from './utils/googleSheets';

function App() {
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('qr_checkin_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    return localStorage.getItem('qr_checkin_active_session') || null;
  });

  const [mode, setMode] = useState('dashboard'); // 'dashboard' | 'generator'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize Default Session if none
  useEffect(() => {
    if (sessions.length === 0) {
      // Optional: could create default here, but let user create.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('qr_checkin_sessions', JSON.stringify(sessions));
    if (activeSessionId) localStorage.setItem('qr_checkin_active_session', activeSessionId);
  }, [sessions, activeSessionId]);

  // Derived Active Data
  const activeSession = sessions.find(s => s.id === activeSessionId) || null;
  const data = activeSession ? activeSession.participants : [];

  // Actions
  const createSession = (name) => {
    const newSession = {
      id: Date.now().toString(),
      name,
      createdAt: new Date().toISOString(),
      participants: []
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const deleteSession = (id) => {
    if (!confirm('정말 이 행사를 삭제하시겠습니까?\n모든 데이터가 사라집니다.')) return;
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) setActiveSessionId(null);
  };

  const updateActiveSessionData = (newParticipants) => {
    if (!activeSessionId) return;
    setSessions(prev => prev.map(s =>
      s.id === activeSessionId ? { ...s, participants: newParticipants } : s
    ));
  };

  const handleDataLoaded = (newData) => {
    if (!activeSessionId) {
      alert("먼저 행사를 만들거나 선택해주세요.");
      return;
    }

    // Check duplicates within THIS session
    const currentPhones = new Set(data.map(u => u.phone));
    const uniqueNew = newData.filter(u => !currentPhones.has(u.phone));

    if (uniqueNew.length === 0) {
      alert("모든 데이터가 이미 존재합니다.");
      return;
    }

    if (data.length > 0) {
      if (confirm(`기존 ${data.length}명에 ${uniqueNew.length}명을 추가하시겠습니까?`)) {
        updateActiveSessionData([...data, ...uniqueNew]);
        alert(`${uniqueNew.length}명이 추가되었습니다.`);
      }
    } else {
      updateActiveSessionData(uniqueNew);
    }
  };

  const clearData = () => {
    if (!activeSessionId) return;
    if (confirm("현재 행사의 모든 참가자 명단을 초기화하시겠습니까?")) {
      updateActiveSessionData([]);
    }
  };

  const handleSaveToSheet = async () => {
    if (!confirm("Google Sheet에 현재 데이터를 저장하시겠습니까? (체크인 상태 포함)")) return;

    // Note: We are saving only the ACTIVE session data to the sheet for now.
    // If the user wants to save ALL sessions, the backend/script logic would need to change.
    // Assuming 1:1 mapping for simplicity given the GAS script structure.

    setSaving(true);
    try {
      await saveToSheet(data);
      alert("데이터 전송이 완료되었습니다.");
    } catch (error) {
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // CheckIn/Out Handlers for Dashboard
  const handleCheckIn = (phone) => {
    const updated = data.map(u => u.phone === phone ? { ...u, checkedIn: true, checkedInAt: new Date().toISOString() } : u);
    updateActiveSessionData(updated);
  };

  const handleCancelCheckIn = (phone) => {
    const updated = data.map(u => u.phone === phone ? { ...u, checkedIn: false, checkedInAt: null } : u);
    updateActiveSessionData(updated);
  };

  const handleAddMember = (member) => {
    if (data.find(u => u.phone === member.phone)) {
      alert("이미 등록된 번호입니다.");
      return;
    }
    updateActiveSessionData([...data, { ...member, checkedIn: false }]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-lg text-indigo-600">
          <QrCode /> QR Check-in
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar (Desktop) / Drawer (Mobile) */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-gray-100 shadow-xl md:shadow-none transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out md:static md:block overflow-y-auto`}
      >
        <div className="p-6">
          <div className="hidden md:flex items-center gap-2 font-bold text-xl text-indigo-600 mb-8">
            <div className="p-2 bg-indigo-50 rounded-lg"><QrCode size={24} /></div>
            QR Check-in
          </div>

          <SessionManager
            sessions={sessions}
            activeSessionId={activeSessionId}
            onCreateSession={createSession}
            onSelectSession={(id) => { setActiveSessionId(id); setMobileMenuOpen(false); }}
            onDeleteSession={deleteSession}
          />

          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-4 font-bold uppercase tracking-wider">WORKSPACE</p>
            <nav className="space-y-1">
              <button
                onClick={() => { setMode('dashboard'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${mode === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <LayoutDashboard size={18} />
                체크인 대시보드
              </button>
              <button
                onClick={() => { setMode('generator'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${mode === 'generator' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Send size={18} />
                명단 관리 및 발송
              </button>
            </nav>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-5xl mx-auto">
          {!activeSession ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-400">
                <LayoutDashboard size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">행사를 선택하거나 새로 만드세요</h2>
              <p className="text-gray-500 max-w-md">
                왼쪽 사이드바에서 '새 행사 만들기'를 클릭하여
                QR 체크인을 시작할 행사를 생성하세요.
              </p>
            </div>
          ) : (
            <motion.div
              key={activeSessionId + mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Header Strip */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{activeSession.name}</h1>
                  <p className="text-gray-500 text-sm mt-1">
                    {mode === 'dashboard' ? '실시간 체크인 현황 및 스캔' : '참석자 명단 관리 및 안내 문자 발송'}
                  </p>
                </div>
                {data.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveToSheet}
                      disabled={saving}
                      className="btn-secondary text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <Database size={16} />
                      {saving ? '저장 중...' : 'DB 동기화'}
                    </button>
                    <button className="btn-secondary text-xs" onClick={clearData}>
                      <Trash2 size={14} /> 목록 초기화
                    </button>
                  </div>
                )}
              </div>

              {mode === 'generator' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <FileUploader onDataLoaded={handleDataLoaded} />
                  {data.length > 0 && (
                    <>
                      <SMSPanel data={data} />
                      <DataTable data={data} onDelete={(phone) => {
                        updateActiveSessionData(data.filter(u => u.phone !== phone));
                      }} />
                    </>
                  )}
                </div>
              )}

              {mode === 'dashboard' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <Dashboard
                    data={data}
                    onCheckIn={handleCheckIn}
                    onCancelCheckIn={handleCancelCheckIn}
                    onAddMember={handleAddMember}
                  />
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
