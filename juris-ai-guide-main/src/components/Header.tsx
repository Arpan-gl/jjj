import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useSelector } from 'react-redux';

interface store {
    isLogin: boolean;
}

const Header = () => {
  const isLogin = useSelector((state: store) => state.isLogin);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Track scroll position for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Group navigation items for dropdown menus
  const mainNavItems = [
    { name: 'Home', path: '/' },
    { 
      name: 'Services', 
      id: 'services',
      isDropdown: true,
      children: [
        { name: 'Contract Analyzer', path: '/contract-analyzer' },
        { name: 'AI Lawyer', path: '/ai-lawyer' },
        { name: 'Contract Comparison', path: '/contract-comparison' },
      ]
    },
    { name: 'Features', path: '/features' },
    { name: 'About', path: '/about' },
  ];

  const accountNavItems = !isLogin ? [
    { name: 'Sign In', path: '/signIn' },
  ] : [
    {name:"Sign Out",path: "/signOut"}
  ];

  // Dropdown component for the desktop navigation
  const DesktopDropdown = ({ item }) => {
    const handleDropdownToggle = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setActiveDropdown(activeDropdown === item.id ? null : item.id);
    };
    
    const isOpen = activeDropdown === item.id;
    
    return (
      <div className="relative" ref={dropdownRef}>
        <button 
          className="flex items-center text-sm font-medium text-gray-700 hover:text-juris-primary transition-colors dark:text-gray-200 dark:hover:text-juris-secondary"
          onClick={handleDropdownToggle}
        >
          {item.name}
          <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
            {item.children.map((child) => (
              <Link
                key={child.name}
                to={child.path}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Mobile dropdown component
  const MobileDropdown = ({ item }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const toggleDropdown = (e) => {
      e.preventDefault();
      setIsOpen(!isOpen);
    };
    
    return (
      <div>
        <button 
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-juris-primary transition-colors dark:text-gray-200 dark:hover:text-juris-secondary px-3 py-2"
          onClick={toggleDropdown}
        >
          {item.name}
          <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="pl-4 space-y-1 mt-1">
            {item.children.map((child) => (
              <Link
                key={child.name}
                to={child.path}
                className="block px-3 py-2 text-sm text-gray-600 hover:text-juris-primary dark:text-gray-300 dark:hover:text-juris-secondary"
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <header className={`sticky top-0 z-30 w-full border-b transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm dark:bg-black/95' : 'bg-white dark:bg-black'
    } dark:border-gray-800`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-4xl font-bold bg-gradient-to-r from-juris-primary to-juris-accent bg-clip-text text-transparent">JurisAI</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {mainNavItems.map((item) => (
              item.isDropdown ? (
                <DesktopDropdown key={item.name} item={item} />
              ) : (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-juris-primary dark:text-juris-secondary'
                      : 'text-gray-700 hover:text-juris-primary dark:text-gray-200 dark:hover:text-juris-secondary'
                  }`}
                >
                  {item.name}
                </Link>
              )
            ))}
            
            <div className="h-4 border-l border-gray-300 dark:border-gray-700"></div>
            
            {accountNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-sm font-medium text-gray-700 hover:text-juris-primary transition-colors dark:text-gray-200 dark:hover:text-juris-secondary"
              >
                {item.name}
              </Link>
            ))}
            
            <Button size="sm" className="bg-juris-primary hover:bg-juris-primary/90 text-white" asChild>
              <Link to="/ai-lawyer">Get Started</Link>
            </Button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 dark:text-gray-200 hover:text-juris-primary focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800 animate-fade-down animate-duration-200">
            <div className="flex flex-col space-y-1">
              {mainNavItems.map((item) => (
                item.isDropdown ? (
                  <MobileDropdown key={item.name} item={item} />
                ) : (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`text-sm font-medium px-3 py-2 rounded-md ${
                      location.pathname === item.path
                        ? 'text-juris-primary bg-gray-50 dark:text-juris-secondary dark:bg-gray-900'
                        : 'text-gray-700 hover:text-juris-primary hover:bg-gray-50 dark:text-gray-200 dark:hover:text-juris-secondary dark:hover:bg-gray-900'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              ))}
              
              <div className="my-2 border-t border-gray-100 dark:border-gray-800"></div>
              
              {accountNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-sm font-medium text-gray-700 hover:text-juris-primary hover:bg-gray-50 transition-colors block px-3 py-2 rounded-md dark:text-gray-200 dark:hover:text-juris-secondary dark:hover:bg-gray-900"
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-2">
                <Button size="sm" className="w-full bg-juris-primary hover:bg-juris-primary/90" asChild>
                  <Link to="/ai-lawyer">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;