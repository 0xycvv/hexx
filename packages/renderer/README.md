## Hexx Renderer

install package

```bash
npm install @hexx/editor
# or
yarn add @hexx/editor
```

### Example

```tsx
import { EditorRenderer, PresetScope } from '@hexx/renderer';

const blocks = [{ type: 'paragraph', data: { text: 'render' }}]

<EditorRenderer
  wrapper={wrapperProps} // override wrapper by props (optional)
  blockWrapper={blockWrapperProps} // override blockWrapper by props (optional)
  blocks={blocks}
  scope={PresetScope}
/>
```
