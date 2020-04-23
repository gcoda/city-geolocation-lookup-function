import {
  processLines,
  root,
  readStream,
  writeStream,
  readGenerated,
} from './utils'

import fs from 'fs'

const main = async () => {
  await processLines({
    onStart: '[\n',
    onClose: '[null,"__EOF__"] ]',
    readable: readStream('countryInfo.txt'),
    writable: writeStream('countryInfo.json'),
    onLine: (line, c) => {
      if (line.length < 10) return null
      if (line.startsWith('#')) return null
      const [
        ISO, //ISO
        ISO3, //ISO3
        ISONum, //ISO-Numeric
        fips, //fips
        Country, //Country
        Capital, //Capital
        Area, //Area(in sq km)
        Population, //Population
        Continent, //Continent
        tld, //tld
        CurrencyCode, //CurrencyCode
        CurrencyName, //CurrencyName
        Phone, //Phone
        PostalFormat, //Postal Code Format
        PostalRegex, //Postal Code Regex
        Languages, //Languages
        geonameid, //geonameid
        neighbours, //neighbours
        EquivalentFipsCode, //EquivalentFipsCode
      ] = line.split('\t')
      return JSON.stringify([ISO, Country, Languages]) + ',\n'
    },
  })

  const countryInfo: Array<string>[] = readGenerated('countryInfo.json')
  const countries = countryInfo
    .filter(([c]) => c !== null)
    .map(([code, name, languages]) => ({
      code,
      name,
      lang: languages.slice(0, 2),
      // languages,
      // language: languages
      //   ?.split(',')
      //   .slice(0, 1)
      //   .pop(),
    }))
  fs.writeFileSync(
    root('outputs', 'countries.json'),
    JSON.stringify(countries, null, 2),
    { encoding: 'utf8' }
  )
}

main()
