import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
    cleanup();
});

// Mock Material Symbols or other components if needed
vi.mock('@/components/ui/input', async (importOriginal) => {
    const actual = await (importOriginal as any)();
    return {
        ...actual,
    };
});
