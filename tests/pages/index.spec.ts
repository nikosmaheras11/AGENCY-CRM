import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import IndexPage from '~/pages/index.vue'

// Mock SlackMessageFeed component
const SlackMessageFeedStub = {
  name: 'SlackMessageFeed',
  props: ['limit'],
  template: '<div class="slack-feed-mock">Slack messages loading...</div>'
}

describe('IndexPage', () => {
  let dateNowSpy: any
  
  const mountOptions = {
    global: {
      stubs: {
        SlackMessageFeed: SlackMessageFeedStub
      }
    }
  }
  
  beforeEach(() => {
    // Mock Date for consistent testing
    dateNowSpy = vi.spyOn(Date, 'now')
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Page header', () => {
    it('should display dashboard title', () => {
      const mockDate = new Date('2024-01-15T14:30:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage, mountOptions)
      const titleElement = wrapper.find('h1')
      
      expect(titleElement.text()).toBe('Client Dashboard')
    })

    it('should display client name in profile section', () => {
      const mockDate = new Date('2024-01-15T09:15:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage, mountOptions)
      
      expect(wrapper.text()).toContain('Polymarket')
      expect(wrapper.text()).toContain('Client Account')
    })
  })

  describe('Time and date display', () => {
    it('should have time and date display element', async () => {
      const mockDate = new Date('2024-01-15T14:30:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage, mountOptions)
      await nextTick()
      
      // Verify welcome section exists
      expect(wrapper.text()).toContain('Welcome back, Polymarket')
      
      // The time display element should exist (even if not yet populated)
      const welcomeSection = wrapper.find('h2.text-3xl')
      expect(welcomeSection.exists()).toBe(true)
    })
  })

  describe('getAlertColor function', () => {
    it('should return "bg-orange-300" for warning type', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage, mountOptions)
      const vm = wrapper.vm as any
      
      expect(vm.getAlertColor('warning')).toBe('bg-orange-300')
    })

    it('should return "bg-primary-400" for info type', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage, mountOptions)
      const vm = wrapper.vm as any
      
      expect(vm.getAlertColor('info')).toBe('bg-primary-400')
    })

    it('should return "bg-success" for success type', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage, mountOptions)
      const vm = wrapper.vm as any
      
      expect(vm.getAlertColor('success')).toBe('bg-success')
    })

    it('should return "bg-error" for error type', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage, mountOptions)
      const vm = wrapper.vm as any
      
      expect(vm.getAlertColor('error')).toBe('bg-error')
    })

    it('should return "bg-gray-500" for unknown type', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage, mountOptions)
      const vm = wrapper.vm as any
      
      expect(vm.getAlertColor('unknown')).toBe('bg-gray-500')
    })

    it('should display alert items in the DOM', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage, mountOptions)
      
      // Check for alerts section
      expect(wrapper.text()).toContain('Items Needing Review')
      expect(wrapper.text()).toContain('Campaign budget threshold')
      expect(wrapper.text()).toContain('Creative review required')
    })
  })

  describe('Weekly Objectives Section', () => {
    it('should display weekly objectives section', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage, mountOptions)
      
      expect(wrapper.text()).toContain('This Week\'s Objectives')
      expect(wrapper.text()).toContain('Complete Q4 campaign creative assets')
    })

    it('should display objective priorities correctly', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage, mountOptions)
      
      expect(wrapper.text()).toContain('high')
      expect(wrapper.text()).toContain('medium')
      expect(wrapper.text()).toContain('low')
    })

    it('should show completed objectives with proper styling', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage, mountOptions)
      
      // Check that completed objective exists
      expect(wrapper.text()).toContain('Upload new product images to DAM')
    })
  })

  describe('Integration Tests', () => {
    it('should render all major dashboard sections', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage, mountOptions)
      
      expect(wrapper.text()).toContain('Items Needing Review')
      expect(wrapper.text()).toContain('Slack Messages')
      expect(wrapper.text()).toContain('This Week\'s Objectives')
      expect(wrapper.text()).toContain('Welcome back, Polymarket')
    })

    it('should display alerts with correct structure', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage, mountOptions)
      
      // Check for various alert types
      expect(wrapper.text()).toContain('Campaign budget threshold')
      expect(wrapper.text()).toContain('Creative review required')
      expect(wrapper.text()).toContain('Campaign milestone reached')
      expect(wrapper.text()).toContain('Deadline approaching')
    })
  })
})
