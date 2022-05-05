import { castStringType } from "./utils";

export class StorageManager {
    static storage = {};

    static save(key, data) {
        StorageManager.storage[key] = data;
        window.sessionStorage[key] = data;
    }

    static load(key, fallback) {
        const data = window.sessionStorage.getItem(key);

        if (data == null) {
            if (fallback !== undefined) {
                return fallback;
            }
            return null;
        }

        try {
            data = castStringType(data);
        } finally {
            StorageManager.storage[key] = data;
            return data;
        }
    }

    static delete(key) {
        delete StorageManager[key];
        window.sessionStorage.removeItem(key);
    }

    static reset() {
        StorageManager.storage = {};
        window.sessionStorage.clear();
    }
}
