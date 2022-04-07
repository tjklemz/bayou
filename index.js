const cheerio = require('cheerio')
const fs = require('fs').promises

const ivy = [
  {name: 'Brown University', href: 'https://www.brown.edu/'},
  {name: 'Columbia University', href: 'https://www.columbia.edu/'},
  {name: 'Cornell University', href: 'https://www.cornell.edu/'},
  {name: 'Dartmouth University', href: 'https://home.dartmouth.edu/'},
  {name: 'Harvard University', href: 'https://www.harvard.edu/'},
  {name: 'University of Pennsylvania', href: 'https://www.upenn.edu/'},
  {name: 'Princeton University', href: 'https://www.princeton.edu/'},
  {name: 'Yale University', href: 'https://www.yale.edu/'},
]

const notRelevant = href => {
  return !href || [
    '#',
    'google.com',
    'facebook.com',
    'twitter.com',
    'pinterest.com',
    'linktree.com',
    'youtu.be',
    'youtube.com',
    'instagram.com',
    'linkedin.com',
    'tiktok.com',
    'vm.tiktok.com',
    'vimeo.com',
    'gmail.com',
    'sites.google.com',
    'snapchat.com',
    'weibo.com',
    'flickr.com',
    'podcasts.apple.com',
    'spotify.com',
    'open.spotify.com',
  ].some(l => href.replace(/^www\./, '').startsWith(l))
}

const fetchLinks = (links) => Promise.all(links.map(async (link) => {
  const r = await fetch(link.href)
  const text = await r.text()
  const $ = cheerio.load(text)
  const links = Array.from($('a').map((i, link) => $(link).attr('href')))
    .filter(Boolean)
    .map(a => {
      const url = new URL(a, link.href)
      return url.href.replace(url.hash, '').replace(/#$/, '')
    })

  return {
    ...link,
    links: Array.from(new Set(links)).reduce((all, link) => {
      const host = new URL(link).host
      return notRelevant(host) ? all : {
        ...all,
        [host]: [...(all[host] || []), link],
      }
    }, {}),
  }
}))

fetchLinks(ivy).then(data => {
  return fs.writeFile('out.json', JSON.stringify(data, null, 2))
})
