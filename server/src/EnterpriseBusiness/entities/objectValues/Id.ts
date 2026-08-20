export type Id = number

export type Ref<T extends { id: Id }> = T['id']
