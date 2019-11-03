export function parseParams(str) {
  var pieces = str.slice(1).split('&'), data = {}, i, parts
  // process each query pair
  for (i = 0; i < pieces.length; i++) {
    parts = pieces[i].split('=')
    if (parts.length < 2) {
      parts.push('')
    }
    data[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1])
  }
  return data
}
