import React, { useState, useRef } from 'react';
import { Form, Button, InputGroup, Modal, Row, Col } from 'react-bootstrap';
import Avatar from './Avatar';

/**
 * Avatar input component that supports file upload, URL input, and free icon selection
 * 
 * @param {string|Blob} value - Current avatar value (base64 string, blob URL, or image URL)
 * @param {Function} onChange - Callback when avatar changes (receives base64 string or URL)
 * @param {string} name - Name for default avatar display and icon seed
 * @param {string} label - Label for the input field
 */
function AvatarInput({ value, onChange, name = '', label = 'Avatar' }) {
  const [avatarPreview, setAvatarPreview] = useState(value);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [inputMode, setInputMode] = useState('upload'); // 'upload', 'url', or 'icon'
  const [showIconModal, setShowIconModal] = useState(false);
  const [showVariationModal, setShowVariationModal] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const fileInputRef = useRef(null);

  // Popular DiceBear avatar styles (free, no API key required)
  const iconStyles = [
    { id: 'avataaars', name: 'Avataaars', description: 'Cartoon style avatars' },
    { id: 'bottts', name: 'Bots', description: 'Robot avatars' },
    { id: 'identicon', name: 'Identicon', description: 'Geometric patterns' },
    { id: 'initials', name: 'Initials', description: 'Simple initials' },
    { id: 'lorelei', name: 'Lorelei', description: 'Cute character avatars' },
    { id: 'micah', name: 'Micah', description: 'Diverse avatars' },
    { id: 'notionists', name: 'Notionists', description: 'Notion-style avatars' },
    { id: 'open-peeps', name: 'Open Peeps', description: 'Hand-drawn style' },
    { id: 'personas', name: 'Personas', description: 'Professional avatars' },
    { id: 'pixel-art', name: 'Pixel Art', description: 'Retro pixel style' },
    { id: 'shapes', name: 'Shapes', description: 'Abstract shapes' },
    { id: 'thumbs', name: 'Thumbs', description: 'Thumb avatars' },
  ];

  // Handle file selection
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG, or GIF)');
      return;
    }

    // Validate file size (max 128KB)
    const maxSize = 128 * 1024; // 128KB
    if (file.size > maxSize) {
      alert(`Image size must be less than 128KB. Current size: ${(file.size / 1024).toFixed(2)}KB`);
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      
      // Validate base64 size (base64 is ~33% larger than original, but we already checked file size)
      // Double-check: extract just the base64 part and estimate size
      const base64Match = base64String.match(/data:image\/[^;]+;base64,(.+)/);
      if (base64Match && base64Match[1]) {
        const base64Data = base64Match[1];
        // Base64 size estimation: (length * 3) / 4 gives approximate original size
        const estimatedOriginalSize = (base64Data.length * 3) / 4;
        const maxSize = 128 * 1024; // 128KB
        if (estimatedOriginalSize > maxSize) {
          alert(`Image size exceeds 128KB limit after processing. Estimated size: ${(estimatedOriginalSize / 1024).toFixed(2)}KB`);
          return;
        }
      }
      
      setAvatarPreview(base64String);
      onChange(base64String);
    };
    reader.onerror = () => {
      alert('Error reading file');
    };
    reader.readAsDataURL(file);
  };

  // Handle URL input
  const handleUrlChange = (e) => {
    const url = e.target.value.trim();
    setAvatarUrl(url);
    
    if (url) {
      // Validate URL format
      try {
        new URL(url);
        setAvatarPreview(url);
        onChange(url);
      } catch (err) {
        // Invalid URL, but allow user to continue typing
        if (url.startsWith('http://') || url.startsWith('https://')) {
          setAvatarPreview(url);
          onChange(url);
        }
      }
    } else {
      setAvatarPreview(null);
      onChange(null);
    }
  };

  // Handle URL submit
  const handleUrlSubmit = (e) => {
    e.preventDefault();
    const url = avatarUrl.trim();
    if (url) {
      try {
        new URL(url);
        setAvatarPreview(url);
        onChange(url);
      } catch (err) {
        alert('Please enter a valid URL');
      }
    }
  };

  // Handle style selection - show variation modal
  const handleStyleSelect = (styleId) => {
    setSelectedStyle(styleId);
    setShowIconModal(false);
    setShowVariationModal(true);
  };

  // Generate variations for a style (using different seeds)
  const generateVariations = (styleId, count = 12) => {
    const baseSeed = name.trim() || 'avatar';
    const variations = [];
    for (let i = 0; i < count; i++) {
      // Use different seeds: base name + variation number for consistent but varied results
      // First variation uses just the name, others append numbers
      const seed = i === 0 
        ? baseSeed  // First variation uses the name
        : `${baseSeed}-${i}`; // Others use name + number for variety
      variations.push({
        seed,
        id: i,
        previewUrl: `https://api.dicebear.com/9.x/${styleId}/svg?seed=${encodeURIComponent(seed)}&size=80`
      });
    }
    return variations;
  };

  // Handle icon variation selection
  const handleVariationSelect = async (variation) => {
    try {
      const diceBearUrl = `https://api.dicebear.com/9.x/${selectedStyle}/svg?seed=${encodeURIComponent(variation.seed)}&size=128`;
      
      // Fetch the SVG and convert to base64
      const response = await fetch(diceBearUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch icon');
      }
      
      const svgText = await response.text();
      // Convert SVG to base64 data URL
      const base64Svg = btoa(unescape(encodeURIComponent(svgText)));
      const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;
      
      setAvatarPreview(dataUrl);
      onChange(dataUrl);
      setSelectedVariation(variation);
      setShowVariationModal(false);
    } catch (error) {
      alert('Failed to load icon. Please try again.');
      console.error('Error loading icon:', error);
    }
  };

  // Clear avatar
  const handleClear = () => {
    setAvatarPreview(null);
    setAvatarUrl('');
    setSelectedStyle(null);
    setSelectedVariation(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <div className="d-flex align-items-start gap-3 mb-2">
        <Avatar avatar={avatarPreview} name={name} size="md" />
        <div className="flex-grow-1">
          <div className="btn-group mb-2" role="group">
            <Button
              variant={inputMode === 'upload' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setInputMode('upload')}
            >
              Upload Image
            </Button>
            <Button
              variant={inputMode === 'url' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setInputMode('url')}
            >
              Enter URL
            </Button>
            <Button
              variant={inputMode === 'icon' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => {
                setInputMode('icon');
                setShowIconModal(true);
              }}
            >
              Choose Icon
            </Button>
          </div>

          {inputMode === 'upload' ? (
            <div>
              <Form.Control
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={handleFileChange}
                className="mb-2"
              />
              <Form.Text className="text-muted">
                Supported formats: JPG, PNG, GIF (max 128KB)
              </Form.Text>
            </div>
          ) : inputMode === 'url' ? (
            <div>
              <InputGroup>
                <Form.Control
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={avatarUrl}
                  onChange={handleUrlChange}
                  onBlur={handleUrlSubmit}
                />
                <Button variant="outline-secondary" onClick={handleUrlSubmit}>
                  Load
                </Button>
              </InputGroup>
              <Form.Text className="text-muted">
                Enter a URL to an image (JPG, PNG, or GIF)
              </Form.Text>
            </div>
          ) : (
            <div>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowIconModal(true)}
              >
                {selectedStyle && selectedVariation 
                  ? `Change Icon (${iconStyles.find(s => s.id === selectedStyle)?.name})` 
                  : 'Select Free Icon'}
              </Button>
              <Form.Text className="text-muted d-block mt-1">
                Choose from free avatar icons powered by DiceBear
              </Form.Text>
            </div>
          )}

          {avatarPreview && (
            <Button
              variant="link"
              size="sm"
              className="p-0 mt-2 text-danger"
              onClick={handleClear}
            >
              Remove avatar
            </Button>
          )}
        </div>
      </div>

      {/* Style Selection Modal - Step 1: Choose Category */}
      <Modal show={showIconModal} onHide={() => setShowIconModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Choose Avatar Style</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3 text-muted">
            Select an avatar style category. You'll then be able to choose from multiple variations.
          </p>
          <Row className="g-3">
            {iconStyles.map((style) => {
              const previewUrl = `https://api.dicebear.com/9.x/${style.id}/svg?seed=${encodeURIComponent(name || 'avatar')}&size=64`;
              return (
                <Col key={style.id} xs={6} sm={4} md={3}>
                  <div
                    className="border rounded p-2 text-center border-secondary"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleStyleSelect(style.id)}
                    onMouseEnter={(e) => e.currentTarget.classList.add('border-primary', 'bg-light')}
                    onMouseLeave={(e) => e.currentTarget.classList.remove('border-primary', 'bg-light')}
                  >
                    <img
                      src={previewUrl}
                      alt={style.name}
                      className="mb-2"
                      style={{ width: '64px', height: '64px' }}
                    />
                    <div className="small fw-bold">{style.name}</div>
                    <div className="small text-muted">{style.description}</div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowIconModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Variation Selection Modal - Step 2: Choose Specific Icon */}
      <Modal show={showVariationModal} onHide={() => setShowVariationModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Choose Icon - {iconStyles.find(s => s.id === selectedStyle)?.name || 'Style'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3 text-muted">
            Select a specific icon variation. Click on any icon to use it as your avatar.
          </p>
          <Row className="g-3">
            {selectedStyle && generateVariations(selectedStyle).map((variation) => (
              <Col key={variation.id} xs={4} sm={3} md={2}>
                <div
                  className={`border rounded p-2 text-center ${selectedVariation?.id === variation.id ? 'border-primary bg-light' : 'border-secondary'}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleVariationSelect(variation)}
                  onMouseEnter={(e) => {
                    if (selectedVariation?.id !== variation.id) {
                      e.currentTarget.classList.add('border-primary', 'bg-light');
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedVariation?.id !== variation.id) {
                      e.currentTarget.classList.remove('border-primary', 'bg-light');
                    }
                  }}
                >
                  <img
                    src={variation.previewUrl}
                    alt={`Variation ${variation.id + 1}`}
                    className="mb-1"
                    style={{ width: '80px', height: '80px' }}
                  />
                  <div className="small text-muted">Variation {variation.id + 1}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowVariationModal(false);
            setShowIconModal(true);
          }}>
            Back to Styles
          </Button>
          <Button variant="secondary" onClick={() => setShowVariationModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </Form.Group>
  );
}

export default AvatarInput;
