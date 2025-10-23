export function hasKey<Obj extends object, K extends PropertyKey>(
  obj: Obj | null | undefined,
  key: K
): obj is Obj & Record<K, unknown> {
  return !!obj && Object.prototype.hasOwnProperty.call(obj, key);
}
