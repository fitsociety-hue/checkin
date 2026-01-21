import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, Loader2, ArrowRight } from 'lucide-react';
import { fetchSessionList } from '../utils/googleSheets';

const PublicEventList = ({ onLoadSession }) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadSessions = async () => {
            try {
                setLoading(true);
                const response = await fetchSessionList();
                if (response.status === 'success') {
                    // Sort by latest update or count
                    const sorted = response.sessions.sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));
                    setSessions(sorted);
                } else {
                    setError(response.message || 'Failed to load sessions');
                }
            } catch (err) {
                setError('서버 연결에 실패했습니다. (CORS 또는 네트워크 문제)');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadSessions();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p>행사 목록을 불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 rounded-xl text-red-600">
                <p className="font-bold mb-2">오류가 발생했습니다</p>
                <p>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-white border border-red-200 rounded-lg text-sm hover:bg-red-50"
                >
                    다시 시도
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center md:text-left">
                <h2 className="text-xl font-bold text-gray-800">진행 중인 행사 목록</h2>
                <p className="text-gray-500 text-sm mt-1">
                    참여할 행사를 선택하면 체크인 현황을 확인하거나 명단을 관리할 수 있습니다.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sessions.map((session) => (
                    <button
                        key={session.name}
                        onClick={() => onLoadSession(session)}
                        className="flex flex-col text-left p-5 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-indigo-300 transition-all group"
                    >
                        <div className="flex items-start justify-between w-full mb-4">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Calendar size={20} />
                            </div>
                            <span className="text-xs font-mono text-gray-400">
                                {new Date(session.lastUpdate).toLocaleDateString()}
                            </span>
                        </div>

                        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                            {session.name}
                        </h3>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-auto">
                            <div className="flex items-center gap-1">
                                <Users size={14} />
                                <span>{session.count}명</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>최근 업데이트</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-50 w-full flex justify-between items-center text-sm font-medium text-indigo-600 opacity-60 group-hover:opacity-100 transition-opacity">
                            <span>불러오기</span>
                            <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                ))}
            </div>

            {sessions.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200 text-gray-400">
                    등록된 행사가 없습니다.
                </div>
            )}
        </div>
    );
};

export default PublicEventList;
