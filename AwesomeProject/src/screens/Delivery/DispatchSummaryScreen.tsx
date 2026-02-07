import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Modal,
    ScrollView,
    Alert,
} from 'react-native';
import { CalendarProvider, ExpandableCalendar } from 'react-native-calendars';
import Feather from 'react-native-vector-icons/Feather';
import dayjs from 'dayjs';
import { apiService } from '../../services/apiService';
import { COLORS } from '../../constants/colors';
import { Button } from '../../components/common/Button';

interface Area {
    _id: string;
    name: string;
    totalSubscribedItems: number;
}

interface AreaDispatchState {
    totalDispatched: string;
    returnedExpression: string;
    returnedQuantity: number;
}

import { useAttendanceStore } from '../../store/attendanceStore';

export const DispatchSummaryScreen = () => {
    const [selectedDate, setSelectedDate] = useState(
        dayjs().format('YYYY-MM-DD')
    );

    const [areas, setAreas] = useState<Area[]>([]);
    const [infoAreaId, setInfoAreaId] = useState<string | null>(null);

    // STORE
    const { drafts, setDraft } = useAttendanceStore();

    const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);

    /* -----------------------------
       FETCH AREAS & ATTENDANCE
    ----------------------------- */
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Areas
                const areaRes = await apiService.get('/delivery/area');
                const list: Area[] = areaRes.data.data || [];
                setAreas(list);

                // 2. Fetch Attendance for Selected Date (All Areas)
                // Note: The backend GET /attendance?date=... returns records for the store/date
                const attRes = await apiService.get('/attendance', { date: selectedDate });
                const attData = attRes.data.data || [];
                setAttendanceRecords(attData);

                // 3. Pre-populate drafts from server data if draft is empty
                // This ensures we start with server data
                list.forEach(area => {
                    const existingRecord = attData.find((r: any) => r.areaId === area._id);
                    if (existingRecord) {
                        const draftKey = `${selectedDate}_${area._id}`;
                        const existingDraft = drafts[draftKey];

                        // If no draft exists, or if we want to ensure we have the ID:
                        // We'll update the draft with server data.
                        // Be careful not to overwrite user unsaved changes if they exist?
                        // But on mount, assuming we want latest server state.

                        setDraft(selectedDate, area._id, {
                            totalDispatched: existingDraft?.totalDispatched ?? String(existingRecord.totalDispatched || 0),
                            returnedExpression: existingDraft?.returnedExpression ?? (existingRecord.returnedItems?.expression || ''),
                            _id: existingRecord._id // Store ID for updates
                        });
                    }
                });

            } catch (error) {
                console.error('Error fetching dispatch data:', error);
            }
        };
        fetchData();
    }, [selectedDate]);

    /* -----------------------------
       HELPERS
    ----------------------------- */
    const calculateReturned = (expression: string) => {
        try {
            const sanitized = expression.replace(/[^0-9+\-.]/g, ''); // Allow .
            if (!sanitized) return 0;

            return sanitized
                .split('+')
                .reduce((sum, part) => {
                    const nums = part.split('-').map(n => parseFloat(n || '0')); // Use parseFloat
                    if (nums.length === 0) return sum;
                    const first = nums[0];
                    const rest = nums.slice(1);
                    return sum + (rest.length > 0 ? rest.reduce((a, b) => a - b, first) : first);
                }, 0);
        } catch {
            return 0;
        }
    };

    const handleUpdateGiven = (areaId: string, value: string) => {
        setDraft(selectedDate, areaId, { totalDispatched: value });
    };

    const handleUpdateExpression = (areaId: string, value: string) => {
        setDraft(selectedDate, areaId, { returnedExpression: value });
    };

    const handleSave = async (areaId: string) => {
        const draftKey = `${selectedDate}_${areaId}`;
        const draft = drafts[draftKey] || {};

        // Find existing record ID locally or in draft
        let recordId = draft._id;
        if (!recordId) {
            const existing = attendanceRecords.find(r => r.areaId === areaId);
            if (existing) recordId = existing._id;
        }

        if (!recordId) {
            Alert.alert('Error', 'Please submit attendance for this area first.');
            return;
        }

        try {
            const body = {
                totalDispatched: parseFloat(draft.totalDispatched || '0'),
                returnedItems: {
                    expression: draft.returnedExpression || '',
                    quantity: calculateReturned(draft.returnedExpression || '')
                }
            };
            console.log('Saving dispatch:', body);

            await apiService.put(`/attendance/${recordId}`, body);
            Alert.alert('Success', 'Dispatch updated successfully!');

            // Refresh logic: Update attendanceRecords locally to reflect change
            setAttendanceRecords(prev => prev.map(r => {
                if (r._id === recordId) {
                    return { ...r, ...body };
                }
                return r;
            }));

        } catch (error) {
            console.error('Error saving dispatch:', error);
            Alert.alert('Error', 'Failed to save changes.');
        }
    };

    /* -----------------------------
       TRUE INTERNAL CALENDAR HEADER
       (THIS FIXES YOUR ISSUE)
    ----------------------------- */
    const renderCalendarHeader = (date: any) => {
        const monthLabel = dayjs(date).format('MMMM YYYY');

        return (
            <View style={styles.calendarHeaderWrapper}>
                {/* LEFT CORNER */}
                <View style={styles.calendarLeft}>
                    <Feather name="calendar" size={16} color="#333" />
                    <Text style={styles.calendarMonthText}>
                        {monthLabel}
                    </Text>
                </View>

                {/* RIGHT CORNER */}
                <View style={styles.calendarRight}>
                    <TouchableOpacity
                        onPress={() =>
                            setSelectedDate(prev =>
                                dayjs(prev)
                                    .subtract(1, 'month')
                                    .startOf('month')
                                    .format('YYYY-MM-DD')
                            )
                        }
                    >
                        <Feather name="chevron-left" size={22} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() =>
                            setSelectedDate(prev =>
                                dayjs(prev)
                                    .add(1, 'month')
                                    .startOf('month')
                                    .format('YYYY-MM-DD')
                            )
                        }
                    >
                        <Feather name="chevron-right" size={22} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <CalendarProvider
                date={selectedDate}
                onDateChanged={setSelectedDate}
            >
                <ExpandableCalendar
                    hideArrows
                    disablePan
                    renderHeader={renderCalendarHeader}
                    firstDay={1}
                    markedDates={{
                        [selectedDate]: {
                            selected: true,
                            selectedColor: COLORS.primary,
                        },
                    }}
                />

                <ScrollView>
                    {areas.map(area => {
                        // GET DRAFT FROM STORE
                        const draftKey = `${selectedDate}_${area._id}`;
                        const draft = drafts[draftKey] || {};

                        const totalDispatched = draft.totalDispatched !== undefined
                            ? draft.totalDispatched
                            : String(area.totalSubscribedItems || 0);

                        const returnedExpression = draft.returnedExpression || '';

                        // Calculate both fields as expressions
                        const dispatchedQuantity = calculateReturned(totalDispatched);
                        const returnedQuantity = calculateReturned(returnedExpression);

                        const actualGiven = dispatchedQuantity + returnedQuantity;

                        return (
                            <View key={area._id} style={styles.areaCard}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={styles.areaTitle}>
                                        {area.name}
                                    </Text>
                                    <TouchableOpacity onPress={() => handleSave(area._id)}>
                                        <Feather name="save" size={20} color={COLORS.primary} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.row}>
                                    <View style={styles.field}>
                                        <Text style={styles.label}>Given</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={totalDispatched}
                                            onChangeText={val => handleUpdateGiven(area._id, val)}
                                            keyboardType="numeric"
                                        />
                                    </View>

                                    <View style={styles.field}>
                                        <Text style={styles.label}>+ / -</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={returnedExpression}
                                            onChangeText={val => handleUpdateExpression(area._id, val)}
                                        />
                                    </View>

                                    <View style={styles.field}>
                                        <Text style={styles.label}>Remaining</Text>
                                        <Text style={styles.value}>
                                            {actualGiven}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.infoBtn}
                                        onPress={() => setInfoAreaId(area._id)}
                                    >
                                        <Feather name="info" size={16} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}


                </ScrollView>
            </CalendarProvider>

            {/* INFO MODAL */}
            <Modal transparent visible={!!infoAreaId}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        {infoAreaId && (() => {
                            const draftKey = `${selectedDate}_${infoAreaId}`;
                            const draft = drafts[draftKey] || {};
                            const totalDispatched = draft.totalDispatched || '0';
                            const returnedExpr = draft.returnedExpression || '';

                            // Calculate both as expressions
                            const dispatchedQty = calculateReturned(totalDispatched);
                            const retQty = calculateReturned(returnedExpr);

                            return (
                                <>
                                    <Text style={styles.modalTitle}>
                                        {areas.find(a => a._id === infoAreaId)?.name}
                                    </Text>

                                    <Text>Total Given: {totalDispatched} = {dispatchedQty}</Text>
                                    <Text>Adjustments: {returnedExpr || '0'} = {retQty}</Text>
                                    <Text style={{ fontWeight: 'bold' }}>
                                        Actual Given:{' '}
                                        {dispatchedQty + retQty}
                                    </Text>
                                </>
                            );
                        })()}

                        <Button title="Close" onPress={() => setInfoAreaId(null)} />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

/* -----------------------------
   STYLES (CRITICAL PART)
----------------------------- */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },

    /* 🔥 CALENDAR HEADER – HARD CORNERS */
    calendarHeaderWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // ← THIS IS THE KEY
        paddingHorizontal: 16,
        paddingVertical: 10,
    },

    calendarLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    calendarRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    calendarMonthText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },

    areaCard: {
        marginHorizontal: 16,
        marginTop: 12,
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#fff',
    },

    areaTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 6,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },

    field: { flex: 1 },

    label: {
        fontSize: 10,
        color: '#666',
        marginBottom: 2,
    },

    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 4,
        fontSize: 13,
    },

    value: {
        height: 32,
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.primary,
    },

    infoBtn: {
        width: 32,
        height: 32,
        backgroundColor: '#6c757d',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalBox: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },

    modalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});
