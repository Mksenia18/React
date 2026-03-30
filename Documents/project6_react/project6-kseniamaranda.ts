type Dep = { subs: Set<Observer> }
type Observer = { deps: Set<Dep>; run: () => void }

let current: Observer | null = null

function cleanup(obs: Observer) {
  for (const d of obs.deps) d.subs.delete(obs)
  obs.deps.clear()
}

export function signal<T>(initial: T) {
  let value = initial
  const dep: Dep = { subs: new Set() }

  return {
    get value() {
      if (current) {
        dep.subs.add(current)
        current.deps.add(dep)
      }
      return value
    },
    set value(v: T) {
      if (Object.is(v, value)) return
      value = v
      for (const o of [...dep.subs]) o.run()
    },
  }
}

export function computed<T>(fn: () => T) {
  let cached!: T
  const dep: Dep = { subs: new Set() }

  const obs: Observer = {
    deps: new Set(),
    run: () => {
      cleanup(obs)
      const prev = current
      current = obs
      cached = fn()
      current = prev

      for (const o of [...dep.subs]) o.run()
    },
  }

  obs.run()

  return {
    get value() {
      if (current) {
        dep.subs.add(current)
        current.deps.add(dep)
      }
      return cached
    },
  }
}

export function effect(fn: () => void) {
  const obs: Observer = {
    deps: new Set(),
    run: () => {
      cleanup(obs)
      const prev = current
      current = obs
      fn()
      current = prev
    },
  }

  obs.run()
}