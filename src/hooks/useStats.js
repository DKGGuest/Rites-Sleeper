import { useMemo } from 'react';

export const useBatchStats = (witnessedRecords, batchDeclarations, selectedBatchNo) => {
    return useMemo(() => {
        const records = witnessedRecords.filter(r => r.batchNo === selectedBatchNo);
        const declared = batchDeclarations.find(b => b.batchNo === selectedBatchNo);

        if (!declared) return null;

        const ingredients = ['ca1', 'ca2', 'fa', 'cement', 'water', 'admixture'];
        const TOLERANCE = 3; // 3% tolerance for outliers

        // Per-ingredient statistics
        const ingredientStats = ingredients.map(ing => {
            const setVal = declared.setValues[ing];
            const actualValues = records.map(r => parseFloat(r[ing]) || 0);
            const deviations = actualValues.map(actual => ((actual - setVal) / setVal) * 100);

            const count = deviations.length;
            const meanDev = count ? deviations.reduce((a, b) => a + b, 0) / count : 0;
            const variance = count ? deviations.reduce((a, b) => a + Math.pow(b - meanDev, 2), 0) / count : 0;
            const stdDev = Math.sqrt(variance);
            const maxPos = count ? Math.max(...deviations, 0) : 0;
            const maxNeg = count ? Math.min(...deviations, 0) : 0;
            const outliers = deviations.filter(d => Math.abs(d) > TOLERANCE).length;

            return {
                name: ing.toUpperCase(),
                ingredient: ing,
                totalBatches: count,
                meanDeviation: meanDev,
                stdDeviation: stdDev,
                maxPositiveDeviation: maxPos,
                maxNegativeDeviation: maxNeg,
                outlierCount: outliers,
                setValue: setVal
            };
        });

        // Set Value Validation Statistics
        const totalBatchWeighments = records.length;
        const matchingSetValues = batchDeclarations.filter(b => b.proportionMatch === 'OK').length;
        const mismatchSetValues = batchDeclarations.filter(b => b.proportionMatch === 'NOT OK').length;

        return {
            // Set Value Validation
            setValueValidation: {
                totalBatchWeighments: batchDeclarations.length,
                matchingProportion: matchingSetValues,
                mismatchingProportion: mismatchSetValues
            },
            // Actual Value Statistics
            actualValueStats: {
                totalBatchWeighments,
                ingredientStats
            },
            // Legacy support
            totalBatches: totalBatchWeighments,
            matchingSetValues,
            mismatchSetValues,
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

        const tachoWorkingPct = records.reduce((acc, r) => acc + (r.workingTachos / (r.tachoCount || 4)), 0) / count * 100;

        return {
            count,
            minRpm,
            maxRpm,
            meanRpm,
            medianRpm,
            avgDuration,
            stdDev,
            tachoWorkingPct,
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

        const phases = [
            { key: 'preDur', name: 'PreSteaming Duration', min: 2, max: null, isRate: false },
            { key: 'risePeriod', name: 'Temp Rising Period', min: 2, max: 2.5, isRate: false },
            { key: 'riseRate', name: 'Temp Rising Rate', min: null, max: 15, isRate: true },
            { key: 'constTemp', name: 'Constant Temp', min: 55, max: 60, isRate: false },
            { key: 'constDur', name: 'Constant Duration', min: 3.5, max: 5, isRate: false },
            { key: 'coolDur', name: 'Cooling Duration', min: 2, max: 3, isRate: false },
            { key: 'coolRate', name: 'Cooling Rate', min: null, max: 15, isRate: true }
        ];

        const stats = phases.map(phase => {
            const values = records.map(r => r[phase.key] || 0);
            const count = values.length;
            const min = Math.min(...values);
            const max = Math.max(...values);
            const mean = values.reduce((a, b) => a + b, 0) / count;
            const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / count;
            const stdDev = Math.sqrt(variance);

            const outliers = records.filter(r => {
                const val = r[phase.key];
                if (phase.min !== null && val < phase.min) return true;
                if (phase.max !== null && val > phase.max) return true;
                return false;
            }).length;

            return {
                ...phase,
                min, max, mean, stdDev, outliers
            };
        });

        const totalOutliers = records.filter(r => {
            return phases.some(phase => {
                const val = r[phase.key];
                if (phase.min !== null && val < phase.min) return true;
                if (phase.max !== null && val > phase.max) return true;
                return false;
            });
        }).length;

        return {
            count: records.length,
            stats,
            totalOutliers,
            records: records.map(r => ({
                ...r,
                isOk: !phases.some(phase => {
                    const val = r[phase.key];
                    if (phase.min !== null && val < phase.min) return true;
                    if (phase.max !== null && val > phase.max) return true;
                    return false;
                })
            }))
        };
    }, [steamRecords, selectedSteamBatch]);
};

export const useWireTensionStats = (tensionRecords, selectedBatch, theoreticalMean = 730) => {
    return useMemo(() => {
        const records = tensionRecords.filter(r => r.batchNo === selectedBatch);
        if (!records.length) return null;

        const values = records.map(r => parseFloat(r.finalLoad));
        const count = values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const mean = values.reduce((a, b) => a + b, 0) / count;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / count;
        const stdDev = Math.sqrt(variance);

        const pct1s = (values.filter(v => v >= mean - stdDev && v <= mean + stdDev).length / count) * 100;
        const pct2s = (values.filter(v => (v < mean - stdDev && v >= mean - 2 * stdDev) || (v > mean + stdDev && v <= mean + 2 * stdDev)).length / count) * 100;
        const pct3s = (values.filter(v => (v < mean - 2 * stdDev && v >= mean - 3 * stdDev) || (v > mean + 2 * stdDev && v <= mean + 3 * stdDev)).length / count) * 100;
        const pctOOC = (values.filter(v => v < mean - 3 * stdDev || v > mean + 3 * stdDev).length / count) * 100;

        return {
            count, min, max, mean, stdDev,
            cv: (stdDev / mean) * 100,
            deviationFromTheo: ((mean - theoreticalMean) / theoreticalMean) * 100,
            normalZone: pct1s,
            warningZone: pct2s,
            actionZone: pct3s,
            outOfControl: pctOOC,
            values
        };
    }, [tensionRecords, selectedBatch, theoreticalMean]);
};
