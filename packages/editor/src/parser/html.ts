import unified from 'unified';
import parse from 'rehype-dom-parse';
import stringify from 'rehype-dom-stringify';
import unistUtilVisit from 'unist-util-visit';

const paragraph = (properties, children) => {
  return {
    type: 'paragraph',
    data: {
      text: children,
    },
  };
};

export const processor = unified()
  .use(parse)
  .use(attacher, {
    components: {
      div: paragraph,
      p: paragraph,
    },
  })
  // .use(stringify);
.data('settings', { fragment: true });

function attacher(options) {
  const { components = {} } = options;
  return transformer;

  function transformer(tree, file) {
    unistUtilVisit(tree, file, visitor);

    function visitor(node) {
      console.log(node);
    }
  }
}

// function hexxComponents(options) {
//   const { components = {} } = options;a
//   // @ts-ignore
//   const processor = this;
//   return (tree, vfile) => {
//     const context = { tree, vfile, processor };
//     console.log('====================================');
//     console.log(tree);
//     console.log('====================================');
//     unistUtilVisit(tree, (node: any, index, parent) => {
//       console.log(node);
//       const component = components[node.tagName];
//       if (component) {
//         const replacedNode = component(
//           node.properties,
//           node.children,
//           context,
//         );
//         parent.children[index] = replacedNode;

//         // This return value makes sure that the traversal continues by
//         // visiting the children of the replaced node (if any)
//         return [unistUtilVisit.SKIP, index];
//       }
//     });
//   };
// }
