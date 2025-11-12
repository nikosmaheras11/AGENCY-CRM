import { vi } from 'vitest'
import { config } from 'dotenv'

// Load environment variables from .env file
config()

// Mock global objects if needed
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
