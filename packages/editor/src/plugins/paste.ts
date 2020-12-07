import toDOM from 'hast-util-to-dom';
import { useMemo } from 'react';
import { useEventListener } from '../hooks';
import { processor } from '../parser/html/html';
import { usePlugin } from './plugin';

export interface ReHypeTree {
  type: string;
  tagName: string;
  properties: string;
  value?: string;
  children?: ReHypeTree;
}

export function PastHtmlPlugin() {
  const {
    wrapperRef,
    editor,
    activeBlock,
    defaultBlock,
  } = usePlugin();
  const {
    idList,
    setIdMap,
    blockMap,
    batchInsertBlocks,
  } = editor;

  const allPasteConfig = useMemo(() => {
    let result: Record<
      string,
      {
        type: string;
        onPaste?: Function;
      }
    > = {};
    const arrayTagsConfig = Object.values(blockMap)
      .map((map) => {
        if (map.block?.paste) {
          return {
            key: map.block.type,
            ...map.block.paste,
          };
        }
        return null;
      })
      .filter(Boolean) as {
      tags: string[];
      key: string;
      onPaste?: Function;
    }[];
    for (const config of arrayTagsConfig) {
      for (const tag of config.tags) {
        result[tag] = {
          type: config.key,
          onPaste: config.onPaste,
        };
      }
    }
    return result;
  }, []);

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
          if (children.tagName === 'meta') {
            continue;
          }
          if (children.tagName in allPasteConfig) {
            if (slots.length > 0) {
              results.push({
                type: defaultBlock.type,
                data: {
                  text: toDOM({
                    type: 'element',
                    tagName: 'p',
                    children: slots,
                  }).outerHTML,
                },
              });
            }
            let block = {
              type: allPasteConfig[children.tagName].type,
              data:
                typeof allPasteConfig[children.tagName].onPaste ===
                'function'
                  ? allPasteConfig[children.tagName].onPaste!(
                      children,
                      toDOM,
                    )
                  : null,
            };
            results.push(block);
            slots = [];
          } else {
            slots.push(children);
          }
        }
        const index = idList.findIndex(
          (id) => id === activeBlock?.id,
        );
        if (results.length > 0) {
          batchInsertBlocks({ blocks: results, index });
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
