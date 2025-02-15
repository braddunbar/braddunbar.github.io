import { render } from 'preact'
import { useRef } from 'preact/hooks'
import { useSignal, useSignalEffect } from '@preact/signals'
import { produce } from 'immer'
import init, { Bradis, JsRespValue } from "bradis-web"

await init()
const bradis = Bradis.create()
const client = bradis.connect()
setInterval(() => { bradis.tick() }, 100)

const RespValue = ({ value }: { value: JsRespValue }) => {
  switch (value.tag) {
    case 'int':
      return `(integer) ${value.value}`
    case 'nil':
      return '(nil)'
    case 'error':
      return `(error) ${value.value}`
    case 'verbatim':
      return <pre><code>{value.value.value}</code></pre>
    case 'string':
      if (value.value === 'OK') return 'OK'
      return `"${value.value}"`
    case 'array':
    case 'push':
      return (
        <ol>
          {value.value.length === 0 ?
            <li>(empty array)</li>
          :
            value.value.map((value) => (
              <li>
                <RespValue value={value} />
              </li>
            ))
          }
        </ol>
      )
    case 'map':
      return (
        <ol>
          {value.value.map(([key, value]) => (
            <li>
              <RespValue value={key} />
              {' => '}
              <RespValue value={value} />
            </li>
          ))}
        </ol>
      )
  }
}

const Repl = () => {
  const input = useRef<HTMLInputElement>(null)
  const items = useSignal<(JsRespValue | string)[]>([])
  const command = useSignal<string>('')

  function onSubmit(event: Event) {
    event.preventDefault()
    const element = input.current
    if (!element) return

    items.value = produce(items.value, (items) => {
      items.push(element.value)
    })

    client.write_inline(element.value)
    command.value = ''
  }

  function onInput() {
    command.value = input.current?.value || ''
  }

  useSignalEffect(() => {
    const interval = setInterval(() => {
      while (true) {
        const value = client.poll()
        if (!value) break
        items.value = produce(items.value, (items) => {
          items.push(value)
        })
      }
    }, 100)

    return () => clearInterval(interval)
  })

  useSignalEffect(() => {
    input.current?.focus()
  })

  return (
    <>
      {items.value.map((item) => {
        if (typeof item === 'string') {
          return <div>{`> ${item}`}</div>
        }

        return (
          <div>
            <RespValue value={item} />
          </div>
        )
      })}
      <form onSubmit={onSubmit}>
        <input ref={input} type="text" onInput={onInput} value={command.value} required />
      </form>
    </>
  )
}

const root = document.querySelector('#root')
if (root instanceof HTMLDivElement) render(<Repl />, root)
