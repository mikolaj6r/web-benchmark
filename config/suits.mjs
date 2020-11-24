import sites from './sites.mjs'

export default function (length){
  return sites.map(site => ({
    label: site,
    urls: new Array(length).fill(`http://localhost:3000/${site}`)
  }))
}