import { geoQuery } from './index'

geoQuery(
  { query: { search: 'днеп' } } as any,
  {
    send: (text: any) => console.log(text),
    set: (text: any) => console.log(text),
  } as any
)
