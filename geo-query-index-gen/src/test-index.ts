import { readGenerated } from './utils'
var lunr = require('lunr')
require('lunr-languages/lunr.stemmer.support')(lunr)
require('lunr-languages/lunr.multi')(lunr)
require('lunr-languages/lunr.ru')(lunr)

const main = async () => {
  console.time('readGenerated')
  const citiesIndex: Record<string, any>[] = readGenerated('citiesIndex.json')
  const cities: Record<string, any>[] = readGenerated('cities.json')

  console.timeEnd('readGenerated')
  console.time('Index load')
  const idx = lunr.Index.load(citiesIndex)
  console.timeEnd('Index load')
  const searchString = 'пропетровськ~3'
  // const searchString = 'Кодак~2'
  //   const searchString = 'Новий~1 +Кодак~1'
  console.time('search')
  const results = idx.search(searchString) as {
    ref: string
    score: number
    matchData: { metadata: Record<string, Record<string, {}>> }
  }[]
  console.log(process.memoryUsage())
  console.timeEnd('search')
  console.log(
    results.map(r => r.matchData.metadata),
    results.map(({ score, ref }) => ({
      ...cities.find(c => c.id === parseInt(ref)),
      score,
    }))
  )
}

main()
