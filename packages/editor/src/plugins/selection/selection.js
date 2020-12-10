// https://github.com/Simonwep/selection v1.7.1
import {
  css,
  eventPath,
  intersects,
  off,
  on,
  removeElement,
  selectAll,
  simplifyEvent,
} from './utils';

// Some var shorting for better compression and readability
const { abs, max, min, round, ceil } = Math;
const preventDefault = (e) => e.preventDefault();

// Edge < 79 uses the unofficial name ClienRect
const DOMRect =
  typeof window.DOMRect === 'undefined'
    ? window.ClientRect
    : window.DOMRect;

/* eslint-disable new-cap */
function Selection(options = {}) {
  const that = {
    options: Object.assign(
      {
        class: 'selection-area',
        frame: document,
        mode: 'touch',
        firstItemMode: 'touch',
        tapMode: 'native',
        startThreshold: 10,
        singleClick: true,
        disableTouch: false,

        selectables: [],
        scrollSpeedDivider: 10,
        manualScrollSpeed: 750,

        startareas: ['html'],
        boundaries: ['html'],
        selectionAreaContainer: 'body',
      },
      options,
    ),

    // Store for keepSelection
    _stored: [],
    _selectables: [],
    _selected: [], // Currently touched elements
    _changed: {
      added: [], // Added elements since last selection
      removed: [], // Removed elements since last selection
    },

    // Evenlistener name: [callbacks]
    _eventListener: {
      beforestart: [],
      start: [],
      move: [],
      stop: [],
    },

    // Create area element
    _area: null,
    _areaDomRect: null, // Caches the position of the selection-area
    _clippingElement: null,

    // Is getting set on movement. Varied.
    _scrollAvailable: true,
    _scrollSpeed: { x: null, y: null },

    _init() {
      const { frame } = that.options;
      that._area = frame.createElement('div');
      that._clippingElement = frame.createElement('div');
      that._clippingElement.appendChild(that._area);

      // Add class to the area element
      that._area.classList.add(that.options.class);

      // Apply basic styles to the area element
      css(that._area, {
        willChange: 'top, left, bottom, right, width, height',
        top: 0,
        left: 0,
        position: 'fixed',
      });

      css(that._clippingElement, {
        overflow: 'hidden',
        position: 'fixed',
        transform: 'translate3d(0, 0, 0)', // https://stackoverflow.com/a/38268846
        pointerEvents: 'none',
        zIndex: '1',
      });

      that.enable();
    },

    _bindStartEvents(type) {
      const { frame } = that.options;
      const fn = type === 'on' ? on : off;
      fn(frame, 'mousedown', that._onTapStart);

      if (!that.options.disableTouch) {
        fn(frame, 'touchstart', that._onTapStart, {
          passive: false,
        });
      }
    },

    _onTapStart(evt, silent = false) {
      const { x, y, target } = simplifyEvent(evt);
      const { startareas, boundaries, frame } = that.options;
      const targetBoundingClientRect = target.getBoundingClientRect();

      // Find start-areas and boundaries
      const startAreas = selectAll(startareas, frame);
      that._boundaries = selectAll(boundaries, frame);

      // Check in which container the user currently acts
      that._targetContainer = that._boundaries.find((el) =>
        intersects(
          el.getBoundingClientRect(),
          targetBoundingClientRect,
        ),
      );

      // Check if area starts in one of the start areas / boundaries
      const evtpath = eventPath(evt);
      if (
        !that._targetContainer ||
        !startAreas.find((el) => evtpath.includes(el)) ||
        !that._boundaries.find((el) => evtpath.includes(el))
      ) {
        return;
      }

      if (!silent && that._emit('beforestart', evt) === false) {
        return;
      }

      // Area start point
      that._ax1 = x;
      that._ay1 = y;

      // Area end point
      that._ax2 = 0;
      that._ay2 = 0;

      // To detect single-click
      that._singleClick = true;
      that.clearSelection(false);

      // Prevent default select event
      // on(frame, 'selectstart', preventDefault);

      // Add listener
      on(frame, ['touchmove', 'mousemove'], that._delayedTapMove, {
        passive: false,
      });
      on(
        frame,
        ['mouseup', 'touchcancel', 'touchend'],
        that._onTapStop,
      );

      // Firefox will scroll down the page which would break the selection.
      // evt.preventDefault();
    },

    _onSingleTap(evt) {
      const { tapMode } = that.options;
      const spl = simplifyEvent(evt);
      let target = null;

      if (tapMode === 'native') {
        target = spl.target;
      } else if (tapMode === 'touch') {
        that.resolveSelectables();

        const { x, y } = spl;
        target = that._selectables.find((v) => {
          const {
            right,
            left,
            top,
            bottom,
          } = v.getBoundingClientRect();
          return x < right && x > left && y < bottom && y > top;
        });
      } else {
        throw new Error(`Unknown tapMode option: ${tapMode}`);
      }

      if (!target) {
        return false;
      }

      /**
       * Resolve selectables again.
       * If the user starded in a scrollable area they will be reduced
       * to the current area. Prevent the exclusion of these if a range-selection
       * gets performed.
       */
      that.resolveSelectables();

      // Traverse dom upwards to check if target is selectable
      while (!that._selectables.includes(target)) {
        if (!target.parentElement) {
          return;
        }

        target = target.parentElement;
      }

      that._emit('start', evt);
      const stored = that._stored;
      if (evt.shiftKey && stored.length) {
        const reference = stored[stored.length - 1];

        // Resolve correct range
        const [preceding, following] =
          reference.compareDocumentPosition(target) & 4
            ? [target, reference]
            : [reference, target];

        const rangeItems = [
          ...that._selectables.filter(
            (el) =>
              el.compareDocumentPosition(preceding) & 4 &&
              el.compareDocumentPosition(following) & 2,
          ),
          target,
        ];

        that.select(rangeItems);
        that._emit('move', evt);
        that._emit('stop', evt);
      } else {
        if (that._stored.includes(target)) {
          that.removeFromSelection(target);
        } else {
          that.select(target);
        }

        that._emit('move', evt);
        that._emit('stop', evt);
      }
    },

    _delayedTapMove(evt) {
      const { x, y } = simplifyEvent(evt);
      const { startThreshold, frame } = that.options;
      const { _ax1, _ay1 } = that; // Coordinates of first "tap"

      // Check pixel threshold
      const thresholdType = typeof startThreshold;
      if (
        (thresholdType === 'number' &&
          abs(x + y - (_ax1 + _ay1)) >= startThreshold) ||
        (thresholdType === 'object' &&
          abs(x - _ax1) >= startThreshold.x) ||
        abs(y - _ay1) >= startThreshold.y
      ) {
        off(frame, ['mousemove', 'touchmove'], that._delayedTapMove, {
          passive: false,
        });
        on(frame, ['mousemove', 'touchmove'], that._onTapMove, {
          passive: false,
        });

        // Make area element visible
        css(that._area, 'display', 'block');

        // Apppend selection-area to the dom
        selectAll(
          that.options.selectionAreaContainer,
          frame,
        )[0].appendChild(that._clippingElement);

        // Now after the threshold is reached resolve all selectables
        that.resolveSelectables();

        // An action is recognized as single-select until the user performed a mutli-selection
        that._singleClick = false;

        // Just saving the boundaries of this container for later
        const tb = (that._targetBoundary = that._targetContainer.getBoundingClientRect());

        // Find container and check if it's scrollable
        if (
          round(that._targetContainer.scrollHeight) !==
            round(tb.height) ||
          round(that._targetContainer.scrollWidth) !== round(tb.width)
        ) {
          // Indenticates if the user is currently in a scrollable area
          that._scrollAvailable = true;

          // Detect mouse scrolling
          on(window, 'wheel', that._manualScroll, { passive: false });

          /**
           * The selection-area will also cover other element which are
           * out of the current scrollable parent. So find all elements
           * which are in the current scrollable element. Later these are
           * the only selectables instead of all.
           */
          that._selectables = that._selectables.filter((s) =>
            that._targetContainer.contains(s),
          );

          /**
           * To clip the area, the selection area has a parent
           * which has exact the same dimensions as the scrollable elemeent.
           * Now if the area exeeds these boundaries it will be cropped.
           */
          css(that._clippingElement, {
            top: tb.top,
            left: tb.left,
            width: tb.width,
            height: tb.height,
          });

          /**
           * The area element is relative to the clipping element,
           * but when this is moved or transformed we need to correct
           * the positions via a negative margin.
           */
          css(that._area, {
            marginTop: -tb.top,
            marginLeft: -tb.left,
          });
        } else {
          that._scrollAvailable = false;

          /**
           * Reset margin and clipping element dimensions.
           */
          css(that._clippingElement, {
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          });

          css(that._area, {
            marginTop: 0,
            marginLeft: 0,
          });
        }

        // Trigger recalc and fire event
        that._onTapMove(evt);
        that._emit('start', evt);
      }

      // evt.preventDefault(); // Prevent swipe-down refresh
    },

    _onTapMove(evt) {
      const { x, y } = simplifyEvent(evt);
      const { scrollSpeedDivider } = that.options;
      const scon = that._targetContainer;
      let ss = that._scrollSpeed;
      that._ax2 = x;
      that._ay2 = y;

      if (that._scrollAvailable && (ss.y !== null || ss.x !== null)) {
        // Continous scrolling
        requestAnimationFrame(function scroll() {
          // Make sure that ss is not outdated
          ss = that._scrollSpeed;
          const scrollY = ss.y !== null;
          const scrollX = ss.x !== null;

          // Scrolling is not anymore required
          if (!scrollY && !scrollX) {
            return;
          }

          /**
           * If the value exeeds the scrollable area it will
           * be set to the max / min value. So change only
           */
          const { scrollTop, scrollLeft } = scon;

          // Reduce velocity, use ceil in both directions to scroll at least 1px per frame
          if (scrollY) {
            scon.scrollTop += ceil(ss.y / scrollSpeedDivider);
            that._ay1 -= scon.scrollTop - scrollTop;
          }

          if (scrollX) {
            scon.scrollLeft += ceil(ss.x / scrollSpeedDivider);
            that._ax1 -= scon.scrollLeft - scrollLeft;
          }

          /**
           * We changed the start coordinates -> redraw the selectiona area
           * We changed the dimensions of the area element -> re-calc selected elements
           * The selected elements array has been changed -> fire event
           */
          that._recalcAreaRect();
          that._updatedTouchingElements();
          that._emit('move', evt);
          that._redrawArea();

          // Keep scrolling even if the user stops to move his pointer
          requestAnimationFrame(scroll);
        });
      } else {
        /**
         * Perform redraw only if scrolling is not active.
         * If scrolling is active this area is getting re-dragwed by the
         * anonymized scroll function.
         */
        that._recalcAreaRect();
        that._updatedTouchingElements();
        that._emit('move', evt);
        that._redrawArea();
      }

      evt.preventDefault(); // Prevent swipe-down refresh
    },

    _manualScroll(evt) {
      const { manualScrollSpeed } = that.options;

      // Consistent scrolling speed on all browsers
      const deltaY = evt.deltaY ? (evt.deltaY > 0 ? 1 : -1) : 0;
      const deltaX = evt.deltaX ? (evt.deltaX > 0 ? 1 : -1) : 0;
      that._scrollSpeed.y += deltaY * manualScrollSpeed;
      that._scrollSpeed.x += deltaX * manualScrollSpeed;
      that._onTapMove(evt);

      // Prevent defaul scrolling behaviour, eg. page scrolling
      evt.preventDefault();
    },

    _recalcAreaRect() {
      const {
        scrollTop,
        scrollHeight,
        clientHeight,
        scrollLeft,
        scrollWidth,
        clientWidth,
      } = that._targetContainer;
      const brect = that._targetBoundary;
      const ss = that._scrollSpeed;
      let x = that._ax2;
      let y = that._ay2;

      if (x < brect.left) {
        ss.x = scrollLeft ? -abs(brect.left - x) : null;
        x = brect.left;
      } else if (x > brect.left + brect.width) {
        ss.x =
          scrollWidth - scrollLeft - clientWidth
            ? abs(brect.left + brect.width - x)
            : null;
        x = brect.left + brect.width;
      } else {
        ss.x = null;
      }

      if (y < brect.top) {
        ss.y = scrollTop ? -abs(brect.top - y) : null;
        y = brect.top;
      } else if (y > brect.top + brect.height) {
        ss.y =
          scrollHeight - scrollTop - clientHeight
            ? abs(brect.top + brect.height - y)
            : null;
        y = brect.top + brect.height;
      } else {
        ss.y = null;
      }

      const x3 = min(that._ax1, x);
      const y3 = min(that._ay1, y);
      const x4 = max(that._ax1, x);
      const y4 = max(that._ay1, y);
      that._areaDomRect = new DOMRect(x3, y3, x4 - x3, y4 - y3);
    },

    _redrawArea() {
      const { x, y, width, height } = that._areaDomRect;
      const areaStyle = that._area.style;

      // It's generally faster to not use es6-templates
      // It's also faster to manually change the properties instead of calling Object.assign
      /* eslint prefer-template: "off" */
      areaStyle.transform = 'translate3d(' + x + 'px,' + y + 'px, 0)';
      areaStyle.width = width + 'px';
      areaStyle.height = height + 'px';
    },

    _onTapStop(evt, noevent) {
      const { frame, singleClick } = that.options;

      // Remove event handlers
      off(frame, ['mousemove', 'touchmove'], that._delayedTapMove);
      off(frame, ['touchmove', 'mousemove'], that._onTapMove);
      off(
        frame,
        ['mouseup', 'touchcancel', 'touchend'],
        that._onTapStop,
      );

      if (evt && that._singleClick && singleClick) {
        that._onSingleTap(evt);
      } else if (!that._singleClick && !noevent) {
        that._updatedTouchingElements();
        that._emit('stop', evt);
      }

      // Reset scroll speed
      that._scrollSpeed = { x: null, y: null };

      // Unbind mouse scrolling listener
      off(window, 'wheel', that._manualScroll);

      // Remove selection-area from dom
      that._clippingElement.remove();

      // Enable default select event
      off(frame, 'selectstart', preventDefault);
      css(that._area, 'display', 'none');
    },

    _updatedTouchingElements() {
      const { _selected, _selectables, options, _areaDomRect } = that;
      const { mode, firstItemMode } = options;

      // Update
      const touched = [];
      const added = [];
      const removed = [];

      // Itreate over the selectable elements
      for (let i = 0; i < _selectables.length; i++) {
        const node = _selectables[i];

        // Check if area intersects element
        const intersectsMode =
          _selected.length === 0 ? firstItemMode : mode;
        if (
          intersects(
            _areaDomRect,
            node.getBoundingClientRect(),
            intersectsMode,
          )
        ) {
          // Check if the element wasn't present in the last selection.
          if (!_selected.includes(node)) {
            added.push(node);
          }

          touched.push(node);
        }
      }

      // Check which elements where removed since last selection
      for (let i = 0; i < _selected.length; i++) {
        const el = _selected[i];
        if (!touched.includes(el)) {
          removed.push(el);
        }
      }

      // Save
      that._selected = touched;
      that._changed = { added, removed };
    },

    _emit(event, evt) {
      let ok = true;

      for (const listener of that._eventListener[event]) {
        ok =
          listener.call(that, {
            inst: that,
            area: that._area,
            selected: that._selected.concat(that._stored),
            changed: that._changed,
            oe: evt,
          }) && ok;
      }

      return ok;
    },

    /**
     * Manually triggers the start of a selection
     * @param evt A MouseEvent / TouchEvent -like object
     * @param silent If beforestart should be fired,
     */
    trigger(evt, silent = true) {
      that._onTapStart(evt, silent);
    },

    /**
     * Adds an eventlistener
     * @param event
     * @param cb
     */
    on(event, cb) {
      that._eventListener[event].push(cb);
      return that;
    },

    /**
     * Removes an event listener
     * @param event
     * @param cb
     */
    off(event, cb) {
      const callBacks = that._eventListener[event];

      if (callBacks) {
        const index = callBacks.indexOf(cb);

        if (~index) {
          callBacks.splice(index, 1);
        }
      }

      return that;
    },

    /**
     * Can be used if during a selection elements have been added.
     * Will update everything which can be selected.
     */
    resolveSelectables() {
      // Resolve selectors
      that._selectables = selectAll(
        that.options.selectables,
        that.options.frame,
      );
    },

    /**
     * Saves the current selection for the next selecion.
     * Allows multiple selections.
     */
    keepSelection() {
      const { _selected, _stored } = that;

      for (let i = 0; i < _selected.length; i++) {
        const el = _selected[i];
        if (!_stored.includes(el)) {
          _stored.push(el);
        }
      }
    },

    /**
     * Clear the elements which where saved by 'keepSelection()'.
     * @param store If the store should also get cleared
     */
    clearSelection(store = true) {
      store && (that._stored = []);
      that._selected = [];
      that._changed.added = [];
      that._changed.removed = [];
    },

    /**
     * Removes an particular element from the selection.
     */
    removeFromSelection(el) {
      that._changed.removed.push(el);
      removeElement(that._stored, el);
      removeElement(that._selected, el);
    },

    /**
     * @returns {Array} Selected elements
     */
    getSelection() {
      return that._stored;
    },

    /**
     * Cancel the current selection process.
     * @param keepEvent {boolean} true to fire the onStop listener after cancel.
     */
    cancel(keepEvent = false) {
      that._onTapStop(null, !keepEvent);
    },

    /**
     * Set or get an option.
     * @param   {string} name
     * @param   {*}      value
     * @return  {*}      the new value
     */
    option(name, value) {
      const { options } = that;
      return value === undefined
        ? options[name]
        : (options[name] = value);
    },

    /**
     * Disable the selection functinality.
     */
    disable() {
      that._bindStartEvents('off');
    },

    /**
     * Unbinds all events and removes the area-element
     */
    destroy() {
      that.disable();
      that._clippingElement.remove();
    },

    /**
     * Disable the selection functinality.
     */
    enable() {
      that._bindStartEvents('on');
    },

    /**
     * Manually select elements
     * @param query - CSS Query, can be an array of queries
     */
    select(query) {
      const { _selected, _stored, options } = that;
      const elements = selectAll(query, options.frame).filter(
        (el) => !_selected.includes(el) && !_stored.includes(el),
      );

      that._selected.push(...elements);
      that._changed.added.push(...elements);
      return elements;
    },
  };

  // Initialize
  that._init();

  return that;
}

// Export utils
Selection.utils = {
  on,
  off,
  css,
  intersects,
  selectAll,
  eventPath,
  removeElement,
};

/**
 * Create selection instance
 * @param {Object} [options]
 */
Selection.create = (options) => Selection(options);
export default Selection;
