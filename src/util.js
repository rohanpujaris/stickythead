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
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
  };
}

export function getHeight(el) {
  if (el == window) {
    return window.innerHeight
  }
  if (el == document) {
    el = document.body
  }
  return parseFloat(getComputedStyle(el, null).height.replace("px", ""))
}

export function getWidth(el) {
  if (el == window) {
    return window.innerWidth
  }
  if (el == document) {
    el = document.body
  }
  return parseFloat(getComputedStyle(el, null).width.replace("px", ""))
}

export function setStyles(el, propertyObject) {
  for (var property in propertyObject)
    el.style[property] = propertyObject[property];
}

