/**
 * Utility functions to map and flatten backend responses for the ShiftContext state.
 */

export const mapWireTensionRecords = (responseData) => {
    if (!responseData) return [];
    const flattenedRecords = [];
    responseData.forEach(batchRecord => {
        const { batchNo, sleeperType, wiresPerSleeper, targetLoadKn } = batchRecord;

        (batchRecord.manualRecords || []).forEach(m => {
            flattenedRecords.push({
                ...m,
                batchNo,
                parentId: batchRecord.id,
                modulus: m.modulus || m.youngsModulus,
                source: 'Manual',
                sleeperType,
                wiresPerSleeper,
                targetLoadKn
            });
        });

        (batchRecord.scadaRecords || []).forEach(s => {
            flattenedRecords.push({
                ...s,
                batchNo,
                parentId: batchRecord.id,
                time: s.time || s.plcTime,
                modulus: s.modulus || s.youngsModulus,
                source: 'Scada',
                sleeperType,
                wiresPerSleeper,
                targetLoadKn
            });
        });
    });
    return flattenedRecords;
};

export const mapCompactionRecords = (responseData) => {
    if (!responseData) return [];
    const flattenedRecords = [];
    responseData.forEach(batchRecord => {
        const { batchNo, sleeperType, entryDate } = batchRecord;

        (batchRecord.manualRecords || []).forEach(m => {
            flattenedRecords.push({
                ...m,
                batchNo,
                parentId: batchRecord.id,
                date: entryDate,
                source: 'Manual',
                sleeperType
            });
        });

        (batchRecord.scadaRecords || []).forEach(s => {
            flattenedRecords.push({
                ...s,
                batchNo,
                parentId: batchRecord.id,
                date: entryDate,
                source: 'Scada',
                sleeperType
            });
        });
    });
    return flattenedRecords;
};

export const mapSteamCuringRecords = (responseData) => {
    if (!responseData) return [];
    const flattenedRecords = [];
    responseData.forEach(batchRecord => {
        const { batchNo, chamber, grade, entryDate, id } = batchRecord;

        (batchRecord.manualRecords || []).forEach(m => {
            flattenedRecords.push({
                ...m,
                id: `${id}-m-${flattenedRecords.length}`,
                manualId: m.id,
                parentId: id,
                batchNo,
                chamberNo: chamber,
                date: entryDate,
                source: 'Manual',
                grade,
                minConstTemp: m.minTemp,
                maxConstTemp: m.maxTemp
            });
        });

        (batchRecord.scadaRecords || []).forEach(s => {
            flattenedRecords.push({
                ...s,
                id: `${id}-s-${flattenedRecords.length}`,
                parentId: id,
                batchNo,
                chamberNo: chamber,
                date: entryDate,
                source: 'Scada',
                grade,
                minConstTemp: s.minTemp || 0,
                maxConstTemp: s.maxTemp || 0
            });
        });
    });
    return flattenedRecords;
};

export const mapBatchWeighmentData = (responseData, containers) => {
    if (!responseData) return { declarations: {}, configs: {}, witnessed: {} };
    
    const allDeclarations = {};
    const allConfigs = {};
    const allWitnessed = {};

    responseData.forEach(session => {
        const matchedContainer = containers.find(c => c.name === session.lineNo);
        const containerId = matchedContainer ? matchedContainer.id : 1;

        const newDeclarations = (session.batchDetails || []).map(d => ({
            id: d.id,
            parentId: session.id,
            batchNo: d.batchNo,
            proportionMatch: d.proportionStatus,
            setValues: {
                ca1: d.ca1Set, ca2: d.ca2Set, fa: d.faSet,
                cement: d.cementSet, water: d.waterSet, admixture: d.admixtureSet
            },
            adjustedWeights: {
                ca1: d.ca1Ref, ca2: d.ca2Ref, fa: d.faRef,
                cement: d.cementRef, water: d.waterRef, admixture: d.admixtureRef
            }
        }));
        allDeclarations[containerId] = [...(allDeclarations[containerId] || []), ...newDeclarations];

        allConfigs[containerId] = {
            sandType: session.sandType,
            sensorStatus: (session.moistureSensorStatus || 'working').toLowerCase()
        };

        const witnessed = [];
        (session.scadaRecords || []).forEach(s => {
            witnessed.push({
                ...s,
                id: s.id,
                parentId: session.id,
                location: session.lineNo,
                concreteGrade: session.concreteGrade,
                source: 'Scada',
                type: 'weight-batching',
                ca1: s.ca1Actual,
                ca2: s.ca2Actual,
                fa: s.faActual,
                cement: s.cementActual,
                water: s.waterActual,
                admixture: s.admixtureActual
            });
        });
        (session.manualRecords || []).forEach(m => {
            witnessed.push({
                ...m,
                id: m.id,
                parentId: session.id,
                location: session.lineNo,
                concreteGrade: session.concreteGrade,
                source: 'Manual',
                type: 'weight-batching',
                ca1: m.ca1Actual,
                ca2: m.ca2Actual,
                fa: m.faActual,
                cement: m.cementActual,
                water: m.waterActual,
                admixture: m.admixtureActual
            });
        });
        allWitnessed[containerId] = [...(allWitnessed[containerId] || []), ...witnessed];
    });

    return { declarations: allDeclarations, configs: allConfigs, witnessed: allWitnessed };
};
