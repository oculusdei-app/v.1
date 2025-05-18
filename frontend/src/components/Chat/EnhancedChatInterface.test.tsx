import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import EnhancedChatInterface from './EnhancedChatInterface';

const fetchMock = vi.fn((input: RequestInfo, init?: RequestInit) => {
  if (typeof input === 'string' && input === '/proxy/ai') {
    return Promise.resolve({ json: () => Promise.resolve({ message: 'hi there' }) }) as any;
  }
  return Promise.resolve({ json: () => Promise.resolve({}) }) as any;
});

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('sends message and displays reply', async () => {
  render(<EnhancedChatInterface />);
  await userEvent.type(screen.getByPlaceholderText(/type your message/i), 'hello');
  const buttons = screen.getAllByRole('button');
  const sendButton = buttons[buttons.length - 1];
  await userEvent.click(sendButton);
  expect(fetchMock).toHaveBeenCalledWith('/proxy/ai', expect.anything());
  await screen.findByText('hello');
  await screen.findByText('hi there');
});
