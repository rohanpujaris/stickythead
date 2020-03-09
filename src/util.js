export function DataStore() {
  return {
    _storage: new WeakMap(),
    put: function (element, key, obj) {
      if (!this._storage.has(element)) {
        this._storage.set(element, new Map());
      }
      this._storage.get(element).set(key, obj);
    },
    get: function (element, key) {
      let data = this._storage.get(element)
      return data && data.get(key);
    },
    remove: function (element, key) {
      let data = this._storage.get(element)
      if (!data) { return }
      let ret = data.delete(key);
      if (!data.size === 0) {
        this._storage.delete(element);
      }
      return ret;
    }
  }
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
