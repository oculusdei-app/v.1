import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import EnhancedChatInterface from './EnhancedChatInterface';

vi.mock('../../context/MemoryContext', () => {
  return {
    useMemory: () => ({
      addEntry: vi.fn().mockRejectedValue(new Error('store fail')),
      entries: [],
      isLoading: false,
      error: null,
      clearError: vi.fn(),
      refresh: vi.fn(),
      searchEntries: vi.fn(),
      getEntriesByType: vi.fn()
    })
  };
});

describe('EnhancedChatInterface error handling', () => {
  it('shows toast when memory save fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ json: async () => ({ message: 'ok' }) } as any)));
    render(<EnhancedChatInterface />);
    await userEvent.type(screen.getByRole('textbox'), 'hi');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));
    expect(await screen.findByText(/memory save failed/i)).toBeInTheDocument();
    (global.fetch as any).mockRestore();
  });
});
