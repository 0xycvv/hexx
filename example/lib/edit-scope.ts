import {
  BasicImageBlock,
  basicImageMdast,
} from '@hexx/block-basic-image';
import { CodeBlock, codeMdast } from '@hexx/block-code';
import { presetEditableScope } from '@hexx/editor/components';
import { presetMDASTConfig } from '@hexx/editor';
import { MdastConfigs } from '../../packages/editor/src/parser/types';

export const scope = {
  ...presetEditableScope,
  code: CodeBlock,
  'basic-image': BasicImageBlock,
};

export const mdastConfigs: MdastConfigs = {
  ...presetMDASTConfig,
  'basic-image': basicImageMdast,
  code: codeMdast,
};
