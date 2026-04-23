import { render, screen, waitFor } from '@testing-library/react';
import InboxList from '../InboxList';

const sampleItems = [
  {
    id: 'clv1',
    campaignId: 'camp1',
    amount: 50,
    recipientRef: 'r1',
    evidenceRef: null,
    status: 'requested',
    uiStatus: 'pending_review',
    nextStep: 'Review evidence — approve, reject, or request resubmission.',
    deepLink: '/verification/clv1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('InboxList', () => {
  beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => sampleItems,
    });
  });

  afterEach(() => {
    // @ts-ignore
    global.fetch.mockRestore && global.fetch.mockRestore();
  });

  it('renders inbox items and next-step messaging', async () => {
    render(<InboxList />);

    expect(screen.getByText(/Verification Inbox/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Claim clv1/)).toBeInTheDocument();
      expect(screen.getByText(/Review evidence/)).toBeInTheDocument();
      expect(screen.getByText(/Open/)).toBeInTheDocument();
    });
  });
});
