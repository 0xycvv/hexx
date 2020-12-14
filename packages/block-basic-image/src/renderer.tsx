import { css } from '@hexx/theme';
import { useEffect, useState } from 'react';

export type BasicImage = {
  type: 'basic-image';
  data: {
    url?: string;
    width?: number;
    height?: number;
  };
};

export const BasicImageRenderer = ({
  data,
}: {
  data: BasicImage['data'];
}) => {
  if (!data.url) {
    return null;
  }
  return <AspectRatioImage data={data} />;
};

export function AspectRatioImage({
  data,
}: {
  data: BasicImage['data'];
}) {
  const [width, setWidth] = useState(data.width);
  const [height, setHeight] = useState(data.height);
  const canShowImage = !!width && !!height;

  useEffect(() => {
    if (!data.url) return;
    const img = new Image();
    img.src = data.url;
    img.onload = function() {
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
  }, [data.url]);

  if (!canShowImage) {
    return null;
  }
  const aspectRatio = height! / width!;

  return (
    <div
      className={css({
        display: 'flex',
        height: 0,
        position: 'relative',
      })}
      style={{
        width: '100%',
        paddingTop: `calc(${aspectRatio} * 100%)`,
      }}
    >
      <img
        src={data.url}
        width={'100%'}
        className={css({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        })}
        alt="gallery"
      />
    </div>
  );
}
