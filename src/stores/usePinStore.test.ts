import { usePinStore } from './usePinStore';

describe('usePinStore (Zustand) — ghim bài tập quan trọng', () => {
  beforeEach(() => {
    usePinStore.setState({ pinnedIds: [] });
  });

  it('trạng thái ban đầu: chưa ghim bài nào', () => {    expect(usePinStore.getState().pinnedIds).toEqual([]);
    expect(usePinStore.getState().isPinned('hw-1')).toBe(false);
  });

  it('togglePin ghim được và isPinned nhận đúng', () => {
    usePinStore.getState().togglePin('hw-1');
    expect(usePinStore.getState().pinnedIds).toEqual(['hw-1']);
    expect(usePinStore.getState().isPinned('hw-1')).toBe(true);
    expect(usePinStore.getState().isPinned('hw-2')).toBe(false);
  });

  it('ghim nhiều bài: bài ghim sau đứng trước trong pinnedIds', () => {
    usePinStore.getState().togglePin('hw-1');
    usePinStore.getState().togglePin('hw-2');
    expect(usePinStore.getState().pinnedIds).toEqual(['hw-2', 'hw-1']);
  });

  it('togglePin lần nữa thì bỏ ghim', () => {
    usePinStore.getState().togglePin('hw-1');
    usePinStore.getState().togglePin('hw-1');
    expect(usePinStore.getState().pinnedIds).toEqual([]);
    expect(usePinStore.getState().isPinned('hw-1')).toBe(false);
  });

  it('bỏ ghim một bài vẫn giữ các bài ghim khác', () => {
    usePinStore.getState().togglePin('hw-1');
    usePinStore.getState().togglePin('hw-2');
    usePinStore.getState().togglePin('hw-1');
    expect(usePinStore.getState().pinnedIds).toEqual(['hw-2']);
  });
});
