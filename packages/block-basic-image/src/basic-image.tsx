import { applyBlock, BlockProps, useBlock } from '@hexx/editor';
import { PlaceholderButton } from '@hexx/editor/components';
import { memo } from 'react';
import { Image } from 'mdast';
import { css } from '@hexx/theme';
import { AspectRatioImage } from './renderer';
import { SvgImage } from './svg-image';

interface Config {
  onInput: (files: File[] | FileList) => Promise<string>;
}

const _BasicImageBlock = memo<BlockProps<Config>>(
  ({ id, index, config }) => {
    const { update, block } = useBlock(id, index);
    const handleImageUpdate = (url: string) => {
      update({
        ...block,
        data: {
          ...block.data,
          url,
        },
      });
    };

    if (block?.data?.url) {
      return <AspectRatioImage data={block.data} />;
    }

    return (
      <PlaceholderButton
        icon="leftIcon"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <SvgAddImage />
        <span>Add an image</span>
        <input
          hidden
          type="file"
          id={id}
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && config?.onInput) {
              config.onInput(e.target.files).then(handleImageUpdate);
            }
          }}
        />
        <label
          className={css({
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          })}
          htmlFor={id}
        ></label>
      </PlaceholderButton>
    );
  },
);

export const BasicImageBlock = applyBlock<any, Config>(
  _BasicImageBlock,
  {
    type: 'basic-image',
    icon: {
      svg: SvgImage,
      text: 'Image',
    },
    config: {
      onInput: (files: File[] | FileList) => {
        return new Promise<string>((res, rej) => {
          const reader = new FileReader();
          // @ts-ignore
          reader.onload = (e) => res(e.target.result);
          reader.onerror = (e) => rej(e);
          reader.readAsDataURL(files[0]);
        });
      },
    },
    isEmpty: (d) => !d.file?.url,
    mdast: {
      type: 'html.image',
      in: (content: Image) => ({
        url: content.url,
      }),
    },
    defaultValue: {
      url: '',
    },
  },
);
