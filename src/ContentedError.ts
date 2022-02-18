const tag = Symbol()

export abstract class ContentedError {
  //@ts-ignore
  private readonly [tag]: true
}
