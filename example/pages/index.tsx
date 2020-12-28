import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import dynamic from 'next/dynamic';
import { styled } from '@hexx/theme';
import { GetStaticProps } from 'next';
import { BlockType, createHexxMarkdownParser } from '@hexx/editor';
import { blockMap } from 'lib/block-map';
import { JSDOM } from 'jsdom';

const EditorExample = dynamic(
  () => import('../components/editor-example'),
  {
    ssr: true,
  },
);

const Header = styled('header', {
  width: '100%',
  paddingLeft: 50,
  height: 56,
  fontSize: 26,
});

const Logo = styled('a', {
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  color: 'black',
});

const SVG = (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 1l9.5 5.5v11L12 23l-9.5-5.5v-11L12 1zm0 2.311L4.5 7.653v8.694l7.5 4.342 7.5-4.342V7.653L12 3.311zM12 16a4 4 0 110-8 4 4 0 010 8zm0-2a2 2 0 100-4 2 2 0 000 4z"
      fill="#000"
    />
  </svg>
);

export default function Home(props: { json?: BlockType<any>[] }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Hexx Editor</title>
      </Head>
      <Header>
        <Logo href="https://github.com/ericyip/hexx">
          {SVG}
          <span style={{ marginLeft: '6px', fontSize: 20 }}>
            Hexx
          </span>
        </Logo>
      </Header>
      <main className={styles.main}>
        <EditorExample data={props.json} />
      </main>
      <script
        type="module"
        dangerouslySetInnerHTML={{
          __html: `
            import prismjs from 'https://cdn.skypack.dev/prismjs';
            window.onload = function() {
              prismjs.highlightAll()
            }
          `,
        }}
      />
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const markdownParser = createHexxMarkdownParser(blockMap, {
    // to support ssr or ssg you have to use jsdom in markdown parser
    document: new JSDOM().window.document,
    autoGenerateId: true,
  });
  const readmeDir = path.join(process.cwd(), '../README.md');
  const markdown = fs.readFileSync(readmeDir, 'utf8');
  const json = markdownParser.toData(markdown);
  return {
    props: {
      markdown,
      json,
    },
  };
};
