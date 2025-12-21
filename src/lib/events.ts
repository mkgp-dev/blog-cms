type UnauthorizedHandler = () => void;

const listeners = new Set<UnauthorizedHandler>();

export function onUnauthorized(handler: UnauthorizedHandler) {
    listeners.add(handler);
    return () => {
        listeners.delete(handler);
    };
}

export function notifyUnauthorized() {
    for (const handler of listeners) {
        handler();
    }
}