import { DependencyList } from 'react';
import { DeRegisterElement, RegisterElement, useDeskproElements } from '@deskpro/app-sdk';

type UseRegisterElements = (
  fn?: (utils: {
    registerElement: RegisterElement,
    deRegisterElement: DeRegisterElement
  }) => void,
  deps?: DependencyList
) => void;

export const useRegisterElements: UseRegisterElements = (fn, deps) => {
  useDeskproElements(({ deRegisterElement, registerElement }) => {
    deRegisterElement('refresh');

    fn && fn({ deRegisterElement, registerElement });
  }, [...(deps || [])]);
};