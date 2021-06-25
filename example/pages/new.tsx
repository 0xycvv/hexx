import dynamic from 'next/dynamic';
import { Editable } from '@hexx/editor/components';
import { useState } from 'react';

const EditorExample = dynamic(
  () => import('../components/editor-example'),
  {
    ssr: true,
  },
);
export default function New() {
  return <EditorExample />;
}
