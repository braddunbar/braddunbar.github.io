import { render } from 'preact'
import { useEffect, useRef } from 'preact/hooks'
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
      return value.value.value
    case 'string':
      if (value.value === 'OK') return 'OK'
      return `"${value.value}"`
    case 'array':
    case 'push':
      return (
        <ol class={value.tag}>
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
        <ol class="map">
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
  const history = useRef<HTMLDivElement>(null)

  function scroll() {
    if (!history.current) return
    history.current.scrollTop = history.current.scrollHeight
  }

  function run(value: string) {
    items.value = produce(items.value, (items) => {
      items.push(value)
    })
    client.write_inline(value)
  }

  function onSubmit(event: Event) {
    event.preventDefault()
    run(command.value)
    command.value = ''
    scroll()
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
    if (items.value.length === 0) return
    scroll()
  })

  useEffect(() => {
    run('hello 3')
  }, [])

  return (
    <div class="repl">
      <div class="repl-history" ref={history} onClick={() => input.current?.focus()}>
        {items.value.map((item) => {
          if (typeof item === 'string') {
            return <div class="repl-history-command">{`> ${item}`}</div>
          }

          return (
            <div class="repl-history-reply">
              <RespValue value={item} />
            </div>
          )
        })}
      </div>
      <form onSubmit={onSubmit}>
        <input spellcheck={false} class="repl-input" ref={input} type="text" onInput={onInput} value={command.value} required />
      </form>
    </div>
  )
}

const root = document.querySelector('#repl')
if (root instanceof HTMLDivElement) render(<Repl />, root)
