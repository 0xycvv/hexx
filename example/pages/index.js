import Head from 'next/head';
import styles from '../styles/Home.module.css';
import dynamic from 'next/dynamic';
import { styled } from '@hexx/theme';
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

export default function Home() {
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
        <EditorExample
          data={[
            {
              id: '9c7ccd4f-b8ae-458e-8763-6cc20f5b8e98',
              type: 'header',
              data: {
                text: 'Getting Started',
                level: 2,
              },
            },
            {
              id: 'c4be1814-af8d-4557-8300-f719c7451270',
              type: 'paragraph',
              data: {
                text: '<p>install package</p>',
              },
            },
            {
              id: 'e157b677-9cb6-45be-a205-caae4e61962b',
              type: 'code',
              data: {
                value:
                  'npm install @hexx/editor \n# or\nyarn add @hexx/editor',
                lang: null,
              },
            },
            {
              id: 'f9c24cae-6ea9-4ba3-ad16-71ea123d7f85',
              type: 'header',
              data: {
                text:
                  '<a href="https://github.com/ericyip/hexx#example"></a>Example',
                level: 2,
              },
            },
            {
              id: 'bc16ac9d-bcf5-4b00-96ba-1b6784406acb',
              type: 'code',
              data: {
                value:
                  'import { Editor } from \'@hexx/editor\';\nimport {\n  BlockMap, // default block mapping\n  <span style="font-size: 16px;">// preset</span>\n  PlusButton,\n  TuneButton,\n  InlineTool,\n  // additional inline tool\n  InlineCode,\n  InlineMarker,\n  InlineLink\n} from \'@hexx/editor/components\';\n<editor {...props}="" blockmap="{BlockMap}"><plusbutton>\n&lt;Editor blockMap={BlockMap}&gt;\n  &lt;PlusButton /&gt;\n  &lt;TuneButton /&gt;\n  &lt;InlineTool&gt;\n    &lt;InlineMarker /&gt;\n    &lt;InlineCode /&gt;\n    &lt;InlineLink /&gt;\n  &lt;/InlineTool&gt;\n&lt;/Editor&gt;</plusbutton></editor><br>',
                lang: 'javascript',
              },
            },
            {
              type: 'paragraph',
              data: {
                text: '',
              },
              id: '0e8c1e0c-1178-47fd-ae39-d03513643199',
            },
          ]}
        />
      </main>
      <script
        type="module"
        dangerouslySetInnerHTML={{
          __html: `
            import prismjs from 'https://cdn.skypack.dev/prismjs';
            prismjs.highlightAll()
          `,
        }}
      />
    </div>
  );
}
