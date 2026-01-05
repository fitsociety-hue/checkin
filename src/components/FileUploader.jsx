import React, { useCallback } from 'react';
import Papa from 'papaparse';
import { Upload, FileDown } from 'lucide-react';
import { motion } from 'framer-motion';

const FileUploader = ({ onDataLoaded }) => {
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const normalizedData = results.data.map(item => {
                    const keys = Object.keys(item);
                    const nameKey = keys.find(k => k.includes('이름') || k.includes('Name'));
                    const affKey = keys.find(k => k.includes('소속') || k.includes('Affiliation') || k.includes('Group'));
                    const phoneKey = keys.find(k => k.includes('전화') || k.includes('Phone') || k.includes('Tel'));
                    const carKey = keys.find(k => k.includes('차량') || k.includes('Vehicle') || k.includes('Car'));

                    return {
                        name: item[nameKey] || '',
                        affiliation: item[affKey] || '',
                        phone: item[phoneKey] || '',
                        vehicle: item[carKey] || '',
                        raw: item
                    };
                });
                onDataLoaded(normalizedData);
            },
            error: (error) => {
                console.error("CSV Parse Error:", error);
                alert("CSV 파일을 읽는 중 오류가 발생했습니다.");
            }
        });
    };

    const downloadTemplate = () => {
        const csvContent = "\uFEFF이름,소속,전화번호,차량번호\n홍길동,전략기획팀,010-1234-5678,12가3456";
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 text-center"
        >
            <div className="upload-zone">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="upload-input"
                />
                <div className="flex-col flex-center gap-4" style={{ pointerEvents: 'none' }}>
                    <div className="p-4 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-primary)' }}>
                        <Upload size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-2">CSV 파일 업로드</h3>
                        <p className="text-muted">클릭하거나 파일을 드래그하여 업로드하세요</p>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex-center" style={{ justifyContent: 'flex-end' }}>
                <button
                    onClick={downloadTemplate}
                    className="text-sm text-muted"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <FileDown size={16} />
                    템플릿 다운로드
                </button>
            </div>
        </motion.div>
    );
};

export default FileUploader;
