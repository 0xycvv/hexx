import toDOM from 'hast-util-to-dom';

export function stringify(config) {
  const settings = { ...config, ...this.data('settings') };

  if (settings.fragment == null) {
    settings.fragment = true;
  }

  this.Compiler = compiler;

  function compiler(tree) {
    const node = toDOM(tree, settings);
    const serialized = new XMLSerializer().serializeToString(node);

    // XMLSerializer puts xmlns on root elements (typically the document
    // element, but in case of a fragment all of the fragments children).
    // We’re using the DOM, and we focus on HTML, so we can always remove HTML
    // XMLNS attributes (HTML inside SVG does not need to have an XMLNS).
    return serialized;
  }
}
