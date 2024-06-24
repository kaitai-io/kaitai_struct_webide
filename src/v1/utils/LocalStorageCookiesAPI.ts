export interface LocalStorageSelection {
    start: number;
    end: number;
}

export const getStoredSelection = (): LocalStorageSelection | undefined => {
    const value = localStorage.getItem("selection");
    return value !== null ? JSON.parse(value) : null;
};

export const storeSelection = (start: number, end: number): LocalStorageSelection | undefined => {
    const value = localStorage.getItem("selection");
    return value !== null ? JSON.parse(value) : null;
};