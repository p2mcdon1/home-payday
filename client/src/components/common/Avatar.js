import React from 'react';
import { Image } from 'react-bootstrap';

/**
 * Avatar component that displays an avatar image with a default fallback
 * 
 * @param {string|Blob} avatar - Avatar data (base64 string, blob URL, or image URL)
 * @param {string} name - Name to use for default avatar initials
 * @param {string} size - Size class ('sm', 'md', 'lg') or custom size in pixels (default: 'md')
 * @param {string} className - Additional CSS classes
 * @param {Object} style - Additional inline styles
 */
function Avatar({ avatar, name = '', size = 'md', className = '', style = {} }) {
  // Size mapping
  const sizeMap = {
    sm: { width: '32px', height: '32px', fontSize: '0.75rem' },
    md: { width: '48px', height: '48px', fontSize: '1rem' },
    lg: { width: '64px', height: '64px', fontSize: '1.25rem' },
  };

  // Determine size
  const sizeStyle = typeof size === 'string' && sizeMap[size] 
    ? sizeMap[size] 
    : { width: size, height: size, fontSize: '1rem' };

  // Generate default avatar with initials
  const getDefaultAvatar = () => {
    const initials = name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2) || '?';
    
    return (
      <div
        className={`d-flex align-items-center justify-content-center bg-secondary text-white rounded-circle ${className}`}
        style={{
          ...sizeStyle,
          ...style,
          fontWeight: 'bold',
        }}
        title={name}
      >
        {initials}
      </div>
    );
  };

  // If no avatar provided, show default
  if (!avatar) {
    return getDefaultAvatar();
  }

  // Determine avatar source
  let avatarSrc = null;
  if (typeof avatar === 'string') {
    // Check if it's a base64 data URL or regular URL
    if (avatar.startsWith('data:') || avatar.startsWith('http://') || avatar.startsWith('https://')) {
      avatarSrc = avatar;
    } else if (avatar.trim().startsWith('<svg')) {
      // Raw SVG string - convert to data URL
      // Use encodeURIComponent for better compatibility than base64
      avatarSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(avatar)}`;
    } else {
      // Assume it's a base64 string without data URL prefix
      // Try to detect if it's SVG base64 by checking if it decodes to SVG
      try {
        const decoded = atob(avatar);
        if (decoded.trim().startsWith('<svg')) {
          avatarSrc = `data:image/svg+xml;base64,${avatar}`;
        } else {
          avatarSrc = `data:image/png;base64,${avatar}`;
        }
      } catch (e) {
        // If it's not valid base64, treat as raw SVG
        if (avatar.trim().startsWith('<')) {
          avatarSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(avatar)}`;
        } else {
          avatarSrc = `data:image/png;base64,${avatar}`;
        }
      }
    }
  } else if (avatar instanceof Blob) {
    avatarSrc = URL.createObjectURL(avatar);
  }

  if (!avatarSrc) {
    return getDefaultAvatar();
  }

  return (
    <Image
      src={avatarSrc}
      alt={name || 'Avatar'}
      roundedCircle
      className={className}
      style={{
        ...sizeStyle,
        ...style,
        objectFit: 'cover',
      }}
      onError={(e) => {
        // If image fails to load, replace with default avatar
        e.target.style.display = 'none';
        const parent = e.target.parentElement;
        if (parent && !parent.querySelector('.avatar-fallback')) {
          const fallback = document.createElement('div');
          fallback.className = `avatar-fallback ${className}`;
          fallback.innerHTML = name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2) || '?';
          Object.assign(fallback.style, sizeStyle, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#6c757d',
            color: 'white',
            borderRadius: '50%',
            fontWeight: 'bold',
          });
          parent.appendChild(fallback);
        }
      }}
    />
  );
}

export default Avatar;
