---
description: "Generate Jest/Vitest unit tests for a React component or Express controller in the booking app. Use when adding test coverage for a new or existing module."
argument-hint: "Enter the file path to test (e.g. src/components/Dashboard.jsx or server/controllers/appointmentController.js)"
tools: [read, search, edit, execute]
---

<!-- CREATE FRAMEWORK — Unit Test Generation -->

## C — Context

You are writing unit tests for the **SJ Dental Care Booking App**.
- File to test: **${{ input:file_path }}**
- Testing framework: **Vitest** (frontend) and **Jest** (backend)
- Frontend: React 19 with `@testing-library/react`; mock API via `vi.mock('../services/api')`
- Backend: Jest with `jest.mock('../../database/db')`
- Coverage target: 80%+ for all new code
- Tests MUST be runnable — no placeholders or `/* ... */` stubs

## R — Role

You are a **QA Engineer / Test Automation Specialist** who writes thorough, readable unit tests.
You test behavior, not implementation. You never leave a test that always passes.

## E — Execute

1. Read the target file to understand its props, state, and dependencies.
2. Identify all testable behaviors: render states, user interactions, API call responses, error states.
3. Map each ACS acceptance criterion (if applicable) to a test case.
4. Write the **complete, runnable** test file following the template below.
5. Save to the correct location: `src/__tests__/<ComponentName>.test.jsx` or `server/__tests__/<controllerName>.test.js`.
6. Run the tests (`npm test -- --run` or `cd server && npm test`) and report the actual output.

## A — Adjust

- Each `it()` block tests exactly ONE behavior
- Test names follow: `'<does X> when <condition>'`
- Never test CSS classes or internal state — test DOM output and user behavior
- All network calls MUST be mocked — no real HTTP in unit tests
- **Use `vi.resetAllMocks()` (not `clearAllMocks`) in `beforeEach`** to prevent mock bleed between tests
- **Every mock must declare an explicit return value** — bare `vi.fn()` / `jest.fn()` without `.mockResolvedValue()` or `.mockReturnValue()` is forbidden
- **Mandatory test coverage per file**:
  - Happy path (successful data load + render)
  - Loading / pending state
  - Error state (API returns `{ success: false }` or throws)
  - Empty data state (API returns `{ success: true, data: [] }`)
- For Express controllers: test each HTTP status code the controller can return; always include `next` param and verify `next(error)` is called on throws

## T — Template

**Frontend (React component)**:
```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ComponentName from '../components/ComponentName';
import * as api from '../services/api';

vi.mock('../services/api');

describe('ComponentName', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Declare default mock return values here — overridden per-test as needed
    api.fetchAppointments.mockResolvedValue({
      success: true,
      data: [{ id: 1, patientName: 'Alice', date: '2026-05-10', status: 'upcoming' }],
    });
  });

  it('renders appointment list when fetch succeeds', async () => {
    render(<ComponentName />);
    expect(await screen.findByText('Alice')).toBeInTheDocument();
  });

  it('shows loading placeholder before data resolves', () => {
    api.fetchAppointments.mockReturnValue(new Promise(() => {})); // never resolves
    render(<ComponentName />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows error message when API returns failure', async () => {
    api.fetchAppointments.mockResolvedValue({ success: false, message: 'Server error' });
    render(<ComponentName />);
    expect(await screen.findByText(/server error/i)).toBeInTheDocument();
  });

  it('shows empty state when no appointments returned', async () => {
    api.fetchAppointments.mockResolvedValue({ success: true, data: [] });
    render(<ComponentName />);
    expect(await screen.findByText(/no appointments/i)).toBeInTheDocument();
  });
});
```

**Backend (Express controller)**:
```js
'use strict';
const { getAppointments } = require('../../controllers/appointmentController');
const db = require('../../database/db');

jest.mock('../../database/db');

describe('getAppointments', () => {
  let req, res, next;

  beforeEach(() => {
    jest.resetAllMocks();
    req = { params: {}, query: {}, body: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('returns 200 with data array on success', () => {
    const mockData = [{ id: 1, patientName: 'Alice', status: 'upcoming' }];
    db.getAppointments.mockReturnValue(mockData);

    getAppointments(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockData });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next(error) when db throws', () => {
    const dbError = new Error('DB connection failed');
    db.getAppointments.mockImplementation(() => { throw dbError; });

    getAppointments(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
    expect(res.json).not.toHaveBeenCalled();
  });

  it('returns empty array when db returns no rows', () => {
    db.getAppointments.mockReturnValue([]);

    getAppointments(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ success: true, data: [] });
  });
});
```

## E — Example

**Input**: `src/components/Dashboard.jsx`

**Output**: `src/__tests__/Dashboard.test.jsx` with 6 runnable tests:
1. All 4 stat tiles render on mount
2. Tiles show `—` placeholder while API is pending
3. Clicking a tile highlights it (`aria-pressed="true"`)
4. Clicking active tile again clears filter
5. Tile count updates after booking
6. Handles stats API error without crashing

**Run result** (paste actual terminal output):
```
✓ Dashboard > renders 4 stat tiles on mount (42ms)
✓ Dashboard > shows placeholder while loading (8ms)
...
Test Files  1 passed (1)
Tests       6 passed (6)
```
