import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Modal,
    ScrollView,
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

    /* -----------------------------
       FETCH AREAS
    ----------------------------- */
    useEffect(() => {
        const fetchAreas = async () => {
            const res = await apiService.get('/delivery/area');
            const list: Area[] = res.data.data || [];
            setAreas(list);
        };
        fetchAreas();
    }, []);

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
                    // Hande simple numbers or subtraction chains
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
                                <Text style={styles.areaTitle}>
                                    {area.name}
                                </Text>

                                <View style={styles.row}>
                                    <View style={styles.field}>
                                        <Text style={styles.label}>Given</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={totalDispatched}
                                            onChangeText={val => handleUpdateGiven(area._id, val)}
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
