import React from 'react';
import { createHeaderStyle, getDeviceType } from '../../utils';

const Header = ({ 
  logoText = "Logo", 
  contactText = "Contact Us",
  onLogoClick,
  onContactClick,
  className = ""
}) => {
  const isMobile = getDeviceType() === 'MOBILE';
  
  return (
    <header style={createHeaderStyle()} className={className}>
      <div 
        style={{ 
          fontSize: isMobile ? "14px" : "16px", 
          fontWeight: "600",
          cursor: onLogoClick ? "pointer" : "default"
        }}
        onClick={onLogoClick}
      >
        {logoText}
      </div>
      <div 
        style={{ 
          fontSize: isMobile ? "12px" : "14px", 
          whiteSpace: "nowrap", 
          fontWeight: "400",
          cursor: onContactClick ? "pointer" : "default"
        }}
        onClick={onContactClick}
      >
        {contactText}
      </div>
    </header>
  );
};

export default Header;
