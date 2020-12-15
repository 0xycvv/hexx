export const isContentEditable = (
  target: EventTarget | Element | null,
): target is HTMLDivElement => {
  return target instanceof HTMLDivElement && target.isContentEditable;
};
