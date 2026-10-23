import type { Coordinate } from '../types/geo';

// Google encoded polyline algorithm:
// https://developers.google.com/maps/documentation/utilities/polylinealgorithm
const COORDINATE_PRECISION = 1e5;
const ASCII_OFFSET = 63;
const CHUNK_MASK = 0x1f;
const CONTINUATION_BIT = 0x20;
const CHUNK_BITS = 5;
const MAX_CHUNK_VALUE = 63;
const MAX_SHIFT = 30;

const INVALID_POLYLINE = 'Invalid encoded polyline';

type DecoderState = { index: number };

function decodeComponent(encoded: string, state: DecoderState): number {
  let result = 0;
  let shift = 0;
  let chunk: number;

  do {
    if (state.index >= encoded.length) throw new Error(INVALID_POLYLINE);

    chunk = encoded.charCodeAt(state.index++) - ASCII_OFFSET;
    if (chunk < 0 || chunk > MAX_CHUNK_VALUE || shift > MAX_SHIFT) {
      throw new Error(INVALID_POLYLINE);
    }

    result |= (chunk & CHUNK_MASK) << shift;
    shift += CHUNK_BITS;
  } while (chunk >= CONTINUATION_BIT);

  return result & 1 ? ~(result >> 1) : result >> 1;
}

export function decodePolyline(encoded: string): Coordinate[] {
  if (typeof encoded !== 'string') {
    throw new TypeError('Encoded polyline must be a string');
  }

  const points: Coordinate[] = [];
  const state: DecoderState = { index: 0 };
  let latitude = 0;
  let longitude = 0;

  while (state.index < encoded.length) {
    latitude += decodeComponent(encoded, state);
    longitude += decodeComponent(encoded, state);
    points.push({
      latitude: latitude / COORDINATE_PRECISION,
      longitude: longitude / COORDINATE_PRECISION,
    });
  }

  return points;
}
