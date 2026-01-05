import React, { useState, useEffect } from 'react';
import FileUploader from './components/FileUploader';
import DataTable from './components/DataTable';
import SMSPanel from './components/SMSPanel';
import Dashboard from './components/Dashboard';
import { QrCode, Trash2, Database, LayoutDashboard, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveToSheet } from './utils/googleSheets';

function App() {
  const [mode, setMode] = useState('generator'); // 'generator' | 'dashboard'
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('qr_checkin_data');
    return saved ? JSON.parse(saved) : [];
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    localStorage.setItem('qr_checkin_data', JSON.stringify(data));
  }, [data]);

  const handleDataLoaded = (newData) => {
    // Merge or Replace? Let's append new ones unique by phone
    // or just replace for simplicity as per common use case "Upload List"
    // To be safe, if data exists, confirm.
    if (data.length > 0) {
      if (confirm("기존 명단을 삭제하고 새로 업로드하시겠습니까? (취소 시 기존 명단 유지)")) {
        setData(newData);
      } else {
        // Append unique
        const currentPhones = new Set(data.map(u => u.phone));
        const uniqueNew = newData.filter(u => !currentPhones.has(u.phone));
        setData([...data, ...uniqueNew]);
        alert(`${uniqueNew.length}명이 추가되었습니다.`);
      }
    } else {
      setData(newData);
    }
  };

  const clearData = () => {
    if (confirm("모든 데이터를 초기화하시겠습니까?")) {
      setData([]);
    }
  };

  const handleSaveToSheet = async () => {
    if (!confirm("Google Sheet에 현재 데이터를 저장하시겠습니까? (체크인 상태 포함)")) return;

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

  const handleCheckIn = (phone) => {
    setData(prev => prev.map(u => u.phone === phone ? { ...u, checkedIn: true, checkedInAt: new Date().toISOString() } : u));
  };

  const handleCancelCheckIn = (phone) => {
    setData(prev => prev.map(u => u.phone === phone ? { ...u, checkedIn: false, checkedInAt: null } : u));
  };

  const handleAddMember = (newMember) => {
    if (data.find(u => u.phone === newMember.phone)) {
      alert("이미 등록된 전화번호입니다.");
      return;
    }
    setData(prev => [...prev, { ...newMember, checkedIn: false }]);
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="container" style={{ paddingTop: '2rem' }}>
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="icon-box p-3 rounded-xl border border-gray-100 shadow-sm">
                <QrCode size={24} className="text-indigo-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {mode === 'generator' ? 'QR 생성 및 발송' : '관리자 대시보드'}
              </h1>
            </div>

            {/* Mode Switcher */}
            <div className="bg-white border border-gray-200 p-1 rounded-lg flex gap-1 shadow-sm">
              <button
                onClick={() => setMode('generator')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'generator' ? 'bg-[var(--color-primary)] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <Send size={16} className="inline mr-2" />
                발송 모드
              </button>
              <button
                onClick={() => setMode('dashboard')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'dashboard' ? 'bg-[var(--color-primary)] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <LayoutDashboard size={16} className="inline mr-2" />
                체크인 관리
              </button>
            </div>
          </div>

          <p className="text-muted" style={{ marginLeft: '3.5rem' }}>
            {mode === 'generator'
              ? '참석자 명단을 업로드하고 안내 문자를 발송합니다.'
              : '실시간 QR 체크인 및 명단 관리를 수행합니다.'}
          </p>
        </header>

        {/* Global Toolbar */}
        {data.length > 0 && (
          <div className="flex justify-end gap-2 mb-6">
            <button
              onClick={handleSaveToSheet}
              disabled={saving}
              className="btn-secondary text-green-400 border-green-500/30 hover:bg-green-500/10"
            >
              <Database size={16} />
              {saving ? '저장 중...' : 'DB 동기화'}
            </button>
            <button onClick={clearData} className="btn-danger">
              <Trash2 size={16} /> 초기화
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {mode === 'generator' ? (
            <motion.div
              key="generator"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              <FileUploader onDataLoaded={handleDataLoaded} />
              {data.length > 0 && (
                <>
                  <SMSPanel data={data} />
                  <DataTable data={data} />
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Dashboard
                data={data}
                onCheckIn={handleCheckIn}
                onCancelCheckIn={handleCancelCheckIn}
                onAddMember={handleAddMember}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-12 text-center text-muted text-sm border-t border-gray-200 pt-8">
          <p>© 2026 QR Check-in System. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
