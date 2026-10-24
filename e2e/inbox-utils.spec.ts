import { test, expect } from '@playwright/test';
import { addLinkToInbox, moveLinkToSlot } from '../src/utils/inbox';
import { getDomainFromUrl, normalizeUrl } from '../src/utils/url';
import { stableStringify } from '../src/utils/storage';
import type { Link, Slot } from '../src/types';

// Plain function tests; these run in Node without opening a browser page

const link = (url: string, id = url): Link => ({ id, title: url, url, order: 0 });

const slot = (id: string, urls: string[]): Slot => ({
  id,
  name: id,
  icon: 'Folder',
  order: 0,
  links: urls.map((url, index) => ({ ...link(url, `${id}-${index}`), order: index })),
});

test.describe('normalizeUrl', () => {
  test('ignores scheme and host case and trailing slashes', () => {
    expect(normalizeUrl('HTTPS://GitHub.com')).toBe(normalizeUrl('https://github.com/'));
    expect(normalizeUrl('https://example.com/docs/')).toBe(
      normalizeUrl('https://example.com/docs'),
    );
  });

  test('keeps path, query and fragment case', () => {
    expect(normalizeUrl('https://bit.ly/AbC')).not.toBe(normalizeUrl('https://bit.ly/abc'));
    expect(normalizeUrl('https://x.com/?q=A')).not.toBe(normalizeUrl('https://x.com/?q=a'));
  });
});

test.describe('addLinkToInbox', () => {
  test('appends the page with its title', () => {
    const inbox = addLinkToInbox([], [], 'https://example.com/a', 'Example');

    expect(inbox).toHaveLength(1);
    expect(inbox?.[0]).toMatchObject({ title: 'Example', url: 'https://example.com/a', order: 0 });
  });

  test('skips a page already in a slot, even written differently', () => {
    const slots = [slot('Work', ['https://github.com'])];

    expect(addLinkToInbox([], slots, 'https://GitHub.com/', 'GitHub')).toBeNull();
  });

  test('skips a page already waiting in the inbox', () => {
    expect(
      addLinkToInbox([link('https://example.com/a')], [], 'https://example.com/a/', 'A'),
    ).toBeNull();
  });

  test('keeps pages whose paths differ only in case', () => {
    const inbox = addLinkToInbox([link('https://bit.ly/AbC')], [], 'https://bit.ly/abc', 'abc');

    expect(inbox?.map((l) => l.url)).toEqual(['https://bit.ly/AbC', 'https://bit.ly/abc']);
  });
});

test.describe('moveLinkToSlot', () => {
  test('appends a copy of the link to the slot', () => {
    const { slots, added } = moveLinkToSlot(
      [slot('Work', ['https://a.com']), slot('Reading', [])],
      'Work',
      link('https://b.com', 'inbox-b'),
    );

    expect(added).toBe(true);
    expect(slots[0].links.map((l) => l.url)).toEqual(['https://a.com', 'https://b.com']);
    expect(slots[0].links[1].id).not.toBe('inbox-b');
    expect(slots[0].links[1].order).toBe(1);
    expect(slots[1].links).toEqual([]);
  });

  test('does not add a URL the slot already has', () => {
    const original = [slot('Work', ['https://a.com/'])];
    const { slots, added } = moveLinkToSlot(original, 'Work', link('https://A.com'));

    expect(added).toBe(false);
    expect(slots).toBe(original);
  });
});

test('stableStringify ignores key order', () => {
  expect(stableStringify([{ b: 1, a: { d: 2, c: 3 } }])).toBe(
    stableStringify([{ a: { c: 3, d: 2 }, b: 1 }]),
  );
});

test('getDomainFromUrl only strips a leading www', () => {
  expect(getDomainFromUrl('https://www.example.com/x')).toBe('example.com');
  expect(getDomainFromUrl('https://mywww.example.com/x')).toBe('mywww.example.com');
});
