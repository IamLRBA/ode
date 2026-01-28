import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { HiMoon, HiSun, HiComputerDesktop, HiSwatch } from 'react-icons/hi2'
import './ThemeSwitcher.css'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  const handleThemeSelect = (selectedTheme: 'system' | 'dark' | 'light') => {
    setTheme(selectedTheme)
    // Keep dropdown open so user can switch back if needed
  }

  return (
    <div className="theme-switcher-container" ref={dropdownRef}>
      <button
        type="button"
        className={`theme-switcher-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Theme switcher"
        aria-expanded={isOpen}
        title="Themes"
      >
        <HiSwatch className="theme-switcher-icon" />
        <span className="theme-switcher-arrow mobile-only">{isOpen ? '⇑' : '⇓'}</span>
      </button>

      {isOpen && (
        <div className="theme-switcher-dropdown">
          <button
            type="button"
            className={`theme-option ${theme === 'system' ? 'active' : ''}`}
            onClick={() => handleThemeSelect('system')}
          >
            <HiComputerDesktop className="theme-option-icon" />
            <div className="theme-option-content">
              <span className="theme-option-name">System</span>
              <span className="theme-option-description">System reference</span>
            </div>
            {theme === 'system' && <span className="theme-option-check">✓</span>}
          </button>

          <button
            type="button"
            className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => handleThemeSelect('dark')}
          >
            <HiMoon className="theme-option-icon" />
            <div className="theme-option-content">
              <span className="theme-option-name">Dark</span>
              <span className="theme-option-description">Dark mode</span>
            </div>
            {theme === 'dark' && <span className="theme-option-check">✓</span>}
          </button>

          <button
            type="button"
            className={`theme-option ${theme === 'light' ? 'active' : ''}`}
            onClick={() => handleThemeSelect('light')}
          >
            <HiSun className="theme-option-icon" />
            <div className="theme-option-content">
              <span className="theme-option-name">Light</span>
              <span className="theme-option-description">Light mode</span>
            </div>
            {theme === 'light' && <span className="theme-option-check">✓</span>}
          </button>
        </div>
      )}
    </div>
  )
}
