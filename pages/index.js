import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { Editor } from '../components/editor';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Editor
          data={[
            {
              id: '1asdfs',
              data:
                'Dolore voluptatibus blanditiis vitae molestiae voluptatem sed rem. Ex id quis. Reiciendis minus eveniet enim quia neque non. Qui rem hic enim. Quia id unde consectetur ipsam facilis. Minima pariatur aut aut et deserunt voluptatem autem aut veniam.',
              type: 'paragraph',
            },
          ]}
        />
      </main>
    </div>
  );
}
