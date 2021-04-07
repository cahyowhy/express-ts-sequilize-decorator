export type ParamGet = {
  offset?: number,
  limit?: number,
  filter?: any
};

export interface IService<T> {
  find?(param: ParamGet): Promise<Array<T>>;
  findById?(id: number | string): Promise<T | null>;
  create?(param: T): Promise<T>;
  update?(id: number | string, param: T): Promise<T>;
  delete?(id: number | string): Promise<boolean>;
  count?(param: Pick<ParamGet, 'filter'>): Promise<number>;
}
