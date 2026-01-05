import React, { useState } from 'react';
import FileUploader from './components/FileUploader';
import DataTable from './components/DataTable';
import SMSPanel from './components/SMSPanel';
import { QrCode, Trash2, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { saveToSheet } from './utils/googleSheets';

function App() {
  const [data, setData] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleDataLoaded = (newData) => {
    setData(newData);
  };

  const clearData = () => {
    if (confirm("모든 데이터를 초기화하시겠습니까?")) {
      setData([]);
    }
  };

  const handleSaveToSheet = async () => {
    if (!confirm("Google Sheet에 현재 데이터를 저장하시겠습니까?")) return;

    setSaving(true);
    try {
      await saveToSheet(data);
      alert("데이터 전송이 완료되었습니다.\n(참고: Google Apps Script 특성상 성공 여부를 즉시 확인할 수 없을 수 있습니다)");
    } catch (error) {
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="container" style={{ paddingTop: '3rem' }}>
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex-center mb-4">
            <div className="icon-box">
              <QrCode size={48} color="white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-gradient">
            자동 체크인 QR 생성기
          </h1>
          <p className="text-muted text-lg" style={{ maxWidth: '600px', margin: '0 auto' }}>
            참석자 명단을 업로드하여 QR코드를 일괄 생성하고, <br />
            안내 문자와 함께 즉시 발송하세요.
          </p>
        </motion.header>

        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <FileUploader onDataLoaded={handleDataLoaded} />

          {data.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex-between mt-12 mb-4">
                <h2 className="text-2xl font-bold">작업 공간</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveToSheet}
                    disabled={saving}
                    className="btn-secondary"
                    style={{ color: '#4ade80', borderColor: '#4ade80' }}
                  >
                    <Database size={16} />
                    {saving ? '저장 중...' : 'DB 저장'}
                  </button>
                  <button
                    onClick={clearData}
                    className="btn-danger"
                  >
                    <Trash2 size={16} />
                    초기화
                  </button>
                </div>
              </div>

              <SMSPanel data={data} />
              <DataTable data={data} />
            </motion.div>
          )}
        </div>

        <footer className="mt-12 text-center text-muted text-sm">
          <p>© 2026 QR Check-in Generator. Designed for Premium Experience.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
