import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';

const DataTable = ({ data }) => {
    if (!data || data.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel mt-8 overflow-hidden"
        >
            <div className="p-6 border-b" style={{ borderBottomColor: 'var(--color-glass-border)' }}>
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <span style={{
                        background: 'var(--color-primary)',
                        width: '0.5rem',
                        height: '1.5rem',
                        borderRadius: '999px',
                        display: 'inline-block'
                    }} />
                    대상자 목록 ({data.length}명)
                </h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>이름</th>
                            <th>소속</th>
                            <th>전화번호</th>
                            <th>차량번호</th>
                            <th>QR Code</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index}>
                                <td className="font-medium">{row.name}</td>
                                <td>{row.affiliation}</td>
                                <td>{row.phone}</td>
                                <td>{row.vehicle}</td>
                                <td>
                                    <div style={{ background: 'white', padding: '0.5rem', borderRadius: '0.25rem', width: 'fit-content' }}>
                                        <QRCodeCanvas
                                            value={JSON.stringify(row)}
                                            size={64}
                                            level={"M"}
                                        />
                                    </div>
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
