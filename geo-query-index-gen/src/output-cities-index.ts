import { root, readGenerated } from './utils'
var lunr = require('lunr')
require('lunr-languages/lunr.stemmer.support')(lunr)
require('lunr-languages/lunr.multi')(lunr)
require('lunr-languages/lunr.ru')(lunr)
import fs from 'fs'
const main = async () => {
  const citiesMap: Record<string, any>[] = readGenerated('cities.json')
  var idx = lunr(function() {
    // @ts-ignore
    const l = this
    l.use(lunr.multiLanguage('en', 'ru'))
    l.ref('id')
    l.field('name')
    l.field('alternative')
    citiesMap.forEach(city => {
      l.add(city)
    })
    console.log('this index')
  })
  const index = JSON.stringify(idx)
  fs.writeFileSync(root('outputs', 'citiesIndex.json'), index)
  fs.writeFileSync(
    root('outputs', 'citiesIndex.json.d.ts'),
    [
      `// prettier-ignore`,
      `declare const _default: any`,
      `export default _default`,
    ].join('\n')
  )
  console.log('writeFileSync citiesIndex')
}

main()
