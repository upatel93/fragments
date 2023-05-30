/* global Buffer */

let {
  readFragment,
  readFragmentData,
  writeFragment,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('../../src/model/data/memory');

describe('Fragment Module', () => {
  let ownerId;
  let fragment;

  // New Data for each tests
  beforeEach(() => {
    ownerId = 'testuser12345';
    fragment = {
      ownerId: 'testuser12345',
      id: 'testuserfragment123456!@#$%',
      data: 'Hello Echo Delta 1234567 !@&#*(&*LJKDJ',
    };
  });

  describe('writeFragment', () => {
    test('should write a fragment to metadata', async () => {
      await writeFragment(fragment);

      const storedFragment = await readFragment(fragment.ownerId, fragment.id);
      expect(storedFragment).toEqual(fragment);
    });
  });

  describe('readFragment', () => {
    test('should read a fragment from metadata', async () => {
      await writeFragment(fragment);

      const storedFragment = await readFragment(fragment.ownerId, fragment.id);
      expect(storedFragment).toEqual(fragment);
    });

    test('should return undefined for non-existent fragment', async () => {
      const storedFragment = await readFragment(ownerId, 'fragmentIsNotInDatabase');
      expect(storedFragment).toBeUndefined();
    });
  });

  describe('writeFragmentData', () => {
    test('should write fragment data to data store', async () => {
      const buffer = Buffer.from('Fake Fragment Data ][][^!*#^!$)*%)@_*@1103242043908494f3r');

      await writeFragmentData(fragment.ownerId, fragment.id, buffer);

      const storedData = await readFragmentData(fragment.ownerId, fragment.id);
      expect(storedData).toEqual(buffer);
    });
  });

  describe('readFragmentData', () => {
    test('should read fragment data from data store', async () => {
      const buffer = Buffer.from('Fake Fragment Data ][][^!*#^!$)*%)@_*@1103242043908494f3r');
      await writeFragmentData(fragment.ownerId, fragment.id, buffer);

      const storedData = await readFragmentData(fragment.ownerId, fragment.id);
      expect(storedData).toEqual(buffer);
    });

    test('should return undefined for non-existent fragment data', async () => {
      const storedData = await readFragmentData(ownerId, 'nonexistent');
      expect(storedData).toBeUndefined();
    });
  });

  describe('listFragments', () => {
    test('should return a list of fragment ids', async () => {
      await writeFragment(fragment);

      const fragmentIds = await listFragments(fragment.ownerId);
      expect(fragmentIds).toEqual([fragment.id]);
    });

    test('should return a list of fragment objects when "expand" is true', async () => {
      await writeFragment(fragment);

      const fragments = await listFragments(fragment.ownerId, true);
      expect(fragments).toEqual([fragment]);
    });

    test('should return an empty array for non-existent user', async () => {
      const fragmentIds = await listFragments('nonexistent');
      expect(fragmentIds).toEqual([]);
    });
  });

  describe('deleteFragment', () => {
    test('should delete a fragment from metadata and data store', async () => {
      await writeFragment(fragment);
      await writeFragmentData(fragment.ownerId, fragment.id, Buffer.from('Fragment data'));

      await deleteFragment(fragment.ownerId, fragment.id);

      const storedFragment = await readFragment(fragment.ownerId, fragment.id);
      const storedData = await readFragmentData(fragment.ownerId, fragment.id);
      expect(storedFragment).toBeUndefined();
      expect(storedData).toBeUndefined();
    });
  });
});
