const animatedElements = new WeakSet();

export const markAsAnimated = (element) => {
  animatedElements.add(element);
};

export const isAnimated = (element) => {
  return animatedElements.has(element);
};
