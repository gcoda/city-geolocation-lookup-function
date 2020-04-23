import {
  processLines,
  root,
  readStream,
  writeStream,
  readGenerated,
} from './utils'

const CITIES = true
const ALT_15_NAMES = true
const main = async () => {
  CITIES &&
    (await processLines({
      onStart: '[\n',
      onClose: '[null,"__EOF__"] ]',
      readable: readStream('cities15000.txt'),
      writable: writeStream('cities15000.json'),
      onLine: (line, c) => {
        const [
          id, // geonameid   : integer id of record in geonames database
          localName, // name  : name of geographical point (utf8) varchar(200)
          name, // asciiname   : name of geographical point in plain ascii characters, varchar(200)
          alternate, // alternatenames : alternatenames, comma separated, ascii names automatically transliterated, convenience attribute from alternatename table, varchar(10000)
          lat, // latitude : latitude in decimal degrees (wgs84)
          lon, // longitude   : longitude in decimal degrees (wgs84)
          f1, // feature class  : see http://www.geonames.org/export/codes.html, char(1)
          f2, // feature code   : see http://www.geonames.org/export/codes.html, varchar(10)
          country, // country code   : ISO-3166 2-letter country code, 2 characters
        ] = line.split('\t')
        const la = parseFloat(lat).toFixed(2)
        const lo = parseFloat(lon).toFixed(2)
        return (
          JSON.stringify([
            parseInt(id),
            parseFloat(la),
            parseFloat(lo),
            country,
            name,
          ]) + ',\n'
        )
      },
    }))

  const cities: Array<number | string>[] = readGenerated('cities15000.json')
  const citiesId = cities.map(([id]) => id as number)
  ALT_15_NAMES &&
    (await processLines({
      // onStart: '{ "cities": [\n',
      // onClose: '\n [] ]\n}',
      onStart: '[\n',
      onClose: '[null,"__EOF__"] ]',
      readable: readStream('alternateNamesV2.txt'),
      writable: writeStream('alternateNames_15000.json'),
      onLine: (line, c) => {
        if (c % 100000 === 0) {
          console.log(c)
        }
        const [
          alternateNameId, // alternateNameId   : the id of this alternate name, int
          id, // geonameid         : geonameId referring to id in table 'geoname', int
          lang, // isolanguage       : iso 639 language code 2- or 3-characters; 4-characters 'post' for postal codes and 'iata','icao' and faac for airport codes, fr_1793 for French Revolution names,  abbr for abbreviation, link to a website (mostly to wikipedia), wkdt for the wikidataid, varchar(7)
          name, // alternate name    : alternate name or name variant, varchar(400)
          isPreferredName, // isPreferredName   : '1', if this alternate name is an official/preferred name
          isShortName, // isShortName       : '1', if this is a short name like 'California' for 'State of California'
          isColloquial, // isColloquial      : '1', if this alternate name is a colloquial or slang term. Example: 'Big Apple' for 'New York'.
          isHistoric, // isHistoric        : '1', if this alternate name is historic and was used in the past. Example 'Bombay' for 'Mumbai'.
          from, // from		  : from period when the name was used
          to, // to		  : to period when the name was used
        ] = line.split('\t')
        const intId = parseInt(id)
        if (citiesId.indexOf(intId) === -1) {
          return false
        }
        if (['en', 'uk', 'ru'].includes(lang)) {
          return (
            JSON.stringify([
              intId,
              lang,
              name,
              isPreferredName === '1',
              isShortName === '1',
              isColloquial === '1',
              isHistoric === '1',
            ]) + ',\n'
          )
        }
        return false
      },
    }))
  console.log('csv done')
}

main()
