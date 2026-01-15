import React, { useEffect, useState } from "react";

/*
  Collection Record: Awaiting Inspection
  Shows side numbered notification (badge)
*/

export default function CollectionAwaitingInspection() {
    const [records, setRecords] = useState([]);

    // Mock data (replace with API response)
    useEffect(() => {
        setRecords([
            { id: "REC-001", status: "VERIFIED" },
            { id: "REC-002", status: "VERIFIED" },
            { id: "REC-003", status: "INSPECTED" }
        ]);
    }, []);

    const pendingCount = records.filter(
        r => r.status === "VERIFIED"
    ).length;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <span style={styles.title}>Collection Record</span>
                <span style={styles.badge}>{pendingCount}</span>
            </div>

            <span style={styles.subtitle}>Awaiting Inspection</span>

            <div className="table-wrapper">
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Record ID</th>
                            <th style={styles.th}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((rec, idx) => (
                            <tr key={rec.id} style={styles.tr}>
                                <td data-label="Record ID" style={styles.td}>{rec.id}</td>
                                <td data-label="Status" style={styles.td}>{rec.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const styles = {
    container: {
        width: "100%",
        fontFamily: "var(--font-primary)",
        marginBottom: '32px'
    },
    header: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "4px"
    },
    title: {
        fontSize: "var(--fs-xl)",
        fontWeight: "600",
        color: "#1a2b3b"
    },
    subtitle: {
        color: "#64748b",
        fontSize: "var(--fs-xs)",
        marginBottom: "16px",
        display: "block"
    },
    badge: {
        backgroundColor: "#d32f2f",
        color: "white",
        fontSize: "var(--fs-xxs)",
        fontWeight: "600",
        padding: "2px 8px",
        borderRadius: "12px",
        minWidth: "20px",
        textAlign: "center"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        background: "transparent"
    },
    th: {
        textAlign: "left",
        padding: "14px 16px",
        background: "#fbf7ed",
        borderBottom: "1px solid #e5e7eb",
        fontSize: "13px",
        fontWeight: "600",
        color: "#475467"
    },
    td: {
        padding: "18px 16px",
        background: "white",
        borderBottom: "1px solid #e5e7eb",
        fontSize: "14px",
        color: "#344054",
        verticalAlign: "middle"
    },
    tr: {
        transition: "background 0.2s"
    }
};
