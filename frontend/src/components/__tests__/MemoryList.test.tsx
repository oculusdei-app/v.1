import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import MemoryList from '../MemoryList';

const entries = [
  { id: '1', type: 'event', content: 'went to park', timestamp: '2024-01-01T00:00:00Z', metadata: {} },
  { id: '2', type: 'decision', content: 'buy milk', timestamp: '2024-01-02T00:00:00Z', metadata: {} }
];

vi.mock('../../context/MemoryContext', () => ({
  useMemory: () => ({ entries, refresh: vi.fn() })
}));

test('filters by type and searches', async () => {
  render(<MemoryList />);
  // filter by 'event'
  await userEvent.click(screen.getByRole('button', { name: /event/i }));
  expect(screen.getByText('went to park')).toBeInTheDocument();
  expect(screen.queryByText('buy milk')).toBeNull();

  // clear filter
  await userEvent.click(screen.getByRole('button', { name: /event/i }));

  // search for 'milk'
  await userEvent.type(screen.getByPlaceholderText(/search memories/i), 'milk');
  expect(screen.getByText('buy milk')).toBeInTheDocument();
  expect(screen.queryByText('went to park')).toBeNull();
});
