import { root, readGenerated } from './utils'
import fs from 'fs'
const main = async () => {
  const cities: Array<[number, number, number, string, string]> = readGenerated(
    'cities15000.json'
  )
  const citiesAlt: Array<[
    number,
    string,
    string,
    boolean,
    boolean,
    boolean,
    boolean
  ]> = readGenerated('alternateNames_15000.json')
  const mapped = cities.map(([id, lat, lon, country, name]) => {
    const alternativeNames = citiesAlt.filter(
      ([altId, l, name]) => name && altId === id
    )
    const locals = alternativeNames.reduce(
      (acc, [_, lang, name, preferred, short, colloquial, historic]) => {
        if (acc[lang]) {
          acc[lang].push({ name, preferred, short, colloquial, historic })
        } else {
          acc[lang] = [{ name, preferred, short, colloquial, historic }]
        }
        return acc
      },
      {} as Record<
        string,
        {
          name: string
          preferred: boolean
          short: boolean
          colloquial: boolean
          historic: boolean
        }[]
      >
    )
    const localNames = Object.entries(locals).reduce((acc, [lang, names]) => {
      if (!acc[lang]) {
        const bestName =
          names.find(({ preferred }) => preferred) ||
          // names.find(({ colloquial }) => colloquial) ||
          // names.find(({ short }) => short) ||
          names.find(({ historic }) => !historic)
        if (bestName) {
          acc[lang] = bestName.name
        }
      }
      return acc
    }, {} as Record<string, string>)
    return {
      id,
      coordinates: [lat, lon],
      country,
      name,
      alternative: alternativeNames
        .map(([_, lang, altName]) => altName.replace(/'/g, ''))
        .concat([name])
        .filter((e, i, a) => a.indexOf(e) === i)
        .join(', '),
      local: localNames,
    }
  })
  fs.writeFileSync(root('outputs', 'cities.json'), JSON.stringify(mapped))
  fs.writeFileSync(
    root('outputs', 'cities.json.d.ts'),
    [
      `// prettier-ignore`,
      `declare const _default: {`,
      `  id: number`,
      `  coordinates: [number, number]`,
      `  country: string`,
      `  name: string`,
      `  alternative: string`,
      `  local: Record<string,string>`,
      `}[]`,
      `export default _default`,
    ].join('\n')
  )

  console.log('write cities.json')
}

main()
