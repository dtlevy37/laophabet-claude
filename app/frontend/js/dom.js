// Tiny element builder: h('div', {class: 'x', onclick: fn}, child, [children], 'text')
export function h(tag, props, ...kids) {
  const el = document.createElement(tag)
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue
    if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v)
    else if (k === 'class') el.className = v
    else if (k in el) el[k] = v
    else el.setAttribute(k, v === true ? '' : v)
  }
  append(el, kids)
  return el
}

function append(el, kids) {
  for (const k of kids) {
    if (k == null || k === false) continue
    if (Array.isArray(k)) append(el, k)
    else el.append(k.nodeType ? k : document.createTextNode(String(k)))
  }
}

// A group of radio buttons. Returns {el, get(), set(v)}.
export function radios(name, options, { vertical = false, onChange } = {}) {
  let value = null
  const inputs = new Map()
  const el = h(
    'div',
    { class: vertical ? 'col' : 'row' },
    options.map((o) => {
      const input = h('input', {
        type: 'radio',
        name,
        onchange: () => {
          value = o.value
          if (onChange) onChange(value)
        },
      })
      inputs.set(o.value, input)
      return h('label', { class: vertical ? 'check' : 'pill' }, input, ' ', o.label)
    }),
  )
  return {
    el,
    get: () => value,
    set(v) {
      value = v
      if (inputs.has(v)) inputs.get(v).checked = true
    },
  }
}

export function fieldset(legend, ...kids) {
  return h('fieldset', null, h('legend', null, legend), kids)
}
