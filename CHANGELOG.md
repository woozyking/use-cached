# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2020-08-05
### Changed
- [*Breaking*] `cached()` with null/undefined `key` returns unmodded hook, which would return a no-op function in place of the third `remove` function.

## [1.2.1] - 2020-05-07
### Fixed
- More reliable check against `useState` and `useReducer`, eliminates false error of unsupported hooks when working with obfuscated React library, a very common case when vendorizing using bundlers such as webpack.

### Security
- Upgrade all devDependencies, with lint and test fixes.

## [1.2.0] - 2020-05-06
### Added
- `ttlMS` optional parameter, a proxy to the underlying `lscache.setExpiryMilliseconds`.
- `cached` now accepts parameters as an Object (i.e. `cached({ key, ttl, ttlMS })`). The positional params will be deprecated in 2.0.

## [1.1.1] - 2019-09-18
### Security
- Routine `devDependencies` upgrade.

## [1.1.0] - 2019-07-15
### Added
- `cached(hook)` return list third item - `remove` function for programmatic cache removal, while keeping current in-memory state intact.

## [1.0.1] - 2019-03-31
### Added
- `cached` is additionally exported as default.

## [1.0.0] - 2019-03-29
### Changed
- `useEffect` based cache update mechanism.
- [*Breaking*] drastically changed interface (as one higher-order-function, `cached`)
- [*Breaking*] `useCachedState` is replaced by `cached` higher-order-function.

### Added
- `useReducer` support for revised higher-order-function `cached`.

## [0.1.0] - 2019-03-23
### Added
- Initial implementation of `useCachedState`.
