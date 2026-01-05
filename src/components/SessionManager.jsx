import React, { useState, useEffect } from 'react';
import {
    Plus, Calendar, Trash2, ArrowRight, UserCheck,
    Settings, Users, ChevronRight, LayoutDashboard, QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SessionManager = ({ sessions, onCreateSession, onDeleteSession, onSelectSession, activeSessionId }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [newSessionName, setNewSessionName] = useState('');

    const handleCreate = (e) => {
        e.preventDefault();
        if (!newSessionName.trim()) return;
        onCreateSession(newSessionName);
        setNewSessionName('');
        setIsCreating(false);
    };

    return (
        <div className="glass-panel p-6 mb-8 h-fit">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                    <Calendar size={20} className="text-indigo-600" />
                    교육/행사 목록
                </h2>
                <button
                    onClick={() => setIsCreating(true)}
                    className="btn-primary text-sm px-3 py-2"
                >
                    <Plus size={16} />
                    새 행사 만들기
                </button>
            </div>

            <div className="space-y-3">
                {isCreating && (
                    <motion.form
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        onSubmit={handleCreate}
                        className="mb-4"
                    >
                        <div className="flex gap-2">
                            <input
                                type="text"
                                autoFocus
                                placeholder="행사명 (예: 자원봉사자 교육)"
                                className="glass-input text-sm"
                                value={newSessionName}
                                onChange={(e) => setNewSessionName(e.target.value)}
                            />
                            <button type="submit" className="btn-secondary whitespace-nowrap">확인</button>
                            <button type="button" onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600 px-2">취소</button>
                        </div>
                    </motion.form>
                )}

                {sessions.length === 0 ? (
                    <p className="text-gray-400 text-center py-8 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        등록된 행사가 없습니다.<br />새 행사를 만들어보세요.
                    </p>
                ) : (
                    <div className="grid gap-3">
                        {sessions.map(session => (
                            <div
                                key={session.id}
                                onClick={() => onSelectSession(session.id)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all relative group ${activeSessionId === session.id
                                        ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-200'
                                        : 'bg-white border-gray-100 hover:border-indigo-100 hover:shadow-md'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className={`font-bold ${activeSessionId === session.id ? 'text-indigo-900' : 'text-gray-700'}`}>
                                            {session.name}
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(session.createdAt).toLocaleDateString()} | {session.participants.length}명
                                        </p>
                                    </div>
                                    {activeSessionId === session.id && (
                                        <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded-full font-bold">
                                            Active
                                        </span>
                                    )}
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-400 transition-opacity"
                                    title="행사 삭제"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SessionManager;
