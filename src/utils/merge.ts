import { stableStringify } from './storage';

type Item = { id: string } & Record<string, unknown>;

// `order` only mirrors an item's position in its list, so it's left out of comparisons
const sameItem = (a: Item | undefined, b: Item | undefined) =>
  a === b ||
  (a !== undefined &&
    b !== undefined &&
    stableStringify({ ...a, order: 0 }) === stableStringify({ ...b, order: 0 }));

const isItemList = (value: unknown): value is Item[] =>
  Array.isArray(value) &&
  value.every((item) => item && typeof item === 'object' && typeof item.id === 'string');

// Both sides edited the same item: each field comes from whichever side changed it (ours when
// both did), and nested lists such as a slot's links are merged item by item
const mergeFields = (base: Item, ours: Item, theirs: Item): Item => {
  const merged: Record<string, unknown> = {};
  for (const field of new Set([...Object.keys(ours), ...Object.keys(theirs)])) {
    const [b, o, t] = [base[field], ours[field], theirs[field]];
    merged[field] =
      isItemList(o) && isItemList(t)
        ? mergeById(isItemList(b) ? b : [], o, t)
        : stableStringify(o) === stableStringify(b)
          ? t
          : o;
  }
  return merged as Item;
};

// Ids of `list` that also appear in `other`, in `list`'s order
const sharedOrder = (list: Item[], other: Map<string, Item>) =>
  list.filter((item) => other.has(item.id)).map((item) => item.id);

// Three-way merge of two edited copies (ours, theirs) of an id-keyed list (slots, links, todos)
// that both started out as `base`. Additions, deletions and edits from both sides are kept; an
// edit wins over a deletion so nothing is silently lost.
export const mergeById = <T extends { id: string }>(base: T[], ours: T[], theirs: T[]): T[] => {
  const byId = (list: T[]) => new Map(list.map((item) => [item.id, item as unknown as Item]));
  const [baseItems, ourItems, theirItems] = [byId(base), byId(ours), byId(theirs)];

  const resolve = (id: string): Item | undefined => {
    const [b, o, t] = [baseItems.get(id), ourItems.get(id), theirItems.get(id)];
    if (!b) return o ?? t;
    if (!o) return sameItem(b, t) ? undefined : t;
    if (!t) return sameItem(b, o) ? undefined : o;
    if (sameItem(b, o)) return t;
    if (sameItem(b, t)) return o;
    return mergeFields(b, o, t);
  };

  // Keep the order of the side that rearranged the list (ours if both did), then the other
  // side's additions
  const weReordered =
    sharedOrder([...ourItems.values()], baseItems).join('\n') !==
    sharedOrder([...baseItems.values()], ourItems).join('\n');
  const [first, second] = weReordered ? [ours, theirs] : [theirs, ours];
  const ids = new Set([...first.map((item) => item.id), ...second.map((item) => item.id)]);

  return [...ids]
    .map(resolve)
    .filter((item): item is Item => item !== undefined)
    .map((item, index) => ('order' in item ? { ...item, order: index } : item)) as unknown as T[];
};
