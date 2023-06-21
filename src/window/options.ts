export default interface WindowOptions {
    titlebarSelector?: string,
    titlebarNoDragSelector?: string,
    width?: number,
    height?: number,
    minWidth?: number,
    minHeight?: number,
    maxWidth?: number,
    maxHeight?: number,
    draggable?: boolean,
    resizable?: boolean,
    resizeRegionWidth?: number;
}

export const defaultOptions: WindowOptions = {
    titlebarSelector: ".titlebar",
    titlebarNoDragSelector: ".no-drag",
    draggable: true,
    resizable: true,
    resizeRegionWidth: 5
};