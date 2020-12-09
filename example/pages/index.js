import Head from 'next/head';
import styles from '../styles/Home.module.css';
import dynamic from 'next/dynamic';
import { styled } from '@hexx/theme';
const EditorUsage = dynamic(
  () => import('../components/editor-usage'),
  {
    ssr: false,
  },
);

const Header = styled('header', {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  paddingLeft: 50,
  height: 56,
  fontSize: 26,
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
        {/* <script
          type="module"
          dangerouslySetInnerHTML={{
            __html: `
            import prismjs from 'https://cdn.skypack.dev/prismjs';
            prismjs.highlightAll()
          `,
          }}
        /> */}
      </Head>
      <Header>
        {SVG}
        <span style={{ marginLeft: '6px', fontSize: 20 }}>Hexx</span>
      </Header>
      <main className={styles.main}>
        <EditorUsage
          data={[
            {
              id: '1asdfs1231231',
              data: {
                value: ` onSubmit(e) {
      e.preventDefault();
      const job = {
        title: 'Developer',
        company: 'Facebook'
        };
      }`,
              },
              type: 'code',
            },
            // {
            //   id: '1asdfs123123',
            //   data: {
            //     text: 'Hello World',
            //     level: 2,
            //   },
            //   type: 'header',
            // },
            // {
            //   id: '1asdfs',
            //   data: {
            //     text:
            //       'Dolore voluptatibus blanditiis vitae molestiae voluptatem sed rem. Ex id quis. Reiciendis minus eveniet enim quia neque non. Qui rem hic enim. Quia id unde consectetur ipsam facilis. Minima pariatur aut aut et deserunt voluptatem autem aut veniam.',
            //   },
            //   type: 'paragraph',
            // },
            // {
            //   id: 'asdfasdf',
            //   data: {
            //     items: ['yoyo', 'text'],
            //   },
            //   type: 'list',
            // },
            // {
            //   id: '123',
            //   data: {},
            //   type: 'delimiter',
            // },
          ]}
        />
      </main>
    </div>
  );
}
