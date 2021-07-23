import { Fragment, render, h } from './preact.js'
import { useReducer, useRef } from './preact-hooks.js'

const MIN_SIZE = 8

function reverse_bits(n) {
  const reversed = (n >>> 0)
    .toString(2)
    .padStart(32, '0')
    .split('')
    .reverse()
    .join('')

  return parseInt(reversed, 2)
}

function nextCursor(cursor, size) {
  cursor = cursor | ~(size - 1)
  cursor = reverse_bits(cursor)
  cursor = cursor + 1
  return reverse_bits(cursor)
}

function isChecked(cursor, size, bucket) {
  cursor = cursor & (size - 1)
  if (cursor === 0) return false
  let next = 0
  do {
    if (next === bucket) return true
    next = nextCursor(next, size)
  } while (next > 0 && next !== cursor)
  return false
}

// https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
function hash (input) {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32bit integer
  }
  return hash >>> 0
}

function reset() {
  const size = MIN_SIZE
  const buckets = {}
  const cursor = 0
  return { buckets, cursor, size }
}

function count(buckets) {
  return Object.values(buckets).reduce((sum, { length }) => (
    sum + length
  ), 0)
}

function resize({ buckets, size, ...rest }) {
  const next = {}
  for (const values of Object.values(buckets)) {
    for (const value of values) {
      const bucket = hash(value) & (size - 1)
      if (!next[bucket]) next[bucket] = []
      next[bucket].push(value)
    }
  }
  return { buckets: next, size, ...rest }
}

function insert({ buckets, size, ...rest }, value) {
  const bucket = hash(value) & (size - 1)
  const values = buckets[bucket] || []
  if (!values.includes(value)) values.push(value)
  buckets = { ...buckets, [bucket]: values }

  if (count(buckets) >= size * 7 / 8) {
    return resize({ buckets, size: size * 2, ...rest })
  }

  return { buckets, size, ...rest }
}

function moveCursor({ cursor, size, ...rest }) {
  return {
    cursor: nextCursor(cursor, size),
    size,
    ...rest
  }
}

function remove({ buckets, size, ...rest }, value) {
  const bucket = hash(value) & (size - 1)
  const values = (buckets[bucket] || []).filter(x => x !== value)
  buckets = { ...buckets, [bucket]: values }

  if (size > MIN_SIZE && count(buckets) <= size / 4) {
    return resize({ buckets, size: size / 2, ...rest })
  }

  return { buckets, size, ...rest }
}

function reducer(state, action) {
  switch (action.type) {
    case 'cursor':
      return moveCursor(state)

    case 'insert':
      return insert(state, action.value)

    case 'remove':
      return remove(state, action.value)
  }
}

function Table() {
  const [{ buckets, cursor, size }, dispatch] = useReducer(reducer, null, reset)
  const inputRef = useRef()

  function insert(event) {
    event.preventDefault()
    const value = inputRef.current?.value || ''
    if (inputRef.current) inputRef.current.value = ''
    dispatch({ type: 'insert', value })
  }

  const bucketElements = []
  for (let bucket = 0; bucket < size; bucket++) {
    const checked = isChecked(cursor, size, bucket)

    bucketElements.push(
      h('div', { class: `bucket ${checked ? 'bucket-checked' : ''}` }, [
        h('span', { class: 'bucket-index' }, bucket),
        h(Fragment, {}, buckets[bucket]?.map(value => (
          h('span', {
            class: 'bucket-value',
            onClick: () => dispatch({ type: 'remove', value }),
          }, value)
        )))
      ])
    )
  }

  return h('div', {}, [
    h('form', { class: 'insert-form', onSubmit: insert }, [
      'Insert a value ',
      h('input', { type: 'text', ref: inputRef }),
    ]),
    ` Cursor: ${cursor} `,
    h('button', {
      onClick: () => dispatch({ type: 'cursor' }),
      type: 'button',
    }, ['Increment']),
    h('div', { class: 'buckets' }, bucketElements)
  ])
}

render(h(Table), document.getElementById('root'))
