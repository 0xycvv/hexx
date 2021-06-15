import dynamic from 'next/dynamic';

const EditorExample = dynamic(
  () => import('../components/editor-example'),
  {
    ssr: true,
  },
);
export default function New() {
  return <EditorExample />;
}
