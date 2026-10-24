/** Normalize visible punctuation without changing saved knowledge or source evidence. */
export function installDisplayPunctuation() {
  const ignored = "script, style, textarea, input, [contenteditable='true']";
  const clean = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.parentElement?.closest(ignored)) return;
      const current = node.nodeValue ?? "";
      const next = current.replace(/\s*\u2014\s*/g, "; ");
      if (current !== next) node.nodeValue = next;
      return;
    }
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    let text = walker.nextNode();
    while (text) {
      clean(text);
      text = walker.nextNode();
    }
  };
  clean(document.body);
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "characterData") clean(record.target);
      else record.addedNodes.forEach(clean);
    }
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true });
  return () => observer.disconnect();
}