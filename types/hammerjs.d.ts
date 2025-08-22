declare module 'hammerjs' {
  interface HammerStatic {
    new(el: HTMLElement): any;
    DIRECTION_HORIZONTAL: number;
  }
  const Hammer: HammerStatic;
  export default Hammer;
}
