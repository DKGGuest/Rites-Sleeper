
export const getVerificationStats = (data) => {
    if (!data) return { pending: 0, verified: 0, rejected: 0 };

    const all = [
        ...(data.profiles || []),
        ...(data.benches || []),
        ...(data.rawMaterials || []),
        ...(data.mixDesigns || [])
    ];

    return {
        pending: all.filter(e => e.status === 'Pending' || e.status === 'Unlocked').length,
        verified: all.filter(e => e.status === 'Verified').length,
        rejected: all.filter(e => e.status === 'Rejected').length,
    };
};
