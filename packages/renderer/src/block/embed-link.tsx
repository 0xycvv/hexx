// @ts-ignore
import ReactHtmlParser from 'react-html-parser';
import { css } from '@elliot/theme';
import * as React from 'react';

const iframeCss = css({
  width: '100%',
});

const styles = {
  wrapper: css({
    display: 'block',
    padding: 25,
    background: '#fff',
    border: '1px solid rgba(201, 201, 204, 0.48)',
    boxShadow: '0 1px 3px rgba(0,0,0, .1)',
    borderRadius: 6,
    textDecoration: 'none',
  }),
  image: css({
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    margin: '0 0 0 30px',
    width: 65,
    height: 65,
    borderRadius: 3,
    float: 'right',
  }),
  title: css({
    fontSize: 17,
    fontWeight: 600,
    lineHeight: '1.5em',
    margin: '0 0 10px 0',
    color: 'initial',
  }),
  desc: css({
    margin: '0 0 20px 0',
    fontSize: 15,
    lineHeight: '1.55em',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    color: 'initial',
  }),
  anchor: css({
    display: 'block',
    fontSize: 15,
    lineHeight: '1em',
    color: '#888 !important',
    border: '0 !important',
    padding: '0 !important',
  }),
};

export type EmbedLink = {
  type: 'embedLink';
  data: {
    link: string;
    caption: string;
    meta?: {
      image?: {
        url: string;
      };
      title?: string;
      description?: string;
    };
    embed?: {
      service: string;
      embed: string;
      width: number;
      height: number;
    };
  };
};

function isNonEmptyObject<T extends object>(obj?: T): obj is Required<T> {
  if (!obj) {
    return false;
  }
  return !(Object.keys(obj).length === 0 && obj.constructor === Object);
}

export const EmbedLinkRenderer = ({ data }: { data: EmbedLink['data'] }) => {
  if (isNonEmptyObject(data.embed)) {
    return (
      <figure>
        {/* add aspect ratio in the future */}
        <iframe
          className={iframeCss}
          width={data.embed.width}
          height={data.embed.height}
          src={data.embed.embed}
        ></iframe>
        {data.caption && (
          <figcaption>{ReactHtmlParser(data.caption)}</figcaption>
        )}
      </figure>
    );
  }

  if (isNonEmptyObject(data.meta)) {
    let url = data.link;
    try {
      url = new URL(data.link).hostname;
    } catch (error) {
      url = data.link;
    }
    return (
      <a
        className={styles.wrapper}
        rel="nofollow noindex noreferrer"
        target="_blank"
        href={data.link}
      >
        {data.meta?.image?.url && (
          <div
            className={styles.image}
            style={{
              backgroundImage: `url(${data.meta.image.url})`,
            }}
          />
        )}
        <div className={styles.title}>{data.meta.title}</div>
        <p className={styles.desc}>{data.meta.description}</p>
        <span className={styles.anchor}>{url}</span>
      </a>
    );
  }

  return null;
};
