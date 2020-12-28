## Getting Started

install package

```bash
npm install @hexx/editor
# or
yarn add @hexx/editor
```

## Example

```jsx
import { Editor } from '@hexx/editor';
import {
  BlockMap, // default block mapping
  // preset
  PlusButton,
  TuneButton,
  InlineTool,
  // additional inline tool
  InlineCode,
  InlineMarker,
  InlineLink
} from '@hexx/editor/components';

<Editor blockMap={BlockMap}>
  <PlusButton />
  <TuneButton />
  <InlineTool>
    <InlineMarker />
    <InlineCode />
    <InlineLink />
  </InlineTool>
</Editor>
```
