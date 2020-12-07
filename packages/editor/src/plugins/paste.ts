import toDOM from 'hast-util-to-dom';
import { useEventListener } from '../hooks';
import { processor } from '../parser/html/html';
import { usePlugin } from './plugin';

export function PastHtmlPlugin() {
  const { wrapperRef, editor, activeBlock } = usePlugin();
  const { idList, insertBlock, setIdMap } = editor;

  useEventListener(
    'paste',
    (e) => {
      const html = e.clipboardData?.getData('text/html');
      if (!html) return;
      try {
        const htmlAST = processor.parse(html) as any;
        let slots: any = [];
        let results: any[] = [];
        for (const children of htmlAST.children) {
          switch (children.tagName) {
            case 'meta':
              break;
            case 'div':
            case 'p':
              if (slots.length > 0) {
                results.push({
                  type: 'paragraph',
                  data: {
                    text: toDOM({
                      type: 'element',
                      tagName: 'p',
                      children: slots,
                    }).outerHTML,
                  },
                });
              }
              results.push({
                type: 'paragraph',
                data: {
                  text: toDOM(children).outerHTML,
                },
              });
              slots = [];
              break;
            case 'ol':
              {
                if (slots.length > 0) {
                  results.push({
                    type: 'paragraph',
                    data: {
                      text: toDOM({
                        type: 'element',
                        tagName: 'p',
                        children: slots,
                      }).innerHTML,
                    },
                  });
                }
                const items = children.children.map(
                  (s) => toDOM(s).innerHTML,
                );
                results.push({
                  type: 'list',
                  data: {
                    style: 'ordered',
                    items,
                  },
                });
                slots = [];
              }
              break;
            case 'ul':
              if (slots.length > 0) {
                results.push({
                  type: 'paragraph',
                  data: {
                    text: toDOM({
                      type: 'element',
                      tagName: 'p',
                      children: slots,
                    }).outerHTML,
                  },
                });
              }
              let items = children.children.map(
                (s) => toDOM(s).innerHTML,
              );
              results.push({
                type: 'list',
                data: {
                  style: 'unordered',
                  items,
                },
              });
              slots = [];
              break;
            default:
              slots.push(children);
              break;
          }
        }
        const index = idList.findIndex(
          (id) => id === activeBlock?.id,
        );
        if (results.length > 0) {
          requestAnimationFrame(() => {
            for (const parsed of results) {
              insertBlock({ block: parsed, index });
            }
          });
          e.preventDefault();
        }
        if (slots.length > 0) {
          if (activeBlock?.id) {
            setIdMap((s) => s);
          }
        }
      } catch (error) {
        console.error('[hexx] error when pasting html', error);
      }
    },
    wrapperRef,
  );
  return null;
}
