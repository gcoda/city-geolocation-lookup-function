import fetch from 'node-fetch'
import * as qs from 'querystring'
import countries from './generated/countries.json'
const { PLACE_API_KEY } = process.env
export const findPlaceFromText = async (
  input: string,
  language: string = 'en'
) => {
  if (!PLACE_API_KEY) return []
  try {
    const result = await fetch(
      'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?' +
        qs.stringify({
          input,
          inputtype: 'textquery',
          fields: 'name,geometry,place_id,formatted_address,types',
          language,
          key: PLACE_API_KEY,
        })
    )

    if (!result.ok) return []

    const data = await result.json()
    if (data?.status !== 'OK') return []

    if (Array.isArray(data.candidates)) {
      return data.candidates.map((candidate: any) => {
        const country = `${candidate.formatted_address}`
          .split(', ')
          .filter(part => !part.match(/[0-9]/))
          .map(country => countries.find(({ name }) => name === country))
          .pop()
        return {
          id: candidate.place_id,
          name: candidate.name,
          coordinates: [
            candidate.geometry.location.lat,
            candidate.geometry.location.lng,
          ],
          country,
        }
      })
    }
    return []
  } catch (e) {
    return []
  }
}
/*
{
   "candidates" : [
      {
         "formatted_address" : "Kyiv, Ukraine, 02000",
         "geometry" : {
            "location" : {
               "lat" : 50.4501,
               "lng" : 30.5234
            },
            "viewport" : {
               "northeast" : {
                  "lat" : 50.590798,
                  "lng" : 30.825941
               },
               "southwest" : {
                  "lat" : 50.213273,
                  "lng" : 30.2394401
               }
            }
         },
         "name" : "Kyiv",
         "place_id" : "ChIJBUVa4U7P1EAR_kYBF9IxSXY",
         "types" : [ "locality", "political" ]
      }
   ],
   "status" : "OK"
}
*/
