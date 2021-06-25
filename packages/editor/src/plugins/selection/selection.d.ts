type Intersection = "center" | "cover" | "touch";
type SelectAllSelectors = readonly (string | Element)[] | string | Element;
/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyFunction$0 = (...args: any[]) => any;
type EventMap = Record<string, AnyFunction$0>;
declare class EventTarget<Events extends EventMap> {
    private readonly _listeners;
    addEventListener<K extends keyof Events>(event: K, cb: Events[K]): this;
    removeEventListener<K extends keyof Events>(event: K, cb: Events[K]): this;
    dispatchEvent<K extends keyof Events>(event: K, ...data: Parameters<Events[K]>): unknown;
    unbindAllListeners(): void;
    // Let's also support on, off and emit like node
    /* eslint-disable no-invalid-this */
    on: <K extends keyof Events>(event: K, cb: Events[K]) => this;
    off: <K extends keyof Events>(event: K, cb: Events[K]) => this;
    emit: <K extends keyof Events>(event: K, ...data: Parameters<Events[K]>) => unknown;
}
interface ChangedElements {
    added: Array<Element>;
    removed: Array<Element>;
}
interface SelectionStore {
    touched: Array<Element>;
    stored: Array<Element>;
    selected: Array<Element>;
    changed: ChangedElements;
}
interface SelectionEvent {
    event: MouseEvent | TouchEvent | null;
    store: SelectionStore;
}
type SelectionEvents = {
    beforestart: (e: SelectionEvent) => boolean;
    start: (e: SelectionEvent) => void;
    move: (e: SelectionEvent) => void;
    stop: (e: SelectionEvent) => void;
};
type AreaLocation = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};
interface Coordinates {
    x: number;
    y: number;
}
type TapMode = "touch" | "native";
type OverlapMode = "keep" | "drop" | "invert";
interface Scrolling {
    speedDivider: number;
    manualSpeed: number;
}
interface SingleTap {
    allow: boolean;
    intersect: TapMode;
}
interface SelectionOptions {
    class: string;
    document: Document;
    intersect: Intersection;
    singleTap: SingleTap;
    startThreshold: number | Coordinates;
    allowTouch: boolean;
    overlap: OverlapMode;
    selectables: ReadonlyArray<string>;
    scrolling: Scrolling;
    startareas: ReadonlyArray<string>;
    boundaries: ReadonlyArray<string>;
    container: string | HTMLElement | ReadonlyArray<string | HTMLElement>;
}
interface ScrollEvent extends MouseEvent {
    deltaY: number;
    deltaX: number;
}
declare class SelectionArea extends EventTarget<SelectionEvents> {
    static version: string;
    private readonly _options;
    private _selection;
    private readonly _area;
    private readonly _clippingElement;
    private _targetElement?;
    private _targetRect?;
    private _selectables;
    private readonly _areaRect;
    private _areaLocation;
    private _singleClick;
    private _scrollAvailable;
    private _scrollSpeed;
    private _scrollDelta;
    constructor(opt: Partial<SelectionOptions>);
    _bindStartEvents(activate?: boolean): void;
    _onTapStart(evt: MouseEvent | TouchEvent, silent?: boolean): void;
    _onSingleTap(evt: MouseEvent | TouchEvent): void;
    _delayedTapMove(evt: MouseEvent | TouchEvent): void;
    _prepareSelectionArea(): void;
    _onTapMove(evt: MouseEvent | TouchEvent): void;
    _onScroll(): void;
    _manualScroll(evt: ScrollEvent): void;
    _recalculateSelectionAreaRect(): void;
    _redrawSelectionArea(): void;
    _onTapStop(evt: MouseEvent | TouchEvent | null, silent: boolean): void;
    _updateElementSelection(): void;
    _emitEvent(name: keyof SelectionEvents, evt: MouseEvent | TouchEvent | null): unknown;
    /**
     * Manually triggers the start of a selection
     * @param evt A MouseEvent / TouchEvent -like object
     * @param silent If beforestart should be fired,
     */
    /**
     * Manually triggers the start of a selection
     * @param evt A MouseEvent / TouchEvent -like object
     * @param silent If beforestart should be fired,
     */
    trigger(evt: MouseEvent | TouchEvent, silent?: boolean): void;
    /**
     * Can be used if during a selection elements have been added.
     * Will update everything which can be selected.
     */
    /**
     * Can be used if during a selection elements have been added.
     * Will update everything which can be selected.
     */
    resolveSelectables(): void;
    /**
     * Saves the current selection for the next selecion.
     * Allows multiple selections.
     */
    /**
     * Saves the current selection for the next selecion.
     * Allows multiple selections.
     */
    keepSelection(): void;
    /**
     * Clear the elements which where saved by 'keepSelection()'.
     * @param store If the store should also get cleared
     */
    /**
     * Clear the elements which where saved by 'keepSelection()'.
     * @param store If the store should also get cleared
     */
    clearSelection(store?: boolean): void;
    /**
     * @returns {Array} Selected elements
     */
    /**
     * @returns {Array} Selected elements
     */
    getSelection(): Array<Element>;
    /**
     * @returns {HTMLElement} The selection area element
     */
    /**
     * @returns {HTMLElement} The selection area element
     */
    getSelectionArea(): HTMLElement;
    /**
     * Cancel the current selection process.
     * @param keepEvent {boolean} true to fire the onStop listener after cancel.
     */
    /**
     * Cancel the current selection process.
     * @param keepEvent {boolean} true to fire the onStop listener after cancel.
     */
    cancel(keepEvent?: boolean): void;
    /**
     * Unbinds all events and removes the area-element.
     */
    /**
     * Unbinds all events and removes the area-element.
     */
    destroy(): void;
    /**
     * Disable the selection functinality.
     */
    disable: () => void;
    /**
     * Disable the selection functinality.
     */
    enable: (activate?: boolean) => void;
    /**
     * Adds elements to the selection
     * @param query - CSS Query, can be an array of queries
     * @param quiet - If this should not trigger the move event
     */
    /**
     * Adds elements to the selection
     * @param query - CSS Query, can be an array of queries
     * @param quiet - If this should not trigger the move event
     */
    select(query: SelectAllSelectors, quiet?: boolean): Array<Element>;
    /**
     * Removes an particular element from the selection.
     * @param el - Element to remove.
     * @param quiet - If this should not trigger the move event
     * @returns boolean - true if the element was successfully removed
     */
    /**
     * Removes an particular element from the selection.
     * @param el - Element to remove.
     * @param quiet - If this should not trigger the move event
     * @returns boolean - true if the element was successfully removed
     */
    deselect(el: Element, quiet?: boolean): boolean;
}
export { ChangedElements, SelectionStore, SelectionEvent, SelectionEvents, AreaLocation, Coordinates, TapMode, OverlapMode, Scrolling, SingleTap, SelectionOptions, ScrollEvent, SelectionArea as default };
