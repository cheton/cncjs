# Project rules

## React component interfaces

* Document function component props using JSDoc.
* Do not add `propTypes`.
* Define runtime default values in function parameters. When removing `defaultProps`, preserve the existing default values.
* Do not use native form submission, such as `<Box as="form" onSubmit={submit}>`. Use `react-final-form` with `FormControl` components instead.

## Tonic UI migration

- Before using an unfamiliar Tonic component or prop, read the installed Tonic source or an existing local use.
- Widget modals must use `@tonic-ui/react` Modal and its supported props/composition; do not carry legacy app-Modal props or APIs into Tonic Modal call sites.

## Runtime boundaries

- Use the narrowest `ensure-type` helper only at an untrusted boundary or where the contract requires normalization.
