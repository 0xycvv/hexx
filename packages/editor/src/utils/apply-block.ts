import { BlockProps } from '../components/block/block';

interface BlockComponent<P, C, T> {
  block?: T;
  (p: BlockProps<P, C>): JSX.Element;
}

export function applyBlock<
  T extends {
    type: string;
    config?: Config;
    icon?: {
      text: string;
      svg: any;
    };
    defaultValue: any;
    isEmpty: (d: any) => boolean;
  },
  P,
  Config,
  C extends BlockComponent<T, P, Config>
>(Component: C, block: T) {
  if (Component.block) {
    Component.block = {
      ...Component.block,
      ...block,
    };
  } else {
    // @ts-ignore
    Component.block = block;
  }
}
