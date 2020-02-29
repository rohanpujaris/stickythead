export function DataStore() {
  return {
    data: function (obj, key, val) {
      if (!obj) {
        return this._data;
      } else if (!key) {
        if (!(obj in this._data)) {
          return {};
        }
        return this._data[obj];
      } else if (arguments.length < 3) {
        if (!(obj in this._data)) {
          return undefined;
        }
        return this._data[obj][key];
      } else {
        if (!(obj in this._data)) {
          this._data[obj] = {};
        }
        this._data[obj][key] = val;
      }
    },
    removeData: function (obj, key) {
      delete this._data[obj]
    },
    _data: {}
  };
}

export function extendObj(defaultObj, overrideObj) {
  var newObj = defaultObj
  Object.keys(overrideObj || {}).forEach(function (k) {
    newObj[k] = overrideObj[k]
  });

  return newObj
}

export function getOffset(el) {
  var rect = el.getBoundingClientRect();
  return {
    top: rect.top + window.pageYOffset,
    left: rect.left + window.pageXOffset,
  };
}

export function getHeight(el) {
  if (el == window) {
    return window.innerHeight
  }
  if (el == document) {
    return Math.max(
      document.documentElement["clientHeight"],
      document.body["scrollHeight"],
      document.documentElement["scrollHeight"],
      document.body["offsetHeight"],
      document.documentElement["offsetHeight"]
    );
  }
  var height = parseFloat(getComputedStyle(el, null).height.replace("px", ""))
  return height ? height : el.offsetHeight
}

export function getWidth(el) {
  if (el == window) {
    return window.innerWidth
  }
  if (el == document) {
    return Math.max(
      document.documentElement["clientWidth"],
      document.body["scrollWidth"],
      document.documentElement["scrollWidth"],
      document.body["offsetWidth"],
      document.documentElement["offsetWidth"]
    );
  }
  var width = parseFloat(getComputedStyle(el, null).width.replace("px", ""))
  return width ? width : el.offsetWidth
}

export function setStyles(el, propertyObject) {
  for (var property in propertyObject)
    el.style[property] = propertyObject[property];
}

export function fireEvent(name, el, data) {
  var details = data ? {} : { details: data }
  var evt = new CustomEvent(name, details)
  el.dispatchEvent(evt)
}
