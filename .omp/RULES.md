# Project rules

## React component interfaces

- Document function-component props with JSDoc.
- Do not add `propTypes`.
- Put runtime defaults in function parameters. Preserve existing defaults when removing `defaultProps`.

## Tonic UI migration

- Before using an unfamiliar Tonic component or prop, read the installed Tonic source or an existing local use.

## Runtime boundaries

- Use the narrowest `ensure-type` helper only at an untrusted boundary or where the contract requires normalization.
