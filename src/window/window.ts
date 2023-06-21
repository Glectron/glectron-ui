import WindowOptions, { defaultOptions } from "./options";

interface GlectronMouseEvent {
    x: number,
    y: number
}

export default class Window {
    private element: HTMLElement;
    private titlebarElement: HTMLElement;
    private options: WindowOptions;

    private resizing = false;
    private originalWindowRect: DOMRect;
    private resizeOffsetTop = 0;
    private resizeOffsetBottom = 0;
    private resizeOffsetLeft = 0;
    private resizeOffsetRight = 0;
    private lastResizeWidth = 0;
    private lastResizeHeight = 0;

    private dragging = false;
    private draggingOffsetX = 0;
    private draggingOffsetY = 0;
    
    constructor(element: HTMLElement, options?: WindowOptions) {
        this.element = element;
        this.options = {
            ...defaultOptions,
            ...options
        };

        this.titlebarElement = element.querySelector(this.options.titlebarSelector as string) as HTMLElement;
        this.titlebarElement.addEventListener("mousedown", this.onTitlebarMouseDown.bind(this));

        this.element.addEventListener("mousemove", this.mouseMove.bind(this));
        this.element.addEventListener("mousedown", this.mouseDown.bind(this));

        addEventListener("globalmousemove", this.globalMouseMove.bind(this));
        addEventListener("capturemouserelease", this.captureMouseRelease.bind(this));

        glectron.onHitTest((_w, _h, x, y) => {
            const els = document.elementsFromPoint(x, y);
            if (els.find((val) => val == this.element)) {
                return true;
            }
        });

        if (this.options.width || this.options.height)
            this.setSize(this.options.width, this.options.height);

        this.hide();
    }

    private onTitlebarMouseDown(e: MouseEvent) {
        if (this.element.style.cursor.indexOf("resize") != -1 || this.resizing || !this.options.draggable) return;

        const targetEl = e.target as HTMLElement;
        if (targetEl.classList.contains(this.options.titlebarNoDragSelector as string) || targetEl.closest(this.options.titlebarNoDragSelector as string)) {
            return;
        }

        this.dragging = true;
        const rect = this.titlebarElement.getBoundingClientRect();
        this.draggingOffsetX = e.screenX - rect.x;
        this.draggingOffsetY = e.screenY - rect.y;
        glectron.mouseCapture(true);
        glectron.globalMouseMove(true);
    }

    private mouseMove(e: MouseEvent) {
        if (this.dragging || this.resizing || !this.options.resizable) return;
        const styl = this.element.style;
        const rect = this.element.getBoundingClientRect();
        const x = e.screenX;
        const y = e.screenY;
        this.resizeOffsetLeft = x - rect.x;
        this.resizeOffsetTop = y - rect.y;
        this.resizeOffsetRight = rect.right - x;
        this.resizeOffsetBottom = rect.bottom - y;
        const resizeDist = this.options.resizeRegionWidth as number;
        if (this.resizeOffsetTop <= resizeDist) {
            if (this.resizeOffsetLeft <= resizeDist) {
                styl.cursor = "nw-resize";
            } else if (this.resizeOffsetRight <= resizeDist) {
                styl.cursor = "ne-resize";
            } else {
                styl.cursor = "n-resize";
            }
        } else if (this.resizeOffsetLeft <= resizeDist) {
            if (this.resizeOffsetBottom <= resizeDist) {
                styl.cursor = "sw-resize";
            } else {
                styl.cursor = "w-resize";
            }
        } else if (this.resizeOffsetBottom <= resizeDist) {
            if (this.resizeOffsetRight <= resizeDist) {
                styl.cursor = "se-resize";
            } else {
                styl.cursor = "s-resize";
            }
        } else if (this.resizeOffsetRight <= resizeDist) {
            styl.cursor = "e-resize";
        } else {
            styl.cursor = "";
        }
    }

    private mouseDown(e: MouseEvent) {
        if (!this.options.resizable) return;
        if (this.dragging) return;
        if (this.element.style.cursor.indexOf("resize") == -1) return;
        this.resizing = true;
        const rect = this.element.getBoundingClientRect();
        const x = e.screenX;
        const y = e.screenY;
        this.resizeOffsetLeft = x - rect.x;
        this.resizeOffsetTop = y - rect.y;
        this.resizeOffsetRight = rect.right - x;
        this.resizeOffsetBottom = rect.bottom - y;
        this.lastResizeWidth = rect.right - rect.left;
        this.lastResizeHeight = rect.bottom - rect.top;
        this.originalWindowRect = rect;
        glectron.globalMouseMove(true);
        glectron.mouseCapture(true);
        e.preventDefault();
    }

    private captureMouseRelease() {
        glectron.globalMouseMove(false);
        glectron.mouseCapture(false);
        this.dragging = this.resizing = false;
    }

    private globalMouseMove(e: CustomEvent) {
        const mEvnt = e.detail as GlectronMouseEvent;
        if (this.dragging) {
            const styl = this.element.style;
            styl.left = mEvnt.x - this.draggingOffsetX + "px";
            styl.top = mEvnt.y - this.draggingOffsetY + "px";
        } else if (this.resizing) {
            const minWidth = this.options.minWidth as number;
            const minHeight = this.options.minHeight as number;
            const styl = this.element.style;
            const dirs = this.element.style.cursor.split("-")[0];
            if (dirs.indexOf("n") != -1) {
                const nTop = mEvnt.y - this.resizeOffsetTop;
                const nHeight = this.originalWindowRect.bottom - nTop;
                if (nHeight > minHeight || nHeight > this.lastResizeHeight) {
                    styl.top = nTop + "px";
                    styl.height = nHeight + "px";
                    this.lastResizeHeight = nHeight;
                }
            }
            if (dirs.indexOf("w") != -1) {
                const nLeft = e.detail.x - this.resizeOffsetLeft;
                const nWidth = this.originalWindowRect.right - nLeft;
                if (nWidth > minWidth || nWidth > this.lastResizeWidth) {
                    styl.left = nLeft + "px";
                    styl.width = nWidth + "px";
                    this.lastResizeWidth = nWidth;
                }
            }
            if (dirs.indexOf("s") != -1) {
                const nHeight = e.detail.y + this.resizeOffsetBottom - this.originalWindowRect.top;
                if (nHeight > minHeight || nHeight > this.lastResizeHeight) {
                    styl.height = nHeight + "px";
                    this.lastResizeHeight = nHeight;
                }
            }
            if (dirs.indexOf("e") != -1) {
                const nWidth = e.detail.x + this.resizeOffsetRight - this.originalWindowRect.left;
                if (nWidth > minWidth || nWidth > this.lastResizeWidth) {
                    styl.width = nWidth + "px";
                    this.lastResizeWidth = nWidth;
                }
            }
        }
    }

    show() {
        this.element.style.visibility = "visible";
        this.element.dispatchEvent(new Event("show"));
    }
    hide() {
        this.element.style.visibility = "hidden";
        this.element.dispatchEvent(new Event("hide"));
    }

    setSize(width?: number, height?: number) {
        if (!width && !height) {
            throw "Neither width or height is provided!";
        }
        const styl = this.element.style;
        if (width)
            styl.width = width + "px";
        if (height)
            styl.height = height + "px";
    }

    setDraggable(draggable: boolean) {
        this.options.draggable = draggable;
    }
    setResizable(resizable: boolean) {
        this.options.resizable = resizable;
    }
}