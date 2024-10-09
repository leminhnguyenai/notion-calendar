const wait = async (condition) => {
  return new Promise((resolve) => {
    const listener = setInterval(() => {
      if (condition()) {
        clearInterval(listener);
        resolve();
      }
    }, 100);
  });
};

module.exports = wait;
