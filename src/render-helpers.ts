export class RenderHelpers {
  public static centerToTopLeft(
    centerX: number,
    centerY: number,
    width: number,
    height: number,
  ) {
    return {
      x: centerX - width / 2,
      y: centerY - height / 2,
    };
  }
}
