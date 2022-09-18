export interface Query<T, K> {
  execute (param: T): K | Promise<K>;
}
