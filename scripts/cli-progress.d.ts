declare module 'cli-progress' {
  export interface SingleBarOptions {
    format?: string
    barCompleteChar?: string
    barIncompleteChar?: string
    hideCursor?: boolean
  }

  export interface SingleBarUpdateOptions {
    [key: string]: string | number
  }

  export class SingleBar {
    constructor(options: SingleBarOptions, preset?: any)
    start(total: number, startValue: number, payload?: SingleBarUpdateOptions): void
    update(current: number, payload?: SingleBarUpdateOptions): void
    stop(): void
    setTotal(total: number): void
  }
}
