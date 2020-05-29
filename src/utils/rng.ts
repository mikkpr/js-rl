import Alea from 'alea';

export const rollDice = dStr => {
  const [n, d, mod] = parseDice(dStr);
  let sum = 0;
  for (let N = 0; N < n; N++) {
    const rng = Alea();
    const result = Math.floor(1 + rng() * d) + mod;
    sum += result;
  }
  return sum;
}

const parseDice = string => {
  let [n, d] = string.split('d');
  let [range, mod] = d.split('+');
  if (!mod) {
    mod = 0;
  } else {
    mod = parseInt(mod, 10)
  }
  range = parseInt(range, 10);
  n = parseInt(n, 10);
  return [n, range, mod];
}
