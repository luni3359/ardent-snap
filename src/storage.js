export class SaveData {
    static save(key, data) {
        window.sessionStorage[key] = data;
    }

    static load(key, fallback) {
        const data = window.sessionStorage.getItem(key);

        if (data == null)
            return fallback;
            
        return data;
    }

    static delete(key) {
        window.sessionStorage.removeItem(key);
    }

    static reset() {
        window.sessionStorage.clear();
    }
}
