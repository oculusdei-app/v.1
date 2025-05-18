import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import MemoryForm from '../MemoryForm';

const addEntryMock = vi.fn(() => Promise.resolve());
vi.mock('../../context/MemoryContext', () => ({
  useMemory: () => ({ addEntry: addEntryMock })
}));

test('saves data and calls addEntry', async () => {
  render(<MemoryForm />);
  const textarea = screen.getByLabelText(/content/i);
  await userEvent.type(textarea, 'test memory');
  await userEvent.click(screen.getByRole('button', { name: /save memory/i }));
  expect(addEntryMock).toHaveBeenCalledWith({ type: 'event', content: 'test memory', metadata: {} });
  await screen.findByText(/memory successfully stored/i);
});
