# Test Suite

This directory contains unit and integration tests for the Agency Dashboard OS application.

## Testing Stack

- **Vitest**: Fast unit testing framework for Vite/Nuxt
- **@vue/test-utils**: Official testing library for Vue components
- **@nuxt/test-utils**: Nuxt-specific testing utilities
- **happy-dom**: Lightweight DOM implementation for testing

## Running Tests

```bash
# Run tests once
pnpm test

# Run tests in watch mode (development)
pnpm vitest

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

## Test Structure

### `tests/pages/index.spec.ts`

Comprehensive unit tests for the main dashboard page (`pages/index.vue`), covering:

#### 1. **currentTime Computed Property** (5 tests)
Tests that the current time displays correctly in 12-hour format with AM/PM:
- General format validation
- Morning time (9:15 AM)
- Afternoon time (3:45 PM)
- Midnight (12:00 AM)
- Noon (12:00 PM)

#### 2. **timeOfDay Computed Property** (8 tests)
Tests the greeting logic based on the current hour:
- Morning greeting (hours 0-11)
- Afternoon greeting (hours 12-17)
- Evening greeting (hours 18-23)
- Edge cases at boundaries (11:59 AM, 12:00 PM, 5:59 PM, 6:00 PM, midnight)

#### 3. **getAlertColor Function** (6 tests)
Tests CSS class selection for different alert types:
- Warning alerts → `bg-orange-500`
- Info alerts → `bg-blue-500`
- Success alerts → `bg-green-500`
- Error alerts → `bg-red-500`
- Unknown types → `bg-slate-500` (fallback)
- DOM integration test for alert dots

#### 4. **Campaign Performance Card** (6 tests)
Tests the campaign performance dashboard widget:
- Displays impressions value correctly (840K)
- Shows positive trend badge (+16%)
- Renders 7 mini bar chart bars (one per day)
- Sets correct bar heights based on data
- Shows day labels (M, T, W, TH, F, S, SU)
- Includes period selector buttons (DAY, WK, MO)

#### 5. **Budget Utilization Card** (7 tests)
Tests the budget tracking widget:
- Displays total budget (360K)
- Shows utilization percentage (65%)
- Lists all budget categories (Social Media, Display Ads, Video, Search, Email)
- Shows correct values for each category
- Renders progress bars for each category
- Sets correct width percentages for progress bars (85%, 60%, 75%, etc.)
- Includes period selector buttons

#### 6. **Integration Tests** (2 tests)
Higher-level tests for component integration:
- Time-based reactivity
- Complete dashboard section rendering

## Test Coverage Summary

**Total Tests**: 34  
**Status**: ✅ All Passing

### Coverage by Feature:
- ✅ Time formatting and display
- ✅ Time-based greetings
- ✅ Alert color coding system
- ✅ Campaign performance metrics and visualization
- ✅ Budget tracking and breakdown
- ✅ Dashboard layout and structure

## Testing Best Practices

1. **Time Mocking**: Tests use `vi.setSystemTime()` to ensure consistent time-based testing
2. **Component Isolation**: Each test mounts the component independently
3. **DOM Testing**: Tests verify both logic and DOM rendering
4. **Edge Cases**: Boundary conditions are thoroughly tested (midnight, noon, etc.)
5. **Descriptive Names**: Test names clearly describe what is being tested

## Adding New Tests

When adding new tests:

1. Create test files in the appropriate directory structure
2. Follow the naming convention: `[component-name].spec.ts`
3. Group related tests using `describe()` blocks
4. Use descriptive test names with `it()`
5. Mock external dependencies and time-sensitive operations
6. Test both functionality and DOM rendering

## Example Test Structure

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import YourComponent from '~/path/to/YourComponent.vue'

describe('YourComponent', () => {
  it('should do something specific', () => {
    const wrapper = mount(YourComponent)
    expect(wrapper.text()).toContain('expected value')
  })
})
```

## Troubleshooting

### Tests not running
- Ensure all dependencies are installed: `pnpm install`
- Check that Nuxt development server is not blocking ports

### Time-based tests failing
- Verify `vi.setSystemTime()` is called before mounting components
- Check timezone settings if using locale-specific formatting

### DOM selector failures
- Verify the component structure hasn't changed
- Use more specific selectors or data-testid attributes
- Check if Tailwind classes are being escaped properly in selectors

## CI/CD Integration

To run tests in CI/CD pipelines:

```yaml
- name: Run Tests
  run: pnpm vitest run
```
