import * as Util from './util'
import CustomEventPolyfill from './custom_event_polyfill'

var dataStore = Util.DataStore();
CustomEventPolyfill()

export function apply(elements, options) {
  var name = 'stickyThead',
    id = 0,
    defaults = {
      fixedOffset: 0,
      leftOffset: 0,
      marginTop: 0,
      objDocument: document,
      objHead: document.head,
      objWindow: window,
      scrollableArea: window,
      cacheHeaderHeight: false,
      zIndex: 3
    };

  function Plugin(el, options) {
    // To avoid scope issues, use 'base' instead of 'this'
    // to reference this class from internal events and functions.
    var base = this;

    // Access to jQuery and DOM versions of element
    // base.$el = $(el);
    base.el = el;
    base.id = id++;

    // Cache DOM refs for performance reasons
    base.$clonedHeader = null;
    base.$originalHeader = null;

    // Cache header height for performance reasons
    base.cachedHeaderHeight = null;

    // Keep track of state
    base.isSticky = false;
    base.hasBeenSticky = false;
    base.leftOffset = null;
    base.topOffset = null;

    base.init = function () {
      base.setOptions(options);

      // base.$el.each(function () {
      // var $this = $(this);

      // remove padding on <table> to fix issue #7
      base.el.style.padding = '0px';

      base.$originalHeader = base.el.querySelector('thead');
      base.$clonedHeader = base.$originalHeader.cloneNode(true);
      // dispatchEvent
      Util.fireEvent('clonedHeader.' + name, base.el, base.$clonedHeader)

      base.$clonedHeader.setAttribute('class', 'tableFloatingHeader');
      Util.setStyles(base.$clonedHeader, { display: 'none', opacity: 0 })

      base.$originalHeader.setAttribute('class', 'tableFloatingHeaderOriginal');

      base.$originalHeader.insertAdjacentElement('afterend', base.$clonedHeader);

      var style = document.createElement('style')
      style.setAttribute('type', 'text/css')
      style.setAttribute('media', 'print')
      style.innerHTML = '.tableFloatingHeader{display:none !important;}' +
        '.tableFloatingHeaderOriginal{position:static !important;}'
      base.$printStyle = style
      base.$head.appendChild(base.$printStyle);


      base.$clonedHeader.querySelectorAll("input, select").forEach(function (el) {
        el.setAttribute("disabled", true);
      })

      base.updateWidth();
      base.toggleHeaders();
      base.bind();
    };

    base.destroy = function () {
      base.el && base.el.removeEventListener('destroyed', base.teardown);
      base.teardown();
    };

    base.teardown = function () {
      if (base.isSticky) {
        Util.setStyles(base.$originalHeader, { position: 'static' });
      }
      dataStore.remove(base.el, name)
      base.unbind();

      base.$clonedHeader.parentNode.removeChild(base.$clonedHeader);
      base.$originalHeader.classList.remove('tableFloatingHeaderOriginal');
      Util.setStyles(base.$originalHeader, { visibility: 'visible' });
      base.$printStyle.parentNode.removeChild(base.$printStyle);

      base.el = null;
      base.$el = null;
    };

    base.bind = function () {
      base.$scrollableArea.addEventListener('scroll', base.toggleHeaders);
      if (!base.isWindowScrolling) {
        base.$window.addEventListener('scroll', base.setPositionValues);
        base.$window.addEventListener('resize', base.toggleHeaders);
      }
      base.$scrollableArea.addEventListener('resize', base.toggleHeaders);
      base.$scrollableArea.addEventListener('resize', base.updateWidth);
    };

    base.unbind = function () {
      // unbind window events by specifying handle so we don't remove too much
      base.$scrollableArea.removeEventListener('scroll', base.toggleHeaders);
      if (!base.isWindowScrolling) {
        base.$window.removeEventListener('scroll', base.setPositionValues);
        base.$window.removeEventListener('resize', base.toggleHeaders);
      }
      base.$scrollableArea.removeEventListener('resize', base.updateWidth);
    };

    // We debounce the functions bound to the scroll and resize events
    base.debounce = function (fn, delay) {
      var timer = null;
      return function () {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
          fn.apply(context, args);
        }, delay);
      };
    };

    base.toggleHeaders = base.debounce(function () {
      if (base.el) {
        var newLeft,
          newTopOffset = base.isWindowScrolling ? (
            isNaN(base.options.fixedOffset) ?
              base.options.fixedOffset.offsetHeight :
              base.options.fixedOffset
          ) :
            Util.getOffset(base.$scrollableArea).top + (!isNaN(base.options.fixedOffset) ? base.options.fixedOffset : 0),
          offset = Util.getOffset(base.el),

          scrollTop = base.$scrollableArea.pageYOffset + newTopOffset,
          scrollLeft = base.$scrollableArea.pageXOffset,
          headerHeight,

          scrolledPastTop = base.isWindowScrolling ?
            scrollTop > offset.top :
            newTopOffset > offset.top,
          notScrolledPastBottom;

        if (scrolledPastTop) {
          headerHeight = base.options.cacheHeaderHeight ? base.cachedHeaderHeight : Util.getHeight(base.$originalHeader);
          notScrolledPastBottom = (base.isWindowScrolling ? scrollTop : 0) <
            (offset.top + Util.getHeight(base.el) - headerHeight - (base.isWindowScrolling ? 0 : newTopOffset));
        }

        if (scrolledPastTop && notScrolledPastBottom) {
          newLeft = offset.left - scrollLeft + base.options.leftOffset;
          Util.setStyles(base.$originalHeader, {
            position: 'fixed',
            marginTop: base.options.marginTop + 'px',
            top: 0,
            left: newLeft + 'px',
            zIndex: base.options.zIndex
          });
          base.leftOffset = newLeft;
          base.topOffset = newTopOffset;
          base.$clonedHeader.style.display = '';
          if (!base.isSticky) {
            base.isSticky = true;
            // make sure the width is correct: the user might have resized the browser while in static mode
            base.updateWidth();
            Util.fireEvent('enabledStickiness.' + name, base.el)
          }
          base.setPositionValues();
        } else if (base.isSticky) {
          base.$originalHeader.style.position = 'static';
          base.$clonedHeader.style.display = 'none';
          base.isSticky = false;
          base.resetWidth(base.$clonedHeader.querySelectorAll('td,th'), base.$originalHeader.querySelectorAll('td,th'));
          Util.fireEvent('disabledStickiness.' + name, base.el)
        }
      }
    }, 0);

    base.setPositionValues = base.debounce(function () {
      var winScrollTop = base.$window.pageYOffset,
        winScrollLeft = base.$window.pageXOffset;

      if (!base.isSticky ||
        winScrollTop < 0 || winScrollTop + Util.getHeight(base.$window) > Util.getHeight(base.$document) ||
        winScrollLeft < 0 || winScrollLeft + Util.getWidth(base.$window) > Util.getWidth(base.$document)) {
        return;
      }
      Util.setStyles(base.$originalHeader, {
        top: base.topOffset - (base.isWindowScrolling ? 0 : winScrollTop) + 'px',
        left: base.leftOffset - (base.isWindowScrolling ? 0 : winScrollLeft) + 'px'
      });
    }, 0);

    base.updateWidth = base.debounce(function () {
      if (!base.isSticky) {
        return;
      }
      // Copy cell widths from clone
      if (!base.$originalHeaderCells) {
        base.$originalHeaderCells = base.$originalHeader.querySelectorAll('th,td');
      }
      if (!base.$clonedHeaderCells) {
        base.$clonedHeaderCells = base.$clonedHeader.querySelectorAll('th,td');
      }
      var cellWidths = base.getWidth(base.$clonedHeaderCells);
      base.setWidth(cellWidths, base.$clonedHeaderCells, base.$originalHeaderCells);

      // Copy row width from whole table
      base.$originalHeader.style.width = Util.getWidth(base.$clonedHeader);

      // If we're caching the height, we need to update the cached value when the width changes
      if (base.options.cacheHeaderHeight) {
        base.cachedHeaderHeight = Util.getHeight(base.$clonedHeader);
      }
    }, 0);

    base.getWidth = function ($clonedHeaders) {
      var widths = [];
      $clonedHeaders.forEach(function (el, index) {
        var width;

        if (getComputedStyle(el).boxSizing === 'border-box') {
          var boundingClientRect = el.getBoundingClientRect();
          if (boundingClientRect.width) {
            width = boundingClientRect.width; // #39: border-box bug
          } else {
            width = boundingClientRect.right - boundingClientRect.left; // ie8 bug: getBoundingClientRect() does not have a width property
          }
        } else {
          var $origTh = base.$originalHeader.querySelector('th');
          if ($origTh.style.borderCollapse === 'collapse') {
            if (window.getComputedStyle) {
              width = parseFloat(window.getComputedStyle(el, null).width);
            } else {
              // ie8 only
              var leftPadding = parseFloat(el.style.paddingLeft);
              var rightPadding = parseFloat(el.style.paddingRight);
              // Needs more investigation - this is assuming constant border around this cell and it's neighbours.
              var border = parseFloat(el.style.borderWidth);
              width = el.offsetWidth - leftPadding - rightPadding - border;
            }
          } else {
            width = Util.getWidth(el);
          }
        }

        widths[index] = width;
      });
      return widths;
    };

    base.setWidth = function (widths, $clonedHeaders, $origHeaders) {
      $clonedHeaders.forEach(function (_, index) {
        var width = widths[index];
        Util.setStyles($origHeaders[index], {
          minWidth: width + 'px',
          maxWidth: width + 'px'
        });
      });
    };

    base.resetWidth = function ($clonedHeaders, $origHeaders) {
      $clonedHeaders.forEach(function (_, index) {
        Util.setStyles($origHeaders[index], {
          minWidth: el.style.minWidth,
          maxWidth: el.style.maxWidth
        });
      });
    };

    base.setOptions = function (options) {
      base.options = Util.extendObj(defaults, options);
      base.$window = base.options.objWindow;
      base.$head = base.options.objHead;
      base.$document = base.options.objDocument;
      base.$scrollableArea = base.options.scrollableArea;
      base.isWindowScrolling = base.$scrollableArea === base.$window;
    };

    base.updateOptions = function (options) {
      base.setOptions(options);
      // scrollableArea might have changed
      base.unbind();
      base.bind();
      base.updateWidth();
      base.toggleHeaders();
    };

    // Listen for destroyed, call teardown
    base.el.addEventListener('destroyed', base.teardown.bind(base));

    // Run initializer
    base.init();
  }

  return elements.forEach(function (element) {
    var instance = dataStore.get(element, name)
    if (instance) {
      if (typeof options === 'string') {
        instance[options].apply(instance);
      } else {
        instance.updateOptions(options);
      }
    } else if (options !== 'destroy') {
      dataStore.put(element, name, new Plugin(element, options));
    }
  });
}
