import { List, listStyle } from '@hexx/renderer';
import { css, styled } from '@hexx/theme';
import * as mdast from 'mdast';
import * as React from 'react';
import { BlockAtom } from '../../constants/atom';
import { BackspaceKey } from '../../constants/key';
import composeRefs from '../../hooks/use-compose-ref';
import { useBlock, useEditor } from '../../hooks/use-editor';
import { applyBlock, BlockProps } from '../../utils/blocks';
import { lastCursor } from '../../utils/find-blocks';
import {
  extractFragmentFromPosition,
  getSelectionRange,
} from '../../utils/ranges';
import { Editable } from '../editable';
import { IcNumList, list as ListSvg } from '../icons';

const Ul = styled('ul', listStyle.ul);
const Ol = styled('ol', listStyle.ol);

function _ListBlock({
  index,
  id,
  config,
  blockAtom,
}: BlockProps<{ placeholder: string }, List['data']>) {
  const ref = React.useRef<HTMLElement>(null);
  const [activeListItemIndex, setActiveListItemIndex] =
    React.useState<number>(0);

  const { update, block } = useBlock(blockAtom, index);
  const { defaultBlock, insertBlockAfter } = useEditor();

  const handleEmptyListItem = (i: number) => {
    const items = removeItemAtIndex(block.data.items, i);
    update({
      ...block,
      data: {
        ...block.data,
        items: [...items],
      },
    });
  };

  let listItems = React.Children.toArray(
    block.data.items.map((item, i) => (
      <ListItem
        index={i}
        blockAtom={blockAtom}
        blockId={block.id}
        blockIndex={index}
        placeholder={config?.placeholder}
        onFocus={() => setActiveListItemIndex(i)}
        onChange={(value) => {
          let items = block.data.items;
          items = replaceItemAtIndex(block.data.items, i, value);
          update({
            ...block,
            data: {
              ...block.data,
              items,
            },
          });
        }}
        data={item}
      />
    )),
  );
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!e.shiftKey && e.key === 'Enter') {
      let items = block.data.items;
      if (!block.data.items[activeListItemIndex]) {
        handleEmptyListItem(activeListItemIndex);
        insertBlockAfter({
          atom: blockAtom,
          block: defaultBlock,
        });
        // setTimeout(() => {
        //   focusBlockByIndex(index + 1);
        // }, 0);
        e.stopPropagation();
        e.preventDefault();
      }
      if (!!block.data.items[activeListItemIndex]) {
        const fragments = extractFragmentFromPosition();
        if (!fragments) return;
        const { current, next } = fragments;
        items = replaceItemAtIndex(
          items,
          activeListItemIndex,
          current,
        );
        items = insertItemAtIndex(
          items,
          activeListItemIndex + 1,
          next,
        );
        update({
          ...block,
          data: {
            ...block.data,
            items,
          },
        });
        e.stopPropagation();
        e.preventDefault();
      }
    } else if (e.key === BackspaceKey) {
      if (
        !block.data.items[activeListItemIndex] ||
        block.data.items[activeListItemIndex] === '<br>'
      ) {
        handleEmptyListItem(activeListItemIndex);
        return;
      }
      const range = getSelectionRange();
      if (range?.collapse && range.startOffset === 0) {
        const liEditableList = ref.current?.querySelectorAll(
          'li [contenteditable]',
        );
        const previousListItem =
          liEditableList && liEditableList[activeListItemIndex - 1];
        if (
          previousListItem &&
          previousListItem instanceof HTMLDivElement
        ) {
          previousListItem.focus();
          lastCursor();
          e.preventDefault();
          e.stopPropagation();
        }
      }
    }
  };

  return (
    <Ul
      onKeyDown={handleKeyDown}
      ref={ref as any}
      css={{
        listStyle:
          block.data.style === 'unordered' ? 'disc' : 'decimal',
      }}
      as={block.data.style === 'unordered' ? Ul : Ol}
    >
      {listItems}
    </Ul>
  );
}

function ListItem(props: {
  data: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  placeholder?: string;
  index: number;
  blockId: string;
  blockIndex: number;
  blockAtom: BlockAtom;
}) {
  const { registerByIndex } = useBlock(
    props.blockAtom,
    props.blockIndex,
  );

  const ref = React.useRef<HTMLLIElement>(null);

  React.useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <li className={css(listStyle.item)()}>
      <Editable
        ref={composeRefs(registerByIndex(props.index), ref)}
        placeholder={props.placeholder}
        onFocus={props.onFocus}
        onChange={(e) => {
          props.onChange(e.target.value);
        }}
        html={props.data}
      />
    </li>
  );
}

export const ListBlock = applyBlock<
  List['data'],
  { placeholder: string }
>(_ListBlock, {
  type: 'list',
  icon: {
    text: 'List',
    svg: ListSvg,
  },
  config: {
    placeholder: 'list',
  },
  defaultValue: {
    items: [''],
    style: 'unordered',
  },
  mdast: {
    type: 'list',
    in: (content: mdast.List, toHTML) => ({
      style: content.ordered ? 'ordered' : 'unordered',
      items: content.children.map((child) => toHTML(child).innerHTML),
    }),
  },
  tune: [
    {
      icon: {
        text: 'Bullet',
        svg: ListSvg,
        isActive: (data) => data.style === 'unordered',
      },
      updater: (data) => ({ ...data, style: 'unordered' }),
    },
    {
      icon: {
        text: 'Number',
        svg: IcNumList,
        isActive: (data) => data.style === 'ordered',
      },
      updater: (data) => ({ ...data, style: 'ordered' }),
    },
  ],
  isEmpty: (data) => data.items.length === 0,
});

function insertItemAtIndex(arr, index, newValue) {
  return [...arr.slice(0, index), newValue, ...arr.slice(index)];
}

function replaceItemAtIndex(arr, index, newValue) {
  return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)];
}
function removeItemAtIndex(arr, index) {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}
