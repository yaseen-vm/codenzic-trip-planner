function decodeComponent(encoded, state) {
  let result = 0;
  let shift = 0;
  let byte;

  do {
    if (state.index >= encoded.length) {
      throw new Error('Invalid encoded polyline');
    }

    byte = encoded.charCodeAt(state.index++) - 63;
    if (byte < 0 || byte > 63 || shift > 30) {
      throw new Error('Invalid encoded polyline');
    }

    result |= (byte & 0x1f) << shift;
    shift += 5;
  } while (byte >= 0x20);

  return result & 1 ? ~(result >> 1) : result >> 1;
}

export function decodePolyline(encoded) {
  if (typeof encoded !== 'string') {
    throw new TypeError('Encoded polyline must be a string');
  }

  const points = [];
  const state = { index: 0 };
  let latitude = 0;
  let longitude = 0;

  while (state.index < encoded.length) {
    latitude += decodeComponent(encoded, state);
    longitude += decodeComponent(encoded, state);
    points.push({ latitude: latitude / 1e5, longitude: longitude / 1e5 });
  }

  return points;
}
