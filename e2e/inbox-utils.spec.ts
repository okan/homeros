import { test, expect } from '@playwright/test';
import {
  MAX_INBOX_LINKS,
  addLinkToInbox,
  cleanTitle,
  moveLinkToSlot,
  preparePageForInbox,
} from '../src/utils/inbox';
import { cleanUrlForSaving, getDomainFromUrl, normalizeUrl } from '../src/utils/url';
import { mergeById } from '../src/utils/merge';
import { stableStringify } from '../src/utils/storage';
import type { Link, Slot, Todo } from '../src/types';

// Plain function tests; these run in Node without opening a browser page

const link = (url: string, id = url): Link => ({ id, title: url, url, order: 0 });

const slot = (id: string, urls: string[]): Slot => ({
  id,
  name: id,
  icon: 'Folder',
  order: 0,
  links: urls.map((url, index) => ({ ...link(url, `${id}-${index}`), order: index })),
});

const todo = (id: string, text: string, completed = false): Todo => ({
  id,
  text,
  completed,
  createdAt: '2026-01-01T00:00:00.000Z',
  order: 0,
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

test.describe('cleanUrlForSaving', () => {
  test('rejects anything that is not a web page', () => {
    for (const url of ['chrome://settings/', 'javascript:alert(1)', 'file:///etc/passwd', 'x']) {
      expect(cleanUrlForSaving(url)).toBeNull();
    }
  });

  test('drops embedded credentials', () => {
    expect(cleanUrlForSaving('https://user:secret@example.com/a')).toBe('https://example.com/a');
  });

  test('drops token parameters from the query and fragment, keeping the rest as is', () => {
    expect(
      cleanUrlForSaving(
        'https://example.com/reset?lang=tr&Token=abc&q=a%20b#access_token=x&state=y',
      ),
    ).toBe('https://example.com/reset?lang=tr&q=a%20b#state=y');
    expect(cleanUrlForSaving('https://app.example.com/#/callback?id_token=x&tab=2')).toBe(
      'https://app.example.com/#/callback?tab=2',
    );
    expect(cleanUrlForSaving('https://s3.example.com/f.pdf?X-Amz-Signature=x')).toBe(
      'https://s3.example.com/f.pdf',
    );
  });

  test('leaves ordinary URLs untouched', () => {
    for (const url of [
      'https://example.com/',
      'https://example.com/a?b=c&d=e',
      'https://example.com/docs#section-2',
      'https://example.com/#/route?view=list',
    ]) {
      expect(cleanUrlForSaving(url)).toBe(url);
    }
  });
});

test.describe('cleanTitle', () => {
  test('removes bidi overrides and invisible characters', () => {
    expect(cleanTitle('‮Garanti​ BBVA⁦ - Giriş﻿')).toBe('Garanti BBVA - Giriş');
  });

  test('keeps emoji joiners and collapses whitespace', () => {
    expect(cleanTitle('  Family 👨‍👩‍👧 \n\t trip  ')).toBe('Family 👨‍👩‍👧 trip');
  });

  test('shortens very long titles', () => {
    const title = cleanTitle('a'.repeat(5000));
    expect(title).toHaveLength(300);
    expect(title.endsWith('…')).toBe(true);
  });
});

test.describe('preparePageForInbox', () => {
  test('cleans the URL and title, falling back to the domain', () => {
    expect(preparePageForInbox({ url: 'https://www.example.com/a?token=x', title: '‮​' })).toEqual({
      url: 'https://www.example.com/a',
      title: 'example.com',
    });
  });

  test('rejects Incognito tabs, non-web pages and very long URLs', () => {
    expect(preparePageForInbox({ url: 'https://example.com/', incognito: true })).toEqual({
      rejected: 'incognito',
    });
    expect(preparePageForInbox({ url: 'chrome://newtab/' })).toEqual({ rejected: 'not-web' });
    expect(preparePageForInbox({})).toEqual({ rejected: 'not-web' });
    expect(preparePageForInbox({ url: `https://example.com/#${'a'.repeat(1_900_000)}` })).toEqual({
      rejected: 'too-long',
    });
  });
});

test.describe('addLinkToInbox', () => {
  test('appends the page with its title', () => {
    const result = addLinkToInbox([], [], 'https://example.com/a', 'Example');

    expect(result).toEqual({
      inbox: [
        expect.objectContaining({ title: 'Example', url: 'https://example.com/a', order: 0 }),
      ],
    });
  });

  test('skips a page already in a slot, even written differently', () => {
    const slots = [slot('Work', ['https://github.com'])];

    expect(addLinkToInbox([], slots, 'https://GitHub.com/', 'GitHub')).toEqual({
      skipped: 'duplicate',
    });
  });

  test('skips a page already waiting in the inbox', () => {
    expect(
      addLinkToInbox([link('https://example.com/a')], [], 'https://example.com/a/', 'A'),
    ).toEqual({ skipped: 'duplicate' });
  });

  test('keeps pages whose paths differ only in case', () => {
    const result = addLinkToInbox([link('https://bit.ly/AbC')], [], 'https://bit.ly/abc', 'abc');

    expect('inbox' in result && result.inbox.map((l) => l.url)).toEqual([
      'https://bit.ly/AbC',
      'https://bit.ly/abc',
    ]);
  });

  test('stops at the inbox limit', () => {
    const full = Array.from({ length: MAX_INBOX_LINKS }, (_, i) => link(`https://e.com/${i}`));

    expect(addLinkToInbox(full, [], 'https://e.com/new', 'New')).toEqual({ skipped: 'full' });
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

test.describe('mergeById', () => {
  const ids = (list: { id: string }[]) => list.map((item) => item.id);

  test('keeps additions from both sides', () => {
    const base = [todo('a', 'A')];
    const merged = mergeById(base, [...base, todo('ours', 'O')], [...base, todo('theirs', 'T')]);

    expect(ids(merged)).toEqual(['a', 'theirs', 'ours']);
    expect(merged.map((t) => t.order)).toEqual([0, 1, 2]);
  });

  test('applies deletions from either side', () => {
    const base = [todo('a', 'A'), todo('b', 'B'), todo('c', 'C')];

    expect(ids(mergeById(base, [base[0], base[2]], [base[0], base[1]]))).toEqual(['a']);
  });

  test('keeps an item one side edited and the other deleted', () => {
    const base = [todo('a', 'A')];

    expect(mergeById(base, [], [todo('a', 'A edited')])).toEqual([todo('a', 'A edited')]);
    expect(mergeById(base, [todo('a', 'A edited')], [])).toEqual([todo('a', 'A edited')]);
  });

  test('merges different fields of the same item, ours winning on the same field', () => {
    const base = [todo('a', 'A')];

    expect(mergeById(base, [todo('a', 'A', true)], [todo('a', 'A renamed')])).toEqual([
      todo('a', 'A renamed', true),
    ]);
    expect(mergeById(base, [todo('a', 'Ours')], [todo('a', 'Theirs')])).toEqual([
      todo('a', 'Ours'),
    ]);
  });

  test("merges a slot's links when both sides changed the slot", () => {
    const base = [slot('Work', ['https://a.com'])];
    const ours = [{ ...base[0], name: 'Job' }];
    const theirs = [
      { ...base[0], links: [...base[0].links, { ...link('https://b.com', 'b'), order: 1 }] },
    ];

    const [merged] = mergeById(base, ours, theirs);
    expect(merged.name).toBe('Job');
    expect(merged.links.map((l) => l.url)).toEqual(['https://a.com', 'https://b.com']);
  });

  test('keeps the order of the side that rearranged the list', () => {
    const base = [todo('a', 'A'), todo('b', 'B')];

    expect(ids(mergeById(base, [base[1], base[0]], [...base, todo('c', 'C')]))).toEqual([
      'b',
      'a',
      'c',
    ]);
    expect(ids(mergeById(base, [...base, todo('c', 'C')], [base[1], base[0]]))).toEqual([
      'b',
      'a',
      'c',
    ]);
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
