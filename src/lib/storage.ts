import localforage from "localforage";

const store = localforage.createInstance({
    name: "blogStorage",
    storeName: "auth",
});

const KEY = "access_token";

export async function getToken() {
    return store.getItem<string>(KEY);
}

export async function setToken(token: string) {
    await store.setItem(KEY, token);
}

export async function clearToken() {
    await store.removeItem(KEY);
}