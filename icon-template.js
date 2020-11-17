function iconTemplate(
  { template },
  opts,
  { imports, componentName, props, jsx, exports, interfaces },
) {
  const typeScriptTpl = template.smart({
    plugins: ['typescript'],
  });

  return typeScriptTpl.ast`
    ${imports}
    ${interfaces}
    function ${componentName}(${props}) {
      return ${jsx};
    }
    ${exports}
  `;
}

module.exports = iconTemplate;
