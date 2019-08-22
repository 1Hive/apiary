export class Stopwatch {
  constructor () {
    this.start = Date.now()
  }

  elapsed () {
    return Date.now() - this.start
  }

  reset () {
    this.start = Date.now()
  }
}
