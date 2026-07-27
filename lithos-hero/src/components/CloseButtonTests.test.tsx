// src/components/CloseButtonTests.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { FOCalculatorView } from './FOCalculatorView';
import { MapView } from './MapView';
import { ReportView } from './ReportView';
import { M17View } from './M17View';
import { TacticalView } from './TacticalView';

function renderWithClose(Component, props) {
  const onClose = vi.fn();
  render(<Component {...props} onClose={onClose} isVisible={true} />);
  const button = screen.getByRole('button');
  fireEvent.click(button);
  return { onClose, button };
}

describe('Close button click callbacks', () => {
  test('FOCalculatorView close button triggers onClose', () => {
    const { onClose } = renderWithClose(FOCalculatorView, { type: 'flash_to_bang' });
    expect(onClose).toHaveBeenCalled();
  });

  test('MapView close button triggers onClose', () => {
    const { onClose } = renderWithClose(MapView, {});
    expect(onClose).toHaveBeenCalled();
  });

  test('ReportView close button triggers onClose', () => {
    const { onClose } = renderWithClose(ReportView, {});
    expect(onClose).toHaveBeenCalled();
  });

  test('M17View close button triggers onClose', () => {
    const { onClose } = renderWithClose(M17View, {});
    expect(onClose).toHaveBeenCalled();
  });

  test('TacticalView close button triggers onClose', () => {
    const { onClose } = renderWithClose(TacticalView, {});
    expect(onClose).toHaveBeenCalled();
  });
});
