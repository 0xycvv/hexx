import Head from 'next/head';
import styles from '../styles/Home.module.css';
import dynamic from 'next/dynamic';
const EditorUsage = dynamic(
  () => import('../components/editor-usage'),
  {
    ssr: false,
  },
);

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <EditorUsage
          data={[
            {
              id: '1asdfs123123',
              data: {
                text: 'Hello World',
                level: 2,
              },
              type: 'header',
            },
            {
              id: '1asdfs',
              data: {
                text:
                  'Dolore voluptatibus blanditiis vitae molestiae voluptatem sed rem. Ex id quis. Reiciendis minus eveniet enim quia neque non. Qui rem hic enim. Quia id unde consectetur ipsam facilis. Minima pariatur aut aut et deserunt voluptatem autem aut veniam.',
              },
              type: 'paragraph',
            },
            {
              id: 'asdfasdf',
              data: {
                items: ['yoyo', 'text'],
              },
              type: 'list',
            },
            {
              id: '123',
              data: {},
              type: 'delimiter',
            },
          ]}
        />
                <div
          id="title"
          style={{
            width: '100vw',
            height: '50px'
          }}
        >
          Elliot Editor
        </div>
      </main>
    </div>
  );
}
