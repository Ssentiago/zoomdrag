import React from 'react';

import { GlobalValidationResult } from '../../hooks/types/interfaces';

export interface usePaginationProps {
    itemsPerPage: number;
    totalItems: number;
}

export interface UsePaginationReturn {
    page: number;
    pageStartIndex: number;
    pageEndIndex: number;
    delta: number;
    setDelta: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
    navigateToPage: (delta: number) => void;
}

export interface UseImageConfigOperationsReturn {
    handleDelete: (index: number) => Promise<void>;
    handleToggle: (index: number, value: boolean) => Promise<void>;
    handleSaveEditing: (
        index: number
    ) => Promise<
        | {
              validationResult: GlobalValidationResult;
              validated: boolean;
          }
        | undefined
    >;
}
