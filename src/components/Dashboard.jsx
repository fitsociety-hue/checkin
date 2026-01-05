import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
    Users, QrCode as QrIcon, UserPlus, CheckCircle, XCircle, Search,
    RotateCcw, ShieldCheck, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PASSWORD = '1107';

const Dashboard = ({ data, onCheckIn, onCancelCheckIn, onAddMember }) => {
    const [activeTab, setActiveTab] = useState('list'); // 'list', 'scan'
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newMember, setNewMember] = useState({ name: '', affiliation: '', phone: '', vehicle: '' });

    // Scanning State
    const [scanResult, setScanResult] = useState(null);
    const [scanError, setScanError] = useState(null);
    const [lastScanned, setLastScanned] = useState(null);

    // Stats
    const total = data.length;
    const checkedIn = data.filter(u => u.checkedIn).length;
    const notCheckedIn = total - checkedIn;

    // Handlers
    const handleVerifyPassword = (action) => {
        const input = prompt("관리자 비밀번호를 입력하세요:");
        if (input === PASSWORD) {
            action();
        } else {
            alert("비밀번호가 올바르지 않습니다.");
        }
    };

    const handleManualCheckIn = (user) => {
        handleVerifyPassword(() => {
            onCheckIn(user.id || user.phone); // Use phone unique or generated ID
            alert(`${user.name} 님 체크인 처리되었습니다.`);
        });
    };

    const handleCancelCheckIn = (user) => {
        handleVerifyPassword(() => {
            onCancelCheckIn(user.id || user.phone);
            alert(`${user.name} 님 체크인 취소되었습니다.`);
        });
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        if (!newMember.name || !newMember.phone) {
            alert("이름과 전화번호는 필수입니다.");
            return;
        }
        onAddMember({ ...newMember, raw: newMember });
        setShowAddModal(false);
        setNewMember({ name: '', affiliation: '', phone: '', vehicle: '' });
        alert("명단이 추가되었습니다.");
    };

    const handleScan = (detectedCodes) => {
        if (detectedCodes && detectedCodes.length > 0) {
            const rawValue = detectedCodes[0].rawValue;
            if (rawValue === lastScanned) return; // Prevent double scan of same code immediately

            try {
                const parsed = JSON.parse(rawValue);
                // Find user by unique identifier (Phone is best guess here)
                const user = data.find(u => u.phone === parsed.phone && u.name === parsed.name);

                if (user) {
                    if (user.checkedIn) {
                        setScanResult({ type: 'warning', msg: '이미 체크인된 사용자입니다.', user });
                    } else {
                        onCheckIn(user.phone);
                        setScanResult({ type: 'success', msg: '체크인 완료!', user });
                    }
                } else {
                    setScanResult({ type: 'error', msg: '명단에 없는 사용자입니다.', raw: parsed });
                }
                setLastScanned(rawValue);

                // Clear result after 3 seconds
                setTimeout(() => {
                    setScanResult(null);
                    setLastScanned(null);
                }, 3000);

            } catch (e) {
                console.error(e);
                setScanResult({ type: 'error', msg: '유효하지 않은 QR 코드입니다.' });
            }
        }
    };

    // Filtered List
    const filteredData = data.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm) ||
        user.affiliation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="glass-panel p-4 text-center">
                    <h4 className="text-muted text-sm mb-1">전체 대상</h4>
                    <span className="text-2xl font-bold">{total}</span>
                </div>
                <div className="glass-panel p-4 text-center border-green-500/30">
                    <h4 className="text-muted text-sm mb-1 text-green-400">체크인</h4>
                    <span className="text-2xl font-bold text-green-400">{checkedIn}</span>
                </div>
                <div className="glass-panel p-4 text-center">
                    <h4 className="text-muted text-sm mb-1">미참석</h4>
                    <span className="text-2xl font-bold">{notCheckedIn}</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-[var(--color-glass-border)] pb-2">
                <button
                    onClick={() => setActiveTab('list')}
                    className={`pb-2 px-4 font-bold transition-colors ${activeTab === 'list' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-muted'}`}
                >
                    <Users size={18} className="inline mr-2" />
                    명단 관리
                </button>
                <button
                    onClick={() => setActiveTab('scan')}
                    className={`pb-2 px-4 font-bold transition-colors ${activeTab === 'scan' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-muted'}`}
                >
                    <QrIcon size={18} className="inline mr-2" />
                    QR 스캔 (자동 체크인)
                </button>
            </div>

            {/* Tab: Scan */}
            {activeTab === 'scan' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
                    <div className="glass-panel overflow-hidden relative aspect-square bg-black rounded-2xl mb-4">
                        <Scanner
                            onScan={handleScan}
                            onError={(err) => console.log(err)}
                            components={{ audio: false, torch: true }}
                            styles={{ container: { width: '100%', height: '100%' } }}
                        />
                        <div className="absolute inset-0 border-2 border-[var(--color-primary)] opacity-50 pointer-events-none" style={{ margin: '15%' }} />

                        {/* Result Overlay */}
                        <AnimatePresence>
                            {scanResult && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 text-center z-10"
                                >
                                    <div>
                                        {scanResult.type === 'success' && <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />}
                                        {scanResult.type === 'warning' && <AlertTriangle size={64} className="text-yellow-500 mx-auto mb-4" />}
                                        {scanResult.type === 'error' && <XCircle size={64} className="text-red-500 mx-auto mb-4" />}

                                        <h3 className="text-2xl font-bold mb-2">
                                            {scanResult.user ? scanResult.user.name : '알 수 없음'}
                                        </h3>
                                        <p className={`text-lg font-bold ${scanResult.type === 'success' ? 'text-green-400' :
                                                scanResult.type === 'warning' ? 'text-yellow-400' : 'text-red-400'
                                            }`}>
                                            {scanResult.msg}
                                        </p>
                                        {scanResult.user && (
                                            <p className="text-muted mt-2">{scanResult.user.affiliation} | {scanResult.user.phone}</p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <p className="text-center text-muted text-sm">
                        카메라에 QR코드를 비추면 자동으로 체크인됩니다.
                    </p>
                </motion.div>
            )}

            {/* Tab: List */}
            {activeTab === 'list' && (
                <div className="space-y-4">
                    <div className="flex justify-between gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                            <input
                                type="text"
                                placeholder="이름, 소속, 전화번호 검색"
                                className="glass-input pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="btn-primary whitespace-nowrap"
                        >
                            <UserPlus size={18} />
                            명단 추가
                        </button>
                    </div>

                    <div className="glass-panel overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>상태</th>
                                        <th>이름</th>
                                        <th>소속</th>
                                        <th>전화번호</th>
                                        <th>관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((user, idx) => (
                                        <tr key={user.phone || idx} className={user.checkedIn ? 'bg-[var(--color-primary)]/10' : ''}>
                                            <td>
                                                {user.checkedIn ? (
                                                    <span className="inline-flex items-center gap-1 text-green-400 text-sm font-bold">
                                                        <CheckCircle size={14} /> 참석
                                                    </span>
                                                ) : (
                                                    <span className="text-muted text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="font-bold">{user.name}</td>
                                            <td>{user.affiliation}</td>
                                            <td>{user.phone}</td>
                                            <td>
                                                {user.checkedIn ? (
                                                    <button
                                                        onClick={() => handleCancelCheckIn(user)}
                                                        className="btn-danger text-xs py-1 px-3 bg-red-500/10 hover:bg-red-500/20"
                                                    >
                                                        <RotateCcw size={14} /> 취소
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleManualCheckIn(user)}
                                                        className="btn-secondary text-xs py-1 px-3 text-green-400 border-green-500/30 hover:bg-green-500/10"
                                                    >
                                                        <ShieldCheck size={14} /> 수동 체크인
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredData.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center text-muted py-8">
                                                검색 결과가 없습니다.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Member Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-panel w-full max-w-md p-6 bg-[#1e293b]"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">참석자 개별 추가</h3>
                            <button onClick={() => setShowAddModal(false)}><XCircle className="text-muted hover:text-white" /></button>
                        </div>
                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-muted mb-1">이름 *</label>
                                <input type="text" className="glass-input" required
                                    value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm text-muted mb-1">소속</label>
                                <input type="text" className="glass-input"
                                    value={newMember.affiliation} onChange={e => setNewMember({ ...newMember, affiliation: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm text-muted mb-1">전화번호 *</label>
                                <input type="tel" className="glass-input" required placeholder="010-0000-0000"
                                    value={newMember.phone} onChange={e => setNewMember({ ...newMember, phone: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm text-muted mb-1">차량번호</label>
                                <input type="text" className="glass-input"
                                    value={newMember.vehicle} onChange={e => setNewMember({ ...newMember, vehicle: e.target.value })} />
                            </div>
                            <div className="pt-4 flex justify-end gap-2">
                                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">취소</button>
                                <button type="submit" className="btn-primary">추가하기</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default Dashboard;
