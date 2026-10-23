import { buildRouteMapHtml } from '../../../src/components/map/routeMapHtml';

const start = { latitude: 9.9, longitude: 76.2 };
const end = { latitude: 10.1, longitude: 76.4 };
const input = { start, end, pickup: 'A', dropoff: 'B', route: [] };

const hostile = [
  '</script><img src=x onerror=alert(1)>',
  '<b onmouseover="alert(1)">x</b>',
  `"'><svg/onload=alert(1)>`,
];

test.each(hostile)('never embeds the raw label %s in the generated page', (label) => {
  const html = buildRouteMapHtml({ ...input, pickup: label, dropoff: label });
  expect(html).not.toContain(label);
  expect(html).not.toContain('</script><img');
});

test('popups are built from DOM text nodes, not concatenated HTML', () => {
  const html = buildRouteMapHtml(input);
  expect(html).toContain('textContent = label');
  expect(html).not.toMatch(/bindPopup\(\s*'</);
});

test('embeds the endpoints, labels and route as data', () => {
  const route = [start, end];
  const html = buildRouteMapHtml({ ...input, pickup: 'Home', dropoff: 'Work', route });

  expect(html).toContain(`const start = ${JSON.stringify(start)};`);
  expect(html).toContain(`const end = ${JSON.stringify(end)};`);
  expect(html).toContain('const pickup = "Home";');
  expect(html).toContain('const dropoff = "Work";');
  expect(html).toContain(`const route = ${JSON.stringify(route)};`);
});

test('labels the markers with the localized headings', () => {
  const html = buildRouteMapHtml(input);
  expect(html).toContain('popupContent(pickup, "Pickup")');
  expect(html).toContain('popupContent(dropoff, "Destination")');
});

test('loads a pinned Leaflet build and the basemap tiles', () => {
  const html = buildRouteMapHtml(input);
  expect(html).toContain('leaflet@1.9.4/dist/leaflet.js');
  expect(html).toContain('basemaps.cartocdn.com');
});

test('uses the theme colours for markers and the route line', () => {
  const html = buildRouteMapHtml(input);
  expect(html).toContain('#F1521F');
  expect(html).toContain('#17212F');
});
