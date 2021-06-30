import { applyBlock, BlockProps, useBlock } from '@hexx/editor';
import { PlaceholderButton } from '@hexx/editor/components';
import { css } from '@hexx/theme';
import { Image } from 'mdast';
import { AspectRatioImage } from './renderer';
import { SvgImage } from './svg-image';

interface Config {
  onInput: (files: File[] | FileList) => Promise<string>;
}

const _BasicImageBlock = ({
  id,
  config,
  blockAtom,
}: BlockProps<Config>) => {
  const { update, block } = useBlock(blockAtom);
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
      <SvgImage />
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
        })()}
        htmlFor={id}
      ></label>
    </PlaceholderButton>
  );
};

export const BasicImageBlock = applyBlock<any, Config>(
  _BasicImageBlock,
  {
    type: 'basic-image',
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
    defaultValue: {
      url: '',
    },
  },
);

export const ImageIcon = {
  svg: SvgImage,
  text: 'Image',
};

export const basicImageMdast = {
  type: 'html.image',
  blockType: 'basic-image',
  in: (content: Image) => ({
    url: content.url,
  }),
};
