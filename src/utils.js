// https://link.medium.com/57ZTrytGbV
export const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x)
