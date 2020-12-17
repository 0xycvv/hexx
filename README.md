Hexx Editor

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
  BlockMap,
  PlusButton,
  TuneButton,
} from '@hexx/editor/components';

<Editor {...props} blockMap={BlockMap}>
  <PlusButton />
  <TuneButton />
  <InlineTool>
    <InlineMarker />
    <InlineCode />
    <InlineLink />
  </InlineTool>
</Editor>;
```
