# Project rules

## React component interfaces

* Document function component props using JSDoc.
* Do not add `propTypes`.
* Define runtime default values in function parameters. When removing `defaultProps`, preserve the existing default values.
* Do not use native form submission, such as `<Box as="form" onSubmit={submit}>`. Use `react-final-form` with `FormControl` components instead.

## Tonic UI migration

- Before using an unfamiliar Tonic component or prop, read the installed Tonic source or an existing local use.
- Widget modals must use `@tonic-ui/react` Modal and its supported props/composition. Use documented props such as `isOpen`, `onClose`, `size`, `isClosable`, `closeOnEsc`, and `closeOnInteractOutside`, with `ModalContent`, `ModalHeader`, `ModalBody`, and `ModalFooter`.
- Do not use legacy Modal props or APIs in Tonic Modal call sites, including `disableOverlay*`, `show`, and static Modal subcomponents.

## Runtime boundaries

- Use the narrowest `ensure-type` helper only at an untrusted boundary or where the contract requires normalization.
