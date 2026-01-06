import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

const DataTable = ({ data, onDelete, onBatchDelete }) => {
    const [selectedPhones, setSelectedPhones] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');

    if (!data || data.length === 0) return null;

    const filteredData = data.filter(row =>
        row.name.includes(searchTerm) || row.phone.includes(searchTerm) || (row.affiliation && row.affiliation.includes(searchTerm))
    );

    const toggleSelectAll = () => {
        if (selectedPhones.size === filteredData.length) {
            setSelectedPhones(new Set());
        } else {
            setSelectedPhones(new Set(filteredData.map(r => r.phone)));
        }
    };

    const toggleSelect = (phone) => {
        const newSet = new Set(selectedPhones);
        if (newSet.has(phone)) newSet.delete(phone);
        else newSet.add(phone);
        setSelectedPhones(newSet);
    };

    const handleDeleteSelected = () => {
        if (selectedPhones.size === 0) return;

        const password = prompt(`${selectedPhones.size}명을 삭제하려면 비밀번호 '1107'을 입력하세요.`);
        if (password === '1107') {
            if (onBatchDelete) {
                onBatchDelete(Array.from(selectedPhones));
                setSelectedPhones(new Set());
            } else {
                alert("일괄 삭제 기능이 지원되지 않는 버전입니다.");
            }
        } else if (password !== null) {
            alert("비밀번호가 올바르지 않습니다.");
        }
    };

    const handleDeleteOne = (phone) => {
        const password = prompt("삭제하려면 비밀번호 '1107'을 입력하세요.");
        if (password === '1107') {
            if (onDelete) onDelete(phone);
        } else if (password !== null) {
            alert("비밀번호가 올바르지 않습니다.");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel mt-8 overflow-hidden"
        >
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex gap-2 items-center">
                    <h3 className="font-bold text-lg text-gray-800">참석자 목록 ({filteredData.length}명)</h3>
                    {selectedPhones.size > 0 && (
                        <span className="text-sm text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded-md">
                            {selectedPhones.size}명 선택됨
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="이름/번호 검색..."
                        className="glass-input py-1 px-3 text-sm w-48"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    {selectedPhones.size > 0 && (
                        <button
                            className="btn-danger py-1 px-3 text-xs flex items-center gap-1"
                            onClick={handleDeleteSelected}
                        >
                            <Trash2 size={14} /> 선택 삭제
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto max-h-[600px]">
                <table className="data-table w-full text-left">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th className="w-12 px-4 py-3 bg-gray-50">
                                <input
                                    type="checkbox"
                                    onChange={toggleSelectAll}
                                    checked={filteredData.length > 0 && selectedPhones.size === filteredData.length}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                            </th>
                            <th className="px-4 py-3 bg-gray-50">이름</th>
                            <th className="px-4 py-3 bg-gray-50">소속</th>
                            <th className="px-4 py-3 bg-gray-50">전화번호</th>
                            <th className="px-4 py-3 bg-gray-50">차량번호</th>
                            <th className="px-4 py-3 bg-gray-50">교육명</th>
                            <th className="px-4 py-3 bg-gray-50">QR Code</th>
                            <th className="px-4 py-3 bg-gray-50 text-right">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredData.map((row) => (
                            <tr key={row.phone} className={`hover:bg-gray-50 transition-colors ${selectedPhones.has(row.phone) ? 'bg-indigo-50/50' : ''}`}>
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedPhones.has(row.phone)}
                                        onChange={() => toggleSelect(row.phone)}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                                <td className="px-4 py-3 text-gray-500">{row.affiliation}</td>
                                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{row.phone}</td>
                                <td className="px-4 py-3 text-gray-500">{row.vehicle}</td>
                                <td className="px-4 py-3 text-gray-500 text-sm">{row.eventName || '-'}</td>
                                <td className="px-4 py-3">
                                    <div style={{ background: 'white', padding: '0.25rem', borderRadius: '0.25rem', width: 'fit-content', border: '1px solid #eee' }}>
                                        <QRCodeCanvas
                                            value={JSON.stringify(row)}
                                            size={48}
                                            level={"M"}
                                        />
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => handleDeleteOne(row.phone)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default DataTable;
