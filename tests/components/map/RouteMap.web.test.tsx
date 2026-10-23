import { render, screen } from '@testing-library/react-native';
import RouteMap from '../../../src/components/map/RouteMap.web';

const coord = { latitude: 9.9, longitude: 76.2 };
const region = { ...coord, latitudeDelta: 0.1, longitudeDelta: 0.1 };

function srcDoc() {
  const match = JSON.stringify(screen.toJSON()).match(/"srcDoc":"((?:[^"\\]|\\.)*)"/);
  expect(match).not.toBeNull();
  return JSON.parse('"' + match![1] + '"') as string;
}

test('renders the map page inside an iframe', async () => {
  await render(
    <RouteMap start={coord} end={coord} pickup="Home" dropoff="Work" route={[]} region={region} />,
  );

  const html = srcDoc();
  expect(html).toContain('<div id="map">');
  expect(html).toContain('const pickup = "Home";');
  expect(JSON.stringify(screen.toJSON())).toContain('Interactive Route Map');
});

test('never embeds a hostile label verbatim', async () => {
  const label = '</script><img src=x onerror=alert(1)>';
  await render(
    <RouteMap
      start={coord}
      end={coord}
      pickup={label}
      dropoff={label}
      route={[]}
      region={region}
    />,
  );
  expect(srcDoc()).not.toContain(label);
});
