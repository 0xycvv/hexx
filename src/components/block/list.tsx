import * as React from 'react';
import { BackspaceKey } from 'src/constants/key';
import { useEditor } from 'src/hooks/use-editor';
import { css, styled } from 'src/stitches.config';
import {
  findContentEditable,
  lastCursor,
} from 'src/utils/find-blocks';
import { Editable } from '../editable';
import { list as ListSvg } from '../icons';
import { BlockProps } from './block';

const commonListStyle = {
  paddingLeft: 40,
  outline: 'none',
  position: 'relative',
  left: 18,
} as const;

const styles = {
  ul: {
    listStyle: 'disc',
    ...commonListStyle,
  },
  ol: {
    listStyle: 'decimal',
    ...commonListStyle,
  },
  item: {
    padding: '5.5px 0 5.5px 3px',
    lineHeight: '1.6em',
  },
};

const Ul = styled('ul', styles.ul);
const Ol = styled('ol', styles.ol);

export function ListBlock({ index, block, config }: BlockProps) {
  const ref = React.useRef<HTMLElement>(null);
  const [
    activeListItemIndex,
    setActiveListItemIndex,
  ] = React.useState<number>(0);

  const { updateBlockDataWithId } = useEditor();

  let listItems = React.Children.toArray(
    block.data.items.map((item, i) => (
      <ListItem
        placeholder={config.placeholder}
        onFocus={() => setActiveListItemIndex(i)}
        onChange={(value) => {
          let items = block.data.items;
          if (value === '') {
            items = removeItemAtIndex(block.data.items, i);
          } else {
            items = replaceItemAtIndex(block.data.items, i, value);
          }
          updateBlockDataWithId({
            id: block.id,
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
      updateBlockDataWithId({
        id: block.id,
        data: {
          ...block.data,
          items: replaceItemAtIndex(
            block.data.items,
            activeListItemIndex + 1,
            '',
          ),
        },
      });
      e.preventDefault();
    } else if (e.key === BackspaceKey) {
      if (!block.data.items[activeListItemIndex]) {
        updateBlockDataWithId({
          id: block.id,
          data: {
            ...block.data,
            items: removeItemAtIndex(
              block.data.items,
              activeListItemIndex,
            ),
          },
        });
      }
    }
  };

  React.useEffect(() => {
    requestAnimationFrame(() => {
      findContentEditable(ref.current)?.focus();
      lastCursor();
    });
  }, [block.data.items.length]);

  return (
    <Ul
      onKeyDown={handleKeyDown}
      ref={ref}
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
}) {
  return (
    <li className={css(styles.item)}>
      <Editable
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

ListBlock.block = {
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
  isEmpty: (data) => data.items.length === 0,
};
function replaceItemAtIndex(arr, index, newValue) {
  return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)];
}
function removeItemAtIndex(arr, index) {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}
