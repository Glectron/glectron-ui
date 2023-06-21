/* Temporary workaround for Glectron Core typings */
type BeforeShutdownCallback = () => Promise<boolean | undefined>;
type ShutdownCallback = () => Promise<void>;

type HitTestCallback = (w: number, h: number, x: number, y: number) => boolean;

export interface GlectronAPI {
    readonly isChromium: boolean;
    beforeShutdown: (callback: BeforeShutdownCallback) => void;
    onShutdown: (callback: ShutdownCallback) => void;
    onHitTest: (callback: HitTestCallback) => void;
    setMouseInputEnabled: (enabled: boolean) => void;
    setKeyboardInputEnabled: (enabled: boolean) => void;
    makePopup: () => void;
    unPopup: () => void;
    globalMouseMove: (enabled: boolean) => void;
    mouseCapture: (enabled: boolean) => void;
}

declare global {
    const glectron: GlectronAPI;
    interface Window { glectron: GlectronAPI; }
}