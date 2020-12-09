import unified from 'unified';
import parse from 'rehype-dom-parse';
import rehype2remark from 'rehype-remark';

export const processor = unified()
  .use(parse)
  .use(rehype2remark);
