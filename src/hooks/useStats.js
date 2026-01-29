import { useMemo } from 'react';

export const useBatchStats = (witnessedRecords, batchDeclarations, selectedBatchNo) => {
    return useMemo(() => {
        const records = witnessedRecords.filter(r => r.batchNo === selectedBatchNo);
        const declared = batchDeclarations.find(b => b.batchNo === selectedBatchNo);

        if (!declared) return null;

        const ingredients = ['ca1', 'ca2', 'fa', 'cement', 'water', 'admixture'];
        const TOLERANCE = 3;

        const ingredientStats = ingredients.map(ing => {
            const setVal = declared.setValues[ing];
            const deviations = records.map(r => ((r[ing] - setVal) / setVal) * 100);
            const count = deviations.length;
            const meanDev = count ? deviations.reduce((a, b) => a + b, 0) / count : 0;
            const variance = count ? deviations.reduce((a, b) => a + Math.pow(b - meanDev, 2), 0) / count : 0;
            const stdDev = Math.sqrt(variance);
            const maxPos = count ? Math.max(...deviations, 0) : 0;
            const maxNeg = count ? Math.min(...deviations, 0) : 0;
            const outliers = deviations.filter(d => Math.abs(d) > TOLERANCE).length;

            return {
                name: ing.toUpperCase(),
                count,
                meanDev,
                stdDev,
                maxPos,
                maxNeg,
                outliers
            };
        });

        return {
            totalBatches: records.length,
            matchingSetValues: batchDeclarations.filter(b => b.proportionMatch === 'OK').length,
            mismatchSetValues: batchDeclarations.filter(b => b.proportionMatch === 'NOT OK').length,
            ingredientStats
        };
    }, [witnessedRecords, batchDeclarations, selectedBatchNo]);
};

export const useCompactionStats = (compactionRecords, selectedCompactionBatch) => {
    return useMemo(() => {
        const records = compactionRecords.filter(r => r.batchNo === selectedCompactionBatch);
        if (!records.length) return null;

        const rpms = records.map(r => r.rpm);
        const durations = records.map(r => r.duration);

        const count = records.length;
        const minRpm = Math.min(...rpms);
        const maxRpm = Math.max(...rpms);
        const meanRpm = rpms.reduce((a, b) => a + b, 0) / count;

        const sortedRpms = [...rpms].sort((a, b) => a - b);
        const medianRpm = count % 2 !== 0 ? sortedRpms[(count - 1) / 2] : (sortedRpms[count / 2 - 1] + sortedRpms[count / 2]) / 2;

        const avgDuration = durations.reduce((a, b) => a + b, 0) / count;

        const variance = rpms.reduce((a, b) => a + Math.pow(b - meanRpm, 2), 0) / count;
        const stdDev = Math.sqrt(variance);

        const LSL = 8640;
        const USL = 9360;

        const withinSpec = rpms.filter(r => r >= LSL && r <= USL).length;
        const aboveLSL = rpms.filter(r => r > LSL).length;
        const aboveUSL = rpms.filter(r => r > USL).length;

        return {
            count,
            minRpm,
            maxRpm,
            meanRpm,
            medianRpm,
            avgDuration,
            stdDev,
            pctWithinSpec: (withinSpec / count) * 100,
            pctAboveLSL: (aboveLSL / count) * 100,
            pctAboveUSL: (aboveUSL / count) * 100
        };
    }, [compactionRecords, selectedCompactionBatch]);
};

export const useSteamStats = (steamRecords, selectedSteamBatch) => {
    return useMemo(() => {
        const records = steamRecords.filter(r => r.batchNo === selectedSteamBatch);
        if (!records.length) return null;

        const checkOutlier = (r) => {
            let outliers = 0;
            if (r.preDur < 2) outliers++;
            if (r.risePeriod < 2 || r.risePeriod > 2.5) outliers++;
            if (r.riseRate > 15) outliers++;
            if (r.constTemp < 55 || r.constTemp > 60) outliers++;
            if (r.constDur < 3.5 || r.constDur > 5) outliers++;
            if (r.coolDur < 2 || r.coolDur > 3) outliers++;
            if (r.coolRate > 15) outliers++;
            return outliers;
        };

        const totalOutliers = records.reduce((acc, r) => acc + (checkOutlier(r) > 0 ? 1 : 0), 0);

        return {
            count: records.length,
            outlierProcesses: totalOutliers,
            meanConstTemp: records.reduce((a, b) => a + b.constTemp, 0) / records.length
        };
    }, [steamRecords, selectedSteamBatch]);
};
