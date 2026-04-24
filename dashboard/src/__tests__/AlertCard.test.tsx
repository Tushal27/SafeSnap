import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AlertCard } from '../features/alerts/components/AlertCard';
import type { Alert } from '../types';

const makeAlert = (overrides: Partial<Alert> = {}): Alert => ({
  id: 'alert-uuid-1',
  childId: 'child-uuid-1',
  timestamp: new Date(Date.now() - 60_000).toISOString(),
  severityScore: 0.87,
  imageHash: 'a3f8c2d1e4b5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
  severity: 'HIGH',
  acknowledged: false,
  acknowledgedAt: null,
  ...overrides,
});

describe('AlertCard', () => {
  it('renders severity badge with the correct severity', () => {
    render(
      <AlertCard
        alert={makeAlert({ severity: 'CRITICAL' })}
        onAcknowledge={vi.fn()}
        onViewDetail={vi.fn()}
      />,
    );
    const badge = screen.getByTestId('severity-badge');
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toMatch(/critical/i);
  });

  it('shows acknowledge button when alert is not acknowledged', () => {
    render(
      <AlertCard
        alert={makeAlert({ acknowledged: false })}
        onAcknowledge={vi.fn()}
        onViewDetail={vi.fn()}
      />,
    );
    expect(screen.getByTestId('acknowledge-button')).toBeInTheDocument();
  });

  it('hides acknowledge button when alert is already acknowledged', () => {
    render(
      <AlertCard
        alert={makeAlert({ acknowledged: true, acknowledgedAt: new Date().toISOString() })}
        onAcknowledge={vi.fn()}
        onViewDetail={vi.fn()}
      />,
    );
    expect(screen.queryByTestId('acknowledge-button')).not.toBeInTheDocument();
  });

  it('calls onAcknowledge with the alert id when button is clicked', async () => {
    const onAcknowledge = vi.fn().mockResolvedValue(undefined);
    render(
      <AlertCard
        alert={makeAlert()}
        onAcknowledge={onAcknowledge}
        onViewDetail={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId('acknowledge-button'));
    await waitFor(() => {
      expect(onAcknowledge).toHaveBeenCalledWith('alert-uuid-1');
    });
  });

  it('calls onViewDetail when Details button is clicked', () => {
    const onViewDetail = vi.fn();
    const alert = makeAlert();
    render(
      <AlertCard
        alert={alert}
        onAcknowledge={vi.fn()}
        onViewDetail={onViewDetail}
      />,
    );
    fireEvent.click(screen.getByText('Details'));
    expect(onViewDetail).toHaveBeenCalledWith(alert);
  });

  it('shows truncated image hash — never the full hash or any image data', () => {
    const hash = 'a3f8c2d1e4b5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1';
    render(
      <AlertCard
        alert={makeAlert({ imageHash: hash })}
        onAcknowledge={vi.fn()}
        onViewDetail={vi.fn()}
      />,
    );
    // The full hash is 64 chars; truncated display should be shorter
    const hashDisplay = screen.getByText(/a3f8/i);
    expect(hashDisplay.textContent!.length).toBeLessThan(hash.length);
  });
});
