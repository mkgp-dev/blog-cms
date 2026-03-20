import localforage from "localforage";

const store = localforage.createInstance({
    name: "blogStorage",
    storeName: "auth",
});

const ACCESS_TOKEN_KEY = "access_token";

export async function getToken() {
    return store.getItem<string>(ACCESS_TOKEN_KEY);
}

export async function setToken(token: string) {
    await store.setItem(ACCESS_TOKEN_KEY, token);
}

export async function clearToken() {
    await store.removeItem(ACCESS_TOKEN_KEY);
}
