import assert from 'node:assert/strict';
import test from 'node:test';
import { hasErrors, isValidEmail, validateLogin, validateSignup } from '../utils/auth.mjs';

test('accepts well-formed emails and rejects malformed ones', () => {
  assert.equal(isValidEmail(' a@b.co '), true);
  for (const bad of ['', 'abc', 'a@b', '@b.co', 'a b@c.de']) assert.equal(isValidEmail(bad), false);
});

test('login requires a valid email and a 6 character password', () => {
  assert.equal(hasErrors(validateLogin({ email: 'a@b.co', password: '123456' })), false);
  assert.ok(validateLogin({ email: 'nope', password: '123456' }).email);
  assert.ok(validateLogin({ email: 'a@b.co', password: '12345' }).password);
});

test('signup rejects blank names and mismatched passwords', () => {
  const ok = { name: 'Ann', email: 'a@b.co', password: '123456', confirm: '123456' };
  assert.equal(hasErrors(validateSignup(ok)), false);
  assert.ok(validateSignup({ ...ok, name: '  ' }).name);
  assert.ok(validateSignup({ ...ok, confirm: 'x' }).confirm);
});
