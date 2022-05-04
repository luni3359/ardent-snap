import { castStringType } from "./utils";

export class StorageManager {
    static save(key, data) {
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
            return castStringType(data);
        } catch (e) {
            return data;
        }
    }

    static delete(key) {
        window.sessionStorage.removeItem(key);
    }

    static reset() {
        window.sessionStorage.clear();
    }
}
