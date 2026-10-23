import assert from 'node:assert/strict';
import test from 'node:test';
import { serializeForInlineScript } from '../utils/inlineScriptJson.mjs';

test('escapes HTML-significant characters in inline script JSON', () => {
  const label = '</script><script>alert("xss")</script> & >';
  const serialized = serializeForInlineScript(label);

  assert.ok(!serialized.includes('<'));
  assert.ok(!serialized.includes('>'));
  assert.ok(!serialized.includes('&'));
  assert.equal(JSON.parse(serialized), label);
});

test('preserves normal labels after JSON parsing', () => {
  const label = 'Kochi Central · MG Road';
  assert.equal(JSON.parse(serializeForInlineScript(label)), label);
});
