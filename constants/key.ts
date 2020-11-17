export const commandKey =
  typeof window !== 'undefined' && /(Mac)/i.test(navigator.platform)
    ? 'metaKey'
    : 'ctrlKey';

export const BackspaceKey = 'Backspace';
