import { render, screen } from '@testing-library/react-native';
import RouteMap from '../../components/RouteMap.web';

const coord = { latitude: 9.9, longitude: 76.2 };
const region = { ...coord, latitudeDelta: 0.1, longitudeDelta: 0.1 };

async function srcDocFor(pickup: string, dropoff: string) {
  await render(
    <RouteMap
      start={coord}
      end={coord}
      pickup={pickup}
      dropoff={dropoff}
      route={[]}
      region={region}
    />,
  );
  const match = JSON.stringify(screen.toJSON()).match(/"srcDoc":"((?:[^"\\]|\\.)*)"/);
  expect(match).not.toBeNull();
  return JSON.parse('"' + match![1] + '"') as string;
}

const hostile = [
  '</script><img src=x onerror=alert(1)>',
  '<b onmouseover="alert(1)">x</b>',
  `"'><svg/onload=alert(1)>`,
];

test.each(hostile)('never embeds the raw label %s in the generated page', async (label) => {
  const html = await srcDocFor(label, label);
  expect(html).not.toContain(label);
  expect(html).not.toContain('</script><img');
});

test('popups are built from DOM text nodes, not concatenated HTML', async () => {
  const html = await srcDocFor('A', 'B');
  expect(html).toContain('textContent = label');
  expect(html).not.toMatch(/bindPopup\(\s*'</);
});
