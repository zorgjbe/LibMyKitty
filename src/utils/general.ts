export async function waitFor(func: { (): any; (): boolean; (): any }, cancelFunc = () => false) {
  while (!func()) {
    if (cancelFunc()) return false;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  return true;
}

export async function waitForElement(selector: string, options: { childCheck?: boolean; timeout?: number } = {}): Promise<Element> {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const target = document.querySelector(selector);
      if (target && (!options.childCheck || target.childElementCount > 0)) {
        observer.disconnect();
        clearTimeout(timeoutId);
        resolve(target);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const timeoutId = setTimeout(() => {
      observer.disconnect();
      console.warn(`Element with selector "${selector}" not found within timeout`);
    }, options.timeout || 10000);
  });
}
