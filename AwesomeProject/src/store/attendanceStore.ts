import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({
    id: 'attendance-storage',
});

interface AttendanceState {
    [customerId: string]: {
        [productId: string]: {
            status: string;
            quantity: number;
        };
    };
}

interface AttendanceDraft {
    totalDispatched: string;
    returnedExpression: string;
    attendance: AttendanceState;
    modifiedProductLists?: Record<string, any[]>; // Key: customerId, Value: list of products
    timestamp: number;
    _id?: string;
}

interface AttendanceStore {
    drafts: Record<string, AttendanceDraft>; // Key: `${date}_${areaId}`
    apartmentOrders: Record<string, string[]>; // Key: areaId, Value: ordered apartment names

    // Actions
    setDraft: (date: string, areaId: string, draft: Partial<AttendanceDraft>) => void;
    getDraft: (date: string, areaId: string) => AttendanceDraft | undefined;
    clearDraft: (date: string, areaId: string) => void;
    setApartmentOrder: (areaId: string, order: string[]) => void;
    getApartmentOrder: (areaId: string) => string[] | undefined;
}

// Custom storage wrapper for MMKV to work with Zustand persist
const zustandStorage = {
    getItem: (name: string) => {
        const value = storage.getString(name);
        return value ?? null;
    },
    setItem: (name: string, value: string) => {
        storage.set(name, value);
    },
    removeItem: (name: string) => {
        storage.delete(name);
    },
};

export const useAttendanceStore = create<AttendanceStore>()(
    persist(
        (set, get) => ({
            drafts: {},
            apartmentOrders: {},

            setDraft: (date, areaId, draft) => {
                const key = `${date}_${areaId}`;
                set((state) => ({
                    drafts: {
                        ...state.drafts,
                        [key]: {
                            ...(state.drafts[key] || {}),
                            ...draft,
                            timestamp: Date.now(),
                        },
                    },
                }));
            },

            getDraft: (date, areaId) => {
                const key = `${date}_${areaId}`;
                return get().drafts[key];
            },

            clearDraft: (date, areaId) => {
                const key = `${date}_${areaId}`;
                set((state) => {
                    const newDrafts = { ...state.drafts };
                    delete newDrafts[key];
                    return { drafts: newDrafts };
                });
            },

            setApartmentOrder: (areaId, order) => {
                set((state) => ({
                    apartmentOrders: {
                        ...state.apartmentOrders,
                        [areaId]: order,
                    },
                }));
            },

            getApartmentOrder: (areaId) => {
                return get().apartmentOrders[areaId];
            },
        }),
        {
            name: 'attendance-drafts',
            storage: createJSONStorage(() => zustandStorage),
        }
    )
);
