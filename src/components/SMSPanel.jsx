import React, { useState } from 'react';
import { Send, Settings, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';
import { sendSMS, uploadImage } from '../utils/solapi';
import { motion } from 'framer-motion';

const SMSPanel = ({ data }) => {
    const [apiKey, setApiKey] = useState('NCSPEYYLIEV2MF1Y');
    const [apiSecret, setApiSecret] = useState('');
    const [senderNumber, setSenderNumber] = useState('07042151664');
    const [message, setMessage] = useState('안녕하세요. 강동어울림복지관입니다.\nQR코드로 빠른 참석자 체크인이 가능합니다.\n담당: 전략기획팀장 김용필\n전화: 070-4215-1664');

    const [sending, setSending] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, fail: 0 });
    const [logs, setLogs] = useState([]);
    const [showSettings, setShowSettings] = useState(false);

    const addLog = (msg, type = 'info') => {
        setLogs(prev => [{ msg, type, time: new Date().toLocaleTimeString() }, ...prev]);
    };

    const handleSend = async () => {
        if (!data || data.length === 0) {
            alert("데이터를 먼저 업로드해주세요.");
            return;
        }
        if (!apiSecret) {
            alert("Solapi Secret Key를 입력해주세요 (설정 버튼).");
            setShowSettings(true);
            return;
        }

        if (!confirm(`${data.length}명에게 QR코드를 발송하시겠습니까?\nMMS 비용이 발생할 수 있습니다.`)) return;

        setSending(true);
        setProgress({ current: 0, total: data.length, success: 0, fail: 0 });
        setLogs([]);

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            try {
                const qrDataUrl = await QRCode.toDataURL(JSON.stringify(item), { width: 300, margin: 2 });

                let imageId = null;
                try {
                    imageId = await uploadImage(apiKey, apiSecret, qrDataUrl);
                    addLog(`${item.name}: QR 이미지 업로드 성공`, 'success');
                } catch (err) {
                    console.error(err);
                    addLog(`${item.name}: QR 이미지 업로드 실패 - ${err.message}`, 'error');
                    throw new Error("Image Upload Failed");
                }

                await sendSMS(apiKey, apiSecret, senderNumber, item.phone, message, imageId);

                addLog(`${item.name} (${item.phone}): 발송 성공`, 'success');
                setProgress(prev => ({ ...prev, current: i + 1, success: prev.success + 1 }));

            } catch (error) {
                console.error(error);
                addLog(`${item.name}: 발송 실패 - ${error.message || error}`, 'error');
                setProgress(prev => ({ ...prev, current: i + 1, fail: prev.fail + 1 }));
            }

            await new Promise(r => setTimeout(r, 200));
        }

        setSending(false);
        alert("발송 작업이 완료되었습니다.");
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
        >
            {/* Control Bar */}
            <div className="glass-panel p-6 mb-6">
                <div className="flex-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Send size={20} />
                        문자 발송 설정
                    </h3>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="btn-secondary"
                    >
                        <Settings size={16} />
                        API 설정
                    </button>
                </div>

                {/* API Settings */}
                {showSettings && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mb-6 p-4 rounded-lg"
                        style={{ background: 'rgba(0,0,0,0.2)' }}
                    >
                        <div className="grid-cols-2">
                            <div>
                                <label className="block text-xs text-muted mb-1">Solapi API Key</label>
                                <input
                                    type="text"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className="glass-input"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-muted mb-1">Solapi API Secret</label>
                                <input
                                    type="password"
                                    value={apiSecret}
                                    onChange={(e) => setApiSecret(e.target.value)}
                                    className="glass-input"
                                    placeholder="Secret Key를 입력하세요"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="grid-cols-3 gap-6">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-muted">발신번호 (Sender)</label>
                            <input
                                type="text"
                                value={senderNumber}
                                onChange={(e) => setSenderNumber(e.target.value)}
                                className="glass-input"
                                placeholder="- 없이 입력 (예: 0212345678)"
                            />
                        </div>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label className="block text-sm font-medium mb-2 text-muted">문자 내용 (Message)</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="glass-input"
                            style={{ height: '8rem', resize: 'none' }}
                            placeholder="전송할 메시지를 입력하세요"
                        />
                    </div>
                </div>

                <div className="mt-6 flex-center" style={{ justifyContent: 'flex-end' }}>
                    <button
                        onClick={handleSend}
                        disabled={sending}
                        className="btn-primary"
                    >
                        {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                        {sending ? '발송 중...' : 'QR코드 문자 발송하기'}
                    </button>
                </div>
            </div>

            {/* Progress & Logs */}
            {(sending || logs.length > 0) && (
                <div className="glass-panel p-6">
                    <div className="flex-between mb-4">
                        <h4 className="font-bold">발송 현황</h4>
                        <div className="text-sm">
                            <span className="text-green mr-3">성공: {progress.success}</span>
                            <span className="text-red">실패: {progress.fail}</span>
                            <span className="ml-3 text-muted">({progress.current}/{progress.total})</span>
                        </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="progress-track mb-4">
                        <div
                            className="progress-fill"
                            style={{ width: `${(progress.current / (progress.total || 1)) * 100}%` }}
                        />
                    </div>

                    <div className="log-container space-y-2">
                        {logs.map((log, idx) => (
                            <div key={idx} className={`flex items-start gap-2 ${log.type === 'error' ? 'text-red' : 'text-green'}`}>
                                <span className="text-muted shrink-0">[{log.time}]</span>
                                <span>{log.msg}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default SMSPanel;
