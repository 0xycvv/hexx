import unified from 'unified';
import parse from 'rehype-dom-parse';

export const processor = unified()
  .use(parse)
  .data('settings', { fragment: true });
