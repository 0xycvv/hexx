import { BasicImageBlock } from '@hexx/block-basic-image';
import { CodeBlock } from '@hexx/block-code';
import { BlockMap } from '@hexx/editor/components';

export const blockMap = {
  ...BlockMap,
  code: CodeBlock,
  'basic-image': BasicImageBlock,
};
