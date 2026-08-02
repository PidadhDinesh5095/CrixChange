// compensation.js
// A saga-style compensation stack. Push an undo function ONLY after a step
// succeeds. If anything later fails, call rollbackAll() to unwind everything
// that actually happened, in reverse order.

export class CompensationStack {
  constructor(label = 'tx') {
    this.label = label
    this.steps = [] // { name, undo: async () => {} }
  }

  push(name, undoFn) {
    this.steps.push({ name, undo: undoFn })
  }

  async rollbackAll(originalError) {
    console.error(`[${this.label}] rolling back ${this.steps.length} step(s) due to:`, originalError?.message)
    for (let i = this.steps.length - 1; i >= 0; i--) {
      const { name, undo } = this.steps[i]
      try {
        await undo()
        console.log(`[${this.label}] rolled back: ${name}`)
      } catch (rollbackErr) {
        // Don't let one bad rollback stop the rest from unwinding.
        // Log loudly — a failed rollback means real data drift and needs
        // a human/alert, not a silent swallow.
        console.error(`[${this.label}] ROLLBACK FAILED for step "${name}":`, rollbackErr)
      }
    }
  }
}

// ---- Per-stock serialization queue ----
// Guarantees that all order processing for a given stockId runs strictly
// one-at-a-time, in arrival order, even though the functions are async and
// yield at multiple await points internally. Different stocks still run
// independently/concurrently.

const stockQueues = new Map() // stockId(string) -> Promise chain tail

export function enqueueForStock(stockId, task) {
  const key = String(stockId)
  const prevTail = stockQueues.get(key) || Promise.resolve()

  // The actual work, chained after whatever was queued before it.
  const runResult = prevTail.then(() => task())

  // The tail we store must never reject (a rejection would poison every
  // future .then() chained onto it for this stock), but the caller still
  // needs to see the real result/error, which runResult (returned below)
  // provides untouched.
  const tailForQueue = runResult.then(
    () => undefined,
    () => undefined
  )
  stockQueues.set(key, tailForQueue)

  return runResult
}