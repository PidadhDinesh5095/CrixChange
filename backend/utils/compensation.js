

export class CompensationStack {
  constructor(label = 'tx') {
    this.label = label
    this.steps = []
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


const stockQueues = new Map() 

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