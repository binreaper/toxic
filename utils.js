function createFixedStateObject(stateValues) {

    const obj = {
        isValid(newState) {
            if (this.hasOwnProperty(newState)) {
                return true;
            } else {
                return false;
            }
        }
    };

    stateValues.forEach(value=>{
      obj[value]=value;
    });

    return obj;
};


function debounce(inner, ms = 0) {
  let timer = null;
  let resolves = [];

  return function (...args) {    
    // Run the function after a certain amount of time
    clearTimeout(timer);
    timer = setTimeout(() => {
      // Get the result of the inner function, then apply it to the resolve function of
      // each promise that has been created since the last time the inner function was run
      let result = inner(...args);
      resolves.forEach(r => r(result));
      resolves = [];
    }, ms);

    return new Promise(r => resolves.push(r));
  };
}