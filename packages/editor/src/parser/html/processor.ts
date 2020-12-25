import unified from 'unified';
import parse from 'rehype-dom-parse';
import rehype2remark from 'rehype-remark';
import markdown from '@enkidevs/remark-stringify';
export const processor = unified()
  .use(parse)
  .use(rehype2remark)
  .use(markdown);
