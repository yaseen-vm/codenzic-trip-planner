import { serializeForInlineScript } from '../../src/utils/inlineScriptJson';

describe('serializeForInlineScript', () => {
  test('escapes HTML-significant characters so the script element cannot be closed', () => {
    const label = '</script><script>alert("xss")</script> & >';
    const serialized = serializeForInlineScript(label);

    expect(serialized).not.toMatch(/[<>&]/);
    expect(JSON.parse(serialized)).toBe(label);
  });

  test('round-trips ordinary labels and structured values', () => {
    expect(JSON.parse(serializeForInlineScript('Kochi Central · MG Road'))).toBe(
      'Kochi Central · MG Road',
    );
    const value = { latitude: 1.5, tags: ['a<b'] };
    expect(JSON.parse(serializeForInlineScript(value))).toEqual(value);
  });
});
