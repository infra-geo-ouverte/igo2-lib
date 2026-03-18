export const TypePermission = ['read', 'write'] as const;
export type TypePermission = (typeof TypePermission)[number];

export enum Scope {
  public,
  protected,
  private
}
