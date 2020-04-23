import { Request, Response } from 'express'
import cities from './generated/cities.json'
import citiesIndex from './generated/citiesIndex.json'
import countries from './generated/countries.json'
const lunr = require('lunr')
require('lunr-languages/lunr.stemmer.support')(lunr)
require('lunr-languages/lunr.multi')(lunr)
require('lunr-languages/lunr.ru')(lunr)
import { findPlaceFromText } from './placeApi'
const index = lunr.Index.load(citiesIndex)
const search = (term: string) => {
  const results = index.search(term) as {
    ref: string
    score: number
    matchData: { metadata: Record<string, Record<string, {}>> }
  }[]
  return results.map(({ score, ref }) => ({
    city: cities.find(c => c.id === parseInt(ref)),
    ref,
    score,
  }))
}
const { HTTP_SECRET } = process.env
const map = (q: string, fn: (q: string) => string) =>
  q
    .split(' ')
    .map(fn)
    .join(' ')
export const geoQuery = (req: Request, res: Response) => {
  res.set({ 'content-type': 'application/json; charset=UTF-8' })

  const query = `${req.query.search || req.query.s}`
    .toLowerCase()
    .replace(/\:\~\*\-\+\^/g, '')

  if (query) {
    const results: ReturnType<typeof search> = []
    results.push(...search(query))
    if (results.length < 3 && !results.find(({ score }) => score > 5)) {
      results.push(...search(map(query, t => `*${t}*`)))
      if (results.length < 6 && !results.find(({ score }) => score > 5)) {
        results.push(...search(map(query, t => `${t}~1`)).slice(0, 5))
      }
    }

    const result = results
      .filter((e, i, a) => a.findIndex(r => r.ref === e.ref) === i)
      .map(({ city, score }) => {
        const country = countries.find(c => c.code === city?.country)
        // const localName = country?.lang
        //   ? city?.local[country?.lang] || city?.name
        //   : city?.name
        return {
          id: `GEO_NAME:${city?.id}`,
          name: city?.name,
          coordinates: city?.coordinates,
          country: country,
          score,
        }
      })
    if (result.length) {
      res.send(JSON.stringify(result, null, 2))
    } else if (req.headers['x-secret'] === HTTP_SECRET) {
      findPlaceFromText(query).then(r => {
        res.send(JSON.stringify(r, null, 2))
      })
    } else {
      res.send(JSON.stringify([]))
    }
  } else {
    res.send(JSON.stringify([]))
  }
}
