import { signal, computed, effect } from './project6-kseniamaranda'

function test(name: string, fn: () => void) {
  try {
    fn()
    console.log(`✓ ${name}`)
  } catch (err) {
    console.error(`✗ ${name}`)
    throw err
  }
}

function assertEqual<T>(actual: T, expected: T) {
  if (!Object.is(actual, expected)) {
    throw new Error(`Expected ${String(expected)} but got ${String(actual)}`)
  }
}

test('signal read/write', () => {
  const count = signal(0)
  assertEqual(count.value, 0)
  count.value = 2
  assertEqual(count.value, 2)
})

test('computed auto-updates', () => {
  const a = signal(1)
  const b = signal(2)
  const sum = computed(() => a.value + b.value)
  assertEqual(sum.value, 3)
  a.value = 5
  assertEqual(sum.value, 7)
})

test('effect re-runs on computed change', () => {
  const a = signal(1)
  const double = computed(() => a.value * 2)
  let runs = 0

  effect(() => {
    double.value
    runs++
  })

  assertEqual(runs, 1)
  a.value = 2
  assertEqual(runs, 2)
})

